# 🚀 Autopoiesis - Self-Improving AI System

**Professional Repository** | Phase 7: Dual-Core Supervisor Architecture  
**Clean Structure** ✅ | **Centralized Configuration** ✅ | **Production Ready** ✅

---

## 🎯 What is Autopoiesis?

A self-improving AI system with intelligent API management, automated testing, and professional development tools. Built for production use with clean architecture and centralized configuration.

---

## 📁 Repository Structure (Final & Clean)

```
Autopoiesis/
├── 📁 core/                          # Core system
│   └── config/
│       ├── api-keys.json             # ⭐ CENTRAL CONFIG (gitignored)
│       └── api-keys.template.json    # Setup template
│
├── 📁 tools/                         # Professional development tools
│   ├── api-key-tester/               # ⭐ Enterprise API testing
│   │   ├── tester.js
│   │   ├── reporters/ (HTML/MD/JSON)
│   │   ├── reports/ (auto-generated)
│   │   └── package.json
│   ├── credit-checker/               # API credit monitoring
│   └── gray-list-manager/            # Failed API tracking
│
├── 📁 tests/                         # Test suites
│   ├── systemValidator.js
│   ├── testFirstCycle.js
│   └── testMultiCycle.js
│
├── 📁 docs/                          # Documentation
│   ├── API_MANAGEMENT.md
│   └── ROADMAP.md
│
├── 📁 AntiGravity_Supervisor/        # Main VSCode extension
│   ├── extension.js
│   ├── src/apiManager.js (→ uses core/config)
│   ├── Portable_Installer/
│   └── package.json
│
├── 📁 AntiGravity_Internal_Hook/     # Internal hook extension
├── 📁 AntiGravity_Chat_Exporter/     # Chat export tool
├── 📁 Bots/                          # Bot scripts
├── 📁 _Archive/                      # Archived files
│
├── .gitignore
├── api-keys.BACKUP.json             # Safety backup
└── README.md                         # This file
```

---

## ⭐ Key Features

### 1. Centralized API Key Management

**Single Source of Truth**: `core/config/api-keys.json`

ALL tools read from the same file:
- ✅ Supervisor Extension
- ✅ API Key Tester (auto-updates config!)
- ✅ Credit Checker
- ✅ Gray List Manager

**Auto-Update Workflow**:
1. API Key Tester reads central config
2. Tests all providers/models
3. **Auto-saves validation results back** to config:
   - Validation status (✅❌⚠️)
   - Response times
   - Working models list
   - Last tested timestamp
4. All other tools instantly use validated keys

### 2. Professional API Key Tester

Beautiful reports • Auto-validation • Performance metrics

**Features**:
- Tests 4 providers (Groq, OpenRouter, SambaNova, Google)
- Generates HTML/Markdown/JSON reports
- Visual indicators (✅❌⚠️)
- Color-coded dashboards
- Provider comparison
- Performance benchmarking

**Usage**:
```bash
cd tools/api-key-tester
npm install
npm test
```

**Output**: `reports/` directory with beautiful HTML + Markdown

### 3. Clean Architecture

**No Duplicates** ✅  
**Logical Organization** ✅  
**Production Ready** ✅  

All files in correct locations, no confusion, easy navigation.

---

## 🚀 Quick Start

### Initial Setup

```bash
# 1. Copy template
cp core/config/api-keys.template.json core/config/api-keys.json

# 2. Edit with your keys
# Add real API keys to core/config/api-keys.json

# 3. Test keys
cd tools/api-key-tester
npm install
npm test
```

### View Reports

Reports auto-generate in `tools/api-key-tester/reports/`:
- **HTML**: `api-test-report.html` (open in browser)
- **Markdown**: `API-TEST-REPORT.md` (view in IDE)
- **JSON**: `api-test-results.json` (parse programmatically)

---

## 📊 Professional Reports

### HTML Report
- Modern gradient design (purple/blue)
- Animated hover cards
- Color-coded badges (🟢🟡🔴)
- Provider comparison tables
- Model grid with status
- Performance metrics

### Markdown Report
- Emoji status indicators
- Clean tables
- Provider breakdown
- Code-highlighted models
- IDE-optimized

---

## 🔧 Available Tools

### API Key Tester
```bash
cd tools/api-key-tester
npm test                # Full test suite
```

**Auto-generates**:
- HTML report (beautiful web view)
- Markdown report (IDE friendly)
- JSON data (machine readable)
- **Updates central config automatically**

