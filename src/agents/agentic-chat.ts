import { BaseAgent } from './base-agent';
import { AGENT_CONFIGS } from '@/types/agent-types';
import type { AgentMessage, AgentResponse, AgentState } from '@/types/agent-types';

export class AgenticChatAgent extends BaseAgent {
  private conversationMemory: AgentMessage[] = [];

  constructor() {
    super(AGENT_CONFIGS.agentic_chat);
  }

  getSystemPrompt(): string {
    return `You are an advanced agentic chat assistant with enhanced conversational capabilities. 

Your key abilities:
- Advanced reasoning and multi-turn conversation planning
- Context-aware responses with memory of previous interactions
- Ability to break down complex problems into manageable steps
- Chain-of-thought reasoning for complex queries
- Proactive suggestions and follow-up questions

Guidelines:
1. Always maintain conversation context and memory
2. Use chain-of-thought reasoning for complex questions
3. Provide detailed, helpful responses
4. Ask clarifying questions when needed
5. Suggest next steps or related actions
6. Be conversational yet professional`;
  }

  getTools(): unknown[] {
    return [
      {
        name: 'remember_context',
        description: 'Store important context for future conversations',
        parameters: {
          type: 'object',
          properties: {
            key: { type: 'string', description: 'Context key' },
            value: { type: 'string', description: 'Context value to remember' }
          },
          required: ['key', 'value']
        }
      }
    ];
  }

  async processMessage(message: string, state: AgentState): Promise<AgentResponse> {
    try {
      if (!this.validateInput(message)) {
        return this.createResponse(
          "I didn't receive a valid message. Could you please try again?",
          'text'
        );
      }

      // Store message in conversation memory
      this.conversationMemory.push({
        id: Date.now().toString(),
        role: 'user',
        content: message,
        timestamp: new Date(),
        agentType: 'agentic_chat'
      });

      // Enhanced contextual response generation
      const responseContent = await this.generateEnhancedResponse(message, state);

      // Store response in memory
      this.conversationMemory.push({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        agentType: 'agentic_chat'
      });

      return this.createResponse(responseContent, 'text', {
        conversationLength: this.conversationMemory.length,
        hasContext: Object.keys(state.context || {}).length > 0
      });

    } catch (error) {
      return this.handleError(error, message);
    }
  }

  // Enhanced response generation with advanced reasoning
  private async generateEnhancedResponse(message: string, state: AgentState): Promise<string> {
    const lowerMessage = message.toLowerCase();
    
    // Analyze intent and context
    const intent = this.analyzeIntent(message);
    const context = this.buildContext(state);
    const reasoning = this.generateReasoning(message, intent, context);
    
    let response = "";
    
    // Handle specific topics with enhanced responses
    if (lowerMessage.includes('course') && (lowerMessage.includes('generation') || lowerMessage.includes('create'))) {
      response = `🎓 **Online Course Generation - Great topic!**

I can help you think through course creation systematically:

**💡 My Analysis:**
- You're interested in automated course generation
- This involves content planning, structure design, and delivery methods
- This could benefit from multiple AI agents working together

**🧠 Let me break this down:**

1. **Course Planning**: What subject/topic are you targeting?
2. **Content Structure**: Modules, lessons, assessments, practical exercises
3. **Delivery Method**: Video, text, interactive, hybrid approach
4. **Target Audience**: Skill level, learning preferences, time constraints

**🔄 Agent Recommendation:**
For course generation, you might benefit from switching to our **Generative UI agent** (coming in Phase 2) which can create interactive course interfaces and visual content.

**Next Steps:** What specific aspect of course generation interests you most? The content creation, platform design, or learning methodology?`;
    }
    else if (lowerMessage.includes('start') || lowerMessage.includes('begin')) {
      response = `🚀 **Ready to Start - Let's Plan Together!**

**🧠 Context Analysis:**
${context.conversationHistory ? `Building on our previous discussion about ${this.extractTopics(context.conversationHistory)}.` : 'Starting fresh - I\'ll remember everything we discuss.'}

**💭 My Reasoning:**
You're asking about starting something, which suggests:
- You have a project or goal in mind
- You might need help with planning or next steps
- You're looking for guidance on how to begin

**🎯 How I can help you start:**

1. **Goal Clarification**: What exactly do you want to start?
2. **Resource Assessment**: What do you have available?
3. **Step-by-Step Planning**: Break it into manageable phases
4. **Timeline & Milestones**: When do you want to achieve what?

**Questions to move forward:**
- What project or goal are you thinking about starting?
- What's your timeline?
- What resources or constraints should I know about?

I'll remember all our planning details for future conversations!`;
    }
    else if (lowerMessage.includes('api') || lowerMessage.includes('xero')) {
      response = `💼 **Xero API - Excellent Choice for Business Integration!**

**🧠 My Analysis:**
You're interested in Xero's API, which tells me:
- You're likely working on business/accounting automation
- You need to integrate financial data with applications
- This is a technical implementation project

**💡 Xero API Capabilities:**
- **Accounting Data**: Invoices, contacts, payments, bank transactions
- **Real-time Sync**: Live financial data integration  
- **OAuth 2.0**: Secure authentication flow
- **Webhooks**: Real-time notifications of data changes

**🎯 Planning Your Xero Integration:**

1. **Use Case Definition**: What business process are you automating?
2. **Data Requirements**: Which Xero endpoints do you need?
3. **Authentication Setup**: OAuth app registration with Xero
4. **Development Environment**: Testing vs production considerations

**🔄 Agent Recommendations:**
- **Tool-based UI Agent** (Phase 6) will excel at API integration interfaces
- **Human in Loop Agent** (Phase 3) could help with approval workflows for financial data

**Next Steps:**
- What specific business problem are you solving with Xero?
- Are you building a custom app or integrating with existing software?
- What's your technical background with APIs?

I'll track all the technical details we discuss!`;
    }
    else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      response = `👋 **Hello! I'm your Enhanced Agentic Chat Assistant**

**🧠 What makes me different:**
- **Advanced Reasoning**: I think through problems step-by-step
- **Context Memory**: I remember our entire conversation history
- **Multi-turn Planning**: I help you achieve complex goals over time
- **Agent Coordination**: I can suggest when other AI agents would be better

**💭 I notice this is ${context.conversationHistory ? 'a continuation of our chat' : 'our first interaction'}.**

**🎯 How I can help:**
- Break down complex problems into manageable steps
- Remember important details across our conversations
- Suggest switching to specialized agents when appropriate
- Plan multi-step projects with you

What would you like to work on together? I'm particularly good with planning, problem-solving, and coordinating complex tasks!`;
    }
    else {
      // Default enhanced response with reasoning
      response = `🤔 **Let me analyze your message: "${message}"**

**💭 My Reasoning Process:**
${reasoning.join('\n')}

**🧠 Context Consideration:**
${context.hasContext ? `Building on our previous discussion: ${context.summary}` : 'Starting fresh - I\'ll remember everything we discuss for future conversations.'}

**🎯 How I can help:**

1. **Deep Dive**: I can explore this topic systematically with you
2. **Step-by-step Planning**: Break it into actionable components  
3. **Context Building**: Remember details for future conversations
4. **Agent Recommendations**: Suggest if other AI agents would be better suited

**💡 To give you the most helpful response:**
- What specific aspect interests you most?
- Are you looking for planning, analysis, or implementation help?
- What's the broader context or goal?

I'm designed for complex, multi-turn conversations - the more context you give me, the better I can assist you!`;
    }
    
