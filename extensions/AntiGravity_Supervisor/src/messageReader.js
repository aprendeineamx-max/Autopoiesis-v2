/**
 * Message Reader - Reads last Gemini message from chat
 * 
 * NOTE: AntiGravity may not expose webview API for chat reading.
 * This is a fallback implementation that reads from GHOST_OUTPUT.txt
 * 
 * Future: Implement DOM scraping if webview access becomes available
 */
class MessageReader {
    constructor() {
        this.lastMessageId = null;
    }

    /**
     * Initialize reader (placeholder for future webview access)
     */
    async initialize() {
        console.log('MessageReader initialized (file-based mode)');
        // Future: Get webview reference if available
        return true;
    }

    /**
     * Get last message from Gemini
     * Falls back to file reading since webview may not be accessible
     */
    async getLastMessage() {
        // Attempt webview reading (not implemented yet)
        // return await this.readFromWebview();

        // Fallback to file reading
        return null; // Let extension.js handle the fallback
    }

    /**
     * Read from webview (future implementation)
     */
    async readFromWebview() {
        throw new Error('Webview reading not yet implemented - use file fallback');

        // Future implementation:
        /*
        const script = `
            (function() {
                const container = document.querySelector('.chat-messages');
                if (!container) return null;
                
                const lastMsg = container.lastElementChild;
                if (!lastMsg) return null;
                
                return {
                    role: lastMsg.dataset.role || 'agent',
                    content: lastMsg.textContent || '',
                    timestamp: lastMsg.dataset.timestamp || new Date().toISOString(),
                    id: lastMsg.dataset.messageId || 'msg_' + Date.now()
                };
            })()
        `;
        
        const result = await this.webview.executeScript(script);
        return result;
        */
    }

    /**
     * Detect if executor has completed a task
     */
    detectTaskCompletion(message) {
        if (!message || !message.content) return false;

        const completionPhrases = [
            'completed',
            'done',
            'finished',
            'all tests passing',
            'ready for review',
            'successfully implemented',
            'task complete'
        ];

        const content = message.content.toLowerCase();
        return completionPhrases.some(phrase => content.includes(phrase));
    }

    /**
     * Detect if executor is waiting for input
     */
    detectWaitingForInput(message) {
        if (!message || !message.content) return false;

        const waitingPhrases = [
            'what should',
            'which approach',
            'how would you like',
            'please specify',
            'need clarification'
        ];

        const content = message.content.toLowerCase();
        return waitingPhrases.some(phrase => content.includes(phrase));
    }
}

module.exports = MessageReader;
