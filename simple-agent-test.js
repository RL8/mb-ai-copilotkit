#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');

// Simple test messages for each agent
const testMessages = {
  agentic_chat: ["Hello, can you help me with my project?"],
  generative_ui: ["Create a contact form with name and email"],
  human_loop: ["I need approval for a new feature"],
  predictive_state: ["Predict success rate for next quarter"],
  shared_state: ["Create a new project called Test Dashboard"],
  tool_ui: ["Create a login form with validation"]
};

async function testAgent(page, agentType) {
  console.log(`\n🤖 Testing ${agentType} agent...`);
  
  try {
    // Go to agent page
    await page.goto(`http://localhost:3000/agents/${agentType}`, { waitUntil: 'networkidle0' });
    await page.waitForTimeout(3000); // Wait for CopilotKit to load
    
    const message = testMessages[agentType][0];
    console.log(`📤 Sending: "${message}"`);
    
    // Find and type in chat input (try common selectors)
    const inputSelectors = [
      'textarea[placeholder*="message"]',
      'input[placeholder*="message"]', 
      'textarea',
      'input[type="text"]',
      '.chat-input',
      '[data-testid="chat-input"]'
    ];
    
    let inputFound = false;
    for (const selector of inputSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        await page.type(selector, message);
        inputFound = true;
        break;
      } catch (e) {
        continue;
      }
    }
    
    if (!inputFound) {
      console.log(`❌ Could not find chat input on ${agentType}`);
      return { status: 'no_input', agent: agentType };
    }
    
    // Send message (try common send button selectors)
    const sendSelectors = [
      'button[type="submit"]',
      'button:contains("Send")',
      '.send-button',
      '[data-testid="send-button"]',
      'button:last-child'
    ];
    
    let sent = false;
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
      // Try pressing Enter
      await page.keyboard.press('Enter');
    }
    
    console.log(`⏳ Waiting for response...`);
    
    // Wait for response (look for new content)
    await page.waitForTimeout(5000); // Give AI time to respond
    
    // Try to capture any text that looks like a response
    const possibleResponse = await page.evaluate(() => {
      // Look for common message patterns
      const selectors = [
        '.message',
        '.chat-message', 
        '.response',
        'div[data-message]',
        'p:last-child',
        'div:contains("I")', // AI responses often start with "I"
      ];
      
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          const lastElement = elements[elements.length - 1];
          if (lastElement.textContent.length > 10) {
            return lastElement.textContent.trim();
          }
        }
      }
      
      // Fallback: get all text from main content area
      const main = document.querySelector('main') || document.body;
      const text = main.textContent;
      const lines = text.split('\n').filter(line => line.trim().length > 20);
      return lines[lines.length - 1] || 'Response detected but could not extract text';
    });
    
    console.log(`📥 Response: ${possibleResponse ? possibleResponse.substring(0, 100) + '...' : 'No response detected'}`);
    
    return {
      status: 'success',
      agent: agentType,
      userMessage: message,
      agentResponse: possibleResponse || 'Response received but text extraction failed',
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.log(`❌ Error testing ${agentType}: ${error.message}`);
    return {
      status: 'error',
      agent: agentType,
      error: error.message
    };
  }
}

async function runSimpleTest() {
  console.log('🔬 Starting Simple Agent Browser Tests\n');
  
  const browser = await puppeteer.launch({ 
    headless: false, // Show browser so you can see it working
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  const results = {
    testRun: {
      timestamp: new Date().toISOString(),
      totalAgents: 6
    },
    conversations: []
  };
  
  // Test each agent
  const agents = ['agentic_chat', 'generative_ui', 'human_loop', 'predictive_state', 'shared_state', 'tool_ui'];
  
  for (const agent of agents) {
    const result = await testAgent(page, agent);
    results.conversations.push(result);
    await page.waitForTimeout(1000); // Brief pause between tests
  }
  
  await browser.close();
  
  // Save results
  const outputFile = 'simple-test-results.json';
  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST COMPLETE');
  console.log(`📄 Results saved to: ${outputFile}`);
  
  // Print summary
  const successful = results.conversations.filter(c => c.status === 'success').length;
  console.log(`✅ ${successful}/${agents.length} agents tested successfully`);
  
  return results;
}

// Run the test
runSimpleTest().catch(console.error); 