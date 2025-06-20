#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function testOneAgent() {
  const browser = await puppeteer.launch({ 
    headless: false, // Show browser for debugging
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('🚀 Starting simple test...');
    
    // Navigate to agent
    await page.goto('http://localhost:3000/agents/agentic_chat', { waitUntil: 'networkidle0' });
    await page.waitForTimeout(5000);
    
    console.log('📱 Page loaded, checking for CopilotKit interface...');
    
    // Check what's actually on the page
    const pageInfo = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input, textarea');
      const buttons = document.querySelectorAll('button');
      const iframe = document.querySelector('iframe');
      
      return {
        inputCount: inputs.length,
        buttonCount: buttons.length,
        hasIframe: !!iframe,
        iframeSrc: iframe ? iframe.src : null,
        pageText: document.body.textContent.substring(0, 500)
      };
    });
    
    console.log('📊 Page analysis:', JSON.stringify(pageInfo, null, 2));
    
    // Wait for user to manually test
    console.log('🧪 Please manually test the agent in the browser window. Press Ctrl+C when done.');
    await page.waitForTimeout(60000); // Wait 1 minute
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

testOneAgent(); 