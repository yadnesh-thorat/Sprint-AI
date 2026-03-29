import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { UserPlus, UserCircle2, Trash2, ShieldCheck, Mail } from 'lucide-react';

export default function Team() {
  const [team, setTeam] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', role: 'PM' });

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const res = await api.get('/team');
      setTeam(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newUser.name) return;
    try {
      await api.post('/team', newUser);
      fetchTeam();
      setNewUser({ ...newUser, name: '' });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to offboard this member?")) return;
    try {
      await api.delete(`/team/${userId}`);
      fetchTeam();
    } catch (error) {
      console.error('Failed to delete member', error);
      alert("Cannot delete member. They may be assigned to active tasks.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Team Squad</h1>
        <p className="text-gray-500 mt-1 font-medium">Manage your Product Managers, Engineers and Database specialists.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 glass-panel p-6 rounded-3xl h-fit border-gray-100 shadow-xl shadow-gray-100/50">
          <h2 className="text-xl font-black mb-6 text-gray-900 flex items-center gap-2">
            <UserPlus size={20} className="text-brand-600"/> Onboard Member
          </h2>
          <form onSubmit={handleAdd} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Full Name</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Alex Johnson"
                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-white shadow-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all placeholder:text-gray-300 font-bold text-gray-800"
                value={newUser.name}
                onChange={e => setNewUser({...newUser, name: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Functional Role</label>
              <select 
                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-white shadow-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all font-bold text-gray-700 appearance-none cursor-pointer"
                value={newUser.role}
                onChange={e => setNewUser({...newUser, role: e.target.value})}
              >
                <optgroup label="Management">
                  <option value="PM">Product Manager (PM)</option>
                  <option value="MGR">Project Manager (MGR)</option>
                </optgroup>
                <optgroup label="Engineering">
                  <option value="FE">Frontend Developer (FE)</option>
                  <option value="BE">Backend Developer (BE)</option>
                  <option value="DB">Database Engineer (DB)</option>
                </optgroup>
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gray-900 hover:bg-brand-600 text-white font-black transition-all shadow-lg shadow-gray-200 active:scale-95"
            >
              Add to Squad
            </button>
          </form>
        </div>

        <div className="md:col-span-2 space-y-4">
          {team.length === 0 ? (
            <div className="text-center p-12 glass-panel rounded-3xl text-gray-400 border-dashed border-2 border-gray-100">
               <UserCircle2 className="w-12 h-12 mx-auto mb-2 opacity-20" />
               <p className="font-bold">No squad members yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {team.map((user) => (
                <div key={user.id} className="bg-white p-5 rounded-3xl flex items-center justify-between group border border-gray-100 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 font-black text-xl shadow-inner border border-brand-100">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 leading-tight">{user.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md border border-gray-200">
                          {user.role}
                        </span>
                        {(user.role === 'PM' || user.role === 'MGR') && (
                          <ShieldCheck size={12} className="text-brand-500" />
                        )}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(user.id)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
