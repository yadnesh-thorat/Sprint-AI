// Supabase Edge Function: generate-board
// Runs on Deno — API keys are set via: supabase secrets set GEMINI_API_KEY=...
// Keys are NEVER exposed to the browser.

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { srsText, pdfBase64, projectName } = await req.json();

    // Build the prompt — supports both plain text and PDF (base64)
    let userContent;
    if (pdfBase64) {
      userContent = [
        {
          inline_data: {
            mime_type: "application/pdf",
            data: pdfBase64,
          },
        },
        {
          text: buildPrompt(projectName),
        },
      ];
    } else {
      userContent = [
        {
          text: `${buildPrompt(projectName)}\n\nSRS Content:\n${srsText}`,
        },
      ];
    }

    const geminiReq = {
      contents: [{ role: "user", parts: userContent }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3,
        maxOutputTokens: 8192,
      },
    };

    const geminiRes = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiReq),
    });

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text();
      throw new Error(`Gemini API error: ${geminiRes.status} — ${errBody}`);
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) throw new Error("No content returned from Gemini");

    // Parse and validate
    const board = JSON.parse(rawText);

    return new Response(JSON.stringify({ board }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("Edge Function error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

function buildPrompt(projectName) {
  return `You are an expert Agile Project Manager and Software Architect.

Analyze the following Software Requirements Specification (SRS) document and generate a complete, detailed Agile project board in JSON format.

Project Name: "${projectName}"

Return ONLY valid JSON (no markdown, no explanation) matching this exact structure:
{
  "epics": [
    {
      "title": "Epic title",
      "stories": [
        {
          "title": "User story title (As a user, I want...)",
          "description": "Detailed acceptance criteria and context",
          "tasks": [
            {
              "title": "Specific technical task",
              "description": "Implementation details",
              "requiredRole": "FE|BE|DB",
              "storyPoints": 3,
              "estimatedHours": 4
            }
          ]
        }
      ]
    }
  ]
}

Rules:
- Generate 3-6 epics covering all major feature areas
- Each epic should have 2-4 user stories
- Each story should have 2-5 tasks
- requiredRole must be exactly one of: FE, BE, DB
- storyPoints: use Fibonacci scale (1, 2, 3, 5, 8, 13)
- estimatedHours: realistic engineering estimate (1-16)
- Be comprehensive — cover frontend, backend, and database concerns
- Tasks must be granular and actionable`;
}
