# 📁 Assixx Projektstruktur

> **Letzte Aktualisierung:** 01.06.2025  
> **Status:** 🔄 TypeScript Migration im Gange, 🐳 Docker & Backup System hinzugefügt

## 🗂️ Hauptverzeichnisstruktur

```
Assixx/
├── 📂 backend/              # Backend-Server (Node.js/Express)
├── 📂 backups/              # Datenbank-Backups (git-ignoriert)
│   ├── 📂 daily/           # Tägliche Backups
│   ├── 📂 weekly/          # Wöchentliche Backups
│   ├── 📂 monthly/         # Monatliche Backups
│   └── 📂 quick/           # Schnelle Backups
├── 📂 database/             # Datenbank-Schema & Migrationen
│   ├── 📂 migrations/      # SQL-Migrationsdateien
│   ├── 📂 schema/          # Strukturiertes Schema
│   │   ├── 📂 00-core/    # Kern-Tabellen
│   │   ├── 📂 01-features/ # Feature-Tabellen
│   │   ├── 📂 02-modules/ # Modul-Tabellen
│   │   └── 📂 03-views/   # Datenbank-Views
│   ├── 📄 complete-schema.sql    # Generiertes Komplett-Schema
│   ├── 📄 docker-init.sql        # Docker Init-Script
│   └── 📄 docker-init-simple.sql # Vereinfachtes Docker Init
├── 📂 frontend/             # Frontend (Vanilla JS + Vite)
├── 📂 infrastructure/       # Deployment & DevOps
├── 📂 tools/               # Entwicklungswerkzeuge
├── 📂 uploads/             # User-Uploads (git-ignoriert)
├── 📄 .env                 # Umgebungsvariablen (git-ignoriert)
├── 📄 .env.docker          # Docker-spezifische Env-Vars
├── 📄 .gitignore          # Git-Ignore Konfiguration
├── 📄 apply-sql-updates.sh # SQL-Updates anwenden
├── 📄 backup-database.sh   # Datenbank-Backup Script
├── 📄 cookies.txt          # Cookie-Sammlung (git-ignoriert)
├── 📄 database-setup.sql   # Haupt-Datenbankschema
├── 📄 docker-compose.dev.yml    # Docker Dev-Konfiguration
├── 📄 docker-compose.monitoring.yml # Docker Monitoring
├── 📄 docker-compose.yml   # Docker Prod-Konfiguration
├── 📄 Dockerfile          # Production Docker Image
├── 📄 Dockerfile.dev      # Development Docker Image
├── 📄 eslint.config.js     # ESLint Konfiguration
├── 📄 fix-esm-imports.js   # ESM Import Fix Script
├── 📄 jest.config.js       # Jest Test-Konfiguration
├── 📄 nodemon.json         # Nodemon Konfiguration
├── 📄 package.json         # Root NPM Konfiguration
├── 📄 quick-backup.sh      # Schnell-Backup Script
├── 📄 regenerate-schema.sh # Schema neu generieren
├── 📄 restore-database.sh  # Datenbank wiederherstellen
├── 📄 setup-backup-cron.sh # Backup-Cron einrichten
├── 📄 setup-docker-db.sh   # Docker DB Setup
├── 📄 tsconfig.json        # Root TypeScript Konfiguration
└── 📄 [Dokumentation]      # Alle .md Dateien (siehe unten)
```

## 📂 Backend-Struktur (`/backend`)

