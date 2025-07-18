# Claude Code – Assixx Project Complete Guide

Multi-Tenant-Isolation--> tenant_id = Eine Firma-> vergesse das nicht ! Es darf nicht gemischt werden. !!!! Stetige abfrage!!!! Kritisch

## QUICK REFERENCE

- Projekt: Multi-Tenant SaaS für Industriefirmen
- GitHub: https://github.com/SCS-Technik/Assixx
- Aktueller Branch: debugging/v0.1.0--R2Stable
- Tech Stack: TypeScript, Express, MySQL, Docker, Redis, Vite
- Dev URL: http://localhost:3000
- Docker Dir: /home/scs/projects/Assixx/docker
- Package Manager: pnpm
- Datenbank: MySQL (Port 3307), Redis (Port 6379)
- Projektstruktur: docs/PROJEKTSTRUKTUR.md

## KRITISCHE REGELN

- **NIEMALS committen oder pushen ohne Erlaubnis vom User**
- **NIEMALS Fast-Forward merge durchführen**
- **IMMER existierende Dateien bearbeiten statt neue erstellen**
- **IMMER Docker aus /home/scs/projects/Assixx/docker starten**
- **IMMER langfristig denken - keine Quick-Fixes die später Probleme machen**
- **BEI UNSICHERHEIT nachfragen - besonders bei kritischen Änderungen**
- **BEHUTSAM vorgehen - lieber zweimal prüfen als einmal bereuen**
- **VERMEIDE error "Unexpected any. Specify a different type" @typescript-eslint/no-explicit-any**
- **TUE genau was ich sage und frag immer erst wenn du mehr machen sollst als verlangt**
- **Use sub-agents liberally to parallelize work and save on context — but think carefully about when it's most effective. Think step-by-step**
- **Always use best-practice methods**
- **Always make todowrite list**

## **Use MCP Tools Before Everything:**

– Before modifying files (understand history)
– When tests fail (check recent changes)
– Finding related code (git grep)
– Understanding features (follow evolution)
– Checking workflows (CI/CD issues)

## The Twelve Universal Commandments

1. **Thou shalt ALWAYS use MCP tools before coding**
2. **Thou shalt NEVER assume; always question**
3. **Thou shalt write code that's clear and obvious**
4. **Thou shalt be BRUTALLY HONEST in assessments**
5. **Thou shalt PRESERVE CONTEXT, not delete it**
6. **Thou shalt make atomic, descriptive commits**
7. **Thou shalt document the WHY, not just the WHAT**
8. **Thou shalt test before declaring done**
9. **Thou shalt handle errors explicitly**
10. **Thou shalt treat user data as sacred**
11. **Thou shalt consider performance implications early**
12. **Thou shalt embrace code reviews and pair programming**

## START-TRIGGER

### Trigger 1: "weitermachen mit Assixx" (Normal-Modus)

- **Aktion:** Vollständige Pflicht-Checkliste durchführen
- **Prozess:** Alle Starttasks, TodoWrite mit 10 Punkten, komplette Checks
- **Ziel:** Sicherstellen, dass alles korrekt läuft

### Trigger 2: "weitermachen mit Assixx und skip" (Quick-Start-Modus)

- **Aktion:** Minimale Vorbereitung für sofortige Arbeit
- **Prozess:**
  1. TODO.md lesen (nur TL;DR Section)
  2. README.md lesen (kurz)
  3. CLAUDE.md + CLAUDE.local.md (bereits automatisch geladen)
  4. Letzten Commit lesen und zusammenfassen
  5. Direkt startbereit und auf Anweisungen warten
- **Ziel:** Schneller Start für erfahrene Entwicklung

## DOCKER QUICK-CHECK

**IMMER ZUERST ausführen:**

```bash
# Working Directory ist WICHTIG!
cd /home/scs/projects/Assixx/docker

# Alles in einem Befehl:
docker-compose ps && curl -s http://localhost:3000/health | jq '.'

# ODER nutze das neue Status-Script (empfohlen):
/home/scs/projects/Assixx/scripts/dev-status.sh
```

## HÄUFIGE TASKS

### Frontend-Änderung

1. docker exec assixx-backend pnpm run build:ts
2. Browser Cache leeren (Ctrl+Shift+R)
3. Testen auf http://localhost:3000

### Backend API-Änderung

1. docker exec assixx-backend pnpm run type-check
2. docker-compose restart backend
3. Logs prüfen: docker logs -f assixx-backend

### Datenbank-Migration