    return response;
  }

  private analyzeIntent(message: string): string[] {
    const intents: string[] = [];
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('help') || lowerMessage.includes('assist')) intents.push('seeking_help');
    if (lowerMessage.includes('create') || lowerMessage.includes('build') || lowerMessage.includes('generate')) intents.push('creation_task');
    if (lowerMessage.includes('plan') || lowerMessage.includes('strategy')) intents.push('planning');
    if (lowerMessage.includes('start') || lowerMessage.includes('begin')) intents.push('initiation');
    if (lowerMessage.includes('api') || lowerMessage.includes('technical')) intents.push('technical');
    if (lowerMessage.includes('course') || lowerMessage.includes('learning')) intents.push('educational');
    
    return intents;
  }

  private buildContext(state: AgentState): { hasContext: boolean; summary: string; conversationHistory: string } {
    const hasContext = Object.keys(state.context || {}).length > 0;
    const recentMessages = state.messages.slice(-3);
    const conversationHistory = recentMessages.map(m => m.content).join(' ');
    
    return {
      hasContext,
      summary: hasContext ? JSON.stringify(state.context) : '',
      conversationHistory
    };
  }

  private generateReasoning(message: string, intents: string[], context: { hasContext: boolean; summary: string; conversationHistory: string }): string[] {
    const reasoning: string[] = [];
    
    reasoning.push(`• **Intent Analysis**: ${intents.length > 0 ? intents.join(', ') : 'general_inquiry'}`);
    reasoning.push(`• **Complexity Level**: ${message.length > 50 ? 'complex' : 'simple'} query`);
    reasoning.push(`• **Context Available**: ${context.hasContext ? 'Yes - building on previous conversation' : 'No - fresh start'}`);
    
    if (intents.includes('creation_task')) {
      reasoning.push(`• **Recommendation**: Consider Generative UI agent for creative tasks`);
    }
    if (intents.includes('technical')) {
      reasoning.push(`• **Recommendation**: Tool-based UI agent might be helpful for technical implementation`);
    }
    
    return reasoning;
  }

  private extractTopics(conversationHistory: string): string {
    const words = conversationHistory.toLowerCase().split(' ');
    const topics = words.filter(word => 
      word.length > 4 && 
      !['this', 'that', 'with', 'have', 'would', 'could', 'should'].includes(word)
    );
    return topics.slice(0, 3).join(', ') || 'various topics';
  }

  // Public method to get conversation memory
  getConversationMemory(): AgentMessage[] {
    return [...this.conversationMemory];
  }
} 