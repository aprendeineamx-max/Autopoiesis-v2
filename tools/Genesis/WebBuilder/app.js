// GENESIS BUILDER LOGIC v2.0
// Project: AntiGravity Extension Creator

const state = {
    timeline: [],
    draggedItem: null,
    visibleLimit: 50,
    currentQuery: '',
    filteredPool: [], // Store filtered list for "Infinite Scroll"
    observer: null
};

document.addEventListener('DOMContentLoaded', () => {
    console.log("Genesis Engine v2.0 Loaded.");

    // --- DIALOGS ---
    const helpBtn = document.getElementById('btn-help');
    const helpModal = document.getElementById('help-modal');
    const closeHelp = document.getElementById('close-help');

    // Toggle Help
    helpBtn.addEventListener('click', () => { helpModal.classList.add('visible'); });
    closeHelp.addEventListener('click', () => { helpModal.classList.remove('visible'); });

    if (typeof COMMAND_DB === 'undefined') {
        alert("CRITICAL ERROR: data.js not loaded.");
        return;
    }

    const searchInput = document.getElementById('search-box');
    const pool = document.getElementById('command-pool');
    const timeline = document.getElementById('timeline');
    const exportBtn = document.getElementById('btn-export');
    const sentinel = document.getElementById('sentinel'); // Parsing anchor

    // Initialize Pool
    state.filteredPool = COMMAND_DB;
    renderBatch(true);

    // Infinite Scroll Observer
    state.observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            loadMore();
        }
    }, { root: pool, threshold: 0.1 });

    if (sentinel) state.observer.observe(sentinel);

    // Search Listener (Debounced)
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const query = e.target.value.toLowerCase().trim();
            state.currentQuery = query;
            state.visibleLimit = 50; // Reset limit

            // Filter Global DB
            if (query === '') {
                state.filteredPool = COMMAND_DB;
            } else {
                state.filteredPool = COMMAND_DB.filter(cmd => {
                    const idMatch = cmd.command.toLowerCase().includes(query);
                    const keyMatch = cmd.key && cmd.key.toLowerCase().includes(query);
                    // Also search in "Pretty Name"
                    const pretty = prettifyCommand(cmd.command).toLowerCase();
                    const prettyMatch = pretty.includes(query);
                    return idMatch || keyMatch || prettyMatch;
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

    // --- CORE FUNCTIONS ---

    function loadMore() {
        if (state.visibleLimit >= state.filteredPool.length) return;
        state.visibleLimit += 50;
        renderBatch(false);
    }

    function renderBatch(reset) {
        if (reset) pool.innerHTML = '';

        const fragment = document.createDocumentFragment();
        // Calculate slice
        const currentCount = pool.children.length;
        const targetCount = Math.min(state.visibleLimit, state.filteredPool.length);

        const batch = state.filteredPool.slice(currentCount, targetCount);

        batch.forEach(cmd => {
            const el = createCommandCard(cmd);
            fragment.appendChild(el);
        });

        pool.appendChild(fragment);

        // Move sentinel to bottom
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
            state.draggedItem = cmd;
            el.style.opacity = '0.5';
        });
        el.addEventListener('dragend', () => { el.style.opacity = '1'; });

        // Double click to add
        el.addEventListener('dblclick', () => { addToTimeline(cmd); });

        return el;
    }

    function prettifyCommand(rawId) {
        // "workbench.action.chat.open" -> "Workbench: Chat Open"
        const parts = rawId.split('.');
        const capitalized = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1));

        // Remove common prefixes for noise reduction
        if (capitalized[0] === 'Workbench' && capitalized[1] === 'Action') {
            return capitalized.slice(2).join(' ');
        }
        if (capitalized[0] === 'Editor' && capitalized[1] === 'Action') {
            return "Editor: " + capitalized.slice(2).join(' ');
        }

        return capitalized.join(' ');
    }

    function generateDescription(rawId) {
        // Auto-generate a helpful description based on keywords
        if (rawId.includes('copy')) return "Copia la selección al portapapeles.";
        if (rawId.includes('paste')) return "Pega contenido del portapapeles.";
        if (rawId.includes('chat.open')) return "Abre la interfaz de chat de Antigravity.";
        if (rawId.includes('terminal')) return "Ejecuta acciones en la terminal integrada.";
        if (rawId.includes('debug')) return "Controles de depuración (Play, Stop, Step).";
        if (rawId.includes('file.new')) return "Crea un nuevo archivo vacío.";
        if (rawId.includes('moveLines')) return "Mueve las líneas seleccionadas.";
        if (rawId.includes('cursor')) return "Manipulación de cursores múltiples.";

        return "Ejecuta el comando interno: " + rawId;
    }

    function addToTimeline(cmd) {
        state.timeline.push(cmd);
        renderTimeline();
    }

    function renderTimeline() {
        timeline.innerHTML = '';
        state.timeline.forEach((cmd, index) => {
            const pretty = prettifyCommand(cmd.command);
            const block = document.createElement('div');
            block.className = 'timeline-block';
            block.draggable = true;
            // Allow reordering in future? For now just static list logic.

            block.innerHTML = `
                <div class="block-info">
                    <span class="step-num">#${index + 1}</span>
                    <strong style="color:var(--accent)">${pretty}</strong>
                    <div style="font-size:0.8rem; color:#888">${cmd.command}</div>
                </div>
                <div class="block-actions">
                    <span class="btn-del" title="Eliminar" onclick="removeFromTimeline(${index})">🗑️</span>
                </div>
            `;
            timeline.appendChild(block);
        });

        // Scroll to bottom of timeline
        timeline.scrollTop = timeline.scrollHeight;
    }

    window.removeFromTimeline = (index) => {
        state.timeline.splice(index, 1);
        renderTimeline();
    };

    function generateExtensionCode() {
        if (state.timeline.length === 0) {
            alert("¡La línea de tiempo está vacía! Añade comandos primero.");
            return;
        }

        let code = `/**\n * GENERATED BY ANTIGRAVITY GENESIS\n * Timestamp: ${new Date().toISOString()}\n */\n`;
        code += `const vscode = require('vscode');\n\n`;
        code += `async function activate(context) {\n`;
        code += `    vscode.window.showInformationMessage('🚀 Genesis Extension Running');\n\n`;
        code += `    // REGISTRO DE COMANDO MAESTRO\n`;
        code += `    let disposable = vscode.commands.registerCommand('genesis.runFlow', async () => {\n`;

        state.timeline.forEach((cmd, i) => {
            const pretty = prettifyCommand(cmd.command);
            code += `        // Step ${i + 1}: ${pretty}\n`;
            code += `        await vscode.commands.executeCommand('${cmd.command}');\n`;
            code += `        await new Promise(r => setTimeout(r, 500)); // Espera visual\n\n`;
        });

        code += `    });\n\n`;
        code += `    context.subscriptions.push(disposable);\n`;
        code += `    // Auto-Run (Opcional)\n`;
        code += `    vscode.commands.executeCommand('genesis.runFlow');\n`;
        code += `}\n\n`;
        code += `function deactivate() {}\n\n`;
        code += `module.exports = { activate, deactivate };`;

        // Trigger download
        const blob = new Blob([code], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'extension.js';
        a.click();
    }
});
