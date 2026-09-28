// SprintX AI Engine - Google Gemini & Multi-Model Multi-Key Ingestion Client
import { supabase } from './supabase';

export const DEFAULT_AI_CONFIG = {
  provider: 'gemini',
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
  geminiModel: 'gemini-1.5-pro',
  temperature: 0.2,
  autoDecomposeSubtasks: true,
  lastTested: null,
  status: 'UNCONFIGURED',
  keyPool: []
};

const STORAGE_KEY = 'sprintx_ai_platform_config';

export function getAiConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_AI_CONFIG, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to load AI config from localStorage:', e);
  }
  return { ...DEFAULT_AI_CONFIG };
}

export function saveAiConfig(newConfig) {
  try {
    const current = getAiConfig();
    const updated = { ...current, ...newConfig, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save AI config:', e);
    return newConfig;
  }
}

/**
 * Live test of AI Provider Connection and Model Latency (Gemini, Groq, OpenAI, Anthropic)
 */
export async function testAiConnection(apiKey, provider = 'gemini', model = 'gemini-1.5-pro') {
  if (!apiKey) {
    return { success: false, error: 'No API Key provided.' };
  }

  const startTime = Date.now();
  try {
    if (provider === 'groq') {
      const candidateModels = [
        model,
        'openai/gpt-oss-120b',
        'qwen/qwen3.8-27b',
        'openai/gpt-oss-20b',
        'llama-3.3-70b-versatile',
        'llama-3.1-8b-instant'
      ].filter(Boolean);

      let lastGroqErr = null;
      for (const m of Array.from(new Set(candidateModels))) {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: m,
            messages: [{ role: 'user', content: 'Respond with exactly the word ONLINE to confirm connection.' }],
            max_tokens: 10
          })
        });

        const latency = Date.now() - startTime;
        if (response.ok) {
          const data = await response.json();
          const reply = data?.choices?.[0]?.message?.content?.trim() || 'ONLINE';
          return {
            success: true,
            latency: `${latency}ms`,
            model: m,
            reply,
            timestamp: new Date().toISOString()
          };
        } else {
          const errData = await response.json().catch(() => ({}));
          lastGroqErr = errData?.error?.message || `Groq API Error (${response.status})`;
        }
      }

      return {
        success: false,
        latency: `${Date.now() - startTime}ms`,
        error: lastGroqErr || 'Groq API connection failed'
      };
    }

    if (provider === 'openai') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model || 'gpt-4o',
          messages: [{ role: 'user', content: 'Respond with exactly the word ONLINE.' }],
          max_tokens: 10
        })
      });

      const latency = Date.now() - startTime;
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        return {
          success: false,
          latency: `${latency}ms`,
          error: errData?.error?.message || `OpenAI API Error (${response.status})`
        };
      }

      return {
        success: true,
        latency: `${latency}ms`,
        model,
        reply: 'ONLINE',
        timestamp: new Date().toISOString()
      };
    }

    // Default: Google Gemini
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: 'Respond with exactly the word "ONLINE" to confirm SprintX AI connection.' }]
            }
          ]
        })
      }
    );

    const latency = Date.now() - startTime;

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return {
        success: false,
        latency: `${latency}ms`,
        error: errData?.error?.message || `HTTP ${response.status}: ${response.statusText}`
      };
    }

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'OK';

    return {
      success: true,
      latency: `${latency}ms`,
      model,
      reply,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    return {
      success: false,
      latency: `${Date.now() - startTime}ms`,
      error: err.message || `Network error connecting to ${provider} API`
    };
  }
}

export const testGeminiConnection = testAiConnection;

/**
 * Fetch all platform API keys from PostgreSQL database
 */
/**
 * Fetch active unmasked AI runner keys from PostgreSQL database
 */
