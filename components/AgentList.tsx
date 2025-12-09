import React, { useState } from 'react';
import { Plus, Settings, PlayCircle, Code, Trash2 } from 'lucide-react';
import { AgentConfig } from '../types';
import { getAgents, deleteAgent } from '../services/storageService';
import AgentChatModal from './AgentChatModal';
import DeploymentModal from './DeploymentModal';

interface AgentListProps {
  onCreate: () => void;
  onEdit: (agent: AgentConfig) => void;
}

const AgentList: React.FC<AgentListProps> = ({ onCreate, onEdit }) => {
  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [selectedAgentForChat, setSelectedAgentForChat] = useState<AgentConfig | null>(null);
  const [selectedAgentForDeploy, setSelectedAgentForDeploy] = useState<AgentConfig | null>(null);

  React.useEffect(() => {
    setAgents(getAgents());
  }, []);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure? This cannot be undone.')) {
      deleteAgent(id);
      setAgents(getAgents());
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Agents</h1>
          <p className="text-slate-500 mt-1">Manage your active workforce.</p>
        </div>
        <button 
          onClick={onCreate}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-indigo-700 shadow-md transition-all font-medium"
        >
          <Plus size={18} /> Create Agent
        </button>
      </div>

      {agents.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus size={32} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">No agents yet</h3>
          <p className="text-slate-500 mb-6">Build your first AI employee in minutes.</p>
          <button onClick={onCreate} className="text-indigo-600 font-medium hover:underline">Start Builder &rarr;</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map(agent => (
            <div key={agent.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                    {agent.name.substring(0, 1).toUpperCase()}
                  </div>
                  <div className="flex gap-2">
                     <span className="px-2 py-1 bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider rounded border border-green-100">Active</span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">{agent.name}</h3>
                <p className="text-sm text-slate-500 mb-4">{agent.role}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="font-semibold w-16">Tone:</span> 
                    <span className="bg-slate-100 px-2 py-0.5 rounded">{agent.tone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="font-semibold w-16">Sources:</span> 
                    <span>{agent.knowledge.length} items</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="font-semibold w-16">Prompts:</span> 
                    <span>{agent.promptTemplateIds?.length || 0} modules</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 border-t border-slate-100 p-3 grid grid-cols-4 gap-1 divide-x divide-slate-200">
                 <button onClick={() => onEdit(agent)} title="Edit Config" className="flex justify-center text-slate-500 hover:text-indigo-600"><Settings size={18} /></button>
                 <button onClick={() => setSelectedAgentForChat(agent)} title="Test Chat" className="flex justify-center text-slate-500 hover:text-green-600"><PlayCircle size={18} /></button>
                 <button onClick={() => setSelectedAgentForDeploy(agent)} title="Deploy / Embed" className="flex justify-center text-slate-500 hover:text-blue-600"><Code size={18} /></button>
                 <button onClick={() => handleDelete(agent.id)} title="Delete" className="flex justify-center text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedAgentForChat && (
        <AgentChatModal 
          agent={selectedAgentForChat} 
          isOpen={!!selectedAgentForChat} 
          onClose={() => setSelectedAgentForChat(null)} 
        />
      )}

      {selectedAgentForDeploy && (
        <DeploymentModal 
          agent={selectedAgentForDeploy} 
          isOpen={!!selectedAgentForDeploy} 
          onClose={() => setSelectedAgentForDeploy(null)} 
        />
      )}
    </div>
  );
};

export default AgentList;