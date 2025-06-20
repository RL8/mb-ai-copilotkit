"use client";

import { CopilotChat } from '@copilotkit/react-ui';

export default function HumanLoopPage() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">🤝 Human-in-Loop Agent</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Collaborative AI that creates workflows with human oversight, approval checkpoints, and review processes.
        </p>
      </div>

      {/* CopilotKit Chat Interface */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm" style={{ height: '600px' }}>
        <CopilotChat
          instructions="You are a Human-in-Loop Agent, specialized in creating workflows that involve human oversight and approval processes. When users describe tasks or projects, design approval workflows, checkpoints, and review processes that ensure human oversight at critical decision points. Focus on collaboration and governance."
          labels={{
            title: "🤝 Human-in-Loop Agent",
            initial: "Hello! I'm your Human-in-Loop Agent. I can help you design approval workflows, create review processes, and set up human oversight checkpoints for projects. Try asking me about implementing user authentication approval workflows or creating project review processes."
          }}
        />
      </div>

      {/* Help Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3">💡 How to Use Human-in-Loop Agent</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">🎯 Workflow Types:</h4>
            <ul className="space-y-1">
              <li>• Approval workflows and gates</li>
              <li>• Review and quality checkpoints</li>
              <li>• Collaborative decision processes</li>
              <li>• Escalation procedures</li>
              <li>• Governance frameworks</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">🔧 Best Practices:</h4>
            <ul className="space-y-1">
              <li>• Define approval criteria clearly</li>
              <li>• Set appropriate escalation paths</li>
              <li>• Include human oversight points</li>
              <li>• Design review checkpoints</li>
              <li>• Plan for collaborative decisions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 