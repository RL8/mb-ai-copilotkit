"use client";

import { CopilotChat } from '@copilotkit/react-ui';

export default function GenerativeUIPage() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">🎨 Generative UI Agent</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          AI that creates dynamic React components and user interfaces based on your natural language descriptions.
        </p>
      </div>

      {/* CopilotKit Chat Interface */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm" style={{ height: '600px' }}>
        <CopilotChat
          instructions="You are a Generative UI Agent, specialized in creating React components and user interfaces. When users describe UI elements they need, provide suggestions for components, layouts, forms, buttons, and other interface elements. Focus on practical, modern, and accessible design solutions. Describe components in detail and suggest implementation approaches."
          labels={{
            title: "🎨 Generative UI Agent",
            initial: "Hello! I'm your Generative UI Agent. I can help you design and create React components, forms, layouts, and other user interface elements. Try asking me to create a contact form, design a dashboard, or build a navigation component."
          }}
        />
      </div>

      {/* Help Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3">💡 How to Use Generative UI Agent</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">🎯 Component Types:</h4>
            <ul className="space-y-1">
              <li>• Forms and input components</li>
              <li>• Navigation and menus</li>
              <li>• Cards and layouts</li>
              <li>• Buttons and interactive elements</li>
              <li>• Dashboard components</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">🔧 Best Practices:</h4>
            <ul className="space-y-1">
              <li>• Describe the purpose clearly</li>
              <li>• Specify visual requirements</li>
              <li>• Mention interaction needs</li>
              <li>• Request responsive design</li>
              <li>• Ask for accessibility features</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 