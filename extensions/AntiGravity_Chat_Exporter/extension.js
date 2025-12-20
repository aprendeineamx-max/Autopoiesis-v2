// Real-Time Chat Interceptor - Captura ANTES de enviar/cifrar

const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = 'C:\\chat_captures';
const MESSAGES_FILE = path.join(OUTPUT_DIR, 'realtime_intercept.json');
const LOG_FILE = path.join(OUTPUT_DIR, 'intercept_log.txt');

let capturedMessages = [];

function log(msg) {
    const timestamp = new Date().toISOString();
    const fullMsg = `[${timestamp}] ${msg}\n`;
    console.log(msg);

    try {
        fs.appendFileSync(LOG_FILE, fullMsg);
    } catch (e) { }
}

function saveMessages() {
    try {
        const data = {
            total: capturedMessages.length,
            updated: new Date().toISOString(),
            messages: capturedMessages
        };

        fs.writeFileSync(MESSAGES_FILE, JSON.stringify(data, null, 2));
        log(`💾 Guardados ${capturedMessages.length} mensajes`);
    } catch (e) {
        log(`Error guardando: ${e.message}`);
    }
}

function activate(context) {
    log("=" * 80);
    log("🚀 Real-Time Chat Interceptor ACTIVADO");
    log("=" * 80);

    // Crear directorio si no existe
    try {
        if (!fs.existsSync(OUTPUT_DIR)) {
            fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        }
    } catch (e) { }

    // Comando para iniciar intercepción
    let startCommand = vscode.commands.registerCommand('antigravity.startIntercept', async () => {
        log("\n🎯 Iniciando intercepción en tiempo real...");

        // Obtener webview activo
        const panel = vscode.window.createWebviewPanel(
            'chatInterceptor',
            'Chat Interceptor',
            vscode.ViewColumn.Two,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        // HTML con script de intercepción
        panel.webview.html = getInterceptorHTML();

        // Recibir mensajes del webview
        panel.webview.onDidReceiveMessage(
            message => {
                if (message.type === 'chatMessage') {
                    log(`\n📨 MENSAJE CAPTURADO:`);
                    log(`   Dirección: ${message.direction}`);
                    log(`   Contenido: ${message.content.substring(0, 200)}`);

                    capturedMessages.push({
                        timestamp: new Date().toISOString(),
                        direction: message.direction,
                        content: message.content,
                        url: message.url || '',
                        method: message.method || ''
                    });

                    saveMessages();
                }
            },
            undefined,
            context.subscriptions
        );

        vscode.window.showInformationMessage('✅ Interceptor activo - Usa el chat normalmente');
    });

    // Comando para ver mensajes capturados
    let viewCommand = vscode.commands.registerCommand('antigravity.viewCaptured', async () => {
        if (fs.existsSync(MESSAGES_FILE)) {
            const doc = await vscode.workspace.openTextDocument(MESSAGES_FILE);
            await vscode.window.showTextDocument(doc);
        } else {
            vscode.window.showWarningMessage('No hay mensajes capturados aún');
        }
    });

    // Comando para limpiar
    let clearCommand = vscode.commands.registerCommand('antigravity.clearCaptured', async () => {
        capturedMessages = [];
        saveMessages();
        vscode.window.showInformationMessage('✅ Mensajes limpiados');
    });

    context.subscriptions.push(startCommand, viewCommand, clearCommand);

    // Auto-iniciar
    vscode.commands.executeCommand('antigravity.startIntercept');

    log("✅ Extensión lista");
    log("📡 Interceptando TODAS las comunicaciones...\n");
}

function getInterceptorHTML() {
    return `<!DOCTYPE html>
<html>
<head>
    <title>Chat Interceptor</title>
    <style>
        body {
            font-family: monospace;
            background: #1e1e1e;
            color: #d4d4d4;
            padding: 20px;
        }
        .message {
            border: 1px solid #444;
            padding: 10px;
            margin: 10px 0;
            border-radius: 4px;
        }
        .sent { border-left: 4px solid #4ec9b0; }
        .received { border-left: 4px solid #569cd6; }
        .status {
            position: fixed;
            top: 10px;
            right: 10px;
            padding: 10px;
            background: #2d2d2d;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="status">
        🎯 <span id="count">0</span> mensajes capturados
    </div>
    
    <h2>🔍 Interceptor en Tiempo Real</h2>
    <div id="messages"></div>
    
    <script>
        const vscode = acquireVsCodeApi();
        let messageCount = 0;
        
        // Hook fetch API
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            const [url, options] = args;
            
            console.log('🌐 Fetch interceptado:', url);
            
            // Capturar request
            if (options && options.body) {
                try {
                    let body = options.body;
                    if (typeof body === 'string') {
                        // Enviar al backend
                        vscode.postMessage({
                            type: 'chatMessage',
                            direction: 'sent',
                            content: body,
                            url: url,
                            method: options.method || 'POST'
                        });
                        
                        addMessage('sent', body, url);
                    }
                } catch (e) {
                    console.error('Error capturando request:', e);
                }
            }
            
            // Ejecutar fetch original y capturar response
            return originalFetch.apply(this, args).then(response => {
                // Clonar para no consumir
                const clonedResponse = response.clone();
                
                clonedResponse.text().then(responseText => {
                    try {
                        vscode.postMessage({
                            type: 'chatMessage',
                            direction: 'received',
                            content: responseText,
                            url: url,
                            method: 'RESPONSE'
                        });
                        
                        addMessage('received', responseText, url);
                    } catch (e) {
                        console.error('Error capturando response:', e);
                    }
                });
                
                return response;
            });
        };
        
        // Hook XMLHttpRequest
        const originalOpen = XMLHttpRequest.prototype.open;
        const originalSend = XMLHttpRequest.prototype.send;
        
        XMLHttpRequest.prototype.open = function(method, url) {
            this._url = url;
            this._method = method;
            return originalOpen.apply(this, arguments);
        };
        
        XMLHttpRequest.prototype.send = function(data) {
            if (data) {
                console.log('📡 XHR interceptado:', this._url);
                
                vscode.postMessage({
                    type: 'chatMessage',
                    direction: 'sent',
                    content: String(data),
                    url: this._url,
                    method: this._method
                });
                
                addMessage('sent', String(data), this._url);
            }
            
            // Intercept response
            this.addEventListener('load', function() {
                vscode.postMessage({
                    type: 'chatMessage',
                    direction: 'received',
                    content: this.responseText,
                    url: this._url,
                    method: 'RESPONSE'
                });
                
                addMessage('received', this.responseText, this._url);
            });
            
            return originalSend.apply(this, arguments);
        };
        
        // Hook WebSocket
        const originalWebSocket = window.WebSocket;
        window.WebSocket = function(url, protocols) {
            console.log('🔌 WebSocket interceptado:', url);
            
            const ws = new originalWebSocket(url, protocols);
            
            // Hook send
            const originalWsSend = ws.send;
            ws.send = function(data) {
                console.log('📤 WS Send:', data);
                
                vscode.postMessage({
                    type: 'chatMessage',
                    direction: 'sent',
                    content: String(data),
                    url: url,
                    method: 'WebSocket'
                });
                
                addMessage('sent', String(data), url);
                
                return originalWsSend.apply(this, arguments);
            };
            
            // Hook onmessage
            ws.addEventListener('message', function(event) {
                console.log('📥 WS Receive:', event.data);
                
                vscode.postMessage({
                    type: 'chatMessage',
                    direction: 'received',
                    content: String(event.data),
                    url: url,
                    method: 'WebSocket'
                });
                
                addMessage('received', String(event.data), url);
            });
            
            return ws;
        };
        
        function addMessage(direction, content, url) {
            messageCount++;
            document.getElementById('count').textContent = messageCount;
            
            const div = document.createElement('div');
            div.className = 'message ' + direction;
            
            const preview = content.length > 200 ? content.substring(0, 200) + '...' : content;
            
            div.innerHTML = \`
                <strong>\${direction === 'sent' ? '📤 SENT' : '📥 RECEIVED'}</strong>
                <div style="font-size: 10px; color: #888;">\${url}</div>
                <pre style="margin: 5px 0; white-space: pre-wrap;">\${escapeHtml(preview)}</pre>
            \`;
            
            document.getElementById('messages').prepend(div);
            
            // Limitar a 50 mensajes en UI
            const messages = document.querySelectorAll('.message');
            if (messages.length > 50) {
                messages[messages.length - 1].remove();
            }
        }
        
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        
        console.log('✅ Interceptor inicializado');
        console.log('🎯 Capturando fetch, XHR y WebSocket...');
    </script>
</body>
</html>`;
}

function deactivate() {
    log("\n⏹️ Interceptor desactivado");
    saveMessages();
}

module.exports = {
    activate,
    deactivate
};
