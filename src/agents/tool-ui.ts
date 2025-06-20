﻿import { BaseAgent } from './base-agent';
import { AGENT_CONFIGS } from '@/types/agent-types';
import type { AgentResponse } from '@/types/agent-types';
import { FormBuilder } from '@/tools/form-builder';
import { ChartBuilder } from '@/tools/chart-builder';

export class ToolUIAgent extends BaseAgent {
  private formBuilder: FormBuilder;
  private chartBuilder: ChartBuilder;

  constructor() {
    super(AGENT_CONFIGS.tool_ui);
    this.formBuilder = new FormBuilder();
    this.chartBuilder = new ChartBuilder();
  }

  getSystemPrompt(): string {
    return `You are a Tool-based Generative UI AI agent that creates dynamic user interfaces using specialized tools.`;
  }

  getTools(): unknown[] {
    return [];
  }

  async processMessage(): Promise<AgentResponse> {
    return this.createResponse('Tool UI Agent ready!', 'text');
  }
}
