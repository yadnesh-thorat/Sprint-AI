import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Loader2, KanbanSquare, X, Clock, User, Layers, FileText, ChevronRight, ChevronLeft, Plus, Trash2, CheckCircle2, Circle, ShieldCheck, Share2, Link as LinkIcon, Eye } from 'lucide-react';

const COLUMNS = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

export default function Board() {
  const { user } = useAuth();
  const { projectId } = useParams();
  const isGuest = false; // Making board fully interactive for anyone with the link
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedTask, setDraggedTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editingDescription, setEditingDescription] = useState(false);
  const [tempDescription, setTempDescription] = useState("");
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [dragOverCol, setDragOverCol] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchBoard = async () => {
    try {
      const res = await api.get('/project-board');
      setProjects(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoard();
  }, []);

  const [editingStory, setEditingStory] = useState(false);
  const [tempStoryDesc, setTempStoryDesc] = useState("");

  const updateTaskStatus = async (taskId, newStatus, newDescription) => {
    const sTaskId = String(taskId);
    setProjects(prev => prev.map(p => ({
      ...p,
      epics: (p.epics || []).map(e => ({
        ...e,
        stories: (e.stories || []).map(s => ({
          ...s,
          tasks: (s.tasks || []).map(t => 
            String(t.id) === sTaskId ? { ...t, status: newStatus || t.status } : t
          )
        }))
      }))
    })));

    try {
      const data = {};
      if (newStatus) data.status = newStatus;
      if (newDescription !== undefined) data.description = newDescription;
      await api.put(`/update-task/${sTaskId}`, data);
    } catch (error) {
       console.error("Sync Error", error);
    }
  };

  const updateStory = async (storyId, newDescription) => {
    const sStoryId = String(storyId);
    setProjects(prev => prev.map(p => ({
      ...p,
      epics: (p.epics || []).map(e => ({
        ...e,
        stories: (e.stories || []).map(s => 
          String(s.id) === sStoryId ? { ...s, description: newDescription } : s
        )
      }))
    })));

    try {
      await api.put(`/update-story/${sStoryId}`, { description: newDescription });
    } catch (error) {
       console.error("Story Sync Error", error);
    }
  };

  const addSubtask = async (taskId, title) => {
    if (!title.trim()) return;
    try {
      await api.post(`/tasks/${taskId}/subtasks`, { title });
      setNewSubtaskTitle("");
      fetchBoard();
    } catch (error) {
      console.error('Failed to add subtask', error);
    }
  };

  const toggleSubtask = async (subtaskId, currentDone) => {
    try {
      await api.put(`/subtasks/${subtaskId}`, { done: !currentDone });
      fetchBoard();
    } catch (error) {
      console.error('Failed to toggle subtask', error);
    }
  };

  const deleteSubtask = async (subtaskId) => {
    try {
      await api.delete(`/subtasks/${subtaskId}`);
      fetchBoard();
    } catch (error) {
      console.error('Failed to delete subtask', error);
    }
  };

  // Drag and Drop Logic
  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.setData("text/plain", task.id.toString());
    e.dataTransfer.effectAllowed = "move";
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedTask(null);
    setDragOverCol(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    return false;
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverCol(null);
    const taskId = e.dataTransfer.getData("text/plain");
    if (!taskId) return;
    
    // Safety Guard
    if (status === 'DONE') {
      const task = allTasks.find(t => String(t.id) === String(taskId));
      if (task && task.status !== 'IN_REVIEW') {
        alert("Must be reviewed before finishing!");
        return;
      }
    }

    updateTaskStatus(taskId, status);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center p-16 mt-10 max-w-2xl mx-auto glass-panel rounded-3xl animate-in fade-in zoom-in-95">
        <KanbanSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">No Projects Found</h2>
        <p className="text-gray-500 mt-2">Go to the Upload SRS tab to generate your first Agile board.</p>
      </div>
    );
  }

  // We are showing the specific project if in URL, otherwise latest
  const project = projectId 
    ? (projects.find(p => String(p.id) === String(projectId)) || projects[projects.length - 1])
    : projects[projects.length - 1];
  
  // Aggregate all tasks
  let allTasks = [];
  project.epics?.forEach(epic => {
    epic.stories?.forEach(story => {
      story.tasks?.forEach(task => {
        allTasks.push({ 
          ...task, 
          storyTitle: story.title, 
          epicTitle: epic.title,
          storyId: story.id,
          storyDescription: story.description
        });
      });
    });
  });

  const filteredTasks = roleFilter === 'ALL' 
    ? allTasks 
    : allTasks.filter(t => t.requiredRole === roleFilter);

  const totalPoints = allTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
  const totalHours = allTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);

  const shareProject = () => {
    const shareUrl = `${window.location.origin}/board/${project.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const columns = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500 overflow-hidden">
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl sm:text-4xl font-black text-gray-900 leading-tight tracking-tighter">
               Sprint: {project.name}
            </h1>
            <button 
              onClick={shareProject}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-black transition-all ${
                copied 
                  ? 'bg-green-50 text-green-600 border-green-200' 
                  : 'bg-white text-gray-700 border-gray-100 hover:border-brand-200 hover:shadow-sm'
              }`}
            >
              {copied ? <CheckCircle2 size={14} /> : <Share2 size={14} />}
              {copied ? 'Link Copied!' : 'Share Board'}
            </button>
          </div>
          <div className="flex items-center gap-4 mt-2">
             <p className="text-gray-500 text-sm flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-gray-300" /> Deadline: <span className="font-bold text-gray-700">{project.deadline || 'None'}</span>
             </p>
             <div className="h-4 w-px bg-gray-200"></div>
             <div className="flex items-center gap-1">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Velocity:</span>
                <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-100">{totalPoints} Points</span>
             </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Role Filters */}
          <div className="flex bg-gray-100/80 p-1 rounded-xl border border-gray-200 shadow-inner">
             {['ALL', 'FE', 'BE', 'DB'].map(r => (
               <button 
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                  roleFilter === r 
                    ? 'bg-white text-brand-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
               >
                 {r}
               </button>
             ))}
          </div>

           <div className="px-4 py-2 glass-panel rounded-2xl text-xs sm:text-sm font-black text-indigo-700 border-indigo-100 bg-indigo-50/50 shadow-sm whitespace-nowrap">
              {totalHours}h Estimated
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-6 -mx-4 sm:mx-0 px-4 sm:px-0 scrollbar-hide">
        <div className="flex gap-4 sm:gap-6 h-full min-w-max items-start">
          {columns.map(status => (
            <div 
              key={status} 
              className={`w-[280px] sm:w-80 backdrop-blur-md rounded-2xl sm:rounded-3xl p-3 sm:p-4 flex flex-col h-full border shadow-sm transition-all duration-200 ${
                dragOverCol === status 
                  ? 'bg-brand-50/50 border-brand-300 ring-2 ring-brand-200 ring-opacity-50 scale-[1.01]' 
                  : 'bg-gray-100/50 border-gray-200/40'
              }`}
              onDragOver={handleDragOver}
              onDragEnter={() => setDragOverCol(status)}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={(e) => {
                setDragOverCol(null);
                handleDrop(e, status);
              }}
            >
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="font-black text-gray-700 text-xs sm:text-sm tracking-tight flex items-center gap-2">
                  {status.replace('_', ' ')}
                  <span className="bg-white/80 text-gray-600 text-[10px] px-2 py-0.5 rounded-full border border-gray-200 shadow-sm">
                    {filteredTasks.filter(t => t.status === status).length}
                  </span>
                </h3>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                {filteredTasks.filter(t => t.status === status).map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    onDragStop={() => handleDragEnd()}
                    onClick={() => setSelectedTask(task)}
                    className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:border-brand-300 hover:shadow-md transition-all group animate-in fade-in slide-in-from-bottom-2 duration-300"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[9px] font-black tracking-tighter uppercase text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-100">
                        {task.epicTitle.substring(0,18)}
                      </span>
                      {task.storyPoints && (
                        <div className="bg-amber-50 text-amber-700 text-[9px] font-black px-1.5 py-0.5 rounded border border-amber-100 shadow-xs">
                          {task.storyPoints} PTS
                        </div>
                      )}
                    </div>
                    <h4 className="font-bold text-gray-800 text-sm mb-1 leading-snug group-hover:text-brand-600 transition-colors line-clamp-2">{task.title}</h4>
                    <p className="text-gray-500 text-[11px] line-clamp-2 mb-3 leading-relaxed opacity-80">{task.description}</p>
                    
                    <div className="flex gap-1 mb-2">
                       {columns.indexOf(task.status) > 0 && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              updateTaskStatus(task.id, columns[columns.indexOf(task.status)-1]);
                            }}
                            className="p-1 hover:bg-gray-100 rounded-md text-gray-400 hover:text-brand-600 transition-all border border-gray-100"
                            title="Move Left"
                          >
                             <ChevronLeft size={16} />
                          </button>
                       )}
                       {columns.indexOf(task.status) < columns.length - 1 && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              const nextStatus = columns[columns.indexOf(task.status)+1];
                              if (nextStatus === 'DONE' && task.status !== 'IN_REVIEW') {
                                alert("Must be reviewed before finishing!");
                                return;
                              }
                              updateTaskStatus(task.id, nextStatus);
                            }}
                            className="p-1 hover:bg-gray-100 rounded-md text-gray-400 hover:text-brand-600 transition-all border border-gray-100"
                            title="Move Right"
                          >
                             <ChevronRight size={16} />
                          </button>
                       )}
                     </div>
                    
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-300" /> {task.estimatedHours}h
                        </span>
                        {task.assignedTo && (
                          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center text-[10px] font-black ring-2 ring-white shadow-sm" title={`${task.assignedTo.name} (${task.assignedTo.role})`}>
                            {task.assignedTo.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] font-black px-2 py-0.5 bg-gray-50 rounded-md text-gray-500 border border-gray-100">
                        {task.requiredRole}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Jira-like Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedTask(null)}>
          <div 
            className="bg-white w-full max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] sm:h-[80vh] animate-in slide-in-from-bottom duration-300 sm:zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            {/* Left Content Area */}
            <div className="flex-1 p-6 sm:p-8 overflow-y-auto custom-scrollbar">
               <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">
                  <Layers className="w-3 h-3" />
                  <span>{selectedTask.epicTitle}</span>
                  <ChevronRight className="w-3 h-3" />
                  <span>{selectedTask.storyTitle}</span>
               </div>
               
               <h2 className="text-2xl font-black text-gray-900 mb-6 leading-tight">{selectedTask.title}</h2>
               
               <div className="space-y-6">
                 <div>
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-brand-500" /> Description
                      </h5>
                      {!editingDescription ? (
                        <button 
                          onClick={() => {
                            setEditingDescription(true);
                            setTempDescription(selectedTask.description || "");
                          }}
                          className="text-xs text-brand-600 font-bold hover:underline"
                        >
                          Edit
                        </button>
                      ) : (
                        <div className="flex gap-2">
                           <button 
                            onClick={async () => {
                              await updateTaskStatus(selectedTask.id, null, tempDescription);
                              setSelectedTask({...selectedTask, description: tempDescription});
                              setEditingDescription(false);
                            }}
                            className="text-xs bg-brand-600 text-white px-2 py-1 rounded font-bold"
                          >
                            Save
                          </button>
                          <button 
                            onClick={() => setEditingDescription(false)}
                            className="text-xs text-gray-500 font-bold"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {editingDescription ? (
                      <textarea
                        value={tempDescription}
                        onChange={(e) => setTempDescription(e.target.value)}
                        className="w-full h-32 text-sm text-gray-700 bg-gray-50 p-4 rounded-xl border border-brand-200 focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all"
                        placeholder="Add more detail here..."
                      />
                    ) : (
                      <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-xl border border-gray-100 italic">
                        {selectedTask.description || "No description provided."}
                      </p>
                    )}
                 </div>

                 {/* Parent Story Section */}
                 <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5" /> Parent Story
                      </h5>
                      {!editingStory ? (
                        <button 
                          onClick={() => {
                            setEditingStory(true);
                            setTempStoryDesc(selectedTask.storyDescription || "");
                          }}
                          className="text-[10px] bg-white px-2 py-1 rounded shadow-sm border border-gray-200 font-black text-gray-500 hover:text-brand-600 transition-all"
                        >
                          Edit Story
                        </button>
                      ) : (
                        <div className="flex gap-2">
                           <button 
                            onClick={async () => {
                              await updateStory(selectedTask.storyId, tempStoryDesc);
                              setSelectedTask({...selectedTask, storyDescription: tempStoryDesc});
                              setEditingStory(false);
                            }}
                            className="text-[10px] bg-gray-900 text-white px-2 py-1 rounded font-black shadow-sm transition-all"
                          >
                            Save
                          </button>
                          <button onClick={() => setEditingStory(false)} className="text-[10px] text-gray-400 font-bold">Cancel</button>
                        </div>
                      )}
                    </div>
                    
                    <h6 className="text-sm font-black text-gray-800 mb-1">{selectedTask.storyTitle}</h6>
                    
                    {editingStory ? (
                      <textarea
                        value={tempStoryDesc}
                        onChange={(e) => setTempStoryDesc(e.target.value)}
                        className="w-full h-24 text-xs text-gray-700 bg-white p-3 rounded-xl border border-brand-200 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                      />
                    ) : (
                      <p className="text-[11px] text-gray-500 leading-relaxed italic line-clamp-3">
                        {selectedTask.storyDescription || "No story description provided."}
                      </p>
                    )}
                 </div>

                 {/* Subtasks Section */}
                 <div>
                    <h5 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-4 h-4 text-green-500" /> Subtasks
                    </h5>
                    
                    <div className="space-y-2 mb-4">
                      {selectedTask.subtasks?.map(sub => (
                        <div key={sub.id} className="flex items-center justify-between group/sub bg-white p-2 rounded-lg border border-gray-100 hover:border-brand-200 transition-all">
                          <div className="flex items-center gap-3">
                            <button onClick={() => toggleSubtask(sub.id, sub.done)}>
                              {sub.done ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500 fill-green-50" />
                              ) : (
                                <Circle className="w-4 h-4 text-gray-300" />
                              )}
                            </button>
                            <span className={`text-sm ${sub.done ? 'text-gray-400 line-through' : 'text-gray-700 font-medium'}`}>
                              {sub.title}
                            </span>
                          </div>
                          <button 
                            onClick={() => deleteSubtask(sub.id)}
                            className="text-gray-300 hover:text-red-500 opacity-0 group-hover/sub:opacity-100 transition-all"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                       <input 
                        type="text"
                        value={newSubtaskTitle}
                        onChange={(e) => setNewSubtaskTitle(e.target.value)}
                        placeholder="Add subtask..."
                        onKeyDown={(e) => e.key === 'Enter' && addSubtask(selectedTask.id, newSubtaskTitle)}
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                       />
                       <button 
                        onClick={() => addSubtask(selectedTask.id, newSubtaskTitle)}
                        className="p-1.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-all"
                       >
                         <Plus className="w-4 h-4" />
                       </button>
                    </div>
                 </div>
               </div>
            </div>

            {/* Right Sidebar Area */}
            <div className="w-full md:w-72 bg-gray-50/80 border-t md:border-t-0 md:border-l border-gray-100 p-6 sm:p-8 flex flex-col gap-6">
              <div className="flex justify-end -mt-2 -mr-2 sm:-mt-4 sm:-mr-4">
                 <button 
                  onClick={() => setSelectedTask(null)}
                  className="p-2 bg-white sm:bg-transparent shadow-sm sm:shadow-none rounded-full transition-all text-gray-400 hover:text-gray-600"
                 >
                   <X className="w-5 h-5" />
                 </button>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-2">Status</label>
                <select 
                  value={selectedTask.status}
                  onChange={(e) => {
                    updateTaskStatus(selectedTask.id, e.target.value);
                    setSelectedTask({...selectedTask, status: e.target.value});
                  }}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-700 shadow-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all"
                >
                  {columns.map(c => (
                    <option key={c} value={c}>{c.replace('_', ' ')}</option>
                  ))}
                </select>

                {selectedTask.status === 'IN_REVIEW' && (
                  <button 
                    onClick={async () => {
                      await updateTaskStatus(selectedTask.id, 'DONE');
                      setSelectedTask({...selectedTask, status: 'DONE'});
                    }}
                    className="w-full mt-2 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg shadow-sm transition-all animate-bounce"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Mark as Correct
                  </button>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-2">Assignee</label>
                {selectedTask.assignedTo ? (
                  <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-sm">
                      {selectedTask.assignedTo.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800 leading-none">{selectedTask.assignedTo.name}</p>
                      <p className="text-[10px] text-gray-500 mt-1 font-medium">{selectedTask.assignedTo.role}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-400 italic text-sm">
                    <User className="w-4 h-4" /> Unassigned
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-200">
                 <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Estimate
                    </span>
                    <span className="text-sm font-black text-gray-800">{selectedTask.estimatedHours}h</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 font-bold">Requirement</span>
                    <span className="text-xs font-bold px-2 py-1 bg-brand-100 text-brand-700 rounded-md">
                      {selectedTask.requiredRole}
                    </span>
                 </div>
                 <div className="flex justify-between items-center pt-2 border-t border-dashed border-gray-200">
                    <span className="text-xs text-gray-400 font-bold tracking-tight">Project Deadline</span>
                    <span className="text-xs font-bold text-gray-600 italic">
                       {project.deadline || 'No deadline'}
                    </span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
