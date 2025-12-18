# API Manager v1.0

> **Herramienta unificada para gestión de API Keys**

## Descripción

API Manager combina las funcionalidades de `credit-checker` y `api-key-tester` en una sola herramienta con interfaz CLI.

## Características

- ✅ Verificar créditos y rate limits
- ✅ Probar todas las API keys
- ✅ Generar reportes (JSON, HTML, Markdown)
- ✅ Gestión de gray-list
- ✅ Selección inteligente de mejor key disponible

## Uso

```bash
cd tools/api-manager

# Ver estado rápido
node manager.js status

# Verificar créditos
node manager.js credits

# Probar todas las keys
node manager.js test

# Verificación completa (créditos + tests)
node manager.js full

# Listar keys configuradas
node manager.js list

# Ayuda
node manager.js help
```

## Providers Soportados

- **Groq** - Llama models
- **OpenRouter** - Multi-provider access
- **Google Gemini** - Gemini Pro/Flash
- **SambaNova** - High-speed inference

## Estructura

```
api-manager/
├── manager.js     ← Herramienta principal
├── reports/       ← Reportes generados
└── README.md      ← Este archivo
```

## Dependencias

Utiliza los módulos existentes:
- `../credit-checker/creditChecker.js`
- `../api-key-tester/tester.js`

## Configuración

Las API keys se leen de:
`core/config/api-keys.json`

---

*Parte del AntiGravity Ghost Agent ecosystem*
