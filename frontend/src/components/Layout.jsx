import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileUp, 
  LogOut, 
  Menu, 
  X as CloseIcon, 
  Plus, 
  Search, 
  Bell, 
  HelpCircle, 
  Settings, 
  ChevronDown, 
  ChevronRight, 
  ChevronLeft, 
  Layers, 
  Kanban, 
  GitBranch, 
  BarChart3, 
  Compass, 
  Sliders, 
  Sparkles,
  CheckCircle2,
  Bookmark,
  CheckSquare,
  AlertCircle,
  Zap,
  Building,
  Building2,
  UserCheck,
  Home,
  ArrowLeft,
  ShieldCheck,
  Edit3,
  Palette,
  Check,
  FolderPlus,
  FolderKanban,
  Server,
  Key,
  Globe,
  Activity,
  Radio,
  Save,
  Copy,
  Download,
  ExternalLink,
  Database,
  Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import logo from '../assets/logo.png';

const isUUID = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export default function Layout({ children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [projectsDropdownOpen, setProjectsDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  
  // Create New Project Modal state
  const [createProjectModalOpen, setCreateProjectModalOpen] = useState(false);
  const [newProjectForm, setNewProjectForm] = useState({ name: '', deadline: '' });
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  // Delete Project confirmation state
  const [deleteConfirmProject, setDeleteConfirmProject] = useState(null);
  const [isDeletingProject, setIsDeletingProject] = useState(false);

  // Company Profile Modal state
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [companyActiveTab, setCompanyActiveTab] = useState('general');
  const [copiedTenantId, setCopiedTenantId] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    organization: '',
    role: '',
    website: '',
    slug: '',
    teamSize: '5-15 engineers',
    industry: 'Fintech & SaaS',
    estimationScale: 'Fibonacci (1, 2, 3, 5, 8, 13)',
    sprintCadence: '2 Weeks (Standard)',
    defaultVelocity: 20,
    avatarColor: '#0052CC'
  });
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [companySaveSuccess, setCompanySaveSuccess] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);

  // Notifications state
  const [hasUnread, setHasUnread] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Create issue modal state
  const [issueType, setIssueType] = useState('Story');
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDesc, setIssueDesc] = useState('');
  const [issueRole, setIssueRole] = useState('FE');
  const [issuePoints, setIssuePoints] = useState(3);
  const [isSubmittingIssue, setIsSubmittingIssue] = useState(false);
  const [createIssueError, setCreateIssueError] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { 
    user, 
    userProjects, 
    activeProjectId, 
    activeProject, 
    setActiveProjectId, 
    createProject, 
    deleteProject,
    refreshProjects, 
    updateProfile, 
    logout 
  } = useAuth();
  const userMenuRef = useRef(null);
  const notifMenuRef = useRef(null);
  const projectDropdownRef = useRef(null);

  // Keyboard shortcut listener (/ for search, c for create, b for board, t for team, u for upload, esc to close)
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        if (e.key === 'Escape') {
          setIsSearchOpen(false);
          setNotificationsOpen(false);
          setHelpModalOpen(false);
          setUserDropdownOpen(false);
          setCreateModalOpen(false);
        }
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        setCreateModalOpen(true);
      } else if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        navigate('/board');
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        navigate('/team');
      } else if (e.key === 'u' || e.key === 'U') {
        e.preventDefault();
        navigate('/upload');
      } else if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setHelpModalOpen(true);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setNotificationsOpen(false);
        setHelpModalOpen(false);
        setUserDropdownOpen(false);
        setCreateModalOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  // Live Platform Visitor Logging to PostgreSQL
  useEffect(() => {
    try {
      supabase.rpc('log_platform_visit', {
        p_path: location.pathname || '/',
        p_referrer: document.referrer || 'Direct'
      }).then(() => {}).catch(() => {});
    } catch (e) {
      // Ignore background tracking notice
    }
  }, [location.pathname]);

  // Search filter - queries live tasks from Supabase scoped to current user
  useEffect(() => {
    if (!searchQuery.trim() || !user?.id) {
      setSearchResults([]);
      return;
    }

    const q = searchQuery.toLowerCase();
    
    async function searchLive() {
      try {
        const { data: dbProjects } = await supabase
          .from('projects')
          .select(`
            id, name,
            epics (
              id,
              stories (
                id,
                tasks (
                  id, title, status, required_role
                )
              )
            )
          `)
          .eq('user_id', user.id);

        let userTasks = [];
        (dbProjects || []).forEach(p => {
          (p.epics || []).forEach(e => {
            (e.stories || []).forEach(s => {
              (s.tasks || []).forEach(t => {
                userTasks.push({
                  id: typeof t.id === 'string' && t.id.startsWith('SPX') ? t.id : `SPX-${t.id?.slice(0, 4) || 'TKT'}`,
                  title: t.title,
                  role: t.required_role || 'FE',
                  status: t.status || 'TODO',
                  path: '/board'
                });
              });
            });
          });
        });

        const matched = userTasks.filter(t => 
          t.title?.toLowerCase().includes(q) || 
          t.id?.toLowerCase().includes(q) ||
          t.role?.toLowerCase().includes(q) ||
          t.status?.toLowerCase().includes(q)
        );
        setSearchResults(matched);
      } catch (err) {
        console.error('Search error:', err);
        setSearchResults([]);
      }
    }

    searchLive();
  }, [searchQuery, user?.id]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(event.target)) {
        setProjectsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateNewProject = async (e) => {
    e.preventDefault();
    if (!newProjectForm.name.trim() || !user?.id) return;
    setIsCreatingProject(true);
    try {
      await createProject({
        name: newProjectForm.name.trim(),
        deadline: newProjectForm.deadline || null
      });
      setNewProjectForm({ name: '', deadline: '' });
      setCreateProjectModalOpen(false);
      setProjectsDropdownOpen(false);
      navigate('/board');
    } catch (err) {
      console.error('Failed to create new project board:', err);
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleQuickCreateIssue = async (e) => {
    e.preventDefault();
    if (!issueTitle.trim() || !user?.id) return;
    setIsSubmittingIssue(true);
    setCreateIssueError(null);

    try {
      // Use active project or find/create
      let projectId = (isUUID(activeProjectId) ? activeProjectId : null) || (isUUID(activeProject?.id) ? activeProject.id : null);
      if (!projectId) {
        let { data: existingProjects } = await supabase
          .from('projects')
          .select('id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })
          .limit(1);
        if (existingProjects?.[0]?.id && isUUID(existingProjects[0].id)) {
          projectId = existingProjects[0].id;
        }
      }

      if (!projectId) {
        const { data: newProj, error: projErr } = await supabase
          .from('projects')
          .insert([{ user_id: user.id, name: `${user.organization || 'SprintX'} Core Software (SPX)` }])
          .select()
          .single();
        if (projErr) throw projErr;
        projectId = newProj?.id;
        await refreshProjects();
        if (projectId) setActiveProjectId(projectId);
      }

      // Find or create active epic
      let epicId = null;
      let { data: existingEpics } = await supabase
        .from('epics')
        .select('id')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true })
        .limit(1);
      if (existingEpics?.[0]?.id && isUUID(existingEpics[0].id)) {
        epicId = existingEpics[0].id;
      }

      if (!epicId) {
        const { data: newEpic, error: epicErr } = await supabase
          .from('epics')
          .insert([{ project_id: projectId, title: 'Core Features & Architecture' }])
          .select()
          .single();
        if (epicErr) throw epicErr;
        epicId = newEpic?.id;
      }

      // Find or create story
      let storyId = null;
      let { data: existingStories } = await supabase
        .from('stories')
        .select('id')
        .eq('epic_id', epicId)
        .order('created_at', { ascending: true })
        .limit(1);
      if (existingStories?.[0]?.id && isUUID(existingStories[0].id)) {
        storyId = existingStories[0].id;
      }

      if (!storyId) {
        const { data: newStory, error: storyErr } = await supabase
          .from('stories')
          .insert([{ epic_id: epicId, title: 'Sprint Backlog Item', description: 'Auto-generated sprint container' }])
          .select()
          .single();
        if (storyErr) throw storyErr;
        storyId = newStory?.id;
      }

      // Insert Task
      const { error: taskErr } = await supabase.from('tasks').insert([{
        story_id: storyId,
        title: issueTitle.trim(),
        description: issueDesc.trim() || `Generated ${issueType}`,
        status: 'TODO',
        required_role: issueRole,
        story_points: issueType === 'Bug' ? 2 : 3,
        estimated_hours: 6,
      }]);

      if (taskErr) throw taskErr;

      setIssueTitle('');
      setIssueDesc('');
      setCreateModalOpen(false);
      
      // Refresh board if on board page
      if (location.pathname === '/board') {
        window.location.reload();
      } else {
        navigate('/board');
      }
    } catch (err) {
      console.error('Failed to create quick issue:', err);
      setCreateIssueError(err?.message || 'Failed to save ticket to database.');
    } finally {
      setIsSubmittingIssue(false);
    }
  };

  // Auto-populate companyForm when opening modal or when user profile updates
  useEffect(() => {
    if (user && companyModalOpen) {
      setCompanyForm({
        organization: user.organization || '',
        role: user.role || '',
        website: user.website || '',
        slug: user.slug || (user.organization ? user.organization.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'sprintx-core'),
        teamSize: user.teamSize || '5-15 engineers',
        industry: user.industry || 'Fintech & SaaS',
        estimationScale: user.estimationScale || 'Fibonacci (1, 2, 3, 5, 8, 13)',
        sprintCadence: user.sprintCadence || '2 Weeks (Standard)',
        defaultVelocity: user.defaultVelocity || 20,
        avatarColor: user.avatarColor || '#0052CC'
      });
      setCompanyActiveTab('general');
    }
  }, [user, companyModalOpen]);

  const handleSaveCompanyProfile = async (e) => {
    e.preventDefault();
    if (!companyForm.organization.trim()) return;
    setIsSavingCompany(true);
    setCompanySaveSuccess(false);

    try {
      const trimmedOrg = companyForm.organization.trim();
      const trimmedRole = companyForm.role.trim() || user?.role || 'Software Engineer';
      const trimmedSlug = companyForm.slug.trim() || trimmedOrg.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      // 1. Update Supabase user metadata
      await updateProfile({
        organization: trimmedOrg,
        role: trimmedRole,
        website: companyForm.website.trim(),
        slug: trimmedSlug,
        teamSize: companyForm.teamSize,
        industry: companyForm.industry,
        estimationScale: companyForm.estimationScale,
        sprintCadence: companyForm.sprintCadence,
        defaultVelocity: parseInt(companyForm.defaultVelocity, 10) || 20,
        avatarColor: companyForm.avatarColor
      });

      // 2. Update active project name in DB if exists for user
      if (user?.id) {
        await supabase
          .from('projects')
          .update({ name: `${trimmedOrg} Core Software (SPX)` })
          .eq('user_id', user.id);
        await refreshProjects();
      }

      setCompanySaveSuccess(true);
      setTimeout(() => {
        setCompanySaveSuccess(false);
        setCompanyModalOpen(false);
      }, 900);
    } catch (err) {
      console.error('Failed to update company profile:', err);
    } finally {
      setIsSavingCompany(false);
    }
  };

  const handleExportWorkspaceBackup = () => {
    const backupData = {
      workspace: {
        organization: companyForm.organization,
        role: companyForm.role,
        industry: companyForm.industry,
        teamSize: companyForm.teamSize,
        website: companyForm.website,
        slug: companyForm.slug,
        estimationScale: companyForm.estimationScale,
        sprintCadence: companyForm.sprintCadence,
        defaultVelocity: companyForm.defaultVelocity,
        avatarColor: companyForm.avatarColor,
        exportedAt: new Date().toISOString(),
        tenantId: user?.id,
        userEmail: user?.email
      },
      projects: userProjects
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(companyForm.organization || 'workspace').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-settings.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteProject = async (projectId) => {
    if (!projectId) return;
    setIsDeletingProject(true);
    try {
      await deleteProject(projectId);
      setDeleteConfirmProject(null);
      navigate('/board');
    } catch (err) {
      console.error('Failed to delete project:', err);
    } finally {
      setIsDeletingProject(false);
    }
  };

  const isAdminRoute = location.pathname.startsWith('/admin');

  const adminNavItems = [
    { 
      section: 'PLATFORM GOVERNANCE',
      items: [
        { path: '/admin?tab=overview', label: 'Overview & Telemetry', icon: <BarChart3 size={18} />, badge: 'Live' },
        { path: '/admin?tab=api_keys', label: 'AI & PDF API Keys', icon: <Sparkles size={18} />, badge: 'AI' },
        { path: '/admin?tab=tenants', label: 'Registered Workspaces', icon: <Users size={18} />, badge: null },
        { path: '/admin?tab=rls_security', label: 'Database & RLS Audit', icon: <Database size={18} />, badge: 'RLS' },
      ]
    }
  ];

  const navItems = [
    { 
      section: 'PLANNING',
      items: [
        { path: '/board', label: 'Active Sprints', icon: <Kanban size={18} />, badge: 'Live' },
        { path: '/upload', label: 'SRS AI Ingest', icon: <FileUp size={18} />, badge: 'AI' },
      ]
    },
    { 
      section: 'TEAM & WORKSPACE',
      items: [
        { path: '/team', label: 'Squad & Roles', icon: <Users size={18} />, badge: null },
      ]
    },
    ...(user?.isSuperAdmin ? [
      { 
        section: 'SYSTEM & ADMIN',
        items: [
          { 
            path: '/admin', 
            label: 'Master Control Plane', 
            icon: <ShieldCheck size={18} className="text-indigo-600" />, 
            badge: 'HQ' 
          },
        ]
      }
    ] : []),
    { 
      section: 'WORKSPACE',
      items: [
        { path: '/', label: 'Home & Showcase', icon: <Home size={18} />, badge: null },
      ]
    }
  ];

  const currentNavItems = isAdminRoute ? adminNavItems : navItems;

  return (
    <div className="min-h-screen flex flex-col font-sans antialiased selection:bg-[#DEEBFF] selection:text-[#0747A6] bg-[#F4F5F7] text-[#172B4D]">
      
      {/* 1. GLOBAL TOP NAVIGATION BAR */}
      <header className="h-14 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-40 bg-white border-b border-[#EBECF0] text-[#172B4D] shadow-xs">
        
        {/* Left Section: App Switcher + Logo + Control Action */}
        <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
          
          {/* Mobile hamburger */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="sm:hidden p-1.5 rounded-md transition-colors text-[#5E6C84] hover:bg-[#EBECF0]"
          >
            <Menu size={20} />
          </button>

          {/* App Switcher */}
          <div 
            className="hidden sm:flex items-center justify-center w-8 h-8 rounded-md cursor-pointer transition-colors text-[#5E6C84] hover:bg-[#EBECF0] hover:text-[#172B4D]" 
            title="Workspace Switcher"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="5" r="2.2" />
              <circle cx="12" cy="5" r="2.2" />
              <circle cx="19" cy="5" r="2.2" />
              <circle cx="5" cy="12" r="2.2" />
              <circle cx="12" cy="12" r="2.2" />
              <circle cx="19" cy="12" r="2.2" />
              <circle cx="5" cy="19" r="2.2" />
              <circle cx="12" cy="19" r="2.2" />
              <circle cx="19" cy="19" r="2.2" />
            </svg>
          </div>

          {/* Brand Logo & Name */}
          <Link to={isAdminRoute ? "/admin" : "/board"} className="flex items-center gap-2 pr-1 group">
            <img 
              src={logo} 
              className="h-7 w-7 object-contain group-hover:scale-105 transition-transform duration-200" 
              alt="SprintX AI Logo" 
            />
            <span className="font-black text-lg tracking-tight hidden md:inline text-slate-950">
              SprintX <span className="text-blue-500">AI</span>
            </span>
          </Link>

          {isAdminRoute ? (
            <div className="flex items-center gap-2 ml-1 sm:ml-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono text-[11px] font-bold shadow-2xs">
                <ShieldCheck size={13} className="text-indigo-600" />
                <span>SUPER ADMIN HQ</span>
              </span>
              <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-medium text-slate-600">ap-south-1 • Latency 10ms</span>
              </div>
            </div>
          ) : (
            <>
              {/* Primary "+ Create" Action Button */}
              <button
                onClick={() => setCreateModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] text-white text-xs font-bold shadow-xs transition-all cursor-pointer ml-1 sm:ml-2"
              >
                <Plus size={15} />
                <span>Create</span>
              </button>

              {/* Quick Nav Links (Visible on Large Screens) */}
              <div className="hidden xl:flex items-center gap-1 text-xs font-medium text-[#42526E] ml-2">
                <Link to="/board" className="px-2.5 py-1.5 rounded hover:bg-[#EBECF0] hover:text-[#172B4D] transition-colors font-semibold">
                  Active Sprints
                </Link>
                <Link to="/team" className="px-2.5 py-1.5 rounded hover:bg-[#EBECF0] hover:text-[#172B4D] transition-colors">
                  Teams
                </Link>
                <Link to="/upload" className="px-2.5 py-1.5 rounded hover:bg-[#EBECF0] hover:text-[#172B4D] transition-colors">
                  AI Automations
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Right Section: Search + Notifications + Profile */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          
          {/* Global Search Box with Live Results Dropdown */}
          <div className="relative hidden md:block" ref={searchContainerRef}>
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
              <Search size={14} />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder={isAdminRoute ? "Search tenants, projects..." : "Search tickets..."}
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="w-36 lg:w-48 pl-8 pr-7 py-1 text-xs rounded-md transition-all bg-[#FAFBFC] border border-[#DFE1E6] text-[#172B4D] hover:bg-[#EBECF0] focus:bg-white focus:w-64 focus:ring-2 focus:ring-[#0052CC] focus:border-[#0052CC]"
            />
            {searchQuery ? (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="absolute inset-y-0 right-0 pr-2 flex items-center text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                ✕
              </button>
            ) : (
              <span className="absolute inset-y-0 right-0 pr-2 flex items-center text-[10px] text-gray-400 pointer-events-none font-mono">/</span>
            )}

            {/* Live Search Results Dropdown */}
            {isSearchOpen && searchResults.length > 0 && (
              <div className="absolute left-0 mt-2 w-72 bg-white border border-[#DFE1E6] rounded-xl shadow-xl py-2 z-50 animate-in fade-in duration-100">
                <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Matching Tickets</div>
                {searchResults.map(ticket => (
                  <Link
                    key={ticket.id}
                    to={ticket.path}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center justify-between px-3 py-2 hover:bg-[#F4F5F7] text-xs transition-colors"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="font-bold text-[#0052CC] text-[11px]">{ticket.id}</div>
                      <div className="text-[#172B4D] truncate text-xs">{ticket.title}</div>
                    </div>
                    <span className="text-[9px] font-extrabold bg-[#DEEBFF] text-[#0052CC] px-2 py-0.5 rounded uppercase">
                      {ticket.status || 'TODO'}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Notification Bell */}
          <div className="relative" ref={notifMenuRef}>
            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-1.5 text-[#5E6C84] hover:bg-[#EBECF0] hover:text-[#172B4D] rounded-full transition-colors cursor-pointer" 
              title="Notifications"
            >
              <Bell size={17} />
              {hasUnread && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF5630] rounded-full ring-2 ring-white" />
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-[#DFE1E6] rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100 divide-y divide-gray-100">
                <div className="px-4 py-2.5 flex items-center justify-between bg-slate-50/70 rounded-t-xl">
                  <span className="text-xs font-bold text-[#172B4D]">Sprint Notifications</span>
                  {hasUnread && (
                    <button
                      onClick={() => {
                        setHasUnread(false);
                        setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
                      }}
                      className="text-[11px] font-semibold text-[#0052CC] hover:underline cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className={`px-4 py-2.5 hover:bg-slate-50 transition-colors ${n.unread ? 'bg-blue-50/30' : ''}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-xs font-bold text-[#172B4D]">{n.title}</div>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-[#5E6C84] mt-0.5">{n.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Help & Shortcuts */}
          <button 
            onClick={() => setHelpModalOpen(true)}
            className="p-1.5 text-[#5E6C84] hover:bg-[#EBECF0] hover:text-[#172B4D] rounded-full transition-colors hidden sm:inline-flex cursor-pointer" 
            title="Shortcuts & Agile Docs"
          >
            <HelpCircle size={17} />
          </button>

          {/* User Profile Avatar with Fast Direct Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full hover:bg-[#EBECF0] border border-transparent hover:border-[#DFE1E6] transition-all cursor-pointer group"
              title="Account & Company Dashboard"
            >
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-xs relative transition-transform group-hover:scale-105"
                style={{ backgroundColor: user?.avatarColor || '#0052CC' }}
              >
                {user?.initials || 'EX'}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-[#172B4D] leading-none truncate max-w-[90px]">
                  {user?.name || 'Engineer'}
                </span>
                <span className="text-[10px] text-[#5E6C84] leading-tight font-medium truncate max-w-[90px]">
                  {user?.organization || 'Company'}
                </span>
              </div>
              <ChevronDown size={14} className="text-[#5E6C84] group-hover:text-[#172B4D] transition-transform duration-150" />
            </button>

            {/* Rich Fast Profile Dropdown Menu */}
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-[#DFE1E6] rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100 divide-y divide-gray-100">
                
                {/* User Info Header */}
                <div className="px-4 py-3 bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-t-xl">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm"
                      style={{ backgroundColor: user?.avatarColor || '#0052CC' }}
                    >
                      {user?.initials || 'EX'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-[#172B4D] truncate flex items-center gap-1.5">
                        {user?.name || 'Engineer'}
                        <span className="bg-[#DEEBFF] text-[#0052CC] font-bold px-1.5 py-0.5 rounded text-[10px]">
                          {user?.role?.includes('FE') ? 'Frontend' : user?.role?.includes('BE') ? 'Backend' : 'Lead'}
                        </span>
                      </div>
                      <div className="text-xs text-[#5E6C84] truncate">{user?.email}</div>
                    </div>
                  </div>

                  {/* Direct Company Workspace Card with Edit Option */}
                  <div className="mt-3 p-2.5 bg-white border border-blue-100 rounded-lg shadow-2xs hover:border-blue-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div 
                          className="w-7 h-7 rounded-lg text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0"
                          style={{ backgroundColor: user?.avatarColor || '#0052CC' }}
                        >
                          <Building size={14} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[11px] font-bold text-slate-800 truncate">
                            {user?.organization || 'My Agile Team'}
                          </div>
                          <div className="text-[9px] text-blue-600 font-medium">Company Workspace</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            setCompanyForm({
                              organization: user?.organization || 'SprintX Agile Team',
                              role: user?.role || 'Software Engineer',
                              teamSize: user?.teamSize || '5-15 engineers',
                              industry: user?.raw?.user_metadata?.industry || 'Fintech & SaaS',
                              avatarColor: user?.avatarColor || '#0052CC'
                            });
                            setCompanyModalOpen(true);
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-[10px] font-bold rounded border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Edit Company Profile"
                        >
                          <Edit3 size={11} />
                          <span>Edit</span>
                        </button>
                        <Link
                          to="/board"
                          onClick={() => setUserDropdownOpen(false)}
                          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded shadow-xs transition-colors shrink-0 flex items-center gap-1"
                        >
                          <span>Board</span>
                          <ChevronRight size={10} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fast Navigation Links */}
                <div className="py-1.5">
                  <div className="px-3.5 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Quick Navigation
                  </div>

                  <button 
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      setCompanyForm({
                        organization: user?.organization || 'SprintX Agile Team',
                        role: user?.role || 'Software Engineer',
                        teamSize: user?.teamSize || '5-15 engineers',
                        industry: user?.raw?.user_metadata?.industry || 'Fintech & SaaS',
                        avatarColor: user?.avatarColor || '#0052CC'
                      });
                      setCompanyModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-[#172B4D] hover:bg-blue-50/70 hover:text-blue-700 transition-colors rounded-md mx-1 text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Building2 size={15} className="text-blue-600 group-hover:scale-110 transition-transform" />
                      <span className="font-semibold">Company & Workspace Profile</span>
                    </div>
                    <span className="text-[10px] bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700 font-bold px-1.5 py-0.5 rounded">Settings</span>
                  </button>

                  <Link 
                    to="/board" 
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2 text-xs text-[#172B4D] hover:bg-[#F4F5F7] transition-colors rounded-md mx-1"
                  >
                    <div className="flex items-center gap-2.5">
                      <Kanban size={15} className="text-[#0052CC]" />
                      <span className="font-semibold">Active Sprints Board</span>
                    </div>
                    <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded">SPX</span>
                  </Link>

                  <Link 
                    to="/team" 
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2 text-xs text-[#172B4D] hover:bg-[#F4F5F7] transition-colors rounded-md mx-1"
                  >
                    <div className="flex items-center gap-2.5">
                      <Users size={15} className="text-emerald-600" />
                      <span className="font-semibold">Team & Capacity Allocator</span>
                    </div>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded">Roster</span>
                  </Link>

                  <Link 
                    to="/upload" 
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2 text-xs text-[#172B4D] hover:bg-[#F4F5F7] transition-colors rounded-md mx-1"
                  >
                    <div className="flex items-center gap-2.5">
                      <Sparkles size={15} className="text-purple-600" />
                      <span className="font-semibold">AI Requirements Ingest</span>
                    </div>
                    <span className="text-[10px] bg-purple-50 text-purple-700 font-bold px-1.5 py-0.5 rounded">AI</span>
                  </Link>

                  {user?.isSuperAdmin && (
                    <Link 
                      to="/admin" 
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center justify-between px-3.5 py-2 text-xs text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100/70 transition-colors rounded-md mx-1 border border-indigo-200/60"
                    >
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck size={15} className="text-indigo-600" />
                        <span className="font-bold">Super Admin Control Plane</span>
                      </div>
                      <span className="text-[10px] bg-indigo-600 text-white font-extrabold px-1.5 py-0.5 rounded">HQ</span>
                    </Link>
                  )}

                  <Link 
                    to="/" 
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-600 hover:bg-[#F4F5F7] transition-colors rounded-md mx-1"
                  >
                    <Home size={15} className="text-slate-400" />
                    <span>Product Showcase & Home</span>
                  </Link>
                </div>

                {/* Logout Button */}
                <div className="p-1.5 bg-gray-50/50 rounded-b-xl">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. BODY LAYOUT: SIDEBAR + MAIN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Desktop Sidebar */}
        <aside 
          className={`hidden sm:flex flex-col transition-all duration-300 relative flex-shrink-0 select-none bg-[#FAFBFC] border-r border-[#EBECF0] text-[#172B4D] ${isSidebarCollapsed ? 'w-16' : 'w-64'}`}
        >
          {isAdminRoute ? (
            /* Super Admin Platform Authority Header Widget */
            <div className="p-3 border-b border-[#EBECF0] bg-white flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                  <ShieldCheck size={18} />
                </div>
                {!isSidebarCollapsed && (
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-[#172B4D] truncate leading-tight">Master Control Plane</div>
                    <div className="text-[10px] text-indigo-600 font-semibold truncate">Platform Authority</div>
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
            </div>
          ) : (
            /* Project Header Widget with Fast Switcher Dropdown */
            <div className="p-3 border-b border-[#EBECF0] relative" ref={projectDropdownRef}>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    if (isSidebarCollapsed) {
                      setIsSidebarCollapsed(false);
                      setProjectsDropdownOpen(true);
                    } else {
                      setProjectsDropdownOpen(!projectsDropdownOpen);
                    }
                  }}
                  className="flex items-center gap-2.5 min-w-0 flex-1 p-1 -ml-1 rounded-lg hover:bg-[#EBECF0] transition-colors text-left group cursor-pointer"
                  title="Switch company project board"
                >
                  <div 
                    className="w-8 h-8 rounded-lg text-white font-black text-xs flex items-center justify-center shadow-xs flex-shrink-0 transition-transform group-hover:scale-105"
                    style={{ backgroundColor: user?.avatarColor || '#0052CC' }}
                  >
                    {activeProject?.name ? activeProject.name.slice(0, 3).toUpperCase() : 'SPX'}
                  </div>
                  {!isSidebarCollapsed && (
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-[#172B4D] truncate leading-tight flex items-center justify-between">
                        <span className="truncate">{activeProject?.name || user?.organization || 'SprintX Agile Team'}</span>
                        <ChevronDown size={14} className={`text-[#5E6C84] group-hover:text-[#172B4D] transition-transform duration-200 ml-1 shrink-0 ${projectsDropdownOpen ? 'rotate-180' : ''}`} />
                      </div>
                      <div className="text-[10px] text-[#6B778C] truncate">
                        {userProjects.length > 1 ? `${userProjects.length} Boards • Click to switch` : 'Software Project (Scrum)'}
                      </div>
                    </div>
                  )}
                </button>

                {/* Collapse toggle */}
                <button
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors shrink-0 ml-1"
                  title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
              </div>

              {/* Projects Switcher Dropdown Menu */}
              {projectsDropdownOpen && !isSidebarCollapsed && (
                <div className="absolute left-2 right-2 top-14 bg-white border border-[#DFE1E6] rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100 divide-y divide-gray-100">
                  
                  {/* Header */}
                  <div className="px-3 py-1.5 flex items-center justify-between bg-slate-50/80 rounded-t-lg">
                    <div className="flex items-center gap-1.5">
                      <FolderKanban size={13} className="text-[#0052CC]" />
                      <span className="text-[11px] font-bold text-[#172B4D]">Company Project Boards</span>
                    </div>
                    <span className="text-[10px] font-extrabold bg-blue-100 text-[#0052CC] px-1.5 py-0.5 rounded">
                      {userProjects.length || 1}
                    </span>
                  </div>

                  {/* Projects List */}
                  <div className="py-1 max-h-60 overflow-y-auto divide-y divide-gray-50">
                    {userProjects.length === 0 ? (
                      <div className="px-3 py-3 text-center">
                        <p className="text-xs text-gray-500 mb-2">No projects created yet.</p>
                        <button
                          type="button"
                          onClick={() => {
                            setProjectsDropdownOpen(false);
                            setCreateProjectModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0052CC] text-white text-xs font-semibold rounded-md hover:bg-[#0747A6] transition-colors"
                        >
                          <Plus size={12} />
                          Create First Project
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Unified Portfolio View Option */}
                        <button
                          type="button"
                          onClick={() => {
                            setActiveProjectId('ALL');
                            setProjectsDropdownOpen(false);
                            navigate('/board');
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors cursor-pointer border-b border-gray-100 ${
                            activeProjectId === 'ALL' ? 'bg-indigo-50/80 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-[#172B4D]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                            <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black shrink-0 ${
                              activeProjectId === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700'
                            }`}>
                              <Layers size={13} />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold truncate leading-tight">All Projects (Unified Portfolio)</div>
                              <div className="text-[10px] text-gray-500 truncate">Combined sprint board</div>
                            </div>
                          </div>
                          {activeProjectId === 'ALL' && (
                            <Check size={14} className="text-indigo-600 shrink-0" />
                          )}
                        </button>

                        {userProjects.map(proj => {
                          const isCurrent = (activeProjectId === proj.id) || (!activeProjectId && userProjects[0]?.id === proj.id);
                          const initials = proj.name ? proj.name.slice(0, 3).toUpperCase() : 'SPX';
                          return (
                            <div
                              key={proj.id}
                              className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors group ${
                                isCurrent ? 'bg-blue-50/80 text-[#0052CC]' : 'hover:bg-slate-50 text-[#172B4D]'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveProjectId(proj.id);
                                  setProjectsDropdownOpen(false);
                                  navigate('/board');
                                }}
                                className="flex items-center gap-2.5 min-w-0 flex-1 pr-2 text-left cursor-pointer"
                              >
                                <div 
                                  className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black shrink-0 ${
                                    isCurrent ? 'bg-[#0052CC] text-white' : 'bg-slate-200 text-slate-700'
                                  }`}
                                >
                                  {initials}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-bold truncate leading-tight">{proj.name}</div>
                                  <div className="text-[10px] text-gray-500 truncate">
                                    {proj.deadline ? `Target: ${proj.deadline}` : 'Scrum Active Sprint'}
                                  </div>
                                </div>
                                {isCurrent && (
                                  <Check size={14} className="text-[#0052CC] shrink-0" />
                                )}
                              </button>

                              {/* Delete Project Action */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setProjectsDropdownOpen(false);
                                  setDeleteConfirmProject(proj);
                                }}
                                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100 cursor-pointer ml-1"
                                title={`Delete project "${proj.name}"`}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>

                  {/* Bottom Action: Create Project */}
                  <div className="p-1.5 bg-gray-50/50 space-y-1 rounded-b-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setProjectsDropdownOpen(false);
                        setCreateProjectModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold text-[#0052CC] hover:bg-blue-100/60 rounded-md transition-colors cursor-pointer"
                    >
                      <FolderPlus size={14} />
                      <span>+ Create New Project Board</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setProjectsDropdownOpen(false);
                        setCompanyForm({
                          organization: user?.organization || 'SprintX Agile Team',
                          role: user?.role || 'Software Engineer',
                          teamSize: user?.teamSize || '5-15 engineers',
                          industry: user?.raw?.user_metadata?.industry || 'Fintech & SaaS',
                          avatarColor: user?.avatarColor || '#0052CC'
                        });
                        setCompanyModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 rounded-md transition-colors cursor-pointer"
                    >
                      <Building size={13} />
                      <span>Company Workspace Settings</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sidebar Nav Items */}
          <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
            {currentNavItems.map((group, idx) => (
              <div key={idx}>
                {!isSidebarCollapsed && (
                  <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#6B778C]">
                    {group.section}
                  </div>
                )}
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = isAdminRoute
                      ? (location.pathname + location.search === item.path) || (item.path === '/admin?tab=overview' && location.pathname === '/admin' && (!location.search || location.search === '?tab=overview'))
                      : location.pathname === item.path || (location.pathname === '/dashboard' && item.path === '/upload');
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        title={isSidebarCollapsed ? item.label : undefined}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          isActive
                            ? isAdminRoute
                              ? 'bg-indigo-50 text-indigo-700 font-bold border-l-3 border-indigo-600 shadow-2xs'
                              : 'bg-[#E6EFFC] text-[#0052CC] font-bold'
                            : isAdminRoute
                              ? 'text-[#42526E] hover:bg-indigo-50/50 hover:text-indigo-900'
                              : 'text-[#42526E] hover:bg-[#EBECF0] hover:text-[#172B4D]'
                        } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                      >
                        <span className={isActive ? (isAdminRoute ? 'text-indigo-600' : 'text-[#0052CC]') : (isAdminRoute ? 'text-[#5E6C84]' : 'text-[#5E6C84]')}>
                          {item.icon}
                        </span>
                        {!isSidebarCollapsed && (
                          <span className="flex-1 truncate">{item.label}</span>
                        )}
                        {!isSidebarCollapsed && item.badge && (
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                            isAdminRoute 
                              ? 'bg-indigo-100 text-indigo-700 font-bold' 
                              : 'bg-[#DEEBFF] text-[#0052CC]'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Sidebar Status */}
          {!isSidebarCollapsed && (
            <div className="p-3 border-t text-[11px] flex items-center justify-between border-[#EBECF0] bg-white/70 text-[#6B778C]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {isAdminRoute ? 'Super Admin Live' : 'Cloud Sync Active'}
              </span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 font-bold">
                v2.4
              </span>
            </div>
          )}
        </aside>

        {/* Mobile Slide-Over Drawer */}
        {isMobileMenuOpen && (
          <div className="sm:hidden fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="relative w-64 max-w-[80%] bg-[#FAFBFC] h-full shadow-2xl flex flex-col z-10">
              <div className="p-4 border-b border-[#EBECF0] flex items-center justify-between bg-white">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-[#0052CC] flex items-center justify-center text-white font-bold text-xs">SPX</div>
                  <span className="font-bold text-sm text-[#172B4D]">SprintX AI</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-gray-400">
                  <CloseIcon size={18} />
                </button>
              </div>
              <div className="p-3 space-y-1 flex-1">
                <Link 
                  to="/board" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="flex items-center gap-3 px-3 py-2.5 rounded text-sm text-[#172B4D] hover:bg-[#EBECF0]"
                >
                  <Kanban size={18} />
                  <span>Active Sprints</span>
                </Link>
                <Link 
                  to="/upload" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="flex items-center gap-3 px-3 py-2.5 rounded text-sm text-[#172B4D] hover:bg-[#EBECF0]"
                >
                  <FileUp size={18} />
                  <span>SRS Ingest (AI)</span>
                </Link>
                <Link 
                  to="/team" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="flex items-center gap-3 px-3 py-2.5 rounded text-sm text-[#172B4D] hover:bg-[#EBECF0]"
                >
                  <Users size={18} />
                  <span>Team Allocator</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Workspace */}
        <main className="flex-1 min-w-0 overflow-y-auto bg-white flex flex-col">
          {children}
        </main>
      </div>

      {/* ========================================================= */}
      {/* 3. MODAL: CREATE ISSUE DIALOG */}
      {/* ========================================================= */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-[#DFE1E6] w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#EBECF0] flex items-center justify-between bg-[#FAFBFC]">
              <div>
                <h3 className="font-bold text-base text-[#172B4D]">Create Issue</h3>
                <p className="text-xs text-[#5E6C84]">Project: <span className="font-semibold text-[#0052CC]">SprintX Core (SPX)</span></p>
              </div>
              <button 
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <CloseIcon size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleQuickCreateIssue} className="p-6 space-y-4">
              {createIssueError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium flex items-center justify-between">
                  <span>{createIssueError}</span>
                  <button type="button" onClick={() => setCreateIssueError(null)} className="text-red-400 hover:text-red-600">✕</button>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#5E6C84] uppercase tracking-wider mb-1">
                    Issue Type
                  </label>
                  <select
                    value={issueType}
                    onChange={e => setIssueType(e.target.value)}
                    className="block w-full py-2 px-3 text-xs border border-[#DFE1E6] rounded-md bg-[#FAFBFC] focus:bg-white focus:ring-2 focus:ring-[#0052CC] text-[#172B4D]"
                  >
                    <option value="Story">Story</option>
                    <option value="Task">Task</option>
                    <option value="Bug">Bug</option>
                    <option value="Epic">Epic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5E6C84] uppercase tracking-wider mb-1">
                    Required Role
                  </label>
                  <select
                    value={issueRole}
                    onChange={e => setIssueRole(e.target.value)}
                    className="block w-full py-2 px-3 text-xs border border-[#DFE1E6] rounded-md bg-[#FAFBFC] focus:bg-white focus:ring-2 focus:ring-[#0052CC] text-[#172B4D]"
                  >
                    <optgroup label="Engineering Roles">
                      <option value="FE">Frontend (FE)</option>
                      <option value="BE">Backend (BE)</option>
                      <option value="DB">Database (DB)</option>
                      <option value="QA">QA / Testing (QA)</option>
                      <option value="DevOps">DevOps / Cloud</option>
                      <option value="FS">Full Stack (FS)</option>
                      <option value="AI">AI / ML (AI)</option>
                    </optgroup>
                    <optgroup label="Product Roles">
                      <option value="UX">UI/UX Designer</option>
                      <option value="PM">Product Manager</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5E6C84] uppercase tracking-wider mb-1">
                  Summary / Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement OAuth2 Refresh Token Rotation"
                  value={issueTitle}
                  onChange={e => setIssueTitle(e.target.value)}
                  className="block w-full py-2 px-3 text-xs border border-[#DFE1E6] rounded-md bg-[#FAFBFC] focus:bg-white focus:ring-2 focus:ring-[#0052CC] text-[#172B4D]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5E6C84] uppercase tracking-wider mb-1">
                  Description / Acceptance Criteria
                </label>
                <textarea
                  rows={3}
                  placeholder="Given a valid session token, when it expires, then rotate without logging out the user..."
                  value={issueDesc}
                  onChange={e => setIssueDesc(e.target.value)}
                  className="block w-full py-2 px-3 text-xs border border-[#DFE1E6] rounded-md bg-[#FAFBFC] focus:bg-white focus:ring-2 focus:ring-[#0052CC] text-[#172B4D]"
                />
              </div>

              <div className="pt-3 border-t border-[#EBECF0] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingIssue}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#0052CC] hover:bg-[#0747A6] rounded-md shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmittingIssue ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus size={14} />
                      <span>Create Issue</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. MODAL: HELP & KEYBOARD SHORTCUTS */}
      {/* ========================================================= */}
      {helpModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-[#DFE1E6] w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#EBECF0] flex items-center justify-between bg-[#FAFBFC]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0052CC] flex items-center justify-center font-bold">
                  <HelpCircle size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#172B4D]">Help & Shortcuts</h3>
                  <p className="text-[11px] text-[#5E6C84]">SprintX Agile Workspace Guide</p>
                </div>
              </div>
              <button 
                onClick={() => setHelpModalOpen(false)}
                className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <CloseIcon size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              <div>
                <h4 className="text-xs font-bold text-[#5E6C84] uppercase tracking-wider mb-2.5">Global Keyboard Shortcuts</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[#172B4D] font-medium">Search tickets</span>
                    <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded text-[11px] font-mono shadow-xs">/</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[#172B4D] font-medium">Create issue</span>
                    <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded text-[11px] font-mono shadow-xs">C</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[#172B4D] font-medium">Active Sprints</span>
                    <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded text-[11px] font-mono shadow-xs">B</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[#172B4D] font-medium">Team Allocator</span>
                    <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded text-[11px] font-mono shadow-xs">T</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[#172B4D] font-medium">SRS AI Ingest</span>
                    <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded text-[11px] font-mono shadow-xs">U</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[#172B4D] font-medium">Close modals</span>
                    <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded text-[11px] font-mono shadow-xs">ESC</kbd>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <h4 className="text-xs font-bold text-[#5E6C84] uppercase tracking-wider mb-2">Agile & Sprint Guidelines</h4>
                <div className="space-y-2 text-xs text-[#42526E]">
                  <p className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0052CC] mt-1.5 flex-shrink-0" />
                    <span><strong>Continuous Flow:</strong> Move tickets seamlessly across TODO, IN PROGRESS, IN REVIEW, and DONE.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                    <span><strong>Role Balancing:</strong> Assign tasks to dedicated roles (FE, BE, DB, QA) to avoid bottlenecks on the Team page.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                    <span><strong>Automated Ingestion:</strong> Use AI Ingest on the Upload tab to transform raw documents directly into epics and stories.</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-[#EBECF0] flex justify-end">
              <button
                onClick={() => setHelpModalOpen(false)}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#0052CC] hover:bg-[#0747A6] rounded-md transition-colors cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. MODAL: COMPANY & WORKSPACE PROFILE (ENTERPRISE SETTINGS) */}
      {/* ========================================================= */}
      {companyModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#DFE1E6] w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#EBECF0] flex items-center justify-between bg-gradient-to-r from-slate-50 via-blue-50/30 to-indigo-50/20 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl text-white flex items-center justify-center font-bold shadow-xs flex-shrink-0"
                  style={{ backgroundColor: companyForm.avatarColor || '#0052CC' }}
                >
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#172B4D]">Company & Workspace Settings</h3>
                  <p className="text-[11px] text-[#5E6C84]">Manage organization metadata, agile standards, and tenant security</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setCompanyModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <CloseIcon size={18} />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-[#EBECF0] px-6 bg-slate-50/60 flex-shrink-0">
              {[
                { id: 'general', label: 'Organization & Brand', icon: <Building size={13} /> },
                { id: 'agile', label: 'Agile & Squad Standards', icon: <Sliders size={13} /> },
                { id: 'workspace', label: 'Workspace ID & Data', icon: <ShieldCheck size={13} /> },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCompanyActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 py-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                    companyActiveTab === tab.id
                      ? 'border-[#0052CC] text-[#0052CC] bg-white font-bold'
                      : 'border-transparent text-[#5E6C84] hover:text-[#172B4D] hover:border-gray-300'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveCompanyProfile} className="p-6 space-y-5 overflow-y-auto flex-1">
              
              {/* TAB 1: GENERAL & BRAND IDENTITY */}
              {companyActiveTab === 'general' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div>
                    <label className="block text-xs font-bold text-[#5E6C84] uppercase tracking-wider mb-1.5">
                      Company / Workspace Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Building size={14} className="absolute inset-y-0 left-3 my-auto text-gray-400 pointer-events-none" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Acme Cloud Corp"
                        value={companyForm.organization}
                        onChange={e => setCompanyForm({ ...companyForm, organization: e.target.value })}
                        className="w-full py-2.5 pl-9 pr-3 text-xs border border-[#DFE1E6] rounded-lg bg-[#FAFBFC] focus:bg-white focus:ring-2 focus:ring-[#0052CC] text-[#172B4D] font-medium"
                      />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">This title appears across your navigation bar and agile sprint boards.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-[#5E6C84] uppercase tracking-wider mb-1.5">
                        Manager Title / Role
                      </label>
                      <div className="relative">
                        <UserCheck size={14} className="absolute inset-y-0 left-3 my-auto text-gray-400 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="e.g. Squad Lead & Architect"
                          value={companyForm.role}
                          onChange={e => setCompanyForm({ ...companyForm, role: e.target.value })}
                          className="w-full py-2.5 pl-9 pr-3 text-xs border border-[#DFE1E6] rounded-lg bg-[#FAFBFC] focus:bg-white focus:ring-2 focus:ring-[#0052CC] text-[#172B4D] font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#5E6C84] uppercase tracking-wider mb-1.5">
                        Workspace Slug
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-3 my-auto text-xs font-mono text-gray-400 pointer-events-none">/</span>
                        <input
                          type="text"
                          placeholder="acme-sprint"
                          value={companyForm.slug}
                          onChange={e => setCompanyForm({ ...companyForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                          className="w-full py-2.5 pl-7 pr-3 text-xs border border-[#DFE1E6] rounded-lg bg-[#FAFBFC] focus:bg-white focus:ring-2 focus:ring-[#0052CC] text-[#172B4D] font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#5E6C84] uppercase tracking-wider mb-1.5">
                      Company Website / Portal URL
                    </label>
                    <div className="relative">
                      <Globe size={14} className="absolute inset-y-0 left-3 my-auto text-gray-400 pointer-events-none" />
                      <input
                        type="url"
                        placeholder="https://company.com"
                        value={companyForm.website}
                        onChange={e => setCompanyForm({ ...companyForm, website: e.target.value })}
                        className="w-full py-2.5 pl-9 pr-3 text-xs border border-[#DFE1E6] rounded-lg bg-[#FAFBFC] focus:bg-white focus:ring-2 focus:ring-[#0052CC] text-[#172B4D]"
                      />
                    </div>
                  </div>

                  {/* Brand Accent Color */}
                  <div>
                    <label className="block text-xs font-bold text-[#5E6C84] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Palette size={13} className="text-[#0052CC]" />
                      <span>Workspace Brand Accent Color</span>
                    </label>
                    <div className="flex items-center gap-3">
                      {[
                        { color: '#0052CC', label: 'Classic Jira Blue' },
                        { color: '#4F46E5', label: 'Indigo' },
                        { color: '#7C3AED', label: 'Violet Purple' },
                        { color: '#059669', label: 'Emerald Green' },
                        { color: '#E11D48', label: 'Rose Red' },
                        { color: '#D97706', label: 'Amber Orange' },
                        { color: '#0891B2', label: 'Cyan Teal' },
                        { color: '#1E293B', label: 'Slate Dark' },
                      ].map(item => (
                        <button
                          key={item.color}
                          type="button"
                          onClick={() => setCompanyForm({ ...companyForm, avatarColor: item.color })}
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                            companyForm.avatarColor === item.color 
                              ? 'ring-2 ring-offset-2 ring-slate-800 scale-110 shadow-sm' 
                              : 'hover:scale-105 opacity-80 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: item.color }}
                          title={item.label}
                        >
                          {companyForm.avatarColor === item.color && (
                            <Check size={12} className="text-white" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: AGILE & SQUAD STANDARDS */}
              {companyActiveTab === 'agile' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-[#5E6C84] uppercase tracking-wider mb-1.5">
                        Industry Domain
                      </label>
                      <select
                        value={companyForm.industry}
                        onChange={e => setCompanyForm({ ...companyForm, industry: e.target.value })}
                        className="w-full py-2.5 px-3 text-xs border border-[#DFE1E6] rounded-lg bg-[#FAFBFC] focus:bg-white focus:ring-2 focus:ring-[#0052CC] text-[#172B4D]"
                      >
                        <option value="Fintech & SaaS">Fintech & SaaS</option>
                        <option value="AI & Machine Learning">AI & Machine Learning</option>
                        <option value="DevTools & Cloud Infra">DevTools & Cloud Infra</option>
                        <option value="HealthTech & Bio">HealthTech & Bio</option>
                        <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                        <option value="Cybersecurity & Defense">Cybersecurity & Defense</option>
                        <option value="Media & Gaming">Media & Gaming</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#5E6C84] uppercase tracking-wider mb-1.5">
                        Engineering Squad Size
                      </label>
                      <select
                        value={companyForm.teamSize}
                        onChange={e => setCompanyForm({ ...companyForm, teamSize: e.target.value })}
                        className="w-full py-2.5 px-3 text-xs border border-[#DFE1E6] rounded-lg bg-[#FAFBFC] focus:bg-white focus:ring-2 focus:ring-[#0052CC] text-[#172B4D]"
                      >
                        <option value="1-5 engineers">1 - 5 engineers</option>
                        <option value="5-15 engineers">5 - 15 engineers</option>
                        <option value="15-50 engineers">15 - 50 engineers</option>
                        <option value="50+ enterprise">50+ enterprise engineers</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-[#5E6C84] uppercase tracking-wider mb-1.5">
                        Estimation Scale
                      </label>
                      <select
                        value={companyForm.estimationScale}
                        onChange={e => setCompanyForm({ ...companyForm, estimationScale: e.target.value })}
                        className="w-full py-2.5 px-3 text-xs border border-[#DFE1E6] rounded-lg bg-[#FAFBFC] focus:bg-white focus:ring-2 focus:ring-[#0052CC] text-[#172B4D]"
                      >
                        <option value="Fibonacci (1, 2, 3, 5, 8, 13)">Fibonacci (1, 2, 3, 5, 8, 13)</option>
                        <option value="Linear (1, 2, 3, 4, 5)">Linear (1, 2, 3, 4, 5)</option>
                        <option value="T-Shirt (XS, S, M, L, XL)">T-Shirt (XS, S, M, L, XL)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#5E6C84] uppercase tracking-wider mb-1.5">
                        Sprint Cadence
                      </label>
                      <select
                        value={companyForm.sprintCadence}
                        onChange={e => setCompanyForm({ ...companyForm, sprintCadence: e.target.value })}
                        className="w-full py-2.5 px-3 text-xs border border-[#DFE1E6] rounded-lg bg-[#FAFBFC] focus:bg-white focus:ring-2 focus:ring-[#0052CC] text-[#172B4D]"
                      >
                        <option value="1 Week (Rapid)">1 Week (Rapid)</option>
                        <option value="2 Weeks (Standard)">2 Weeks (Standard)</option>
                        <option value="3 Weeks">3 Weeks</option>
                        <option value="4 Weeks (Monthly)">4 Weeks (Monthly)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#5E6C84] uppercase tracking-wider mb-1.5">
                      Target Squad Velocity (Story Points / Sprint)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="200"
                      value={companyForm.defaultVelocity}
                      onChange={e => setCompanyForm({ ...companyForm, defaultVelocity: e.target.value })}
                      className="w-full py-2.5 px-3.5 text-xs border border-[#DFE1E6] rounded-lg bg-[#FAFBFC] focus:bg-white focus:ring-2 focus:ring-[#0052CC] text-[#172B4D]"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: WORKSPACE & DATA SECURITY */}
              {companyActiveTab === 'workspace' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="text-xs font-bold text-[#172B4D]">Tenant Identification & Isolation</div>
                    <div className="flex items-center justify-between gap-2 bg-white px-3 py-2 border border-slate-200 rounded-lg">
                      <div className="font-mono text-xs text-slate-700 truncate">{user?.id || 'unauthenticated-tenant'}</div>
                      <button
                        type="button"
                        onClick={() => {
                          if (user?.id) {
                            navigator.clipboard.writeText(user.id);
                            setCopiedTenantId(true);
                            setTimeout(() => setCopiedTenantId(false), 2000);
                          }
                        }}
                        className="text-xs font-semibold text-[#0052CC] hover:underline flex items-center gap-1 flex-shrink-0 cursor-pointer"
                      >
                        {copiedTenantId ? <Check size={13} /> : <Copy size={13} />}
                        <span>{copiedTenantId ? 'Copied' : 'Copy ID'}</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-[#5E6C84]">Protected by PostgreSQL Row-Level Security (RLS) tenant partitioning.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                      <div className="text-[10px] font-bold text-blue-900 uppercase">Active Projects</div>
                      <div className="text-xl font-black text-blue-700 mt-0.5">{userProjects?.length || 1}</div>
                    </div>
                    <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl">
                      <div className="text-[10px] font-bold text-purple-900 uppercase">Account Status</div>
                      <div className="text-xs font-bold text-purple-700 mt-1 flex items-center gap-1">
                        <CheckCircle2 size={13} />
                        <span>{user?.isSuperAdmin ? 'Platform Owner' : 'Squad Manager'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleExportWorkspaceBackup}
                      className="w-full py-2.5 px-4 bg-white border border-[#DFE1E6] hover:bg-slate-50 hover:border-slate-300 text-xs font-bold text-[#172B4D] rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                    >
                      <Download size={14} className="text-[#0052CC]" />
                      <span>Export Workspace JSON Backup</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Live Preview Card */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Live Workspace Preview</div>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0"
                    style={{ backgroundColor: companyForm.avatarColor || '#0052CC' }}
                  >
                    <Building size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {companyForm.organization || 'Your Company Workspace'}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {companyForm.industry} • {companyForm.teamSize} • {companyForm.sprintCadence}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer / Actions */}
              <div className="pt-3 border-t border-[#EBECF0] flex items-center justify-end gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setCompanyModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingCompany}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] rounded-lg shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isSavingCompany ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : companySaveSuccess ? (
                    <>
                      <CheckCircle2 size={14} />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      <span>Save Company Profile</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. MODAL: CREATE NEW PROJECT BOARD */}
      {/* ========================================================= */}
      {createProjectModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#DFE1E6] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#EBECF0] flex items-center justify-between bg-gradient-to-r from-blue-50/60 to-indigo-50/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#0052CC] text-white flex items-center justify-center font-bold shadow-xs">
                  <FolderPlus size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#172B4D]">Create Project Board</h3>
                  <p className="text-[11px] text-[#5E6C84]">Spin up a new sprint board for your company</p>
                </div>
              </div>
              <button 
                onClick={() => setCreateProjectModalOpen(false)}
                className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <CloseIcon size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateNewProject} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#5E6C84] uppercase tracking-wider mb-1.5">
                  Project Board Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mobile App Redesign (iOS/Android)"
                  value={newProjectForm.name}
                  onChange={e => setNewProjectForm({ ...newProjectForm, name: e.target.value })}
                  className="w-full py-2 px-3 text-xs border border-[#DFE1E6] rounded-lg bg-[#FAFBFC] focus:bg-white focus:ring-2 focus:ring-[#0052CC] text-[#172B4D] font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5E6C84] uppercase tracking-wider mb-1.5">
                  Target Sprint Deadline (Optional)
                </label>
                <input
                  type="date"
                  value={newProjectForm.deadline}
                  onChange={e => setNewProjectForm({ ...newProjectForm, deadline: e.target.value })}
                  className="w-full py-2 px-3 text-xs border border-[#DFE1E6] rounded-lg bg-[#FAFBFC] focus:bg-white focus:ring-2 focus:ring-[#0052CC] text-[#172B4D]"
                />
              </div>

              <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-xs text-blue-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles size={13} className="text-blue-600" />
                  <span>Instant Setup Included</span>
                </div>
                <p className="text-[11px] text-blue-700">
                  Creates an initial backlog and allows your team members to start assigning and managing tasks immediately.
                </p>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-[#EBECF0] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateProjectModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingProject || !newProjectForm.name.trim()}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#0052CC] hover:bg-[#0747A6] rounded-lg shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isCreatingProject ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating Board...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={14} />
                      <span>Create Board</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. MODAL: DELETE PROJECT CONFIRMATION */}
      {/* ========================================================= */}
      {deleteConfirmProject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-red-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-red-100 flex items-center justify-between bg-red-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <Trash2 size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-red-950">Delete Project Board</h3>
                  <p className="text-[11px] text-red-600">Permanently delete board & all sprint tasks</p>
                </div>
              </div>
              <button 
                onClick={() => setDeleteConfirmProject(null)}
                className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <CloseIcon size={18} />
              </button>
            </div>

            <div className="p-6 space-y-3.5">
              <p className="text-xs text-[#172B4D] leading-relaxed">
                Are you sure you want to permanently delete <strong className="text-red-700 font-bold">"{deleteConfirmProject.name}"</strong>?
              </p>
              <div className="p-3.5 bg-red-50/70 border border-red-100 rounded-xl text-xs text-red-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-red-800">
                  <AlertCircle size={14} className="text-red-600 shrink-0" />
                  <span>Cascade Deletion Warning</span>
                </div>
                <p className="text-[11px] text-red-700 leading-normal">
                  All associated epics, user stories, tasks, subtasks, and role assignments will be removed from PostgreSQL database immediately.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50/80 border-t border-[#EBECF0] flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isDeletingProject}
                onClick={() => setDeleteConfirmProject(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingProject}
                onClick={() => handleDeleteProject(deleteConfirmProject.id)}
                className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isDeletingProject ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting Board...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Delete Project Board</span>
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
