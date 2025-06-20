import { AgentType, AgentState, AgentResponse, AGENT_CONFIGS, AgentInfo } from '@/types/agent-types';
import { BaseAgent } from './base-agent';
import { AgenticChatAgent } from './agentic-chat';
import { GenerativeUIAgent } from './generative-ui';
import { HumanLoopAgent } from './human-loop';
import { PredictiveStateAgent } from './predictive-state';
import { SharedStateAgent } from './shared-state';
import { ToolUIAgent } from './tool-ui';

export class AgentRouter {
  private agents: Map<AgentType, BaseAgent> = new Map();
  private currentAgent: AgentType = 'agentic_chat';
  private state: AgentState;

  constructor() {
    this.initializeAgents();
    this.state = {
      messages: [],
      currentAgent: 'agentic_chat',
      context: {},
      tools: [],
      isProcessing: false
    };
  }

  private initializeAgents(): void {
    // All 6 phases implemented
    this.agents.set('agentic_chat', new AgenticChatAgent());
    this.agents.set('generative_ui', new GenerativeUIAgent());
    this.agents.set('human_loop', new HumanLoopAgent());
    this.agents.set('predictive_state', new PredictiveStateAgent());
    this.agents.set('shared_state', new SharedStateAgent());
    this.agents.set('tool_ui', new ToolUIAgent());
  }

  async processMessage(message: string, targetAgent?: AgentType): Promise<AgentResponse> {
    try {
      this.state.isProcessing = true;
      
      // Switch agent if specified
      if (targetAgent && targetAgent !== this.currentAgent) {
        await this.switchAgent(targetAgent);
      }

      const agent = this.agents.get(this.currentAgent);
      if (!agent) {
        throw new Error(`Agent ${this.currentAgent} not available`);
      }

      // Add message to state
      this.state.messages.push({
        id: Date.now().toString(),
        role: 'user',
        content: message,
        timestamp: new Date(),
        agentType: this.currentAgent
      });

      // Process with current agent
      const response = await agent.processMessage(message, this.state);

      // Add response to state
      this.state.messages.push({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        agentType: this.currentAgent
      });

      // Update tools
      this.state.tools = agent.getTools();

      this.state.isProcessing = false;
      return response;

    } catch (error) {
      this.state.isProcessing = false;
      console.error('[AgentRouter] Error processing message:', error);
      
      return {
        content: `I encountered an error while processing your message. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'text',
        metadata: {
          error: true,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  async switchAgent(newAgent: AgentType): Promise<void> {
    if (!this.agents.has(newAgent)) {
      throw new Error(`Agent ${newAgent} is not available. All 6 agents are implemented: 'agentic_chat', 'generative_ui', 'human_loop', 'predictive_state', 'shared_state', and 'tool_ui'.`);
    }

    const previousAgent = this.currentAgent;
    this.currentAgent = newAgent;
    this.state.currentAgent = newAgent;

    // Add context about agent switch
    this.state.context = {
      ...this.state.context,
      previousAgent,
      agentSwitchTime: new Date().toISOString(),
      agentSwitchReason: `Switched from ${previousAgent} to ${newAgent}`
    };

    console.log(`[AgentRouter] Switched from ${previousAgent} to ${newAgent}`);
  }

  getCurrentAgent(): AgentType {
    return this.currentAgent;
  }

  getAvailableAgents(): AgentType[] {
    return Array.from(this.agents.keys());
  }

  getAgentInfo(agentType: AgentType): AgentInfo {
    const agent = this.agents.get(agentType);
    const config = AGENT_CONFIGS[agentType];
    
    return {
      ...config,
      isAvailable: !!agent,
      isCurrent: agentType === this.currentAgent
    };
  }

  getAllAgentsInfo(): AgentInfo[] {
    return Object.keys(AGENT_CONFIGS).map(type => 
      this.getAgentInfo(type as AgentType)
    );
  }

  getState(): AgentState {
    return { ...this.state };
  }

  updateContext(key: string, value: unknown): void {
    this.state.context[key] = value;
  }

  clearContext(): void {
    this.state.context = {};
  }

  getConversationHistory(limit?: number) {
    const messages = this.state.messages;
    return limit ? messages.slice(-limit) : messages;
  }

  // Method to handle automatic agent suggestion
  async getAgentSuggestion(message: string): Promise<{ suggestedAgent: AgentType; confidence: number; reason: string } | null> {
    const lowerMessage = message.toLowerCase();
    
    // Simple rule-based agent suggestion (will be enhanced in later phases)
    if (lowerMessage.includes('create') || lowerMessage.includes('generate') || lowerMessage.includes('ui') || lowerMessage.includes('component')) {
      return {
        suggestedAgent: 'generative_ui',
        confidence: 0.8,
        reason: 'Message contains UI/creation keywords - Generative UI agent would be more suitable'
      };
    }
    
    if (lowerMessage.includes('approve') || lowerMessage.includes('review') || lowerMessage.includes('confirm') || lowerMessage.includes('permission')) {
      return {
        suggestedAgent: 'human_loop',
        confidence: 0.9,
        reason: 'Message requires human approval - Human in Loop agent recommended'
      };
    }
    
    if (lowerMessage.includes('predict') || lowerMessage.includes('forecast') || lowerMessage.includes('anticipate') || lowerMessage.includes('what will')) {
      return {
        suggestedAgent: 'predictive_state',
        confidence: 0.7,
        reason: 'Message asks about future states - Predictive State agent could help'
      };
    }
    
    if (lowerMessage.includes('team') || lowerMessage.includes('multiple') || lowerMessage.includes('coordinate') || lowerMessage.includes('collaborate')) {
      return {
        suggestedAgent: 'shared_state',
        confidence: 0.8,
        reason: 'Message involves coordination - Shared State agent for multi-agent collaboration'
      };
    }
    
    if (lowerMessage.includes('form') || lowerMessage.includes('chart') || lowerMessage.includes('table') || lowerMessage.includes('tool') || lowerMessage.includes('widget')) {
      return {
        suggestedAgent: 'tool_ui',
        confidence: 0.9,
        reason: 'Message requests specific UI components - Tool-based UI agent specializes in component generation'
      };
    }
    
    // No clear suggestion
    return null;
  }

  // Reset router state (useful for testing)
  reset(): void {
    this.currentAgent = 'agentic_chat';
    this.state = {
      messages: [],
      currentAgent: 'agentic_chat',
      context: {},
      tools: [],
      isProcessing: false
    };
  }
}

// Singleton instance for the app
export const agentRouter = new AgentRouter(); 