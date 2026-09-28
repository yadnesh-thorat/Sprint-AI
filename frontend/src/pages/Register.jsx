import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, Zap, ArrowRight, ArrowLeft, CheckCircle2, User, Mail, Lock, Building, Users, Briefcase } from 'lucide-react';
import logo from '../assets/logo.png';

export default function Register() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState('Full Stack Engineer');
  const [teamSize, setTeamSize] = useState('5-15 engineers');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleNextStep = (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid work email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setStep(2);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register(name.trim(), email.trim(), password, {
        organization: organization.trim() || `${name.trim()}'s Squad`,
        role,
        teamSize,
        avatarColor: '#005B7F'
      });
      navigate('/board');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err?.message || 'Registration failed. An account with this email may already exist.');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans antialiased text-[#1F2937] relative">
      
      {/* Top Floating Back Button */}
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

      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl border border-[#E2E8F0] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        
        {/* LEFT COLUMN: BRANDING & ART */}
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

          {/* Central Illustration graphic */}
          <div className="my-auto py-6 flex flex-col items-center justify-center relative">
            <div className="w-full max-w-[340px] aspect-4/3 relative flex items-center justify-center">
              
              <div className="absolute inset-0 bg-[#F1F6FA] rounded-2xl border border-[#E2E8F0] shadow-inner opacity-80" />
              
              {/* Floating Mini Account Setup Badge */}
              <div className="absolute top-4 right-2 w-48 bg-white/95 backdrop-blur-xs rounded-xl shadow-lg border border-[#CBD5E1] p-3 z-10 transform translate-x-2 -translate-y-1">
                <div className="text-[10px] font-bold text-[#005B7F] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Squad Provisioning</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="space-y-1 text-[10px] text-gray-500 font-medium">
                  <div>✓ Supabase Auth Setup</div>
                  <div>✓ Scrum Sprints Provisioned</div>
                  <div>✓ Role Capacity Balancer</div>
                </div>
              </div>

              {/* Character Illustration SVG */}
              <svg viewBox="0 0 400 320" className="w-full h-full relative z-20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="280" cy="50" r="14" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="2" />
                <path d="M280 42V50H286" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
                <rect x="60" y="165" width="200" height="10" rx="3" fill="#005B7F" />
                <rect x="75" y="175" width="6" height="85" fill="#334155" />
                <rect x="60" y="255" width="36" height="6" rx="2" fill="#334155" />
                <rect x="130" y="105" width="60" height="42" rx="3" fill="#64748B" stroke="#475569" strokeWidth="2" />
                <rect x="134" y="109" width="52" height="34" rx="2" fill="#E2E8F0" />
                <rect x="156" y="147" width="8" height="18" fill="#475569" />
                <rect x="148" y="163" width="24" height="4" rx="1" fill="#334155" />
                <rect x="42" y="155" width="24" height="60" rx="6" fill="#E2B13C" />
                <rect x="48" y="215" width="12" height="45" fill="#334155" />
                <path d="M60 195L110 205L160 250" stroke="#5B92A8" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M150 250L170 256" stroke="#1E293B" strokeWidth="10" strokeLinecap="round" />
                <path d="M55 140L80 195H50L45 150Z" fill="#334155" />
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
            <span>256-bit Encrypted Supabase Auth & Cloud Database</span>
          </div>
        </div>

        {/* RIGHT COLUMN: REGISTRATION FORM */}
        <div className="lg:col-span-6 p-8 lg:p-14 flex flex-col justify-center">
          
          <div className="max-w-md w-full mx-auto space-y-5">
            
            <div className="space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827]">
                {step === 1 ? 'Create an Account !!' : 'Workspace Setup'}
              </h2>
              <p className="text-xs sm:text-sm text-[#6B7280]">
                {step === 1 ? 'Join thousands of engineers saving 80% on sprint planning' : 'Configure your engineering roster parameters'}
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleNextStep} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Alex Rivera"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005B7F] focus:border-[#005B7F] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Work Email</label>
                  <input
                    type="email"
                    required
                    placeholder="you@company.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005B7F] focus:border-[#005B7F] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full px-3.5 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005B7F] focus:border-[#005B7F] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005B7F] focus:border-[#005B7F] outline-none"
                  />
                </div>

                <div className="pt-1 text-xs text-gray-500">
                  Already have an account?{' '}
                  <Link to="/login" className="font-semibold text-[#005B7F] hover:underline">
                    Sign in
                  </Link>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3 px-4 rounded-lg font-bold text-sm text-white bg-[#005B7F] hover:bg-[#004A66] shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>Continue to Workspace</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Organization / Squad Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Tech"
                    value={organization}
                    onChange={e => setOrganization(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005B7F] focus:border-[#005B7F] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Your Primary Role</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005B7F] focus:border-[#005B7F] outline-none bg-white"
                  >
                    <option value="Lead Software Engineer">Lead Software Engineer</option>
                    <option value="Frontend Developer (FE)">Frontend Developer (FE)</option>
                    <option value="Backend Developer (BE)">Backend Developer (BE)</option>
                    <option value="Database Architect (DB)">Database Architect (DB)</option>
                    <option value="Product Manager">Product Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Team Size</label>
                  <select
                    value={teamSize}
                    onChange={e => setTeamSize(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052CC] focus:border-[#005B7F] outline-none bg-white"
                  >
                    <option value="1-5 engineers">1 - 5 engineers (Startup)</option>
                    <option value="5-15 engineers">5 - 15 engineers (Growth Squad)</option>
                    <option value="15-50 engineers">15 - 50 engineers (Scale-up)</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    disabled={loading}
                    className="w-1/3 py-2.5 px-3 border border-gray-300 rounded-lg font-semibold text-xs text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-2/3 py-3 px-4 rounded-lg font-bold text-sm text-white bg-[#005B7F] hover:bg-[#004A66] shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Launch SprintX</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
