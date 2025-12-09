import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import AgentList from './components/AgentList';
import AgentBuilder from './components/AgentBuilder';
import PromptLibrary from './components/PromptLibrary';
import TestCenter from './components/TestCenter';
import RouterBuilder from './components/RouterBuilder';
import { ViewState, AgentConfig } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('dashboard');
  const [editingAgent, setEditingAgent] = useState<AgentConfig | null>(null);

  const handleCreateAgent = () => {
    setEditingAgent(null);
    setView('builder');
  };

  const handleEditAgent = (agent: AgentConfig) => {
    setEditingAgent(agent);
    setView('builder');
  };

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard />;
      case 'agents':
        return (
          <AgentList 
            onCreate={handleCreateAgent}
            onEdit={handleEditAgent}
          />
        );
      case 'builder':
        return (
          <AgentBuilder 
            initialAgent={editingAgent}
            onCancel={() => setView('agents')}
            onSave={() => setView('agents')}
          />
        );
      case 'router':
        return <RouterBuilder />;
      case 'library':
        return <PromptLibrary />;
      case 'testing':
        return <TestCenter />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentView={view === 'builder' ? 'agents' : view} setView={setView}>
      {renderContent()}
    </Layout>
  );
};

export default App;