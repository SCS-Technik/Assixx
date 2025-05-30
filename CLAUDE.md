# 📖 Assixx Project Instructions for Claude AI

## ⛔ KRITISCH: PFLICHT-REIHENFOLGE BEACHTEN!
> **WARNUNG:** Die folgenden 5 Schritte MÜSSEN in EXAKTER Reihenfolge ausgeführt werden!
> **Bei Missachtung:** Entwicklungsumgebung kann instabil sein, TypeScript-Fehler, API-Probleme!

## 🚀 START HIER - PFLICHTLEKTÜRE VOR ARBEITSBEGINN

## ⛔ STOP! PFLICHT-CHECKLISTE VOR ENTWICKLUNG

**DIESE SCHRITTE MÜSSEN IN EXAKTER REIHENFOLGE AUSGEFÜHRT WERDEN:**

- [ ] ✅ TODO.md gelesen
- [ ] ✅ CLAUDE.md gelesen  
- [ ] ✅ PROJEKTSTRUKTUR.md gelesen
- [ ] ⚠️ **BEFORE-STARTING-DEV.md AUSGEFÜHRT** (NICHT NUR GELESEN!)
- [ ] ✅ Erst DANN: Weitere Dokumente

**🚫 KEINE ENTWICKLUNG OHNE ABGESCHLOSSENE CHECKLISTE!**

### 1️⃣ TODO-LISTE (ERSTE PRIORITÄT!)

```bash
# IMMER als erste Aktion ausführen:
cat /home/scs/projects/Assixx/TODO.md
```

**Warum?**

- ✅ Zeigt alle aktuellen und erledigten Aufgaben
- 📊 Zeigt Prioritäten und aktuelle Arbeitsstände
- 🚫 Verhindert doppelte Arbeit
- 🗺️ Gibt Überblick über das gesamte Projekt

### 2️⃣ PROJEKTSTRUKTUR (ZWEITE PRIORITÄT!)

```bash
# Projektstruktur überprüfen und bei Bedarf aktualisieren:
cat /home/scs/projects/Assixx/PROJEKTSTRUKTUR.md
```

**Warum?**

- 📁 Zeigt die aktuelle Ordnerstruktur
- 🔍 Hilft beim Finden von Dateien
- ⚠️ Zeigt was fehlt oder migriert werden muss
- 📝 Muss bei Strukturänderungen aktualisiert werden

### 3️⃣ DESIGN-STANDARDS (DRITTE PRIORITÄT!)

```bash
# Design-Standards für konsistentes UI/UX:
cat /home/scs/projects/Assixx/DESIGN-STANDARDS.md
```

**Enthält:**

- 🎨 Alle Glassmorphismus-Standards
- 🎨 Farbpalette und CSS-Variablen
- 📐 UI-Komponenten Dokumentation
- 🔽 Custom Dropdown Pattern

### 4️⃣ BEFORE-STARTING-DEV (VIERTE PRIORITÄT!) ⛔ PFLICHT-AUSFÜHRUNG!

```bash
# ⚠️ NICHT NUR LESEN - ALLE CHECKS MÜSSEN AUSGEFÜHRT WERDEN!
cat /home/scs/projects/Assixx/BEFORE-STARTING-DEV.md
# DANN: Alle Befehle aus der Datei ausführen!
```

**⛔ STOP! Ohne diese Checks:**
- TypeScript Builds können fehlschlagen
- APIs könnten nicht erreichbar sein  
- Sicherheitslücken bleiben unentdeckt
- Entwicklung auf fehlerhafter Basis!

**Warum?**

- ✅ TypeScript Build & Checks
- ✅ API & System Health Tests
- ✅ Dependencies & Security Updates
- ✅ Projekt-Status Review
- ⏱️ Dauert nur 5-10 Minuten
- 🚨 Verhindert Entwicklung auf fehlerhafter Basis

**WICHTIG:** Diese Checkliste MUSS bei jedem Entwicklungsstart durchgeführt werden!

### 5️⃣ WEITERE WICHTIGE DOKUMENTE

