'use client';

import { useState } from 'react';
import { useAgent } from '@/hooks/useAgent';
import type { AgentResponse } from '@/types/agent-types';

export default function PredictiveStatePage() {
  const [input, setInput] = useState('');
  const [predictions, setPredictions] = useState<AgentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const agent = useAgent({ defaultAgent: 'predictive_state' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    try {
      const response = await agent.sendMessage(input, 'predictive_state');
      setPredictions(prev => [...prev, response]);
      setInput('');
    } catch (error) {
      console.error('Error processing message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPredict = async (scenario: string) => {
    setIsLoading(true);
    try {
      const response = await agent.sendMessage(`Predict: ${scenario}`, 'predictive_state');
      setPredictions(prev => [...prev, response]);
    } catch (error) {
      console.error('Error with quick prediction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">🔮 Predictive State Agent</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Future-aware AI that analyzes current conditions to forecast likely scenarios and provide proactive recommendations.
        </p>
      </div>

      {/* Quick Prediction Buttons */}
      <div className="grid md:grid-cols-3 gap-4">
        <button
          onClick={() => handleQuickPredict('project success rate for next quarter')}
          disabled={isLoading}
          className="p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-left transition-colors disabled:opacity-50"
        >
          <div className="font-semibold text-blue-900">📈 Project Forecast</div>
          <div className="text-sm text-blue-700">Predict project outcomes</div>
        </button>

        <button
          onClick={() => handleQuickPredict('user engagement trends over next month')}
          disabled={isLoading}
          className="p-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-left transition-colors disabled:opacity-50"
        >
          <div className="font-semibold text-green-900">👥 Engagement Analysis</div>
          <div className="text-sm text-green-700">Forecast user behavior</div>
        </button>

        <button
          onClick={() => handleQuickPredict('system performance optimization opportunities')}
          disabled={isLoading}
          className="p-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-left transition-colors disabled:opacity-50"
        >
          <div className="font-semibold text-purple-900">⚡ Performance Optimization</div>
          <div className="text-sm text-purple-700">Identify improvements</div>
        </button>
      </div>

      {/* Prediction Input Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">🎯 Custom Prediction Request</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="prediction-input" className="block text-sm font-medium text-gray-700 mb-2">
              What would you like me to predict or analyze?
            </label>
            <textarea
              id="prediction-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g., 'Predict the outcome if we implement this new feature', 'Analyze trends in customer satisfaction', 'Forecast resource needs for next quarter'"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Generating Prediction...' : 'Generate Prediction'}
          </button>
        </form>
      </div>

      {/* Predictions Display */}
      {predictions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">🔮 Prediction Results</h2>
          {predictions.map((prediction, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="prose max-w-none">
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: prediction.content.replace(/\n/g, '<br/>') 
                  }} 
                />
              </div>
              
              {/* Prediction Metadata */}
              {prediction.metadata && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">Prediction Details:</div>
                                                              {prediction.metadata.predictionId && typeof prediction.metadata.predictionId === 'string' && (
                        <div>ID: {prediction.metadata.predictionId}</div>
                     )}
                     {prediction.metadata.timeframe && typeof prediction.metadata.timeframe === 'string' && (
                        <div>Timeframe: {prediction.metadata.timeframe}</div>
                     )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Help Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3">💡 How to Use Predictive State Agent</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">🎯 Prediction Types:</h4>
            <ul className="space-y-1">
              <li>• Short-term outcomes (days)</li>
              <li>• Medium-term forecasts (weeks)</li>
              <li>• Long-term projections (months)</li>
              <li>• Risk assessments</li>
              <li>• Opportunity identification</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">🔧 Best Practices:</h4>
            <ul className="space-y-1">
              <li>• Provide context about current situation</li>
              <li>• Specify desired timeframe</li>
              <li>• Include relevant variables</li>
              <li>• Ask for actionable recommendations</li>
              <li>• Request confidence levels</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 