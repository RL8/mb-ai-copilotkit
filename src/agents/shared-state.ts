﻿import { BaseAgent } from './base-agent';
import { AGENT_CONFIGS } from '@/types/agent-types';
import type { AgentResponse } from '@/types/agent-types';
import { 
  sharedStateManager, 
  ProjectStatus, 
  Priority, 
  TaskStatus 
} from '@/state/sharedStateManager';

export class SharedStateAgent extends BaseAgent {
  private stateUnsubscribe?: () => void;

  constructor() {
    super(AGENT_CONFIGS.shared_state);
    
    sharedStateManager.registerAgent('shared_state', {
      role: 'coordinator',
      capabilities: ['project_management', 'task_coordination', 'team_collaboration'],
      status: 'active'
    });

    this.stateUnsubscribe = sharedStateManager.subscribe(() => {
      // Handle state changes
    });
  }

  getSystemPrompt(): string {
    const currentProject = sharedStateManager.getCurrentProject();
    const activeAgents = sharedStateManager.getActiveAgents();
    
    return `You are a Shared State AI agent that coordinates multi-agent collaboration and manages synchronized project state.

Your primary role:
- Manage shared project state across all agents
- Coordinate task assignments and progress tracking
- Facilitate communication between agents
- Ensure state consistency and conflict resolution

Current Context:
- Active Project: ${currentProject?.name || 'None'}
- Project Status: ${currentProject?.status || 'N/A'}
- Active Agents: ${activeAgents.length} (${activeAgents.join(', ')})
- Total Tasks: ${currentProject?.tasks.length || 0}

Guidelines:
1. Always maintain state consistency across all agents
2. Provide clear project status and progress updates
3. Coordinate task assignments efficiently
4. Broadcast important updates to all agents`;
  }

  getTools(): unknown[] {
    return [
      {
        name: 'create_project',
        description: 'Initialize a new shared project'
      },
      {
        name: 'add_task',
        description: 'Add a new task to the project'
      }
    ];
  }

  async processMessage(message: string): Promise<AgentResponse> {
    try {
      if (!this.validateInput(message)) {
        return this.createResponse(
          "I didn't receive a valid message. Could you please try again?",
          'text'
        );
      }

      return await this.generateSharedStateResponse(message);
    } catch (error) {
      return this.handleError(error, message);
    }
  }

  private async generateSharedStateResponse(message: string): Promise<AgentResponse> {
    const lowerMessage = message.toLowerCase();
    const currentProject = sharedStateManager.getCurrentProject();
    
    if (lowerMessage.includes('create') && lowerMessage.includes('project')) {
      return await this.handleCreateProject(message);
    }
    
    if (lowerMessage.includes('task') && lowerMessage.includes('add')) {
      return await this.handleAddTask(message);
    }
    
    if (lowerMessage.includes('status') || lowerMessage.includes('progress')) {
      return await this.handleStatusQuery();
    }

    return this.createResponse(
      `🤝 **Shared State Agent Ready!**

I coordinate multi-agent collaboration and manage synchronized project state.

**🎯 Core Capabilities:**
- **Project Management** - Create and manage shared projects
- **Task Coordination** - Add, update, and track tasks across agents  
- **Team Collaboration** - Coordinate team members and assignments
- **State Synchronization** - Keep all agents in sync with latest state

**📊 Current State:**
${currentProject ? `
**Active Project:** ${currentProject.name}
**Status:** ${currentProject.status}
**Tasks:** ${currentProject.tasks.length} total
**Team:** ${currentProject.team.join(', ') || 'No team assigned'}
` : '**No Active Project** - Create one to get started!'}

**🤖 Active Agents:** ${sharedStateManager.getActiveAgents().length}

**💡 Try asking me:**
- "Create a new project called [name]"
- "Add a task to implement user authentication"
- "Show project status"
- "What's the current progress?"

How can I help coordinate your multi-agent project?`,
      'text'
    );
  }

