import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { 
  Loader2, 
  X, 
  Clock, 
  User, 
  Layers, 
  FileText, 
  ChevronRight, 
  ChevronDown,
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  ShieldCheck, 
  Share2, 
  Search, 
  Filter, 
  SlidersHorizontal,
  Bookmark,
  CheckSquare,
  AlertCircle,
  Zap,
  MoreHorizontal,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  Minus,
  FolderKanban,
  Check,
  FolderPlus
} from 'lucide-react';

const COLUMNS = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

const isUUID = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

const COLUMN_CONFIG = {
  TODO: { label: 'TO DO', badgeBg: 'bg-[#DFE1E6]', badgeText: 'text-[#42526E]', dot: 'bg-gray-400' },
  IN_PROGRESS: { label: 'IN PROGRESS', badgeBg: 'bg-[#DEEBFF]', badgeText: 'text-[#0052CC]', dot: 'bg-[#0052CC]' },
  IN_REVIEW: { label: 'IN REVIEW', badgeBg: 'bg-[#FFF0B3]', badgeText: 'text-[#172B4D]', dot: 'bg-[#FFAB00]' },
  DONE: { label: 'DONE', badgeBg: 'bg-[#E3FCEF]', badgeText: 'text-[#006644]', dot: 'bg-[#36B37E]' },
};

