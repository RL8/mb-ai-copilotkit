'use client';

import { CopilotChat } from '@copilotkit/react-ui';

export default function PredictiveStatePage() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">🔮 Predictive State Agent</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Future-aware AI that analyzes current conditions to forecast likely scenarios and provide proactive recommendations.
        </p>
      </div>

      {/* CopilotKit Chat Interface */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm" style={{ height: '600px' }}>
        <CopilotChat
          instructions="You are a Predictive State Agent, specialized in forecasting and future scenario analysis. When users ask questions, provide detailed predictions with confidence levels, timelines, and actionable recommendations. Focus on practical insights and risk assessment."
          labels={{
            title: "🔮 Predictive State Agent",
            initial: "Hello! I'm your Predictive State Agent. I can help you forecast scenarios, analyze trends, and predict outcomes. Try asking me about project success rates, user engagement forecasts, or performance optimization opportunities."
          }}
        />
      </div>

      {/* Help Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3">💡 How to Use Predictive State Agent</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">🎯 Prediction Types:</h4>
            <ul className="space-y-1">
              <li>• Short-term outcomes (days)</li>
              <li>• Medium-term forecasts (weeks)</li>
              <li>• Long-term projections (months)</li>
              <li>• Risk assessments</li>
              <li>• Opportunity identification</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">🔧 Best Practices:</h4>
            <ul className="space-y-1">
              <li>• Provide context about current situation</li>
              <li>• Specify desired timeframe</li>
              <li>• Include relevant variables</li>
              <li>• Ask for actionable recommendations</li>
              <li>• Request confidence levels</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 