import { AgentConfig, PromptTemplate, TestSuite, TestRun, RouterConfig, AgentTemplate, AgentTone } from '../types';

// Initial data keys
const KEYS = {
  AGENTS: 'af_agents',
  PROMPTS: 'af_prompts',
  TEST_SUITES: 'af_test_suites',
  ROUTERS: 'af_routers',
};

// --- Agents ---
export const getAgents = (): AgentConfig[] => {
  const data = localStorage.getItem(KEYS.AGENTS);
  return data ? JSON.parse(data) : [];
};

export const saveAgent = (agent: AgentConfig): void => {
  const agents = getAgents();
  const index = agents.findIndex((a) => a.id === agent.id);
  if (index >= 0) {
    agents[index] = agent;
  } else {
    agents.push(agent);
  }
  localStorage.setItem(KEYS.AGENTS, JSON.stringify(agents));
};

export const deleteAgent = (id: string): void => {
  const agents = getAgents().filter((a) => a.id !== id);
  localStorage.setItem(KEYS.AGENTS, JSON.stringify(agents));
};

export const getAgentTemplates = (): AgentTemplate[] => {
  return [
    {
      id: 'tmpl_support',
      name: 'SaaS Support Specialist',
      description: 'Pre-configured for technical support with empathy and escalation paths.',
      tags: ['Support', 'SaaS'],
      config: {
        role: 'Technical Support Specialist',
        tone: AgentTone.Empathetic,
        capabilities: { canSchedule: false, canCaptureLeads: false, canEscalate: true },
        forbiddenTopics: ['Politics', 'Religion', 'Competitor Pricing']
      }
    },
    {
      id: 'tmpl_sales',
      name: 'Aggressive Sales Closer',
      description: 'Optimized for lead qualification and booking meetings.',
      tags: ['Sales', 'Booking'],
      config: {
        role: 'Sales Development Representative',
        tone: AgentTone.Direct,
        capabilities: { canSchedule: true, canCaptureLeads: true, canEscalate: true },
        forbiddenTopics: ['Legal Advice']
      }
    },
    {
      id: 'tmpl_hr',
      name: 'HR Policy Assistant',
      description: 'Internal tool for answering employee handbook questions.',
      tags: ['Internal', 'HR'],
      config: {
        role: 'HR Assistant',
        tone: AgentTone.Formal,
        capabilities: { canSchedule: false, canCaptureLeads: false, canEscalate: true },
        forbiddenTopics: ['Salary Negotiation', 'Personal Medical Info']
      }
    }
  ];
};

// --- Routers ---
export const getRouters = (): RouterConfig[] => {
  const data = localStorage.getItem(KEYS.ROUTERS);
  return data ? JSON.parse(data) : [];
};

export const saveRouter = (router: RouterConfig): void => {
  const routers = getRouters();
  const index = routers.findIndex((r) => r.id === router.id);
  if (index >= 0) {
    routers[index] = router;
  } else {
    routers.push(router);
  }
  localStorage.setItem(KEYS.ROUTERS, JSON.stringify(routers));
};

// --- Prompts ---
export const getPrompts = (): PromptTemplate[] => {
  const data = localStorage.getItem(KEYS.PROMPTS);
  if (!data) {
    // Seed with some default prompts
    const defaults: PromptTemplate[] = [
      {
        id: 'p1',
        title: 'Customer Support Base',
        content: 'You are a helpful support agent. Always be polite and concise.',
        tags: ['Support', 'General'],
        category: 'System',
        isFavorite: true,
        lastEdited: Date.now(),
      },
      {
        id: 'p2',
        title: 'Lead Qualification',
        content: 'Ask the user for their budget, timeline, and company size.',
        tags: ['Sales', 'Lead Gen'],
        category: 'Task',
        isFavorite: false,
        lastEdited: Date.now(),
      },
      {
        id: 'p3',
        title: 'Drift Check: Politeness',
        content: 'Check if the agent used any slang or rude words.',
        tags: ['Evaluation', 'QA'],
        category: 'Evaluation',
        isFavorite: true,
        lastEdited: Date.now(),
      },
    ];
    localStorage.setItem(KEYS.PROMPTS, JSON.stringify(defaults));
    return defaults;
  }
  return JSON.parse(data);
};

export const savePrompt = (prompt: PromptTemplate): void => {
  const prompts = getPrompts();
  const index = prompts.findIndex((p) => p.id === prompt.id);
  if (index >= 0) {
    prompts[index] = prompt;
  } else {
    prompts.push(prompt);
  }
  localStorage.setItem(KEYS.PROMPTS, JSON.stringify(prompts));
};

export const deletePrompt = (id: string): void => {
  const prompts = getPrompts().filter((p) => p.id !== id);
  localStorage.setItem(KEYS.PROMPTS, JSON.stringify(prompts));
};

// --- Testing ---
export const getTestSuites = (agentId: string): TestSuite[] => {
  const data = localStorage.getItem(KEYS.TEST_SUITES);
  const allSuites: TestSuite[] = data ? JSON.parse(data) : [];
  return allSuites.filter((s) => s.agentId === agentId);
};

export const saveTestSuite = (suite: TestSuite): void => {
  const data = localStorage.getItem(KEYS.TEST_SUITES);
  const allSuites: TestSuite[] = data ? JSON.parse(data) : [];
  const index = allSuites.findIndex((s) => s.id === suite.id);
  if (index >= 0) {
    allSuites[index] = suite;
  } else {
    allSuites.push(suite);
  }
  localStorage.setItem(KEYS.TEST_SUITES, JSON.stringify(allSuites));
};

export const saveTestRun = (suiteId: string, run: TestRun): void => {
  const data = localStorage.getItem(KEYS.TEST_SUITES);
  const allSuites: TestSuite[] = data ? JSON.parse(data) : [];
  const suiteIndex = allSuites.findIndex((s) => s.id === suiteId);
  
  if (suiteIndex >= 0) {
    allSuites[suiteIndex].history.push(run);
    localStorage.setItem(KEYS.TEST_SUITES, JSON.stringify(allSuites));
  }
};