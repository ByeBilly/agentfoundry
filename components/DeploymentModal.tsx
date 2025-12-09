import React, { useState } from 'react';
import { X, Copy, Check, Code, Globe, Server } from 'lucide-react';
import { AgentConfig } from '../types';

interface DeploymentModalProps {
  agent: AgentConfig;
  isOpen: boolean;
  onClose: () => void;
}

const DeploymentModal: React.FC<DeploymentModalProps> = ({ agent, isOpen, onClose }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const widgetCode = `<script src="https://cdn.agentfoundry.ai/widget/v1.js"></script>
<script>
  window.AgentFoundry.init({
    agentId: "${agent.id}",
    container: "#my-chatbot"
  });
</script>`;

  const apiCode = `curl -X POST https://api.agentfoundry.ai/v1/chat \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "agentId": "${agent.id}",
    "message": "Hello world"
  }'`;

  const shareLink = `https://chat.agentfoundry.ai/a/${agent.id}`;

  const SnippetBlock = ({ label, code, sectionId, icon: Icon }: any) => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Icon size={16} className="text-indigo-600" /> {label}
        </label>
        <button 
          onClick={() => handleCopy(code, sectionId)}
          className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
        >
          {copiedSection === sectionId ? <Check size={14} /> : <Copy size={14} />}
          {copiedSection === sectionId ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="bg-slate-900 text-slate-50 p-3 rounded-lg text-xs overflow-x-auto font-mono border border-slate-700">
        {code}
      </pre>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl animate-fade-in flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Deploy {agent.name}</h2>
            <p className="text-sm text-slate-500">Integrate this agent into your workflow.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {agent.channels.length === 0 && (
            <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg text-sm">
              Warning: No channels are configured for this agent. Enable channels in the Agent Builder settings.
            </div>
          )}

          <SnippetBlock 
            label="Website Widget Snippet" 
            code={widgetCode} 
            sectionId="widget" 
            icon={Code} 
          />
          
          <SnippetBlock 
            label="Shareable Chat Link" 
            code={shareLink} 
            sectionId="link" 
            icon={Globe} 
          />

          <SnippetBlock 
            label="API Request" 
            code={apiCode} 
            sectionId="api" 
            icon={Server} 
          />
        </div>
        
        <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end">
           <button onClick={onClose} className="px-5 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium">Done</button>
        </div>
      </div>
    </div>
  );
};

export default DeploymentModal;