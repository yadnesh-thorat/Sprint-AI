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
  FolderKanban,
  Globe,
  Shield,
  FileCheck,
  X as CloseIcon
} from 'lucide-react';
import logo from '../assets/logo.png';

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [activeTab, setActiveTab] = useState('board'); // 'board' or 'parser'
  const [legalModal, setLegalModal] = useState(null); // 'privacy' | 'terms' | null

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
      <section className="pt-5 pb-14 sm:pt-6 sm:pb-16 bg-white border-b border-[#DFE1E6]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

          {/* Product Category Label */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-100 border border-slate-200 text-[#5E6C84] text-xs font-medium mb-4">
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
          <div className="mt-7 flex items-center justify-center">
            <Link 
              to="/register" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md font-semibold text-xs sm:text-sm bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] text-white shadow-xs transition-colors"
            >
              <span>Import Requirements Document</span>
              <ArrowRight size={14} />
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

      {/* 9. ENTERPRISE FOOTER */}
      <footer className="bg-white border-t border-[#DFE1E6] pt-14 pb-12 text-xs text-[#5E6C84]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Main Footer Navigation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-[#EBECF0]">
            
            {/* Column 1: Brand & Operational Status (spans 2 cols on lg) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <img src={logo} className="h-7 w-7 object-contain" alt="SprintX Logo" />
                <span className="font-bold text-base text-[#172B4D] tracking-tight">SprintX</span>
                <span className="text-[10px] font-semibold bg-blue-50 text-[#0052CC] border border-blue-200 px-2 py-0.5 rounded">
                  Enterprise Agile
                </span>
              </div>

              <p className="text-xs text-[#5E6C84] max-w-sm leading-relaxed">
                Autonomous requirement decomposition and agile sprint planning system. Convert raw specifications, PRDs, and RFCs into structured epics, user stories, and role-balanced sprint backlogs.
              </p>

              {/* Live Operational Status */}
              <div className="pt-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>All Systems Operational (99.99% Uptime)</span>
                </div>
              </div>

              <div className="text-[11px] text-[#5E6C84] flex items-center gap-1.5 pt-0.5">
                <ShieldCheck size={13} className="text-[#0052CC]" />
                <span>Zero-Trust PostgreSQL Row-Level Security Enforced</span>
              </div>
            </div>

            {/* Column 2: Platform Architecture */}
            <div>
              <div className="font-bold text-[#172B4D] text-xs uppercase tracking-wider mb-3.5">
                Platform
              </div>
              <ul className="space-y-2.5">
                <li>
                  <Link to="/board" className="hover:text-[#0052CC] transition-colors">Sprint Kanban Board</Link>
                </li>
                <li>
                  <Link to="/upload" className="hover:text-[#0052CC] transition-colors">Client-Side SRS Parser</Link>
                </li>
                <li>
                  <Link to="/team" className="hover:text-[#0052CC] transition-colors">Role Capacity Allocator</Link>
                </li>
                <li>
                  <a href="#workflow" className="hover:text-[#0052CC] transition-colors">Decomposition Engine</a>
                </li>
                <li>
                  <a href="#features" className="hover:text-[#0052CC] transition-colors">Multi-Key AI Gateway</a>
                </li>
              </ul>
            </div>

            {/* Column 3: Security & Governance */}
            <div>
              <div className="font-bold text-[#172B4D] text-xs uppercase tracking-wider mb-3.5">
                Security &amp; Trust
              </div>
              <ul className="space-y-2.5">
                <li>
                  <a href="#security" className="hover:text-[#0052CC] transition-colors">Tenant Isolation (RLS)</a>
                </li>
                <li>
                  <a href="#security" className="hover:text-[#0052CC] transition-colors">Zero-Token Ingestion</a>
                </li>
                <li>
                  <a href="#security" className="hover:text-[#0052CC] transition-colors">Multi-Key Failover</a>
                </li>
                <li>
                  <Link to="/admin" className="hover:text-[#0052CC] transition-colors">Super Admin Control Plane</Link>
                </li>
                <li>
                  <span className="text-[#172B4D] font-medium flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-600" />
                    <span>No AI Model Training</span>
                  </span>
                </li>
              </ul>
            </div>

            {/* Column 4: Legal & Policies */}
            <div>
              <div className="font-bold text-[#172B4D] text-xs uppercase tracking-wider mb-3.5">
                Legal &amp; Compliance
              </div>
              <ul className="space-y-2.5">
                <li>
                  <button 
                    type="button"
                    onClick={() => setLegalModal('privacy')}
                    className="hover:text-[#0052CC] text-left transition-colors font-medium text-[#172B4D] flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Privacy Policy</span>
                    <span className="text-[9px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded font-semibold border border-slate-200">GDPR</span>
                  </button>
                </li>
                <li>
                  <button 
                    type="button"
                    onClick={() => setLegalModal('terms')}
                    className="hover:text-[#0052CC] text-left transition-colors font-medium text-[#172B4D] cursor-pointer"
                  >
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button 
                    type="button"
                    onClick={() => setLegalModal('privacy')}
                    className="hover:text-[#0052CC] text-left transition-colors cursor-pointer"
                  >
                    Data Processing Agreement
                  </button>
                </li>
                <li>
                  <button 
                    type="button"
                    onClick={() => setLegalModal('terms')}
                    className="hover:text-[#0052CC] text-left transition-colors cursor-pointer"
                  >
                    Acceptable Use Guidelines
                  </button>
                </li>
                <li>
                  <button 
                    type="button"
                    onClick={() => setLegalModal('privacy')}
                    className="hover:text-[#0052CC] text-left transition-colors cursor-pointer"
                  >
                    Cookie Preferences
                  </button>
                </li>
              </ul>
            </div>

          </div>

          {/* Sub-Footer Copyright & Quick Links */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#5E6C84]">
            <div>
              &copy; {new Date().getFullYear()} SprintX Technologies Inc. All rights reserved.
            </div>

            <div className="flex items-center flex-wrap gap-4">
              <button 
                type="button"
                onClick={() => setLegalModal('privacy')}
                className="hover:text-[#0052CC] transition-colors cursor-pointer"
              >
                Privacy Policy
              </button>
              <span>&bull;</span>
              <button 
                type="button"
                onClick={() => setLegalModal('terms')}
                className="hover:text-[#0052CC] transition-colors cursor-pointer"
              >
                Terms of Service
              </button>
              <span>&bull;</span>
              <a href="#security" className="hover:text-[#0052CC] transition-colors">
                Security Overview
              </a>
              <span>&bull;</span>
              <Link to="/login" className="hover:text-[#0052CC] font-semibold text-[#172B4D] transition-colors">
                Workspace Portal
              </Link>
            </div>
          </div>

        </div>
      </footer>

      {/* 10. LEGAL & COMPLIANCE MODAL (PRIVACY POLICY & TERMS OF SERVICE) */}
      {legalModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-[#DFE1E6] w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#EBECF0] flex items-center justify-between bg-white flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0052CC] flex items-center justify-center font-bold">
                  {legalModal === 'privacy' ? <ShieldCheck size={18} /> : <FileCheck size={18} />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#172B4D]">
                    {legalModal === 'privacy' ? 'SprintX Privacy Policy' : 'SprintX Terms of Service'}
                  </h3>
                  <p className="text-[11px] text-[#5E6C84]">
                    Last updated: October 2026 &bull; Strict Zero-Trust Enterprise Standards
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Switcher Pills */}
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setLegalModal('privacy')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                      legalModal === 'privacy' ? 'bg-white text-[#0052CC] shadow-2xs' : 'text-[#5E6C84] hover:text-[#172B4D]'
                    }`}
                  >
                    Privacy
                  </button>
                  <button
                    type="button"
                    onClick={() => setLegalModal('terms')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                      legalModal === 'terms' ? 'bg-white text-[#0052CC] shadow-2xs' : 'text-[#5E6C84] hover:text-[#172B4D]'
                    }`}
                  >
                    Terms
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setLegalModal(null)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer ml-1"
                >
                  <CloseIcon size={18} />
                </button>
              </div>
            </div>

            {/* Modal Content (Scrollable) */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-[#172B4D] leading-relaxed">
              
              {/* PRIVACY POLICY CONTENT */}
              {legalModal === 'privacy' && (
                <div className="space-y-5">
                  <section className="space-y-1.5">
                    <h4 className="text-sm font-bold text-[#172B4D]">1. Commitment to Enterprise Privacy &amp; Confidentiality</h4>
                    <p className="text-[#5E6C84]">
                      SprintX Technologies Inc. ("SprintX", "we", "us") builds developer infrastructure for agile sprint planning. We recognize that Software Requirement Specifications (SRS), Product Requirement Documents (PRDs), and sprint backlog allocations represent mission-critical intellectual property. This Privacy Policy details our technical measures for data isolation and protection.
                    </p>
                  </section>

                  <section className="space-y-1.5 bg-blue-50/60 p-3.5 rounded-lg border border-blue-100">
                    <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-[#0052CC]" />
                      <span>2. Zero AI Training Directive (Strict Guarantee)</span>
                    </h4>
                    <p className="text-blue-900/80">
                      SprintX enforces an absolute Zero-Training policy. Any technical specifications, user story descriptions, acceptance criteria, or code requirements processed through our AI decomposition engines are <strong>NEVER used to train, fine-tune, or improve public or commercial Large Language Models</strong>. All inference occurs ephemerally under zero data retention enterprise agreements.
                    </p>
                  </section>

                  <section className="space-y-1.5">
                    <h4 className="text-sm font-bold text-[#172B4D]">3. Client-Side Document Structuring</h4>
                    <p className="text-[#5E6C84]">
                      Unlike legacy cloud processors that upload entire multi-megabyte PDF files to remote servers, SprintX executes document parsing directly in your web browser via <code>pdfjs-dist</code>. Unnecessary boilerplate, margins, and binary image layers are stripped on the client side before structured markdown is transmitted.
                    </p>
                  </section>

                  <section className="space-y-1.5">
                    <h4 className="text-sm font-bold text-[#172B4D]">4. PostgreSQL Row-Level Security (Tenant Isolation)</h4>
                    <p className="text-[#5E6C84]">
                      Every project, epic, story, and task in SprintX is partitioned using PostgreSQL Row-Level Security (RLS) linked strictly to <code>auth.uid() = user_id</code>. Unauthenticated queries evaluate to 0 rows. Cross-tenant access is architecturally prevented at the database kernel level.
                    </p>
                  </section>

                  <section className="space-y-1.5">
                    <h4 className="text-sm font-bold text-[#172B4D]">5. Data Retention &amp; 1-Click Cascade Deletion</h4>
                    <p className="text-[#5E6C84]">
                      You retain full control over your project lifecycle. When a squad lead or manager initiates a project deletion from the board, SprintX atomically executes a cascade deletion across all child records (<code>tasks</code> &rarr; <code>stories</code> &rarr; <code>epics</code> &rarr; <code>projects</code>) with zero orphaned records remaining in the database.
                    </p>
                  </section>

                  <section className="space-y-1.5">
                    <h4 className="text-sm font-bold text-[#172B4D]">6. Contact &amp; Data Protection Officer</h4>
                    <p className="text-[#5E6C84]">
                      For GDPR compliance inquiries, data export requests, or security audits, contact our security team at <span className="font-mono text-[#0052CC]">security@sprintx.io</span>.
                    </p>
                  </section>
                </div>
              )}

              {/* TERMS OF SERVICE CONTENT */}
              {legalModal === 'terms' && (
                <div className="space-y-5">
                  <section className="space-y-1.5">
                    <h4 className="text-sm font-bold text-[#172B4D]">1. Acceptance of Terms</h4>
                    <p className="text-[#5E6C84]">
                      By creating an account, accessing the SprintX web platform, or using our automated agile board decomposition engines, you and your organization agree to be bound by these Terms of Service.
                    </p>
                  </section>

                  <section className="space-y-1.5 bg-emerald-50/60 p-3.5 rounded-lg border border-emerald-100">
                    <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                      <FileCheck size={14} className="text-emerald-600" />
                      <span>2. 100% Customer Intellectual Property Ownership</span>
                    </h4>
                    <p className="text-emerald-900/80">
                      You retain exclusive, unencumbered ownership of all materials uploaded to SprintX, including all generated epics, user stories, acceptance criteria, story point allocations, and sprint backlogs. SprintX claims no rights, title, or interest in your software requirements or technical outputs.
                    </p>
                  </section>

                  <section className="space-y-1.5">
                    <h4 className="text-sm font-bold text-[#172B4D]">3. Multi-Key High Availability Engine</h4>
                    <p className="text-[#5E6C84]">
                      SprintX incorporates a multi-key failover gateway. In the event of upstream rate-limiting or quota exhaustion on a primary AI provider key, the platform automatically rotates to active backup keys in the tenant pool to guarantee uninterrupted planning workflows.
                    </p>
                  </section>

                  <section className="space-y-1.5">
                    <h4 className="text-sm font-bold text-[#172B4D]">4. Acceptable Use Policy</h4>
                    <p className="text-[#5E6C84]">
                      You agree not to use SprintX to process illegal, infringing, or malicious content, attempt to bypass PostgreSQL Row-Level Security policies, conduct unauthorized denial-of-service tests, or extract other tenants' partitioned data.
                    </p>
                  </section>

                  <section className="space-y-1.5">
                    <h4 className="text-sm font-bold text-[#172B4D]">5. Service Level Agreement &amp; Availability</h4>
                    <p className="text-[#5E6C84]">
                      We provide SprintX under an enterprise-grade high availability standard. Scheduled maintenance windows are communicated in advance via platform notifications.
                    </p>
                  </section>

                  <section className="space-y-1.5">
                    <h4 className="text-sm font-bold text-[#172B4D]">6. Governing Law</h4>
                    <p className="text-[#5E6C84]">
                      These terms shall be governed by and construed in accordance with applicable enterprise commercial standards and federal laws.
                    </p>
                  </section>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-[#EBECF0] flex items-center justify-between flex-shrink-0">
              <div className="text-[11px] text-[#5E6C84]">
                Enterprise Security &amp; Compliance Verified
              </div>
              <button
                type="button"
                onClick={() => setLegalModal(null)}
                className="px-4 py-2 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Close &amp; Understand
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

