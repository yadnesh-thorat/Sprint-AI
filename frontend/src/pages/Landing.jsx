import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

// Hook for scroll reveal using native IntersectionObserver (GPU friendly)
function useScrollReveal() {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return [ref, isVisible];
}

// Hook for animated number counters
function useAnimatedCounter(targetValue, duration = 1200, isVisible = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    let startTimestamp = null;
    const startValue = 0;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * (targetValue - startValue) + startValue));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [targetValue, duration, isVisible]);

  return count;
}

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState('kanban');
  const [activeRoleFilter, setActiveRoleFilter] = useState('ALL');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Scroll detection for dynamic elevated navbar

  // Reveal hooks for each section
  const [heroRef, heroVisible] = useScrollReveal();
  const [statsRef, statsVisible] = useScrollReveal();
  const [problemRef, problemVisible] = useScrollReveal();
  const [previewRef, previewVisible] = useScrollReveal();
  const [featuresRef, featuresVisible] = useScrollReveal();
  const [workflowRef, workflowVisible] = useScrollReveal();
  const [useCasesRef, useCasesVisible] = useScrollReveal();
  const [securityRef, securityVisible] = useScrollReveal();
  const [faqRef, faqVisible] = useScrollReveal();
  const [ctaRef, ctaVisible] = useScrollReveal();

  // Animated counters
  const speedMetric = useAnimatedCounter(4, 1000, statsVisible);
  const accuracyMetric = useAnimatedCounter(99, 1200, statsVisible);
  const timeSavedMetric = useAnimatedCounter(80, 1400, statsVisible);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900 scroll-smooth">
      
      {/* 1. ELEVATED NAVBAR WITH SCROLL-AWARE BLUR */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs py-0' 
          : 'bg-white border-b border-slate-200 py-1'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 text-blue-600 font-black text-xl tracking-tight group">
              <img 
                src={logo} 
                className="h-8 w-8 object-contain group-hover:scale-105 transition-transform duration-200" 
                alt="SprintX AI Logo" 
              />
              <span className="text-slate-950 font-black tracking-tight">SprintX <span className="text-blue-600">AI</span></span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#solutions" className="hover:text-blue-600 transition-colors">Capabilities</a>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">Workflow</a>
            <a href="#security" className="hover:text-blue-600 transition-colors">Security</a>
            <a href="#faq" className="hover:text-blue-600 transition-colors">FAQ</a>
          </nav>

          {/* Action CTA: Single Unified Login / Signup Button */}
          <div className="hidden sm:flex items-center">
            <Link 
              to="/login" 
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-bold rounded-lg bg-[#005B7F] text-white shadow-xs hover:bg-[#004A66] hover:shadow-sm active:scale-95 transition-all duration-150"
            >
              <span>Login / Sign Up</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 focus:outline-none transition-colors border border-slate-200"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? "CLOSE" : "MENU"}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
            <a 
              href="#solutions" 
              onClick={() => setMobileMenuOpen(false)} 
              className="block px-3 py-2 rounded-md text-base font-semibold text-slate-700 hover:bg-slate-50"
            >
              Capabilities
            </a>
            <a 
              href="#how-it-works" 
              onClick={() => setMobileMenuOpen(false)} 
              className="block px-3 py-2 rounded-md text-base font-semibold text-slate-700 hover:bg-slate-50"
            >
              Workflow
            </a>
            <a 
              href="#security" 
              onClick={() => setMobileMenuOpen(false)} 
              className="block px-3 py-2 rounded-md text-base font-semibold text-slate-700 hover:bg-slate-50"
            >
              Security
            </a>
            <a 
              href="#faq" 
              onClick={() => setMobileMenuOpen(false)} 
              className="block px-3 py-2 rounded-md text-base font-semibold text-slate-700 hover:bg-slate-50"
            >
              FAQ
            </a>
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              <Link 
                to="/login" 
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-lg font-bold bg-[#005B7F] text-white shadow-sm"
              >
                Login / Sign Up
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section 
        ref={heroRef} 
        className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 overflow-hidden bg-white border-b border-slate-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">

          {/* Primary Headline */}
          <h1 className={`text-4xl sm:text-6xl font-black tracking-tight text-slate-950 max-w-4xl mx-auto leading-[1.15] text-balance transition-all duration-700 delay-100 ${
            heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            Turn Complex SRS Documents into <span className="text-blue-600 underline decoration-blue-300 decoration-4 underline-offset-4">Structured Agile Sprints</span>
          </h1>

          {/* Subtitle Narrative */}
          <p className={`mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal text-balance transition-all duration-700 delay-200 ${
            heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            Eliminate hours of manual backlog grooming. SprintX parses your Software Requirement Specifications, generates hierarchical Epics & User Stories with acceptance criteria, and load-balances tasks across your engineering team.
          </p>

          {/* Action CTAs */}
          <div className={`mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 transition-all duration-700 delay-300 ${
            heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <Link 
              to="/register" 
              className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-xl font-bold text-base bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:shadow-lg active:scale-95 transition-all duration-150"
            >
              <span>Upload SRS Document Free</span>
            </Link>
            
            <a 
              href="#solutions"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-bold text-base bg-slate-900 text-white hover:bg-slate-800 transition-all duration-150 shadow-md hover:shadow-lg"
            >
              <span>Explore Capabilities</span>
            </a>
          </div>

          {/* Animated Metrics Strip */}
          <div 
            ref={statsRef}
            className="mt-14 pt-8 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-left"
          >
            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 hover:border-blue-300 transition-all duration-200">
              <div className="text-2xl font-black text-blue-600">{speedMetric}.2s</div>
              <div className="text-xs font-semibold text-slate-800 mt-0.5">Average Parsing Speed</div>
              <div className="text-[11px] text-slate-500">Multi-page PDF extraction</div>
            </div>
            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 hover:border-blue-300 transition-all duration-200">
              <div className="text-2xl font-black text-slate-900">{accuracyMetric}.4%</div>
              <div className="text-xs font-semibold text-slate-800 mt-0.5">Story Acceptance Quality</div>
              <div className="text-[11px] text-slate-500">Gherkin criteria generated</div>
            </div>
            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 hover:border-blue-300 transition-all duration-200">
              <div className="text-2xl font-black text-slate-900">{timeSavedMetric}%</div>
              <div className="text-xs font-semibold text-slate-800 mt-0.5">Time Saved Per Sprint</div>
              <div className="text-[11px] text-slate-500">Zero manual ticket entry</div>
            </div>
            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 hover:border-blue-300 transition-all duration-200">
              <div className="text-2xl font-black text-emerald-600">1-Click</div>
              <div className="text-xs font-semibold text-slate-800 mt-0.5">Direct Cloud Sync</div>
              <div className="text-[11px] text-slate-500">Realtime Scrum Engine</div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. PROBLEM VS SOLUTION SECTION */}
      <section 
        ref={problemRef}
        className={`py-16 sm:py-20 bg-slate-100/60 border-b border-slate-200 transition-all duration-700 ${
          problemVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950">The Bottleneck in Modern Agile Sprints</h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">Manual requirement breakdown causes inaccurate estimates, team burnout, and missed release deadlines.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* The Old Way */}
            <div className="bg-white rounded-2xl border border-rose-200 p-6 sm:p-8 shadow-xs space-y-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-sm bg-rose-50 px-3 py-1 rounded-md w-fit border border-rose-200">
                <span>Traditional Sprint Grooming</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Manual, Subjective & Error-Prone</h3>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
                <li className="flex items-start gap-2.5">
                  <span className="font-mono font-bold text-[10px] text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 shrink-0 mt-0.5">01</span>
                  <span><strong>8–16 hours per sprint</strong> spent reading through PDF specifications and manually creating individual sprint tickets.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="font-mono font-bold text-[10px] text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 shrink-0 mt-0.5">02</span>
                  <span><strong>Unclear acceptance criteria</strong> leading to endless Slack debates and mid-sprint scope creep.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="font-mono font-bold text-[10px] text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 shrink-0 mt-0.5">03</span>
                  <span><strong>Uneven developer allocation</strong> where backend developers are overloaded while frontend engineers wait on blocked APIs.</span>
                </li>
              </ul>
            </div>

            {/* The SprintX Way */}
            <div className="bg-white rounded-2xl border border-emerald-200 p-6 sm:p-8 shadow-xs space-y-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm bg-emerald-50 px-3 py-1 rounded-md w-fit border border-emerald-200">
                <span>The SprintX AI Workflow</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Structured, Fast & Capacity-Aware</h3>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
                <li className="flex items-start gap-2.5">
                  <span className="font-mono font-bold text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0 mt-0.5">01</span>
                  <span><strong>Instant decomposition</strong> from raw PDF/Word documents into hierarchical Epics, Stories, and Subtasks in seconds.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="font-mono font-bold text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0 mt-0.5">02</span>
                  <span><strong>Standardized Gherkin acceptance criteria</strong> and objective Fibonacci points based on technical complexity.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="font-mono font-bold text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0 mt-0.5">03</span>
                  <span><strong>Automated workload balancing</strong> matching tasks to developers based on their role and maximum sprint capacity.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* 5. SOLUTIONS & CAPABILITIES (BENTO GRID) */}
      <section 
        id="solutions" 
        ref={featuresRef}
        className={`py-16 sm:py-24 bg-white border-b border-slate-200 transition-all duration-700 ${
          featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950">Engineered for Technical Accuracy</h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">Comprehensive suite of tools tailored for technical product managers and engineering directors.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:shadow-md hover:border-blue-300 transition-all duration-200 space-y-3">
              <h3 className="text-base font-bold text-slate-950">Multi-Format Document Ingestion</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Seamlessly upload 50+ page PDF, Word, Markdown, or TXT specifications. The NLP parser extracts functional requirements, data models, and edge cases.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:shadow-md hover:border-blue-300 transition-all duration-200 space-y-3">
              <h3 className="text-base font-bold text-slate-950">Role-Aware Team Balancing</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Maps tasks to developers based on their technical specialization (Frontend, Backend, DevOps, DB) while strictly enforcing sprint capacity constraints.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:shadow-md hover:border-blue-300 transition-all duration-200 space-y-3">
              <h3 className="text-base font-bold text-slate-950">Fibonacci Complexity Scoring</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Calculates realistic Fibonacci story points (1, 2, 3, 5, 8, 13) based on schema alterations, API complexity, and state transitions.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:shadow-md hover:border-blue-300 transition-all duration-200 space-y-3">
              <h3 className="text-base font-bold text-slate-950">Cloud & Linear Integration</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                One-click synchronization directly to your Cloud or Linear workspace, preserving complete Epic parent-child hierarchies and tags.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:shadow-md hover:border-blue-300 transition-all duration-200 space-y-3">
              <h3 className="text-base font-bold text-slate-950">Realtime Multiplayer Kanban</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Drag-and-drop board powered by Supabase Realtime with instant status broadcasts across your distributed development squad.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:shadow-md hover:border-blue-300 transition-all duration-200 space-y-3">
              <h3 className="text-base font-bold text-slate-950">Zero Public Model Training</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your proprietary architecture specifications and PRDs are processed in isolated containers with zero retention for public foundation models.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 7. HOW IT WORKS (4-STEP WORKFLOW) */}
      <section 
        id="how-it-works" 
        ref={workflowRef}
        className={`py-16 sm:py-24 bg-slate-100/60 border-b border-slate-200 transition-all duration-700 ${
          workflowVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950">From Raw Spec to Active Sprint</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3 hover:shadow-md transition-shadow">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center">1</div>
              <h3 className="text-sm font-bold text-slate-950">Upload Specification</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Drop your Software Requirement Specification (SRS) in PDF, Word, or plain text format.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3 hover:shadow-md transition-shadow">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center">2</div>
              <h3 className="text-sm font-bold text-slate-950">AI Extracts Architecture</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The engine separates functional requirements, creates Epics, and generates Gherkin acceptance criteria.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3 hover:shadow-md transition-shadow">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center">3</div>
              <h3 className="text-sm font-bold text-slate-950">Balance Team Capacity</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tasks are matched to Frontend, Backend, and Database engineers without exceeding point caps.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3 hover:shadow-md transition-shadow">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center">4</div>
              <h3 className="text-sm font-bold text-slate-950">Launch & Sync</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Manage tickets in the native multiplayer Kanban board or push directly to your issue tracking workspace.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. BENEFITS & USE CASES BY ROLE */}
      <section 
        ref={useCasesRef}
        className={`py-16 sm:py-24 bg-white border-b border-slate-200 transition-all duration-700 ${
          useCasesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950">Built for the Entire Engineering Org</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="text-base font-bold text-slate-950">Product Managers & Scrum Masters</h3>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-center gap-2"><span className="text-blue-600 font-mono text-[11px] font-bold">#</span> Convert 50-page PRDs to tickets in seconds</li>
                <li className="flex items-center gap-2"><span className="text-blue-600 font-mono text-[11px] font-bold">#</span> Standardized Gherkin acceptance criteria</li>
                <li className="flex items-center gap-2"><span className="text-blue-600 font-mono text-[11px] font-bold">#</span> Objective Fibonacci point estimation</li>
              </ul>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="text-base font-bold text-slate-950">Engineering Leads & Architects</h3>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-center gap-2"><span className="text-purple-600 font-mono text-[11px] font-bold">#</span> Prevent sprint bottlenecks & FE/BE starvation</li>
                <li className="flex items-center gap-2"><span className="text-purple-600 font-mono text-[11px] font-bold">#</span> Preserve architectural domain boundaries</li>
                <li className="flex items-center gap-2"><span className="text-purple-600 font-mono text-[11px] font-bold">#</span> Track capacity across squads in real time</li>
              </ul>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="text-base font-bold text-slate-950">Software Developers</h3>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-center gap-2"><span className="text-emerald-600 font-mono text-[11px] font-bold">#</span> Clear, unambiguous technical task context</li>
                <li className="flex items-center gap-2"><span className="text-emerald-600 font-mono text-[11px] font-bold">#</span> Balanced sprint point limits (no burnout)</li>
                <li className="flex items-center gap-2"><span className="text-emerald-600 font-mono text-[11px] font-bold">#</span> Instant drag-and-drop multiplayer board</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 9. SECURITY & TRUST SECTION */}
      <section 
        id="security" 
        ref={securityRef}
        className={`py-16 sm:py-24 bg-slate-100/60 border-b border-slate-200 transition-all duration-700 ${
          securityVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950">Enterprise-Grade Security & Privacy</h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">Built with strict data confidentiality standards to safeguard proprietary technical specifications.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-base font-bold text-slate-950">AES-256 Encryption</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                All document uploads and generated ticket databases are encrypted in transit via TLS 1.3 and at rest with AES-256 encryption.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-base font-bold text-slate-950">Complete Tenant Isolation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Row-Level Security (RLS) policies on Supabase guarantee that your team&apos;s boards and member workloads remain completely isolated.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-base font-bold text-slate-950">Zero Model Training</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your technical specifications are never used to train public or shared AI models. Processing occurs in ephemeral, stateless sessions.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 10. FAQ SECTION */}
      <section 
        id="faq" 
        ref={faqRef}
        className={`py-16 sm:py-24 bg-white border-b border-slate-200 transition-all duration-700 ${
          faqVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-950">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "What file formats does SprintX AI support?",
                a: "SprintX AI accepts PDF files, Microsoft Word (.docx), Markdown (.md), and plain text documents (.txt). You can also copy and paste raw specification text directly into the dashboard."
              },
              {
                q: "How does role-based capacity allocation work?",
                a: "You can configure your engineering roster with specific technical specializations (Frontend, Backend, Database, DevOps, Fullstack) and set maximum story point caps. SprintX automatically analyzes each story's domain and balances point distribution."
              },
              {
                q: "Can I manually adjust stories, story points, and assignees?",
                a: "Yes. Every generated Epic, story description, Fibonacci estimate, and developer assignment can be edited directly on the interactive Kanban board."
              },
              {
                q: "How does Cloud workspace export work?",
                a: "SprintX formats the entire Epic and User Story hierarchy into standard agile compatible structures, allowing one-click synchronization via API tokens or JSON/CSV exports."
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden transition-all duration-200">
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full px-5 py-4 text-left font-bold text-slate-900 text-sm flex items-center justify-between gap-4 hover:bg-slate-100/80 transition-colors"
                >
                  <span>{item.q}</span>
                  <span className="text-[11px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {openFaqIndex === idx ? "HIDE" : "VIEW"}
                  </span>
                </button>
                {openFaqIndex === idx && (
                  <div className="px-5 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 pt-3 bg-white">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 11. FINAL CONVERSION CTA */}
      <section 
        ref={ctaRef}
        className={`py-16 sm:py-20 bg-slate-50 transition-all duration-700 ${
          ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-8 sm:p-14 bg-blue-600 rounded-3xl text-white shadow-xl space-y-6 relative overflow-hidden">
            <h2 className="text-3xl sm:text-4xl font-black relative z-10">
              Ready to cut 80% of your sprint planning time?
            </h2>
            <p className="text-blue-100 text-sm sm:text-base max-w-xl mx-auto relative z-10">
              Upload your first SRS document and generate an actionable, balanced agile board in seconds.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10">
              <Link
                to="/register"
                className="w-full sm:w-auto px-7 py-3.5 bg-white text-blue-700 font-bold rounded-xl text-sm shadow-md hover:bg-blue-50 active:scale-95 transition-all"
              >
                Create Your First Board Free
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-7 py-3.5 bg-blue-700 text-white font-semibold rounded-xl text-sm hover:bg-blue-800 active:scale-95 transition-all border border-blue-500/50"
              >
                Sign In to Workspace
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 12. FOOTER */}
      <footer className="border-t border-slate-200 bg-slate-900 py-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <img src={logo} className="h-6 w-6 rounded object-contain" alt="Logo" />
            <span className="font-bold text-white text-sm">SprintX AI</span>
            <span>• Autonomous Sprint & Requirement Intelligence</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#solutions" className="hover:text-white transition-colors">Capabilities</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
            <Link to="/login" className="hover:text-white transition-colors">Workspace</Link>
            <span>© {new Date().getFullYear()} SprintX AI Inc. All rights reserved.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
