import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft, 
  Layers, 
  Users, 
  Database,
  Building2,
  Lock
} from 'lucide-react';
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
    <div className="min-h-screen bg-[#FAFBFC] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans antialiased text-[#172B4D]">
      
      {/* Top Header / Back Navigation */}
      <div className="w-full max-w-4xl mb-4 flex items-center justify-between">
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5E6C84] hover:text-[#172B4D] transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Home</span>
        </Link>

        <Link
          to="/login"
          className="text-xs font-semibold text-[#0052CC] hover:underline"
        >
          Sign In
        </Link>
      </div>

      {/* Main Container Card */}
      <div className="w-full max-w-4xl bg-white rounded-lg border border-[#DFE1E6] shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[520px]">
        
        {/* Left Column: Product Information & Value Props */}
        <div className="md:col-span-5 bg-[#F4F5F7] p-8 border-b md:border-b-0 md:border-r border-[#DFE1E6] flex flex-col justify-between">
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-8">
              <img 
                src={logo} 
                className="h-7 w-7 object-contain" 
                alt="SprintX Logo" 
              />
              <span className="text-[#172B4D] font-bold text-base tracking-tight">SprintX</span>
            </Link>

            <h3 className="text-base font-bold text-[#172B4D] mb-2">
              Get Started with SprintX
            </h3>
            <p className="text-xs text-[#5E6C84] leading-relaxed mb-6">
              Create a workspace to import requirements, generate sprint tickets, and track execution with your team.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded bg-white border border-[#DFE1E6] flex items-center justify-center text-[#0052CC] shrink-0 mt-0.5">
                  <Layers size={13} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#172B4D]">Instant Backlog Generation</div>
                  <div className="text-[11px] text-[#5E6C84] mt-0.5">Transforms software requirements specifications into structured epics and user stories.</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded bg-white border border-[#DFE1E6] flex items-center justify-center text-[#0052CC] shrink-0 mt-0.5">
                  <Users size={13} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#172B4D]">Capacity-Balanced Sprints</div>
                  <div className="text-[11px] text-[#5E6C84] mt-0.5">Allocates tasks across team members without exceeding velocity limits.</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded bg-white border border-[#DFE1E6] flex items-center justify-center text-[#0052CC] shrink-0 mt-0.5">
                  <ShieldCheck size={13} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#172B4D]">Multi-Tenant Security</div>
                  <div className="text-[11px] text-[#5E6C84] mt-0.5">PostgreSQL Row-Level Security keeps your workspace and specifications isolated.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#DFE1E6] text-[11px] text-[#5E6C84]">
            Step {step} of 2: {step === 1 ? 'Account details' : 'Workspace configuration'}
          </div>
        </div>

        {/* RIGHT COLUMN: REGISTRATION FORM */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          <div className="max-w-sm w-full mx-auto space-y-5">
            
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#172B4D]">
                {step === 1 ? 'Create Your Account' : 'Configure Your Workspace'}
              </h2>
              <p className="text-xs text-[#5E6C84] mt-1">
                {step === 1 
                  ? 'Enter your name and work email to get started.' 
                  : 'Set up your company workspace name and team details.'}
              </p>
            </div>


            {error && (
              <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {error}
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleNextStep} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#172B4D] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Alex Rivera"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#DFE1E6] rounded-md focus:ring-2 focus:ring-[#0052CC] focus:border-[#0052CC] bg-[#FAFBFC] focus:bg-white text-[#172B4D] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#172B4D] mb-1">Work Email</label>
                  <input
                    type="email"
                    required
                    placeholder="alex@company.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#DFE1E6] rounded-md focus:ring-2 focus:ring-[#0052CC] focus:border-[#0052CC] bg-[#FAFBFC] focus:bg-white text-[#172B4D] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#172B4D] mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full px-3 pr-9 py-2 text-xs border border-[#DFE1E6] rounded-md focus:ring-2 focus:ring-[#0052CC] focus:border-[#0052CC] bg-[#FAFBFC] focus:bg-white text-[#172B4D] font-mono transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#172B4D] mb-1">Confirm Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#DFE1E6] rounded-md focus:ring-2 focus:ring-[#0052CC] focus:border-[#0052CC] bg-[#FAFBFC] focus:bg-white text-[#172B4D] font-mono transition-all"
                  />
                </div>

                <div className="pt-1 text-xs text-[#5E6C84]">
                  Already registered?{' '}
                  <Link to="/login" className="font-semibold text-[#0052CC] hover:underline">
                    Sign in here
                  </Link>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-2 px-4 rounded-md font-semibold text-xs text-white bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Continue to Workspace Setup</span>
                  <ArrowRight size={14} />
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#172B4D] mb-1">Company / Organization Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Technologies"
                    value={organization}
                    onChange={e => setOrganization(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#DFE1E6] rounded-md focus:ring-2 focus:ring-[#0052CC] focus:border-[#0052CC] bg-[#FAFBFC] focus:bg-white text-[#172B4D] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#172B4D] mb-1">Your Primary Role</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#DFE1E6] rounded-md focus:ring-2 focus:ring-[#0052CC] focus:border-[#0052CC] bg-[#FAFBFC] focus:bg-white text-[#172B4D]"
                  >
                    <option value="Lead Software Engineer">Engineering Lead</option>
                    <option value="Frontend Developer (FE)">Frontend Engineer (FE)</option>
                    <option value="Backend Developer (BE)">Backend Engineer (BE)</option>
                    <option value="Database Architect (DB)">Database Architect (DB)</option>
                    <option value="Product Manager">Product Manager</option>
                    <option value="Scrum Master">Scrum Master</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#172B4D] mb-1">Engineering Squad Size</label>
                  <select
                    value={teamSize}
                    onChange={e => setTeamSize(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#DFE1E6] rounded-md focus:ring-2 focus:ring-[#0052CC] focus:border-[#0052CC] bg-[#FAFBFC] focus:bg-white text-[#172B4D]"
                  >
                    <option value="1-5 engineers">1 - 5 engineers</option>
                    <option value="5-15 engineers">5 - 15 engineers</option>
                    <option value="15-50 engineers">15 - 50 engineers</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    disabled={loading}
                    className="w-1/3 py-2 px-3 border border-[#DFE1E6] rounded-md font-semibold text-xs text-[#42526E] bg-white hover:bg-slate-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-2/3 py-2 px-4 rounded-md font-semibold text-xs text-white bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Complete Setup</span>
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
