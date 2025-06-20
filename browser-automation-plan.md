# 🤖 Browser Automation Testing Plan

## Overview
Automated browser testing to capture real back-and-forth conversations with each of the 6 AI agents.

## Technology Options

### Option 1: Puppeteer (Recommended)
```bash
npm install puppeteer
```
- **Pros:** Lightweight, fast, good for Node.js projects
- **Cons:** Chrome/Chromium only
- **Best for:** Quick implementation

### Option 2: Playwright
```bash
npm install playwright
```
- **Pros:** Multi-browser support (Chrome, Firefox, Safari), more robust
- **Cons:** Larger dependency
- **Best for:** Comprehensive testing

### Option 3: Selenium WebDriver
```bash
npm install selenium-webdriver
```
- **Pros:** Industry standard, extensive documentation
- **Cons:** More complex setup
- **Best for:** Enterprise-level testing

## Implementation Plan

### 1. Setup Phase
- Install automation library (Puppeteer recommended)
- Configure headless/headful mode
- Set up screenshot capture
- Configure wait strategies for AI responses

### 2. Test Script Structure
```javascript
// Automated Agent Conversation Test
async function testAgentConversations() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  const agents = [
    'agentic_chat',
    'generative_ui', 
    'human_loop',
    'predictive_state',
    'shared_state',
    'tool_ui'
  ];
  
  for (const agent of agents) {
    await testSingleAgent(page, agent);
  }
}
```

### 3. Agent Testing Function
```javascript
async function testSingleAgent(page, agentType) {
  // Navigate to agent page
  await page.goto(`http://localhost:3000/agents/${agentType}`);
  
  // Wait for CopilotKit to load
  await page.waitForSelector('[data-testid="chat-input"]', { timeout: 10000 });
  
  // Send test messages
  const testMessages = getTestMessages(agentType);
  
  for (const message of testMessages) {
    // Type message
    await page.type('[data-testid="chat-input"]', message);
    
    // Send message
    await page.click('[data-testid="send-button"]');
    
    // Wait for response
    await waitForAgentResponse(page);
    
    // Capture conversation
    const conversation = await captureConversation(page);
    
    // Save results
    saveConversationResult(agentType, message, conversation);
  }
}
```

### 4. Response Detection
```javascript
async function waitForAgentResponse(page) {
  // Wait for typing indicator to disappear
  await page.waitForFunction(() => {
    const indicator = document.querySelector('[data-testid="typing-indicator"]');
    return !indicator || indicator.style.display === 'none';
  }, { timeout: 30000 });
  
  // Wait for new message to appear
  await page.waitForFunction(() => {
    const messages = document.querySelectorAll('.message-bubble');
    return messages.length > previousMessageCount;
  });
}
```

## What We'd Capture

### 1. Full Conversation Logs
- User input text
- Agent response text
- Response timestamps
- Agent-specific behaviors

### 2. Visual Evidence
- Screenshots before sending message
- Screenshots of agent responses
- Full page captures

### 3. Performance Metrics
- Response time measurements
- Page load times
- Error detection

### 4. Agent-Specific Validation
- **Agentic Chat:** Context awareness, reasoning quality
- **Generative UI:** React component code generation
- **Human Loop:** Approval workflow creation
- **Predictive State:** Future scenario predictions
- **Shared State:** Multi-agent coordination
- **Tool UI:** FormBuilder/ChartBuilder usage

## Expected Output

### Conversation Results File
```json
{
  "testRun": {
    "timestamp": "2024-12-20T12:43:30Z",
    "duration": "2m 34s",
    "browser": "Chrome 120.0.0.0"
  },
  "agents": {
    "agentic_chat": {
      "conversations": [
        {
          "userMessage": "Hello, I'm looking for help with my project",
          "agentResponse": "I'd be happy to help you with your project! To provide the most relevant assistance, could you tell me more about...",
          "responseTime": "1.2s",
          "timestamp": "2024-12-20T12:43:35Z"
        }
      ],
      "screenshots": ["agentic_chat_1.png", "agentic_chat_2.png"],
      "status": "success"
    }
  }
}
```

## Implementation Steps

### Step 1: Install Dependencies
```bash
cd mb-ai
npm install puppeteer
```

### Step 2: Create Test Selectors
Add data-testid attributes to chat components for reliable element selection.

### Step 3: Build Test Script
Create comprehensive automation script with error handling and retry logic.

### Step 4: Run Automated Tests
Execute tests and capture real conversations with all 6 agents.

### Step 5: Generate Report
Process captured data into comprehensive test results with evidence.

## Benefits

✅ **Real Conversations:** Actual agent responses, not simulated
✅ **Proof of Functionality:** Visual and textual evidence
✅ **Automated Execution:** No manual intervention required
✅ **Comprehensive Coverage:** All agents tested systematically
✅ **Performance Data:** Response times and error rates
✅ **Reproducible Results:** Can be run multiple times
✅ **Visual Documentation:** Screenshots for validation

## Challenges to Address

⚠️ **Timing Issues:** AI responses have variable timing
⚠️ **Element Detection:** Need reliable selectors for chat interface
⚠️ **Error Handling:** Network issues, timeouts, API limits
⚠️ **Response Validation:** Ensuring complete responses are captured
⚠️ **CopilotKit Integration:** Understanding the specific DOM structure

## Estimated Implementation Time
- **Setup:** 15-30 minutes
- **Scripting:** 45-60 minutes  
- **Testing & Refinement:** 30-45 minutes
- **Total:** ~2 hours for complete automation

Would you like me to proceed with implementing this browser automation testing? 