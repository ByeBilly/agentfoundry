import React, { useState, useEffect } from 'react';
import { Network, Plus, Trash2, ArrowRight, Bot, Save, Check } from 'lucide-react';
import { RouterConfig, AgentConfig, RouterRule } from '../types';
import { getAgents, getRouters, saveRouter } from '../services/storageService';
import { routeMessage } from '../services/geminiService';

const RouterBuilder: React.FC = () => {
  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [router, setRouter] = useState<RouterConfig>({
    id: 'main_router',
    name: 'Primary Gateway',
    description: 'Main entry point for customer queries.',
    rules: [],
    fallbackAgentId: ''
  });
  
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isRouting, setIsRouting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setAgents(getAgents());
    const savedRouters = getRouters();
    if (savedRouters.length > 0) {
      setRouter(savedRouters[0]);
    }
  }, []);

  const handleSave = () => {
    saveRouter(router);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addRule = () => {
    const newRule: RouterRule = {
      id: `rule_${Date.now()}`,
      intent: 'New Intent',
      description: '',
      targetAgentId: agents[0]?.id || ''
    };
    setRouter({ ...router, rules: [...router.rules, newRule] });
  };

  const updateRule = (index: number, field: keyof RouterRule, value: string) => {
    const newRules = [...router.rules];
    newRules[index] = { ...newRules[index], [field]: value };
    setRouter({ ...router, rules: newRules });
  };

  const deleteRule = (index: number) => {
    const newRules = router.rules.filter((_, i) => i !== index);
    setRouter({ ...router, rules: newRules });
  };

  const handleTestRouting = async () => {
    if (!testInput.trim()) return;
    setIsRouting(true);
    setTestResult(null);
    const agentId = await routeMessage(router, testInput);
    const agentName = agents.find(a => a.id === agentId)?.name || 'Unknown Agent';
    setTestResult(agentName);
    setIsRouting(false);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Network className="text-indigo-600" /> Neural Router
            </h1>
            <p className="text-slate-500 mt-1">Design the brain that routes traffic to your specialized agents.</p>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors">
            {saved ? <Check size={18} /> : <Save size={18} />}
            {saved ? 'Saved' : 'Save Config'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Rules Config */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Routing Logic</h3>
                
                <div className="space-y-4">
                    {router.rules.map((rule, idx) => (
                        <div key={rule.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg relative group">
                            <div className="grid grid-cols-2 gap-4 mb-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Intent Name</label>
                                    <input 
                                        type="text" 
                                        value={rule.intent}
                                        onChange={e => updateRule(idx, 'intent', e.target.value)}
                                        className="w-full p-2 border border-slate-300 rounded text-sm"
                                        placeholder="e.g. Sales Inquiry"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Route To Agent</label>
                                    <select 
                                        value={rule.targetAgentId}
                                        onChange={e => updateRule(idx, 'targetAgentId', e.target.value)}
                                        className="w-full p-2 border border-slate-300 rounded text-sm bg-white"
                                    >
                                        {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Natural Language Description</label>
                                <input 
                                    type="text" 
                                    value={rule.description}
                                    onChange={e => updateRule(idx, 'description', e.target.value)}
                                    className="w-full p-2 border border-slate-300 rounded text-sm"
                                    placeholder="Describe what this intent looks like..."
                                />
                            </div>
                            <button onClick={() => deleteRule(idx)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                    <button onClick={addRule} className="w-full py-3 border-2 border-dashed border-slate-200 rounded-lg text-slate-500 hover:border-indigo-300 hover:text-indigo-600 flex items-center justify-center gap-2 font-medium transition-colors">
                        <Plus size={18} /> Add Routing Rule
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Fallback Route</h3>
                <p className="text-xs text-slate-500 mb-3">If no intent matches, send user here:</p>
                <select 
                    value={router.fallbackAgentId}
                    onChange={e => setRouter({...router, fallbackAgentId: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded text-sm bg-white"
                >
                    <option value="">-- No Agent (Drop) --</option>
                    {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
            </div>
        </div>

        {/* Live Simulator */}
        <div className="lg:col-span-1">
            <div className="bg-indigo-900 text-white rounded-xl p-6 shadow-lg h-full flex flex-col">
                <h3 className="text-lg font-bold mb-1">Simulation</h3>
                <p className="text-indigo-200 text-sm mb-6">Test your routing logic in real-time.</p>

                <div className="flex-1 flex flex-col gap-4">
                    <div>
                        <label className="block text-xs font-bold text-indigo-300 uppercase mb-2">User Message</label>
                        <textarea 
                            value={testInput}
                            onChange={e => setTestInput(e.target.value)}
                            className="w-full p-3 rounded-lg bg-indigo-800 border border-indigo-700 text-white placeholder-indigo-400 focus:ring-2 focus:ring-indigo-400 outline-none text-sm"
                            rows={4}
                            placeholder="Type a message like 'I want a refund' or 'What is your pricing?'"
                        />
                    </div>
                    
                    <button 
                        onClick={handleTestRouting}
                        disabled={isRouting || !testInput}
                        className="w-full py-2 bg-white text-indigo-900 font-bold rounded-lg hover:bg-indigo-50 disabled:opacity-50"
                    >
                        {isRouting ? 'Classifying...' : 'Test Route'}
                    </button>

                    {testResult && (
                        <div className="mt-4 p-4 bg-indigo-800 rounded-lg border border-indigo-700 animate-fade-in">
                            <div className="flex items-center gap-2 text-indigo-300 text-xs uppercase font-bold mb-2">
                                <ArrowRight size={14} /> Routed To
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="bg-white/10 p-2 rounded">
                                    <Bot size={20} />
                                </div>
                                <span className="text-lg font-bold">{testResult}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RouterBuilder;