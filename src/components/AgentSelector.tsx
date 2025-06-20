"use client";

import { AgentType, AGENT_CONFIGS } from '@/types/agent-types';

interface AgentSelectorProps {
  currentAgent: AgentType;
  availableAgents: AgentType[];
  onAgentChange: (agent: AgentType) => void;
  disabled?: boolean;
}

export function AgentSelector({ 
  currentAgent, 
  availableAgents, 
  onAgentChange, 
  disabled = false 
}: AgentSelectorProps) {
  return (
    <div className="p-4 bg-white border rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-3">AI Agent Types</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {Object.entries(AGENT_CONFIGS).map(([key, config]) => {
          const agentType = key as AgentType;
          const isAvailable = availableAgents.includes(agentType);
          const isCurrent = agentType === currentAgent;
          
          return (
            <button
              key={agentType}
              onClick={() => isAvailable && !disabled && onAgentChange(agentType)}
              disabled={!isAvailable || disabled}
              className={`
                p-3 rounded-lg border text-left transition-all duration-200
                ${isCurrent 
                  ? 'bg-blue-50 border-blue-500 text-blue-900' 
                  : isAvailable 
                    ? 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-900' 
                    : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{config.name}</span>
                <div className={`
                  w-2 h-2 rounded-full
                  ${isCurrent ? 'bg-blue-500' : isAvailable ? 'bg-green-500' : 'bg-gray-300'}
                `} />
              </div>
              
              <p className="text-xs opacity-75 mb-2">{config.description}</p>
              
              <div className="flex flex-wrap gap-1">
                {config.capabilities.slice(0, 2).map((capability) => (
                  <span
                    key={capability}
                    className={`
                      px-2 py-1 text-xs rounded
                      ${isCurrent 
                        ? 'bg-blue-100 text-blue-700' 
                        : isAvailable 
                          ? 'bg-gray-200 text-gray-600' 
                          : 'bg-gray-200 text-gray-400'
                      }
                    `}
                  >
                    {capability}
                  </span>
                ))}
                {config.capabilities.length > 2 && (
                  <span className="text-xs opacity-50">
                    +{config.capabilities.length - 2} more
                  </span>
                )}
              </div>
              
              {!isAvailable && (
                <div className="mt-2 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                  Coming in Phase {agentType === 'agentic_chat' ? '1' : 
                    agentType === 'generative_ui' ? '2' :
                    agentType === 'human_loop' ? '3' :
                    agentType === 'predictive_state' ? '4' :
                    agentType === 'shared_state' ? '5' : '6'}
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {disabled && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
          Agent switching disabled while processing...
        </div>
      )}
    </div>
  );
} 