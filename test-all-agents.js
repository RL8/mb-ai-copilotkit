#!/usr/bin/env node

const puppeteer = require('puppeteer');

const agents = [
  {
    name: 'agentic_chat',
    message: 'What are the key steps to build an e-commerce website?',
    expectedKeywords: ['website', 'ecommerce', 'steps', 'development']
  },
  {
    name: 'generative_ui',
    message: 'Create a contact form with name, email and message fields',
    expectedKeywords: ['form', 'contact', 'name', 'email', 'component']
  },
  {
    name: 'human_loop',
    message: 'I need approval to implement user authentication system',
    expectedKeywords: ['approval', 'authentication', 'implement', 'review']
  },
  {
    name: 'predictive_state',
    message: 'What are the likely outcomes if we launch this feature next month?',
    expectedKeywords: ['outcomes', 'launch', 'feature', 'likely', 'predict']
  },
  {
    name: 'shared_state',
    message: 'Create a project called Customer Portal and add initial tasks',
    expectedKeywords: ['project', 'customer', 'portal', 'tasks', 'create']
  },
  {
    name: 'tool_ui',
    message: 'Generate a login form with email validation and password strength indicator',
    expectedKeywords: ['login', 'form', 'email', 'validation', 'password']
  }
];

async function testAgent(browser, agent) {
  console.log(`\n🤖 Testing ${agent.name} agent...`);
  const url = `https://mb-ai.vercel.app/agents/${agent.name}`;
  
  const page = await browser.newPage();
  
  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.waitForTimeout(5000);
    
    console.log(`📤 Sending: "${agent.message}"`);
    
    // Send message
    await page.click('textarea[placeholder*="Type"]');
    await page.type('textarea[placeholder*="Type"]', agent.message, { delay: 50 });
    
    const sendButton = await page.$('button:has(svg)');
    if (sendButton) {
      await sendButton.click();
    } else {
      await page.keyboard.press('Enter');
    }
    
    console.log('⏳ Waiting for AI response...');
    
    // Wait up to 20 seconds for response
    let response = null;
    for (let i = 0; i < 20; i++) {
      await page.waitForTimeout(1000);
      
      response = await page.evaluate((userMessage, agentName) => {
        const elements = document.querySelectorAll('*');
        for (const element of elements) {
          const text = element.textContent;
          if (text && text.length > 100 && 
              !text.includes('Advanced conversational AI') &&
              !text.includes('AI that creates') &&
              !text.includes('Collaborative AI') &&
              !text.includes('Future-aware AI') &&
              !text.includes('Multi-agent coordination') &&
              !text.includes('Specialized AI') &&
              !text.includes('How to Use') &&
              !text.includes('Capabilities:') &&
              !text.includes('Best Practices:') &&
              !text.includes(userMessage) &&
              !text.includes('Hello! I\'m your') &&
              // Look for conversational AI responses
              (text.includes('I can help') || 
               text.includes('Here are') ||
               text.includes('To build') ||
               text.includes('The key') ||
               text.includes('I\'ll help') ||
               text.includes('Let me') ||
               text.includes('Based on') ||
               text.includes('For') ||
               text.includes('When') ||
               text.includes('You') ||
               /\b(should|would|could|will|can|need|important|steps|process)\b/i.test(text))) {
            return text.trim();
          }
        }
        return null;
      }, agent.message, agent.name);
      
      if (response) {
        break;
      }
      
      if (i % 5 === 0 && i > 0) {
        console.log(`⏳ Still waiting... (${i}s)`);
      }
    }
    
    if (response) {
      // Check keyword matches
      const lowerResponse = response.toLowerCase();
      const matchedKeywords = agent.expectedKeywords.filter(keyword => 
        lowerResponse.includes(keyword.toLowerCase())
      );
      
      console.log(`✅ AI Response (${response.length} chars):`);
      console.log(`📝 ${response.substring(0, 300)}...`);
      console.log(`🔍 Keywords matched: ${matchedKeywords.length}/${agent.expectedKeywords.length} (${matchedKeywords.join(', ')})`);
      
      return {
        agent: agent.name,
        success: true,
        response: response.substring(0, 500),
        keywords: matchedKeywords,
        keywordScore: matchedKeywords.length,
        maxKeywords: agent.expectedKeywords.length
      };
    } else {
      console.log('❌ No AI response detected');
      return {
        agent: agent.name,
        success: false,
        response: null,
        keywords: [],
        keywordScore: 0,
        maxKeywords: agent.expectedKeywords.length
      };
    }
    
  } catch (error) {
    console.error(`❌ Error testing ${agent.name}:`, error.message);
    return {
      agent: agent.name,
      success: false,
      error: error.message,
      keywords: [],
      keywordScore: 0,
      maxKeywords: agent.expectedKeywords.length
    };
  } finally {
    await page.close();
  }
}

async function testAllAgents() {
  console.log('🎯 Testing All 6 Agents - Real AI Response Verification');
  console.log('============================================================');
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const results = [];
  
  for (const agent of agents) {
    const result = await testAgent(browser, agent);
    results.push(result);
  }
  
  await browser.close();
  
  // Summary
  console.log('\n============================================================');
  console.log('📊 ALL AGENTS TEST RESULTS');
  console.log('============================================================');
  
  const working = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Working Agents: ${working.length}/6`);
  console.log(`❌ Failed Agents: ${failed.length}/6`);
  
  console.log('\n📋 Individual Results:');
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const score = result.success ? `(${result.keywordScore}/${result.maxKeywords})` : '';
    console.log(`${status} ${result.agent} ${score}`);
    if (result.success && result.response) {
      console.log(`   📝 "${result.response.substring(0, 150)}..."`);
    }
  });
  
  // Overall assessment
  const successRate = (working.length / results.length) * 100;
  console.log(`\n🎯 Overall Success Rate: ${successRate.toFixed(1)}%`);
  
  if (successRate === 100) {
    console.log('🌟 EXCELLENT: All agents working with AI responses!');
  } else if (successRate >= 80) {
    console.log('🟢 GOOD: Most agents working');
  } else if (successRate >= 50) {
    console.log('🟡 FAIR: Some agents working');
  } else {
    console.log('🔴 POOR: Major issues detected');
  }
  
  return results;
}

testAllAgents().catch(console.error); 