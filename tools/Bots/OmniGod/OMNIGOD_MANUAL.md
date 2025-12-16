# 👁️ Manual Técnico: OmniGod v3.5 "Visual Protector"

Este documento detalla la configuración exacta, lógica de comportamiento y estructura de archivos del agente visual **OmniGod**.

---

## 📋 Resumen Ejecutivo
**OmniGod** es un bot de visión computarizada (AutoHotkey v2) diseñado para automatizar la interacción con interfaces de chat (AntiGravity/VS Code). Su objetivo es mantener el flujo de trabajo continuo, aceptando cambios y confirmando acciones automáticamente, mientras respeta la intervención del usuario.

*   **Estado Inicial**: ACTIVO (Ojo Verde) al iniciar.
*   **Frecuencia de Escaneo**: 500ms (2 veces por segundo).
*   **Tecla Maestra**: `F8` (Pausa / Reanuda).

---

## 🧠 Lógica de Decisiones (The WatchDog)
El cerebro del bot revisa la pantalla en cada ciclo y decide en qué **Fase** entrar. Las fases tienen jerarquía estricta:

### 🥇 Fase 1: COMBATE (Trabajo Activo)
*   **Disparador**: Detección del **Cuadrado Rojo** (`Indicators\working.png`).
*   **Acción**: 
    1.  **Target Lock**: Identifica la ventana exacta del chat.
    2.  **Auto-Confirm**: Envía `Alt + Enter` continuamente.
    3.  **Enfoque**: Fuerza `WinActivate` para asegurar que las teclas no vayan a otra ventana.
*   **Prioridad**: Absoluta. Ignora seguridad y otros botones.

### 🥈 Fase 2: MUERTE SÚBITA (Transición Crítica)
*   **Disparador**: Justo cuando desaparece el Cuadrado Rojo (`WasWorking: True` -> `False`).
*   **Duración**: 10 Segundos (Ventana de oportunidad).
*   **Acción**: 
    *   Escanea **TODOS** los archivos en la carpeta `Targets\`.
    *   **Multi-Kill**: Si oprime un botón (ej. `Allow Once`), sigue buscando inmediatamente otro (ej. `Setup`). No se detiene hasta que pasen los 10 segundos.
*   **Objetivo**: Cazar ventanas emergentes que aparecen justo al terminar la generación.

### 🥉 Fase 3: SEGURIDAD (Usuario al Mando)
*   **Disparador**: Detección del **Botón Enviar/Flecha Azul** (`Indicators\send.png`).
*   **Acción**: **PAUSA TOTAL**.
*   **Razón**: Si el botón "Enviar" es visible, significa que el usuario está escribiendo o el chat espera input manual. El bot se retira para no interferir con el teclado/mouse.

### 🏅 Fase 4: CAZA PASIVA (Idle)
*   **Disparador**: Ninguno de los anteriores.
*   **Acción**: Escanea bucles pasivos buscando cualquier objetivo en `Targets\` que aparezca "fuera de contexto" (sin cuadrado rojo).
*   **Nota**: El "Auto-Scroll" está desactivado actualmente en favor del "Auto-Enter" de la Fase 1.

---

## 📂 Estructura de Archivos y Objetivos

### 1. `OmniBot\Targets\` (La lista de Caza)
El bot atacará **cualquier imagen .png** que coloques en esta carpeta.
*   **Comportamiento**: Clic Central + Rebote (Click Down/Up rápido y regreso del mouse).
*   **Objetivos Actuales**:
    *   `AcceptAll_Priority.png`
    *   `Cuadrito Azul - Allow Once.PNG`
    *   `Cuadrito Azul - SETUP.PNG`
    *   `Expand all.PNG`
    *   *(Y cualquier otro archivo presente)*

### 2. `OmniBot\Indicators\` (Señales de Tráfico)
Imágenes que dictan el comportamiento del bot, NO son cliqueables.
*   **working.png**: El "Cuadrado Rojo". Indica Fase 1.
*   **send.png**: La "Flecha Azul". Indica Fase 3.

### 3. `OmniBot\Indicators\Ignore\` (Lista Blanca)
Imágenes que, si están cerca de un objetivo, cancelan el ataque para evitar falsos positivos (ej. botones similares en la interfaz del IDE que no queremos tocar).

---

## ⚙️ Parámetros Técnicos
*   **Tolerancia de Color**: `*50` (Estándar), `*100` (Alta prioridad en Muerte Súbita).
*   **Velocidad de Mouse**: Instantánea (`SetMouseDelay -1`).
*   **Sonidos**:
    *   `*64` (Ding): Encendido / Activado.
    *   `*16` (Bonk): Apagado / Pausado.

---

_Generado automáticamente por AntiGravity System - 2025_
