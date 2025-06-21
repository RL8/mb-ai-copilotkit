#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');

// Vercel deployment URL
const BASE_URL = 'https://mb-ai.vercel.app';

// Test messages with expected response validation
const testCases = {
  agentic_chat: {
    message: "What are the key steps to build an e-commerce website?",
    expectedKeywords: ["steps", "ecommerce", "website", "build", "development", "planning"],
    responseType: "analytical"
  },
  generative_ui: {
    message: "Create a contact form with name, email and message fields",
    expectedKeywords: ["form", "name", "email", "message", "component", "fields"],
    responseType: "code_generation"
  },
  human_loop: {
    message: "I need approval to implement user authentication system",
    expectedKeywords: ["approval", "workflow", "authentication", "review", "process"],
    responseType: "workflow"
  },
  predictive_state: {
    message: "What are the likely outcomes if we launch this feature next month?",
    expectedKeywords: ["outcomes", "launch", "predict", "likely", "scenarios", "future"],
    responseType: "prediction"
  },
  shared_state: {
    message: "Create a project called Customer Portal and add initial tasks",
    expectedKeywords: ["project", "customer", "portal", "tasks", "coordination"],
    responseType: "coordination"
  },
  tool_ui: {
    message: "Generate a login form with email validation and password strength indicator",
    expectedKeywords: ["login", "form", "email", "validation", "password", "component"],
    responseType: "specialized_ui"
  }
};

async function waitForCopilotResponse(page, maxWait = 45000) {
  console.log('🔍 Looking for CopilotKit response...');
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWait) {
    await page.waitForTimeout(2000);
    
    // Check for CopilotKit message containers
    const response = await page.evaluate(() => {
      // Look for any substantial text that looks like an AI response
      const elements = document.querySelectorAll('div, p, span');
      for (const element of elements) {
        const text = element.textContent.trim();
        if (text.length > 50 && 
            !text.includes('Hello! I\'m your') && 
            !text.includes('Try asking me') &&
            !text.includes('How to Use') &&
            !text.includes('Advanced conversational AI') &&
            !text.includes('What are the key steps') && // Skip user message
            !text.includes('Create a contact form') && // Skip user message
            !text.includes('I need approval') && // Skip user message
            !text.includes('What are the likely') && // Skip user message
            !text.includes('Create a project called') && // Skip user message
            !text.includes('Generate a login form')) { // Skip user message
          console.log(`✅ Found AI response: ${text.substring(0, 150)}...`);
          return text;
        }
      }
      
      return null;
    });
    
    if (response && response.length > 50) {
      return response;
    }
    
    // Log progress every 5 seconds
    if ((Date.now() - startTime) % 5000 < 2000) {
      console.log(`⏳ Still waiting... (${Math.floor((Date.now() - startTime) / 1000)}s)`);
    }
  }
  
  return null;
}

