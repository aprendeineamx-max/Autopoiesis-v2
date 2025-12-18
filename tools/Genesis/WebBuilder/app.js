// GENESIS STUDIO ENGINE v5.0 (Premium + Categories)
const state = {
    timeline: [],
    draggedItem: null,
    visibleLimit: 50,
    currentQuery: '',
    filteredPool: [],
    observer: null,
    activeCategory: 'all',
    categories: {}
};

document.addEventListener('DOMContentLoaded', () => {
    console.log("Genesis Studio v5.0 Active (Categories Edition)");

    // Elements
    const pool = document.getElementById('command-pool');
    const timeline = document.getElementById('timeline');
    const codePreview = document.getElementById('code-preview');
    const exportBtn = document.getElementById('btn-export');
    const copyBtn = document.getElementById('btn-copy');
    const clearBtn = document.getElementById('btn-clear');
    const searchInput = document.getElementById('search-box');
    const exportNameInput = document.getElementById('export-name');
    const categoryContainer = document.getElementById('category-filters');
    const saveBtn = document.getElementById('btn-save');
    const loadBtn = document.getElementById('btn-load');

    // Init
    if (typeof COMMAND_DB === 'undefined') { alert("DB Error"); return; }

    // Build categories from commands
    buildCategories();
    state.filteredPool = COMMAND_DB;
    renderCategories();
    renderBatch(true);

    // --- CATEGORY SYSTEM ---

    function buildCategories() {
        const cats = { 'all': 0 };
        COMMAND_DB.forEach(cmd => {
            const parts = cmd.command.split('.');
            const category = parts[0] || 'other';
            cats[category] = (cats[category] || 0) + 1;
            cats['all']++;
        });
        state.categories = cats;
    }

    function renderCategories() {
        if (!categoryContainer) return;

        // Sort categories by count (descending), but keep 'all' first
        const sorted = Object.entries(state.categories)
            .sort((a, b) => {
                if (a[0] === 'all') return -1;
                if (b[0] === 'all') return 1;
                return b[1] - a[1];
            });

        categoryContainer.innerHTML = sorted.map(([cat, count]) => `
            <button class="category-btn ${state.activeCategory === cat ? 'active' : ''}" 
                    data-category="${cat}">
                ${cat === 'all' ? '🌐 All' : cat}
                <span class="cat-count">${count}</span>
            </button>
        `).join('');

        // Add click handlers
        categoryContainer.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                state.activeCategory = btn.dataset.category;
                filterByCategory();
                renderCategories();
            });
        });
    }

    function filterByCategory() {
        const query = searchInput.value.toLowerCase().trim();

        if (state.activeCategory === 'all') {
            state.filteredPool = COMMAND_DB;
        } else {
            state.filteredPool = COMMAND_DB.filter(cmd =>
                cmd.command.startsWith(state.activeCategory + '.')
            );
        }

        // Apply search filter on top
        if (query) {
            state.filteredPool = state.filteredPool.filter(cmd =>
                cmd.command.toLowerCase().includes(query) ||
                (cmd.key && cmd.key.toLowerCase().includes(query))
            );
        }

        state.visibleLimit = 50;
        renderBatch(true);
    }

    // --- EVENT LISTENERS ---

    // Clear
    clearBtn.addEventListener('click', () => {
        if (confirm('¿Limpiar timeline?')) {
            state.timeline = [];
            renderTimeline();
        }
    });

    // Copy
    copyBtn.addEventListener('click', () => {
        const code = generateCodeStr();
        navigator.clipboard.writeText(code).then(() => {
            copyBtn.innerText = '✅ Copiado!';
            setTimeout(() => copyBtn.innerText = '📋 Copy Code', 2000);
        });
    });

    // Export JS
    exportBtn.addEventListener('click', () => {
        const code = generateCodeStr();
        const blob = new Blob([code], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = (exportNameInput.value || 'agent') + '.js';
        a.click();
    });

    // Save Project
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const project = {
                name: exportNameInput.value || 'Untitled',
                timeline: state.timeline,
                savedAt: new Date().toISOString()
            };
            const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = (exportNameInput.value || 'project') + '.genesis';
            a.click();
            showToast('💾 Proyecto guardado!');
        });
    }

    // Load Project
    if (loadBtn) {
        loadBtn.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.genesis,.json';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        try {
                            const project = JSON.parse(ev.target.result);
                            state.timeline = project.timeline || [];
                            exportNameInput.value = project.name || '';
                            renderTimeline();
                            showToast('📂 Proyecto cargado: ' + project.name);
                        } catch (err) {
                            alert('Error al cargar proyecto: ' + err.message);
                        }
                    };
                    reader.readAsText(file);
                }
            };
            input.click();
        });
    }

    // Search
    searchInput.addEventListener('input', (e) => {
        filterByCategory();
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

    // --- RENDERERS ---

    function renderBatch(reset) {
        if (reset) pool.innerHTML = '';
        const target = state.filteredPool.slice(0, state.visibleLimit);

        if (target.length === 0) {
            pool.innerHTML = `<div style="text-align:center; color:#888; padding:40px;">
                No commands found
            </div>`;
            return;
        }

        target.forEach(cmd => {
            const el = document.createElement('div');
            el.className = 'command-item';
            el.draggable = true;

            // Extract category for badge
            const category = cmd.command.split('.')[0];

            el.innerHTML = `
                <div class="cmd-pretty">${prettify(cmd.command)}</div>
                <div class="cmd-id">${cmd.command}</div>
                <div class="cmd-meta">
                    <span class="cmd-category">${category}</span>
                    ${cmd.key ? `<span class="cmd-key">${cmd.key}</span>` : ''}
                </div>
            `;

            el.addEventListener('dragstart', () => {
                state.draggedItem = { ...cmd, delay: 500 };
                el.style.opacity = '0.5';
            });
            el.addEventListener('dragend', () => { el.style.opacity = '1'; });
            el.addEventListener('dblclick', () => { addToTimeline({ ...cmd, delay: 500 }); });

            pool.appendChild(el);
        });

        // Infinite scroll
        if (state.visibleLimit < state.filteredPool.length) {
            const loadMore = document.createElement('div');
            loadMore.className = 'load-more';
            loadMore.innerText = `Cargar más (${state.filteredPool.length - state.visibleLimit} restantes)`;
            loadMore.onclick = () => {
                state.visibleLimit += 50;
                renderBatch(true);
            };
            pool.appendChild(loadMore);
        }
    }

    function renderTimeline() {
        timeline.innerHTML = '';
        if (state.timeline.length === 0) {
            timeline.innerHTML = `<div id="empty-msg" style="text-align:center; color:rgba(255,255,255,0.3); margin-top:100px;">
                <span style="font-size:3rem; display:block; margin-bottom:10px;">✨</span>
                Arrastra comandos aquí
            </div>`;
        }

        state.timeline.forEach((cmd, i) => {
            const block = document.createElement('div');
            block.className = 'timeline-block';
            block.innerHTML = `
                <div style="display:flex; align-items:center;">
                    <span class="step-badge">${i + 1}</span>
                    <div>
                        <div style="font-weight:bold; color:white;">${prettify(cmd.command)}</div>
                        <div style="font-size:0.75rem; color:#aaa;">${cmd.command}</div>
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:10px;">
                    <span style="font-size:0.8rem; color:#888;">Delay:</span>
                    <input type="number" class="delay-input" value="${cmd.delay}" style="width:60px; background:rgba(0,0,0,0.3); border:1px solid #444; color:white; padding:4px; text-align:center; border-radius:4px;">
                    <button class="secondary" onclick="delStep(${i})" style="padding:8px; display:flex; align-items:center; justify-content:center;">🗑️</button>
                </div>
            `;

            block.querySelector('input').addEventListener('change', (e) => {
                cmd.delay = parseInt(e.target.value) || 0;
                updatePreview();
            });

            timeline.appendChild(block);
        });

        timeline.scrollTop = timeline.scrollHeight;
        updatePreview();
    }

    window.delStep = (i) => {
        state.timeline.splice(i, 1);
        renderTimeline();
    };

    function addToTimeline(cmd) {
        state.timeline.push(cmd);
        renderTimeline();
        showToast(`✅ ${prettify(cmd.command)} añadido`);
    }

    function prettify(raw) {
        return raw.split('.').pop().replace(/([A-Z])/g, ' $1').trim().replace(/^action /, '');
    }

    function generateCodeStr() {
        if (state.timeline.length === 0) return "// Arrastra comandos para generar código...";

        const name = exportNameInput.value.replace(/[^a-zA-Z0-9]/g, '_') || 'MyExtension';
        let c = `// GENESIS AUTO-SCRIPT: ${name}\n`;
        c += `// Generated: ${new Date().toISOString()}\n`;
        c += `const vscode = require('vscode');\n\n`;
        c += `async function activate(context) {\n`;
        c += `    console.log('[${name}] Extension activated');\n\n`;
        c += `    context.subscriptions.push(\n`;
        c += `        vscode.commands.registerCommand('${name.toLowerCase()}.run', async () => {\n`;

        state.timeline.forEach((cmd, i) => {
            c += `            // Step ${i + 1}: ${prettify(cmd.command)}\n`;
            c += `            await vscode.commands.executeCommand('${cmd.command}');\n`;
            if (cmd.delay > 0) c += `            await new Promise(r => setTimeout(r, ${cmd.delay}));\n`;
            c += `\n`;
        });

        c += `            vscode.window.showInformationMessage('${name}: Completed!');\n`;
        c += `        })\n`;
        c += `    );\n`;
        c += `}\n\n`;
        c += `function deactivate() {}\n\n`;
        c += `module.exports = { activate, deactivate };\n`;
        return c;
    }

    function updatePreview() {
        codePreview.textContent = generateCodeStr();
    }

    function showToast(msg) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerText = msg;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }
});
