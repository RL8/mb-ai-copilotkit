export type AgentType = 
  | 'agentic_chat'
  | 'generative_ui' 
  | 'human_loop'
  | 'predictive_state'
  | 'shared_state'
  | 'tool_ui';

export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  type: AgentType;
  capabilities: string[];
}

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: Date;
  agentType?: AgentType;
  metadata?: Record<string, unknown>;
}

export interface AgentState {
  messages: AgentMessage[];
  currentAgent: AgentType;
  context: Record<string, unknown>;
  tools: unknown[];
  isProcessing: boolean;
}

export interface AgentResponse {
  content: string;
  type: 'text' | 'ui' | 'approval_request' | 'prediction' | 'tool_result';
  metadata?: Record<string, unknown>;
  actions?: AgentAction[];
}

export interface AgentAction {
  type: string;
  payload: unknown;
  requiresApproval?: boolean;
}

export interface AgentInfo extends AgentConfig {
  isAvailable: boolean;
  isCurrent: boolean;
}

export const AGENT_CONFIGS: Record<AgentType, AgentConfig> = {
  agentic_chat: {
    id: 'agentic_chat',
    name: 'Agentic Chat',
    description: 'Enhanced conversational AI with advanced reasoning capabilities',
    type: 'agentic_chat',
    capabilities: ['conversation', 'reasoning', 'context_memory', 'multi_turn_planning']
  },
  generative_ui: {
    id: 'generative_ui',
    name: 'Generative UI',
    description: 'Dynamic React component generation and UI creation',
    type: 'generative_ui',
    capabilities: ['component_generation', 'ui_creation', 'dynamic_rendering', 'real_time_updates']
  },
  human_loop: {
    id: 'human_loop',
    name: 'Human in Loop',
    description: 'Collaborative AI requiring human approval for sensitive actions',
    type: 'human_loop',
    capabilities: ['approval_workflows', 'human_collaboration', 'safety_checks', 'decision_support']
  },
  predictive_state: {
    id: 'predictive_state',
    name: 'Predictive State',
    description: 'Future-aware AI that anticipates user needs and prepares suggestions',
    type: 'predictive_state',
    capabilities: ['state_prediction', 'anticipatory_loading', 'suggestion_engine', 'pattern_recognition']
  },
  shared_state: {
    id: 'shared_state',
    name: 'Shared State',
    description: 'Multi-agent coordination with synchronized state management',
    type: 'shared_state',
    capabilities: ['multi_agent_coordination', 'state_synchronization', 'collaborative_workflows', 'distributed_processing']
  },
  tool_ui: {
    id: 'tool_ui',
    name: 'Tool-based UI',
    description: 'Specialized tool integration for professional UI generation',
    type: 'tool_ui',
    capabilities: ['tool_integration', 'professional_ui', 'specialized_generation', 'advanced_components']
  }
}; 