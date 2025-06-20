'use client';

import { CopilotChat } from '@copilotkit/react-ui';

export default function SharedStatePage() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">🤝 Shared State Agent</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Multi-agent coordination specialist that manages shared state, facilitates collaboration, and synchronizes team workflows.
        </p>
      </div>

      {/* CopilotKit Chat Interface */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm" style={{ height: '600px' }}>
        <CopilotChat
          instructions="You are a Shared State Agent, specialized in multi-agent coordination and project management. Help users with team collaboration, project planning, task management, and workflow coordination. Focus on organizing work, managing shared resources, and facilitating communication between team members."
          labels={{
            title: "🤝 Shared State Agent",
            initial: "Hello! I'm your Shared State Agent. I can help you coordinate projects, manage team workflows, assign tasks, and maintain shared state across multiple agents or team members. Try asking me about project planning, team coordination, or task management."
          }}
        />
      </div>

      {/* Help Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3">💡 How to Use Shared State Agent</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">🎯 Coordination Features:</h4>
            <ul className="space-y-1">
              <li>• Project planning and management</li>
              <li>• Task assignment and tracking</li>
              <li>• Team communication facilitation</li>
              <li>• Resource coordination</li>
              <li>• Workflow synchronization</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">🔧 Best Practices:</h4>
            <ul className="space-y-1">
              <li>• Define clear project goals</li>
              <li>• Assign specific responsibilities</li>
              <li>• Set realistic timelines</li>
              <li>• Track progress regularly</li>
              <li>• Facilitate team communication</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 