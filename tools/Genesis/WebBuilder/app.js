// GENESIS BUILDER LOGIC v3.0 (Advanced Features)
const state = {
    timeline: [],
    draggedItem: null,
    visibleLimit: 50,
    currentQuery: '',
    filteredPool: [],
    observer: null
};

document.addEventListener('DOMContentLoaded', () => {
    console.log("Genesis Engine v3.0 Loaded.");

    // --- UI ELEMENTS ---
    const helpBtn = document.getElementById('btn-help');
    const helpModal = document.getElementById('help-modal');
    const closeHelp = document.getElementById('close-help');
    const searchInput = document.getElementById('search-box');
    const pool = document.getElementById('command-pool');
    const timeline = document.getElementById('timeline');
    const exportBtn = document.getElementById('btn-export');
    const exportNameInput = document.getElementById('export-name');
    const sentinel = document.getElementById('sentinel');

    // Toggle Help
    helpBtn.addEventListener('click', () => { helpModal.classList.add('visible'); });
    closeHelp.addEventListener('click', () => { helpModal.classList.remove('visible'); });

    // Validate Data
    if (typeof COMMAND_DB === 'undefined') {
        alert("CRITICAL ERROR: data.js not loaded.");
        return;
    }

    // Initialize
    state.filteredPool = COMMAND_DB;
    renderBatch(true);

    // Infinite Scroll
    state.observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) loadMore();
    }, { root: pool, threshold: 0.1 });
    if (sentinel) state.observer.observe(sentinel);

    // Search
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const query = e.target.value.toLowerCase().trim();
            state.currentQuery = query;
            state.visibleLimit = 50;

            if (query === '') {
                state.filteredPool = COMMAND_DB;
            } else {
                state.filteredPool = COMMAND_DB.filter(cmd => {
                    const idMatch = cmd.command.toLowerCase().includes(query);
                    const keyMatch = cmd.key && cmd.key.toLowerCase().includes(query);
                    const pretty = prettifyCommand(cmd.command).toLowerCase();
                    return idMatch || keyMatch || pretty.includes(query);
                });
            }
            renderBatch(true);
        }, 300);
    });

    // Drag & Drop
    timeline.addEventListener('dragover', (e) => { e.preventDefault(); timeline.classList.add('drag-over'); });
    timeline.addEventListener('dragleave', () => { timeline.classList.remove('drag-over'); });
    timeline.addEventListener('drop', (e) => {
        e.preventDefault();
        timeline.classList.remove('drag-over');
        if (state.draggedItem) {
            addToTimeline(state.draggedItem);
            state.draggedItem = null;
        }
    });

    exportBtn.addEventListener('click', generateExtensionCode);

    // --- LOGIC ---

    function loadMore() {
        if (state.visibleLimit >= state.filteredPool.length) return;
        state.visibleLimit += 50;
        renderBatch(false);
    }

    function renderBatch(reset) {
        if (reset) pool.innerHTML = '';
        const fragment = document.createDocumentFragment();
        const currentCount = pool.children.length;
        const targetCount = Math.min(state.visibleLimit, state.filteredPool.length);

        state.filteredPool.slice(currentCount, targetCount).forEach(cmd => {
            fragment.appendChild(createCommandCard(cmd));
        });

        pool.appendChild(fragment);
        if (sentinel) pool.appendChild(sentinel);
    }

    function createCommandCard(cmd) {
        const el = document.createElement('div');
        el.className = 'command-item';
        el.draggable = true;
        const prettyName = prettifyCommand(cmd.command);
        const description = generateDescription(cmd.command);

        el.innerHTML = `
            <div class="cmd-pretty">${prettyName}</div>
            <div class="cmd-id">${cmd.command}</div>
            <div class="cmd-desc">${description}</div>
            ${cmd.key ? `<span class="cmd-key">⌨ ${cmd.key}</span>` : ''}
        `;

        el.addEventListener('dragstart', () => {
            // Clone to avoid modifying DB reference directly in timeline logic
            state.draggedItem = { ...cmd, delay: 500 };
            el.style.opacity = '0.5';
        });
        el.addEventListener('dragend', () => { el.style.opacity = '1'; });
        el.addEventListener('dblclick', () => { addToTimeline({ ...cmd, delay: 500 }); });

        return el;
    }

    // Helper: Name Prettifier
    function prettifyCommand(rawId) {
        const parts = rawId.split('.');
        let capitalized = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1));
        if (capitalized[0] === 'Workbench' && capitalized[1] === 'Action') return capitalized.slice(2).join(' ');
        if (capitalized[0] === 'Editor' && capitalized[1] === 'Action') return "Editor: " + capitalized.slice(2).join(' ');
        return capitalized.join(' ');
    }

    function generateDescription(rawId) {
        if (rawId.includes('copy')) return "Copia selección al clipboard.";
        if (rawId.includes('paste')) return "Pega desde el clipboard.";
        if (rawId.includes('chat')) return "Interactúa con el asistente.";
        if (rawId.includes('terminal')) return "Acciones de terminal.";
        return "Acción de sistema interno.";
    }

    function addToTimeline(cmd) {
        state.timeline.push(cmd);
        renderTimeline();
    }

    function renderTimeline() {
        timeline.innerHTML = '';
        const emptyMsg = document.createElement('div');
        emptyMsg.id = 'empty-msg';
        emptyMsg.style.cssText = 'text-align:center; color:#555; margin-top:50px; display:none';
        emptyMsg.innerText = 'Arrastra comandos aquí...';
        timeline.appendChild(emptyMsg);

        if (state.timeline.length === 0) {
            emptyMsg.style.display = 'block';
            return;
        }

        state.timeline.forEach((cmd, index) => {
            const pretty = prettifyCommand(cmd.command);
            const block = document.createElement('div');
            block.className = 'timeline-block';

            block.innerHTML = `
                <div class="block-info">
                    <span class="step-num">#${index + 1}</span>
                    <strong style="color:var(--accent)">${pretty}</strong>
                    <div style="font-size:0.8rem; color:#888">${cmd.command}</div>
                </div>
                
                <div class="block-config">
                    <span class="config-label">Delay (ms):</span>
                    <input type="number" class="delay-input" value="${cmd.delay}" min="0" step="100">
                </div>

                <div class="block-actions">
                    <span class="btn-del" title="Eliminar" onclick="removeFromTimeline(${index})">🗑️</span>
                </div>
            `;

            // Bind Input
            const input = block.querySelector('.delay-input');
            input.addEventListener('change', (e) => {
                cmd.delay = parseInt(e.target.value) || 0;
            });

            timeline.appendChild(block);
        });

        timeline.scrollTop = timeline.scrollHeight;
    }

    window.removeFromTimeline = (index) => {
        state.timeline.splice(index, 1);
        renderTimeline();
    };

    function generateExtensionCode() {
        if (state.timeline.length === 0) {
            alert("Timeline vacío. Añade acciones.");
            return;
        }

        const exportName = exportNameInput.value.trim() || 'extension';
        const cleanName = exportName.replace(/[^a-zA-Z0-9_-]/g, '_');

        let code = `/**\n * GENERATED BY ANTIGRAVITY GENESIS\n * File: ${cleanName}.js\n * Date: ${new Date().toISOString()}\n */\n`;
        code += `const vscode = require('vscode');\n\n`;
        code += `async function activate(context) {\n`;
        code += `    vscode.window.showInformationMessage('🚀 Genesis Running: ${cleanName}');\n\n`;
        code += `    let disposable = vscode.commands.registerCommand('${cleanName.toLowerCase()}.run', async () => {\n`;

        state.timeline.forEach((cmd, i) => {
            code += `        // [Step ${i + 1}] ${prettifyCommand(cmd.command)} (Delay: ${cmd.delay}ms)\n`;
            code += `        await vscode.commands.executeCommand('${cmd.command}');\n`;
            code += `        await new Promise(r => setTimeout(r, ${cmd.delay}));\n\n`;
        });

        code += `    });\n\n`;
        code += `    context.subscriptions.push(disposable);\n`;
        code += `    // Auto-Run\n`;
        code += `    vscode.commands.executeCommand('${cleanName.toLowerCase()}.run');\n`;
        code += `}\n\n`;
        code += `function deactivate() {}\n\n`;
        code += `module.exports = { activate, deactivate };`;

        const blob = new Blob([code], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${cleanName}.js`;
        a.click();
    }
});
