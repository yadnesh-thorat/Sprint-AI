import React, { useState, useRef } from 'react';
import { UploadCloud, Loader2, Calendar, FileText, X, ShieldAlert, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Upload() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ name: '', deadline: '', content: '' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const handleDrag = function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = function(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = function(e) {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    inputRef.current.click();
  };

  const removeFile = () => setFile(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;
    if (!formData.content && !file) return;
    
    setLoading(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      if (formData.deadline) data.append('deadline', formData.deadline);
      if (formData.content) data.append('content', formData.content);
      if (file) data.append('file', file);

      await api.post('/upload-srs', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      navigate('/board');
    } catch (err) {
      console.error(err);
      alert('Failed to process SRS. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto h-full flex flex-col justify-center animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600 mb-3">
          Configure Your Sprint
        </h1>
        <p className="text-gray-500 text-lg">Upload an SRS PDF or paste text to generate your Jira board.</p>
      </div>

      <div className="glass-panel rounded-2xl p-8 relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-brand-500 animate-spin mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">AI is analyzing your requirements...</h3>
            <p className="text-sm text-gray-500">Generating Epics, Stories, and assigning Tasks</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Project Name</label>
              <input
                required
                type="text"
                placeholder="e.g. E-Commerce Platform"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all outline-none"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Calendar size={16} /> Deadline
              </label>
              <input
                type="date"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all outline-none"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Software Requirement Context</label>
            
            {/* Drag & Drop Area */}
            <div 
              className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-colors ${dragActive ? 'border-brand-500 bg-brand-50/50' : 'border-gray-300 hover:border-brand-400 bg-gray-50'}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={handleChange} />
              
              {!file ? (
                <div className="text-center">
                  <UploadCloud className="w-12 h-12 text-brand-500 mx-auto mb-3" />
                  <p className="text-gray-700 font-medium mb-1">Drag and drop your SRS PDF here</p>
                  <p className="text-gray-500 text-sm mb-4">or just paste your text below</p>
                  <button type="button" onClick={onButtonClick} className="px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">
                     Browse PDF
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100 w-full justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-100 text-rose-600 rounded-lg"><FileText size={24}/></div>
                    <div className="flex flex-col text-left text-sm">
                      <span className="font-semibold text-gray-800">{file.name}</span>
                      <span className="text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB PDF Document</span>
                    </div>
                  </div>
                  <button type="button" onClick={removeFile} className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-50 rounded-lg">
                    <X size={20} />
                  </button>
                </div>
              )}
            </div>

            {!file && (
              <div className="relative group mt-4">
                <textarea
                  required={!file}
                  placeholder="Or paste the functional and non-functional requirements here directly..."
                  className="relative w-full h-40 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all outline-none resize-none"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || (!formData.content && !file)}
            className="w-full py-4 mt-6 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-brand-500/30 transform transition hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <UploadCloud size={20} />}
            {loading ? "Crunching Requirements..." : "Generate Agile Board"}
          </button>
        </form>
      </div>
    </div>
  );
}
