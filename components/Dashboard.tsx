import React from 'react';
import { getAgents, getPrompts, getTestSuites } from '../services/storageService';
import { Bot, MessageSquare, AlertTriangle, Zap } from 'lucide-react';

const Dashboard: React.FC = () => {
  const agents = getAgents();
  const prompts = getPrompts();
  const totalAgents = agents.length;
  
  // Calculate real metrics
  let totalRuns = 0;
  let recentDriftEvents = 0;
  
  agents.forEach(agent => {
      const suites = getTestSuites(agent.id);
      suites.forEach(s => {
          totalRuns += s.history.length;
          // Count recent failures (last run < 70)
          const lastRun = s.history[s.history.length - 1];
          if (lastRun && lastRun.averageScore < 70) {
              recentDriftEvents++;
          }
      });
  });

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Welcome back. Here's what's happening in your factory.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard icon={Bot} label="Active Agents" value={totalAgents} color="bg-indigo-500" />
        <StatCard icon={MessageSquare} label="Total Test Runs" value={totalRuns} color="bg-blue-500" />
        <StatCard icon={AlertTriangle} label="Drift Alerts" value={recentDriftEvents} color="bg-orange-500" />
        <StatCard icon={Zap} label="Prompt Modules" value={prompts.length} color="bg-emerald-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Onboarding Checklist</h3>
          <div className="space-y-3">
             {[
               { label: 'Create your first agent', done: totalAgents > 0 },
               { label: 'Create a reusable prompt', done: prompts.length > 0 },
               { label: 'Run a test suite', done: totalRuns > 0 },
               { label: 'Connect knowledge base', done: totalAgents > 0 && agents.some(a => a.knowledge.length > 0) }
             ].map((item, i) => (
               <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                 <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${item.done ? 'bg-green-500 border-green-500' : 'border-slate-300'}`}>
                   {item.done && <Zap size={12} className="text-white" />}
                 </div>
                 <span className={`${item.done ? 'text-slate-500 line-through' : 'text-slate-700 font-medium'}`}>{item.label}</span>
               </div>
             ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Activity</h3>
          {agents.length === 0 ? (
            <div className="text-center py-10 text-slate-400 italic">No activity yet. Create an agent to get started.</div>
          ) : (
            <div className="space-y-4">
              {agents.slice(0, 3).map(agent => (
                <div key={agent.id} className="flex items-center justify-between pb-4 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                      {agent.name.substring(0,2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900">{agent.name}</div>
                      <div className="text-xs text-slate-500">Updated {new Date(agent.lastUpdated).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <button className="text-xs font-medium text-indigo-600 hover:text-indigo-800">View</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;