- **Entwickler-Guidelines**: [DEVELOPMENT-GUIDE.md](./DEVELOPMENT-GUIDE.md)
- **Architektur**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Features**: [FEATURES.md](./FEATURES.md)
- **Datenbank**: [DATABASE-SETUP-README.md](./DATABASE-SETUP-README.md)
- **Setup Guides**:
  - 🪟 [Windows (WSL)](./SETUP-WINDOWS-WSL.md)
  - 🐧 [Ubuntu/Linux](./SETUP-UBUNTU-LINUX.md)
  - 🍎 [macOS](./SETUP-MACOS.md)

---

## 📝 CODE-KOMMENTIERUNG STANDARDS

### ✅ WAS MUSS KOMMENTIERT WERDEN:

#### 1. JavaScript Funktionen

```javascript
// Validiert die Subdomain-Eingabe und zeigt Fehler an
// @param {string} value - Die eingegebene Subdomain
// @returns {boolean} - True wenn gültig, false wenn ungültig
function validateSubdomain(value) {
```

#### 2. CSS Strukturen

```css
/* ========================================
   HEADER SECTION - Glassmorphismus Design
   ======================================== */
.header {
    /* Transparenter Hintergrund mit Blur für Glaseffekt */
    background: rgba(255, 255, 255, 0.02);
```

#### 3. Komplexe Logik

```javascript
// Prüft zuerst ob Passwörter übereinstimmen
// Dann sammelt alle Features die ausgewählt wurden
// Fügt Ländervorwahl zur Telefonnummer hinzu
// Sendet alles als JSON an Backend
```

#### 4. HTML Strukturen

```html
<!-- Signup Form - 3 Spalten Layout für 16-Zoll Monitore -->
<!-- Erste Zeile: Firma, Subdomain, Email -->
<div class="form-grid"></div>
```

### 📋 KOMMENTIERUNGS-CHECKLISTE:

- ✓ JEDE Funktion (Was, Parameter, Return)
- ✓ Komplexe CSS-Eigenschaften (Warum dieser Wert?)
- ✓ Wichtige HTML-Strukturen
- ✓ API-Calls und Datenverarbeitung
- ✓ Berechnungen und Algorithmen

### ❌ VERMEIDEN:

- Offensichtliche Kommentare (`// Button Klick`)
- Jede einzelne CSS-Zeile kommentieren
- Fokus auf WAS statt WARUM

---

## 🔧 WORKFLOW-ANWEISUNGEN

### 🚀 PROJEKTSTART-PROZESS

#### Wenn Simon sagt "weiter machen mit Assixx Projekt":

0. **🤖 AUTOMATISCH:** TodoWrite mit Pflicht-Checkliste erstellen!
   - TODO.md lesen
   - CLAUDE.md lesen  
   - PROJEKTSTRUKTUR.md lesen
   - BEFORE-STARTING-DEV.md AUSFÜHREN (alle Checks!)
   - Erst nach allen Checks: Mit Entwicklung beginnen

1. **📚 PFLICHTLEKTÜRE** (IMMER in dieser Reihenfolge):

   ```bash
   # WICHTIG: Diese Reihenfolge IMMER einhalten!
   cat TODO.md           # 1. Aktuelle Aufgaben (ERSTE PRIORITÄT!)
   cat CLAUDE.md         # 2. Diese Anweisungen
   cat PROJEKTSTRUKTUR.md # 3. Projekt-Struktur prüfen/aktualisieren
   cat BEFORE-STARTING-DEV.md # 4. PFLICHT-AUSFÜHRUNG der Checks!
   cat README.md         # 5. Projekt-Übersicht
   cat ROADMAP.md        # 6. Zukünftige Features
   cat DATABASE-SETUP-README.md  # 7. DB-Struktur (optional)
   ```

2. **📊 ZUSAMMENFASSUNG ERSTELLEN**:

   ```
   ✅ Erreicht: [Was wurde fertiggestellt]
   🔴 Probleme: [Aktuelle Herausforderungen]
   🔍 Prüfen: [Was muss getestet werden]
   ```

