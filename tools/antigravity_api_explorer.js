/**
 * Antigravity API Explorer
 * Basado en AntigravityQuotaWatcher
 * Explorará APIs internas de Antigravity buscando endpoints de chat
 */

const https = require('https');
const http = require('http');
const { execSync } = require('child_process');

// Detectar puerto y CSRF token del proceso Antigravity
function detectAntigravityProcess() {
    try {
        console.log('🔍 Detectando proceso Antigravity...');

        // Usando PowerShell como en QuotaWatcher
        const cmd = `powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"name='language_server_windows_x64.exe'\\" | Select-Object ProcessId,CommandLine | ConvertTo-Json"`;

        const output = execSync(cmd, { encoding: 'utf-8' });
        const data = JSON.parse(output.trim());

        // Si es array, tomar primero que sea Antigravity
        const processData = Array.isArray(data) ? data.find(p =>
            p.CommandLine && p.CommandLine.toLowerCase().includes('antigravity')
        ) : data;

        if (!processData) {
            throw new Error('Proceso Antigravity no encontrado');
        }

        const commandLine = processData.CommandLine;

        // Extraer puerto y token (igual que QuotaWatcher)
        const portMatch = commandLine.match(/--extension_server_port[=\\s]+(\\d+)/);
        const tokenMatch = commandLine.match(/--csrf_token[=\\s]+([a-f0-9\\-]+)/i);

        if (!tokenMatch) {
            throw new Error('CSRF token no encontrado');
        }

        // QuotaWatcher usa extension_server_port como HTTP fallback
        // El puerto HTTPS principal suele ser diferente, pero intentaremos ambos
        const extensionPort = portMatch ? parseInt(portMatch[1]) : 0;
        const csrfToken = tokenMatch[1];

        console.log(`✅ Proceso encontrado: PID ${processData.ProcessId}`);
        console.log(`📡 Puerto HTTP: ${extensionPort}`);
        console.log(`🔑 CSRF Token: ${csrfToken.substring(0, 8)}...`);

        return {
            extensionPort,
            csrfToken
        };
    } catch (error) {
        console.error('❌ Error detectando proceso:', error.message);
        return null;
    }
}

// Hacer request siguiendo exactamente el patrón de QuotaWatcher
async function makeRequest(config, port, csrfToken, useHttps = true) {
    const requestBody = JSON.stringify(config.body);

    const headers = {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
        'Connect-Protocol-Version': '1',
        'X-Codeium-Csrf-Token': csrfToken
    };

    return new Promise((resolve, reject) => {
        const options = {
            hostname: '127.0.0.1',
            port: port,
            path: config.path,
            method: 'POST',
            headers,
            rejectUnauthorized: false,
            timeout: 5000
        };

        console.log(`📤 Request: ${useHttps ? 'https' : 'http'}://127.0.0.1:${port}${config.path}`);

        const client = useHttps ? https : http;
        const req = client.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode !== 200) {
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                    return;
                }
                try {
                    resolve(JSON.parse(data));
                } catch (error) {
                    reject(new Error(`Parse error: ${error.message}`));
                }
            });
        });

        req.on('error', (error) => reject(error));
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.write(requestBody);
        req.end();
    });
}

// APIs conocidas de QuotaWatcher
const KNOWN_APIS = {
    GET_USER_STATUS: '/exa.language_server_pb.LanguageServerService/GetUserStatus',
    COMMAND_MODEL_CONFIG: '/exa.language_server_pb.LanguageServerService/GetCommandModelConfigs'
};

// Posibles endpoints de chat para probar
const POTENTIAL_CHAT_APIS = [
    '/exa.language_server_pb.LanguageServerService/GetChatHistory',
    '/exa.language_server_pb.LanguageServerService/GetConversations',
    '/exa.language_server_pb.LanguageServerService/ExportChat',
    '/exa.language_server_pb.LanguageServerService/GetActiveChat',
    '/exa.language_server_pb.LanguageServerService/GetChatMessages',
    '/exa.language_server_pb.LanguageServerService/ListConversations',
    '/exa.language_server_pb.LanguageServerService/GetUserConversations',
    '/exa.language_server_pb.LanguageServerService/ExportConversation'
];

// Body genérico (igual que QuotaWatcher)
const DEFAULT_BODY = {
    metadata: {
        ideName: 'antigravity',
        extensionName: 'antigravity',
        ideVersion: '1.0.0',
        locale: 'en'
    }
};

// Probar una API
async function testAPI(path, port, csrfToken) {
    console.log(`\\n🧪 Probando: ${path}`);

    try {
        // Intentar HTTPS primero
        try {
            const response = await makeRequest(
                { path, body: DEFAULT_BODY },
                port,
                csrfToken,
                true
            );
            console.log('✅ HTTPS OK - Respuesta:', JSON.stringify(response, null, 2));
            return { success: true, response, protocol: 'https' };
        } catch (httpsError) {
            // Si falla HTTPS, intentar HTTP
            console.log('⚠️ HTTPS falló, intentando HTTP...');
            const response = await makeRequest(
                { path, body: DEFAULT_BODY },
                port,
                csrfToken,
                false
            );
            console.log('✅ HTTP OK - Respuesta:', JSON.stringify(response, null, 2));
            return { success: true, response, protocol: 'http' };
        }
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// Main
async function main() {
    console.log('='.repeat(60));
    console.log('🚀 Antigravity API Explorer');
    console.log('='.repeat(60));
    console.log();

    // Detectar proceso
    const processInfo = detectAntigravityProcess();
    if (!processInfo) {
        console.log('\n❌ No se pudo detectar Antigravity. Asegúrate de que esté corriendo.');
        return;
    }

    const { extensionPort, csrfToken } = processInfo;

    console.log('\n📊 FASE 1: Probando APIs conocidas');
    console.log('-'.repeat(60));

    // Probar APIs conocidas
    for (const [name, path] of Object.entries(KNOWN_APIS)) {
        console.log(`\n[${name}]`);
        await testAPI(path, extensionPort, csrfToken);
    }

    console.log('\n\n📊 FASE 2: Buscando APIs de chat');
    console.log('-'.repeat(60));

    // Probar posibles APIs de chat
    const successfulAPIs = [];
    for (const path of POTENTIAL_CHAT_APIS) {
        const result = await testAPI(path, extensionPort, csrfToken);
        if (result.success) {
            successfulAPIs.push({ path, ...result });
        }
    }

    console.log('\n\n' + '='.repeat(60));
    console.log('📋 RESUMEN');
    console.log('='.repeat(60));

    if (successfulAPIs.length > 0) {
        console.log(`\n🎉 APIs exitosas encontradas: ${successfulAPIs.length}`);
        successfulAPIs.forEach(api => {
            console.log(`\n  ✅ ${api.path}`);
            console.log(`     Protocolo: ${api.protocol}`);
            console.log(`     Puerto: ${extensionPort}`);
        });
    } else {
        console.log('\\n⚠️ No se encontraron APIs de chat adicionales');
        console.log('   Las APIs de chat pueden estar en endpoints diferentes');
        console.log('   o requerir parámetros especiales.');
    }

    console.log('\\n💡 Próximos pasos:');
    console.log('   1. Inspeccionar respuestas de APIs exitosas');
    console.log('   2. Intentar con otros namespaces (exa.chat_pb, etc.)');
    console.log('   3. Analizar código fuente de Antigravity para más endpoints');

    console.log('\\n✅ Exploración completada');
}

// Ejecutar
main().catch(error => {
    console.error('\\n❌ Error fatal:', error);
    process.exit(1);
});
