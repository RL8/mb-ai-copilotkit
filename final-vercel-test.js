#!/usr/bin/env node

const puppeteer = require('puppeteer');

const testCases = [
  {
    agent: 'agentic_chat',
    message: 'What are the key steps to build an e-commerce website?',
    expectedKeywords: ['website', 'ecommerce', 'steps', 'build', 'development']
  },
  {
    agent: 'generative_ui',
    message: 'Create a contact form with name, email and message fields',
    expectedKeywords: ['form', 'contact', 'name', 'email', 'fields']
  },
  {
    agent: 'human_loop',
    message: 'I need approval to implement user authentication system',
    expectedKeywords: ['approval', 'authentication', 'implement', 'system']
  },
  {
    agent: 'predictive_state',
    message: 'What are the likely outcomes if we launch this feature next month?',
    expectedKeywords: ['outcomes', 'launch', 'feature', 'likely', 'analysis']
  },
  {
    agent: 'shared_state',
    message: 'Create a project called Customer Portal and add initial tasks',
    expectedKeywords: ['project', 'customer', 'portal', 'tasks', 'create']
  },
  {
    agent: 'tool_ui',
    message: 'Generate a login form with email validation and password strength indicator',
    expectedKeywords: ['login', 'form', 'email', 'validation', 'password']
  }
];

async function waitForActualAIResponse(page, userMessage, maxWait = 30000) {
  console.log('🔍 Waiting for actual AI response...');
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWait) {
    await page.waitForTimeout(2000);
    
    const response = await page.evaluate((userMsg) => {
      // Get all text content from the page
      const allElements = document.querySelectorAll('*');
      const textContents = [];
      
      for (const element of allElements) {
        const text = element.textContent;
        if (text && text.trim().length > 100) {
          textContents.push(text.trim());
        }
      }
      
      // Look for text that:
      // 1. Is substantial (>100 chars)
      // 2. Is not the user's message
      // 3. Is not static help content
      // 4. Appears to be a conversational response
      
      const staticContent = [
        'Advanced conversational AI',
        'Capabilities:',
        'Best Practices:',
        'How to Use',
        'Try asking me',
        'Hello! I\'m your',
        'specialized AI',
        'Multi-agent coordination',
        'Future-aware AI',
        'Collaborative AI',
        'AI that creates',
        'Specialized AI that creates'
      ];
      
      for (const text of textContents) {
        // Skip if it contains the user message
        if (text.includes(userMsg)) continue;
        
        // Skip if it's static content
        let isStatic = false;
        for (const staticPhrase of staticContent) {
          if (text.includes(staticPhrase)) {
            isStatic = true;
            break;
          }
        }
        if (isStatic) continue;
        
        // Look for conversational patterns
        const conversationalPatterns = [
          /^(Sure|Yes|I can|I'll|Let me|Here's|To|For|When|The|Based on)/i,
          /\b(would|should|could|will|can|need|important|key|steps|process|recommend)\b/i,
          /\b(first|second|third|next|then|finally|also|additionally|furthermore)\b/i
        ];
        
        for (const pattern of conversationalPatterns) {
          if (pattern.test(text) && text.length > 150) {
            console.log(`✅ Found AI response: ${text.substring(0, 200)}...`);
            return text;
          }
        }
      }
      
      return null;
    }, userMessage);
    
    if (response) {
      return response;
    }
    
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    if (elapsed % 5 === 0) {
      console.log(`⏳ Still waiting for AI response... (${elapsed}s)`);
    }
  }
  
  console.log('❌ No AI response detected within timeout');
  return null;
}