3. **✔️ DOPPELTE BESTÄTIGUNG**:

   - Frage 1: "Sind Sie sicher, dass wir anfangen sollen?"
   - Nach Ja: Konkrete Aufgabenliste zeigen
   - Frage 2: "Welche Aufgabe möchten Sie beginnen?"

4. **🔍 CHECKUP-PROTOKOLL**:

   - **VOR Arbeitsbeginn**: "Haben Sie Backups/Tests durchgeführt?"
   - **NACH Fertigstellung**: "Haben Sie die Änderungen getestet?"

5. **📝 DOKUMENTATIONS-PFLICHT**:
   - Bei DB-Änderungen → DATABASE-SETUP-README.md aktualisieren
   - Bei neuen Features → FEATURES.md ergänzen
   - Bei UI-Änderungen → DESIGN-STANDARDS.md prüfen
   - Bei Struktur-Änderungen → PROJEKTSTRUKTUR.md aktualisieren

### 📊 PROJEKT-ÜBERSICHT

| Kategorie      | Information                           |
| -------------- | ------------------------------------- |
| **Projekt**    | Multi-Tenant SaaS für Industriefirmen |
| **Tech Stack** | [ARCHITECTURE.md](./ARCHITECTURE.md)  |
| **Features**   | [FEATURES.md](./FEATURES.md)          |
| **GitHub**     | https://github.com/SCS-Technik/Assixx |
| **Lokale Dev** | http://localhost:3000                 |

### 📌 AKTUELLE SCHWERPUNKTE

1. ✅ TypeScript Backend Migration (30.05.2025 - HEUTE ABGESCHLOSSEN!)
2. ✅ Survey Tool komplett fertiggestellt (29.01.2025)
3. ✅ Security & Stabilität Phase (ERLEDIGT)
   - Cookie vulnerability gepatcht
   - CSRF-Protection modernisiert
   - Rate Limiting implementiert
   - Input Validation verstärkt

### 🚨 KRITISCHE BETA-PRIORITÄTEN (Stand: 30.05.2025)

1. **🐳 Docker Setup** (1-2 Tage) - Für einfaches Beta-Deployment
2. **🌴 Urlaubsantrag-System** (Woche 1) - DEAL-BREAKER Feature
3. **💰 Gehaltsabrechnung Upload** (Woche 1-2) - DEAL-BREAKER Feature  
4. **🔧 TPM-System** (Woche 2-3) - DEAL-BREAKER Feature
5. **📱 Mobile/PWA** (Parallel) - Kritisch für Industriearbeiter

---

## 🔗 WEITERE STANDARDS & DOKUMENTATION

- **💬 Chat System**: Siehe [DESIGN-STANDARDS.md](./DESIGN-STANDARDS.md#-chat-system-design-standards)
- **🎨 UI/UX Design**: Siehe [DESIGN-STANDARDS.md](./DESIGN-STANDARDS.md)
- **📊 Datenbank**: Siehe [DATABASE-SETUP-README.md](./DATABASE-SETUP-README.md)

---

## ⚠️ WICHTIGE REGELN FÜR CLAUDE AI

### 🎯 GOLDENE REGELN:

1. **DO WHAT'S ASKED** - Nicht mehr, nicht weniger
2. **EDIT > CREATE** - Immer vorhandene Dateien bearbeiten statt neue erstellen
3. **NO PROACTIVE DOCS** - Keine Dokumentation ohne explizite Anfrage
4. **CLEAN UP** - Test-/Debug-Dateien nach Gebrauch löschen
5. **UPDATE DB README** - Bei Datenbankänderungen immer aktualisieren

### 🚫 NIEMALS:

- Dateien erstellen, die nicht absolut notwendig sind
- Proaktiv README oder .md Dateien erstellen
- Mehr tun als explizit angefragt wurde

### ✅ IMMER:

- Existierende Dateien bevorzugen
- Nur das tun, was angefragt wurde
- Temporäre Dateien aufräumen
- DATABASE-SETUP-README.md bei DB-Änderungen aktualisieren
