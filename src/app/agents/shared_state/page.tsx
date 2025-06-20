'use client';

import { useState, useEffect } from 'react';
import { useAgent } from '@/hooks/useAgent';
import type { AgentResponse } from '@/types/agent-types';
import { sharedStateManager, ProjectState } from '@/state/sharedStateManager';

export default function SharedStatePage() {
  const [input, setInput] = useState('');
  const [responses, setResponses] = useState<AgentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentProject, setCurrentProject] = useState<ProjectState | null>(null);
  const [activeAgents, setActiveAgents] = useState<string[]>([]);
  const agent = useAgent({ defaultAgent: 'shared_state' });

  useEffect(() => {
    const unsubscribe = sharedStateManager.subscribe((newState) => {
      setCurrentProject(newState.currentProject);
      setActiveAgents(newState.activeAgents);
    });

    setCurrentProject(sharedStateManager.getCurrentProject());
    setActiveAgents(sharedStateManager.getActiveAgents());

    return unsubscribe;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    try {
      const response = await agent.sendMessage(input, 'shared_state');
      setResponses(prev => [...prev, response]);
      setInput('');
    } catch (error) {
      console.error('Error processing message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action: string) => {
    setIsLoading(true);
    try {
      const response = await agent.sendMessage(action, 'shared_state');
      setResponses(prev => [...prev, response]);
    } catch (error) {
      console.error('Error with quick action:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">🤝 Shared State Agent</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Multi-agent coordination and synchronized project state management.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">📁 Current Project</h2>
          {currentProject ? (
            <div className="space-y-2">
              <div><span className="font-medium">Name:</span> {currentProject.name}</div>
              <div><span className="font-medium">Status:</span> {currentProject.status}</div>
              <div><span className="font-medium">Tasks:</span> {currentProject.tasks.length}</div>
            </div>
          ) : (
            <div className="text-gray-500">No active project</div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">🤖 Active Agents ({activeAgents.length})</h2>
          <div className="space-y-2">
            {activeAgents.map((agentId, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{agentId}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">⚡ Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <button
            onClick={() => handleQuickAction('Create a new project called "AI Development"')}
            disabled={isLoading}
            className="p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg disabled:opacity-50"
          >
            <div className="font-semibold text-blue-900">📁 Create Project</div>
          </button>

          <button
            onClick={() => handleQuickAction('Add a task to implement authentication')}
            disabled={isLoading || !currentProject}
            className="p-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg disabled:opacity-50"
          >
            <div className="font-semibold text-green-900">📋 Add Task</div>
          </button>

          <button
            onClick={() => handleQuickAction('Show project status')}
            disabled={isLoading}
            className="p-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg disabled:opacity-50"
          >
            <div className="font-semibold text-purple-900">📊 Status</div>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Coordinate with agents..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={3}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Coordinating...' : 'Send Message'}
          </button>
        </form>
      </div>

      {responses.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">🔄 Results</h2>
          {responses.map((response, index) => (
            <div key={index} className="bg-white rounded-lg border p-6">
              <div dangerouslySetInnerHTML={{ __html: response.content.replace(/\n/g, '<br/>') }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 