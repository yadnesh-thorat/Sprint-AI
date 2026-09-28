import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, Sparkles, CheckCircle2, Zap, ArrowRight, ArrowLeft, Mail, Lock, User } from 'lucide-react';
import logo from '../assets/logo.png';

export default function Login() {
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  
  // Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const emailVal = email.trim();
      let authResult = null;

      if (authMode === 'login') {
        authResult = await login(emailVal, password);
      } else {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        authResult = await register(name.trim() || 'Engineer', emailVal, password, {
          organization: 'SprintX Agile Team',
          avatarColor: '#005B7F'
        });
      }

      const loggedInUser = authResult?.formattedUser;
      if (loggedInUser?.isSuperAdmin) {
        navigate('/admin', { replace: true });
      } else {
        const from = location.state?.from?.pathname || '/board';
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err?.message || 'Authentication failed. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans antialiased text-[#1F2937] relative">
      
      {/* Top Floating Back to Home Button */}
      <div className="w-full max-w-5xl mb-4 flex items-center justify-between">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold text-[#005B7F] bg-white border border-[#CBD5E1] shadow-xs hover:bg-[#EBF3F7] transition-all group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home Page</span>
        </Link>

        <Link
          to="/board"
          className="text-xs font-semibold text-[#005B7F] hover:underline flex items-center gap-1"
        >
          <span>Go to Dashboard</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      {/* Main Dual-Column Card */}
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl border border-[#E2E8F0] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN: BRANDING & DEVELOPER DESK ILLUSTRATION */}
        {/* ========================================================= */}
        <div className="lg:col-span-6 bg-[#FAFCFE] p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-[#E2E8F0] flex flex-col justify-between relative overflow-hidden">
          
          {/* Top Logo */}
          <Link to="/" className="flex items-center gap-2.5 z-10 w-fit group">
            <img 
              src={logo} 
              className="h-8 w-8 object-contain group-hover:scale-105 transition-transform duration-200" 
              alt="SprintX AI Logo" 
            />
            <span className="text-slate-950 font-black text-xl tracking-tight">SprintX <span className="text-blue-600">AI</span></span>
          </Link>

          {/* Central Workspace Illustration */}
          <div className="my-auto py-6 flex flex-col items-center justify-center relative">
            <div className="w-full max-w-[340px] aspect-4/3 relative flex items-center justify-center">
              
              <div className="absolute inset-0 bg-[#F1F6FA] rounded-2xl border border-[#E2E8F0] shadow-inner opacity-80" />
              
              {/* Floating Mini Preview Card */}
              <div className="absolute top-4 right-2 w-48 bg-white/95 backdrop-blur-xs rounded-xl shadow-lg border border-[#CBD5E1] p-3 z-10 transform translate-x-2 -translate-y-1">
                <div className="text-[10px] font-bold text-[#005B7F] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>{authMode === 'login' ? 'Sign In Preview' : 'Sign Up Preview'}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-4 bg-[#F1F5F9] rounded text-[9px] text-gray-400 flex items-center px-2">abc@sprintx.ai</div>
                  <div className="h-4 bg-[#F1F5F9] rounded text-[9px] text-gray-400 flex items-center px-2">••••••••••••</div>
                  <div className="h-4.5 bg-[#005B7F] rounded text-[9px] font-bold text-white flex items-center justify-center">
                    {authMode === 'login' ? 'Sign in' : 'Create account'}
                  </div>
                </div>
              </div>

              {/* Developer at Desk SVG Graphic */}
              <svg viewBox="0 0 400 320" className="w-full h-full relative z-20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="280" cy="50" r="14" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="2" />
                <path d="M280 42V50H286" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
                <rect x="220" y="190" width="130" height="70" rx="4" fill="#EDF2F7" stroke="#CBD5E1" strokeWidth="1.5" />
                <line x1="220" y1="225" x2="350" y2="225" stroke="#CBD5E1" strokeWidth="1.5" />
                <rect x="235" y="200" width="8" height="20" rx="1" fill="#94A3B8" />
                <rect x="245" y="202" width="10" height="18" rx="1" fill="#CBD5E1" />
                <rect x="260" y="198" width="6" height="22" rx="1" fill="#005B7F" />
                <rect x="60" y="165" width="200" height="10" rx="3" fill="#005B7F" />
                <rect x="75" y="175" width="6" height="85" fill="#334155" />
                <rect x="60" y="255" width="36" height="6" rx="2" fill="#334155" />
                <rect x="130" y="105" width="60" height="42" rx="3" fill="#64748B" stroke="#475569" strokeWidth="2" />
                <rect x="134" y="109" width="52" height="34" rx="2" fill="#E2E8F0" />
                <rect x="156" y="147" width="8" height="18" fill="#475569" />
                <rect x="148" y="163" width="24" height="4" rx="1" fill="#334155" />
                <rect x="42" y="155" width="24" height="60" rx="6" fill="#E2B13C" />
                <rect x="48" y="215" width="12" height="45" fill="#334155" />
                <path d="M40 260H68" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
                <circle cx="42" cy="265" r="3" fill="#1E293B" />
                <circle cx="66" cy="265" r="3" fill="#1E293B" />
                <path d="M60 195L110 205L160 250" stroke="#5B92A8" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M150 250L170 256" stroke="#1E293B" strokeWidth="10" strokeLinecap="round" />
                <path d="M55 140L80 195H50L45 150Z" fill="#334155" />
                <path d="M65 145L125 168" stroke="#334155" strokeWidth="10" strokeLinecap="round" />
                <circle cx="66" cy="120" r="14" fill="#F8D7C4" />
                <path d="M54 118C54 110 60 106 72 106C80 106 82 112 82 118C82 120 78 116 72 116C66 116 60 120 54 118Z" fill="#1E293B" />
                <circle cx="85" cy="85" r="16" fill="#D6E8F3" />
                <circle cx="85" cy="85" r="8" fill="#005B7F" />
                <rect x="250" y="240" width="22" height="24" rx="3" fill="#334155" />
                <ellipse cx="261" cy="225" rx="8" ry="16" fill="#E2B13C" />
              </svg>
            </div>
          </div>

          <div className="text-xs text-gray-500 flex items-center gap-1.5 z-10">
            <ShieldCheck size={15} className="text-[#005B7F]" />
            <span>Autonomous Agile Sprint & Architecture Engine</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: DIRECT EMAIL AUTH FORM */}
        {/* ========================================================= */}
        <div className="lg:col-span-6 p-8 lg:p-14 flex flex-col justify-center">
          
          <div className="max-w-md w-full mx-auto space-y-6">
            
            {/* Header Titles */}
            <div className="space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827]">
                {authMode === 'login' ? 'Welcome to SprintX !!' : 'Create SprintX Account !!'}
              </h2>
              <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
                {authMode === 'login' 
                  ? 'An Embedded professional sprint intelligence Platform'
                  : 'Get started with autonomous sprint planning in seconds'}
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                <ShieldCheck className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Top Switcher: Sign In vs Sign Up Mode */}
            <div className="flex bg-[#F1F5F9] p-1 rounded-xl border border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setError(null);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  authMode === 'login'
                    ? 'bg-white text-[#005B7F] shadow-xs'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setError(null);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  authMode === 'signup'
                    ? 'bg-white text-[#005B7F] shadow-xs'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Create Account (Sign Up)
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
              
              {/* If signup mode, prompt for Full Name */}
              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Rivera"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005B7F] focus:border-[#005B7F] outline-none bg-white transition-all"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  placeholder="abc@sprintx.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005B7F] focus:border-[#005B7F] outline-none bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005B7F] focus:border-[#005B7F] outline-none bg-white font-medium transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005B7F] focus:border-[#005B7F] outline-none bg-white transition-all"
                  />
                </div>
              )}

              {/* Keep me signed in + Forgot password row */}
              {authMode === 'login' && (
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={keepSignedIn}
                      onChange={(e) => setKeepSignedIn(e.target.checked)}
                      className="w-4 h-4 text-[#005B7F] border-gray-300 rounded focus:ring-[#005B7F]"
                    />
                    <span className="text-xs font-medium text-gray-700">Keep me signed in</span>
                  </label>

                  <span className="text-xs font-semibold text-[#005B7F] hover:underline cursor-pointer">
                    Forgot password?
                  </span>
                </div>
              )}

              {/* Mode Toggle Prompt */}
              <div className="pt-2 text-xs text-gray-500">
                {authMode === 'login' ? (
                  <>
                    First time here?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signup');
                        setError(null);
                      }}
                      className="font-semibold text-[#005B7F] hover:underline cursor-pointer"
                    >
                      Sign up
                    </button>{' '}
                    instead.
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setError(null);
                      }}
                      className="font-semibold text-[#005B7F] hover:underline cursor-pointer"
                    >
                      Sign in
                    </button>{' '}
                    here.
                  </>
                )}
              </div>

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-lg font-bold text-sm text-white bg-[#005B7F] hover:bg-[#004A66] active:bg-[#00384D] shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#005B7F] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>{authMode === 'login' ? 'Sign in' : 'Create Account'}</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