```
backend/
├── 📂 database/            # Datenbank-Migrationsdateien
│   └── 📂 migrations/     # SQL-Migrationsskripte
│       └── create_message_status_table.sql
├── 📂 logs/                # Anwendungslogs (git-ignoriert)
├── 📂 scripts/             # Utility-Skripte
│   ├── create-feature-tables.js
│   ├── generate-controllers.js
│   ├── send-bulk-email.js
│   └── 📂 setup/         # Setup-Skripte
│       ├── setup-database.js
│       ├── setup-tenant.js
│       └── setup-tenants.js
├── 📂 src/                 # Hauptquellcode
│   ├── 📂 config/         # Konfigurationsdateien
│   │   ├── featureCategories.ts
│   │   └── tenants.ts
│   ├── 📂 controllers/    # MVC Controller
│   │   ├── admin.controller.ts
│   │   ├── auth.controller.ts
│   │   ├── blackboard.controller.ts
│   │   ├── calendar.controller.ts
│   │   ├── chat.controller.ts
│   │   ├── department.controller.ts
│   │   ├── document.controller.ts
│   │   ├── employee.controller.ts
│   │   ├── feature.controller.ts
│   │   ├── kvp.controller.ts
│   │   ├── shift.controller.ts
│   │   ├── survey.controller.ts
│   │   ├── team.controller.ts
│   │   └── tenant.controller.ts
│   ├── 📂 database/       # Datenbankskripte
│   │   ├── 📂 migrations/ # Migrationsskripte
│   │   │   ├── add_blackboard_colors_tags.sql
│   │   │   ├── add_blackboard_feature.sql
│   │   │   ├── add_calendar_feature.sql
│   │   │   ├── add_kvp_feature.sql
│   │   │   ├── add_shift_planning_feature.sql
│   │   │   ├── add_survey_feature.js
│   │   │   ├── blackboard_schema.sql
│   │   │   ├── calendar_schema.sql
│   │   │   ├── create_shift_notes_table.sql
│   │   │   ├── kvp_schema.sql
│   │   │   └── survey_schema.sql
│   │   ├── admin_logs_schema.sql
│   │   ├── benutzerprofil_u_org.sql
│   │   ├── chat_schema_fixed.sql
│   │   ├── create_tenants_table.sql
│   │   ├── feature_management_schema.sql
│   │   └── tenantDb.ts
│   ├── 📂 middleware/     # Express Middleware
│   │   ├── auth.ts
│   │   ├── documentAccess.ts
│   │   ├── features.ts
│   │   ├── security-enhanced.ts
│   │   ├── tenant.ts
│   │   └── validators.ts
│   ├── 📂 models/         # Datenmodelle
│   │   ├── adminLog.ts
│   │   ├── blackboard.ts
│   │   ├── calendar.ts
│   │   ├── department.ts
│   │   ├── document.ts
│   │   ├── feature.ts
│   │   ├── kvp.ts
│   │   ├── shift.ts
│   │   ├── survey.ts
│   │   ├── team.ts
│   │   ├── tenant.ts
│   │   └── user.ts
│   ├── 📂 routes/         # API-Routen
│   │   ├── admin.ts
│   │   ├── areas.ts
│   │   ├── auth.ts
│   │   ├── auth.routes.ts
│   │   ├── blackboard.ts
│   │   ├── calendar.ts
│   │   ├── chat.ts
│   │   ├── departments.ts
│   │   ├── documents.ts
│   │   ├── employee.ts
│   │   ├── features.ts
│   │   ├── html.routes.ts
│   │   ├── index.ts
│   │   ├── kvp.ts
│   │   ├── legacy.routes.ts
│   │   ├── machines.ts
│   │   ├── root.ts
│   │   ├── shifts.ts
│   │   ├── signup.ts
│   │   ├── surveys.ts
│   │   ├── teams.ts
│   │   ├── unsubscribe.ts
│   │   ├── user.ts
│   │   └── users.ts
│   ├── 📂 services/       # Business Logic Services
│   │   ├── admin.service.ts
│   │   ├── auth.service.ts
│   │   ├── blackboard.service.ts
│   │   ├── calendar.service.ts
│   │   ├── chat.service.ts
│   │   ├── department.service.ts
│   │   ├── document.service.ts
│   │   ├── employee.service.ts
│   │   ├── feature.service.ts
│   │   ├── kvp.service.ts
│   │   ├── shift.service.ts
│   │   ├── survey.service.ts
│   │   ├── team.service.ts
│   │   ├── tenant.service.ts
│   │   └── user.service.ts
│   ├── 📂 types/          # TypeScript Type Definitionen
│   │   ├── api.d.ts
│   │   ├── auth.types.ts
│   │   ├── database.types.ts
│   │   ├── express.d.ts
│   │   ├── index.d.ts
│   │   ├── models.d.ts
│   │   ├── request.types.ts
│   │   ├── survey.types.ts
│   │   └── tenant.types.ts
│   ├── 📂 utils/          # Hilfsfunktionen
│   │   ├── 📂 scripts/    # Utility-Skripte (noch .js)
│   │   │   ├── check-root-tenant.js
│   │   │   ├── check-survey.js
│   │   │   ├── connect-mysql-interactive.js
│   │   │   ├── create-employee.js
│   │   │   ├── debug-features.js
│   │   │   ├── hash_password.js
│   │   │   └── show-tables.js
│   │   ├── constants.ts
│   │   ├── emailService.ts
│   │   ├── helpers.ts
│   │   ├── logger.ts
│   │   ├── typeHelpers.ts
│   │   └── validators.ts
│   ├── app.ts             # Express App Konfiguration
│   ├── auth.ts            # Auth Utilities
│   ├── database.ts        # Datenbankverbindung
│   ├── server.ts          # Server Entry Point
│   └── websocket.ts       # WebSocket Handler
├── 📂 templates/          # E-Mail Templates
│   └── 📂 email/
│       ├── new-document.html
│       ├── notification.html
│       └── welcome.html
└── tsconfig.json          # TypeScript Konfiguration
```

