"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAgent } from '@/hooks/useAgent';
import { AgentResponse } from '@/types/agent-types';

export default function GenerativeUIPage() {
  const { sendMessage, isProcessing } = useAgent({ defaultAgent: 'generative_ui' });
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date; type?: string }>>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    setInput('');

    setMessages(prev => [...prev, { 
      role: 'user', 
      content: userMessage, 
      timestamp: new Date() 
    }]);

    try {
      const response: AgentResponse = await sendMessage(userMessage);
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.content, 
        timestamp: new Date(),
        type: response.type
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.', 
        timestamp: new Date() 
      }]);
    }
  };

  const quickMessages = [
    "Create a contact form",
    "Generate a modern button", 
    "Build a product card",
    "Make a navigation bar",
    "Create a dashboard layout",
    "Generate a user profile card"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex flex-col">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">🎨 Generative UI Demo</h1>
            <p className="text-purple-100">Dynamic React component generation</p>
          </div>
          <Link 
            href="/agents" 
            className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
          >
            ← Back to Agents
          </Link>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full p-4">
        <div className="mb-4 p-3 bg-white rounded-lg shadow-sm border flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-sm font-medium">Agent: Generative UI</span>
            <span className="text-sm text-gray-600">
              {isProcessing ? 'Generating...' : 'Ready to Create'}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            Components: {messages.filter(m => m.type === 'ui').length}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border flex flex-col h-96">
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-4">🎨</div>
                <h3 className="text-lg font-semibold mb-2">Welcome to Generative UI!</h3>
                <p className="text-sm mb-4">
                  Describe any UI component and I&apos;ll generate working React code for you.
                </p>
                
                <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
                  {quickMessages.map((message, index) => (
                    <button
                      key={index}
                      onClick={() => setInput(message)}
                      className="p-2 text-sm bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-700 transition-colors"
                    >
                      {message}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </div>
                  <div className="text-xs mt-1 opacity-75">
                    {message.timestamp.toLocaleTimeString()}
                    {message.type === 'ui' && (
                      <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 rounded">
                        UI Generated
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <span className="text-sm text-gray-600">Generating UI...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t p-4">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe the UI component you want to create..."
                disabled={isProcessing}
                className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isProcessing || !input.trim()}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {isProcessing ? '...' : 'Create'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 