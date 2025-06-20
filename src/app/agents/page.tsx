"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AgentSelector } from '@/components/AgentSelector';
import { useAgent } from '@/hooks/useAgent';
import { AgentType } from '@/types/agent-types';
import Link from 'next/link';

export default function AgentsPage() {
  const router = useRouter();
  const { currentAgent, availableAgents, agentInfo, switchAgent } = useAgent();
  const [isLoading, setIsLoading] = useState(false);

  const handleAgentChange = async (agent: AgentType) => {
    try {
      setIsLoading(true);
      await switchAgent(agent);
      router.push(`/agents/${agent}`);
    } catch (error) {
      console.error('Failed to switch agent:', error);
      alert('Failed to switch agent. This agent type may not be available yet.');
    } finally {
      setIsLoading(false);
    }
  };

  const goToAgentDemo = (agentType: AgentType) => {
    if (availableAgents.includes(agentType)) {
      router.push(`/agents/${agentType}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">🤖 AI Agent Command Center</h1>
          <p className="text-blue-100">
            Select and interact with specialized AI agents for different tasks
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        {/* Current Status */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-2">Current Status</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">
                Active Agent: <strong>{agentInfo.find(a => a.isCurrent)?.name || 'None'}</strong>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm">
                Available: <strong>{availableAgents.length}/6</strong> agent types
              </span>
            </div>
          </div>
        </div>

        {/* Agent Selector */}
        <AgentSelector
          currentAgent={currentAgent}
          availableAgents={availableAgents}
          onAgentChange={handleAgentChange}
          disabled={isLoading}
        />

        {/* Implementation Status */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">🚀 Implementation Status</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-sm">Phase 1: Agentic Chat - <strong>Implemented</strong></span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-sm">Phase 2: Generative UI - <strong>Implemented</strong></span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-sm">Phase 3: Human in Loop - <strong>Implemented</strong></span>
            </div>
                          <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-sm">Phase 4: Predictive State - <strong>Implemented</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-sm">Phase 5: Shared State - <strong>Implemented</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                <span className="text-sm text-gray-600">Phase 6: Tool-based UI - Coming Next</span>
              </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => goToAgentDemo('agentic_chat')}
            disabled={!availableAgents.includes('agentic_chat')}
            className="p-4 bg-white border rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <h3 className="font-semibold text-blue-600 mb-2">💬 Try Agentic Chat</h3>
            <p className="text-sm text-gray-600">
              Enhanced conversational AI with advanced reasoning
            </p>
          </button>

          <button
            onClick={() => goToAgentDemo('generative_ui')}
            disabled={!availableAgents.includes('generative_ui')}
            className="p-4 bg-white border rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <h3 className="font-semibold text-purple-600 mb-2">🎨 Try Generative UI</h3>
            <p className="text-sm text-gray-600">
              Create dynamic React components with AI
            </p>
          </button>

          <button
            onClick={() => goToAgentDemo('human_loop')}
            disabled={!availableAgents.includes('human_loop')}
            className="p-4 bg-white border rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <h3 className="font-semibold text-green-600 mb-2">🤝 Try Human-in-Loop</h3>
            <p className="text-sm text-gray-600">
              Collaborative workflows with approval gates
            </p>
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 mb-2">📋 Phase 3 Ready for Testing</h3>
          <div className="text-sm text-green-700 space-y-1">
            <p>1. Test all three agents: <strong>Agentic Chat</strong>, <strong>Generative UI</strong>, and <strong>Human-in-Loop</strong></p>
            <p>2. Try approval workflows - create processes that need human oversight</p>
            <p>3. Test UI generation and collaborative decision-making</p>
            <p>4. Verify functionality both locally and on Vercel deployment</p>
            <p>5. Ready to proceed to Phase 4 once testing is complete</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-3">🔮 Phase 4: Predictive State Agent</h3>
          <p className="text-gray-600 mb-4">
            Future-aware AI that analyzes current conditions to forecast likely scenarios and provide proactive recommendations.
          </p>
          <div className="space-y-2 mb-4">
            <div className="text-sm text-green-600 font-medium">✅ Status: Implemented & Available</div>
            <div className="text-sm text-gray-500">
              <strong>Capabilities:</strong> Future state prediction, pattern recognition, proactive suggestions, risk assessment
            </div>
          </div>
          <Link
            href="/agents/predictive_state"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Predictive State Agent →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-3">🤝 Phase 5: Shared State Agent</h3>
          <p className="text-gray-600 mb-4">
            Multi-agent coordination with synchronized state management for collaborative workflows and team coordination.
          </p>
          <div className="space-y-2 mb-4">
            <div className="text-sm text-green-600 font-medium">✅ Status: Implemented & Available</div>
            <div className="text-sm text-gray-500">
              <strong>Capabilities:</strong> Project management, task coordination, state synchronization, multi-agent collaboration
            </div>
          </div>
          <Link
            href="/agents/shared_state"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Shared State Agent →
          </Link>
        </div>
      </div>
    </div>
  );
} 