1. Backup: bash scripts/quick-backup.sh "before_migration"
2. Migration kopieren: docker cp migration.sql assixx-mysql:/tmp/
3. Ausführen: docker exec assixx-mysql mysql -u assixx_user -pAssixxP@ss2025! main < /tmp/migration.sql

### TypeScript Fehler beheben

1. docker exec assixx-backend pnpm run lint:fix
2. docker exec assixx-backend pnpm run format
3. docker exec assixx-backend pnpm run type-check

## WENN-DANN ANWEISUNGEN

**WENN User fragt nach Feature-Status**

- TODO.md prüfen, dann FEATURES.md

**WENN TypeScript Error bei Route Handler**

- typed.auth oder typed.body wrapper verwenden
- Siehe backend/TYPESCRIPT-ARCHITECTURE-GUIDE.md

**WENN User will committen/pushen**

- IMMER nachfragen: "Soll ich die Änderungen committen?"
- NIE automatisch committen

**WENN Neue Datei erstellen**

- STOPP! Erst prüfen ob existierende Datei bearbeitet werden kann

**WENN Database Error**

- Foreign Key Constraints prüfen
- Siehe DATABASE-MIGRATION-GUIDE.md

**WENN Docker Container nicht startet**

- docker-compose down && docker-compose up -d
- Logs prüfen: docker-compose logs

## BEKANNTE ISSUES

- TypeScript Test-Fehler (56 errors) - ignorieren, betrifft nur Tests
- SMTP Warnings beim Start - optional, ignorieren
- Port 3000 belegt - lsof -i :3000 && kill -9 PID

## PFLICHT-CHECKLISTE (TodoWrite mit 10 Punkten)

1. Docker-Check
2. TODO.md (AKTUELLE PHASE)
3. CLAUDE.md
4. TypeScript Architecture Guide (bei Backend)
5. Design Standards
6. TypeScript Standards
7. README.md
8. Database Migration Guide
9. BEFORE-STARTING-DEV befolgen (Anleitung lesen und Befehle durchführen)!!!!
10. Entwicklung beginnen

## ZENTRALE DOKUMENTATION

**KERN-DOKUMENTE (Täglich relevant):**

- docs/PROJEKTSTRUKTUR.md - Vollständige Verzeichnisstruktur
- backend/TYPESCRIPT-ARCHITECTURE-GUIDE.md - TypeScript Patterns (PFLICHT bei Backend)
- docs/DATABASE-MIGRATION-GUIDE.md - DB Änderungen (PFLICHT bei Migrationen)
- docs/DESIGN-STANDARDS.md - Glassmorphismus UI/UX

**ARBEITS-DOKUMENTE:**

- TODO.md - Aktuelle Aufgaben und Status
- docs/BEFORE-STARTING-DEV.md - Tägliche Dev Checks
- docs/FEATURES.md - Feature-Liste mit Preisen
- docs/DATABASE-SETUP-README.md - DB Schema Referenz

**REFERENZ (Bei Bedarf):**

- docs/ARCHITECTURE.md - System-Übersicht
- docs/ROADMAP.md - Zukünftige Features
- CLAUDE.local.md - Lokale Notizen

## CODE-STANDARDS

- Kommentiere WARUM, nicht WAS
- Jede Funktion braucht JSDoc
- Komplexe Logik erklären
- TypeScript statt any verwenden
- Siehe TYPESCRIPT-STANDARDS.md für Details

## WORKFLOW

### Bei "weitermachen mit Assixx"

1. TodoWrite mit 10 Punkten erstellen (siehe PFLICHT-CHECKLISTE)
2. Alle Checks durchführen
3. Zusammenfassung erstellen

### Dokumentation aktualisieren bei

- DB-Änderungen: DATABASE-SETUP-README.md
- Neue Features: FEATURES.md
- UI-Änderungen: DESIGN-STANDARDS.md
- Struktur-Änderungen: PROJEKTSTRUKTUR.md

## MERGE-STRATEGIE FÜR MASTER BRANCH

**WICHTIG: Keine Fast-Forward Merges in master!**

Wenn ein Branch in master gemerged werden soll:

1. **IMMER mit --no-ff mergen:**

   ```bash
   git merge --no-ff <branch-name>
   ```

2. **VOR dem Merge alle Änderungen prüfen:**

   ```bash
   # Alle geänderten Dateien anzeigen
   git diff master..<branch-name> --name-status

   # Wichtige Dateien einzeln prüfen
   git diff master..<branch-name> -- CLAUDE.md
   git diff master..<branch-name> -- TODO.md
   git diff master..<branch-name> -- README.md
   ```

