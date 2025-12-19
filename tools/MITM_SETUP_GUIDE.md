# 🚀 Sistema de Captura de Mensajes con mitmproxy

## ✅ INSTALACIÓN COMPLETADA

He instalado y configurado **TODO** el sistema de captura automática:

### 📦 Componentes Instalados:

1. **mitmproxy** ✅ - Proxy SSL para intercepción
2. **mitm_chat_capture.py** ✅ - Addon de captura automática
3. **START_MITM_CAPTURE.bat** ✅ - Launcher del proxy
4. **live_viewer.py** ✅ - Visualizador en tiempo real
5. **VIEW_LIVE_MESSAGES.bat** ✅ - Launcher del visualizador

---

## 🎯 PASOS PARA USAR (3 pasos simples)

### Paso 1: Iniciar Captura

**Ejecuta:**
```
C:\AntiGravityExt\AntiGravity_Ghost_Agent\tools\START_MITM_CAPTURE.bat
```

**Verás:**
```
================================================
  mitmproxy - Chat Capture System
================================================
[1/3] OK - mitmproxy instalado
[2/3] Configuracion:
   Proxy: 127.0.0.1:8080
   Web UI: http://localhost:8081
[3/3] Iniciando captura...
```

**Deja esta ventana abierta** - es tu proxy corriendo

---

### Paso 2: Instalar Certificado SSL

**Mientras mitmproxy corre:**

1. **Abre tu navegador**
2. **Ve a:** `http://mitm.it`
3. **Descarga** certificado para Windows
4. **Haz doble clic** en el certificado.cer
5. **Instalar certificado:**
   - Store Location: **Local Machine**
   - Place in: **Trusted Root Certification Authorities**
   - Clic en **Yes** para confirmar

**Solo necesitas hacer esto UNA VEZ**

---

### Paso 3: Configurar Antigravity

**En Antigravity:**

1. **Abre Settings** (File → Preferences → Settings)
2. **Busca:** `proxy`
3. **Configura:**
   ```
   HTTP Proxy: 127.0.0.1:8080
   HTTPS Proxy: 127.0.0.1:8080
   ```
4. **Reinicia Antigravity**

**Alternativa (si no hay settings de proxy):**

Configura proxy a nivel sistema:
```powershell
# En PowerShell (como Admin):
netsh winhttp set proxy 127.0.0.1:8080
```

Para desactivar después:
```powershell
netsh winhttp reset proxy
```

---

## 📊 VER MENSAJES CAPTURADOS

### Opción 1: Visualizador en Tiempo Real (RECOMENDADO)

**Ejecuta en otra ventana:**
```
C:\AntiGravityExt\AntiGravityExt\AntiGravity_Ghost_Agent\tools\VIEW_LIVE_MESSAGES.bat
```

**Verás:**
```
================================================
  📱 ANTIGRAVITY CHAT MESSAGES - LIVE VIEWER
================================================
  Tamaño: 1,234 bytes | Última actualización: 13:20:15
  Actualización automática cada 2 segundos
================================================

[1] REQUEST - 2025-12-19 13:20:10
URL: https://api.antigravity.com/chat

CONTENIDO:
Hola, ¿cómo estás?

================================================
```

### Opción 2: Web UI de mitmproxy

**Abre en navegador:**
```
http://localhost:8081
```

Verás interfaz web con TODO el tráfico capturado en tiempo real

### Opción 3: Archivo de Texto

**Abre directamente:**
```
C:\chat_captures\chat_messages_live.txt
```

Este archivo se actualiza continuamente con formato legible

---

## 📁 Archivos de Salida

| Archivo | Contenido | Formato |
|---------|-----------|---------|
| `chat_messages_live.txt` | Mensajes en formato legible | Texto plano |
| `chat_messages_raw.json` | Mensajes + metadata | JSON |

**Ubicación:**
```
C:\chat_captures\
├── chat_messages_live.txt  ← Formato humano
└── chat_messages_raw.json  ← Formato máquina
```

---

## ✅ Verificación

**Para confirmar que funciona:**

1. ✅ mitmproxy corriendo (`START_MITM_CAPTURE.bat`)
2. ✅ Certificado SSL instalado (`http://mitm.it`)
3. ✅ Proxy configurado en Antigravity (127.0.0.1:8080)
4. ✅ Antigravity reiniciado
5. ✅ Enviar mensaje de prueba en el chat
6. ✅ Ver mensaje en `chat_messages_live.txt` o visualizador

---

## 🎯 Flujo de Uso Normal

```
1. Ejecuta: START_MITM_CAPTURE.bat
   └─> Deja corriendo

2. Ejecuta: VIEW_LIVE_MESSAGES.bat (opcional)
   └─> Ver mensajes en tiempo real

3. Usa Antigravity chat normalmente
   └─> Mensajes se capturan automáticamente

4. Revisa: C:\chat_captures\chat_messages_live.txt
   └─> Todos tus mensajes en formato legible
```

---

## 🔧 Troubleshooting

### "Certificate not trusted"

**Solución:** Asegúrate de instalar el certificado en "**Trusted Root**" no en "Personal"

### "Proxy connection failed"

**Solución:**
1. Verifica que `START_MITM_CAPTURE.bat` esté corriendo
2. Confirma proxy: 127.0.0.1:8080
3. Reinicia Antigravity

### "No messages captured"

**Causas posibles:**
1. Proxy no configurado en Antigravity
2. Certificado SSL no instalado
3. Antigravity no reiniciado después de configurar proxy

**Solución:** Repite Paso 2 y Paso 3

### "mitmproxy no inicia"

**Solución:**
```powershell
pip install --upgrade mitmproxy
```

---

## 📊 Formato de Mensajes Capturados

**Archivo de texto (`chat_messages_live.txt`):**

```
================================================================================
[1] REQUEST - 2025-12-19 13:20:10
================================================================================
URL: https://api.antigravity.com/v1/chat/completions

CONTENIDO:
{"message": "Hola, ¿cómo estás?", "model": "gemini-pro"}

================================================================================

================================================================================
[2] RESPONSE - 2025-12-19 13:20:12
================================================================================
URL: https://api.antigravity.com/v1/chat/completions

CONTENIDO:
{"response": "¡Hola! Estoy bien, gracias. ¿En qué puedo ayudarte hoy?"}

================================================================================
```

---

## 🛑 Detener Captura

**Para detener:**

1. En ventana de `START_MITM_CAPTURE.bat`: **Presiona Ctrl+C**
2. En Antigravity settings: **Remover configuración de proxy**
3. **Reiniciar Antigravity**

O desactivar proxy del sistema:
```powershell
netsh winhttp reset proxy
```

---

## 🎯 Próximos Pasos

Una vez que captures mensajes:

1. **Analiza el formato** de requests/responses
2. **Identifica endpoints** de API
3. **Documentar estructura** de datos
4. **Crear parser** específico para Antigravity
5. **Integrar** con dashboard/sistema

---

## 📝 Notas Importantes

- ⚠️ **Solo usa para tu propio tráfico**
- ⚠️ **No compartas certificados**
- ⚠️ **Detén el proxy** cuando no lo uses
- ⚠️ **Revisa ToS** de Antigravity antes de usar

---

**🚀 ¡Sistema listo para capturar mensajes del chat!** 🎯
