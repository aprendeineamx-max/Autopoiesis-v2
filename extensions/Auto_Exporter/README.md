# Auto Exporter - Extension de Antigravity

**Versión:** 1.0.0  
**Descripción:** Exporta automáticamente conversaciones de Antigravity SIN intervención manual

---

## 🎯 Características

✅ **Completamente automático** - NO requiere presionar botones  
✅ **Polling inteligente** - Verifica actividad cada 10 segundos  
✅ **Export incremental** - Solo agrega contenido nuevo  
✅ **Debounce integrado** - Evita exports duplicados  
✅ **FileSystemWatcher** - Backups automáticos con timestamp  

---

## 🚀 Cómo Funciona

### Sistema Dual:

**1. Auto Export Extension (Polling)**
- Detecta cuando la ventana está activa
- Cada 10 segundos verifica si hay actividad
- Ejecuta `antigravity.exportChatNow` automáticamente
- Espera 3s después del último export (debounce)

**2. FileSystemWatcher (Backup)**
- Monitorea cambios en archivo exportado
- Crea backup con timestamp inmediatamente
- Ubicación: `C:\AntiGravityExt\chat_backups\`

---

## 📋 Uso

### Activación (Modo F5):

1. Abre carpeta: `C:\AntiGravityExt\AntiGravity_Ghost_Agent\extensions\Auto_Exporter`
2. Presiona **F5**
3. En Extension Development Host, la extensión se activa automáticamente
4. Verás en Output Channel "Auto Exporter":
   ```
   ✅ Auto Exporter Extension Activated
   🤖 Modo AUTOMÁTICO: Export se dispara cada 10s si hay actividad
   ✅ Polling automático iniciado (cada 10s)
   🎯 Sistema listo: Exports automáticos SIN intervención manual
   ```

### Uso Normal:

**NO NECESITAS HACER NADA** - El sistema funciona automáticamente:

1. **Chateas normalmente** en Antigravity
2. **Cada 10 segundos:**
   - Extension detecta actividad
   - Ejecuta export automático
   - FileSystemWatcher crea backup
3. **Resultado:**
   - Archivo principal actualizado
   - Backup con timestamp creado
   - TODO sin clicks manuales

---

## ⚙️ Comandos Disponibles

### Ctrl+Shift+P → Comandos:

1. **"Trigger Automatic Export"**
   - Export manual inmediato
   - Útil para forzar export

2. **"Toggle Auto Export"**
   - Activar/Desactivar polling automático
   - Por defecto: ACTIVADO

---

## 📊 Configuración

### Settings (settings.json):

```json
{
  "autoExporter.enabled": true,           // Auto-export activado
  "autoExporter.debounceTime": 3000       // Espera 3s entre exports
}
```

### Variables:

- `POLLING_INTERVAL_MS`: 10000 (10 segundos)
- `DEBOUNCE_TIME_MS`: 3000 (3 segundos)
- `EXPORT_COMMAND_ID`: "antigravity.exportChatNow"

---

## 📁 Archivos Generados

### Principales:

```
C:\AntiGravityExt\Antigravity Chat Capture Strategy.md
```
- Archivo principal exportado
- Se actualiza automáticamente
- Contenido incremental (solo agrega nuevo)

### Backups:

```
C:\AntiGravityExt\chat_backups\
├── chat_20251220_004512.md
├── chat_20251220_004522.md
└── chat_20251220_004532.md
```
- Backups con timestamp
- Uno por cada export
- Nunca se sobrescribe

---

## 🔍 Monitoreo

### Output Channel "Auto Exporter":

```
[00:45:12] 🔄 Polling: Ventana activa, triggerando export...
[00:45:12]    📤 Ejecutando: antigravity.exportChatNow
[00:45:13]    ✅ Export exitoso (automático)
```

### Intervalos de tiempo:

- Polling: cada **10 segundos**
- Debounce: **3 segundos** entre exports
- Backup: **inmediato** después de export

---

## ✅ Verificación

### Confirmar que funciona:

1. **Abre Output Channel:**
   ```
   View → Output → "Auto Exporter"
   ```

2. **Envía mensaje de prueba** en chat

3. **Espera ~10 segundos**

4. **Observa logs:**
   ```
   [timestamp] 🔄 Polling: Ventana activa, triggerando export...
   [timestamp]    📤 Ejecutando: antigravity.exportChatNow
   [timestamp]    ✅ Export exitoso (automático)
   ```

5. **Verifica archivos:**
   ```powershell
   ls C:\AntiGravityExt\chat_backups\ | Sort-Object LastWriteTime -Descending
   ```

---

## 🛠️ Troubleshooting

### Extension no activa:

**Solución:** F5 en carpeta `Auto_Exporter`

### No hay exports automáticos:

1. Verificar Output Channel "Auto Exporter"
2. Confirmar que dice "Polling automático iniciado"
3. Si no, ejecutar: `Ctrl+Shift+P` → "Toggle Auto Export" (2 veces para reiniciar)

### Exports muy frecuentes:

**Configurar debounce más alto:**
```json
{
  "autoExporter.debounceTime": 5000  // 5 segundos
}
```

---

## 🎉 Resultado Final

**Sin esta extensión:**
- ❌ Menu → Customizations → Export (manual)
- ❌ Ctrl+Shift+P → "antigravity.exportChatNow" (manual)

**Con esta extensión:**
- ✅ TODO automático cada 10s
- ✅ Backups incremental automáticos
- ✅ CERO clicks necesarios
- ✅ Solo chatear normalmente

---

## 📝 Notas Importantes

1. **Export es incremental:**
   - Antigravity sobrescribe el archivo
   - Pero mantiene TODO el contenido anterior
   - Solo agrega mensajes nuevos al final

2. **FileSystemWatcher:**
   - Independiente de la extension
   - Siempre está corriendo (script PowerShell)
   - Crea backups CADA VEZ que el archivo cambia

3. **Modo Development (F5):**
   - Requerido porque usa command ID interno
   - En producción necesitaría instalación formal
   - Pero F5 funciona perfectamente para uso personal

---

**Sistema 100% automático. Sin clicks. Sin intervención manual.** 🚀
