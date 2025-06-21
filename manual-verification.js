#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function manualVerification() {
  console.log('🔍 Manual Verification - Opening Browser for Manual Testing');
  console.log('============================================================');
  console.log('This will open a browser window for manual testing.');
  console.log('You can manually test each agent and verify AI responses.');
  console.log('');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1400, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Listen for console messages to help debug
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`🔴 Browser Error: ${msg.text()}`);
    } else if (msg.type() === 'log') {
      console.log(`🔵 Browser Log: ${msg.text()}`);
    }
  });
  
  // Listen for network requests to see API calls
  page.on('request', request => {
    if (request.url().includes('copilotkit') || request.url().includes('api')) {
      console.log(`📡 API Request: ${request.method()} ${request.url()}`);
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('copilotkit') || response.url().includes('api')) {
      console.log(`📥 API Response: ${response.status()} ${response.url()}`);
    }
  });
  
  try {
    console.log('🌐 Opening main agents page...');
    await page.goto('https://mb-ai.vercel.app/agents', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    console.log('✅ Browser opened successfully!');
    console.log('');
    console.log('📋 MANUAL TESTING INSTRUCTIONS:');
    console.log('1. Navigate to each agent page');
    console.log('2. Send a test message in the chat interface');
    console.log('3. Wait for AI response (should appear within 10-30 seconds)');
    console.log('4. Verify the response is relevant and not just static content');
    console.log('');
    console.log('🎯 Test URLs:');
    console.log('• Agentic Chat: https://mb-ai.vercel.app/agents/agentic_chat');
    console.log('• Generative UI: https://mb-ai.vercel.app/agents/generative_ui');
    console.log('• Human Loop: https://mb-ai.vercel.app/agents/human_loop');
    console.log('• Predictive State: https://mb-ai.vercel.app/agents/predictive_state');
    console.log('• Shared State: https://mb-ai.vercel.app/agents/shared_state');
    console.log('• Tool UI: https://mb-ai.vercel.app/agents/tool_ui');
    console.log('');
    console.log('💡 What to look for:');
    console.log('• Chat interface loads properly');
    console.log('• You can type messages');
    console.log('• AI responds with relevant, contextual answers');
    console.log('• No error messages in browser console');
    console.log('');
    console.log('⏳ Browser will stay open for 10 minutes for manual testing...');
    console.log('Press Ctrl+C to close early if needed.');
    
    // Keep browser open for manual testing
    await new Promise(resolve => setTimeout(resolve, 600000)); // 10 minutes
    
  } catch (error) {
    console.error('❌ Error during manual verification:', error);
  } finally {
    console.log('🔚 Closing browser...');
    await browser.close();
  }
}

manualVerification().catch(console.error); 