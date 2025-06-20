import { CopilotRuntime, OpenAIAdapter, copilotRuntimeNextJSAppRouterEndpoint } from "@copilotkit/runtime";
import { NextRequest } from "next/server";
import OpenAI from "openai";
import { agentRouter } from "@/agents/agent-router";

// Initialize OpenAI client properly
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create the runtime with enhanced actions for agent system
const runtime = new CopilotRuntime({
  actions: () => [
    {
      name: "sayHello",
      description: "Say hello to the user",
      parameters: [
        {
          name: "name",
          type: "string",
          description: "The name of the user",
          required: false,
        },
      ],
      handler: async ({ name }) => {
        // Enhanced greeting with agent system awareness
        const agentInfo = agentRouter.getAllAgentsInfo();
        const availableCount = agentInfo.filter(a => a.isAvailable).length;
        
        return `Hello ${name || "there"}! I'm your AG-UI + LangChain assistant with a multi-agent system. 

🤖 Currently ${availableCount} of 6 specialized agents are available, including:
• Agentic Chat (enhanced conversational AI)
• Generative UI (coming in Phase 2)
• Human in Loop (coming in Phase 3)
• And more!

You can explore all agents at /agents or ask me "show agents" to learn more. How can I help you today?`;
      },
    },
  ],
});

// Create the service adapter correctly
const serviceAdapter = new OpenAIAdapter({ 
  openai,
  model: "gpt-3.5-turbo", // Use a consistent model
});

// Handle CORS preflight requests
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Main POST handler using CopilotKit runtime
export const POST = async (req: NextRequest) => {
  try {
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not configured");
      return new Response(
        JSON.stringify({ 
          error: "OpenAI API key not configured",
          message: "Please set OPENAI_API_KEY environment variable"
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
      runtime,
      serviceAdapter,
      endpoint: "/api/copilotkit",
    });

    return handleRequest(req);
  } catch (error) {
    console.error("CopilotKit API Error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}; 