### System Validator
```bash
cd tests
node systemValidator.js
```

### Credit Checker
```bash
cd tools/credit-checker
node creditChecker.js
```

### Gray List Manager
```bash
cd tools/gray-list-manager
node grayListManager.js
```

---

## 🔒 Security

### Protected (gitignored)
- ✅ `core/config/api-keys.json`
- ✅ `tools/api-key-tester/reports/`
- ✅ All `*-results.json` files
- ✅ `*.backup.json` files

### Best Practices
1. Never commit `api-keys.json`
2. Use `api-keys.template.json` for setup
3. Rotate keys after public testing
4. Review reports before sharing

---

## 🏗️ Architecture

### Centralized Config Schema

```json
{
  "providers": {
    "sambanova": {
      "api_key": "your_key",
      "status": "validated",        // ⭐ Auto-updated by tester
      "lastTested": "2025-12-13",   // ⭐ Auto-updated
      "workingModels": [...],        // ⭐ Auto-updated
      "avgResponseTime": 1984        // ⭐ Auto-updated
    }
  }
}
```

### Integration Flow

```
┌─────────────────────────┐
│   API Key Tester        │
│  1. Reads central files │
│  2. Tests all providers │
│  3. Updates config ⭐    │
└──────────┬──────────────┘
           │
           ▼
┌──────────────────────────┐
│ core/config/api-keys.json │ ◄─── Single source of truth
└──────────┬───────────────┘
           │
     ┌─────┴─────┐
     │           │
     ▼           ▼
┌─────────┐ ┌──────────┐
│Supervisor│ │All Tools│
│Extension│ │Use Same │
└─────────┘ └──────────┘
```

---

## 📖 Documentation

- **API Management**: [`docs/API_MANAGEMENT.md`](docs/API_MANAGEMENT.md)
- **Project Roadmap**: [`docs/ROADMAP.md`](docs/ROADMAP.md)
- **API Tester Guide**: `tools/api-key-tester/README.md` (see directory)

---

## 📈 Current Status

| Provider | Status | Success Rate | Avg Time |
|----------|--------|--------------|----------|
| SambaNova | ✅ Validated | 75% | 1984ms |
| OpenRouter | ⚠️ Partial | 64% | 906ms |
| Groq | ❌ Blocked | 0% | - |
| Google | ❌ Blocked | 0% | - |

*Run tests to update dashboard*

---

## 🎯 Benefits

### For Developers
- ✅ Clean structure (easy navigation)
- ✅ No duplicates (single source of truth)
- ✅ Auto-validation (fresh keys always)
- ✅ Beautiful reports (professional output)

### For Production
- ✅ Modular architecture (easy to extend)
- ✅ Centralized config (one place to manage)
- ✅ Automated testing (continuous validation)
- ✅ Professional quality (ready to deploy)

---

## 🚧 Recent Changes

### v2.0 - Repository Reorganization (2025-12-13)

**Major Cleanup**:
- ✅ Created professional structure (core/, tools/, tests/, docs/)
- ✅ Deleted 15+ duplicate files
- ✅ Removed old `API_Key_Tester/` directory
- ✅ Archived legacy results to `_Archive/`
- ✅ Centralized all API keys in `core/config/`

**New Features**:
- ✅ API Key Tester auto-updates central config
- ✅ Beautiful HTML/Markdown reports
- ✅ Clean, navigable structure
- ✅ Production-ready architecture

**Result**:
- No duplicates ✅
- Logical organization ✅
- All tools functional ✅
- Ready for team collaboration ✅

---

## 🤝 Contributing

This repository follows professional standards:
- Clean commit messages
- Modular architecture
- Comprehensive documentation
- Automated testing

---

## 📜 License

MIT License - Free for commercial and personal use

---

## 🌟 Highlights

**What Makes This Special**:
- 🎯 **Centralized**: One config, all tools
- 🔄 **Auto-Updating**: Keys validated automatically
- 📊 **Beautiful**: Enterprise-grade reports
- 🏗️ **Clean**: Professional structure
- 🚀 **Ready**: Production deployment

---

**Created by**: aprendeineamx-max  
**Project**: Autopoiesis - Self-Improving AI System  
**Phase**: 7 - Dual-Core Supervisor  
**Version**: 2.0 (Reorganized & Optimized)

*"Clean code, clean mind, clean architecture"* 🚀
