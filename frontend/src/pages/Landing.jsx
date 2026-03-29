import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Zap, Filter } from 'lucide-react';
import logo from '../assets/logo.png';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white selection:bg-brand-100 selection:text-brand-900">
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1 items-center gap-3">
            <img src={logo} className="h-10 w-10 rounded-xl shadow-md rotate-3" alt="SprintX Logo" />
            <span className="font-black text-2xl tracking-tighter text-gray-900">SprintX <span className="text-brand-600">AI</span></span>
          </div>
          <div className="flex flex-1 justify-end gap-x-4">
            <Link to="/login" className="text-sm font-semibold leading-6 text-gray-900 px-3 py-2">
              Log in
            </Link>
            <Link to="/register" className="rounded-md bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <main className="isolate">
        <div className="relative pt-14">
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"}}></div>
          </div>
          <div className="py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                  Turn SRS into Jira Boards <span className="text-brand-600">Instantly</span>
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  Upload a PDF of your Software Requirement Specification. Our AI Engine analyzes the text, generates Epics and User Stories, and assigns tasks to your developers based on their role and current workload.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                  <Link to="/register" className="rounded-md bg-brand-600 flex items-center gap-2 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">
                    Start parsing for free <ArrowRight size={18}/>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" aria-hidden="true">
            <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" style={{clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"}}></div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center border-t border-gray-200 pt-16">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-brand-100 text-brand-600 rounded-full"><Bot size={32}/></div>
              <h3 className="text-xl font-bold">1. AI Analysis</h3>
              <p className="text-gray-500 text-sm">Upload a PDF. The AI reads your SRS and detects core features.</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-purple-100 text-purple-600 rounded-full"><Filter size={32}/></div>
              <h3 className="text-xl font-bold">2. Story Decomposition</h3>
              <p className="text-gray-500 text-sm">Automatically breaks specs into Epics, Stories, and highly granular Tasks.</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-green-100 text-green-600 rounded-full"><Zap size={32}/></div>
              <h3 className="text-xl font-bold">3. Smart Assignment</h3>
              <p className="text-gray-500 text-sm">Discovers available FE/BE/DB developers and load-balances the sprints.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
