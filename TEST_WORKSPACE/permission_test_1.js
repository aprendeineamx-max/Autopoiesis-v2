// TEST PERMISSION LISTENER - Archivo 1
// Este archivo debería generar un prompt de autorización
// Cuando el usuario da "Allow", el contador debería incrementar

console.log("Testing permission listener - File 1");

function testPermissionTracking() {
    return "Permission listener test active";
}

module.exports = { testPermissionTracking };
