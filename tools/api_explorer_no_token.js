/**
 * Antigravity API Explorer - SIN CSRF Token
 * Opción 1: Intentando hacer requests sin autenticación
 */

const https = require('https');
const http = require('http');

// Puerto detectado anteriormente
const PORT = 14967;

const KNOWN_APIS = {
    GET_USER_STATUS: '/exa.language_server_pb.LanguageServerService/GetUserStatus',
    COMMAND_MODEL_CONFIG: '/exa.language_server_pb.LanguageServerService/GetCommandModelConfigs'
};

const POTENTIAL_CHAT_APIS = [
    '/exa.language_server_pb.LanguageServerService/GetChatHistory',
    '/exa.language_server_pb.LanguageServerService/GetConversations',
    '/exa.language_server_pb.LanguageServerService/GetActiveChat',
    '/exa.language_server_pb.LanguageServerService/ListChats'
];

async function makeRequest(path, useHttps = true) {
    const requestBody = JSON.stringify({
        metadata: {
            ideName: 'antigravity',
            extensionName: 'antigravity',
            locale: 'en'
        }
    });

    const headers = {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
        'Connect-Protocol-Version': '1'
        // SIN X-Codeium-Csrf-Token
    };

    return new Promise((resolve, reject) => {
        const options = {
            hostname: '127.0.0.1',
            port: PORT,
            path: path,
            method: 'POST',
            headers,
            rejectUnauthorized: false,
            timeout: 5000
        };

        const client = useHttps ? https : http;
        const req = client.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    body: data
                });
            });
        });

        req.on('error', (error) => reject(error));
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Timeout'));
        });

        req.write(requestBody);
        req.end();
    });
}

async function testAPI(path) {
    console.log(`\n🧪 Probando: ${path}`);

    // Intentar HTTPS
    try {
        const response = await makeRequest(path, true);
        console.log(`  ✅ HTTPS Status: ${response.status}`);
        if (response.status === 200) {
            const preview = response.body.substring(0, 200);
            console.log(`  📄 Body: ${preview}${response.body.length > 200 ? '...' : ''}`);
            return { success: true, protocol: 'https', response };
        } else {
            console.log(`  ⚠️ Body: ${response.body}`);
        }
    } catch (httpsError) {
        console.log(`  ❌ HTTPS: ${httpsError.message}`);

        // Intentar HTTP
        try {
            const response = await makeRequest(path, false);
            console.log(`  ✅ HTTP Status: ${response.status}`);
            if (response.status === 200) {
                const preview = response.body.substring(0, 200);
                console.log(`  📄 Body: ${preview}${response.body.length > 200 ? '...' : ''}`);
                return { success: true, protocol: 'http', response };
            } else {
                console.log(`  ⚠️ Body: ${response.body}`);
            }
        } catch (httpError) {
            console.log(`  ❌ HTTP: ${httpError.message}`);
        }
    }

    return { success: false };
}

async function main() {
    console.log('='.repeat(60));
    console.log('🔓 Antigravity API Explorer - SIN CSRF Token (Opción 1)');
    console.log('='.repeat(60));
    console.log(`\n📡 Puerto: ${PORT}`);
    console.log('🔑 Auth: NINGUNA (probando sin token)\n');

    console.log('\n📊 FASE 1: APIs Conocidas');
    console.log('-'.repeat(60));

    const successfulAPIs = [];

    for (const [name, path] of Object.entries(KNOWN_APIS)) {
        console.log(`\n[${name}]`);
        const result = await testAPI(path);
        if (result.success) {
            successfulAPIs.push({ name, path, ...result });
        }
    }

    console.log('\n\n📊 FASE 2: APIs Potenciales de Chat');
    console.log('-'.repeat(60));

    for (const path of POTENTIAL_CHAT_APIS) {
        const result = await testAPI(path);
        if (result.success) {
            successfulAPIs.push({ path, ...result });
        }
    }

    console.log('\n\n' + '='.repeat(60));
    console.log('📋 RESUMEN');
    console.log('='.repeat(60));

    if (successfulAPIs.length > 0) {
        console.log(`\n🎉 APIs exitosas SIN token: ${successfulAPIs.length}`);
        successfulAPIs.forEach(api => {
            console.log(`\n  ✅ ${api.path || api.name}`);
            console.log(`     Protocolo: ${api.protocol}`);
            console.log(`  ${api.response.status === 200 ? '✓' : '?'} HTTP ${api.response.status}`);
        });

        console.log('\n\n💡 RESULTADO: Antigravity acepta requests SIN CSRF token!');
        console.log('   Esto significa que podemos acceder a las APIs directamente.');
    } else {
        console.log('\n❌ Ninguna API respondió sin token');
        console.log('   Antigravity requiere autenticación obligatoria.');
        console.log('   Proceder con Opción 2 (buscar token) u Opción 3 (proxy).');
    }

    console.log('\n✅ Prueba sin token completada');
}

main().catch(error => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
});