## 📂 Frontend-Struktur (`/frontend`)

```
frontend/
├── 📂 dist/               # Build-Output (git-ignoriert)
├── 📂 public/             # Statische Assets
│   └── favicon.ico
├── 📂 src/                # Quellcode
│   ├── 📂 assets/         # Medien & Schriften
│   │   ├── 📂 fonts/     # Schriftarten
│   │   ├── 📂 icons/     # Icon-Dateien
│   │   └── 📂 images/    # Bilder
│   │       ├── default-avatar.svg
│   │       ├── logo.png
│   │       └── logo.svg
│   ├── 📂 components/     # Wiederverwendbare Komponenten
│   │   ├── blackboard-widget.js
│   │   ├── 📂 modals/
│   │   ├── 📂 navigation/
│   │   └── 📂 widgets/
│   ├── 📂 pages/          # HTML-Seiten
│   │   ├── admin-config.html
│   │   ├── admin-dashboard.html
│   │   ├── archived-employees.html
│   │   ├── blackboard.html
│   │   ├── calendar.html
│   │   ├── chat.html
│   │   ├── design-standards.html
│   │   ├── document-upload.html
│   │   ├── employee-dashboard.html
│   │   ├── employee-documents.html
│   │   ├── employee-profile.html
│   │   ├── feature-management.html
│   │   ├── hilfe.html
│   │   ├── index.html
│   │   ├── kvp.html
│   │   ├── login.html
│   │   ├── manage-admins.html
│   │   ├── org-management.html
│   │   ├── profile-picture.html
│   │   ├── profile.html
│   │   ├── root-dashboard.html
│   │   ├── root-features.html
│   │   ├── root-profile.html
│   │   ├── salary-documents.html
│   │   ├── shifts.html
│   │   ├── signup.html
│   │   ├── storage-upgrade.html
│   │   ├── survey-admin.html
│   │   ├── survey-details.html
│   │   ├── survey-employee.html
│   │   └── survey-results.html
│   ├── 📂 scripts/        # JavaScript/TypeScript-Dateien
│   │   ├── 📂 components/ # Komponenten-Skripte
│   │   │   ├── dropdowns.js
│   │   │   ├── modals.js
│   │   │   ├── navigation.html
│   │   │   ├── tooltips.js
│   │   │   └── unified-navigation.ts
│   │   ├── 📂 core/      # Kernfunktionalität
│   │   │   ├── auth.js
│   │   │   ├── navigation.js
│   │   │   ├── theme.js
│   │   │   └── utils.js
│   │   ├── 📂 lib/       # Externe Bibliotheken
│   │   ├── 📂 pages/     # Seitenspezifische Skripte
│   │   │   ├── dashboard.js
│   │   │   └── landing.js
│   │   ├── 📂 services/  # Frontend-Services
│   │   │   ├── api.service.ts
│   │   │   ├── notification.service.ts
│   │   │   └── storage.service.ts
│   │   ├── 📂 utils/     # Hilfsfunktionen
│   │   │   └── alerts.ts
│   │   ├── admin-config.ts
│   │   ├── admin-dashboard.ts
│   │   ├── admin-employee-search.ts
│   │   ├── auth.ts
│   │   ├── blackboard.ts
│   │   ├── calendar.ts
│   │   ├── chat.ts
│   │   ├── common.ts
│   │   ├── confirm-once.ts
│   │   ├── dashboard-scripts.ts
│   │   ├── employee-dashboard.ts
│   │   ├── employee-deletion.ts
│   │   ├── header-user-info.ts
│   │   ├── main.js
│   │   ├── manage-admins.ts
│   │   ├── profile-picture.ts
│   │   ├── root-dashboard.ts
│   │   ├── shifts-new.ts
│   │   ├── shifts.ts
│   │   ├── show-section.ts
│   │   └── upload-document.ts
│   └── 📂 styles/         # CSS-Dateien
│       ├── 📂 base/      # Basis-Styles
│       │   └── variables.css
│       ├── 📂 lib/       # Externe CSS
│       ├── 📂 webfonts/  # Font-Dateien
│       │   ├── fa-brands-400.ttf
│       │   ├── fa-brands-400.woff2
│       │   ├── fa-regular-400.ttf
│       │   ├── fa-regular-400.woff2
│       │   ├── fa-solid-900.ttf
│       │   ├── fa-solid-900.woff2
│       │   ├── fa-v4compatibility.ttf
│       │   └── fa-v4compatibility.woff2
│       ├── blackboard.css
│       ├── calendar.css
│       ├── chat-icons.css
│       ├── dashboard-theme.css
│       ├── main.css
│       ├── profile-picture.css
│       ├── shifts.css
│       ├── style.css
│       └── user-info-update.css
│   └── 📂 types/          # TypeScript Type Definitionen
│       ├── api.types.ts
│       ├── global.d.ts
│       └── utils.types.ts
├── index.html             # Entry Point
├── eslint.config.js       # ESLint Konfiguration
├── package.json           # Frontend Dependencies
├── postcss.config.js      # PostCSS Konfiguration
├── tsconfig.json          # TypeScript Konfiguration
├── tsconfig.node.json     # TypeScript Node Konfiguration
└── vite.config.js         # Vite Build Konfiguration
```

