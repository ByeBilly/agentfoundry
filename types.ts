export enum AgentTone {
  Formal = 'Formal',
  Friendly = 'Friendly',
  Playful = 'Playful',
  Expert = 'Expert',
  Empathetic = 'Empathetic',
  Direct = 'Direct'
}

export enum AgentChannel {
  WebsiteWidget = 'Website Widget',
  ShareableLink = 'Shareable Link',
  Internal = 'Internal Tool',
  API = 'API'
}

export interface KnowledgeSource {
  id: string;
  type: 'text' | 'url' | 'file';
  name: string;
  content: string; // Text content or URL
  status: 'indexed' | 'pending';
}

export interface AgentConfig {
  id: string;
  name: string;
  role: string;
  audience: string;
  tone: AgentTone;
  voiceSample: string;
  forbiddenTopics: string[];
  channels: AgentChannel[];
  knowledge: KnowledgeSource[];
  promptTemplateIds?: string[]; // IDs linking to PromptLibrary
  capabilities: {
    canSchedule: boolean;
    canCaptureLeads: boolean;
    canEscalate: boolean;
  };
  systemPrompt?: string;
  created: number;
  lastUpdated: number;
  version: number;
}

export interface PromptTemplate {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: 'System' | 'Task' | 'Evaluation';
  isFavorite: boolean;
  lastEdited: number;
}

export interface TestCase {
  id: string;
  input: string; // User message
  expectedCriteria: string; // Rubric for evaluation
}

export interface TestResult {
  testCaseId: string;
  actualOutput: string;
  score: number; // 0-100
  pass: boolean;
  reasoning: string;
}

export interface TestRun {
  id: string;
  agentId: string;
  timestamp: number;
  averageScore: number;
  results: TestResult[];
}

export interface TestSuite {
  id: string;
  agentId: string;
  name: string;
  cases: TestCase[];
  history: TestRun[];
}

// --- Zero to One Extensions ---

export interface RouterRule {
  id: string;
  intent: string;
  description: string;
  targetAgentId: string;
}

export interface RouterConfig {
  id: string;
  name: string;
  description: string;
  rules: RouterRule[];
  fallbackAgentId?: string;
}

export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  config: Partial<AgentConfig>;
  tags: string[];
}

export type ViewState = 'dashboard' | 'agents' | 'builder' | 'library' | 'testing' | 'router';