  private async handleCreateProject(message: string): Promise<AgentResponse> {
    const projectName = this.extractProjectName(message) || 'New Collaborative Project';
    
    const project = sharedStateManager.initializeProject({
      name: projectName,
      description: `Project created via Shared State Agent: ${message}`,
      priority: Priority.MEDIUM,
      status: ProjectStatus.PLANNING,
      team: ['shared_state', 'agentic_chat', 'generative_ui', 'human_loop', 'predictive_state']
    });

    sharedStateManager.broadcastMessage(
      'shared_state',
      `New project "${projectName}" has been created`,
      'success'
    );

    return this.createResponse(
      `✅ **Project Created Successfully!**

**📁 Project Details:**
- **Name:** ${project.name}
- **ID:** ${project.id}
- **Status:** ${project.status}
- **Priority:** ${project.priority}
- **Team:** ${project.team.join(', ')}

**🔄 State Synchronization:**
Project state has been synchronized across all active agents.

**📢 Broadcast:** All active agents have been notified of the new project.`,
      'text',
      { project, action: 'create_project' }
    );
  }

  private async handleAddTask(message: string): Promise<AgentResponse> {
    const currentProject = sharedStateManager.getCurrentProject();
    if (!currentProject) {
      return this.createResponse(
        `❌ **No Active Project**

Please create a project first before adding tasks.`,
        'text'
      );
    }

    const taskTitle = this.extractTaskTitle(message) || 'New Collaborative Task';
    const taskDescription = `Task created from: ${message}`;

    const task = sharedStateManager.addTask({
      title: taskTitle,
      description: taskDescription,
      status: TaskStatus.TODO,
      priority: Priority.MEDIUM,
      tags: ['collaborative'],
      assignee: 'shared_state'
    }, 'shared_state');

    if (!task) {
      return this.createResponse(
        '❌ **Failed to Add Task**\n\nCould not add task to the current project.',
        'text'
      );
    }

    sharedStateManager.broadcastMessage(
      'shared_state',
      `New task "${taskTitle}" has been added to the project`,
      'info'
    );

    return this.createResponse(
      `✅ **Task Added Successfully!**

**📋 Task Details:**
- **Title:** ${task.title}
- **ID:** ${task.id}
- **Status:** ${task.status}
- **Priority:** ${task.priority}
- **Assignee:** ${task.assignee || 'Unassigned'}

**📈 Project Progress:**
Total tasks in project: ${currentProject.tasks.length + 1}

**📢 Broadcast:** All team members have been notified of the new task.`,
      'text',
      { task, action: 'add_task' }
    );
  }

  private async handleStatusQuery(): Promise<AgentResponse> {
    const currentProject = sharedStateManager.getCurrentProject();
    const activeAgents = sharedStateManager.getActiveAgents();

    if (!currentProject) {
      return this.createResponse(
        `📊 **System Status**

**Project:** No active project
**Active Agents:** ${activeAgents.length} (${activeAgents.join(', ')})

Create a project to start tracking progress and coordinating with other agents.`,
        'text'
      );
    }

    const completedTasks = currentProject.tasks.filter(task => task.status === TaskStatus.DONE).length;
    const totalTasks = currentProject.tasks.length;
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return this.createResponse(
      `📊 **Project Status Report**

**📁 Project:** ${currentProject.name}
**🎯 Status:** ${currentProject.status}
**📈 Progress:** ${progressPercentage}% (${completedTasks}/${totalTasks} tasks completed)
**👥 Team:** ${currentProject.team.join(', ')}
**🤖 Active Agents:** ${activeAgents.length}

**📋 Task Breakdown:**
- **To Do:** ${currentProject.tasks.filter(t => t.status === TaskStatus.TODO).length}
- **In Progress:** ${currentProject.tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length}
- **Testing:** ${currentProject.tasks.filter(t => t.status === TaskStatus.TESTING).length}
- **Done:** ${completedTasks}
- **Blocked:** ${currentProject.tasks.filter(t => t.status === TaskStatus.BLOCKED).length}

**🕒 Last Updated:** ${currentProject.lastUpdated.toLocaleString()}`,
      'text'
    );
  }

  private extractProjectName(message: string): string | null {
    const patterns = [
      /create.*project.*['""`]([^'""`]+)['""`]/i,
      /project.*called\s+['""`]([^'""`]+)['""`]/i,
      /new.*project\s+([a-zA-Z\s]+?)(?:\s|$)/i
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return null;
  }

  private extractTaskTitle(message: string): string | null {
    const patterns = [
      /add.*task.*['""`]([^'""`]+)['""`]/i,
      /task.*['""`]([^'""`]+)['""`]/i,
      /add.*([a-zA-Z\s]+)(?:\s+task|$)/i
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return null;
  }

  destroy(): void {
    if (this.stateUnsubscribe) {
      this.stateUnsubscribe();
    }
  }
}
