import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Layers, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Database, 
  Kanban, 
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  Clock,
  Lock,
  GitBranch,
  FolderKanban
} from 'lucide-react';
import logo from '../assets/logo.png';

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [activeTab, setActiveTab] = useState('board'); // 'board' or 'parser'

  return (
    <div className="min-h-screen bg-[#FAFBFC] text-[#172B4D] font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      
      {/* 1. PROFESSIONAL PRODUCT NAVBAR */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#DFE1E6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 text-[#0052CC] font-bold text-lg tracking-tight">
              <img 
                src={logo} 
                className="h-7 w-7 object-contain" 
                alt="SprintX Logo" 
              />
              <span className="text-[#172B4D] font-bold text-base tracking-tight">SprintX</span>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#5E6C84]">
              <a href="#features" className="hover:text-[#0052CC] transition-colors">Features</a>
              <a href="#workflow" className="hover:text-[#0052CC] transition-colors">Workflow</a>
              <a href="#security" className="hover:text-[#0052CC] transition-colors">Security</a>
              <a href="#faq" className="hover:text-[#0052CC] transition-colors">FAQ</a>
            </nav>
          </div>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <Link 
              to="/login" 
              className="text-xs font-semibold text-[#42526E] hover:text-[#172B4D] px-3 py-1.5 rounded transition-colors"
            >
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="inline-flex items-center justify-center px-3.5 py-1.5 text-xs font-semibold rounded-md bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] text-white shadow-xs transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded text-xs font-semibold text-[#5E6C84] bg-slate-100 hover:bg-slate-200 border border-[#DFE1E6]"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? "Close" : "Menu"}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-[#DFE1E6] bg-white px-4 py-4 space-y-2 shadow-sm">
            <a 
              href="#features" 
              onClick={() => setMobileMenuOpen(false)} 
              className="block px-3 py-2 rounded text-xs font-medium text-[#172B4D] hover:bg-slate-50"
            >
              Features
            </a>
            <a 
              href="#workflow" 
              onClick={() => setMobileMenuOpen(false)} 
              className="block px-3 py-2 rounded text-xs font-medium text-[#172B4D] hover:bg-slate-50"
            >
              Workflow
            </a>
            <a 
              href="#security" 
              onClick={() => setMobileMenuOpen(false)} 
              className="block px-3 py-2 rounded text-xs font-medium text-[#172B4D] hover:bg-slate-50"
            >
              Security
            </a>
            <a 
              href="#faq" 
              onClick={() => setMobileMenuOpen(false)} 
              className="block px-3 py-2 rounded text-xs font-medium text-[#172B4D] hover:bg-slate-50"
            >
              FAQ
            </a>
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link 
                to="/login" 
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 rounded-md text-xs font-semibold text-[#42526E] border border-[#DFE1E6] hover:bg-slate-50"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 rounded-md text-xs font-semibold bg-[#0052CC] text-white hover:bg-[#0747A6]"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 2. PRODUCT HERO SECTION */}
      <section className="pt-14 pb-16 sm:pt-20 sm:pb-20 bg-white border-b border-[#DFE1E6]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

          {/* Product Category Label */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-100 border border-slate-200 text-[#5E6C84] text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0052CC]" />
            <span>Agile Sprint Planning &amp; Backlog Management</span>
          </div>

          {/* Primary Headline */}
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#172B4D] max-w-4xl mx-auto leading-tight">
            Convert Software Specifications into Structured Agile Sprints
          </h1>

          {/* Clear, Human Subtitle */}
          <p className="mt-4 text-sm sm:text-base text-[#5E6C84] max-w-2xl mx-auto leading-relaxed">
            Upload Software Requirement Specifications (SRS) or PRDs. SprintX breaks down features into epics, user stories, and subtasks, then balances work across engineering roles based on sprint capacity.
          </p>

          {/* Action CTAs */}
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link 
              to="/register" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md font-semibold text-xs sm:text-sm bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] text-white shadow-xs transition-colors"
            >
              <span>Import Requirements Document</span>
              <ArrowRight size={14} />
            </Link>
            
            <Link 
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-md font-semibold text-xs sm:text-sm bg-white hover:bg-slate-50 text-[#42526E] border border-[#DFE1E6] transition-colors"
            >
              <span>View Workspace Demo</span>
            </Link>
          </div>

          {/* Concrete Technical Specs Bar */}
          <div className="mt-12 pt-8 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
              <div className="text-xs font-bold text-[#172B4D]">Client-Side Parser</div>
              <div className="text-[11px] text-[#5E6C84] mt-0.5">Zero-waste token extraction from 50+ page PDFs</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
              <div className="text-xs font-bold text-[#172B4D]">Role Balancing</div>
              <div className="text-[11px] text-[#5E6C84] mt-0.5">Automated workload distribution for FE, BE &amp; QA</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
              <div className="text-xs font-bold text-[#172B4D]">Fibonacci Sizing</div>
              <div className="text-[11px] text-[#5E6C84] mt-0.5">Objective points with Gherkin acceptance criteria</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
              <div className="text-xs font-bold text-[#172B4D]">PostgreSQL RLS</div>
              <div className="text-[11px] text-[#5E6C84] mt-0.5">Strict multi-tenant security with Supabase Auth</div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. REAL PRODUCT PREVIEW INTERFACE */}
      <section className="py-12 sm:py-16 bg-[#F4F5F7] border-b border-[#DFE1E6]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-[#172B4D]">Built for Modern Engineering Squads</h2>
            <p className="text-xs sm:text-sm text-[#5E6C84] mt-1.5">
              An interactive Kanban board that automatically organizes generated tasks into standard agile workflows.
            </p>
          </div>

          {/* Product UI Mockup / Interactive Shell */}
          <div className="bg-white rounded-lg border border-[#DFE1E6] shadow-sm overflow-hidden">
            
            {/* Board Header Bar */}
            <div className="px-4 py-3 border-b border-[#DFE1E6] bg-[#FAFBFC] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#172B4D]">Sprint 14: Payment Infrastructure</span>
                <span className="text-[10px] font-semibold text-[#006644] bg-[#E3FCEF] border border-[#ABF5D1] px-2 py-0.5 rounded">Active Sprint</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#5E6C84]">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-[#172B4D]">Progress:</span>
                  <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#006644] w-3/4" />
                  </div>
                  <span className="font-semibold text-[#006644]">12/16 done</span>
                </div>
              </div>
            </div>

            {/* Simulated 4-Column Board */}
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-[#F4F5F7]">
              
              {/* Column 1: TO DO */}
              <div className="bg-[#EBECF0]/70 rounded-md p-2.5 border border-[#DFE1E6] space-y-2">
                <div className="flex items-center justify-between px-1 text-xs font-bold text-[#42526E]">
                  <span>TO DO</span>
                  <span className="bg-white text-[#5E6C84] text-[10px] px-1.5 py-0.5 rounded border border-[#DFE1E6]">2</span>
                </div>
                
                <div className="bg-white rounded-md p-2.5 border border-[#DFE1E6] shadow-xs space-y-2">
                  <div className="text-xs font-medium text-[#172B4D]">Add webhook signature verification filter</div>
                  <div className="flex items-center justify-between text-[10px] text-[#5E6C84] pt-1 border-t border-slate-100">
                    <span className="font-semibold text-[#0052CC]">SPX-104</span>
                    <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold">BE · 5 pts</span>
                  </div>
                </div>

                <div className="bg-white rounded-md p-2.5 border border-[#DFE1E6] shadow-xs space-y-2">
                  <div className="text-xs font-medium text-[#172B4D]">Write Cypress integration tests for checkout modal</div>
                  <div className="flex items-center justify-between text-[10px] text-[#5E6C84] pt-1 border-t border-slate-100">
                    <span className="font-semibold text-[#0052CC]">SPX-105</span>
                    <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-bold">QA · 3 pts</span>
                  </div>
                </div>
              </div>

              {/* Column 2: IN PROGRESS */}
              <div className="bg-[#EBECF0]/70 rounded-md p-2.5 border border-[#DFE1E6] space-y-2">
                <div className="flex items-center justify-between px-1 text-xs font-bold text-[#0052CC]">
                  <span>IN PROGRESS</span>
                  <span className="bg-white text-[#5E6C84] text-[10px] px-1.5 py-0.5 rounded border border-[#DFE1E6]">1</span>
                </div>

                <div className="bg-white rounded-md p-2.5 border border-[#4C9AFF] shadow-xs space-y-2">
                  <div className="text-xs font-medium text-[#172B4D]">Implement payment intent retry backoff queue</div>
                  <div className="flex items-center justify-between text-[10px] text-[#5E6C84] pt-1 border-t border-slate-100">
                    <span className="font-semibold text-[#0052CC]">SPX-102</span>
                    <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold">BE · 8 pts</span>
                  </div>
                </div>
              </div>

              {/* Column 3: IN REVIEW */}
              <div className="bg-[#EBECF0]/70 rounded-md p-2.5 border border-[#DFE1E6] space-y-2">
                <div className="flex items-center justify-between px-1 text-xs font-bold text-[#974F00]">
                  <span>IN REVIEW</span>
                  <span className="bg-white text-[#5E6C84] text-[10px] px-1.5 py-0.5 rounded border border-[#DFE1E6]">1</span>
                </div>

                <div className="bg-white rounded-md p-2.5 border border-[#DFE1E6] shadow-xs space-y-2">
                  <div className="text-xs font-medium text-[#172B4D]">Construct checkout confirmation modal &amp; fee banner</div>
                  <div className="flex items-center justify-between text-[10px] text-[#5E6C84] pt-1 border-t border-slate-100">
                    <span className="font-semibold text-[#0052CC]">SPX-101</span>
                    <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold">FE · 5 pts</span>
                  </div>
                </div>
              </div>

              {/* Column 4: DONE */}
              <div className="bg-[#EBECF0]/70 rounded-md p-2.5 border border-[#DFE1E6] space-y-2">
                <div className="flex items-center justify-between px-1 text-xs font-bold text-[#006644]">
                  <span>DONE</span>
                  <span className="bg-white text-[#5E6C84] text-[10px] px-1.5 py-0.5 rounded border border-[#DFE1E6]">3</span>
                </div>

                <div className="bg-white rounded-md p-2.5 border border-[#DFE1E6] shadow-xs opacity-90 space-y-2">
                  <div className="text-xs font-medium text-[#5E6C84] line-through">Schema migration for customer transactions table</div>
                  <div className="flex items-center justify-between text-[10px] text-[#5E6C84] pt-1 border-t border-slate-100">
                    <span className="font-semibold text-[#5E6C84]">SPX-098</span>
                    <span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-bold">DB · 5 pts</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 4. CAPABILITIES / FEATURES GRID */}
      <section id="features" className="py-14 sm:py-20 bg-white border-b border-[#DFE1E6]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#172B4D]">Designed for Practical Engineering Teams</h2>
            <p className="text-xs sm:text-sm text-[#5E6C84] mt-2">
              No bloated buzzwords or synthetic fluff. Just straightforward tools to convert documentation into sprint-ready tasks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            <div className="p-5 rounded-md border border-[#DFE1E6] bg-[#FAFBFC] space-y-2 hover:border-[#4C9AFF] transition-colors">
              <div className="w-8 h-8 rounded bg-blue-50 border border-blue-200 text-[#0052CC] flex items-center justify-center mb-3">
                <FileText size={16} />
              </div>
              <h3 className="text-sm font-bold text-[#172B4D]">Document Text Extraction</h3>
              <p className="text-xs text-[#5E6C84] leading-relaxed">
                Extracts raw text from PDF, Markdown, and TXT specifications on the client side to avoid sending heavy binaries over the network.
              </p>
            </div>

            <div className="p-5 rounded-md border border-[#DFE1E6] bg-[#FAFBFC] space-y-2 hover:border-[#4C9AFF] transition-colors">
              <div className="w-8 h-8 rounded bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center mb-3">
                <Users size={16} />
              </div>
              <h3 className="text-sm font-bold text-[#172B4D]">Role &amp; Capacity Balancer</h3>
              <p className="text-xs text-[#5E6C84] leading-relaxed">
                Distributes tasks between Frontend, Backend, Database, and QA roles while respecting velocity limits so developers are not overloaded.
              </p>
            </div>

            <div className="p-5 rounded-md border border-[#DFE1E6] bg-[#FAFBFC] space-y-2 hover:border-[#4C9AFF] transition-colors">
              <div className="w-8 h-8 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mb-3">
                <CheckCircle2 size={16} />
              </div>
              <h3 className="text-sm font-bold text-[#172B4D]">Acceptance Criteria</h3>
              <p className="text-xs text-[#5E6C84] leading-relaxed">
                Generates verifiable Given/When/Then acceptance criteria for each user story to prevent scope ambiguity during code review.
              </p>
            </div>

            <div className="p-5 rounded-md border border-[#DFE1E6] bg-[#FAFBFC] space-y-2 hover:border-[#4C9AFF] transition-colors">
              <div className="w-8 h-8 rounded bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mb-3">
                <SlidersHorizontal size={16} />
              </div>
              <h3 className="text-sm font-bold text-[#172B4D]">Fibonacci Points Estimation</h3>
              <p className="text-xs text-[#5E6C84] leading-relaxed">
                Estimates relative technical complexity (1, 2, 3, 5, 8) based on database changes, API contracts, and user interface state.
              </p>
            </div>

            <div className="p-5 rounded-md border border-[#DFE1E6] bg-[#FAFBFC] space-y-2 hover:border-[#4C9AFF] transition-colors">
              <div className="w-8 h-8 rounded bg-blue-50 border border-blue-200 text-[#0052CC] flex items-center justify-center mb-3">
                <Kanban size={16} />
              </div>
              <h3 className="text-sm font-bold text-[#172B4D]">Live Drag-and-Drop Board</h3>
              <p className="text-xs text-[#5E6C84] leading-relaxed">
                A lightweight Kanban interface with instant status updates, task filtering by role, and inline subtask completion.
              </p>
            </div>

            <div className="p-5 rounded-md border border-[#DFE1E6] bg-[#FAFBFC] space-y-2 hover:border-[#4C9AFF] transition-colors">
              <div className="w-8 h-8 rounded bg-slate-100 border border-slate-300 text-slate-700 flex items-center justify-center mb-3">
                <ShieldCheck size={16} />
              </div>
              <h3 className="text-sm font-bold text-[#172B4D]">Isolated Workspace Data</h3>
              <p className="text-xs text-[#5E6C84] leading-relaxed">
                Every tenant is protected by PostgreSQL Row-Level Security. Workspace data is never used to train public foundation models.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. WORKFLOW STEPS */}
      <section id="workflow" className="py-14 sm:py-20 bg-[#F4F5F7] border-b border-[#DFE1E6]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#172B4D]">How Sprint Planning Works</h2>
            <p className="text-xs sm:text-sm text-[#5E6C84] mt-1.5">
              From raw specification document to actionable sprint tickets in four clear steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-md border border-[#DFE1E6] shadow-xs space-y-2">
              <div className="w-6 h-6 rounded bg-[#0052CC] text-white text-xs font-bold flex items-center justify-center">1</div>
              <h3 className="text-xs font-bold text-[#172B4D]">Upload Document</h3>
              <p className="text-[11px] text-[#5E6C84] leading-relaxed">
                Select your SRS document, PRD, or paste raw architectural specifications into the workspace.
              </p>
            </div>

            <div className="p-4 bg-white rounded-md border border-[#DFE1E6] shadow-xs space-y-2">
              <div className="w-6 h-6 rounded bg-[#0052CC] text-white text-xs font-bold flex items-center justify-center">2</div>
              <h3 className="text-xs font-bold text-[#172B4D]">Decompose Requirements</h3>
              <p className="text-[11px] text-[#5E6C84] leading-relaxed">
                The engine breaks down the spec into hierarchical epics, user stories, and subtasks with acceptance criteria.
              </p>
            </div>

            <div className="p-4 bg-white rounded-md border border-[#DFE1E6] shadow-xs space-y-2">
              <div className="w-6 h-6 rounded bg-[#0052CC] text-white text-xs font-bold flex items-center justify-center">3</div>
              <h3 className="text-xs font-bold text-[#172B4D]">Balance Workload</h3>
              <p className="text-[11px] text-[#5E6C84] leading-relaxed">
                Tasks are matched to engineers according to their specialization (FE, BE, QA) without exceeding velocity limits.
              </p>
            </div>

            <div className="p-4 bg-white rounded-md border border-[#DFE1E6] shadow-xs space-y-2">
              <div className="w-6 h-6 rounded bg-[#0052CC] text-white text-xs font-bold flex items-center justify-center">4</div>
              <h3 className="text-xs font-bold text-[#172B4D]">Execute on Board</h3>
              <p className="text-[11px] text-[#5E6C84] leading-relaxed">
                Track status across To Do, In Progress, In Review, and Done with live database persistence.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 6. SECURITY SECTION */}
      <section id="security" className="py-14 sm:py-20 bg-white border-b border-[#DFE1E6]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#172B4D]">Data Privacy &amp; Access Controls</h2>
            <p className="text-xs sm:text-sm text-[#5E6C84] mt-1.5">
              Built with industry-standard practices to ensure your proprietary product plans remain private.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-md border border-[#DFE1E6] bg-[#FAFBFC] space-y-2">
              <div className="text-xs font-bold text-[#172B4D] flex items-center gap-1.5">
                <Lock size={14} className="text-[#0052CC]" />
                <span>AES-256 &amp; TLS 1.3</span>
              </div>
              <p className="text-xs text-[#5E6C84] leading-relaxed">
                All data is encrypted in transit and at rest using standard cryptographic algorithms.
              </p>
            </div>

            <div className="p-5 rounded-md border border-[#DFE1E6] bg-[#FAFBFC] space-y-2">
              <div className="text-xs font-bold text-[#172B4D] flex items-center gap-1.5">
                <Database size={14} className="text-[#0052CC]" />
                <span>PostgreSQL RLS</span>
              </div>
              <p className="text-xs text-[#5E6C84] leading-relaxed">
                Row-Level Security guarantees that each workspace and team roster is isolated at the database layer.
              </p>
            </div>

            <div className="p-5 rounded-md border border-[#DFE1E6] bg-[#FAFBFC] space-y-2">
              <div className="text-xs font-bold text-[#172B4D] flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[#0052CC]" />
                <span>Stateless Sessions</span>
              </div>
              <p className="text-xs text-[#5E6C84] leading-relaxed">
                Requirements are processed in isolated requests. Your document content is never retained to train public models.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 7. FAQ */}
      <section id="faq" className="py-14 sm:py-20 bg-[#F4F5F7] border-b border-[#DFE1E6]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-[#172B4D]">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-2.5">
            {[
              {
                q: "What document formats are supported?",
                a: "SprintX accepts PDF files, Markdown (.md), and plain text (.txt). You can also paste specification text directly into the web interface."
              },
              {
                q: "How does role-based capacity allocation work?",
                a: "You define your engineering roster with roles (Frontend, Backend, Database, QA, DevOps) and assign each member a maximum story point velocity. When breaking down a document, tasks are allocated to match member specializations without exceeding point limits."
              },
              {
                q: "Can I manually edit generated stories and story points?",
                a: "Yes. Every epic, user story description, acceptance criteria, estimate, and assignee can be adjusted or reallocated directly on the Kanban board."
              },
              {
                q: "Is my technical specification data stored securely?",
                a: "Yes. Data is protected with PostgreSQL Row-Level Security on Supabase. Unauthenticated requests receive 0 rows, and each team's records are accessible only by authenticated workspace members."
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white border border-[#DFE1E6] rounded-md overflow-hidden">
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full px-4 py-3 text-left font-semibold text-[#172B4D] text-xs sm:text-sm flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                >
                  <span>{item.q}</span>
                  <span className="text-xs text-[#5E6C84]">
                    {openFaqIndex === idx ? "−" : "+"}
                  </span>
                </button>
                {openFaqIndex === idx && (
                  <div className="px-4 pb-3.5 text-xs text-[#5E6C84] leading-relaxed border-t border-slate-100 pt-2.5">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 8. CALL TO ACTION */}
      <section className="py-14 sm:py-16 bg-white border-b border-[#DFE1E6]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-8 sm:p-10 bg-slate-50 rounded-lg border border-[#DFE1E6] space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#172B4D]">
              Streamline Your Next Sprint Planning
            </h2>
            <p className="text-xs sm:text-sm text-[#5E6C84] max-w-lg mx-auto">
              Import your requirement specification and review a structured, capacity-balanced agile board in minutes.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/register"
                className="w-full sm:w-auto px-5 py-2.5 bg-[#0052CC] hover:bg-[#0747A6] text-white font-semibold rounded-md text-xs sm:text-sm shadow-xs transition-colors"
              >
                Create Workspace
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-slate-50 text-[#42526E] font-semibold rounded-md text-xs sm:text-sm border border-[#DFE1E6] transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="bg-white py-8 text-xs text-[#5E6C84]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={logo} className="h-5 w-5 object-contain" alt="Logo" />
            <span className="font-semibold text-[#172B4D]">SprintX</span>
            <span>· Agile Sprint &amp; Requirement Management</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <a href="#features" className="hover:text-[#172B4D] transition-colors">Features</a>
            <a href="#security" className="hover:text-[#172B4D] transition-colors">Security</a>
            <Link to="/login" className="hover:text-[#172B4D] transition-colors">Workspace</Link>
            <span>&copy; {new Date().getFullYear()} SprintX. All rights reserved.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

