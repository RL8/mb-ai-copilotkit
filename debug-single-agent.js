#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function debugSingleAgent() {
  console.log('🔬 Debug Test: Single Agent on Vercel');
  console.log('🌐 URL: https://mb-ai.vercel.app/agents/agentic_chat');
  
  const browser = await puppeteer.launch({ 
    headless: false, // Show browser for debugging
    defaultViewport: { width: 1200, height: 800 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Listen for console messages
    page.on('console', msg => {
      console.log(`🔵 Browser: ${msg.type()} - ${msg.text()}`);
    });
    
    // Listen for network requests
    page.on('request', request => {
      if (request.url().includes('copilotkit') || request.url().includes('api')) {
        console.log(`📡 Request: ${request.method()} ${request.url()}`);
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('copilotkit') || response.url().includes('api')) {
        console.log(`📥 Response: ${response.status()} ${response.url()}`);
      }
    });
    
    // Navigate to agent
    console.log('🌐 Navigating to agentic_chat...');
    await page.goto('https://mb-ai.vercel.app/agents/agentic_chat', { 
      waitUntil: 'networkidle0', 
      timeout: 30000 
    });
    
    console.log('⏳ Waiting for page to fully load...');
    await page.waitForTimeout(8000);
    
    // Check page content
    const pageTitle = await page.title();
    console.log(`📄 Page title: ${pageTitle}`);
    
    // Look for input
    console.log('🔍 Looking for chat input...');
    const inputFound = await page.$('textarea[placeholder*="Type"]');
    
    if (!inputFound) {
      console.log('❌ No input found! Taking screenshot...');
      await page.screenshot({ path: 'debug-no-input.png', fullPage: true });
      
      // Check what's actually on the page
      const bodyText = await page.evaluate(() => document.body.textContent.substring(0, 500));
      console.log(`📝 Page content: ${bodyText}`);
      return;
    }
    
    console.log('✅ Input found! Sending test message...');
    
    // Send message
    await page.click('textarea[placeholder*="Type"]');
    await page.type('textarea[placeholder*="Type"]', 'Hello, can you help me?', { delay: 100 });
    
    // Find and click send button
    const sendButton = await page.$('button:has(svg)');
    if (sendButton) {
      await sendButton.click();
      console.log('✅ Message sent!');
    } else {
      await page.keyboard.press('Enter');
      console.log('✅ Message sent via Enter!');
    }
    
    // Wait and watch for response
    console.log('⏳ Waiting for AI response... (60 seconds max)');
    let responseFound = false;
    
    for (let i = 0; i < 60; i++) {
      await page.waitForTimeout(1000);
      
      const response = await page.evaluate(() => {
        // Look for any new substantial text that looks like an AI response
        const elements = document.querySelectorAll('div, p, span');
        for (const element of elements) {
          const text = element.textContent.trim();
          if (text.length > 50 && 
              !text.includes('Hello! I\'m your') && 
              !text.includes('Try asking me') &&
              !text.includes('How to Use') &&
              !text.includes('Hello, can you help me?')) {
            return text;
          }
        }
        return null;
      });
      
      if (response) {
        console.log(`✅ Response received after ${i + 1} seconds!`);
        console.log(`📥 Response: ${response.substring(0, 300)}...`);
        responseFound = true;
        break;
      }
      
      if (i % 10 === 0) {
        console.log(`⏳ Still waiting... (${i + 1}s)`);
      }
    }
    
    if (!responseFound) {
      console.log('❌ No response received after 60 seconds');
      await page.screenshot({ path: 'debug-no-response.png', fullPage: true });
    }
    
    console.log('🎯 Debug test complete. Check screenshots if issues found.');
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    // Keep browser open for manual inspection
    console.log('🔍 Browser staying open for manual inspection. Press Ctrl+C to close.');
    await new Promise(resolve => setTimeout(resolve, 300000)); // Wait 5 minutes
    await browser.close();
  }
}

debugSingleAgent().catch(console.error); 