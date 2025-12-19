# 🌐 WebSocket Monitor for Antigravity

Extensión que captura **automáticamente** todo el tráfico WebSocket de Antigravity, especialmente mensajes de chat, sin necesidad de abrir DevTools manualmente.

---

## ✨ Características

- ✅ **Captura automática 24/7** - Se activa al abrir Antigravity
- ✅ **Real-time logging** - Ver mensajes en vivo en Output Channel
- ✅ **Auto-export** - Guarda datos a JSON cada 60 segundos
- ✅ **Detección de chat** - Identifica automáticamente mensajes de chat
- ✅ **Sin configuración** - Funciona inmediatamente después de instalar
- ✅ **Dashboard en vivo** - Ver estado y mensajes recientes

---

## 🚀 Instalación

### Opción 1: Copy to Extensions Folder

1. Copia la carpeta `WebSocket_Monitor` a:
   ```
   C:\AntiGravityExt\AntiGravity_Ghost_Agent\extensions\
   ```

2. Reinicia Antigravity o presiona `Ctrl+Shift+P` → "Developer: Reload Window"

3. ✅ La extensión se activa automáticamente

### Opción 2: Symlink (para desarrollo)

```powershell
cd C:\AntiGravityExt\AntiGravity_Ghost_Agent\extensions
mklink /D WebSocket_Monitor "C:\ruta\a\tu\codigo\WebSocket_Monitor"
```

---

## 📊 Uso

### Automático (Recomendado)

**La extensión se activa automáticamente** al abrir Antigravity. No necesitas hacer nada.

1. Abre Antigravity
2. Usa el chat normalmente
3. Los mensajes se capturan automáticamente
4. Revisa los archivos exportados en `websocket_captures/`

### Manual (Comandos Disponibles)

Press `Ctrl+Shift+P` y busca:

- **`WebSocket Monitor: Start Capture`** - Iniciar captura (si no está activa)
- **`WebSocket Monitor: Stop Capture`** - Detener captura
- **`WebSocket Monitor: Show Live Dashboard`** - Ver dashboard con stats
- **`WebSocket Monitor: Export to JSON`** - Exportar datos manualmente
- **`WebSocket Monitor: Show Statistics`** - Ver estadísticas
- **`WebSocket Monitor: Clear Data`** - Limpiar datos capturados

---

## 📁 Archivos Exportados

Los datos se guardan automáticamente en:
```
[Tu Workspace]/websocket_captures/ws_capture_[timestamp].json
```

### Estructura del Archivo:

```json
{
  "timestamp": "2025-12-19T12:00:00.000Z",
  "stats": {
    "total": 150,
    "sent": 75,
    "received": 75
  },
  "messages": [
    {
      "id": "1734624000000-0.123456",
      "direction": "sent",
      "timestamp": "2025-12-19T12:00:00.000Z",
      "url": "wss://example.com/chat",
      "data": "{\"message\":\"Hello\"}",
      "parsed": {
        "message": "Hello"
      },
      "size": 19
    }
  ],
  "chatMessages": [
    // Solo los mensajes identificados como chat
  ]
}
```

---

## 🔍 Cómo Funciona

### Monkey Patching de WebSocket

La extensión reemplaza el objeto global `WebSocket` con un wrapper que:

1. **Intercepta** todas las conexiones WebSocket
2. **Captura** eventos de `send` y `message`
3. **Parsea** los datos automáticamente (JSON)
4. **Detecta** mensajes de chat por keywords
5. **Exporta** todo a archivos JSON

### Detección de Mensajes de Chat

La extensión busca keywords en el JSON:
- `chat`, `message`, `content`, `text`
- `response`, `prompt`, `completion`

Si encuentra alguna, marca el mensaje como "chat message".

---

## 📊 Logs en Tiempo Real

Ver logs en vivo:

1. Presiona `Ctrl+Shift+P`
2. Busca: "Output: Show Output Channels"
3. Selecciona: "WebSocket Monitor"

Verás algo como:
```
[2025-12-19T12:00:00.000Z] 🌐 WebSocket Monitor Extension Activated
[2025-12-19T12:00:01.000Z] 🔌 New WebSocket connection: wss://api.example.com/chat
[2025-12-19T12:00:05.000Z] ⬆️ [1] Sent: {"type":"chat","message":"Hello"}
[2025-12-19T12:00:06.000Z] 💬 CHAT MESSAGE SENT!
[2025-12-19T12:00:10.000Z] ⬇️ [1] Received: {"type":"response","content":"Hi!"}
[2025-12-19T12:00:10.000Z] 💬 CHAT MESSAGE DETECTED!
```

---

## 🎯 Qué Captura

### ✅ Captura:
- Todas las conexiones WebSocket
- Mensajes enviados (outgoing)
- Mensajes recibidos (incoming)
- URL del WebSocket
- Timestamp exacto
- Data raw + parsed
- Tamaño del mensaje

### ❌ NO Captura:
- HTTP requests (solo WebSocket)
- Local storage changes
- Cookie data
- File system access

---

## 🔧 Troubleshooting

### "WebSocket not available in this context"

**Causa:** La extensión está corriendo en Extension Host, no en Renderer.

**Solución:** Esto es normal en algunos contextos. Los WebSockets de chat del renderer sí se capturarán cuando se usen.

### "No messages captured"

**Posibles causas:**
1. El chat aún no ha enviado/recibido mensajes
2. El chat no usa WebSocket (unlikely)
3. La extensión no se activó correctamente

**Solución:**
1. Envía un mensaje en el chat
2. Revisa Output Channel: "WebSocket Monitor"
3. Ejecuta comando: "WebSocket Monitor: Show Statistics"

### "Error exporting"

**Causa:** No hay workspace abierto.

**Solución:** Abre una carpeta en Antigravity (`File → Open Folder`)

---

## 🚀 Próximos Pasos

Una vez que captures datos:

1. **Revisar archivos JSON** en `websocket_captures/`
2. **Analizar formato** de mensajes de chat
3. **Identificar patrones** de request/response
4. **Implementar parser** específico si es necesario
5. **Crear relay** a dashboard externo

---

## 🛠️ Desarrollo

### Estructura de Archivos

```
WebSocket_Monitor/
├── package.json      → Configuración de extensión
├── extension.js      → Lógica principal (monkey patching)
└── README.md         → Este archivo
```

### Modificar y Testear

1. Edita `extension.js`
2. En Antigravity: `Ctrl+Shift+P` → "Developer: Reload Window"
3. Observa Output Channel para debugging

---

## ⚡ Ventajas vs DevTools Manual

| Aspecto | DevTools Manual | WebSocket Monitor |
|---------|-----------------|-------------------|
| **Setup** | Abrir cada vez | Una vez |
| **Captura** | Solo cuando está abierto | 24/7 |
| **Export** | Manual copy/paste | Automático JSON |
| **Filtrado** | Visual manual | Programático |
| **Historial** | Limitado | Ilimitado persistente |

---

## 📝 Licencia

MIT - Uso libre para investigación

---

## 🆘 Soporte

Si encuentras problemas:

1. Revisa Output Channel: "WebSocket Monitor"
2. Ejecuta: "WebSocket Monitor: Show Statistics"
3. Verifica que la extensión esté activada
4. Reinicia Antigravity

---

**🎯 Happy Monitoring!** 🚀
