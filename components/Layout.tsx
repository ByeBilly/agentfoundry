import React from 'react';
import { LayoutDashboard, Bot, BookOpen, Activity, Settings, User, Network } from 'lucide-react';
import { ViewState } from '../types';

interface LayoutProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, setView, children }) => {
  const NavItem = ({ view, icon: Icon, label }: { view: ViewState; icon: any; label: string }) => (
    <button
      onClick={() => setView(view)}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-lg mb-1
        ${currentView === view 
          ? 'bg-indigo-600 text-white shadow-md' 
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Bot className="text-white" size={20} />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">AgentFoundry</span>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="mb-6">
            <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Platform</p>
            <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem view="agents" icon={Bot} label="My Agents" />
            <NavItem view="router" icon={Network} label="Neural Router" />
            <NavItem view="library" icon={BookOpen} label="Prompt Library" />
            <NavItem view="testing" icon={Activity} label="Test & Drift" />
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 w-full hover:bg-slate-50 rounded-lg">
            <User size={18} />
            <div className="flex flex-col items-start">
              <span>Demo User</span>
              <span className="text-xs text-slate-400">Pro Workspace</span>
            </div>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        {children}
      </main>
    </div>
  );
};

export default Layout;