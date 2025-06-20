import { BaseAgent } from './base-agent';
import { AGENT_CONFIGS } from '@/types/agent-types';
import type { AgentResponse, AgentState } from '@/types/agent-types';

interface Prediction {
  id: string;
  scenario: string;
  probability: number;
  timeframe: string;
  actions: string[];
  confidence: number;
}

export class PredictiveStateAgent extends BaseAgent {
  private predictions: Prediction[] = [];

  constructor() {
    super(AGENT_CONFIGS.predictive_state);
  }

  getSystemPrompt(): string {
    return `You are a Predictive State AI agent that analyzes current conditions to forecast future states and provide proactive assistance.

Your capabilities:
- Analyze current state and predict likely future scenarios
- Generate proactive suggestions and recommendations
- Provide confidence-weighted predictions with actionable insights
- Track patterns and identify optimization opportunities

Guidelines:
1. Provide multiple future scenarios with probability weights
2. Include actionable suggestions for each predicted state
3. Consider both opportunities and potential risks
4. Maintain confidence levels and explain reasoning`;
  }

  getTools(): unknown[] {
    return [
      {
        name: 'analyze_state',
        description: 'Analyze current state and predict future scenarios',
        parameters: {
          type: 'object',
          properties: {
            context: { type: 'string' },
            timeframe: { type: 'string' }
          },
          required: ['context']
        }
      }
    ];
  }

  async processMessage(message: string, _state: AgentState): Promise<AgentResponse> {
    try {
      if (!this.validateInput(message)) {
        return this.createResponse(
          "I didn't receive a valid message. Could you please try again?",
          'prediction'
        );
      }

      return await this.generatePredictiveResponse(message);

    } catch (error) {
      return this.handleError(error, message);
    }
  }

  private async generatePredictiveResponse(message: string): Promise<AgentResponse> {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('predict') || lowerMessage.includes('forecast') || lowerMessage.includes('future')) {
      return await this.handlePredictionRequest(message);
    }
    
    return this.createResponse(
      `🔮 **Predictive State Agent Ready!**

I specialize in future-aware assistance and proactive recommendations.

**🧠 Core Capabilities:**
- **Future State Prediction** - Forecast likely scenarios
- **Pattern Recognition** - Identify trends from data
- **Proactive Suggestions** - Generate preventive recommendations
- **Risk Assessment** - Predict potential issues
- **Opportunity Identification** - Spot emerging opportunities

**💡 Try asking me:**
- "Predict the outcome of this project"
- "Analyze trends in performance"
- "Suggest improvements for the future"
- "What should we prepare for?"

**🎯 Prediction Types:**
- **Short-term** (days) - Immediate actions
- **Medium-term** (weeks) - Strategic planning
- **Long-term** (months) - Vision planning

What future scenario would you like me to analyze?`,
      'prediction'
    );
  }

  private async handlePredictionRequest(message: string): Promise<AgentResponse> {
    const predictionId = `pred-${Date.now()}`;
    const timeframe = this.extractTimeframe(message);
    
    const prediction = this.generatePrediction(message, timeframe, predictionId);
    this.predictions.push(prediction);

    return this.createResponse(
      `🔮 **Future State Prediction**

**Prediction ID:** ${predictionId}
**Scenario:** ${prediction.scenario}
**Timeframe:** ${prediction.timeframe}
**Confidence:** ${(prediction.confidence * 100).toFixed(1)}%

**📊 Probability Analysis:**
${(prediction.probability * 100).toFixed(1)}% likelihood this scenario will occur

**🎯 Recommended Actions:**
${prediction.actions.map((action, index) => `${index + 1}. ${action}`).join('\n')}

**💡 Proactive Insights:**
- Monitor key indicators for early detection
- Prepare contingency plans for alternative outcomes
- Focus on high-impact preventive measures
- Optimize current processes for better future results

**Next Steps:**
1. Review the predicted scenario and probability
2. Implement recommended actions
3. Set up monitoring for state changes
4. Prepare for alternative outcomes`,
      'prediction',
      { 
        predictionId,
        prediction
      }
    );
  }

  private extractTimeframe(message: string): string {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('immediate') || lowerMessage.includes('short')) return 'Short-term (1-7 days)';
    if (lowerMessage.includes('long') || lowerMessage.includes('year')) return 'Long-term (3-12 months)';
    return 'Medium-term (2-8 weeks)';
  }

  private generatePrediction(message: string, timeframe: string, id: string): Prediction {
    return {
      id,
      scenario: `Outcome based on: ${message}`,
      probability: 0.75,
      timeframe,
      actions: [
        "Monitor current progress and key metrics",
        "Implement optimization strategies",
        "Prepare contingency plans for variations",
        "Set up early warning indicators"
      ],
      confidence: 0.8
    };
  }

  getCurrentPredictions(): Prediction[] {
    return [...this.predictions];
  }
} 