async function testVercelAgent(page, agentType) {
  console.log(`\n🤖 Testing ${agentType} agent on Vercel...`);
  const testCase = testCases[agentType];
  
  try {
    // Navigate to agent page on Vercel
    const url = `${BASE_URL}/agents/${agentType}`;
    console.log(`🌐 Navigating to: ${url}`);
    
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.waitForTimeout(5000); // Extra wait for CopilotKit to load
    
    // Check for any console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`🔴 Browser Error: ${msg.text()}`);
      }
    });
    
    console.log(`📤 Sending: "${testCase.message}"`);
    
    // Find CopilotKit input - try multiple selectors
    const inputSelectors = [
      'textarea[placeholder*="Type"]',
      'textarea[placeholder*="message"]',
      'input[placeholder*="Type"]',
      'input[placeholder*="message"]',
      'textarea[data-testid*="input"]',
      'textarea[class*="copilot"]',
      'textarea[class*="chat"]',
      'textarea',
      'input[type="text"]'
    ];
    
    let inputElement = null;
    for (const selector of inputSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 3000 });
        inputElement = selector;
        console.log(`✅ Found input with selector: ${selector}`);
        break;
      } catch (e) {
        continue;
      }
    }
    
    if (!inputElement) {
      // Take screenshot for debugging
      await page.screenshot({ path: `debug-${agentType}-no-input.png` });
      console.log(`❌ No chat input found on ${agentType}`);
      return { 
        status: 'no_input', 
        agent: agentType,
        issue: 'CopilotKit chat interface not found',
        url: url
      };
    }
    
    // Clear and type message
    await page.click(inputElement);
    await page.keyboard.down('Control');
    await page.keyboard.press('a');
    await page.keyboard.up('Control');
    await page.type(inputElement, testCase.message, { delay: 50 });
    
    // Send message - try multiple methods
    let sent = false;
    
    // Try send button first
    const sendSelectors = [
      'button[aria-label*="Send"]',
      'button[type="submit"]',
      'button[data-testid*="send"]',
      'button[class*="send"]',
      'svg[class*="send"]',
      'button:has(svg)',
      'button:last-of-type'
    ];
    
    for (const selector of sendSelectors) {
      try {
        const button = await page.$(selector);
        if (button) {
          await button.click();
          sent = true;
          console.log(`✅ Sent via button: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!sent) {
      // Try Enter key
      await page.focus(inputElement);
      await page.keyboard.press('Enter');
      console.log('✅ Sent via Enter key');
    }
    
    console.log(`⏳ Waiting for AI response...`);
    
    // Wait for actual response from CopilotKit
    const response = await waitForCopilotResponse(page);
    
    if (!response) {
      // Take screenshot for debugging
      await page.screenshot({ path: `debug-${agentType}-no-response.png` });
      console.log(`❌ No response received from ${agentType}`);
      return {
        status: 'no_response',
        agent: agentType,
        userMessage: testCase.message,
        issue: 'AI did not respond within timeout',
        url: url
      };
    }
    
    // Validate response quality
    const validation = validateResponse(response, testCase);
    
    console.log(`📥 Response (${response.length} chars): ${response.substring(0, 200)}...`);
    console.log(`🔍 Validation: ${validation.score}/5 (${validation.status})`);
    
    // Take success screenshot
    await page.screenshot({ path: `success-${agentType}.png` });
    
    return {
      status: validation.score >= 3 ? 'success' : 'poor_response',
      agent: agentType,
      userMessage: testCase.message,
      agentResponse: response,
      validation: validation,
      timestamp: new Date().toISOString(),
      url: url
    };
    
  } catch (error) {
    console.log(`❌ Error testing ${agentType}: ${error.message}`);
    // Take error screenshot
    await page.screenshot({ path: `error-${agentType}.png` });
    return {
      status: 'error',
      agent: agentType,
      error: error.message,
      userMessage: testCase.message,
      url: `${BASE_URL}/agents/${agentType}`
    };
  }
}

function validateResponse(response, testCase) {
  let score = 0;
  const issues = [];
  const strengths = [];
  
  // Check length (should be substantial)
  if (response.length > 150) {
    score += 1;
    strengths.push('Substantial response length');
  } else {
    issues.push('Response too short');
  }
  
  // Check for keyword relevance
  const lowerResponse = response.toLowerCase();
  let keywordMatches = 0;
  
  for (const keyword of testCase.expectedKeywords) {
    if (lowerResponse.includes(keyword.toLowerCase())) {
      keywordMatches++;
    }
  }
  
  if (keywordMatches >= testCase.expectedKeywords.length * 0.5) {
    score += 2;
    strengths.push(`Relevant keywords (${keywordMatches}/${testCase.expectedKeywords.length})`);
  } else {
    issues.push(`Low keyword relevance (${keywordMatches}/${testCase.expectedKeywords.length})`);
  }
  
  // Check if it's not just a generic description
  const genericPhrases = [
    'hello! i\'m your',
    'try asking me',
    'how to use',
    'loading...',
    'please wait'
  ];
  
  const isGeneric = genericPhrases.some(phrase => 
    lowerResponse.includes(phrase.toLowerCase())
  );
  
  if (!isGeneric) {
    score += 1;
    strengths.push('Contextual response');
  } else {
    issues.push('Generic/template response');
  }
  
  // Check for AI-like reasoning
  if (lowerResponse.includes('based on') || 
      lowerResponse.includes('i recommend') ||
      lowerResponse.includes('here are') ||
      lowerResponse.includes('you can') ||
      lowerResponse.includes('i suggest')) {
    score += 1;
    strengths.push('Shows AI reasoning');
  } else {
    issues.push('Lacks AI reasoning patterns');
  }
  
  return {
    score,
    status: score >= 4 ? 'excellent' : score >= 3 ? 'good' : score >= 2 ? 'fair' : 'poor',
    strengths,
    issues
  };
}

async function runVercelTest() {
  console.log('🔬 Starting Vercel Deployment Agent Tests');
  console.log(`🌐 Testing URL: ${BASE_URL}`);
  console.log('='.repeat(60));
  
  const browser = await puppeteer.launch({ 
    headless: false, // Show browser for debugging
    defaultViewport: { width: 1200, height: 800 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const results = [];
  
  try {
    const page = await browser.newPage();
    
    // Test each agent
    for (const agentType of Object.keys(testCases)) {
      const result = await testVercelAgent(page, agentType);
      results.push(result);
      
      // Wait between tests
      await page.waitForTimeout(3000);
    }
    
  } catch (error) {
    console.error('❌ Test suite error:', error);
  } finally {
    await browser.close();
  }
  
  // Generate summary
  const summary = generateSummary(results);
  console.log(summary);
  
  // Save results
  fs.writeFileSync('vercel-test-results.json', JSON.stringify(results, null, 2));
  console.log('\n📄 Detailed results saved to: vercel-test-results.json');
  
  return results;
}

function generateSummary(results) {
  const successful = results.filter(r => r.status === 'success').length;
  const responding = results.filter(r => r.status === 'poor_response').length;
  const broken = results.filter(r => ['no_input', 'no_response', 'error'].includes(r.status)).length;
  
  let summary = '\n' + '='.repeat(60) + '\n';
  summary += '📊 VERCEL DEPLOYMENT TEST SUMMARY\n';
  summary += '='.repeat(60) + '\n';
  summary += `✅ Fully Functional: ${successful}/${results.length} agents\n`;
  summary += `⚠️  Responding but Poor Quality: ${responding}/${results.length} agents\n`;
  summary += `❌ Non-Functional: ${broken}/${results.length} agents\n`;
  
  results.forEach(result => {
    const icon = result.status === 'success' ? '✅' : 
                 result.status === 'poor_response' ? '⚠️' : '❌';
    summary += `${icon} ${result.agent}\n`;
  });
  
  if (successful === results.length) {
    summary += '\n🎉 ALL AGENTS WORKING ON VERCEL! Deployment successful.\n';
  } else if (successful + responding === results.length) {
    summary += '\n🔧 All agents responding but some need quality improvements.\n';
  } else {
    summary += '\n🔧 ISSUES DETECTED - Review detailed results for fixes needed\n';
  }
  
  return summary;
}

// Run the test
runVercelTest().catch(console.error); 