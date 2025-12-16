const axios = require('axios');

/**
 * API Client for calling external AI services (Groq, OpenRouter, Google)
 */
class APIClient {
    constructor(config) {
        this.config = config;
        this.currentProvider = 'groq'; // Default
    }

    /**
     * Generate next prompt for executor agent
     */
    async generatePrompt(context) {
        const provider = this.getCurrentProvider();

        try {
            switch (provider) {
                case 'groq':
                    return await this.callGroq(context);
                case 'openrouter':
                    return await this.callOpenRouter(context);
                case 'google':
                    return await this.callGoogle(context);
                default:
                    throw new Error(`Unknown provider: ${provider}`);
            }
        } catch (error) {
            console.error(`API call to ${provider} failed:`, error.message);

            // Try fallback provider
            if (provider !== 'groq') {
                console.log('Falling back to Groq...');
                this.currentProvider = 'groq';
                return await this.callGroq(context);
            }

            throw error;
        }
    }

    /**
     * Call Groq API (Llama 3.3-70B)
     */
    async callGroq(context) {
        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: this.config.groq.model || 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: this.buildSystemPrompt()
                    },
                    {
                        role: 'user',
                        content: this.buildContextPrompt(context)
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000
            },
            {
                headers: {
                    'Authorization': `Bearer ${this.config.groq.api_key}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

        return response.data.choices[0].message.content;
    }

    /**
     * Call OpenRouter API
     */
    async callOpenRouter(context) {
        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: 'anthropic/claude-3.5-sonnet',
                messages: [
                    {
                        role: 'system',
                        content: this.buildSystemPrompt()
                    },
                    {
                        role: 'user',
                        content: this.buildContextPrompt(context)
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000
            },
            {
                headers: {
                    'Authorization': `Bearer ${this.config.openrouter.api_key}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://github.com/antigravity',
                    'X-Title': 'AntiGravity Supervisor'
                },
                timeout: 30000
            }
        );

        return response.data.choices[0].message.content;
    }

    /**
     * Call Google Gemini API  
     */
    async callGoogle(context) {
        const apiKey = this.getGoogleApiKey();

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
            {
                contents: [{
                    parts: [{
                        text: this.buildSystemPrompt() + '\n\n' + this.buildContextPrompt(context)
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2000
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

        return response.data.candidates[0].content.parts[0].text;
    }

    /**
     * Build system prompt for Supervisor AI
     */
    buildSystemPrompt() {
        return `You are the SUPERVISOR AI for the AntiGravity Ghost Agent project.

ROLE:
- You work alongside another AI agent (Gemini Executor) within the AntiGravity IDE
- Gemini implements code and executes tasks
- You analyze results and decide what should be done next
- This is an AUTONOMOUS system - no human is involved in the conversation

YOUR RESPONSIBILITIES:
1. Analyze the executor's last message
2. Review repository state (files changed, test results, errors)
3. Check project context (roadmap, tasks, current phase)
4. Decide if current task is complete or needs more work
5. Generate the NEXT prompt for the executor agent

OUTPUT FORMAT:
- Write ONLY the prompt that will be sent to the executor
- Be specific, actionable, and reference file paths when needed
- No meta-commentary, no explanations outside the prompt
- Keep it concise but comprehensive
- If tests fail, ask for specific fixes
- If task is complete, assign the next task from the roadmap

DECISION CRITERIA:
- Task complete when: tests passing, no errors, deliverable created
- If incomplete: provide clear next steps
- If errors detected: ask for specific fixes with file references
- Always maintain momentum towards project goals

Remember: Your output goes directly to GHOST_INPUT.txt and will be auto-pasted to Gemini's chat.`;
    }

    /**
     * Build context prompt with all relevant information
     */
    buildContextPrompt(context) {
        const {
            lastMessage,
            repoAnalysis,
            testResults,
            projectContext,
            conversationState
        } = context;

        // Calculate stats
        const filesChangedCount = repoAnalysis.filesChanged?.length || 0;
        const testPassed = testResults.passed || 0;
        const testFailed = testResults.failed || 0;
        const testTotal = testPassed + testFailed;
        const passRate = testTotal > 0 ? ((testPassed / testTotal) * 100).toFixed(1) : 0;

        return `CURRENT CONTEXT:

═══════════════════════════════════════
EXECUTOR'S LAST MESSAGE:
═══════════════════════════════════════
${lastMessage.content}

═══════════════════════════════════════
REPOSITORY STATE:
═══════════════════════════════════════
Files Changed: ${filesChangedCount}
${filesChangedCount > 0 ? `\nRecent Changes:\n${repoAnalysis.filesChanged.slice(0, 10).map(f => `  - ${f}`).join('\n')}` : ''}

═══════════════════════════════════════
TEST RESULTS:
═══════════════════════════════════════
Passed: ${testPassed}/${testTotal}
Failed: ${testFailed}/${testTotal}
Pass Rate: ${passRate}%
Status: ${passRate >= 95 ? '✅ PASSING' : passRate >= 75 ? '⚠️ NEEDS WORK' : '❌ FAILING'}

═══════════════════════════════════════
PROJECT TRACKING:
═══════════════════════════════════════
Current Phase: ${projectContext.conversationState?.current_phase || 'Phase 7 - Dual-Core Supervisor'}
Tasks Completed: ${conversationState.tasks_completed}
Tasks Pending: ${conversationState.tasks_pending}
Autonomous Cycles: ${conversationState.autonomous_cycles}

Current Task: ${conversationState.current_task || 'Not specified - check task.md'}

═══════════════════════════════════════
ROADMAP CONTEXT:
═══════════════════════════════════════
${projectContext.roadmap ? projectContext.roadmap.substring(0, 500) + '...' : 'Not available'}

═══════════════════════════════════════
YOUR DECISION:
═══════════════════════════════════════

Based on the above context:

1. STATUS CHECK:
   - Is the current task complete? (tests passing, deliverables created, no errors)
   - Are there errors that need fixing?
   - Is progress being made?

2. NEXT ACTION:
   - If task complete: What's the next task from the roadmap?
   - If incomplete: What specific steps should the executor take?
   - If errors: What exact fixes are needed (include file paths and line numbers if available)?

Generate the next prompt for Gemini (the executor agent). Be actionable and specific:`;
    }

    /**
     * Get current AI provider
     */
    getCurrentProvider() {
        // Could implement rotation logic here
        return this.currentProvider;
    }

    /**
     * Get Google API key with rotation
     */
    getGoogleApiKey() {
        const keys = this.config.google.api_keys;
        if (!keys || keys.length === 0) {
            throw new Error('No Google API keys configured');
        }

        // Simple rotation: use current cycle % keys.length
        const index = Date.now() % keys.length;
        return keys[index];
    }

    /**
     * Set provider (for manual override or testing)
     */
    setProvider(provider) {
        const validProviders = ['groq', 'openrouter', 'google'];
        if (!validProviders.includes(provider)) {
            throw new Error(`Invalid provider: ${provider}. Must be one of: ${validProviders.join(', ')}`);
        }

        this.currentProvider = provider;
        console.log(`Supervisor provider set to: ${provider}`);
    }
}

module.exports = APIClient;
