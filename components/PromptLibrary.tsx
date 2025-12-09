import React, { useState, useEffect } from 'react';
import { Plus, Search, Tag, Star, Edit2, Trash2, Copy } from 'lucide-react';
import { PromptTemplate } from '../types';
import { getPrompts, savePrompt, deletePrompt } from '../services/storageService';

const PromptLibrary: React.FC = () => {
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [filter, setFilter] = useState('');
  const [editingPrompt, setEditingPrompt] = useState<PromptTemplate | null>(null);

  useEffect(() => {
    setPrompts(getPrompts());
  }, []);

  const refresh = () => setPrompts(getPrompts());

  const handleSave = () => {
    if (editingPrompt) {
      savePrompt({ ...editingPrompt, lastEdited: Date.now() });
      setEditingPrompt(null);
      refresh();
    }
  };

  const handleCreate = () => {
    setEditingPrompt({
      id: `prompt_${Date.now()}`,
      title: 'New Prompt',
      content: '',
      tags: [],
      category: 'Task',
      isFavorite: false,
      lastEdited: Date.now()
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this prompt?')) {
      deletePrompt(id);
      refresh();
    }
  };

  const filteredPrompts = prompts.filter(p => 
    p.title.toLowerCase().includes(filter.toLowerCase()) || 
    p.tags.some(t => t.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Prompt Library</h1>
          <p className="text-slate-500 mt-1">Store, version, and reuse your best prompts across agents.</p>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 shadow-sm"
        >
          <Plus size={18} /> New Prompt
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search prompts by title or tag..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
        </div>
      </div>

      {editingPrompt ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fade-in">
          <h3 className="text-lg font-semibold mb-4">{editingPrompt.content ? 'Edit Prompt' : 'Create Prompt'}</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Title</label>
                <input 
                  type="text" 
                  value={editingPrompt.title} 
                  onChange={e => setEditingPrompt({...editingPrompt, title: e.target.value})}
                  className="w-full p-2 border rounded-md" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
                <select 
                  value={editingPrompt.category}
                  onChange={e => setEditingPrompt({...editingPrompt, category: e.target.value as any})}
                  className="w-full p-2 border rounded-md bg-white"
                >
                  <option value="System">System / Persona</option>
                  <option value="Task">Task / Skill</option>
                  <option value="Evaluation">Evaluation / Testing</option>
                </select>
              </div>
            </div>
            
            <div>
               <label className="block text-xs font-medium text-slate-500 mb-1">Content</label>
               <textarea 
                 value={editingPrompt.content} 
                 onChange={e => setEditingPrompt({...editingPrompt, content: e.target.value})}
                 className="w-full h-32 p-2 border rounded-md font-mono text-sm" 
                 placeholder="Enter prompt text here..."
               />
            </div>
            
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditingPrompt(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-md">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Save Prompt</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrompts.map(prompt => (
            <div key={prompt.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                   <div className={`p-1.5 rounded ${prompt.category === 'System' ? 'bg-purple-100 text-purple-700' : prompt.category === 'Task' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                     <Tag size={14} />
                   </div>
                   <span className="font-semibold text-slate-800">{prompt.title}</span>
                </div>
                {prompt.isFavorite && <Star size={16} className="text-yellow-400 fill-yellow-400" />}
              </div>
              
              <p className="text-sm text-slate-600 mb-4 line-clamp-3 font-mono bg-slate-50 p-2 rounded border border-slate-100 h-20">
                {prompt.content}
              </p>
              
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex gap-1">
                   {prompt.tags.map(tag => (
                     <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-full">{tag}</span>
                   ))}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditingPrompt(prompt)} className="text-slate-400 hover:text-indigo-600"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(prompt.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PromptLibrary;