import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FileUp, LogOut, Menu, X as CloseIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/upload', label: 'Upload SRS', icon: <FileUp size={20} /> },
    { path: '/team', label: 'Team', icon: <Users size={20} /> },
    { path: '/board', label: 'Board', icon: <LayoutDashboard size={20} /> },
  ];

  const SidebarContent = () => (
    <>
      <div className="h-16 flex items-center px-6 border-b border-gray-100 flex-shrink-0 bg-white sm:bg-transparent">
        <Link to="/" className="flex items-center gap-2 text-brand-600">
          <img src={logo} className="w-8 h-8 rounded-lg shadow-sm" alt="Logo" />
          <span className="font-bold text-xl tracking-tighter">SprintX AI</span>
        </Link>
        {isSidebarOpen && (
          <button onClick={() => setIsSidebarOpen(false)} className="ml-auto sm:hidden p-2 text-gray-400">
            <CloseIcon size={20} />
          </button>
        )}
      </div>
      
      <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (location.pathname === '/dashboard' && item.path === '/upload');
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-brand-50 text-brand-600 font-bold shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
              }`}
            >
              <span className={isActive ? 'text-brand-600 scale-110' : 'text-gray-400 group-hover:text-gray-600'}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className="p-4 mt-auto mb-6 mx-4 rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Operator</span>
            <span className="text-sm font-black text-gray-800 truncate pr-2">{user.name}</span>
          </div>
          <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-all p-2 rounded-xl hover:bg-red-50 active:scale-95 shadow-xs border border-transparent hover:border-red-100 bg-white">
            <LogOut size={18} />
          </button>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col sm:flex-row text-gray-800 font-sans selection:bg-brand-100 selection:text-brand-900">
      
      {/* Mobile Top Header */}
      <header className="sm:hidden h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <Link to="/" className="flex items-center gap-2 text-brand-600">
          <img src={logo} className="w-8 h-8 rounded-lg shadow-sm" alt="Logo" />
          <span className="font-bold text-xl tracking-tighter">SprintX AI</span>
        </Link>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden sm:flex w-64 bg-white border-r border-gray-200 flex-col flex-shrink-0 sticky top-0 h-screen z-10 transition-all duration-300">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isSidebarOpen && (
        <div 
          className="sm:hidden fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Drawer (Sidebar) */}
      <aside className={`
        sm:hidden fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[60] shadow-2xl transition-transform duration-300 ease-in-out transform flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 bg-gray-50/50">
        <div className="p-4 sm:p-8 max-w-7xl mx-auto min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
