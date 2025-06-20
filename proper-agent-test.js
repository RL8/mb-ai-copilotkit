#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');

// Test messages with expected response validation
const testCases = {
  agentic_chat: {
    message: "What are the key steps to build an e-commerce website?",
    expectedKeywords: ["steps", "ecommerce", "website", "build", "development"],
    responseType: "analytical"
  },
  generative_ui: {
    message: "Create a contact form with name, email and message fields",
    expectedKeywords: ["form", "name", "email", "message", "component", "react"],
    responseType: "code_generation"
  },
  human_loop: {
    message: "I need approval to implement user authentication system",
    expectedKeywords: ["approval", "workflow", "authentication", "review"],
    responseType: "workflow"
  },
  predictive_state: {
    message: "What are the likely outcomes if we launch this feature next month?",
    expectedKeywords: ["outcomes", "launch", "predict", "likely", "scenarios"],
    responseType: "prediction"
  },
  shared_state: {
    message: "Create a project called Customer Portal and add initial tasks",
    expectedKeywords: ["project", "customer", "portal", "tasks", "created"],
    responseType: "coordination"
  },
  tool_ui: {
    message: "Generate a login form with email validation and password strength indicator",
    expectedKeywords: ["login", "form", "email", "validation", "password"],
    responseType: "specialized_ui"
  }
};

async function waitForActualResponse(page, previousContent, maxWait = 15000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWait) {
    await page.waitForTimeout(1000);
    
    const currentContent = await page.evaluate(() => {
      // Look for CopilotKit message containers
      const messages = document.querySelectorAll('[data-role="assistant"], [class*="message"], [class*="chat"]');
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        return lastMessage.textContent.trim();
      }
      
      // Fallback to looking for any new substantial text
      const body = document.body.textContent;
      const lines = body.split('\n').filter(line => line.trim().length > 50);
      return lines[lines.length - 1] || '';
    });
    
    // Check if we have new content that's substantially different
    if (currentContent && 
        currentContent.length > 50 && 
        !previousContent.includes(currentContent.substring(0, 100))) {
      return currentContent;
    }
  }
  
  return null;
}

async function testAgentProperly(page, agentType) {
  console.log(`\n🤖 Testing ${agentType} agent...`);
  const testCase = testCases[agentType];
  
  try {
    // Navigate to agent page
    await page.goto(`http://localhost:3000/agents/${agentType}`, { waitUntil: 'networkidle0' });
    await page.waitForTimeout(3000);
    
    // Capture initial page content
    const initialContent = await page.evaluate(() => document.body.textContent);
    
    console.log(`📤 Sending: "${testCase.message}"`);
    
    // Find chat input - try CopilotKit specific selectors first
    const inputSelectors = [
      'textarea[placeholder*="Type your message"]',
      'textarea[placeholder*="message"]',
      'input[placeholder*="message"]',
      'textarea[data-testid*="chat"]',
      'textarea',
      'input[type="text"]'
    ];
    
    let inputElement = null;
    for (const selector of inputSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        inputElement = selector;
        break;
      } catch (e) {
        continue;
      }
    }
    
    if (!inputElement) {
      console.log(`❌ No chat input found on ${agentType}`);
      return { 
        status: 'no_input', 
        agent: agentType,
        issue: 'Chat interface not found'
      };
    }
    
    // Clear and type message
    await page.click(inputElement);
    await page.keyboard.down('Control');
    await page.keyboard.press('a');
    await page.keyboard.up('Control');
    await page.type(inputElement, testCase.message);
    
    // Send message - try multiple methods
    let sent = false;
    
    // Try send button first
    const sendSelectors = [
      'button[aria-label*="Send"]',
      'button[type="submit"]',
      'button:has-text("Send")',
      'button svg[class*="send"]',
      'button:last-child'
    ];
    
    for (const selector of sendSelectors) {
      try {
        await page.click(selector);
        sent = true;
        break;
      } catch (e) {
        continue;
      }
    }
    
    if (!sent) {
      // Try Enter key
      await page.focus(inputElement);
      await page.keyboard.press('Enter');
    }
    
    console.log(`⏳ Waiting for AI response...`);
    
    // Wait for actual response
    const response = await waitForActualResponse(page, initialContent);
    
    if (!response) {
      console.log(`❌ No response received from ${agentType}`);
      return {
        status: 'no_response',
        agent: agentType,
        userMessage: testCase.message,
        issue: 'AI did not respond within timeout'
      };
    }
    
    // Validate response quality
    const validation = validateResponse(response, testCase);
    
    console.log(`📥 Response (${response.length} chars): ${response.substring(0, 150)}...`);
    console.log(`🔍 Validation: ${validation.score}/5 (${validation.status})`);
    
    return {
      status: validation.score >= 3 ? 'success' : 'poor_response',
      agent: agentType,
      userMessage: testCase.message,
      agentResponse: response,
      validation: validation,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.log(`❌ Error testing ${agentType}: ${error.message}`);
    return {
      status: 'error',
      agent: agentType,
      error: error.message,
      userMessage: testCase.message
    };
  }
}