3. **Bei Unsicherheiten nachfragen:**
   - "Soll ich einen Merge-Commit erstellen?"
   - "Hast du die Änderungen in [Dateiname] gesehen?"

**Warum kein Fast-Forward:**

- Merge-Historie bleibt sichtbar
- Einfacheres Rollback bei Problemen
- Verhindert versehentliche Änderungen

## QUICK COMMANDS

### Docker

```bash
cd /home/scs/projects/Assixx/docker
docker-compose ps
docker-compose up -d
docker-compose down
docker-compose restart backend
docker logs -f assixx-backend
```

### TypeScript

```bash
docker exec assixx-backend pnpm run type-check
docker exec assixx-backend pnpm run lint:fix
docker exec assixx-backend pnpm run format
docker exec assixx-backend pnpm run build:ts
```

### Git

```bash
git status
git log --oneline -5
git diff --stat
git merge --no-ff branch-name
```

## GOLDENE REGELN

**DO WHAT'S ASKED** - Nicht mehr, nicht weniger
**EDIT > CREATE** - Vorhandene Dateien bearbeiten statt neue erstellen
**ASK BEFORE COMMIT** - Niemals automatisch committen/pushen
**THINK LONG-TERM** - Keine Hacks die später Probleme machen
**BE CAREFUL** - Behutsam vorgehen, besonders bei kritischen Änderungen

**NIEMALS:**

- Unnötige Dateien erstellen
- Proaktiv Dokumentation schreiben
- Mehr tun als angefragt
- Committen ohne Erlaubnis
- Fast-Forward merge (immer --no-ff)
- Redundanten Code/Dateien erstellen

**IMMER:**

- Existierende Dateien nutzen
- Bei DB-Änderungen DATABASE-SETUP-README.md und DATABASE-MIGRATION-GUIDE.md updaten
- Temporäre Dateien aufräumen
- TypeScript types verwenden (kein any)
- Im Zweifel nachfragen
- Langfristige Wartbarkeit bedenken

## Truth Hierarchy

1. **Codebase** (ultimate source of truth)
2. **Documentation** (current state)
3. **Training data** (historical reference)

## Core Philosophy

**Write code as if the person maintaining it is a violent psychopath who knows where you live. Make it that clear.**

**Remember:** Future you, debugging at 3 AM, will thank present you for that extra comment explaining the non-obvious business logic.

weitere Notes:

## 🎯 START-TRIGGER QUICK REFERENCE (13.06.2025)

- **"weitermachen mit Assixx"** → Normal-Modus mit allen Checks
- **"weitermachen mit Assixx und skip"** → Quick-Start für schnelle Fortsetzung

## Aktuelle Notizen (26.06.2025)

- **WICHTIG:** TypeScript Architecture Guide ist PFLICHTLEKTÜRE für Backend-Entwicklung
- **NEU:** backend/TYPESCRIPT-ARCHITECTURE-GUIDE.md muss IMMER beachtet werden
- TypeScript Migration abgeschlossen: 426 → 0 Errors
- Shift Planning Design wurde in FEATURES.md integriert
- Reminder für Sub-Features wurde in TODO.md aufgenommen
- **NEU:** Version 0.1.0 Strategie - Stabilität vor Features
- **NEU:** Docker ist jetzt Standard-Entwicklungsumgebung
- **NEU:** Automatisches Backup-System läuft täglich um 02:00 Uhr
- **NEU:** Multi-Tenant Isolation Bug wurde behoben
- Nach compact oder auto-compact immer deutsch sprechen
- donnt commit oder push without permission from user

## TypeScript Architecture (26.06.2025)

**PFLICHT bei Backend-Entwicklung:**

```bash
cat /home/scs/projects/Assixx/backend/TYPESCRIPT-ARCHITECTURE-GUIDE.md
``
Diese Dokumentation enthält:

- Typed Route Handlers Pattern
- Security Middleware Stacks
- Request/Response Types
- Migration Guidelines
- Common Patterns und Troubleshooting

## MySQL Password
docker exec assixx-mysql sh -c 'mysql -h localhost -u assixx_user -pAssixxP@ss2025! main -e "SHOW TABLES;"'
```

siehe DATABASE-MIGRATION-GUIDE.md

### wichtige dokumente und prüfen ob schon vorher eine doc gibt

in Assixx/docs

Für aktuelle Aufgaben siehe [TODO.md](./TODO.md)
