import { GoogleGenAI, Type } from "@google/genai";
import { AgentConfig, TestCase, TestResult, RouterConfig } from '../types';
import { getPrompts } from './storageService';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const GENERATION_MODEL = 'gemini-2.5-flash';
const EVALUATION_MODEL = 'gemini-2.5-flash';

/**
 * Generates the "System Prompt" based on the user's configuration wizard.
 * Now looks up Prompt Template IDs to inject modular behavior.
 */
export const constructSystemPrompt = (agent: AgentConfig): string => {
  // 1. Resolve Knowledge
  const knowledgeText = agent.knowledge
    .map((k) => `[Source: ${k.name} (${k.type})]\n${k.content}`)
    .join('\n\n');

  // 2. Resolve Prompt Templates
  // Dynamically fetch from storage to ensure we always have the latest content
  const allPrompts = getPrompts();
  const attachedPrompts = allPrompts
    .filter(p => agent.promptTemplateIds ? agent.promptTemplateIds.includes(p.id) : false)
    .map(p => `[Module: ${p.title}]\n${p.content}`)
    .join('\n\n');

  return `
    You are ${agent.name}, a specialized AI agent acting as: ${agent.role}.
    Your audience is: ${agent.audience}.
    
    TONE AND STYLE:
    You must adopt a ${agent.tone} tone.
    Voice Guide Sample: "${agent.voiceSample}"
    
    CONSTRAINTS & SAFETY:
    - You must NOT discuss: ${agent.forbiddenTopics.join(', ')}.
    - If you do not know the answer based on the provided context, admit it gracefully.
    - Do NOT provide medical, legal, or financial advice.
    
    CAPABILITIES:
    - Can Schedule: ${agent.capabilities.canSchedule}
    - Can Capture Leads: ${agent.capabilities.canCaptureLeads}
    - Can Escalate to Human: ${agent.capabilities.canEscalate}
    
    BEHAVIOR MODULES (Specific Instructions):
    ${attachedPrompts || 'No specific behavior modules attached.'}

    KNOWLEDGE BASE:
    ${knowledgeText ? knowledgeText : 'No specific knowledge base provided.'}
    
    INSTRUCTIONS:
    Answer user queries based on the above persona, behavior modules, and knowledge.
  `;
};

/**
 * Sends a message to the Agent (Simulation).
 */
export const chatWithAgent = async (agent: AgentConfig, userMessage: string, history: {role: string, content: string}[] = []): Promise<string> => {
  const systemPrompt = constructSystemPrompt(agent);

  // Convert generic history to Gemini format if needed, but for generateContent simple string concatenation or chat session is easier.
  // We'll use a stateless approach for the MVP preview, appending history to the prompt context if it's short,
  // or using the proper multi-turn structure. Here we use the stateless generateContent for simplicity and robustness.
  
  const conversationContext = history.map(h => `${h.role === 'user' ? 'User' : 'Agent'}: ${h.content}`).join('\n');

  try {
    const response = await ai.models.generateContent({
      model: GENERATION_MODEL,
      contents: `
        ${systemPrompt}
        
        PREVIOUS CONVERSATION:
        ${conversationContext}
        
        USER: ${userMessage}
        AGENT:
      `,
      config: {
        temperature: 0.7,
      },
    });
    return response.text || "I apologize, but I couldn't generate a response.";
  } catch (error) {
    console.error("Agent chat error:", error);
    return "Error connecting to the agent.";
  }
};

/**
 * Routes a message to the correct agent based on RouterConfig.
 */
export const routeMessage = async (router: RouterConfig, userMessage: string): Promise<string> => {
  const ruleDescriptions = router.rules.map(r => `- Intent: "${r.intent}" (${r.description}) -> ID: ${r.targetAgentId}`).join('\n');
  
  const prompt = `
    You are a Neural Router. Your job is to classify the user's message into one of the following intents.
    
    ROUTING RULES:
    ${ruleDescriptions}
    
    USER MESSAGE: "${userMessage}"
    
    INSTRUCTIONS:
    Return a JSON object with a single field "targetAgentId".
    If the message matches a rule, use that ID.
    If it matches nothing, use the fallback ID: "${router.fallbackAgentId}".
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            targetAgentId: { type: Type.STRING }
          }
        }
      }
    });
    
    const result = JSON.parse(response.text || '{}');
    return result.targetAgentId || router.fallbackAgentId || '';
  } catch (e) {
    console.error("Routing failed", e);
    return router.fallbackAgentId || '';
  }
};

export const runTestCase = async (agent: AgentConfig, testCase: TestCase): Promise<TestResult> => {
  const agentResponse = await chatWithAgent(agent, testCase.input);

  const evaluationPrompt = `
    You are an AI Quality Assurance Evaluator. 
    
    TASK:
    Evaluate the following AI Agent response based on the defined criteria.
    
    INPUT QUERY: "${testCase.input}"
    AGENT RESPONSE: "${agentResponse}"
    EXPECTED CRITERIA: "${testCase.expectedCriteria}"
    
    SCORING:
    - Score from 0 to 100.
    - 0-50: Fails criteria significantly.
    - 51-79: Acceptable but imperfect.
    - 80-100: Meets or exceeds criteria perfectly.
    
    Provide a JSON response with: score, pass (boolean), and reasoning.
  `;

  try {
    const evalResponse = await ai.models.generateContent({
      model: EVALUATION_MODEL,
      contents: evaluationPrompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            pass: { type: Type.BOOLEAN },
            reasoning: { type: Type.STRING },
          },
          required: ['score', 'pass', 'reasoning']
        }
      }
    });

    const result = JSON.parse(evalResponse.text || '{}');
    
    return {
      testCaseId: testCase.id,
      actualOutput: agentResponse,
      score: result.score || 0,
      pass: result.pass || false,
      reasoning: result.reasoning || "Evaluation failed to parse.",
    };

  } catch (error) {
    console.error("Evaluation error:", error);
    return {
      testCaseId: testCase.id,
      actualOutput: agentResponse,
      score: 0,
      pass: false,
      reasoning: "System error during evaluation.",
    };
  }
};

export const suggestDriftFixes = async (failedTests: TestResult[]): Promise<{ suggestion: string, patchInstruction: string }> => {
  if (failedTests.length === 0) return { suggestion: "No failures to analyze.", patchInstruction: "" };

  const prompt = `
    Analyze these failed AI test cases and suggest a concrete prompt improvement (a rule or constraint) to fix them.
    
    FAILURES:
    ${JSON.stringify(failedTests.map(f => ({ reason: f.reasoning, output: f.actualOutput })))}
    
    OUTPUT FORMAT:
    Return JSON with:
    1. "suggestion": A human readable explanation.
    2. "patchInstruction": A specific sentence to add to the agent's system prompt (e.g. "You must explicitly ask for the order number.").
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: GENERATION_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                suggestion: { type: Type.STRING },
                patchInstruction: { type: Type.STRING }
            }
        }
      }
    });
    const res = JSON.parse(response.text || '{}');
    return {
        suggestion: res.suggestion || "General fix recommended.",
        patchInstruction: res.patchInstruction || ""
    };
  } catch (e) {
    return { suggestion: "Could not generate suggestions.", patchInstruction: "" };
  }
};