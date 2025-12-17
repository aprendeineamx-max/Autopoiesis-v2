// GENESIS STUDIO ENGINE v4.0 (Premium)
const state = {
    timeline: [],
    draggedItem: null,
    visibleLimit: 50,
    currentQuery: '',
    filteredPool: [],
    observer: null
};

document.addEventListener('DOMContentLoaded', () => {
    console.log("Genesis Studio v4.0 Active");

    // Elements
    const pool = document.getElementById('command-pool');
    const timeline = document.getElementById('timeline');
    const codePreview = document.getElementById('code-preview');
    const exportBtn = document.getElementById('btn-export');
    const copyBtn = document.getElementById('btn-copy');
    const clearBtn = document.getElementById('btn-clear');
    const searchInput = document.getElementById('search-box');
    const exportNameInput = document.getElementById('export-name');

    // Init
    if (typeof COMMAND_DB === 'undefined') { alert("DB Error"); return; }
    state.filteredPool = COMMAND_DB;
    renderBatch(true);

    // --- EVENT LISTENERS ---

    // Clear
    clearBtn.addEventListener('click', () => {
        if (confirm('Clear timeline?')) {
            state.timeline = [];
            renderTimeline();
        }
    });

    // Copy
    copyBtn.addEventListener('click', () => {
        const code = generateCodeStr();
        navigator.clipboard.writeText(code).then(() => {
            copyBtn.innerText = '✅ Copied!';
            setTimeout(() => copyBtn.innerText = '📋 Copy Code', 2000);
        });
    });

    // Export
    exportBtn.addEventListener('click', () => {
        const code = generateCodeStr();
        const blob = new Blob([code], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = (exportNameInput.value || 'agent') + '.js';
        a.click();
    });

    // Search
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        state.filteredPool = COMMAND_DB.filter(cmd =>
            cmd.command.toLowerCase().includes(query) ||
            (cmd.key && cmd.key.toLowerCase().includes(query))
        );
        state.visibleLimit = 50;
        renderBatch(true);
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

        target.forEach(cmd => {
            const el = document.createElement('div');
            el.className = 'command-item';
            el.draggable = true;
            el.innerHTML = `
                <div class="cmd-pretty">${prettify(cmd.command)}</div>
                <div class="cmd-id">${cmd.command}</div>
                ${cmd.key ? `<span style="font-size:0.7rem; background:rgba(255,255,255,0.1); padding:2px 6px; border-radius:4px;">${cmd.key}</span>` : ''}
            `;

            el.addEventListener('dragstart', () => {
                state.draggedItem = { ...cmd, delay: 500 };
                el.style.opacity = '0.5';
            });
            el.addEventListener('dragend', () => { el.style.opacity = '1'; });
            el.addEventListener('dblclick', () => { addToTimeline({ ...cmd, delay: 500 }); });

            pool.appendChild(el);
        });
    }

    function renderTimeline() {
        timeline.innerHTML = '';
        if (state.timeline.length === 0) {
            timeline.innerHTML = `<div id="empty-msg" style="text-align:center; color:rgba(255,255,255,0.3); margin-top:100px;">
                <span style="font-size:3rem; display:block; margin-bottom:10px;">✨</span>
                Drag commands here
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
    }

    function prettify(raw) {
        return raw.split('.').pop().replace(/([A-Z])/g, ' $1').trim().replace(/^action /, '');
    }

    function generateCodeStr() {
        if (state.timeline.length === 0) return "// Drag commands to generate code...";

        const name = exportNameInput.value.replace(/[^a-zA-Z0-9]/g, '_');
        let c = `// GENESIS AUTO-SCRIPT: ${name}\n`;
        c += `const vscode = require('vscode');\n\n`;
        c += `async function activate(context) {\n`;
        c += `    vscode.commands.registerCommand('${name}.run', async () => {\n`;

        state.timeline.forEach(cmd => {
            c += `        // ${prettify(cmd.command)}\n`;
            c += `        await vscode.commands.executeCommand('${cmd.command}');\n`;
            if (cmd.delay > 0) c += `        await new Promise(r => setTimeout(r, ${cmd.delay}));\n`;
        });

        c += `    });\n}\nmodule.exports = { activate };`;
        return c;
    }

    function updatePreview() {
        codePreview.textContent = generateCodeStr();
    }
});