export default function Board() {
  const { user, userProjects, activeProjectId, setActiveProjectId, refreshProjects, deleteProject } = useAuth();
  const { projectId } = useParams();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedTask, setDraggedTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [onlyMyIssues, setOnlyMyIssues] = useState(false);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [copied, setCopied] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [availableMembers, setAvailableMembers] = useState([]);
  const [boardProjectDropdownOpen, setBoardProjectDropdownOpen] = useState(false);
  const boardDropdownRef = useRef(null);

  // Delete project state
  const [deleteConfirmProject, setDeleteConfirmProject] = useState(null);
  const [isDeletingProject, setIsDeletingProject] = useState(false);

  // Manual task creation on sprint
  const [creatingInCol, setCreatingInCol] = useState(null);
  const [quickTaskForm, setQuickTaskForm] = useState({
    title: '',
    role: 'FE',
    assignedTo: ''
  });
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  const handleDeleteBoardProject = async (projId) => {
    if (!projId) return;
    setIsDeletingProject(true);
    try {
      await deleteProject(projId);
      setDeleteConfirmProject(null);
      await fetchBoard();
    } catch (err) {
      console.error('Failed to delete project from board:', err);
    } finally {
      setIsDeletingProject(false);
    }
  };

  // Close board project dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (boardDropdownRef.current && !boardDropdownRef.current.contains(e.target)) {
        setBoardProjectDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch team members for assignee dropdown
  const fetchMembers = async () => {
    if (!user?.id) {
      setAvailableMembers([]);
      return;
    }
    try {
      const { data } = await supabase.from('team_members').select('*').eq('user_id', user.id);
      setAvailableMembers(data || []);
    } catch (e) {
      console.error('Error fetching members:', e);
    }
  };

  const fetchBoard = async () => {
    if (!user?.id) {
      setProjects([]);
      setLoading(false);
      return;
    }
    try {
      const { data: projectsData, error } = await supabase
        .from('projects')
        .select(`
          id, name, deadline,
          epics (
            id, title,
            stories (
              id, title, description,
              tasks (
                id, title, description, status, required_role, story_points, estimated_hours,
                assigned_to,
                team_members!tasks_assigned_to_fkey ( id, name, role ),
                subtasks ( id, title, done )
              )
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const normalized = (projectsData || []).map(p => ({
        ...p,
        epics: (p.epics || []).map(e => ({
          ...e,
          stories: (e.stories || []).map(s => ({
            ...s,
            tasks: (s.tasks || []).map(t => ({
              ...t,
              requiredRole: t.required_role,
              storyPoints: t.story_points,
              estimatedHours: t.estimated_hours,
              assignedTo: t.team_members || null,
              subtasks: t.subtasks || [],
            })),
          })),
        })),
      }));

      // Set directly from database (No mock fallback)
      setProjects(normalized);
    } catch (error) {
      console.error('Failed to fetch board from database:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoard();
    fetchMembers();
  }, [user?.id, activeProjectId, projectId]);

  const updateTaskStatus = async (taskId, newStatus, newDescription) => {
    const sTaskId = String(taskId);

    setProjects(prev => prev.map(p => ({
      ...p,
      epics: (p.epics || []).map(e => ({
        ...e,
        stories: (e.stories || []).map(s => ({
          ...s,
          tasks: (s.tasks || []).map(t =>
            String(t.id) === sTaskId
              ? { ...t, status: newStatus ?? t.status, description: newDescription ?? t.description }
              : t
          ),
        })),
      })),
    })));

    // Update locally in selectedTask if drawer is open
    if (selectedTask && String(selectedTask.id) === sTaskId) {
      setSelectedTask(prev => ({
        ...prev,
        status: newStatus ?? prev.status,
        description: newDescription ?? prev.description
      }));
    }

    // Attempt Supabase DB update if not mock ID
    if (!sTaskId.startsWith('SPX-')) {
      const updateData = {};
      if (newStatus) updateData.status = newStatus;
      if (newDescription !== undefined) updateData.description = newDescription;
      await supabase.from('tasks').update(updateData).eq('id', sTaskId);
    }
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.setData('text/plain', task.id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    if (!draggedTask || draggedTask.status === targetStatus) return;
    await updateTaskStatus(draggedTask.id, targetStatus);
    setDraggedTask(null);
  };

  const addSubtask = async (taskId, title) => {
    if (!title.trim()) return;
    if (!String(taskId).startsWith('SPX-')) {
      await supabase.from('subtasks').insert({ task_id: taskId, title });
      fetchBoard();
    } else {
      // Mock subtask update
      const newSub = { id: `sub-${Date.now()}`, title, done: false };
      setSelectedTask(prev => ({
        ...prev,
        subtasks: [...(prev.subtasks || []), newSub]
      }));
    }
    setNewSubtaskTitle('');
  };

  const toggleSubtask = async (subtaskId, currentDone) => {
    if (!String(subtaskId).startsWith('sub-')) {
      await supabase.from('subtasks').update({ done: !currentDone }).eq('id', subtaskId);
      fetchBoard();
    } else {
      setSelectedTask(prev => ({
        ...prev,
        subtasks: (prev.subtasks || []).map(s => s.id === subtaskId ? { ...s, done: !currentDone } : s)
      }));
    }
  };

  const shareProject = () => {
    const shareUrl = `${window.location.origin}/board`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateSprintTask = async (statusTarget = 'TODO') => {
    if (!quickTaskForm.title.trim() || !user?.id) return;
    setIsSubmittingTask(true);

    try {
      const activeId = (isUUID(projectId) ? projectId : null) || (isUUID(activeProjectId) ? activeProjectId : null);
      const currentProj = projects.find(p => p.id === activeId) || projects[0];
      let currentProjId = (currentProj?.id && isUUID(currentProj.id)) ? currentProj.id : (activeId || null);

      // 1. Ensure project exists
      if (!currentProjId) {
        let { data: existingProjects } = await supabase
          .from('projects')
          .select('id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })
          .limit(1);
        if (existingProjects?.[0]?.id && isUUID(existingProjects[0].id)) {
          currentProjId = existingProjects[0].id;
        }
      }

      if (!currentProjId) {
        const { data: newProj, error: pErr } = await supabase
          .from('projects')
          .insert([{ user_id: user.id, name: `${user.organization || 'SprintX'} Core Software (SPX)` }])
          .select()
          .single();
        if (pErr) throw pErr;
        currentProjId = newProj.id;
        await refreshProjects();
        if (currentProjId) setActiveProjectId(currentProjId);
      }

      // 2. Ensure epic exists
      let epicId = (currentProj?.epics?.[0]?.id && isUUID(currentProj.epics[0].id)) ? currentProj.epics[0].id : null;
      if (!epicId) {
        let { data: existingEpics } = await supabase
          .from('epics')
          .select('id')
          .eq('project_id', currentProjId)
          .order('created_at', { ascending: true })
          .limit(1);
        if (existingEpics?.[0]?.id && isUUID(existingEpics[0].id)) {
          epicId = existingEpics[0].id;
        }
      }

      if (!epicId) {
        const { data: newEpic, error: eErr } = await supabase
          .from('epics')
          .insert([{ project_id: currentProjId, title: 'Sprint 1 — Active Sprint Backlog' }])
          .select()
          .single();
        if (eErr) throw eErr;
        epicId = newEpic.id;
      }

      // 3. Ensure story exists
      let storyId = (currentProj?.epics?.[0]?.stories?.[0]?.id && isUUID(currentProj.epics[0].stories[0].id)) ? currentProj.epics[0].stories[0].id : null;
      if (!storyId) {
        let { data: existingStories } = await supabase
          .from('stories')
          .select('id')
          .eq('epic_id', epicId)
          .order('created_at', { ascending: true })
          .limit(1);
        if (existingStories?.[0]?.id && isUUID(existingStories[0].id)) {
          storyId = existingStories[0].id;
        }
      }

      if (!storyId) {
        const { data: newStory, error: sErr } = await supabase
          .from('stories')
          .insert([{ epic_id: epicId, title: 'Sprint Backlog Items', description: 'Core functional requirements' }])
          .select()
          .single();
        if (sErr) throw sErr;
        storyId = newStory.id;
      }

      // 4. Insert task
      const { error: tErr } = await supabase
        .from('tasks')
        .insert([{
          story_id: storyId,
          title: quickTaskForm.title.trim(),
          description: `Created manually by ${user.name || 'Team Member'} on ${new Date().toLocaleDateString()}`,
          status: statusTarget,
          required_role: quickTaskForm.role || 'FE',
          story_points: 1,
          estimated_hours: 4,
          assigned_to: isUUID(quickTaskForm.assignedTo) ? quickTaskForm.assignedTo : null
        }]);

      if (tErr) throw tErr;

      setQuickTaskForm({ title: '', role: 'FE', assignedTo: '' });
      setCreatingInCol(null);
      await fetchBoard();
    } catch (err) {
      console.error('Failed to create task on sprint:', err);
    } finally {
      setIsSubmittingTask(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#0052CC] animate-spin mb-2" />
        <span className="text-xs font-semibold text-[#5E6C84]">Loading Active Sprints...</span>
      </div>
    );
  }

  const isAllProjects = (activeProjectId === 'ALL') || (!projectId && activeProjectId === 'ALL');
  const project = isAllProjects 
    ? { name: 'All Sprint Projects (Portfolio Overview)', id: 'ALL' }
    : (projects.find(p => p.id === (projectId || activeProjectId)) || projects[0] || {});

  let allTasks = [];
  const targetProjects = isAllProjects ? projects : (project.epics ? [project] : (projects.length > 0 ? [projects[0]] : []));

  targetProjects.forEach(proj => {
    proj.epics?.forEach(epic => {
      epic.stories?.forEach(story => {
        story.tasks?.forEach(task => {
          allTasks.push({
            ...task,
            projectName: proj.name,
            storyTitle: story.title,
            epicTitle: epic.title,
            storyId: story.id,
            storyDescription: story.description,
          });
        });
      });
    });
  });

  // Apply filters
  let displayedTasks = allTasks;
  if (roleFilter !== 'ALL') {
    displayedTasks = displayedTasks.filter(t => t.requiredRole === roleFilter);
  }
  if (onlyMyIssues && user?.name) {
    displayedTasks = displayedTasks.filter(t => t.assignedTo?.name?.toLowerCase().includes(user.name.toLowerCase()));
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    displayedTasks = displayedTasks.filter(t => 
      t.title?.toLowerCase().includes(q) || 
      t.description?.toLowerCase().includes(q) ||
      String(t.id).toLowerCase().includes(q)
    );
  }

  const totalTasks = allTasks.length;
  const doneTasks = allTasks.filter(t => t.status === 'DONE').length;
  const activeRoles = ['ALL', ...Array.from(new Set(allTasks.map(t => t.requiredRole || 'FE').filter(Boolean)))];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white text-[#172B4D]">
      
      {/* 1. SUB-HEADER: BREADCRUMB & CONTROLS */}
      <div className="px-6 pt-5 pb-3 border-b border-[#EBECF0] bg-white flex-shrink-0">
        
        {/* Breadcrumb path */}
        <div className="flex items-center gap-1.5 text-xs text-[#5E6C84] mb-1.5 font-medium">
          <Link to="/board" className="hover:text-[#0052CC] hover:underline">Projects</Link>
          <ChevronRight size={12} />
          <span className="text-[#0052CC] font-semibold truncate max-w-xs">
            {project.name || user?.organization || 'SprintX Core Software'}
          </span>
          <ChevronRight size={12} />
          <span className="text-[#172B4D] font-bold">Active Sprints</span>
        </div>

        {/* Board Title & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Project Title with Interactive Switcher Dropdown */}
          <div className="relative" ref={boardDropdownRef}>
            <button
              type="button"
              onClick={() => setBoardProjectDropdownOpen(!boardProjectDropdownOpen)}
              className="flex items-center gap-2 group text-left p-1 -ml-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              title="Switch project board"
            >
              <div className="w-8 h-8 rounded-lg bg-[#0052CC] text-white flex items-center justify-center font-black text-xs shadow-xs">
                {project.name ? project.name.slice(0, 3).toUpperCase() : 'SPX'}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xl sm:text-2xl font-bold text-[#172B4D] tracking-tight truncate max-w-sm sm:max-w-md">
                    {project.name || 'Active Sprints Board'}
                  </h1>
                  <ChevronDown 
                    size={18} 
                    className={`text-[#5E6C84] group-hover:text-[#172B4D] transition-transform duration-200 ${boardProjectDropdownOpen ? 'rotate-180' : ''}`} 
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-[#5E6C84]">
                  <span>{project.deadline ? `Target: ${project.deadline}` : 'Continuous Scrum Flow'}</span>
                  <span>•</span>
                  <span className="font-semibold text-blue-600">{allTasks.length} Issues</span>
                </div>
              </div>
            </button>

            {/* Board Project Dropdown Menu */}
            {boardProjectDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-72 bg-white border border-[#DFE1E6] rounded-md shadow-lg py-1.5 z-50 divide-y divide-[#EBECF0]">
                <div className="px-3 py-1.5 flex items-center justify-between bg-[#FAFBFC]">
                  <span className="text-[10px] font-semibold text-[#5E6C84] uppercase tracking-wider">Switch Project Board</span>
                  <span className="text-[10px] font-semibold bg-[#DEEBFF] text-[#0052CC] px-1.5 py-0.5 rounded">
                    {projects.length || 1}
                  </span>
                </div>

                <div className="py-1 max-h-60 overflow-y-auto divide-y divide-[#EBECF0]">
                  {projects.map(p => {
                    const isSelected = p.id === project.id;
                    const initials = p.name ? p.name.slice(0, 3).toUpperCase() : 'SPX';
                    return (
                      <div
                        key={p.id}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors group ${
                          isSelected ? 'bg-[#DEEBFF]/40 text-[#0052CC]' : 'hover:bg-[#F4F5F7] text-[#172B4D]'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setActiveProjectId(p.id);
                            setBoardProjectDropdownOpen(false);
                          }}
                          className="flex items-center gap-2.5 min-w-0 flex-1 pr-2 text-left cursor-pointer"
                        >
                          <div 
                            className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${
                              isSelected ? 'bg-[#0052CC] text-white' : 'bg-[#EBECF0] text-[#42526E]'
                            }`}
                          >
                            {initials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-semibold truncate leading-tight">{p.name}</div>
                            <div className="text-[10px] text-[#5E6C84] truncate">
                              {p.deadline ? `Target: ${p.deadline}` : 'Scrum Active Sprint'}
                            </div>
                          </div>
                          {isSelected && (
                            <Check size={14} className="text-[#0052CC] shrink-0" />
                          )}
                        </button>

                        {/* Inline Delete Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setBoardProjectDropdownOpen(false);
                            setDeleteConfirmProject(p);
                          }}
                          className="p-1 text-[#6B778C] hover:text-red-600 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100 cursor-pointer ml-1"
                          title={`Delete board "${p.name}"`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setQuickTaskForm({ title: '', role: 'FE', points: 3, assignedTo: '' });
                setCreatingInCol('TODO');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] text-white transition-colors cursor-pointer"
              title="Create a new task on this sprint board"
            >
              <Plus size={14} />
              <span>Create Task</span>
            </button>

            <button
              onClick={shareProject}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                copied
                  ? 'bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]'
                  : 'bg-white text-[#42526E] border-[#DFE1E6] hover:bg-[#F4F5F7]'
              }`}
            >
              {copied ? <CheckCircle2 size={14} /> : <Share2 size={14} />}
              <span>{copied ? 'Link Copied' : 'Share'}</span>
            </button>

            <Link
              to="/upload"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-white text-[#172B4D] hover:bg-[#F4F5F7] border border-[#DFE1E6] transition-colors"
            >
              <FolderPlus size={14} className="text-[#0052CC]" />
              <span>Import Requirements</span>
            </Link>

            {/* Manager Delete Board Action (Visible when viewing specific project) */}
            {!isAllProjects && project?.id && (
              <button
                type="button"
                onClick={() => setDeleteConfirmProject(project)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium text-red-600 hover:text-red-700 bg-white hover:bg-red-50 border border-red-200 transition-colors cursor-pointer"
                title={`Delete project "${project.name}"`}
              >
                <Trash2 size={13} />
                <span className="hidden sm:inline">Delete Board</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters & Quick Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-gray-100">
          
          {/* Search + Quick Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute inset-y-0 left-2.5 my-auto text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search board..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-[#FAFBFC] border border-[#DFE1E6] rounded hover:bg-[#EBECF0] focus:bg-white focus:ring-2 focus:ring-[#0052CC] text-[#172B4D] w-36 sm:w-52 transition-all"
              />
            </div>

            {/* Quick Filter: Only My Issues */}
            <button
              onClick={() => setOnlyMyIssues(!onlyMyIssues)}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-all border ${
                onlyMyIssues 
                  ? 'bg-[#DEEBFF] text-[#0052CC] border-[#B3D4FF]' 
                  : 'bg-white text-[#42526E] border-[#DFE1E6] hover:bg-[#F4F5F7]'
              }`}
            >
              Only my issues
            </button>

            {/* Dynamic Role Filter Pills */}
            <div className="flex items-center bg-[#F4F5F7] p-0.5 rounded border border-[#DFE1E6]">
              {activeRoles.map(r => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                    roleFilter === r
                      ? 'bg-white text-[#0052CC] shadow-xs'
                      : 'text-[#5E6C84] hover:text-[#172B4D]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {(roleFilter !== 'ALL' || onlyMyIssues || searchQuery) && (
              <button
                onClick={() => {
                  setRoleFilter('ALL');
                  setOnlyMyIssues(false);
                  setSearchQuery('');
                }}
                className="text-xs text-[#0052CC] hover:underline font-semibold ml-1"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Sprint Progress */}
          <div className="flex items-center gap-3 text-xs text-[#5E6C84]">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[#172B4D]">Sprint Progress:</span>
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-[#36B37E] transition-all duration-500" 
                  style={{ width: `${totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0}%` }}
                />
              </div>
              <span className="font-bold text-[#006644]">{doneTasks}/{totalTasks} Tasks Done</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SPRINT BOARD KANBAN COLUMNS (Zero Horizontal Scroll, Perfect 4-Column Fit) */}
      <div className="flex-1 overflow-hidden p-3 sm:p-4 lg:p-5 bg-[#F4F5F7] flex flex-col">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5 h-full w-full flex-1">
          {COLUMNS.map(colKey => {
            const colConfig = COLUMN_CONFIG[colKey];
            const tasksInCol = displayedTasks.filter(t => (t.status || 'TODO') === colKey);

            return (
              <div
                key={colKey}
                className={`flex-1 min-w-0 bg-[#F4F5F7] rounded-lg p-2 sm:p-2.5 flex flex-col h-full border transition-colors overflow-hidden ${
                  dragOverCol === colKey 
                    ? 'bg-[#DEEBFF]/40 border-[#0052CC]' 
                    : 'border-[#DFE1E6]'
                }`}
                onDragOver={handleDragOver}
                onDragEnter={() => setDragOverCol(colKey)}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={(e) => handleDrop(e, colKey)}
              >
                
                {/* Column Header */}
                <div className="flex items-center justify-between px-2 py-1.5 mb-2 bg-white rounded border border-[#DFE1E6] flex-shrink-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${colConfig.dot}`} />
                    <span className="text-xs font-semibold text-[#172B4D] tracking-wide uppercase truncate">
                      {colConfig.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-[10px] font-semibold text-[#5E6C84] bg-[#FAFBFC] px-1.5 py-0.5 rounded border border-[#EBECF0]">
                      {tasksInCol.length}
                    </span>
                  </div>
                </div>

                {/* Column Card Container (Vertical Scroll Only) */}
                <div className="space-y-2 overflow-y-auto flex-1 pr-0.5 custom-scrollbar">
                  {tasksInCol.map((task, idx) => {
                    const taskId = task.id || `SPX-${100 + idx}`;
                    const isSelected = selectedTask && String(selectedTask.id) === String(task.id);

                    return (
                      <div
                        key={taskId}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task)}
                        onClick={() => setSelectedTask(task)}
                        className={`bg-white rounded p-3 border transition-colors cursor-grab active:cursor-grabbing hover:border-[#4C9AFF] group shadow-2xs ${
                          isSelected ? 'ring-2 ring-[#0052CC] border-[#0052CC]' : 'border-[#DFE1E6]'
                        }`}
                      >
                        {/* Ticket Title */}
                        <div className="text-xs font-medium text-[#172B4D] leading-snug mb-2 group-hover:text-[#0052CC] transition-colors line-clamp-2">
                          {task.title}
                        </div>

                        {/* Story Parent Tag */}
                        {task.storyTitle && (
                          <div className="text-[9px] font-medium text-[#5E6C84] bg-[#FAFBFC] border border-[#EBECF0] rounded px-1.5 py-0.5 mb-2 truncate max-w-full inline-block">
                            {task.storyTitle}
                          </div>
                        )}

                        {/* Ticket Footer (Issue Icon, Key, Role, Assignee Avatar) */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-1">
                          
                          {/* Issue Type & Key */}
                          <div className="flex items-center gap-1 min-w-0">
                            {task.requiredRole === 'FE' ? (
                              <span className="text-emerald-600 flex-shrink-0" title="Frontend Story"><Bookmark size={13} /></span>
                            ) : (
                              <span className="text-blue-600 flex-shrink-0" title="Engineering Task"><CheckSquare size={13} /></span>
                            )}
                            <span className="text-[10px] font-bold text-[#5E6C84] tracking-tight group-hover:underline truncate">
                              {typeof task.id === 'string' && task.id.startsWith('SPX') ? task.id : `SPX-${task.id?.slice(0, 4) || 'TKT'}`}
                            </span>
                          </div>

                          {/* Meta: Role & Assignee */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            
                            {/* Role Badge */}
                            <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                              task.requiredRole === 'FE' 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : task.requiredRole === 'BE'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {task.requiredRole || 'FE'}
                            </span>

                            {/* Assignee Avatar */}
                            <div 
                              className="w-4.5 h-4.5 rounded-full bg-[#0052CC] text-white flex items-center justify-center text-[8px] font-bold shadow-2xs ring-1 ring-white"
                              title={task.assignedTo?.name || 'Unassigned'}
                            >
                              {task.assignedTo?.name ? task.assignedTo.name.charAt(0) : 'U'}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {tasksInCol.length === 0 && !creatingInCol && (
                    <div className="h-20 flex flex-col items-center justify-center border border-dashed border-[#DFE1E6] rounded bg-white/60 text-[#5E6C84] text-xs">
                      <span className="text-[11px]">No issues</span>
                    </div>
                  )}

                  {/* Inline Quick Task Creator Form */}
                  {creatingInCol === colKey && (
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleCreateSprintTask(colKey);
                      }}
                      className="p-3 bg-white border border-[#0052CC] rounded shadow-xs space-y-2.5 my-1.5"
                    >
                      <textarea
                        autoFocus
                        required
                        placeholder="What needs to be done on this sprint?"
                        rows={2}
                        value={quickTaskForm.title}
                        onChange={e => setQuickTaskForm({ ...quickTaskForm, title: e.target.value })}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleCreateSprintTask(colKey);
                          } else if (e.key === 'Escape') {
                            setCreatingInCol(null);
                          }
                        }}
                        className="w-full text-xs p-2 border border-[#DFE1E6] rounded focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] text-[#172B4D] resize-none"
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] font-semibold text-[#5E6C84] uppercase tracking-wider mb-0.5">Role</label>
                          <select
                            value={quickTaskForm.role}
                            onChange={e => setQuickTaskForm({ ...quickTaskForm, role: e.target.value })}
                            className="w-full text-[11px] p-1.5 border border-[#DFE1E6] rounded bg-[#FAFBFC] font-medium text-[#172B4D]"
                          >
                            <option value="FE">Frontend (FE)</option>
                            <option value="BE">Backend (BE)</option>
                            <option value="DB">Database (DB)</option>
                            <option value="QA">QA / Test (QA)</option>
                            <option value="FS">Fullstack (FS)</option>
                            <option value="UX">UI/UX Designer</option>
                            <option value="DevOps">DevOps / SRE</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[9px] font-semibold text-[#5E6C84] uppercase tracking-wider mb-0.5">Assignee</label>
                          <select
                            value={quickTaskForm.assignedTo}
                            onChange={e => setQuickTaskForm({ ...quickTaskForm, assignedTo: e.target.value })}
                            className="w-full text-[11px] p-1.5 border border-[#DFE1E6] rounded bg-[#FAFBFC] font-medium text-[#172B4D] truncate"
                          >
                            <option value="">Unassigned</option>
                            {availableMembers.map(m => (
                              <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1.5 border-t border-[#EBECF0]">
                        <button
                          type="button"
                          onClick={() => setCreatingInCol(null)}
                          className="px-2.5 py-1 text-xs font-medium text-[#42526E] hover:bg-[#EBECF0] rounded cursor-pointer transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmittingTask || !quickTaskForm.title.trim()}
                          className="px-3 py-1 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] text-white text-xs font-medium rounded transition-colors flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                        >
                          {isSubmittingTask ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Plus size={13} />
                          )}
                          <span>Add</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* In-Column Quick Add Button */}
                {creatingInCol !== colKey && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuickTaskForm({ title: '', role: 'FE', assignedTo: '' });
                      setCreatingInCol(colKey);
                    }}
                    className="mt-1.5 w-full py-1.5 px-2 text-xs font-medium text-[#5E6C84] hover:text-[#172B4D] hover:bg-white rounded border border-transparent hover:border-[#DFE1E6] transition-colors flex items-center justify-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus size={13} className="text-[#0052CC]" />
                    <span>Create in {colConfig.label}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. ISSUE DETAIL SLIDE-OVER DRAWER */}
      {selectedTask && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] lg:w-[540px] bg-white shadow-2xl border-l border-[#DFE1E6] z-50 flex flex-col animate-in slide-in-from-right duration-200">
          
          {/* Drawer Top Header */}
          <div className="p-4 border-b border-[#EBECF0] flex items-center justify-between bg-[#FAFBFC]">
            <div className="flex items-center gap-2">
              <span className="text-green-600"><Bookmark size={16} /></span>
              <span className="text-xs font-bold text-[#5E6C84]">
                {typeof selectedTask.id === 'string' && selectedTask.id.startsWith('SPX') ? selectedTask.id : `SPX-${selectedTask.id?.slice(0, 4) || 'TKT'}`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setSelectedTask(null)}
                className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            
            {/* Title */}
            <div>
              <h2 className="text-lg font-bold text-[#172B4D] leading-snug">
                {selectedTask.title}
              </h2>
            </div>

            {/* Status & Properties Grid */}
            <div className="grid grid-cols-2 gap-4 bg-[#FAFBFC] p-4 rounded-lg border border-[#EBECF0]">
              <div>
                <label className="block text-[11px] font-bold text-[#5E6C84] uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  value={selectedTask.status || 'TODO'}
                  onChange={(e) => updateTaskStatus(selectedTask.id, e.target.value)}
                  className="w-full py-1.5 px-2.5 text-xs font-bold border border-[#DFE1E6] rounded bg-white text-[#0052CC] focus:ring-2 focus:ring-[#0052CC]"
                >
                  <option value="TODO">TO DO</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="IN_REVIEW">IN REVIEW</option>
                  <option value="DONE">DONE</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#5E6C84] uppercase tracking-wider mb-1">
                  Priority
                </label>
                <div className="text-xs font-bold text-amber-700 py-1.5 px-2.5 bg-amber-50 border border-amber-200 rounded flex items-center gap-1.5">
                  <Zap size={13} className="text-amber-600" />
                  <span>Medium / Sprint Target</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#5E6C84] uppercase tracking-wider mb-1">
                  Role
                </label>
                <div className="text-xs font-bold text-[#172B4D] py-1.5 px-2.5 bg-white border border-[#DFE1E6] rounded">
                  {selectedTask.requiredRole || 'FE'} (Engineering)
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#5E6C84] uppercase tracking-wider mb-1">
                  Assignee
                </label>
                <div className="text-xs font-bold text-[#172B4D] py-1.5 px-2.5 bg-white border border-[#DFE1E6] rounded flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-[#0052CC] text-white flex items-center justify-center text-[9px]">
                    {selectedTask.assignedTo?.name ? selectedTask.assignedTo.name[0] : 'U'}
                  </div>
                  <span className="truncate">{selectedTask.assignedTo?.name || 'Unassigned'}</span>
                </div>
              </div>
            </div>

            {/* Description & Acceptance Criteria */}
            <div>
              <label className="block text-xs font-bold text-[#5E6C84] uppercase tracking-wider mb-2">
                Description & Acceptance Criteria
              </label>
              <div className="p-3.5 bg-[#FAFBFC] border border-[#EBECF0] rounded-md text-xs text-[#172B4D] leading-relaxed whitespace-pre-wrap">
                {selectedTask.description || 'No detailed specifications provided.'}
              </div>
            </div>

            {/* Subtasks Checklist */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[#5E6C84] uppercase tracking-wider">
                  Subtasks & Acceptance Checklist
                </label>
                <span className="text-[11px] font-bold text-[#0052CC]">
                  {(selectedTask.subtasks || []).filter(s => s.done).length} / {(selectedTask.subtasks || []).length} done
                </span>
              </div>

              <div className="space-y-2 mb-3">
                {(selectedTask.subtasks || []).map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => toggleSubtask(sub.id, sub.done)}
                    className="flex items-center gap-2.5 p-2 bg-[#FAFBFC] hover:bg-[#EBECF0] rounded border border-[#DFE1E6] cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={sub.done}
                      onChange={() => {}}
                      className="w-4 h-4 text-[#0052CC] rounded focus:ring-0"
                    />
                    <span className={`text-xs flex-1 ${sub.done ? 'line-through text-gray-400' : 'text-[#172B4D]'}`}>
                      {sub.title}
                    </span>
                  </div>
                ))}
              </div>

              {/* Add Subtask Input */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  addSubtask(selectedTask.id, newSubtaskTitle);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="+ Add subtask item..."
                  value={newSubtaskTitle}
                  onChange={e => setNewSubtaskTitle(e.target.value)}
                  className="flex-1 py-1.5 px-3 text-xs border border-[#DFE1E6] rounded focus:ring-2 focus:ring-[#0052CC] bg-[#FAFBFC] focus:bg-white text-[#172B4D]"
                />
                <button
                  type="submit"
                  disabled={!newSubtaskTitle.trim()}
                  className="px-3 py-1.5 text-xs font-bold bg-[#0052CC] text-white rounded hover:bg-[#0747A6] disabled:opacity-50"
                >
                  Add
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DELETE PROJECT CONFIRMATION MODAL */}
      {/* ========================================================= */}
      {deleteConfirmProject && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-[#DFE1E6] w-full max-w-md overflow-hidden animate-in fade-in duration-150">
            <div className="px-5 py-4 border-b border-[#EBECF0] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-red-50 text-red-600 flex items-center justify-center font-bold">
                  <Trash2 size={16} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-[#172B4D]">Delete Project Board</h3>
                  <p className="text-[11px] text-[#5E6C84]">Permanently delete board & all sprint tasks</p>
                </div>
              </div>
              <button 
                onClick={() => setDeleteConfirmProject(null)}
                className="p-1 rounded text-[#6B778C] hover:text-[#172B4D] hover:bg-[#F4F5F7] cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-3.5">
              <p className="text-xs text-[#172B4D] leading-relaxed">
                Are you sure you want to permanently delete <strong className="text-red-700 font-semibold">"{deleteConfirmProject.name}"</strong>?
              </p>
              <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-900 space-y-1">
                <div className="font-semibold flex items-center gap-1.5 text-red-800">
                  <AlertCircle size={14} className="text-red-600 shrink-0" />
                  <span>Cascade Deletion Warning</span>
                </div>
                <p className="text-[11px] text-red-700 leading-normal">
                  All associated epics, user stories, tasks, subtasks, and role assignments will be removed from the database immediately.
                </p>
              </div>
            </div>

            <div className="px-5 py-3.5 bg-[#FAFBFC] border-t border-[#EBECF0] flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isDeletingProject}
                onClick={() => setDeleteConfirmProject(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-[#42526E] hover:bg-[#EBECF0] rounded transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingProject}
                onClick={() => handleDeleteBoardProject(deleteConfirmProject.id)}
                className="px-4 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isDeletingProject ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting Board...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={13} />
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