export async function fetchPlatformApiKeysFromDb() {
  try {
    const { data, error } = await supabase.rpc('get_active_ai_runner_keys');
    if (!error && Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (e) {
    console.warn('Failed to fetch runner keys from DB:', e);
  }
  return [];
}

/**
 * Decomposes an SRS text or uploaded PDF into structured Epics, Stories, and Tasks
 * Supports Multi-Provider (Groq, Gemini, OpenAI, Claude) and Automatic Failover!
 * Constrained strictly to active squad roles present in the workspace.
 */
export async function decomposeSrsWithGemini({ srsText, pdfBase64, projectName, teamMembers = [] }) {
  const config = getAiConfig();
  
  // 1. Fetch unmasked active keys from Supabase pool
  const dbKeys = await fetchPlatformApiKeysFromDb();
  const activeKeys = [];
  
  if (Array.isArray(dbKeys) && dbKeys.length > 0) {
    dbKeys.forEach(k => {
      if (k.api_key && !k.api_key.includes('••••')) {
        let prov = k.provider || 'gemini';
        if (k.api_key.startsWith('gsk_')) prov = 'groq';
        else if (k.api_key.startsWith('sk-') && !k.api_key.startsWith('sk-ant')) prov = 'openai';
        else if (k.api_key.startsWith('AIzaSy')) prov = 'gemini';
        
        activeKeys.push({ 
          key: k.api_key, 
          provider: prov, 
          model: k.model || (prov === 'groq' ? 'llama-3.3-70b-versatile' : 'gemini-1.5-pro')
        });
      }
    });
  }

  // Fallback to local config key only if valid and not masked
  if (config.geminiApiKey && !config.geminiApiKey.includes('••••') && !activeKeys.some(k => k.key === config.geminiApiKey)) {
    let prov = 'gemini';
    if (config.geminiApiKey.startsWith('gsk_')) prov = 'groq';
    activeKeys.push({ 
      key: config.geminiApiKey, 
      provider: prov, 
      model: config.geminiModel || (prov === 'groq' ? 'llama-3.3-70b-versatile' : 'gemini-1.5-pro') 
    });
  }

  if (activeKeys.length === 0) {
    throw new Error('No active AI keys (Groq / Gemini) found in pool. Please add a valid API key in Super Admin HQ.');
  }

  // 2. Derive allowed roles strictly from the actual members in the company workspace
  let squadRoles = [];
  if (Array.isArray(teamMembers) && teamMembers.length > 0) {
    squadRoles = Array.from(new Set(teamMembers.map(m => {
      const r = String(m.role || '').toUpperCase();
      if (r.includes('FE') || r.includes('FRONT')) return 'FE';
      if (r.includes('BE') || r.includes('BACK')) return 'BE';
      if (r.includes('PM') || r.includes('LEAD')) return 'FE';
      return r;
    }).filter(Boolean)));
  }

  // Default to FE & BE if no squad members exist yet
  const allowedRoles = squadRoles.length > 0 ? squadRoles : ['FE', 'BE'];

  const squadRosterText = teamMembers && teamMembers.length > 0
    ? `\nACTIVE SQUAD ROSTER IN WORKSPACE (${teamMembers.length} team members):\n${teamMembers.map(m => `- ${m.name} [Role: ${m.role}]`).join('\n')}\n`
    : `\nACTIVE SQUAD ROSTER: Frontend Developer (FE) and Backend Developer (BE).\n`;

  const systemInstruction = `You are a Principal Software Architect and Agile Scrum Master for SprintX AI.
Analyze the following Software Requirement Specification (SRS) or system description for the project "${projectName}".
Break down the requirements into high-level Epics, User Stories, and granular engineering Tasks for an agile sprint.

CRITICAL SQUAD ROLES CONSTRAINT:
The user's company squad ONLY has developers for the following active role(s):
${allowedRoles.map(r => `- "${r}"`).join('\n')}
${squadRosterText}
STRICT RULES:
1. Every task's "requiredRole" MUST be strictly one of: ${allowedRoles.map(r => `"${r}"`).join(', ')}.
2. DO NOT create or invent tasks for roles like "UX", "DB", "QA", "DevOps", or any role not present in the squad list above.
3. All UI/UX, components, styles, landing pages, and frontend client tasks MUST be assigned to "FE" (or the available frontend engineer).
4. All backend, database schema, models, APIs, endpoints, and server tasks MUST be assigned to "BE" (or the available backend engineer).

You MUST return a JSON object with this exact schema:
{
  "epics": [
    {
      "title": "Epic Title",
      "stories": [
        {
          "title": "User Story Title",
          "description": "As a [role], I want [feature] so that [benefit]",
          "tasks": [
            {
              "title": "Granular actionable task title",
              "description": "Technical implementation details",
              "requiredRole": "${allowedRoles[0] || 'FE'}",
              "storyPoints": 3,
              "estimatedHours": 6
            }
          ]
        }
      ]
    }
  ]
}`;

  const promptText = `${systemInstruction}

SRS / System Description:
"""
${srsText || 'Please analyze the software requirements thoroughly.'}
"""`;

  // Sanitizer ensuring only squad roles exist in final output
  const sanitizeBoardRoles = (board) => {
    if (!board || !Array.isArray(board.epics)) return board;
    const allowed = new Set(allowedRoles);
    board.epics.forEach(epic => {
      epic.stories?.forEach(story => {
        story.tasks?.forEach(task => {
          let role = String(task.requiredRole || '').toUpperCase();
          if (role.includes('FRONT') || role === 'UX' || role === 'DESIGN') role = 'FE';
          if (role.includes('BACK') || role === 'DB' || role === 'DATA' || role === 'DEVOPS' || role === 'INFRA' || role === 'API') role = 'BE';
          if (role === 'PM' || role === 'LEAD') role = 'FE';
          
          if (!allowed.has(role)) {
            if (role === 'UX' || role === 'QA') {
              role = allowed.has('FE') ? 'FE' : allowed.values().next().value || 'FE';
            } else {
              role = allowed.has('BE') ? 'BE' : allowed.values().next().value || 'FE';
            }
          }
          task.requiredRole = role;
        });
      });
    });
    return board;
  };

  let lastError = null;

  // 3. Attempt each key in the multi-key failover pool
  for (const item of activeKeys) {
    try {
      // --- A. GROQ CLOUD INFERENCE ---
      if (item.provider === 'groq' || item.key.startsWith('gsk_')) {
        const groqCandidateModels = Array.from(new Set([
          item.model,
          'openai/gpt-oss-120b',
          'qwen/qwen3.8-27b',
          'openai/gpt-oss-20b',
          'llama-3.3-70b-versatile',
          'llama-3.1-8b-instant'
        ].filter(Boolean)));

        for (const groqModel of groqCandidateModels) {
          try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${item.key}`
              },
              body: JSON.stringify({
                model: groqModel,
                messages: [
                  { role: 'system', content: systemInstruction },
                  { role: 'user', content: promptText }
                ],
                response_format: { type: 'json_object' },
                temperature: config.temperature || 0.2
              })
            });

            if (!response.ok) {
              const errData = await response.json().catch(() => ({}));
              console.warn(`Groq model ${groqModel} attempt failed:`, errData?.error?.message);
              continue;
            }

            const data = await response.json();
            const content = data?.choices?.[0]?.message?.content;
            if (!content) continue;

            const parsed = JSON.parse(content.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim());
            if (parsed.epics && Array.isArray(parsed.epics) && parsed.epics.length > 0) {
              return sanitizeBoardRoles(parsed);
            }
          } catch (mErr) {
            console.warn(`Groq model ${groqModel} parsing error:`, mErr.message);
          }
        }
        throw new Error('Groq candidate models exhausted or failed to return valid epics schema');
      }

      // --- B. OPENAI INFERENCE ---
      if (item.provider === 'openai' || item.key.startsWith('sk-proj-') || item.key.startsWith('sk-')) {
        const openAiModel = item.model || 'gpt-4o';
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${item.key}`
          },
          body: JSON.stringify({
            model: openAiModel,
            messages: [
              { role: 'system', content: systemInstruction },
              { role: 'user', content: promptText }
            ],
            response_format: { type: 'json_object' },
            temperature: config.temperature || 0.2
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData?.error?.message || `OpenAI API Error (${response.status})`);
        }

        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content;
        if (!content) throw new Error('Empty response from OpenAI');

        const parsed = JSON.parse(content.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim());
        if (parsed.epics && Array.isArray(parsed.epics) && parsed.epics.length > 0) {
          return sanitizeBoardRoles(parsed);
        }
        throw new Error('OpenAI response missing epics array');
      }

      // --- C. GOOGLE GEMINI INFERENCE ---
      const requestParts = [];
      if (pdfBase64) {
        requestParts.push({
          inlineData: {
            mimeType: 'application/pdf',
            data: pdfBase64
          }
        });
      }
      requestParts.push({ text: promptText });

      const geminiModel = item.model || 'gemini-1.5-pro';
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${item.key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: requestParts }],
            generationConfig: {
              temperature: config.temperature || 0.2,
              responseMimeType: 'application/json'
            }
          })
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `Gemini API Error (${response.status})`);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('Empty response from Gemini.');

      const parsed = JSON.parse(rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim());
      if (parsed.epics && Array.isArray(parsed.epics) && parsed.epics.length > 0) {
        return sanitizeBoardRoles(parsed);
      }
      throw new Error('Gemini response missing epics array');

    } catch (err) {
      console.warn(`[SprintX AI Multi-Key Gateway] Failover triggered for key (${item.provider} / ${item.model}):`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('All configured AI keys in the pool failed.');
}

export const decomposeSrsWithAi = decomposeSrsWithGemini;
