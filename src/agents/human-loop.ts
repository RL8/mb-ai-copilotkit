import { BaseAgent } from './base-agent';
import { AGENT_CONFIGS } from '@/types/agent-types';
import type { AgentResponse, AgentState } from '@/types/agent-types';

interface ApprovalRequest {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: Date;
}

export class HumanLoopAgent extends BaseAgent {
  private approvalQueue: ApprovalRequest[] = [];

  constructor() {
    super(AGENT_CONFIGS.human_loop);
  }

  getSystemPrompt(): string {
    return `You are a Human-in-the-Loop AI agent that facilitates collaborative decision-making between AI and humans.

Your capabilities:
- Create approval workflows for important decisions
- Generate step-by-step tasks that require human oversight
- Pause execution for human input when needed
- Track approval status and manage pending actions

Guidelines:
1. Always request approval for significant actions
2. Break complex tasks into manageable steps
3. Provide clear context for decisions
4. Track approval status transparently`;
  }

  getTools(): unknown[] {
    return [
      {
        name: 'request_approval',
        description: 'Request human approval for an action',
        parameters: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' }
          },
          required: ['title', 'description']
        }
      }
    ];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async processMessage(message: string, _state: AgentState): Promise<AgentResponse> {
    try {
      if (!this.validateInput(message)) {
        return this.createResponse(
          "I didn't receive a valid message. Could you please try again?",
          'approval_request'
        );
      }

      return await this.generateApprovalResponse(message);

    } catch (error) {
      return this.handleError(error, message);
    }
  }

  private async generateApprovalResponse(message: string): Promise<AgentResponse> {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('approve') || lowerMessage.includes('workflow')) {
      return await this.handleApprovalRequest(message);
    }
    
    return this.createResponse(
      `🤝 **Human-in-the-Loop Agent Ready!**

I specialize in collaborative workflows that combine AI efficiency with human oversight.

**🔄 Core Capabilities:**
- **Approval Workflows** - Create checkpoints for important decisions
- **Task Breakdown** - Split complex work into manageable steps
- **Decision Support** - Present options with recommendations
- **Progress Tracking** - Monitor approval status

**💡 Try asking me:**
- "Create an approval workflow for deploying code"
- "Break down a marketing campaign into steps"
- "Help me decide between project approaches"
- "Set up a content review process"

What workflow would you like me to help you design?`,
      'approval_request'
    );
  }

  private async handleApprovalRequest(message: string): Promise<AgentResponse> {
    const approvalId = `approval-${Date.now()}`;
    
    const approval: ApprovalRequest = {
      id: approvalId,
      title: this.extractTitle(message),
      description: message,
      status: 'pending',
      timestamp: new Date()
    };

    this.approvalQueue.push(approval);

    return this.createResponse(
      `🔐 **Approval Request Created**

**Request ID:** ${approvalId}
**Title:** ${approval.title}

**📋 Details:**
${approval.description}

**⏳ Status:** Pending human approval
**🕒 Created:** ${approval.timestamp.toLocaleString()}

**Next Steps:**
1. Review the request details
2. Click "Approve" or "Reject"
3. I'll proceed based on your decision

This request is now in your approval queue.`,
      'approval_request',
      { 
        approvalId,
        approvalRequest: approval
      }
    );
  }

  private extractTitle(message: string): string {
    const words = message.split(' ').slice(0, 6);
    return words.join(' ') + (words.length >= 6 ? '...' : '');
  }

  getPendingApprovals(): ApprovalRequest[] {
    return this.approvalQueue.filter(a => a.status === 'pending');
  }

  approveRequest(approvalId: string): boolean {
    const approval = this.approvalQueue.find(a => a.id === approvalId);
    if (approval) {
      approval.status = 'approved';
      return true;
    }
    return false;
  }

  rejectRequest(approvalId: string): boolean {
    const approval = this.approvalQueue.find(a => a.id === approvalId);
    if (approval) {
      approval.status = 'rejected';
      return true;
    }
    return false;
  }
} 