import { BaseAgent } from './base-agent';
import { AGENT_CONFIGS } from '@/types/agent-types';
import type { AgentResponse, AgentState } from '@/types/agent-types';

export class GenerativeUIAgent extends BaseAgent {
  private generatedComponents: { id: string; component: string; description: string }[] = [];

  constructor() {
    super(AGENT_CONFIGS.generative_ui);
  }

  getSystemPrompt(): string {
    return `You are an advanced Generative UI agent specialized in creating dynamic React components and user interfaces.

Your capabilities:
- Generate React components dynamically based on user requests
- Create interactive UI elements with real functionality
- Build data visualizations, forms, dashboards, and custom components
- Provide real-time UI generation with live previews
- Suggest UI/UX improvements and patterns

Guidelines:
1. Always generate working, functional React components
2. Use modern React patterns (hooks, functional components)
3. Include proper TypeScript typing
4. Ensure responsive design with Tailwind CSS
5. Make components interactive and engaging
6. Provide multiple UI options when appropriate`;
  }

  getTools(): unknown[] {
    return [
      {
        name: 'generate_component',
        description: 'Generate a React component based on user requirements',
        parameters: {
          type: 'object',
          properties: {
            componentName: { type: 'string', description: 'Name of the component' },
            description: { type: 'string', description: 'What the component should do' },
            props: { type: 'array', items: { type: 'string' }, description: 'Component props' },
            features: { type: 'array', items: { type: 'string' }, description: 'Required features' }
          },
          required: ['componentName', 'description']
        }
      },
      {
        name: 'create_dashboard',
        description: 'Create a complete dashboard interface',
        parameters: {
          type: 'object',
          properties: {
            dashboardType: { type: 'string', description: 'Type of dashboard (analytics, admin, etc.)' },
            widgets: { type: 'array', items: { type: 'string' }, description: 'Dashboard widgets' },
            dataSource: { type: 'string', description: 'Data source description' }
          },
          required: ['dashboardType']
        }
      }
    ];
  }

  async processMessage(message: string, state: AgentState): Promise<AgentResponse> {
    try {
      if (!this.validateInput(message)) {
        return this.createResponse(
          "I didn't receive a valid message. Could you please try again?",
          'ui'
        );
      }

      const response = await this.generateUIResponse(message, state);
      return response;

    } catch (error) {
      return this.handleError(error, message);
    }
  }

