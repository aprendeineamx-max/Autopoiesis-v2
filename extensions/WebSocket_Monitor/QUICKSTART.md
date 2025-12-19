# 🚀 INSTALACIÓN RÁPIDA - WebSocket Monitor

## ⚡ OPCIÓN 1: Modo Desarrollo (F5) - MÁS RÁPIDO

**Este es el método que ya conoces (igual que Deep_API_Tester):**

### Paso 1: Abrir la Carpeta en Antigravity

```
1. File → Open Folder
2. Selecciona: C:\AntiGravityExt\AntiGravity_Ghost_Agent\extensions\WebSocket_Monitor
3. Presiona "Select Folder"
```

### Paso 2: Presionar F5

```
1. Con WebSocket_Monitor abierto, presiona F5
2. Se abrirá [Extension Development Host]
3. En esa ventana, usa el chat normalmente
4. Los WebSockets se capturarán automáticamente
```

### Paso 3: Ver Logs

```
En la ventana ORIGINAL (no Extension Development Host):
1. Busca el panel "Debug Console" (abajo)
2. Verás logs de WebSocket Monitor ahí
```

**✅ Ventaja:** Funciona inmediatamented  
**❌ Desventaja:** Solo captura mientras Extension Development Host está abierto

---

## 🔧 OPCIÓN 2: Instalación Permanente - RECOMENDADO

**Para que la extensión se cargue automáticamente siempre:**

### Método A: Script Automático

```
1. Ve a: C:\AntiGravityExt\AntiGravity_Ghost_Agent\extensions\WebSocket_Monitor\
2. Haz doble clic en: INSTALL.bat
3. Sigue las instrucciones en pantalla
4. Cierra y reabre Antigravity
```

### Método B: Manual

```powershell
# En PowerShell:
$source = "C:\AntiGravityExt\AntiGravity_Ghost_Agent\extensions\WebSocket_Monitor"
$target = "$env:USERPROFILE\.vscode\extensions\antigravity-research.websocket-monitor-1.0.0"

# Copiar
Copy-Item -Path $source -Destination $target -Recurse -Force

# Reiniciar Antigravity
```

---

## 🎯 Verificación

**Después de instalar, verifica:**

### Con F5 (Opción 1):
```
Debug Console (ventana original) debería mostrar:
[timestamp] 🌐 WebSocket Monitor Extension Activated
```

### Instalación Permanente (Opción 2):
```
Ctrl+Shift+P → "Output: Show Output Channels" 
→ Deberías ver "WebSocket Monitor" en la lista
```

---

## ❓ Troubleshooting

### "Extension no aparece en Output Channels"

**Causa:** La extensión no está en la carpeta correcta

**Solución:**
1. Usa OPCIÓN 1 (F5) primero para probar
2. O ejecuta INSTALL.bat para instalación permanente

### "WebSocket not available"

**Causa:** Normal - el extension host no tiene WebSocket global

**Solución:** Ignora este mensaje, capturará WebSockets del renderer cuando se usen

---

## 🆚 Comparación de Métodos

| Aspecto | F5 (Dev Mode) | Instalación Permanente |
|---------|---------------|------------------------|
| **Speed** | Inmediato | Requiere reinicio |
| **Setup** | Abrir carpeta + F5 | Script una vez |
| **Persistencia** | Solo mientras F5 activo | Siempre |
| **Logs** | Debug Console | Output Channel |
| **Updates** | Inmediatos | Requiere re-instalar |

---

## 💡 Recomendación

**Para pruebas rápidas:** Usa F5 (Opción 1)  
**Para uso permanente:** Ejecuta INSTALL.bat (Opción 2)

---

## 🚀 Comenzar AHORA

**Prueba rápida con F5:**

```
1. File → Open Folder → Selecciona WebSocket_Monitor
2. Presiona F5
3. En [Extension Development Host], envía mensaje en chat
4. Observa Debug Console en ventana original
```

**Deberías ver logs de captura inmediatamente** ✅
