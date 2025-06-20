'use client';

import { CopilotChat } from '@copilotkit/react-ui';

export default function ToolUIPage() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">🛠️ Tool-based Generative UI Agent</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Specialized AI that creates interactive forms, charts, and components based on your natural language requests.
        </p>
      </div>

      {/* CopilotKit Chat Interface */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm" style={{ height: '600px' }}>
        <CopilotChat
          instructions="You are a Tool-based Generative UI Agent, specialized in creating forms, charts, tables, and interactive components. When users request UI elements, provide suggestions for forms, charts, data visualizations, or other interactive components. Focus on practical and functional UI solutions."
          labels={{
            title: "🛠️ Tool-based UI Agent",
            initial: "Hello! I'm your Tool-based UI Agent. I can help you create forms, charts, tables, and other interactive components. Try asking me to create a contact form, generate a chart, or build a data table."
          }}
        />
      </div>

      {/* Help Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3">💡 How to Use Tool-based UI Agent</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">🎯 Component Types:</h4>
            <ul className="space-y-1">
              <li>• Dynamic forms with validation</li>
              <li>• Interactive charts and graphs</li>
              <li>• Data tables with sorting</li>
              <li>• Custom UI components</li>
              <li>• Responsive layouts</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">🔧 Best Practices:</h4>
            <ul className="space-y-1">
              <li>• Describe your specific needs clearly</li>
              <li>• Specify data types and validation rules</li>
              <li>• Mention styling preferences</li>
              <li>• Request responsive design</li>
              <li>• Ask for accessibility features</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 