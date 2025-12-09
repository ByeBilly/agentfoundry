import React, { useState, useEffect } from 'react';
import { AgentConfig, TestSuite, TestRun, TestCase } from '../types';
import { getAgents, getTestSuites, saveTestSuite, saveTestRun, saveAgent } from '../services/storageService';
import { runTestCase, suggestDriftFixes } from '../services/geminiService';
import { Play, Activity, RefreshCw, Wand2, CheckCircle, XCircle, Plus, Trash2, Edit2, Save } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const TestCenter: React.FC = () => {
  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [suites, setSuites] = useState<TestSuite[]>([]);
  const [activeSuiteId, setActiveSuiteId] = useState<string>('');
  
  const [isCreatingSuite, setIsCreatingSuite] = useState(false);
  const [newSuiteName, setNewSuiteName] = useState('');
  
  const [isEditingCases, setIsEditingCases] = useState(false);
  const [newCaseInput, setNewCaseInput] = useState('');
  const [newCaseCriteria, setNewCaseCriteria] = useState('');

  const [isRunning, setIsRunning] = useState(false);
  const [currentRunResults, setCurrentRunResults] = useState<TestRun | null>(null);
  
  const [fixSuggestion, setFixSuggestion] = useState<{suggestion: string, patchInstruction: string} | null>(null);
  const [isApplyingFix, setIsApplyingFix] = useState(false);
  const [fixApplied, setFixApplied] = useState(false);

  useEffect(() => {
    const loadedAgents = getAgents();
    setAgents(loadedAgents);
    if (loadedAgents.length > 0) setSelectedAgentId(loadedAgents[0].id);
  }, []);

  useEffect(() => {
    if (selectedAgentId) {
      setSuites(getTestSuites(selectedAgentId));
      setActiveSuiteId('');
      setCurrentRunResults(null);
      setFixSuggestion(null);
      setFixApplied(false);
    }
  }, [selectedAgentId]);

  const activeSuite = suites.find(s => s.id === activeSuiteId);

  const handleCreateSuite = () => {
    if (!newSuiteName.trim() || !selectedAgentId) return;
    const newSuite: TestSuite = {
        id: `suite_${Date.now()}`,
        agentId: selectedAgentId,
        name: newSuiteName,
        cases: [],
        history: []
    };
    saveTestSuite(newSuite);
    setSuites([...suites, newSuite]);
    setActiveSuiteId(newSuite.id);
    setIsCreatingSuite(false);
    setNewSuiteName('');
    setIsEditingCases(true); // Automatically open editor
  };

  const addTestCase = () => {
      if (!activeSuite || !newCaseInput.trim()) return;
      const newCase: TestCase = {
          id: `c_${Date.now()}`,
          input: newCaseInput,
          expectedCriteria: newCaseCriteria || 'Must respond politely.'
      };
      
      const updatedSuite = { ...activeSuite, cases: [...activeSuite.cases, newCase] };
      saveTestSuite(updatedSuite);
      setSuites(suites.map(s => s.id === updatedSuite.id ? updatedSuite : s));
      
      setNewCaseInput('');
      setNewCaseCriteria('');
  };

  const deleteTestCase = (caseId: string) => {
    if (!activeSuite) return;
    const updatedSuite = { ...activeSuite, cases: activeSuite.cases.filter(c => c.id !== caseId) };
    saveTestSuite(updatedSuite);
    setSuites(suites.map(s => s.id === updatedSuite.id ? updatedSuite : s));
  };

  const handleRunTest = async () => {
    if (!activeSuite || !selectedAgentId) return;
    if (activeSuite.cases.length === 0) {
        alert("Please add test cases to this suite first.");
        return;
    }

    setIsRunning(true);
    setFixSuggestion(null);
    setFixApplied(false);

    const agent = agents.find(a => a.id === selectedAgentId)!;
    const results = [];
    let totalScore = 0;

    for (const testCase of activeSuite.cases) {
      const result = await runTestCase(agent, testCase);
      results.push(result);
      totalScore += result.score;
    }

    const averageScore = Math.round(totalScore / activeSuite.cases.length);
    const runData: TestRun = {
      id: `run_${Date.now()}`,
      agentId: selectedAgentId,
      timestamp: Date.now(),
      averageScore,
      results
    };

    saveTestRun(activeSuite.id, runData);
    
    const updatedSuites = getTestSuites(selectedAgentId);
    setSuites(updatedSuites);
    setCurrentRunResults(runData);
    setIsRunning(false);

    if (averageScore < 70) {
      const failures = results.filter(r => !r.pass);
      const suggestions = await suggestDriftFixes(failures);
      setFixSuggestion(suggestions);
    }
  };

  const handleApplyFix = async () => {
    if (!fixSuggestion || !selectedAgentId) return;
    setIsApplyingFix(true);

    const agent = agents.find(a => a.id === selectedAgentId)!;
    const patchSource = {
        id: `patch_${Date.now()}`,
        type: 'text' as const,
        name: `Auto-Fix: ${new Date().toLocaleDateString()}`,
        content: `CRITICAL INSTRUCTION: ${fixSuggestion.patchInstruction}`,
        status: 'indexed' as const
    };

    const updatedAgent = {
        ...agent,
        knowledge: [...agent.knowledge, patchSource],
        lastUpdated: Date.now(),
        version: (agent.version || 1) + 1
    };

    saveAgent(updatedAgent);
    setAgents(getAgents()); 
    
    await new Promise(r => setTimeout(r, 1000));
    setIsApplyingFix(false);
    setFixApplied(true);
    setFixSuggestion(null);
  };

  const ChartData = activeSuite?.history.map(h => ({
    date: new Date(h.timestamp).toLocaleDateString(),
    score: h.averageScore
  })) || [];

  return (
    <div className="p-8 max-w-6xl mx-auto h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Activity className="text-indigo-600" />
          Test Center & Drift Detection
        </h1>
        <p className="text-slate-500 mt-1">Select an agent to run automated quality assurance tests.</p>
      </div>

      <div className="grid grid-cols-12 gap-8 flex-1 min-h-0">
        {/* Left Column: Selection */}
        <div className="col-span-3 border-r border-slate-200 pr-6 overflow-y-auto">
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Select Agent</label>
          <div className="space-y-2 mb-6">
            {agents.map(agent => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgentId(agent.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedAgentId === agent.id ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                {agent.name}
              </button>
            ))}
            {agents.length === 0 && <p className="text-xs text-slate-400 italic">No agents created yet.</p>}
          </div>

          {selectedAgentId && (
            <>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase">Test Suites</label>
                <button onClick={() => setIsCreatingSuite(true)} className="text-indigo-600 hover:text-indigo-700"><Plus size={16} /></button>
              </div>
              
              {isCreatingSuite && (
                  <div className="mb-4 bg-white p-2 border border-slate-200 rounded-lg shadow-sm">
                      <input 
                        type="text" 
                        placeholder="Suite Name" 
                        className="w-full text-sm border-b border-slate-200 pb-1 mb-2 outline-none"
                        value={newSuiteName}
                        onChange={e => setNewSuiteName(e.target.value)}
                      />
                      <div className="flex gap-2 justify-end">
                          <button onClick={() => setIsCreatingSuite(false)} className="text-xs text-slate-500">Cancel</button>
                          <button onClick={handleCreateSuite} className="text-xs font-medium text-indigo-600">Create</button>
                      </div>
                  </div>
              )}

              <div className="space-y-2">
                {suites.map(suite => (
                  <button
                    key={suite.id}
                    onClick={() => setActiveSuiteId(suite.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm border ${activeSuiteId === suite.id ? 'border-indigo-600 bg-white shadow-sm ring-1 ring-indigo-600' : 'border-slate-200 hover:border-indigo-300 bg-white'}`}
                  >
                    <div className="font-medium text-slate-800">{suite.name}</div>
                    <div className="text-xs text-slate-400 mt-1">{suite.cases.length} test cases • {suite.history.length} runs</div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right Column: Execution & Results */}
        <div className="col-span-9 overflow-y-auto">
          {!activeSuite ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
              <Activity size={48} className="mb-4 text-slate-300" />
              <p>Select or create a test suite to begin.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Suite Header & Editor Toggle */}
              <div className="flex items-center justify-between bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{activeSuite.name}</h2>
                  <p className="text-sm text-slate-500">Last run: {activeSuite.history.length > 0 ? new Date(activeSuite.history[activeSuite.history.length-1].timestamp).toLocaleString() : 'Never'}</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setIsEditingCases(!isEditingCases)} 
                        className="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2"
                    >
                        <Edit2 size={16} /> {isEditingCases ? 'Close Editor' : 'Edit Cases'}
                    </button>
                    <button 
                        onClick={handleRunTest}
                        disabled={isRunning}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-white shadow-md transition-all ${isRunning ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                        {isRunning ? <RefreshCw className="animate-spin" size={20} /> : <Play size={20} />}
                        {isRunning ? 'Running...' : 'Run Suite'}
                    </button>
                </div>
              </div>

              {/* Test Case Editor Area */}
              {isEditingCases && (
                  <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl">
                      <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase">Manage Test Cases</h3>
                      <div className="space-y-3 mb-6">
                          {activeSuite.cases.map(tc => (
                              <div key={tc.id} className="flex gap-4 p-3 bg-white border border-slate-200 rounded-lg items-start">
                                  <div className="flex-1">
                                      <p className="text-sm font-medium text-slate-900"><span className="text-slate-400 text-xs uppercase mr-2">Input:</span>{tc.input}</p>
                                      <p className="text-xs text-slate-500 mt-1"><span className="text-slate-400 uppercase mr-2">Expects:</span>{tc.expectedCriteria}</p>
                                  </div>
                                  <button onClick={() => deleteTestCase(tc.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                              </div>
                          ))}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg border border-slate-200">
                          <div>
                              <label className="block text-xs font-semibold text-slate-500 mb-1">User Message</label>
                              <input 
                                className="w-full border border-slate-300 rounded p-2 text-sm"
                                placeholder="e.g. Can I get a refund?"
                                value={newCaseInput}
                                onChange={e => setNewCaseInput(e.target.value)}
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-semibold text-slate-500 mb-1">Expected Criteria</label>
                              <input 
                                className="w-full border border-slate-300 rounded p-2 text-sm"
                                placeholder="e.g. Must mention 30-day policy"
                                value={newCaseCriteria}
                                onChange={e => setNewCaseCriteria(e.target.value)}
                              />
                          </div>
                          <div className="md:col-span-2 flex justify-end">
                              <button onClick={addTestCase} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded text-sm font-medium">
                                  <Plus size={16} /> Add Case
                              </button>
                          </div>
                      </div>
                  </div>
              )}

              {/* Drift Chart */}
              {ChartData.length > 0 && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-700 mb-4">Drift History (Quality Score)</h3>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={ChartData}>
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                        <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} />
                        <Tooltip />
                        <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Current Results */}
              {currentRunResults && (
                <div className="animate-fade-in">
                  <div className={`p-4 rounded-lg border mb-6 flex items-center justify-between gap-4 ${currentRunResults.averageScore >= 80 ? 'bg-green-50 border-green-200 text-green-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                    <div className="flex items-center gap-4">
                        <div className="text-3xl font-bold">{currentRunResults.averageScore}%</div>
                        <div>
                        <div className="font-bold">Test Run Complete</div>
                        <div className="text-sm opacity-90">{currentRunResults.averageScore >= 80 ? 'Agent is performing well within boundaries.' : 'Potential drift detected. Review failures below.'}</div>
                        </div>
                    </div>
                  </div>
                  
                  {fixSuggestion && (
                    <div className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 p-6 rounded-lg shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="bg-white p-2 rounded-full border border-indigo-100 shadow-sm">
                            <Wand2 className="text-indigo-600" size={24} />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-lg font-bold text-indigo-900 mb-1">AI Auto-Correction Available</h4>
                            <p className="text-indigo-700 text-sm mb-3">The system has analyzed the failures and generated a patch to fix the drift.</p>
                            
                            <div className="bg-white/60 p-3 rounded border border-indigo-100 mb-4">
                                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-1">Proposed Fix</span>
                                <p className="text-slate-800 font-medium">"{fixSuggestion.suggestion}"</p>
                                <p className="text-slate-500 text-sm mt-1 font-mono">Instruction: {fixSuggestion.patchInstruction}</p>
                            </div>

                            <button 
                                onClick={handleApplyFix}
                                disabled={isApplyingFix}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded hover:bg-indigo-700 transition-colors"
                            >
                                {isApplyingFix ? <RefreshCw className="animate-spin" size={16} /> : <Wand2 size={16} />}
                                {isApplyingFix ? 'Patching Genome...' : 'Apply Fix & Update Agent'}
                            </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {fixApplied && (
                     <div className="mb-6 bg-green-50 border border-green-200 p-4 rounded-lg flex items-center gap-3 text-green-800">
                        <CheckCircle size={20} />
                        <span className="font-medium">Agent patched successfully! Re-run tests to verify improvement.</span>
                     </div>
                  )}

                  <div className="space-y-4">
                    {currentRunResults.results.map((res, idx) => (
                      <div key={idx} className="bg-white border border-slate-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {res.pass ? <CheckCircle className="text-green-500" size={20} /> : <XCircle className="text-red-500" size={20} />}
                            <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">ID: {res.testCaseId}</span>
                          </div>
                          <div className={`text-sm font-bold ${res.score >= 80 ? 'text-green-600' : 'text-red-600'}`}>Score: {res.score}</div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-xs font-semibold text-slate-400 uppercase mb-1">Agent Output</div>
                            <div className="bg-slate-50 p-3 rounded text-slate-800 italic">"{res.actualOutput}"</div>
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-400 uppercase mb-1">Evaluator Reasoning</div>
                            <div className="text-slate-600">{res.reasoning}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestCenter;