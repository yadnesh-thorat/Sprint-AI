import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ArrowLeft, 
  Layers, 
  Users, 
  Database,
  Lock,
  Mail,
  User as UserIcon
} from 'lucide-react';
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
          avatarColor: '#0052CC'
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
          to="/board"
          className="text-xs font-semibold text-[#0052CC] hover:underline"
        >
          Go to Workspace
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
              Agile Backlog &amp; Sprint Management
            </h3>
            <p className="text-xs text-[#5E6C84] leading-relaxed mb-6">
              Convert product requirement documents into epics, stories, and balanced task assignments.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded bg-white border border-[#DFE1E6] flex items-center justify-center text-[#0052CC] shrink-0 mt-0.5">
                  <Layers size={13} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#172B4D]">Structured Breakdown</div>
                  <div className="text-[11px] text-[#5E6C84] mt-0.5">Automated decomposition from raw specs into epics and stories with acceptance criteria.</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded bg-white border border-[#DFE1E6] flex items-center justify-center text-[#0052CC] shrink-0 mt-0.5">
                  <Users size={13} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#172B4D]">Role Balancing</div>
                  <div className="text-[11px] text-[#5E6C84] mt-0.5">Distributes workload across FE, BE, DB, and QA roles according to sprint velocity limits.</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded bg-white border border-[#DFE1E6] flex items-center justify-center text-[#0052CC] shrink-0 mt-0.5">
                  <ShieldCheck size={13} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#172B4D]">Tenant Security</div>
                  <div className="text-[11px] text-[#5E6C84] mt-0.5">PostgreSQL Row-Level Security ensures isolated workspace and squad data.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#DFE1E6] text-[11px] text-[#5E6C84]">
            Protected by Supabase Auth with enterprise-grade session encryption.
          </div>
        </div>

        {/* Right Column: Authentication Form */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          <div className="max-w-sm w-full mx-auto space-y-5">
            
            {/* Header Titles */}
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#172B4D]">
                {authMode === 'login' ? 'Sign In to Workspace' : 'Create Your Workspace Account'}
              </h2>
              <p className="text-xs text-[#5E6C84] mt-1">
                {authMode === 'login' 
                  ? 'Enter your credentials to access your sprint boards.' 
                  : 'Start planning sprints with structured requirement decomposition.'}
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {error}
              </div>
            )}

            {/* Segmented Mode Control */}
            <div className="grid grid-cols-2 bg-[#F4F5F7] p-0.5 rounded-md border border-[#DFE1E6]">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setError(null);
                }}
                className={`py-1.5 text-xs font-semibold rounded transition-colors ${
                  authMode === 'login'
                    ? 'bg-white text-[#0052CC] shadow-xs'
                    : 'text-[#5E6C84] hover:text-[#172B4D]'
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
                className={`py-1.5 text-xs font-semibold rounded transition-colors ${
                  authMode === 'signup'
                    ? 'bg-white text-[#0052CC] shadow-xs'
                    : 'text-[#5E6C84] hover:text-[#172B4D]'
                }`}
              >
                Register
              </button>
            </div>

            {/* Authentication Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Rivera"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#DFE1E6] rounded-md focus:ring-2 focus:ring-[#0052CC] focus:border-[#0052CC] bg-[#FAFBFC] focus:bg-white text-[#172B4D] transition-all"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="alex@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#DFE1E6] rounded-md focus:ring-2 focus:ring-[#0052CC] focus:border-[#0052CC] bg-[#FAFBFC] focus:bg-white text-[#172B4D] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#DFE1E6] rounded-md focus:ring-2 focus:ring-[#0052CC] focus:border-[#0052CC] bg-[#FAFBFC] focus:bg-white text-[#172B4D] font-mono transition-all"
                  />
                </div>
              )}

              {authMode === 'login' && (
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-[#5E6C84]">
                    <input
                      type="checkbox"
                      checked={keepSignedIn}
                      onChange={(e) => setKeepSignedIn(e.target.checked)}
                      className="rounded border-[#DFE1E6] text-[#0052CC] focus:ring-[#0052CC]"
                    />
                    <span>Remember me</span>
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2 px-4 rounded-md font-semibold text-xs text-white bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>{authMode === 'login' ? 'Sign In' : 'Create Account'}</span>
                )}
              </button>
            </form>

            <div className="text-center text-xs text-[#5E6C84]">
              {authMode === 'login' ? (
                <>
                  Need an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      setError(null);
                    }}
                    className="font-semibold text-[#0052CC] hover:underline cursor-pointer"
                  >
                    Register here
                  </button>
                </>
              ) : (
                <>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setError(null);
                    }}
                    className="font-semibold text-[#0052CC] hover:underline cursor-pointer"
                  >
                    Sign in here
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