## 📂 Infrastructure (`/infrastructure`)

```
infrastructure/
├── 📂 docker/             # Docker-Konfigurationen
│   ├── backup-strategy.md # Backup-Strategie Dokumentation
│   ├── monitoring-setup.md # Monitoring Setup Guide
│   └── test-docker-build.sh # Docker Build Test-Script
├── 📂 kubernetes/         # K8s Manifeste
├── 📂 monitoring/         # Monitoring-Konfigurationen
│   ├── 📂 grafana/       # Grafana Dashboards
│   │   └── 📂 provisioning/
│   │       ├── 📂 dashboards/
│   │       └── 📂 datasources/
│   │           └── prometheus.yml
│   ├── alertmanager.yml  # Alert Manager Konfiguration
│   ├── alerts.yml        # Prometheus Alert-Regeln
│   ├── loki-config.yml   # Loki Log-Aggregation
│   ├── prometheus.yml    # Prometheus Konfiguration
│   └── promtail-config.yml # Promtail Log-Collector
├── 📂 nginx/             # Nginx Konfigurationen
│   └── nginx.conf.example # Beispiel Nginx-Konfiguration
└── 📂 terraform/          # Infrastructure as Code
```

## 📂 Tools (`/tools`)

```
tools/
├── 📂 scripts/            # Entwicklungsskripte
└── 📂 setup/              # Setup-Automatisierung
    ├── setup-windows.ps1  # Windows PowerShell Setup
    └── setup-wsl-ubuntu.sh # WSL/Ubuntu Setup
```

## 📂 Uploads (Git-ignoriert)

```
uploads/
├── 📂 chat/               # Chat-Anhänge
├── 📂 chat-attachments/   # Alt (migration pending)
├── 📂 documents/          # Dokumenten-Uploads
├── 📂 kvp/               # KVP-Anhänge
├── 📂 kvp-attachments/   # Alt (migration pending)
├── 📂 profile-pictures/   # Profilbilder
└── 📂 profile_pictures/   # Alt (migration pending)
```

## 📄 Root-Dokumentation