async function testAgent(browser, testCase) {
  console.log(`\n🤖 Testing ${testCase.agent} agent on Vercel...`);
  const url = `https://mb-ai.vercel.app/agents/${testCase.agent}`;
  console.log(`🌐 Navigating to: ${url}`);
  
  const page = await browser.newPage();
  
  try {
    // Navigate to agent page
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.waitForTimeout(5000);
    
    // Send message
    console.log(`📤 Sending: "${testCase.message}"`);
    
    const inputSelector = 'textarea[placeholder*="Type"]';
    await page.waitForSelector(inputSelector, { timeout: 10000 });
    await page.click(inputSelector);
    await page.type(inputSelector, testCase.message, { delay: 50 });
    
    // Send the message
    const sendButton = await page.$('button:has(svg)');
    if (sendButton) {
      await sendButton.click();
      console.log('✅ Message sent via button');
    } else {
      await page.keyboard.press('Enter');
      console.log('✅ Message sent via Enter');
    }
    
    // Wait for actual AI response
    const response = await waitForActualAIResponse(page, testCase.message);
    
    if (response) {
      // Validate response quality
      const lowerResponse = response.toLowerCase();
      const matchedKeywords = testCase.expectedKeywords.filter(keyword => 
        lowerResponse.includes(keyword.toLowerCase())
      );
      
      const score = matchedKeywords.length;
      const maxScore = testCase.expectedKeywords.length;
      
      let quality = 'poor';
      if (score >= maxScore * 0.8) quality = 'excellent';
      else if (score >= maxScore * 0.6) quality = 'good';
      else if (score >= maxScore * 0.4) quality = 'fair';
      
      console.log(`📥 Response (${response.length} chars): ${response.substring(0, 200)}...`);
      console.log(`🔍 Validation: ${score}/${maxScore} keywords matched (${quality})`);
      console.log(`📝 Keywords found: ${matchedKeywords.join(', ')}`);
      
      return {
        agent: testCase.agent,
        success: true,
        response: response.substring(0, 500),
        score: score,
        maxScore: maxScore,
        quality: quality,
        keywords: matchedKeywords
      };
    } else {
      console.log('❌ No AI response received');
      return {
        agent: testCase.agent,
        success: false,
        response: null,
        score: 0,
        maxScore: testCase.expectedKeywords.length,
        quality: 'failed',
        keywords: []
      };
    }
    
  } catch (error) {
    console.error(`❌ Error testing ${testCase.agent}:`, error.message);
    return {
      agent: testCase.agent,
      success: false,
      error: error.message,
      score: 0,
      maxScore: testCase.expectedKeywords.length,
      quality: 'error',
      keywords: []
    };
  } finally {
    await page.close();
  }
}

async function runFinalTest() {
  console.log('🎯 Final Vercel Deployment Test - AI Response Validation');
  console.log('============================================================');
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const results = [];
  
  for (const testCase of testCases) {
    const result = await testAgent(browser, testCase);
    results.push(result);
  }
  
  await browser.close();
  
  // Summary
  console.log('\n============================================================');
  console.log('📊 FINAL VERCEL DEPLOYMENT TEST RESULTS');
  console.log('============================================================');
  
  const successful = results.filter(r => r.success);
  const excellent = results.filter(r => r.quality === 'excellent');
  const good = results.filter(r => r.quality === 'good');
  const fair = results.filter(r => r.quality === 'fair');
  const poor = results.filter(r => r.quality === 'poor');
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Responding Agents: ${successful.length}/${results.length}`);
  console.log(`🌟 Excellent Quality: ${excellent.length}/${results.length}`);
  console.log(`🟢 Good Quality: ${good.length}/${results.length}`);
  console.log(`🟡 Fair Quality: ${fair.length}/${results.length}`);
  console.log(`🔴 Poor Quality: ${poor.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}`);
  
  console.log('\n📋 Individual Results:');
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const quality = result.quality === 'excellent' ? '🌟' : 
                   result.quality === 'good' ? '🟢' : 
                   result.quality === 'fair' ? '🟡' : 
                   result.quality === 'poor' ? '🔴' : '❌';
    console.log(`${status} ${quality} ${result.agent} (${result.score}/${result.maxScore})`);
  });
  
  // Overall assessment
  const successRate = (successful.length / results.length) * 100;
  const qualityRate = ((excellent.length + good.length) / results.length) * 100;
  
  console.log('\n🎯 DEPLOYMENT ASSESSMENT:');
  if (successRate >= 100 && qualityRate >= 80) {
    console.log('🌟 EXCELLENT: Deployment fully successful with high-quality responses');
  } else if (successRate >= 100 && qualityRate >= 60) {
    console.log('🟢 GOOD: All agents responding with acceptable quality');
  } else if (successRate >= 80) {
    console.log('🟡 FAIR: Most agents working but quality improvements needed');
  } else {
    console.log('🔴 POOR: Significant issues detected, troubleshooting required');
  }
  
  console.log(`📊 Success Rate: ${successRate.toFixed(1)}%`);
  console.log(`🎯 Quality Rate: ${qualityRate.toFixed(1)}%`);
  
  return results;
}

runFinalTest().catch(console.error); 