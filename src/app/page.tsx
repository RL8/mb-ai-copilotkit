"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import Image from "next/image";

{/* GitHub-to-Vercel integration test - deployment working! */}
export default function Home() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <h1 className="text-3xl font-bold mb-2">AG-UI + LangChain Chat</h1>
          <p className="text-blue-100">
            Embedded chat interface powered by LangChain
          </p>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 flex">
          {/* Left Panel - Info */}
          <div className="w-1/3 bg-gray-50 p-6 border-r">
            <h2 className="text-xl font-semibold mb-4">Welcome!</h2>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-medium text-gray-800 mb-2">🚀 Getting Started</h3>
                <p className="text-sm text-gray-600">
                  Start chatting with your AI assistant in the chat panel on the right.
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-medium text-gray-800 mb-2">💡 Try These:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• &ldquo;Hello, how are you?&rdquo;</li>
                  <li>• &ldquo;What is AG-UI?&rdquo;</li>
                  <li>• &ldquo;Explain LangChain&rdquo;</li>
                  <li>• &ldquo;Help me with a task&rdquo;</li>
                </ul>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-medium text-gray-800 mb-2">⚙️ Status</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Chat Ready</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Panel - Embedded Chat */}
          <div className="flex-1 flex flex-col">
            <div className="bg-white border-b px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-800">LangChain Assistant</h2>
              <p className="text-sm text-gray-500">Powered by AG-UI</p>
            </div>
            
            <div className="flex-1">
              <CopilotChat
                instructions="You are a helpful AI assistant powered by LangChain and AG-UI. Be friendly, helpful, and informative in your responses. You're embedded directly in the page interface."
                labels={{
                  title: "Chat with AI",
                  initial: "👋 Hi! I'm your LangChain-powered assistant. I'm now embedded directly in the page. How can I help you today?",
                  placeholder: "Type your message here...",
                }}
                className="h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </CopilotKit>
  );
}
