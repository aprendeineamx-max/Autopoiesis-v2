const fs = require('fs');
const path = require('path');

/**
 * State Manager - Tracks conversation state and progress
 */
class StateManager {
    constructor(workspaceRoot) {
        this.workspaceRoot = workspaceRoot;
        this.statePath = path.join(workspaceRoot, 'CONVERSATION_STATE.json');
        this.state = this.load();
    }

    /**
     * Load state from file or create new
     */
    load() {
        if (fs.existsSync(this.statePath)) {
            try {
                const content = fs.readFileSync(this.statePath, 'utf-8');
                return JSON.parse(content);
            } catch (error) {
                console.error('Error loading state, creating new:', error.message);
                return this.createNewState();
            }
        }

        return this.createNewState();
    }

    /**
     * Create new state object
     */
    createNewState() {
        return {
            version: '1.0',
            project: 'AntiGravity Ghost Agent',
            current_phase: 'Phase_7_Supervisor_MVP',
            conversation_id: this.generateId(),
            started_at: new Date().toISOString(),
            last_update: new Date().toISOString(),

            // Task tracking
            tasks_completed: 0,
            tasks_pending: 0,
            current_task: 'Initialize Supervisor Extension',

            // Message tracking
            executor_message_count: 0,
            supervisor_prompt_count: 0,
            messages: [],

            // Performance metrics
            autonomous_cycles: 0,
            test_pass_rate: 0,
            errors_detected: 0,

            // Completion tracking
            completion_criteria: {
                min_test_pass_rate: 0.95,
                min_cycles: 10,
                max_errors: 0
            }
        };
    }

    /**
     * Save state to file
     */
    save() {
        try {
            this.state.last_update = new Date().toISOString();
            const content = JSON.stringify(this.state, null, 2);
            fs.writeFileSync(this.statePath, content, 'utf-8');
        } catch (error) {
            console.error('Error saving state:', error.message);
        }
    }

    /**
     * Add message to history
     */
    addMessage(role, content) {
        const message = {
            id: `msg_${this.state.messages.length + 1}`,
            role, // 'executor' or 'supervisor'
            content,
            timestamp: new Date().toISOString(),
            cycle: this.state.autonomous_cycles
        };

        this.state.messages.push(message);

        if (role === 'executor') {
            this.state.executor_message_count++;
        } else if (role === 'supervisor') {
            this.state.supervisor_prompt_count++;
        }

        this.save();
    }

    /**
     * Update task status
     */
    updateTaskStatus(completed, pending, current) {
        this.state.tasks_completed = completed;
        this.state.tasks_pending = pending;
        this.state.current_task = current;
        this.save();
    }

    /**
     * Update test pass rate
     */
    updateTestPassRate(rate) {
        this.state.test_pass_rate = rate;
        this.save();
    }

    /**
     * Increment cycle counter
     */
    incrementCycle() {
        this.state.autonomous_cycles++;
        this.save();
    }

    /**
     * Increment error counter
     */
    incrementErrors() {
        this.state.errors_detected++;
        this.save();
    }

    /**
     * Get summary for reporting
     */
    getSummary() {
        return {
            project: this.state.project,
            phase: this.state.current_phase,
            cycles: this.state.autonomous_cycles,
            tasksCompleted: this.state.tasks_completed,
            tasksPending: this.state.tasks_pending,
            testPassRate: (this.state.test_pass_rate * 100).toFixed(1) + '%',
            messagesExchanged: this.state.messages.length,
            uptime: this.calculateUptime()
        };
    }

    /**
     * Calculate uptime since start
     */
    calculateUptime() {
        const start = new Date(this.state.started_at);
        const now = new Date();
        const diff = now - start;

        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);

        return `${hours}h ${minutes}m`;
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Reset state (for testing)
     */
    reset() {
        this.state = this.createNewState();
        this.save();
    }
}

module.exports = StateManager;
