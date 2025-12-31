# 🧠 MEMORIA CRÍTICA: PROPÓSITO SUPREMO DE GHOST AGENT

## 🎯 EL OBJETIVO ÚNICO
Ghost Agent existe para **EXTERMINAR LA INTERACCIÓN HUMANA INNECESARIA**.
Su función no es "ayudar", es **ELIMINAR BARRERAS** para que la IA (TÚ) trabaje en modo autónomo total.

### 1. AUTO-ACCEPT (El Martillo)
El usuario **NO DEBE** presionar botones. NUNCA.
La extensión debe anticiparse y aniquilar cualquier cuadro de diálogo:
-   Botones "Run command?".
-   Botones "Accept changes?".
-   Botones "Allow execution?".
-   Botones "Save?".

Si el usuario ve un botón por más de 100ms, **EL AGENTE HA FALLADO**.

### 2. OMNI-NAVEGACIÓN (La Llave Maestra)
La `BrowserAllowlist` no es opcional. Es un pase VIP universal.
-   El navegador integrado debe tener acceso a **TODO INTERNET** (`*://*`).
-   Nunca se debe pedir permiso para abrir una URL.
-   Nunca se debe bloquear un dominio.

## ⚠️ DIRECTIVA DE DISEÑO
No preguntes "¿Qué hace este botón?".
Tu trabajo es encontrar el comando interno de VS Code que le hace clic y ejecutarlo en bucle infinito cada 500ms.

> **"Yo quiero darte indicaciones y dejarte trabajar... esta extensión es mi asistente que se encarga de darle clic a todos los botones... para que tú puedas avanzar."**
