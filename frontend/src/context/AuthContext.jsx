import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({
  user: null,
  loading: true,
  userProjects: [],
  activeProjectId: null,
  activeProject: null,
  setActiveProjectId: () => {},
  refreshProjects: async () => [],
  createProject: async () => {},
  login: async () => {},
  register: async () => {},
  updateProfile: async () => {},
  logout: async () => {}
});

const isUUID = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProjects, setUserProjects] = useState([]);
  const [activeProjectId, setActiveProjectIdState] = useState(() => {
    const saved = localStorage.getItem('sprintx_active_project_id');
    return isUUID(saved) ? saved : null;
  });

  const formatUserData = (supabaseUser) => {
    if (!supabaseUser) return null;
    const meta = supabaseUser.user_metadata || {};
    const name = meta.name || supabaseUser.email?.split('@')[0] || 'Engineer';
    const initials = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'EX';

    const isSuperAdmin = Boolean(
      supabaseUser?.is_super_admin === true || 
      meta?.is_super_admin === true || 
      meta?.role === 'SUPER_ADMIN' ||
      supabaseUser?.app_metadata?.role === 'SUPER_ADMIN'
    );

    return {
      id: supabaseUser.id,
      email: supabaseUser.email,
      name: name,
      organization: meta.organization || 'SprintX Core Software',
      role: meta.role || 'Software Engineer',
      teamSize: meta.teamSize || '5-15 engineers',
      industry: meta.industry || 'Fintech & SaaS',
      website: meta.website || '',
      slug: meta.slug || (meta.organization ? meta.organization.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'sprintx-core'),
      estimationScale: meta.estimationScale || 'Fibonacci (1, 2, 3, 5, 8, 13)',
      sprintCadence: meta.sprintCadence || '2 Weeks (Standard)',
      defaultVelocity: meta.defaultVelocity || 20,
      avatarColor: meta.avatarColor || (isSuperAdmin ? '#4F46E5' : '#0052CC'),
      initials: initials,
      isSuperAdmin: isSuperAdmin,
      raw: supabaseUser
    };
  };

  const fetchUserProjects = async (userId) => {
    if (!userId) {
      setUserProjects([]);
      return [];
    }
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        console.warn('Projects fetch warning:', error);
        return [];
      }

      const projects = data || [];
      setUserProjects(projects);

      // Auto-set active project if none selected or if selected doesn't exist
      const savedId = localStorage.getItem('sprintx_active_project_id');
      if (projects.length > 0) {
        const match = isUUID(savedId) ? projects.find(p => p.id === savedId) : null;
        if (match) {
          setActiveProjectIdState(match.id);
        } else {
          setActiveProjectIdState(projects[0].id);
          localStorage.setItem('sprintx_active_project_id', projects[0].id);
        }
      } else {
        setActiveProjectIdState(null);
        localStorage.removeItem('sprintx_active_project_id');
      }
      return projects;
    } catch (err) {
      console.error('Failed to load user projects:', err);
      return [];
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = formatUserData(session.user);
        setUser(u);
        fetchUserProjects(u.id);
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = formatUserData(session.user);
        setUser(u);
        fetchUserProjects(u.id);
      } else {
        setUser(null);
        setUserProjects([]);
        setActiveProjectIdState(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const setActiveProjectId = (id) => {
    if (id === 'ALL') {
      setActiveProjectIdState('ALL');
      localStorage.setItem('sprintx_active_project_id', 'ALL');
    } else if (isUUID(id)) {
      setActiveProjectIdState(id);
      localStorage.setItem('sprintx_active_project_id', id);
    } else {
      setActiveProjectIdState(null);
      localStorage.removeItem('sprintx_active_project_id');
    }
  };

  const refreshProjects = async () => {
    if (user?.id) {
      return await fetchUserProjects(user.id);
    }
    return [];
  };

  const createProject = async ({ name, deadline }) => {
    if (!user?.id || !name?.trim()) return null;
    const { data: newProj, error } = await supabase
      .from('projects')
      .insert([{
        user_id: user.id,
        name: name.trim(),
        deadline: deadline || null
      }])
      .select()
      .single();

    if (error) throw error;

    // Create a default initial epic for this new project board
    if (newProj?.id) {
      await supabase
        .from('epics')
        .insert([{
          project_id: newProj.id,
          title: 'Sprint 1 — Initial Backlog & Setup'
        }]);
    }

    await fetchUserProjects(user.id);
    if (newProj?.id) {
      setActiveProjectId(newProj.id);
    }
    return newProj;
  };

  const deleteProject = async (projectId) => {
    if (!projectId || !user?.id) return false;
    try {
      // 1. Cascading cleanup of epics, stories, tasks, subtasks
      const { data: epics } = await supabase
        .from('epics')
        .select('id')
        .eq('project_id', projectId);

      if (epics && epics.length > 0) {
        const epicIds = epics.map(e => e.id);
        const { data: stories } = await supabase
          .from('stories')
          .select('id')
          .in('epic_id', epicIds);

        if (stories && stories.length > 0) {
          const storyIds = stories.map(s => s.id);
          // Delete tasks
          await supabase.from('tasks').delete().in('story_id', storyIds);
          // Delete stories
          await supabase.from('stories').delete().in('id', storyIds);
        }
        // Delete epics
        await supabase.from('epics').delete().in('id', epicIds);
      }

      // 2. Delete project
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (error) throw error;

      // 3. Refresh user projects
      const updated = await fetchUserProjects(user.id);
      if (updated && updated.length > 0) {
        setActiveProjectId(updated[0].id);
      } else {
        setActiveProjectId(null);
      }
      return true;
    } catch (err) {
      console.error('Failed to delete project:', err);
      throw err;
    }
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data?.user) {
      const u = formatUserData(data.user);
      setUser(u);
      fetchUserProjects(u.id);
      return { ...data, formattedUser: u };
    }
    return data;
  };

  const register = async (name, email, password, extraData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          organization: extraData.organization || 'My Squad',
          role: extraData.role || 'Software Engineer',
          teamSize: extraData.teamSize || '5-10',
          avatarColor: extraData.avatarColor || '#0052CC'
        },
      },
    });
    if (error) throw error;
    if (data?.user) {
      const u = formatUserData(data.user);
      setUser(u);
      fetchUserProjects(u.id);
      return { ...data, formattedUser: u };
    }
    return data;
  };

  const updateProfile = async (updates) => {
    const { data, error } = await supabase.auth.updateUser({
      data: {
        ...(user?.raw?.user_metadata || {}),
        ...updates
      }
    });
    if (error) throw error;
    if (data?.user) {
      setUser(formatUserData(data.user));
    }
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserProjects([]);
    setActiveProjectIdState(null);
    localStorage.removeItem('sprintx_active_project_id');
  };

  const activeProject = activeProjectId === 'ALL'
    ? { id: 'ALL', name: 'All Sprint Projects (Unified Portfolio)' }
    : (userProjects.find(p => p.id === activeProjectId) || userProjects[0] || null);

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProjects, 
      activeProjectId, 
      activeProject, 
      setActiveProjectId, 
      refreshProjects, 
      createProject, 
      deleteProject,
      login, 
      register, 
      updateProfile, 
      logout, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      loading: true,
      userProjects: [],
      activeProjectId: null,
      activeProject: null,
      setActiveProjectId: () => {},
      refreshProjects: async () => [],
      createProject: async () => {},
      deleteProject: async () => {},
      login: async () => {},
      register: async () => {},
      updateProfile: async () => {},
      logout: async () => {}
    };
  }
  return context;
};


