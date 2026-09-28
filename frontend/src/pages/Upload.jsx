import React, { useState, useRef } from 'react';
import { UploadCloud, Loader2, Calendar, FileText, X, Sparkles, ChevronRight, CheckCircle2, Zap, FileCode, ArrowDown } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { getAiConfig, decomposeSrsWithGemini } from '../lib/ai';
import { convertPdfToMarkdown, estimateTokenCount } from '../lib/pdfParser';

export default function Upload() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ 
    name: 'E-Commerce & Payment Microservices (SPX)', 
    deadline: '', 
    content: '' 
  });
  const [file, setFile] = useState(null);
  const [parsingFile, setParsingFile] = useState(false);
  const [tokenOptimization, setTokenOptimization] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const processFile = async (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setParsingFile(true);

    try {
      if (selectedFile.type === 'application/pdf' || selectedFile.name.endsWith('.pdf')) {
        const result = await convertPdfToMarkdown(selectedFile);
        setTokenOptimization(result);
        if (result.markdown && !formData.content) {
          setFormData(prev => ({ ...prev, content: result.markdown }));
        }
      } else if (selectedFile.type.includes('text') || selectedFile.name.endsWith('.txt') || selectedFile.name.endsWith('.md')) {
        const text = await selectedFile.text();
        const estTokens = estimateTokenCount(text);
        setTokenOptimization({
          numPages: 1,
          optimizedTokens: estTokens,
          originalEstimatedTokens: estTokens,
          tokensSavedPercent: 0,
          isScannedFallback: false,
          markdown: text
        });
        if (!formData.content) {
          setFormData(prev => ({ ...prev, content: text }));
        }
      }
    } catch (e) {
      console.warn('File processing error:', e);
    } finally {
      setParsingFile(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setTokenOptimization(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const loadPreset = (type) => {
    if (type === 'fintech') {
      setFormData({
        name: 'Fintech Core Banking & Web3 Checkout',
        deadline: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        content: `SRS Section 3.2: Payment Routing & Webhook Ingestion
The system must process payments via Stripe and Web3 smart contract signatures. The API validates idempotency keys in Redis, writes an audit record to PostgreSQL with row-level locking, triggers asynchronous webhooks to ERP, and transmits customer receipts. Frontend requires a responsive dual-engine modal with live gas fee estimates.`
      });
    } else if (type === 'ai') {
      setFormData({
        name: 'LLM Agent Workflow Orchestration',
        deadline: new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0],
        content: `SRS Section 4.1: Autonomous Agent Execution Pipeline
The platform must ingest unstructured customer prompt inputs, decompose them into vector search embeddings via pgvector, query Redis queue for rate limits, and stream markdown output over Server-Sent Events (SSE). UI must provide live token counters and branch cancellation.`
      });
    }
  };

  const parseFallbackBoard = (projectName, content) => {
    return {
      epics: [
        {
          title: 'Core Architecture & API Ingestion',
          stories: [
            {
              title: `${projectName} Service Layer`,
              description: content || 'High-throughput system specifications and business logic implementation.',
              tasks: [
                {
                  title: 'Implement Idempotent API Routing & Error Handlers',
                  description: 'Validate incoming payload against JSON schema, issue idempotency tokens, and handle timeouts.',
                  requiredRole: 'BE',
                  storyPoints: 5,
                  estimatedHours: 10
                },
                {
                  title: 'Build Reactive Client UI Modal & Status Indicators',
                  description: 'Construct responsive interface components, handle optimistic UI updates, and render error states.',
                  requiredRole: 'FE',
                  storyPoints: 8,
                  estimatedHours: 16
                },
                {
                  title: 'Design PostgreSQL Tables, Indices & RLS Security Policies',
                  description: 'Create normalized database schema, add compound btree indices, and enable row level security.',
                  requiredRole: 'DB',
                  storyPoints: 5,
                  estimatedHours: 10
                }
              ]
            }
          ]
        }
      ]
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;
    if (!formData.content && !file) return;

    setLoading(true);
    setLoadingStep(file ? `Processing ${file.name}...` : 'Ingesting SRS document text...');

    try {
      // Prioritize optimized Markdown from client parser for minimal token usage
      let srsText = formData.content;
      let pdfBase64 = null;

      if (tokenOptimization) {
        if (tokenOptimization.markdown) {
          srsText = tokenOptimization.markdown;
        } else if (tokenOptimization.isScannedFallback && tokenOptimization.pdfBase64) {
          pdfBase64 = tokenOptimization.pdfBase64;
        }
      } else if (file) {
        setLoadingStep(`Optimizing ${file.name} to Markdown...`);
        const parsed = await convertPdfToMarkdown(file);
        if (parsed.markdown) {
          srsText = parsed.markdown;
        } else if (parsed.isScannedFallback && parsed.pdfBase64) {
          pdfBase64 = parsed.pdfBase64;
        }
      }

      // Fetch team members first so AI is strictly aware of active squad composition
      let squadMembers = [];
      if (user?.id) {
        const { data: tm } = await supabase
          .from('team_members')
          .select('*')
          .eq('user_id', user.id);
        squadMembers = tm || [];
      }

      let board = null;

      // 1. Attempt Google Gemini / Groq AI Decomposition with Squad Context
      try {
        setLoadingStep('Decomposing structured requirements with Multi-Key AI Engine (Groq / Gemini)...');
        const geminiBoard = await decomposeSrsWithGemini({
          srsText: srsText || formData.content,
          pdfBase64,
          projectName: formData.name,
          teamMembers: squadMembers
        });
        if (geminiBoard && geminiBoard.epics && geminiBoard.epics.length > 0) {
          board = geminiBoard;
        }
      } catch (geminiErr) {
        console.warn('Gemini API decomposition note:', geminiErr.message);
      }

      // 2. Attempt Supabase Edge Function if board not yet generated
      if (!board) {
        try {
          setLoadingStep('Invoking AI NLP decomposition gateway...');
          const { data: aiResult, error: fnError } = await supabase.functions.invoke('generate-board', {
            body: {
              srsText: srsText || formData.content,
              pdfBase64,
              projectName: formData.name,
            },
          });
          if (!fnError && aiResult?.board) {
            board = aiResult.board;
          }
        } catch (e) {
          console.warn('Edge function note:', e.message);
        }
      }

      // 3. Fallback parser if external engines unconfigured
      if (!board) {
        board = parseFallbackBoard(formData.name, srsText || formData.content);
      }

      setLoadingStep('Saving Epics, Stories & Tasks to Supabase...');

      // 1. Create Project in DB
      let projectId = null;
      try {
        const { data: project, error: projErr } = await supabase
          .from('projects')
          .insert({ name: formData.name, deadline: formData.deadline || null, user_id: user?.id })
          .select()
          .single();

        if (projErr) throw projErr;
        projectId = project?.id;

        const allMembers = squadMembers || [];
        
        // Allowed roles strictly based on members present in workspace
        const availableRoles = new Set(
          allMembers.map(m => {
            const r = String(m.role || '').toUpperCase();
            if (r.includes('FE') || r.includes('FRONT') || r.includes('PM') || r.includes('LEAD')) return 'FE';
            if (r.includes('BE') || r.includes('BACK')) return 'BE';
            return r;
          }).filter(Boolean)
        );

        if (availableRoles.size === 0) {
          availableRoles.add('FE');
          availableRoles.add('BE');
        }

        const normalizeRole = (r) => {
          if (!r) return availableRoles.has('FE') ? 'FE' : 'BE';
          const str = String(r).toUpperCase();
          if (str.includes('FE') || str.includes('FRONT') || str.includes('UX') || str.includes('DESIGN') || str.includes('PM') || str.includes('LEAD')) {
            return availableRoles.has('FE') ? 'FE' : (availableRoles.values().next().value || 'FE');
          }
          if (str.includes('BE') || str.includes('BACK') || str.includes('DB') || str.includes('DATA') || str.includes('DEVOPS') || str.includes('INFRA') || str.includes('API') || str.includes('QA')) {
            return availableRoles.has('BE') ? 'BE' : (availableRoles.values().next().value || 'BE');
          }
          return availableRoles.has(str) ? str : (availableRoles.has('FE') ? 'FE' : 'BE');
        };

        const membersByNormalizedRole = {};
        allMembers.forEach(m => {
          const norm = normalizeRole(m.role);
          if (!membersByNormalizedRole[norm]) membersByNormalizedRole[norm] = [];
          membersByNormalizedRole[norm].push(m);
        });

        const assignmentCounters = {};
        let fallbackCounter = 0;

        const getAssignee = (role) => {
          if (allMembers.length === 0) return null;
          const norm = normalizeRole(role);
          
          let candidates = membersByNormalizedRole[norm] || [];
          
          if (candidates.length === 0) {
            candidates = allMembers;
          }

          const idx = (assignmentCounters[norm] || fallbackCounter) % candidates.length;
          assignmentCounters[norm] = (assignmentCounters[norm] || 0) + 1;
          fallbackCounter++;
          return { assigneeId: candidates[idx]?.id || null, role: norm };
        };

        // 2. Insert Epics → Stories → Tasks
        for (const epicData of (board.epics || [])) {
          const { data: epic, error: epicErr } = await supabase
            .from('epics')
            .insert({ project_id: projectId, title: epicData.title })
            .select()
            .single();
          if (epicErr) continue;

          for (const storyData of (epicData.stories || [])) {
            const { data: story, error: storyErr } = await supabase
              .from('stories')
              .insert({ epic_id: epic.id, title: storyData.title, description: storyData.description })
              .select()
              .single();
            if (storyErr) continue;

            for (const taskData of (storyData.tasks || [])) {
              const { assigneeId, role: finalRole } = getAssignee(taskData.requiredRole);
              await supabase.from('tasks').insert({
                story_id: story.id,
                title: taskData.title,
                description: taskData.description,
                status: 'TODO',
                required_role: finalRole,
                story_points: taskData.storyPoints || 3,
                estimated_hours: taskData.estimatedHours || 6,
                assigned_to: assigneeId,
              });
            }
          }
        }
      } catch (dbErr) {
        console.warn('Database save note:', dbErr);
      }

      setLoadingStep('Completed! Redirecting to Active Sprints...');
      setTimeout(() => {
        navigate('/board');
      }, 500);

    } catch (err) {
      console.error('Failed to process SRS:', err);
      navigate('/board');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white text-[#172B4D] overflow-y-auto">
      
      {/* Sub-Header */}
      <div className="px-6 pt-5 pb-4 border-b border-[#EBECF0] bg-white flex-shrink-0">
        <div className="flex items-center gap-1.5 text-xs text-[#5E6C84] mb-1.5 font-medium">
          <Link to="/board" className="hover:text-[#0052CC] hover:underline">Projects</Link>
          <ChevronRight size={12} />
          <Link to="/board" className="hover:text-[#0052CC] hover:underline">
            {user?.organization || 'SprintX Core Software'}
          </Link>
          <ChevronRight size={12} />
          <span className="text-[#172B4D] font-bold">AI Requirements Ingest</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#172B4D] tracking-tight">
              Ingest Software Requirements Specification (SRS)
            </h1>
            <p className="text-xs text-[#5E6C84] mt-0.5">
              Zero-token-waste engine: Converts documents to structured Markdown before AI decomposition.
            </p>
          </div>
        </div>
      </div>

      {/* Main Workspace Form */}
      <div className="p-4 sm:p-6 bg-[#F4F5F7] flex-1 w-full">
        <div className="w-full">
          
          {/* Quick Presets */}
          <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#5E6C84] uppercase tracking-wider">
              Quick Load SRS Presets
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => loadPreset('fintech')}
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-[#DFE1E6] rounded-md hover:bg-[#DEEBFF] hover:text-[#0052CC] hover:border-[#B3D4FF] transition-all shadow-2xs cursor-pointer"
              >
                Fintech & Web3
              </button>
              <button
                type="button"
                onClick={() => loadPreset('ai')}
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-[#DFE1E6] rounded-md hover:bg-[#DEEBFF] hover:text-[#0052CC] hover:border-[#B3D4FF] transition-all shadow-2xs cursor-pointer"
              >
                AI Agent Pipeline
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#DFE1E6] shadow-xs p-6 sm:p-8 w-full relative overflow-hidden">
            
            {/* Loading Overlay */}
            {loading && (
              <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
                <Loader2 className="w-10 h-10 text-[#0052CC] animate-spin mb-3" />
                <h3 className="text-base font-bold text-[#172B4D]">Autonomous AI Decomposition in Progress</h3>
                <p className="text-xs text-[#5E6C84] mt-1 font-mono">{loadingStep}</p>
                <div className="w-64 h-1.5 bg-gray-100 rounded-full overflow-hidden mt-4">
                  <div className="h-full bg-[#0052CC] animate-pulse rounded-full w-3/4" />
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-[#5E6C84] uppercase tracking-wider mb-1.5">
                    Sprint / Project Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Core Payment Orchestrator (SPX)"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full py-2.5 px-3.5 text-xs border border-[#DFE1E6] rounded-lg bg-[#FAFBFC] focus:bg-white focus:ring-2 focus:ring-[#0052CC] text-[#172B4D] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5E6C84] uppercase tracking-wider mb-1.5">
                    Target Sprint Deadline
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="w-full py-2.5 px-3.5 text-xs border border-[#DFE1E6] rounded-lg bg-[#FAFBFC] focus:bg-white focus:ring-2 focus:ring-[#0052CC] text-[#172B4D] transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5E6C84] uppercase tracking-wider mb-1.5">
                  Upload Specification PDF or Document
                </label>
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`p-6 border-2 border-dashed rounded-xl text-center transition-all cursor-pointer ${
                    dragActive
                      ? 'border-[#0052CC] bg-[#DEEBFF]/30'
                      : 'border-[#DFE1E6] bg-[#FAFBFC] hover:border-[#4C9AFF] hover:bg-white'
                  }`}
                  onClick={() => inputRef.current?.click()}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf,.txt,.md"
                    className="hidden"
                    onChange={handleChange}
                  />
                  {file ? (
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#0052CC]">
                        <FileText size={18} />
                        <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFile();
                          }}
                          className="text-gray-400 hover:text-red-500 ml-2 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {parsingFile && (
                        <div className="flex items-center gap-2 text-[11px] text-blue-600 font-medium mt-1">
                          <Loader2 size={12} className="animate-spin" />
                          <span>Converting PDF into dense Markdown structure...</span>
                        </div>
                      )}

                      {tokenOptimization && !parsingFile && (
                        <div className="mt-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-800 text-[11px]">
                          <Zap size={13} className="text-emerald-600 flex-shrink-0 fill-emerald-500" />
                          <span>
                            <strong>Token Optimizer:</strong> {tokenOptimization.numPages} PDF page(s) $\rightarrow$ Clean Markdown (~{tokenOptimization.tokensSavedPercent}% token savings, ~{tokenOptimization.optimizedTokens} tokens)
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <UploadCloud className="w-9 h-9 text-[#0052CC] mx-auto mb-2" />
                      <p className="text-xs font-bold text-[#172B4D]">
                        Click to browse or drag & drop requirement document (PDF, TXT, MD)
                      </p>
                      <p className="text-[11px] text-[#5E6C84] mt-1">
                        High-efficiency client parsing converts PDFs to Markdown with up to 90% token reduction
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#5E6C84] uppercase tracking-wider">
                    Requirement Specification / Structured Markdown
                  </label>
                  {tokenOptimization?.markdown && (
                    <span className="text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      ⚡ Token Optimized (~{tokenOptimization.optimizedTokens} tokens)
                    </span>
                  )}
                </div>
                <textarea
                  rows={7}
                  placeholder="Paste RFC architecture text, PRD sections, or API specifications here..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full py-3 px-3.5 text-xs border border-[#DFE1E6] rounded-lg bg-[#FAFBFC] focus:bg-white focus:ring-2 focus:ring-[#0052CC] text-[#172B4D] font-mono leading-relaxed transition-all"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <Link
                  to="/board"
                  className="px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading || (!formData.content && !file)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-xs text-white bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles size={14} />
                  <span>Generate Sprint Board</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

