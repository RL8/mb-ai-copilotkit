export interface FormField {
  name: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio';
  label: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface FormConfig {
  title: string;
  fields: FormField[];
  submitText?: string;
  layout?: 'vertical' | 'horizontal';
  styling?: 'modern' | 'classic' | 'minimal';
}

export class FormBuilder {
  generateForm(config: FormConfig): string {
    const { title, fields, submitText = 'Submit', layout = 'vertical', styling = 'modern' } = config;
    
    return `
import React, { useState } from 'react';

interface FormData {
  ${fields.map(field => `${field.name}: ${field.type === 'checkbox' ? 'boolean' : 'string'};`).join('\n  ')}
}

const ${this.toPascalCase(title)}Form: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    ${fields.map(field => `${field.name}: ${field.type === 'checkbox' ? 'false' : "''"}`).join(',\n    ')}
  });
  
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    
    ${fields.map(field => this.generateValidation(field)).join('\n    ')}
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Form submitted:', formData);
      // Handle form submission here
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">${title}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        ${fields.map(field => this.generateFieldJSX(field, layout, styling)).join('\n        ')}
        
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
        >
          ${submitText}
        </button>
      </form>
    </div>
  );
};

export default ${this.toPascalCase(title)}Form;`;
  }

  private generateFieldJSX(field: FormField, layout: string, styling: string): string {
    const baseClasses = this.getBaseClasses(styling);
    const errorClass = `{errors.${field.name} && 'border-red-500'}`;
    
    switch (field.type) {
      case 'textarea':
        return `
        <div>
          <label htmlFor="${field.name}" className="block text-sm font-medium text-gray-700 mb-1">
            ${field.label}${field.required ? ' *' : ''}
          </label>
          <textarea
            id="${field.name}"
            name="${field.name}"
            value={formData.${field.name}}
            onChange={handleChange}
            placeholder="${field.placeholder || ''}"
            required={${field.required || false}}
            className={\`${baseClasses} \${${errorClass}}\`}
            rows={3}
          />
          {errors.${field.name} && (
            <p className="text-red-500 text-xs mt-1">{errors.${field.name}}</p>
          )}
        </div>`;
        
      case 'select':
        return `
        <div>
          <label htmlFor="${field.name}" className="block text-sm font-medium text-gray-700 mb-1">
            ${field.label}${field.required ? ' *' : ''}
          </label>
          <select
            id="${field.name}"
            name="${field.name}"
            value={formData.${field.name}}
            onChange={handleChange}
            required={${field.required || false}}
            className={\`${baseClasses} \${${errorClass}}\`}
          >
            <option value="">Select ${field.label.toLowerCase()}</option>
            ${(field.options || []).map(option => `<option value="${option}">${option}</option>`).join('\n            ')}
          </select>
          {errors.${field.name} && (
            <p className="text-red-500 text-xs mt-1">{errors.${field.name}}</p>
          )}
        </div>`;
        
      case 'checkbox':
        return `
        <div className="flex items-center">
          <input
            id="${field.name}"
            name="${field.name}"
            type="checkbox"
            checked={formData.${field.name}}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="${field.name}" className="ml-2 block text-sm text-gray-900">
            ${field.label}${field.required ? ' *' : ''}
          </label>
        </div>`;
        
      default:
        return `
        <div>
          <label htmlFor="${field.name}" className="block text-sm font-medium text-gray-700 mb-1">
            ${field.label}${field.required ? ' *' : ''}
          </label>
          <input
            id="${field.name}"
            name="${field.name}"
            type="${field.type}"
            value={formData.${field.name}}
            onChange={handleChange}
            placeholder="${field.placeholder || ''}"
            required={${field.required || false}}
            className={\`${baseClasses} \${${errorClass}}\`}
          />
          {errors.${field.name} && (
            <p className="text-red-500 text-xs mt-1">{errors.${field.name}}</p>
          )}
        </div>`;
    }
  }

  private generateValidation(field: FormField): string {
    const validations = [];
    
    if (field.required) {
      if (field.type === 'checkbox') {
        validations.push(`if (!formData.${field.name}) newErrors.${field.name} = '${field.label} is required';`);
      } else {
        validations.push(`if (!formData.${field.name}.trim()) newErrors.${field.name} = '${field.label} is required';`);
      }
    }
    
    if (field.type === 'email') {
      validations.push(`if (formData.${field.name} && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(formData.${field.name})) newErrors.${field.name} = 'Invalid email format';`);
    }
    
    if (field.validation?.min) {
      validations.push(`if (formData.${field.name}.length < ${field.validation.min}) newErrors.${field.name} = 'Minimum ${field.validation.min} characters required';`);
    }
    
    if (field.validation?.max) {
      validations.push(`if (formData.${field.name}.length > ${field.validation.max}) newErrors.${field.name} = 'Maximum ${field.validation.max} characters allowed';`);
    }
    
    return validations.join('\n    ');
  }

  private getBaseClasses(styling: string): string {
    switch (styling) {
      case 'modern':
        return 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200';
      case 'classic':
        return 'w-full px-3 py-2 border border-gray-400 rounded focus:outline-none focus:border-blue-500';
      case 'minimal':
        return 'w-full px-3 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-500 bg-transparent';
      default:
        return 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500';
    }
  }

  private toPascalCase(str: string): string {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
  }
} 