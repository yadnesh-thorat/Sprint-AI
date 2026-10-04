import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { 
  UserPlus, 
  Trash2, 
  ShieldCheck, 
  Users, 
  Gauge, 
  CheckCircle2, 
  ChevronRight, 
  Plus, 
  Building, 
  Briefcase, 
  AlertTriangle,
  KeyRound,
  Mail,
  Lock,
  Copy,
  Check,
  ShieldAlert,
  Eye,
  EyeOff,
  ExternalLink,
  Edit3,
  Save,
  X,
  Crown,
  Code2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ROLE_DETAILS = {
  FE: { label: 'Frontend Developer', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', defaultVelocity: 20 },
  BE: { label: 'Backend Developer', badge: 'bg-blue-50 text-blue-700 border-blue-200', defaultVelocity: 20 },
  DB: { label: 'Database Architect', badge: 'bg-amber-50 text-amber-700 border-amber-200', defaultVelocity: 15 },
  QA: { label: 'QA / Automation Engineer', badge: 'bg-purple-50 text-purple-700 border-purple-200', defaultVelocity: 20 },
  DevOps: { label: 'DevOps / SRE Specialist', badge: 'bg-rose-50 text-rose-700 border-rose-200', defaultVelocity: 15 },
  FS: { label: 'Full Stack Engineer', badge: 'bg-cyan-50 text-cyan-700 border-cyan-200', defaultVelocity: 20 },
  UX: { label: 'UI/UX Product Designer', badge: 'bg-pink-50 text-pink-700 border-pink-200', defaultVelocity: 15 },
  AI: { label: 'AI / ML Engineer', badge: 'bg-violet-50 text-violet-700 border-violet-200', defaultVelocity: 15 },
  PM: { label: 'Product Manager', badge: 'bg-purple-50 text-purple-700 border-purple-200', defaultVelocity: 10 },
  MGR: { label: 'Scrum Master', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', defaultVelocity: 10 },
  SUPER_ADMIN: { label: 'SprintX AI Creator & Super Admin', badge: 'bg-indigo-50 text-indigo-700 border-indigo-300 font-extrabold ring-1 ring-indigo-400/40 shadow-xs', defaultVelocity: 30 },
  CUSTOM: { label: 'Custom Specialist Role', badge: 'bg-teal-50 text-teal-700 border-teal-200', defaultVelocity: 20 },
};

export default function Team() {
  const { user } = useAuth();
  const [team, setTeam] = useState([]);
  const [newUser, setNewUser] = useState({ 
    name: '', 
    email: '',
    password: 'SprintX@' + Math.floor(1000 + Math.random() * 9000),
    permission: 'DEVELOPER',
    role: 'FE', 
    customRole: '', 
    customFieldKey: '', 
    customFieldValue: '',
    velocity: 20
  });
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [showCustomField, setShowCustomField] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [copiedCreds, setCopiedCreds] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Edit role & permission state
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    role: 'FE',
    permission: 'DEVELOPER',
    velocity: 20,
    customRole: '',
    isCustomRole: false,
    customFieldKey: '',
    customFieldValue: ''
  });

  // Custom Delete confirmation modal state (no browser alert/confirm)
  const [deleteTargetMember, setDeleteTargetMember] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchTeam();
  }, [user?.id]);

  const fetchTeam = async () => {
    if (!user?.id) {
      setTeam([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setTeam(data || []);
    } catch (error) {
      console.error('Failed to fetch team from database:', error);
      setTeam([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newUser.name.trim() || !newUser.email.trim()) return;
    setIsSubmitting(true);

    const assignedRole = isCustomRole && newUser.customRole.trim() 
      ? newUser.customRole.trim().toUpperCase() 
      : newUser.role;

    const memberEmail = newUser.email.trim().toLowerCase();
    const memberPassword = newUser.password.trim();
    const customFieldsObj = newUser.customFieldKey && newUser.customFieldValue 
      ? { [newUser.customFieldKey.trim()]: newUser.customFieldValue.trim() }
      : {};

    const newMemberPayload = {
      name: newUser.name.trim(),
      email: memberEmail,
      role: assignedRole,
      permission: newUser.permission,
      velocity: parseInt(newUser.velocity, 10) || 20,
      custom_fields: customFieldsObj,
      user_id: user?.id
    };

    try {
      // 1. Provision Auth Account in Supabase auth.users AND team_members table
      const { data: provisionedMember, error: rpcError } = await supabase.rpc('provision_team_member_auth', {
        p_manager_id: user?.id,
        p_name: newUser.name.trim(),
        p_email: memberEmail,
        p_password: memberPassword,
        p_role: assignedRole,
        p_permission: newUser.permission,
        p_velocity: parseInt(newUser.velocity, 10) || 20,
        p_custom_fields: customFieldsObj
      });

      if (rpcError) {
        console.warn('RPC provision notice, fallback to direct insert:', rpcError);
        const { data: insertedMember, error: dbError } = await supabase
          .from('team_members')
          .insert([newMemberPayload])
          .select()
          .single();

        if (dbError) {
          console.error('Database insert error:', dbError);
        } else if (insertedMember) {
          setTeam(prev => [...prev, insertedMember]);
        }
      } else if (provisionedMember) {
        setTeam(prev => [...prev, provisionedMember]);
      }

      // 2. Display copyable credentials card
      setCreatedCredentials({
        name: newUser.name.trim(),
        email: memberEmail,
        password: memberPassword,
        role: assignedRole,
        permission: newUser.permission,
        organization: user?.organization || 'SprintX Workspace'
      });

      // 3. Reset form
      setNewUser({ 
        name: '', 
        email: '',
        password: 'SprintX@' + Math.floor(1000 + Math.random() * 9000),
        permission: 'DEVELOPER',
        role: 'FE', 
        customRole: '', 
        customFieldKey: '', 
        customFieldValue: '', 
        velocity: 20 
      });
      setIsCustomRole(false);
      setShowCustomField(false);
    } catch (err) {
      console.error('Failed to add member:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyCredentialsText = () => {
    if (!createdCredentials) return;
    const text = `Welcome to ${createdCredentials.organization} on SprintX AI!
---------------------------------------------
Name: ${createdCredentials.name}
Login Email: ${createdCredentials.email}
Password: ${createdCredentials.password}
Role: ${createdCredentials.role}
Permission: ${createdCredentials.permission}
Login URL: ${window.location.origin}/login
---------------------------------------------`;
    navigator.clipboard.writeText(text);
    setCopiedCreds(true);
    setTimeout(() => setCopiedCreds(false), 2500);
  };

  const startEdit = (member) => {
    setEditingMemberId(member.id);
    const hasCustomKey = member.custom_fields && typeof member.custom_fields === 'object' ? Object.keys(member.custom_fields)[0] || '' : '';
    const hasCustomVal = hasCustomKey ? member.custom_fields[hasCustomKey] || '' : '';
    const isStandardRole = ['FE', 'BE', 'DB', 'QA', 'DevOps', 'FS', 'UX', 'AI', 'PM', 'MGR'].includes(member.role);

    setEditForm({
      name: member.name || '',
      email: member.email || '',
      role: isStandardRole ? member.role : 'CUSTOM',
      permission: member.permission || 'DEVELOPER',
      velocity: member.velocity || 20,
      customRole: isStandardRole ? '' : member.role,
      isCustomRole: !isStandardRole,
      customFieldKey: hasCustomKey,
      customFieldValue: hasCustomVal,
    });
  };

  const cancelEdit = () => {
    setEditingMemberId(null);
  };

  const handleSaveEdit = async (memberId) => {
    if (!editForm.name.trim()) return;
    setIsSubmitting(true);
    
    const updatedRole = editForm.isCustomRole && editForm.customRole.trim()
      ? editForm.customRole.trim().toUpperCase()
      : editForm.role;

    const customFieldsObj = editForm.customFieldKey && editForm.customFieldValue
      ? { [editForm.customFieldKey.trim()]: editForm.customFieldValue.trim() }
      : {};

    const updatePayload = {
      name: editForm.name.trim(),
      role: updatedRole,
      permission: editForm.permission,
      velocity: parseInt(editForm.velocity, 10) || 20,
      custom_fields: customFieldsObj
    };

    try {
      const { data, error } = await supabase
        .from('team_members')
        .update(updatePayload)
        .eq('id', memberId)
        .select()
        .single();

      if (error) {
        console.warn('DB update notice:', error);
      }

      setTeam(prev => prev.map(m => m.id === memberId ? { ...m, ...updatePayload, ...(data || {}) } : m));
      setEditingMemberId(null);
    } catch (err) {
      console.error('Failed to update member:', err);
      setTeam(prev => prev.map(m => m.id === memberId ? { ...m, ...updatePayload } : m));
      setEditingMemberId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteMember = async () => {
    if (!deleteTargetMember) return;
    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', deleteTargetMember.id);

      if (error) console.warn('Delete warning:', error);
      setTeam(prev => prev.filter(m => m.id !== deleteTargetMember.id));
    } catch (err) {
      console.error('Delete error:', err);
      setTeam(prev => prev.filter(m => m.id !== deleteTargetMember.id));
    } finally {
      setIsDeleting(false);
      setDeleteTargetMember(null);
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
          <span className="text-[#172B4D] font-bold">Squad Roles & Permissions</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#172B4D] tracking-tight">
              Squad Roles & Access Permission Manager
            </h1>
            <p className="text-xs text-[#5E6C84] mt-0.5">
              Onboard engineers, set login passwords, define access permissions (Lead, Developer, Viewer), and assign sprint roles.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
              <Building size={13} className="text-blue-600" />
              <span>{user?.organization || 'SprintX Workspace'}</span>
            </div>
            <span className="text-xs font-bold text-[#0052CC] bg-[#DEEBFF] px-3 py-1.5 rounded-md border border-[#B3D4FF] flex items-center gap-1.5 shadow-2xs">
              <Users size={14} />
              {team.length} Squad Members
            </span>
          </div>
        </div>

      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-6 bg-[#F4F5F7] flex-1">
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Onboard Member Form */}
          <div className="lg:col-span-1 bg-white p-5 rounded-xl border border-[#DFE1E6] shadow-xs h-fit space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <UserPlus size={18} className="text-[#0052CC]" />
              <h2 className="text-sm font-bold text-[#172B4D]">Onboard Squad Member</h2>
            </div>

            <form onSubmit={handleAdd} className="space-y-3.5">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-[#5E6C84] uppercase tracking-wider mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Elena Kozlova"
                  value={newUser.name}
                  onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full py-2 px-3 text-xs border border-[#DFE1E6] rounded-md bg-[#FAFBFC] focus:bg-white focus:ring-2 focus:ring-[#0052CC] text-[#172B4D]"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-[#5E6C84] uppercase tracking-wider mb-1">
                  Member Login Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute inset-y-0 left-2.5 my-auto text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. elena@company.com"
                    value={newUser.email}
                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full py-2 pl-8 pr-3 text-xs border border-[#DFE1E6] rounded-md bg-[#FAFBFC] focus:bg-white focus:ring-2 focus:ring-[#0052CC] text-[#172B4D]"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#5E6C84] uppercase tracking-wider">
                    Initial Password <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setNewUser({ ...newUser, password: 'SprintX@' + Math.floor(1000 + Math.random() * 9000) })}
                    className="text-[10px] text-[#0052CC] font-bold hover:underline cursor-pointer"
                  >
                    Regenerate
                  </button>
                </div>
                <div className="relative">
                  <Lock size={14} className="absolute inset-y-0 left-2.5 my-auto text-gray-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newUser.password}
                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full py-2 pl-8 pr-8 text-xs border border-[#DFE1E6] rounded-md bg-[#FAFBFC] focus:bg-white focus:ring-2 focus:ring-[#0052CC] text-[#172B4D] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Access Permission */}
              <div>
                <label className="block text-xs font-bold text-[#5E6C84] uppercase tracking-wider mb-1">
                  Access Permission Level
                </label>
                <select
                  value={newUser.permission}
                  onChange={e => setNewUser({ ...newUser, permission: e.target.value })}
                  className="w-full py-2 px-3 text-xs border border-[#DFE1E6] rounded-md bg-[#FAFBFC] focus:bg-white focus:ring-2 focus:ring-[#0052CC] text-[#172B4D]"
                >
                  <option value="DEVELOPER">Contributor / Developer (Move assigned tasks)</option>
                  <option value="LEAD">Squad Lead / Manager (Full workspace management)</option>
                  <option value="VIEWER">Stakeholder / Viewer (Read-only observation)</option>
                </select>
              </div>

              {/* Specialized Role */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#5E6C84] uppercase tracking-wider">
                    Specialized Role
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomRole(!isCustomRole);
                      if (!isCustomRole) setNewUser(prev => ({ ...prev, role: 'CUSTOM' }));
                      else setNewUser(prev => ({ ...prev, role: 'FE' }));
                    }}
                    className="text-[11px] font-bold text-[#0052CC] hover:underline cursor-pointer"
                  >
                    {isCustomRole ? '← Standard Roles' : '+ Custom Role'}
                  </button>
                </div>

                {!isCustomRole ? (
                  <select
                    value={newUser.role}
                    onChange={e => {
                      if (e.target.value === 'CUSTOM') {
                        setIsCustomRole(true);
                      } else {
                        setNewUser({ ...newUser, role: e.target.value });
                      }
                    }}
                    className="w-full py-2 px-3 text-xs border border-[#DFE1E6] rounded-md bg-[#FAFBFC] focus:bg-white focus:ring-2 focus:ring-[#0052CC] text-[#172B4D]"
                  >
                    <optgroup label="Engineering Squad">
                      <option value="FE">Frontend Developer (FE)</option>
                      <option value="BE">Backend Developer (BE)</option>
                      <option value="DB">Database Architect (DB)</option>
                      <option value="QA">QA / Test Automation (QA)</option>
                      <option value="DevOps">DevOps & Cloud SRE (DevOps)</option>
                      <option value="FS">Full Stack Engineer (FS)</option>
                      <option value="AI">AI / LLM Engineer (AI)</option>
                    </optgroup>
                    <optgroup label="Product & Agile">
                      <option value="UX">UI/UX Product Designer (UX)</option>
                      <option value="PM">Product Manager (PM)</option>
                      <option value="MGR">Scrum Master / Manager (MGR)</option>
                    </optgroup>
                    <optgroup label="Custom Specification">
                      <option value="CUSTOM">+ Add Custom Role / Code...</option>
                    </optgroup>
                  </select>
                ) : (
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      required
                      placeholder="e.g. SRE, Security, iOS, DataEng"
                      value={newUser.customRole}
                      onChange={e => setNewUser({ ...newUser, customRole: e.target.value })}
                      className="w-full py-2 px-3 text-xs border border-blue-400 ring-2 ring-blue-100 rounded-md bg-white focus:ring-[#0052CC] text-[#172B4D]"
                      autoFocus
                    />
                    <p className="text-[10px] text-gray-500">Enter custom specialized role code or title.</p>
                  </div>
                )}
              </div>

              {/* Custom Fields Section */}
              <div className="pt-1">
                {!showCustomField ? (
                  <button
                    type="button"
                    onClick={() => setShowCustomField(true)}
                    className="text-xs font-bold text-[#0052CC] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Add Custom Field / Metadata</span>
                  </button>
                ) : (
                  <div className="p-3 bg-[#FAFBFC] border border-[#DFE1E6] rounded-md space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#5E6C84]">
                      <span>Custom Field</span>
                      <button 
                        type="button" 
                        onClick={() => setShowCustomField(false)} 
                        className="text-gray-400 hover:text-gray-600 text-xs cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Key (e.g. Timezone, Level)"
                        value={newUser.customFieldKey}
                        onChange={e => setNewUser({ ...newUser, customFieldKey: e.target.value })}
                        className="py-1.5 px-2 text-xs border border-[#DFE1E6] rounded bg-white"
                      />
                      <input
                        type="text"
                        placeholder="Value (e.g. UTC-5, Senior)"
                        value={newUser.customFieldValue}
                        onChange={e => setNewUser({ ...newUser, customFieldValue: e.target.value })}
                        className="py-1.5 px-2 text-xs border border-[#DFE1E6] rounded bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded font-medium text-xs text-white bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] transition-colors cursor-pointer disabled:opacity-50"
              >
                <Plus size={14} />
                <span>{isSubmitting ? 'Onboarding Member...' : 'Add Member & Generate Login'}</span>
              </button>
            </form>
          </div>

          {/* Right Column: Squad List & Capacity Meters */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Newly Created Credentials Card */}
            {createdCredentials && (
              <div className="bg-[#FAFBFC] border border-[#B3D4FF] rounded-lg p-4 shadow-xs relative">
                <button
                  onClick={() => setCreatedCredentials(null)}
                  className="absolute top-3 right-3 text-[#6B778C] hover:text-[#172B4D] text-xs p-1"
                >
                  ✕
                </button>
                <div className="flex items-center gap-2 text-[#0052CC] font-semibold text-sm mb-1">
                  <KeyRound size={16} />
                  <span>Member Onboarded — Login Credentials Ready</span>
                </div>
                <p className="text-xs text-[#5E6C84] mb-3">
                  Share these credentials with your team member so they can immediately sign in at <span className="font-medium text-[#0052CC]">/login</span>:
                </p>

                <div className="bg-white rounded border border-[#DFE1E6] font-mono text-xs p-3 space-y-1.5 text-[#172B4D]">
                  <div className="flex justify-between items-center py-0.5 border-b border-[#EBECF0]">
                    <span className="text-[#5E6C84] font-sans">Name:</span>
                    <span className="font-semibold">{createdCredentials.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-[#EBECF0]">
                    <span className="text-[#5E6C84] font-sans">Email:</span>
                    <span className="font-semibold text-[#0052CC]">{createdCredentials.email}</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-[#EBECF0]">
                    <span className="text-[#5E6C84] font-sans">Password:</span>
                    <span className="font-semibold bg-[#FFF0B3] text-[#172B4D] px-1.5 py-0.5 rounded">{createdCredentials.password}</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-[#5E6C84] font-sans">Role / Permission:</span>
                    <span className="font-semibold">{createdCredentials.role} ({createdCredentials.permission})</span>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={copyCredentialsText}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded text-xs font-medium transition-colors ${
                      copiedCreds
                        ? 'bg-[#006644] text-white'
                        : 'bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] text-white'
                    }`}
                  >
                    {copiedCreds ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedCreds ? 'Credentials Copied to Clipboard!' : 'Copy Full Login Details'}</span>
                  </button>
                  <Link
                    to="/login"
                    target="_blank"
                    className="flex items-center gap-1 px-3 py-1.5 bg-white border border-[#DFE1E6] text-[#172B4D] hover:bg-[#F4F5F7] text-xs font-medium rounded transition-colors"
                  >
                    <span>Test Login</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-[#5E6C84] uppercase tracking-wider">
                Sprint 1 Capacity & Active Squad
              </h2>
              <span className="text-xs text-[#006644] font-bold flex items-center gap-1">
                <CheckCircle2 size={13} />
                Zero Overload Detected
              </span>
            </div>

            {team.map((member, idx) => {
              const roleInfo = ROLE_DETAILS[member.role] || {
                label: `${member.role} Specialist`,
                badge: 'bg-teal-50 text-teal-700 border-teal-200',
                defaultVelocity: 20
              };
              // Mock load allocation: 13-18 points
              const currentLoad = 8 + ((idx * 5) % 11);
              const maxLoad = 20;
              const percent = Math.round((currentLoad / maxLoad) * 100);

              return (
                <React.Fragment key={member.id}>
                  <div
                    className="bg-white rounded-xl p-4 border border-[#DFE1E6] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#4C9AFF] transition-all"
                  >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0052CC] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                      {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#172B4D] flex items-center gap-2">
                        <span>{member.name}</span>
                        {member.permission === 'LEAD' ? (
                          <span className="text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-full shadow-2xs">
                            Squad Lead
                          </span>
                        ) : member.permission === 'VIEWER' ? (
                          <span className="text-[10px] font-bold bg-slate-50 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full shadow-2xs">
                            Viewer
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full shadow-2xs">
                            Developer
                          </span>
                        )}
                      </div>
                      {member.email && (
                        <div className="text-xs text-[#5E6C84]">{member.email}</div>
                      )}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase ${roleInfo.badge}`}>
                          {roleInfo.label} ({member.role})
                        </span>
                        {member.customField && (
                          <span className="text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-200 px-1.5 py-0.5 rounded">
                            {member.customField}
                          </span>
                        )}
                        {member.custom_fields && typeof member.custom_fields === 'object' && Object.entries(member.custom_fields).map(([k, v]) => (
                          <span key={k} className="text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.5 rounded">
                            {k}: {String(v)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-2xs">
                      <CheckCircle2 size={13} className="text-emerald-600" />
                      <span>Active in Sprint</span>
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(member)}
                        className="p-1.5 text-gray-400 hover:text-[#0052CC] hover:bg-blue-50 rounded transition-colors cursor-pointer"
                        title="Edit Role & Permissions"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteTargetMember(member)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                        title="Remove member"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* INLINE EDIT TRAY (When editing) */}
                {editingMemberId === member.id && (
                  <div className="bg-slate-50 border border-blue-200 rounded-xl p-4 shadow-xs -mt-2 space-y-3 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between text-xs font-bold text-[#172B4D] pb-2 border-b border-gray-200">
                      <div className="flex items-center gap-1.5 text-[#0052CC]">
                        <Edit3 size={14} />
                        <span>Edit Role & Permissions</span>
                      </div>
                      <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                        <X size={15} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Name */}
                      <div>
                        <label className="block text-[10px] font-bold text-[#5E6C84] uppercase tracking-wider mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={editForm.name}
                          onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full py-1.5 px-2.5 text-xs border border-gray-300 rounded bg-white focus:ring-2 focus:ring-[#0052CC]"
                        />
                      </div>

                      {/* Access Permission Level */}
                      <div>
                        <label className="block text-[10px] font-bold text-[#5E6C84] uppercase tracking-wider mb-1">
                          Permission Level
                        </label>
                        <select
                          value={editForm.permission}
                          onChange={e => setEditForm({ ...editForm, permission: e.target.value })}
                          className="w-full py-1.5 px-2 text-xs border border-gray-300 rounded bg-white focus:ring-2 focus:ring-[#0052CC]"
                        >
                          <option value="DEVELOPER">Contributor / Developer</option>
                          <option value="LEAD">Squad Lead / Manager</option>
                          <option value="VIEWER">Stakeholder / Viewer</option>
                        </select>
                      </div>

                      {/* Specialized Role */}
                      <div>
                        <label className="block text-[10px] font-bold text-[#5E6C84] uppercase tracking-wider mb-1">
                          Role Assignment
                        </label>
                        {!editForm.isCustomRole ? (
                          <div className="flex gap-1">
                            <select
                              value={editForm.role}
                              onChange={e => {
                                if (e.target.value === 'CUSTOM') {
                                  setEditForm({ ...editForm, isCustomRole: true, role: 'CUSTOM' });
                                } else {
                                  setEditForm({ ...editForm, role: e.target.value });
                                }
                              }}
                              className="w-full py-1.5 px-2 text-xs border border-gray-300 rounded bg-white focus:ring-2 focus:ring-[#0052CC]"
                            >
                              <option value="FE">Frontend (FE)</option>
                              <option value="BE">Backend (BE)</option>
                              <option value="DB">Database (DB)</option>
                              <option value="QA">QA / Testing (QA)</option>
                              <option value="DevOps">DevOps / SRE</option>
                              <option value="FS">Full Stack (FS)</option>
                              <option value="UX">UI/UX Designer</option>
                              <option value="AI">AI / ML Engineer</option>
                              <option value="PM">Product Manager</option>
                              <option value="MGR">Scrum Master</option>
                              <option value="CUSTOM">+ Custom Role...</option>
                            </select>
                          </div>
                        ) : (
                          <div className="flex gap-1">
                            <input
                              type="text"
                              placeholder="Custom Role"
                              value={editForm.customRole}
                              onChange={e => setEditForm({ ...editForm, customRole: e.target.value })}
                              className="w-full py-1.5 px-2 text-xs border border-blue-400 rounded bg-white"
                            />
                            <button
                              type="button"
                              onClick={() => setEditForm({ ...editForm, isCustomRole: false, role: 'FE' })}
                              className="text-[10px] text-gray-500 hover:text-gray-800 px-1"
                            >
                              List
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="pt-1">
                      <label className="block text-[10px] font-bold text-[#5E6C84] uppercase tracking-wider mb-1">
                        Custom Field / Metadata (Key & Value)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Key (e.g. Focus)"
                          value={editForm.customFieldKey}
                          onChange={e => setEditForm({ ...editForm, customFieldKey: e.target.value })}
                          className="py-1.5 px-2 text-xs border border-gray-300 rounded bg-white"
                        />
                        <input
                          type="text"
                          placeholder="Value (e.g. Cloud Infra)"
                          value={editForm.customFieldValue}
                          onChange={e => setEditForm({ ...editForm, customFieldValue: e.target.value })}
                          className="py-1.5 px-2 text-xs border border-gray-300 rounded bg-white"
                        />
                      </div>
                    </div>

                    {/* Footer buttons */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-200 rounded transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(member.id)}
                        disabled={isSubmitting}
                        className="flex items-center gap-1 px-4 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold rounded shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Save size={13} />
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </div>
                )}
                </React.Fragment>
              );
            })}

            {team.length === 0 && (
              <div className="bg-white p-8 rounded-xl border border-[#DFE1E6] text-center space-y-3 shadow-xs">
                <div className="w-12 h-12 bg-blue-50 text-[#0052CC] rounded-full flex items-center justify-center mx-auto">
                  <Users size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#172B4D]">No squad members added yet</h3>
                  <p className="text-xs text-[#5E6C84] mt-1 max-w-sm mx-auto">
                    Use the form on the left to onboard engineers with custom permissions and login credentials for your agile squad.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* CUSTOM CONFIRM DELETE MODAL (Replaces browser confirm) */}
      {/* ========================================================= */}
      {deleteTargetMember && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-[#DFE1E6] w-full max-w-md overflow-hidden animate-in fade-in duration-150">
            <div className="p-5">
              <div className="w-9 h-9 rounded bg-red-50 text-red-600 flex items-center justify-center mb-3">
                <AlertTriangle size={18} />
              </div>
              <h3 className="text-sm font-semibold text-[#172B4D]">Remove Squad Member</h3>
              <p className="text-xs text-[#5E6C84] mt-2 leading-relaxed">
                Are you sure you want to remove <strong className="text-[#172B4D] font-medium">{deleteTargetMember.name}</strong> ({deleteTargetMember.role})? This will unassign any active sprint backlog tasks assigned to them.
              </p>
            </div>

            <div className="px-5 py-3.5 bg-[#FAFBFC] border-t border-[#EBECF0] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTargetMember(null)}
                disabled={isDeleting}
                className="px-3.5 py-1.5 text-xs font-medium text-[#42526E] hover:bg-[#EBECF0] rounded transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteMember}
                disabled={isDeleting}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDeleting ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Trash2 size={13} />
                    <span>Remove Member</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
