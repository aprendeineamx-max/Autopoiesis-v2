const { execSync } = require('child_process');

try {
    const cmd = 'powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"name=\'language_server_windows_x64.exe\'\\" | Select-Object ProcessId,CommandLine | ConvertTo-Json"';

    const output = execSync(cmd, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
    console.log('RAW OUTPUT:');
    console.log(output);
    console.log('\\n\\n');

    const data = JSON.parse(output.trim());
    const processData = Array.isArray(data) ? data[0] : data;

    console.log('PROCESS INFO:');
    console.log('PID:', processData.ProcessId);
    console.log('\\nFULL COMMANDLINE:');
    console.log(processData.CommandLine);
    console.log('\\n\\nSEARCHING FOR PATTERNS:');

    // Buscar diferentes patterns
    const patterns = {
        'csrf_token': /--csrf[-_]token[=\\s]+([^\\s]+)/i,
        'csrf': /csrf[:\\s]+([a-f0-9\\-]+)/i,
        'token': /token[=:\\s]+([a-f0-9\\-]+)/i,
        'port': /port[=:\\s]+(\\d+)/i,
        'extension_server_port': /--extension[-_]server[-_]port[=\\s]+(\\d+)/i
    };

    for (const [name, regex] of Object.entries(patterns)) {
        const match = processData.CommandLine.match(regex);
        console.log(`  ${name}: ${match ? match[1] : 'NOT FOUND'}`);
    }

} catch (error) {
    console.error('Error:', error.message);
}