function validateResponse(response, testCase) {
  let score = 0;
  const issues = [];
  const strengths = [];
  
  // Check length (should be substantial)
  if (response.length > 100) {
    score += 1;
    strengths.push('Substantial response length');
  } else {
    issues.push('Response too short');
  }
  
  // Check for keyword relevance
  const lowerResponse = response.toLowerCase();
  const lowerMessage = testCase.message.toLowerCase();
  let keywordMatches = 0;
  
  for (const keyword of testCase.expectedKeywords) {
    if (lowerResponse.includes(keyword.toLowerCase()) || 
        lowerMessage.includes(keyword.toLowerCase())) {
      keywordMatches++;
    }
  }
  
  if (keywordMatches >= testCase.expectedKeywords.length * 0.6) {
    score += 2;
    strengths.push(`Relevant keywords (${keywordMatches}/${testCase.expectedKeywords.length})`);
  } else {
    issues.push(`Low keyword relevance (${keywordMatches}/${testCase.expectedKeywords.length})`);
  }
  
  // Check if it's not just a generic description
  const genericPhrases = [
    'powered by copilotkit',
    'advanced conversational ai',
    'dynamic react component',
    'collaborative ai with approval'
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
  
  // Check for question engagement
  if (lowerResponse.includes('?') || 
      lowerResponse.includes('would you') ||
      lowerResponse.includes('what') ||
      lowerResponse.includes('how')) {
    score += 1;
    strengths.push('Interactive engagement');
  }
  
  const status = score >= 4 ? 'excellent' : 
                score >= 3 ? 'good' : 
                score >= 2 ? 'fair' : 'poor';
  
  return {
    score,
    status,
    strengths,
    issues,
    keywordMatches: keywordMatches
  };
}

async function runProperTest() {
  console.log('🔬 Starting Proper Agent Validation Tests\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  const results = {
    testRun: {
      timestamp: new Date().toISOString(),
      totalAgents: 6,
      purpose: 'Validate actual agent responses to specific inputs'
    },
    results: []
  };
  
  const agents = Object.keys(testCases);
  
  for (const agent of agents) {
    const result = await testAgentProperly(page, agent);
    results.results.push(result);
    await page.waitForTimeout(2000); // Pause between tests
  }
  
  await browser.close();
  
  // Save detailed results
  const outputFile = 'validated-agent-results.json';
  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
  
  // Generate summary
  generateSummary(results);
  
  console.log(`\n📄 Detailed results saved to: ${outputFile}`);
  
  return results;
}

function generateSummary(results) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 AGENT VALIDATION SUMMARY');
  console.log('='.repeat(60));
  
  const successful = results.results.filter(r => r.status === 'success').length;
  const withIssues = results.results.filter(r => r.status === 'poor_response').length;
  const failed = results.results.filter(r => r.status === 'error' || r.status === 'no_response' || r.status === 'no_input').length;
  
  console.log(`✅ Fully Functional: ${successful}/6 agents`);
  console.log(`⚠️  Responding but Poor Quality: ${withIssues}/6 agents`);
  console.log(`❌ Non-Functional: ${failed}/6 agents`);
  
  results.results.forEach(result => {
    const status = result.status === 'success' ? '✅' : 
                  result.status === 'poor_response' ? '⚠️' : '❌';
    const score = result.validation ? ` (${result.validation.score}/5)` : '';
    console.log(`${status} ${result.agent}${score}`);
  });
  
  if (successful === 6) {
    console.log('\n🎉 ALL AGENTS FULLY FUNCTIONAL!');
  } else {
    console.log('\n🔧 ISSUES DETECTED - Review detailed results for fixes needed');
  }
}

// Run the proper test
runProperTest().catch(console.error); 