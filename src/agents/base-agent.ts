import { AgentConfig, AgentType, AgentResponse, AgentState } from '@/types/agent-types';

export abstract class BaseAgent {
  protected config: AgentConfig;
  protected tools: unknown[];
  
  constructor(config: AgentConfig) {
    this.config = config;
    this.tools = [];
  }

  // Abstract methods that each agent type must implement
  abstract processMessage(message: string, state: AgentState): Promise<AgentResponse>;
  abstract getSystemPrompt(): string;
  abstract getTools(): unknown[];

  // Shared functionality
  getId(): string {
    return this.config.id;
  }

  getName(): string {
    return this.config.name;
  }

  getType(): AgentType {
    return this.config.type;
  }

  getCapabilities(): string[] {
    return this.config.capabilities;
  }

  getDescription(): string {
    return this.config.description;
  }

  // Helper method to create standardized responses
  protected createResponse(
    content: string, 
    type: AgentResponse['type'] = 'text',
    metadata?: Record<string, unknown>
  ): AgentResponse {
    return {
      content,
      type,
      metadata: {
        agentId: this.getId(),
        agentType: this.getType(),
        timestamp: new Date().toISOString(),
        ...metadata
      }
    };
  }

  // Helper method to enhance messages with agent context
  protected enhanceMessage(message: string, state: AgentState): string {
    const context = state.context || {};
    const previousMessages = state.messages.slice(-3); // Last 3 messages for context
    
    let enhancedMessage = message;
    
    // Add relevant context
    if (Object.keys(context).length > 0) {
      enhancedMessage += `\n\nContext: ${JSON.stringify(context, null, 2)}`;
    }
    
    // Add conversation history
    if (previousMessages.length > 0) {
      const history = previousMessages
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');
      enhancedMessage += `\n\nRecent conversation:\n${history}`;
    }
    
    return enhancedMessage;
  }

  // Validation helper
  protected validateInput(message: string): boolean {
    return typeof message === 'string' && message.trim().length > 0;
  }

  // Error handling helper
  protected handleError(error: unknown, message: string): AgentResponse {
    console.error(`[${this.getName()}] Error processing message:`, error);
          return this.createResponse(
        `I encountered an error while processing your request: ${message}. Please try again.`,
        'text',
        { error: error instanceof Error ? error.message : 'Unknown error', originalMessage: message }
    );
  }
} 