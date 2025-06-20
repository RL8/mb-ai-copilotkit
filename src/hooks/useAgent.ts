import { useState, useCallback, useEffect } from 'react';
import { AgentType, AgentResponse, AgentState, AgentInfo } from '@/types/agent-types';
import { agentRouter } from '@/agents/agent-router';

interface UseAgentOptions {
  defaultAgent?: AgentType;
  autoSwitchAgents?: boolean;
}

interface UseAgentReturn {
  currentAgent: AgentType;
  availableAgents: AgentType[];
  agentInfo: AgentInfo[];
  isProcessing: boolean;
  lastResponse: AgentResponse | null;
  state: AgentState;
  
  // Actions
  sendMessage: (message: string, targetAgent?: AgentType) => Promise<AgentResponse>;
  switchAgent: (agent: AgentType) => Promise<void>;
  getAgentSuggestion: (message: string) => Promise<unknown>;
  updateContext: (key: string, value: unknown) => void;
  clearContext: () => void;
  reset: () => void;
}

export function useAgent(options: UseAgentOptions = {}): UseAgentReturn {
  const { defaultAgent = 'agentic_chat', autoSwitchAgents = false } = options;
  
  const [currentAgent, setCurrentAgent] = useState<AgentType>(defaultAgent);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResponse, setLastResponse] = useState<AgentResponse | null>(null);
  const [state, setState] = useState<AgentState>(agentRouter.getState());
  const [availableAgents, setAvailableAgents] = useState<AgentType[]>(agentRouter.getAvailableAgents());
  const [agentInfo, setAgentInfo] = useState(agentRouter.getAllAgentsInfo());

  // Update state when router state changes
  const updateState = useCallback(() => {
    setState(agentRouter.getState());
    setCurrentAgent(agentRouter.getCurrentAgent());
    setAvailableAgents(agentRouter.getAvailableAgents());
    setAgentInfo(agentRouter.getAllAgentsInfo());
  }, []);

  const sendMessage = useCallback(async (message: string, targetAgent?: AgentType): Promise<AgentResponse> => {
    try {
      setIsProcessing(true);
      
      // Auto-suggest agent if enabled
      if (autoSwitchAgents && !targetAgent) {
        const suggestion = await agentRouter.getAgentSuggestion(message);
        if (suggestion && suggestion.confidence > 0.7) {
          console.log(`[useAgent] Auto-switching to ${suggestion.suggestedAgent}: ${suggestion.reason}`);
          targetAgent = suggestion.suggestedAgent;
        }
      }

      const response = await agentRouter.processMessage(message, targetAgent);
      setLastResponse(response);
      updateState();
      
      return response;
    } catch (error) {
      console.error('[useAgent] Error sending message:', error);
      const errorResponse: AgentResponse = {
        content: `Error processing message: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'text',
        metadata: { error: true }
      };
      setLastResponse(errorResponse);
      return errorResponse;
    } finally {
      setIsProcessing(false);
    }
  }, [autoSwitchAgents, updateState]);

  const switchAgent = useCallback(async (agent: AgentType): Promise<void> => {
    try {
      await agentRouter.switchAgent(agent);
      updateState();
    } catch (error) {
      console.error('[useAgent] Error switching agent:', error);
      throw error;
    }
  }, [updateState]);

  const getAgentSuggestion = useCallback(async (message: string) => {
    return await agentRouter.getAgentSuggestion(message);
  }, []);

  const updateContext = useCallback((key: string, value: unknown) => {
    agentRouter.updateContext(key, value);
    updateState();
  }, [updateState]);

  const clearContext = useCallback(() => {
    agentRouter.clearContext();
    updateState();
  }, [updateState]);

  const reset = useCallback(() => {
    agentRouter.reset();
    setLastResponse(null);
    updateState();
  }, [updateState]);

  // Initialize state on mount
  useEffect(() => {
    updateState();
  }, [updateState]);

  return {
    currentAgent,
    availableAgents,
    agentInfo,
    isProcessing,
    lastResponse,
    state,
    sendMessage,
    switchAgent,
    getAgentSuggestion,
    updateContext,
    clearContext,
    reset
  };
}

// Hook for CopilotKit integration
export function useAgentWithCopilot() {
  const agent = useAgent({ autoSwitchAgents: true });
  
  // This hook can be extended to integrate more closely with CopilotKit
  // For now, it provides the same interface as useAgent
  
  return {
    ...agent,
    // Add CopilotKit-specific methods here as needed
    isCopilotIntegrated: true
  };
} 