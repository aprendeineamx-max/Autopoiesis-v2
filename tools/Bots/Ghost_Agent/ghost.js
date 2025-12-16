(function () {
    'use strict';

    const AGENT_NAME = '👻 Ghost Agent';
    const ATTR_HANDLED = 'data-ghost-handled';

    // Config: Performance & Targeting
    const CONFIG = {
        debounceMs: 200,
        selectors: [
            '.monaco-button',
            '.action-item',
            '.dialog-buttons .monaco-text-button',
            '.quick-input-widget .quick-input-list-entry',
            '.notification-toast .monaco-button',
            '.modal-body .monaco-button',
            '.chat-notification-widget .monaco-button',
            '[aria-label="Allow Always"]',
            '[aria-label="Allow Once"]',
            '[aria-label="Accept all"]',
            '[title="Accept all"]',
            '.chat-input-control .monaco-button',
            '[role="button"]',
            'button',
            '.codicon-debug-stop', // Visual cue for "Working" (Stop button)
            '[aria-label="Stop"]',
            '[title="Stop Generating"]'
        ],
        keywords: [
            'accept', 'autorizar', 'allow', 'confirm', 'alt+enter', 'yes', 'si',
            'setup', 'configurar', 'trust', 'connect',
            'allow once', 'always allow', 'allow always',
            'accept all',
            'acceptalt', 'run command',
            'expand all', 'expandir todo', // New User Request
            'stop generating' // State detection
        ]
    };

    let isWorking = false;
    let lastReport = 0;

    const reportState = (working) => {
        const now = Date.now();
        if (working !== isWorking || now - lastReport > 1000) { // Heartbeat every 1s or on change
            isWorking = working;
            lastReport = now;
            fetch('http://localhost:1337/api/report_state', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ working: isWorking })
            }).catch(() => { }); // Silent fail
        }
    };


    console.log(`${AGENT_NAME}: Initialized. Waiting via MutationObserver...`);

    /**
     * Predicate: Should we click this element?
     * @param {HTMLElement} element 
     */
    const shouldClick = (element) => {
        // 1. Sanity Check
        if (!element || element.hasAttribute(ATTR_HANDLED) || element.disabled) return false;

        // 2. Visibility Check (Basic)
        if (element.offsetParent === null) return false;

        // 3. Content Match
        const text = (element.innerText || element.textContent || '').trim().toLowerCase();
        const title = (element.getAttribute('title') || element.getAttribute('aria-label') || '').toLowerCase();

        return CONFIG.keywords.some(kw => text.includes(kw) || title.includes(kw));
    };

    /**
     * Action: Click and Mark
     * @param {HTMLElement} element 
     */
    const performClick = (element) => {
        try {
            // Mark immediately to prevent double-clicks
            element.setAttribute(ATTR_HANDLED, 'true');

            // Visual Debug (Optional: Highlight before click)
            element.style.outline = '2px solid #00FF00';

            // Execution
            element.click();

            console.log(`${AGENT_NAME}: Auto-authorized -> "${element.innerText || 'Action'}"`);
        } catch (err) {
            console.error(`${AGENT_NAME}: Action Failed`, err);
        }
    };

    /**
     * Observer Logic
     */
    const handleMutations = (mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // A. Check the node itself for Buttons (Existing Logic)
                        if (CONFIG.selectors.some(s => node.matches(s)) && shouldClick(node)) {
                            performClick(node);
                        }

                        // B. Check children for Buttons (Existing Logic)
                        const query = CONFIG.selectors.join(',');
                        const children = node.querySelectorAll(query);
                        children.forEach(child => {
                            if (shouldClick(child)) performClick(child);
                        });

                        // C. CHAT LOGGING (New Feature)
                        // Heuristic: If a new element has substantial text, it might be a chat message.
                        // We filter out short UI labels.
                        // Ideally, we'd use a specific selector like '.chat-message' or '.monaco-editor'.
                        // For now, we use a generic text length check to catch the main content.
                        const textContent = (node.innerText || '').trim();
                        if (textContent.length > 50 && !node.hasAttribute('data-ghost-logged')) {

                            // Prevent logging the same node twice
                            node.setAttribute('data-ghost-logged', 'true');

                            // Send to OmniServer
                            // We prefer to debounce this or send only unique messages, 
                            // but user requested "ALL messages".
                            // To avoid crushing the server with slight edits, we assume 'addedNodes' capturing whole blocks.

                            fetch('http://localhost:1337/api/log_chat', {
                                method: 'POST',
                                body: textContent
                            }).catch(err => console.error("Ghost Log Error:", err));
                        }
                    }
                });
            }
        }
    };

    // Initialize Observer
    const observer = new MutationObserver(handleMutations);

    // Wait for Body
    const init = () => {
        if (document.body) {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        } else {
            setTimeout(init, 100);
        }
    };

    // State Poller (Checks if Agent is Working)
    setInterval(() => {
        // Look for typical "Stop" indicators in VS Code / Antigravity
        // .codicon-debug-stop often used for stop buttons
        // or check if a button with "stop generating" exists
        const stopBtn = document.querySelector('.codicon-debug-stop, [aria-label="Stop Generating"], [title="Stop Generating"]');
        const processing = !!stopBtn; // True if stop button exists

        reportState(processing);
    }, 500);

    init();

})();