| Datei                           | Beschreibung                    |
| ------------------------------- | ------------------------------- |
| 📄 AKTIONSPLAN-BETA-FIXES.md    | Beta-Phase Aktionsplan          |
| 📄 ARCHITECTURE.md              | Systemarchitektur & Tech Stack  |
| 📄 BACKUP-GUIDE.md              | Backup-System Dokumentation     |
| 📄 BEFORE-STARTING-DEV.md       | Entwicklungs-Checkliste         |
| 📄 BUGS-GEFUNDEN.md             | Dokumentierte Bugs aus Tests    |
| 📄 CLAUDE.md                    | AI-Assistenten Anweisungen      |
| 📄 CLAUDE.local.md              | Lokale AI-Anweisungen           |
| 📄 CONTRIBUTOR-AGREEMENT.md     | Beitragsvereinbarung            |
| 📄 COPYRIGHT                    | Copyright-Informationen         |
| 📄 DATABASE-SETUP-README.md     | Datenbank-Setup Guide           |
| 📄 DEPLOYMENT.md                | Production Deployment Guide     |
| 📄 DESIGN-STANDARDS.md          | UI/UX Design Standards          |
| 📄 DEVELOPMENT-GUIDE.md         | Entwicklungsrichtlinien         |
| 📄 DOCKER-BEGINNERS-GUIDE.md    | Docker Anfänger-Leitfaden       |
| 📄 DOCKER-SETUP.md              | Docker Setup & Konfiguration    |
| 📄 DOCKER-SETUP-SUMMARY.md      | Docker Setup Zusammenfassung    |
| 📄 FEATURES.md                  | Feature-Übersicht & Preise      |
| 📄 FUNKTIONSTEST.md             | Umfassender Funktionstestplan   |
| 📄 FUNKTIONSTEST-ERGEBNISSE.md  | Testergebnisse Dokumentation    |
| 📄 GIT-BRANCH-STRATEGY.md       | Git Branch-Strategie            |
| 📄 LICENSE                      | Lizenzinformationen             |
| 📄 MIGRATION-CHECKLIST.md       | TypeScript Migration Checklist  |
| 📄 MIGRATION-EXAMPLE.md         | TypeScript Migration Beispiele  |
| 📄 MIGRATION-LOG.md             | Migrationsprotokoll             |
| 📄 MIGRATION-PLAN.md            | Migrationsplan (abgeschlossen)  |
| 📄 MIGRATION-SUMMARY.md         | TypeScript Migration Zusammenf. |
| 📄 MIGRATION-TYPESCRIPT-PLAN.md | TypeScript Migrationsplan       |
| 📄 PROJEKTSTRUKTUR.md           | Diese Datei                     |
| 📄 QUESTIONS.md                 | Häufige Fragen & Antworten      |
| 📄 README.md                    | Projekt-Übersicht               |
| 📄 ROADMAP.md                   | Entwicklungsfahrplan            |
| 📄 SETUP-MACOS.md               | macOS Setup Guide               |
| 📄 SETUP-QUICKSTART.md          | Schnellstart Guide (veraltet)   |
| 📄 SETUP-UBUNTU-LINUX.md        | Ubuntu/Linux Setup Guide        |
| 📄 SETUP-WINDOWS-WSL.md         | Windows WSL Setup Guide         |
| 📄 TERMS-OF-USE.md              | Nutzungsbedingungen             |
| 📄 TODO.md                      | Aktuelle Aufgabenliste          |

## 🔄 Migration Status

### ✅ Abgeschlossene Migrationen:

- `server/` → `backend/` (28.01.2025)
- Static File Paths aktualisiert
- MVC-Architektur implementiert
- Frontend Build System eingerichtet

### 🔄 Laufende Migrationen:

- **TypeScript Migration** (30.05.2025 - in Arbeit)
  - Backend-Quellcode von `.js` zu `.ts` konvertiert
  - Scripts-Ordner bleibt vorläufig bei `.js`
  - Typdefinitionen werden schrittweise hinzugefügt

### 🚧 Ausstehende Bereinigungen:

- Upload-Verzeichnisse konsolidieren (duplicate folders)
- Frontend-Komponenten modularisieren
- Test-Coverage erweitern
- TypeScript Konfiguration vervollständigen

## 📋 Wichtige Hinweise

1. **Git-ignorierte Verzeichnisse:**

   - `node_modules/` - NPM Pakete
   - `uploads/` - User-generierte Inhalte
   - `logs/` - Anwendungslogs
   - `dist/` - Build-Outputs
   - `.env` - Umgebungsvariablen

2. **Naming Conventions:**

   - Backend-Dateien: `kebab-case.ts`
   - Frontend-Dateien: `kebab-case.js`
   - Komponenten: `PascalCase.js`
   - CSS: `kebab-case.css`
   - Routen: `plural-nouns.ts`

3. **Verzeichniszwecke:**
   - `controllers/` - Request/Response Handling
   - `services/` - Business Logic
   - `models/` - Datenstrukturen
   - `middleware/` - Request Processing
   - `utils/` - Wiederverwendbare Funktionen

---

**Zuletzt bereinigt:** 01.06.2025 - Hinzufügung von Docker Setup und Backup-System Struktur
