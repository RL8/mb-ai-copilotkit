"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { CopilotChat } from '@copilotkit/react-ui';

export default function AgenticChatPage() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit" agent="agentic_chat">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">🧠 Agentic Chat Agent</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Advanced conversational AI with enhanced reasoning capabilities and business analysis expertise.
          </p>
        </div>

        {/* CopilotKit Chat Interface */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm" style={{ height: '600px' }}>
          <CopilotChat
            instructions="You are an Agentic Chat Agent, an advanced AI assistant with enhanced reasoning capabilities. You specialize in business analysis, strategic thinking, and complex problem-solving. When users ask questions, provide thoughtful, detailed responses with analysis and actionable insights. Think step-by-step and explain your reasoning."
            labels={{
              title: "🧠 Agentic Chat Agent",
              initial: "Hello! I'm your Agentic Chat Agent with enhanced reasoning capabilities. I can help you with business analysis, strategic planning, complex problem-solving, and detailed reasoning. Try asking me about building an e-commerce website, business strategies, or any complex topic you'd like analyzed."
            }}
          />
        </div>

      {/* Help Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3">💡 How to Use Agentic Chat Agent</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">🎯 Capabilities:</h4>
            <ul className="space-y-1">
              <li>• Advanced reasoning and analysis</li>
              <li>• Business strategy consultation</li>
              <li>• Complex problem breakdown</li>
              <li>• Step-by-step guidance</li>
              <li>• Strategic planning assistance</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">🔧 Best Practices:</h4>
            <ul className="space-y-1">
              <li>• Ask complex, open-ended questions</li>
              <li>• Request detailed analysis</li>
              <li>• Seek strategic recommendations</li>
              <li>• Ask for reasoning explanations</li>
              <li>• Request step-by-step breakdowns</li>
            </ul>
          </div>
        </div>
      </div>
      </div>
    </CopilotKit>
  );
} 