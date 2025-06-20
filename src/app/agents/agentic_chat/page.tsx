"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAgent } from '@/hooks/useAgent';
import { AgentResponse } from '@/types/agent-types';

export default function AgenticChatPage() {
  const { sendMessage, isProcessing } = useAgent({ defaultAgent: 'agentic_chat' });
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>>([]);
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
        timestamp: new Date() 
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error processing your message. Please try again.', 
        timestamp: new Date() 
      }]);
    }
  };

  const quickMessages = [
    "Hello! How are you?",
    "Help me understand what you can do",
    "Explain how agentic chat works",
    "What makes you different from basic chat?",
    "Can you help me plan something complex?"
  ];

  const handleQuickMessage = (message: string) => {
    setInput(message);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">🧠 Agentic Chat Demo</h1>
            <p className="text-blue-100">Advanced conversational AI with reasoning capabilities</p>
          </div>
          <Link 
            href="/agents" 
            className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
          >
            ← Back to Agents
          </Link>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 max-w-4xl mx-auto w-full p-4 flex flex-col">
        {/* Status Bar */}
        <div className="mb-4 p-3 bg-white rounded-lg shadow-sm border flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">Agent: Agentic Chat</span>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <span className="text-sm text-gray-600">
              {isProcessing ? 'Processing...' : 'Ready'}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            Messages: {messages.length}
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border flex flex-col">
          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 min-h-[400px]">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="text-lg font-semibold mb-2">Welcome to Agentic Chat!</h3>
                <p className="text-sm mb-4">
                  I&apos;m an advanced AI assistant with enhanced reasoning capabilities. 
                  Try one of the quick messages below or type your own.
                </p>
                
                {/* Quick Message Buttons */}
                <div className="max-w-md mx-auto space-y-2">
                  {quickMessages.map((message, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickMessage(message)}
                      className="w-full p-2 text-sm bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 transition-colors"
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
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div
                    className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <span className="text-sm text-gray-600">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <div className="border-t p-4">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message here..."
                disabled={isProcessing}
                className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isProcessing || !input.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? '...' : 'Send'}
              </button>
            </form>
            
            <div className="mt-2 text-xs text-gray-500 text-center">
              Press Enter to send • This is an enhanced agentic chat with reasoning capabilities
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 