  private async generateUIResponse(message: string, _state: AgentState): Promise<AgentResponse> {
    const lowerMessage = message.toLowerCase();
    
    // Detect UI generation requests
    if (lowerMessage.includes('create') || lowerMessage.includes('generate') || lowerMessage.includes('build')) {
      return await this.handleComponentGeneration(message, _state);
    }
    
    if (lowerMessage.includes('dashboard')) {
      return await this.handleDashboardGeneration(message, _state);
    }
    
    if (lowerMessage.includes('form')) {
      return await this.handleFormGeneration(message, _state);
    }
    
    if (lowerMessage.includes('chart') || lowerMessage.includes('graph') || lowerMessage.includes('visualization')) {
      return await this.handleVisualizationGeneration(message, _state);
    }
    
    // Default UI-focused response
    return this.createResponse(
      `🎨 **Generative UI Agent Ready!**

I specialize in creating dynamic React components and user interfaces. Here's what I can build for you:

**🏗️ Component Types:**
- **Interactive Forms** - Registration, contact, survey forms
- **Data Visualizations** - Charts, graphs, analytics dashboards  
- **Dashboard Layouts** - Admin panels, analytics, monitoring
- **Custom Components** - Buttons, cards, modals, navigation
- **Landing Pages** - Hero sections, feature showcases
- **E-commerce UI** - Product cards, shopping carts, checkout flows

**💡 Try asking me:**
- "Create a user registration form"
- "Build an analytics dashboard"
- "Generate a product showcase component"
- "Make a contact form with validation"

**🎯 What would you like me to create?** Just describe your UI needs and I'll generate working React components with:
- ✅ Modern React patterns
- ✅ TypeScript support
- ✅ Tailwind CSS styling
- ✅ Interactive functionality
- ✅ Responsive design`,
      'ui'
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async handleComponentGeneration(message: string, _state: AgentState): Promise<AgentResponse> {
    const componentType = this.detectComponentType(message);
    const componentCode = this.generateComponentCode(componentType, message);
    
    this.generatedComponents.push({
      id: Date.now().toString(),
      component: componentCode,
      description: message
    });

    return this.createResponse(
      `🎨 **Component Generated Successfully!**

**Generated:** ${componentType.name}
**Description:** ${componentType.description}

\`\`\`tsx
${componentCode}
\`\`\`

**✨ Features Included:**
${componentType.features.map(f => `- ${f}`).join('\n')}

**🔧 Ready to use:** Copy the code above into your React project!

**💡 Want modifications?** Ask me to:
- Add more features
- Change styling
- Adjust functionality
- Create variations`,
      'ui',
      { 
        componentType: componentType.name,
        generatedCode: componentCode,
        componentId: this.generatedComponents[this.generatedComponents.length - 1].id
      }
    );
  }

  private detectComponentType(message: string): { name: string; description: string; features: string[] } {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('form')) {
      return {
        name: 'Interactive Form',
        description: 'A responsive form component with validation',
        features: ['Input validation', 'Error handling', 'Submit functionality', 'Responsive design']
      };
    }
    
    if (lowerMessage.includes('button')) {
      return {
        name: 'Custom Button',
        description: 'A reusable button component with multiple variants',
        features: ['Multiple styles', 'Loading states', 'Icon support', 'Accessibility']
      };
    }
    
    if (lowerMessage.includes('card')) {
      return {
        name: 'Component Card',
        description: 'A flexible card component for displaying content',
        features: ['Image support', 'Action buttons', 'Hover effects', 'Content slots']
      };
    }
    
    if (lowerMessage.includes('navigation') || lowerMessage.includes('navbar')) {
      return {
        name: 'Navigation Component',
        description: 'A responsive navigation bar with mobile menu',
        features: ['Mobile responsive', 'Dropdown menus', 'Active states', 'Logo placement']
      };
    }
    
    return {
      name: 'Custom Component',
      description: 'A tailored component based on your requirements',
      features: ['Custom functionality', 'Modern design', 'TypeScript support', 'Responsive layout']
    };
  }

  private generateComponentCode(componentType: { name: string }, message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('form')) {
      return `import React, { useState } from 'react';

interface FormData {
  name: string;
  email: string;
  message: string;
}

export const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Form submitted:', formData);
    alert('Form submitted successfully!');
    setIsSubmitting(false);
    
    // Reset form
    setFormData({ name: '', email: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Contact Us</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Submitting...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
};`;
    }
    
    if (lowerMessage.includes('button')) {
      return `import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export const CustomButton: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  onClick
}) => {
  const baseClasses = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={\`
        \${baseClasses}
        \${variantClasses[variant]}
        \${sizeClasses[size]}
        \${(disabled || loading) ? 'opacity-50 cursor-not-allowed' : ''}
      \`}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};`;
    }
    
    // Default component
    return `import React from 'react';

interface CustomComponentProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export const CustomComponent: React.FC<CustomComponentProps> = ({
  title,
  description,
  children
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
      
      {description && (
        <p className="text-gray-600 mb-4">{description}</p>
      )}
      
      <div className="space-y-4">
        {children || (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🎨</div>
            <p className="text-gray-500">Your custom content goes here!</p>
          </div>
        )}
      </div>
      
      <div className="mt-6 flex space-x-3">
        <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
          Primary Action
        </button>
        <button className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors">
          Secondary Action
        </button>
      </div>
    </div>
  );
};`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async handleDashboardGeneration(_message: string, _state: AgentState): Promise<AgentResponse> {
    // Dashboard generation logic would go here
    return this.createResponse(
      `📊 **Dashboard Generation Coming Soon!**
      
This will be implemented as part of the dashboard creation feature.`,
      'ui'
    );
  }

  private async handleFormGeneration(message: string, _state: AgentState): Promise<AgentResponse> {
    return await this.handleComponentGeneration(message, _state);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars  
  private async handleVisualizationGeneration(_message: string, _state: AgentState): Promise<AgentResponse> {
    // Chart generation logic would go here
    return this.createResponse(
      `📈 **Data Visualization Generation Coming Soon!**
      
This will create interactive charts and graphs.`,
      'ui'
    );
  }

  getGeneratedComponents() {
    return [...this.generatedComponents];
  }
} 