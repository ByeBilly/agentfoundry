import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Save, Upload, Plus, Trash2, HelpCircle, Package, Download, FileText, Globe, Link } from 'lucide-react';
import { AgentConfig, AgentTone, AgentChannel, KnowledgeSource, AgentTemplate, PromptTemplate } from '../types';
import { saveAgent, getAgentTemplates, getPrompts } from '../services/storageService';
import { constructSystemPrompt } from '../services/geminiService';

interface AgentBuilderProps {
  onCancel: () => void;
  onSave: () => void;
  initialAgent?: AgentConfig | null;
}

const steps = ['Basics', 'Persona', 'Prompts', 'Knowledge', 'Capabilities', 'Review'];

const AgentBuilder: React.FC<AgentBuilderProps> = ({ onCancel, onSave, initialAgent }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showTemplates, setShowTemplates] = useState(!initialAgent);
  const [availablePrompts, setAvailablePrompts] = useState<PromptTemplate[]>([]);
  
  // Initialize agent with safe defaults, ensuring arrays are present
  const [agent, setAgent] = useState<AgentConfig>(() => {
    if (initialAgent) {
      return {
        ...initialAgent,
        promptTemplateIds: initialAgent.promptTemplateIds || [],
        knowledge: initialAgent.knowledge || [],
        forbiddenTopics: initialAgent.forbiddenTopics || [],
        channels: initialAgent.channels || []
      };
    }
    return {
      id: `agent_${Date.now()}`,
      name: '',
      role: '',
      audience: '',
      tone: AgentTone.Friendly,
      voiceSample: '',
      forbiddenTopics: [],
      channels: [AgentChannel.WebsiteWidget],
      knowledge: [],
      promptTemplateIds: [],
      capabilities: {
        canSchedule: false,
        canCaptureLeads: true,
        canEscalate: true
      },
      created: Date.now(),
      lastUpdated: Date.now(),
      version: 1
    };
  });

  const [newTopic, setNewTopic] = useState('');
  
  // Knowledge inputs
  const [knowledgeType, setKnowledgeType] = useState<'text' | 'url' | 'file'>('text');
  const [newKnowledgeText, setNewKnowledgeText] = useState('');
  const [newKnowledgeUrl, setNewKnowledgeUrl] = useState('');
  const [knowledgeName, setKnowledgeName] = useState('');

  const templates = getAgentTemplates();

  useEffect(() => {
    setAvailablePrompts(getPrompts());
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(s => s + 1);
  };
  
  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(s => s - 1);
  };

  const handleFinalSave = () => {
    // We construct the system prompt here to save a snapshot, 
    // but the runtime chat service will also reconstruct it dynamically to keep it fresh.
    const systemPrompt = constructSystemPrompt(agent);
    saveAgent({ ...agent, systemPrompt, lastUpdated: Date.now() });
    onSave();
  };

  const applyTemplate = (tmpl: AgentTemplate) => {
    setAgent(prev => ({
      ...prev,
      ...tmpl.config,
      name: `${tmpl.name} (Copy)`,
      role: tmpl.config.role || prev.role,
      promptTemplateIds: tmpl.config.promptTemplateIds || [],
    }));
    setShowTemplates(false);
  };

  const addTopic = () => {
    if (newTopic.trim()) {
      setAgent(prev => ({ ...prev, forbiddenTopics: [...prev.forbiddenTopics, newTopic.trim()] }));
      setNewTopic('');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setKnowledgeName(file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const source: KnowledgeSource = {
          id: `k_${Date.now()}`,
          type: 'file',
          name: file.name,
          content: event.target.result as string,
          status: 'indexed'
        };
        setAgent(prev => ({ ...prev, knowledge: [...prev.knowledge, source] }));
        setKnowledgeName('');
      }
    };
    reader.readAsText(file);
  };

  const addKnowledge = () => {
    if (knowledgeType === 'text') {
        if (!newKnowledgeText.trim() || !knowledgeName.trim()) return;
        const source: KnowledgeSource = {
          id: `k_${Date.now()}`,
          type: 'text',
          name: knowledgeName,
          content: newKnowledgeText,
          status: 'indexed'
        };
        setAgent(prev => ({ ...prev, knowledge: [...prev.knowledge, source] }));
        setNewKnowledgeText('');
        setKnowledgeName('');
    } else if (knowledgeType === 'url') {
        if (!newKnowledgeUrl.trim()) return;
        const source: KnowledgeSource = {
            id: `k_${Date.now()}`,
            type: 'url',
            name: newKnowledgeUrl,
            content: `[Reference URL]: ${newKnowledgeUrl}`,
            status: 'indexed'
        };
        setAgent(prev => ({ ...prev, knowledge: [...prev.knowledge, source] }));
        setNewKnowledgeUrl('');
    }
  };

  const toggleChannel = (channel: AgentChannel) => {
    setAgent(prev => {
        const exists = prev.channels.includes(channel);
        return {
            ...prev,
            channels: exists 
              ? prev.channels.filter(c => c !== channel)
              : [...prev.channels, channel]
        };
    });
  };

  const togglePrompt = (id: string) => {
    setAgent(prev => {
      // Safely handle if promptTemplateIds is somehow undefined
      const currentIds = prev.promptTemplateIds || [];
      const exists = currentIds.includes(id);
      const newIds = exists 
        ? currentIds.filter(pid => pid !== id)
        : [...currentIds, id];
      return { ...prev, promptTemplateIds: newIds };
    });
  };

  if (showTemplates) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-6">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-3">Choose an Agent Genome</h1>
          <p className="text-slate-500">Start from a blank slate or clone a specialized, pre-trained architecture.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button 
             onClick={() => setShowTemplates(false)}
             className="flex flex-col items-center justify-center p-8 bg-white border-2 border-dashed border-slate-300 rounded-xl hover:border-indigo-500 hover:bg-slate-50 transition-all group h-64"
          >
             <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
               <Plus size={32} className="text-slate-400 group-hover:text-indigo-600" />
             </div>
             <h3 className="font-bold text-slate-800 text-lg">Blank Slate</h3>
             <p className="text-sm text-slate-500 mt-2 text-center">Build a custom agent from scratch.</p>
          </button>

          {templates.map(tmpl => (
            <div key={tmpl.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-64">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
                  <Package size={20} />
                </div>
                <h3 className="font-bold text-slate-900">{tmpl.name}</h3>
              </div>
              <p className="text-sm text-slate-600 mb-4 flex-1">{tmpl.description}</p>
              <div className="flex gap-2 mb-6 flex-wrap">
                {tmpl.tags.map(t => <span key={t} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">{t}</span>)}
              </div>
              <button 
                onClick={() => applyTemplate(tmpl)}
                className="w-full py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 flex items-center justify-center gap-2"
              >
                <Download size={16} /> Clone Genome
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Basics
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Agent Name</label>
              <input 
                type="text" 
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g. Acme Support Bot"
                value={agent.name}
                onChange={e => setAgent({...agent, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Primary Role</label>
              <input 
                type="text" 
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g. Customer Support, Lead Qualifier"
                value={agent.role}
                onChange={e => setAgent({...agent, role: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target Audience</label>
              <textarea 
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none h-24"
                placeholder="e.g. Frustrated customers looking for refunds, or warm leads interested in pricing."
                value={agent.audience}
                onChange={e => setAgent({...agent, audience: e.target.value})}
              />
            </div>
          </div>
        );
      case 1: // Persona
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tone of Voice</label>
              <div className="grid grid-cols-3 gap-3">
                {Object.values(AgentTone).map(t => (
                  <button
                    key={t}
                    onClick={() => setAgent({...agent, tone: t})}
                    className={`p-3 text-sm rounded-lg border ${agent.tone === t ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-medium' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Voice Sample</label>
              <textarea 
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none h-20"
                placeholder="e.g. 'Hey there! Ready to crush your goals today?' vs 'Greetings. How may I assist you?'"
                value={agent.voiceSample}
                onChange={e => setAgent({...agent, voiceSample: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Forbidden Topics</label>
              <div className="flex gap-2 mb-2">
                <input 
                  type="text" 
                  className="flex-1 p-2 border border-slate-300 rounded-md text-sm"
                  placeholder="e.g. Competitor names, Politics"
                  value={newTopic}
                  onChange={e => setNewTopic(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTopic()}
                />
                <button onClick={addTopic} className="px-4 py-2 bg-slate-100 rounded-md text-slate-700 hover:bg-slate-200 text-sm font-medium">Add</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {agent.forbiddenTopics.map((topic, i) => (
                  <span key={i} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full border border-red-100 flex items-center gap-1">
                    {topic}
                    <button onClick={() => setAgent(prev => ({...prev, forbiddenTopics: prev.forbiddenTopics.filter((_, idx) => idx !== i)}))}>&times;</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      case 2: // Prompts
        return (
          <div className="space-y-6">
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg flex gap-3">
               <Package className="text-indigo-500 shrink-0" size={20} />
               <div>
                  <h4 className="font-semibold text-indigo-800 text-sm">Modular Intelligence</h4>
                  <p className="text-sm text-indigo-700">Attach specialized prompt modules from your library to give this agent specific skills or behaviors.</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {availablePrompts.length === 0 && (
                   <div className="col-span-2 text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
                       No prompts in library yet. Create prompts in the Library tab first.
                   </div>
               )}
               {availablePrompts.map(p => {
                 const isSelected = agent.promptTemplateIds?.includes(p.id);
                 return (
                   <div 
                      key={p.id}
                      onClick={() => togglePrompt(p.id)}
                      className={`cursor-pointer p-4 rounded-lg border transition-all ${isSelected ? 'bg-indigo-50 border-indigo-500 shadow-sm' : 'bg-white border-slate-200 hover:border-indigo-300'}`}
                   >
                      <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-slate-800">{p.title}</span>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                             {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2">{p.content}</p>
                      <div className="mt-2 flex gap-1">
                          <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 uppercase">{p.category}</span>
                          {p.isFavorite && <span className="text-[10px] px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded">★ Fav</span>}
                      </div>
                   </div>
                 );
               })}
            </div>
          </div>
        );
      case 3: // Knowledge
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex gap-3">
              <HelpCircle className="text-blue-500 shrink-0" size={20} />
              <p className="text-sm text-blue-700">Add text, files, or URLs. The agent will use this context to answer questions.</p>
            </div>
            
            <div className="border border-slate-200 rounded-lg p-4 bg-white">
              <div className="flex gap-4 mb-4 border-b border-slate-100 pb-2">
                 <button onClick={() => setKnowledgeType('text')} className={`text-sm font-medium pb-1 ${knowledgeType === 'text' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}>Text Snippet</button>
                 <button onClick={() => setKnowledgeType('file')} className={`text-sm font-medium pb-1 ${knowledgeType === 'file' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}>Upload File</button>
                 <button onClick={() => setKnowledgeType('url')} className={`text-sm font-medium pb-1 ${knowledgeType === 'url' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}>Website URL</button>
              </div>

              {knowledgeType === 'text' && (
                <>
                  <input 
                    type="text" 
                    placeholder="Source Name (e.g. Refund Policy)"
                    className="w-full mb-2 p-2 border border-slate-300 rounded text-sm"
                    value={knowledgeName}
                    onChange={e => setKnowledgeName(e.target.value)}
                  />
                  <textarea 
                    className="w-full p-2 border border-slate-300 rounded text-sm h-24 mb-2"
                    placeholder="Paste content here..."
                    value={newKnowledgeText}
                    onChange={e => setNewKnowledgeText(e.target.value)}
                  />
                  <button onClick={addKnowledge} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700">
                    <Plus size={14} /> Add Text
                  </button>
                </>
              )}

              {knowledgeType === 'file' && (
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors">
                   <Upload className="mx-auto text-slate-400 mb-2" size={24} />
                   <p className="text-sm text-slate-600 mb-2">Click to upload .txt, .md, or .json</p>
                   <input 
                     type="file" 
                     accept=".txt,.md,.json" 
                     className="text-xs text-slate-400"
                     onChange={handleFileUpload}
                   />
                </div>
              )}

              {knowledgeType === 'url' && (
                <>
                   <div className="flex gap-2">
                     <input 
                       type="url"
                       placeholder="https://example.com/about"
                       className="flex-1 p-2 border border-slate-300 rounded text-sm"
                       value={newKnowledgeUrl}
                       onChange={e => setNewKnowledgeUrl(e.target.value)}
                     />
                     <button onClick={addKnowledge} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700">
                        <Link size={14} /> Add URL
                     </button>
                   </div>
                   <p className="text-xs text-slate-400 mt-2">Note: For MVP, URLs are added as reference links. The agent will attempt to simulate knowledge based on common web data.</p>
                </>
              )}
            </div>

            <div className="space-y-2">
              {agent.knowledge.map(k => (
                <div key={k.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded border border-slate-200">
                      {k.type === 'file' ? <FileText size={16} className="text-orange-500" /> : 
                       k.type === 'url' ? <Globe size={16} className="text-blue-500" /> : 
                       <FileText size={16} className="text-slate-400" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{k.name}</p>
                      <p className="text-xs text-slate-500 truncate w-64">{k.type === 'url' ? k.content : k.content.substring(0, 50) + '...'}</p>
                    </div>
                  </div>
                  <button onClick={() => setAgent(prev => ({...prev, knowledge: prev.knowledge.filter(x => x.id !== k.id)}))} className="text-slate-400 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      case 4: // Capabilities & Channels
        return (
          <div className="space-y-8">
             <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">Capabilities</h3>
                <div className="space-y-3">
                  {[
                    { key: 'canSchedule', label: 'Schedule Appointments', desc: 'Allows the agent to propose times and book slots (Mock API).' },
                    { key: 'canCaptureLeads', label: 'Capture Lead Info', desc: 'Agent will proactively ask for name/email when appropriate.' },
                    { key: 'canEscalate', label: 'Escalate to Human', desc: 'If stuck, agent allows user to request human help.' }
                  ].map((cap) => (
                    <div key={cap.key} className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg bg-white hover:border-indigo-300 transition-colors">
                      <input 
                        type="checkbox" 
                        className="mt-1 h-4 w-4 text-indigo-600 rounded border-slate-300"
                        checked={(agent.capabilities as any)[cap.key]}
                        onChange={e => setAgent(prev => ({...prev, capabilities: {...prev.capabilities, [cap.key]: e.target.checked}}))}
                      />
                      <div>
                        <label className="block text-sm font-medium text-slate-900">{cap.label}</label>
                        <p className="text-xs text-slate-500">{cap.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
             </div>

             <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">Deployment Channels</h3>
                <div className="grid grid-cols-2 gap-3">
                   {Object.values(AgentChannel).map(channel => {
                       const isChecked = agent.channels.includes(channel);
                       return (
                           <div 
                             key={channel}
                             onClick={() => toggleChannel(channel)}
                             className={`cursor-pointer p-3 border rounded-lg flex items-center gap-3 transition-all ${isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                           >
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isChecked ? 'border-white' : 'border-slate-400'}`}>
                                  {isChecked && <div className="w-2 h-2 bg-white rounded-full" />}
                              </div>
                              <span className="text-sm font-medium">{channel}</span>
                           </div>
                       );
                   })}
                </div>
             </div>
          </div>
        );
      case 5: // Review
        return (
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-emerald-800 mb-1">Ready to Build!</h3>
              <p className="text-sm text-emerald-700">Review your agent configuration below. Once saved, you can immediately start testing for drift.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 font-medium text-slate-700">Agent Genome</div>
              <div className="p-4 space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="text-slate-500 block">Name</span>{agent.name}</div>
                  <div><span className="text-slate-500 block">Role</span>{agent.role}</div>
                  <div><span className="text-slate-500 block">Tone</span>{agent.tone}</div>
                  <div><span className="text-slate-500 block">Knowledge Sources</span>{agent.knowledge.length} items</div>
                  <div><span className="text-slate-500 block">Prompt Modules</span>{agent.promptTemplateIds?.length || 0} attached</div>
                  <div><span className="text-slate-500 block">Channels</span>{agent.channels.join(', ')}</div>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Voice Sample</span>
                  <div className="bg-slate-50 p-2 rounded italic text-slate-600">"{agent.voiceSample}"</div>
                </div>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{initialAgent ? 'Edit Agent' : 'Create New Agent'}</h2>
          <p className="text-slate-500">Step {currentStep + 1} of {steps.length}: {steps[currentStep]}</p>
        </div>
        <button onClick={onCancel} className="text-slate-500 hover:text-slate-800 text-sm">Cancel</button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-2 rounded-full mb-8">
        <div 
          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto min-h-[400px]">
        {renderStep()}
      </div>

      {/* Footer Controls */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200 mt-6">
        <button 
          onClick={handleBack}
          disabled={currentStep === 0}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${currentStep === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-700 hover:bg-slate-100'}`}
        >
          <ArrowLeft size={18} /> Back
        </button>

        {currentStep === steps.length - 1 ? (
          <button 
            onClick={handleFinalSave}
            disabled={!agent.name || !agent.role}
            className="flex items-center gap-2 px-8 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 shadow-md shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} /> Save & Compile
          </button>
        ) : (
          <button 
            onClick={handleNext}
            className="flex items-center gap-2 px-8 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800"
          >
            Next <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default AgentBuilder;