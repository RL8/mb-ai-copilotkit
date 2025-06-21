#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function quickTest() {
  console.log('🔧 Quick Fix Test - Testing Simplified CopilotKit');
  console.log('Testing: https://mb-ai.vercel.app/agents/agentic_chat');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1200, height: 800 }
  });
  
  const page = await browser.newPage();
  
  // Listen for API calls
  page.on('response', response => {
    if (response.url().includes('copilotkit')) {
      console.log(`📡 CopilotKit API: ${response.status()} ${response.url()}`);
    }
  });
  
  try {
    console.log('🌐 Loading agent page...');
    await page.goto('https://mb-ai.vercel.app/agents/agentic_chat', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    await page.waitForTimeout(5000);
    
    console.log('📤 Sending test message...');
    await page.click('textarea[placeholder*="Type"]');
    await page.type('textarea[placeholder*="Type"]', 'Hello, are you working now?');
    
    const sendButton = await page.$('button:has(svg)');
    if (sendButton) {
      await sendButton.click();
    } else {
      await page.keyboard.press('Enter');
    }
    
    console.log('⏳ Waiting 15 seconds for response...');
    await page.waitForTimeout(15000);
    
    // Check for actual response
    const response = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      for (const element of elements) {
        const text = element.textContent;
        if (text && text.length > 50 && 
            !text.includes('Advanced conversational AI') &&
            !text.includes('Hello, are you working now?') &&
            !text.includes('How to Use') &&
            (text.includes('Hello') || text.includes('Yes') || text.includes('working') || text.includes('help'))) {
          return text.trim();
        }
      }
      return null;
    });
    
    if (response) {
      console.log('✅ SUCCESS! AI Response received:');
      console.log(`📝 ${response.substring(0, 200)}...`);
    } else {
      console.log('❌ No AI response detected');
    }
    
    console.log('🔍 Browser staying open for manual verification...');
    await new Promise(resolve => setTimeout(resolve, 60000)); // 1 minute
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await browser.close();
  }
}

quickTest().catch(console.error); 