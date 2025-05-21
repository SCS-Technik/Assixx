# Mitwirken an Assixx

Willkommen im Assixx-Entwicklungsteam! Dieses Dokument enthält alles, was du wissen musst, um effektiv zum Projekt beitragen zu können.

## Über Assixx

Assixx ist eine SaaS-Plattform für Industriefirmen, die speziell für Produktionsarbeiter ohne PC-Zugang entwickelt wurde. Die Plattform verbessert die Kommunikation zwischen Arbeitern, Administration und Management durch mobile Technologie und bietet modulare Features, die nach Bedarf aktiviert werden können.

### Hauptfunktionen

- **Dokumentenverwaltung**: Digitale Verwaltung von Lohnabrechnungen, Krankmeldungen und Bescheinigungen
- **Firmenkommunikation**: Blackboard, Kalender, Chat und Umfragen
- **Schichtplanungs-Tool**: Automatische Planerstellung, Tauschbörse und Überstundenerfassung
- **KVP-System**: Verbesserungsvorschläge mit Fotouploads und Nachverfolgung
- **Urlaubsantragsmanagement**: Digitale Beantragung und Verwaltung von Urlauben
- **TPM-Kalender**: Verwaltung von Maschinenwartungen und -inspektionen

### Business-Modell

Assixx wird als SaaS-Lösung mit drei Preisstufen angeboten:

- **Basic** (€0/Monat): Grundlegende Funktionalität für kleine Teams
- **Premium** (€49/Monat): Erweiterte Features für mittlere Unternehmen
- **Enterprise** (€149/Monat): Vollständige Funktionalität für große Industriebetriebe

Weitere Details zur Funktionalität und Roadmap findest du in den Dateien `README.md` und `ROADMAP.md`.

## Entwicklungsumgebung einrichten

### Voraussetzungen

Bevor du beginnen kannst, stelle sicher, dass du folgende Software installiert hast:

- **Node.js** (Version 16 oder höher)
- **MySQL** (oder XAMPP)
- **Git**
- **VS Code** (empfohlen, aber optional)

### Repository klonen

```bash
git clone https://github.com/SCS-Technik/Assixx.git
cd Assixx
```

### Abhängigkeiten installieren

```bash
cd server
npm install
```

### Datenbank einrichten

1. Starte MySQL und erstelle eine neue Datenbank mit dem Namen `lohnabrechnung`
2. Importiere die Datenbankstruktur:

```bash
mysql -u root -p lohnabrechnung < server/database/schema.sql
```

oder nutze phpMyAdmin, wenn du XAMPP verwendest.

### Umgebungsvariablen konfigurieren

Erstelle eine `.env`-Datei im `server`-Verzeichnis:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=dein_passwort
DB_NAME=lohnabrechnung
JWT_SECRET=ein_sicherer_zufälliger_string
```

### Root-Benutzer erstellen

```bash
cd server
node scripts/create-root-user.js
```

### Server starten

```bash
cd server
npm run dev
```

Die Anwendung ist jetzt unter `http://localhost:3000` erreichbar.

## Git-Workflow

Wir verwenden einen Feature-Branch-Workflow:

### Branches

- **master**: Produktionsbereit, immer stabil
- **develop**: Integrationszweig für fertige Features
- **feature/[name]**: Für die Entwicklung einzelner Features (z.B. feature/blackboard)
- **hotfix/[name]**: Für dringende Fehlerbehebungen in der Produktion

### Workflow

1. Stelle sicher, dass dein `develop`-Branch aktuell ist:
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. Erstelle einen neuen Feature-Branch:
   ```bash
   git checkout -b feature/mein-feature
   ```

3. Arbeite an deinem Feature und commitee regelmäßig:
   ```bash
   git add .
   git commit -m "Feature: Beschreibung der Änderung"
   ```

4. Halte deinen Branch aktuell:
   ```bash
   git pull --rebase origin develop
   ```

5. Pushe deinen Branch ins Repository:
   ```bash
   git push origin feature/mein-feature
   ```

6. Erstelle einen Pull Request von deinem Feature-Branch in den `develop`-Branch.

### Commit-Nachrichten

Verwende aussagekräftige Commit-Nachrichten im folgenden Format:

```
[Typ]: [Kurze Beschreibung]

[Detaillierte Beschreibung (optional)]
```

Typen:
- **Feature**: Neue Funktionalität
- **Fix**: Fehlerbehebung
- **Docs**: Dokumentationsänderungen
- **Style**: Formatierungsänderungen (keine Codeänderungen)
- **Refactor**: Code-Refactoring
- **Test**: Tests hinzufügen oder ändern
- **Chore**: Änderungen an Build-Prozessen oder Tools

## Code-Richtlinien

### JavaScript / Node.js

- Verwende ES6+ Features
- Formatiere deinen Code mit Prettier
- Verwende ESLint mit unserer Projektkonfiguration
- Schreibe asynchronen Code mit async/await statt mit Callbacks

### Frontend

- Verwende semantisches HTML
- Folge dem Mobile-First-Ansatz
- Schreibe SCSS nach der BEM-Methodologie
- Nutze selbsterklärende Klassennamen

### Testen

- Schreibe Unit-Tests für alle neuen Features
- Führe Tests vor jedem Pull Request aus
- Halte die Testabdeckung über 80%

## Aktuelle Prioritäten

Diese Features werden derzeit mit höchster Priorität entwickelt:

1. **Blackboard-System** (Branch: feature/blackboard)
2. **Firmenkalender** (Branch: feature/calendar)
3. **Chat-Funktion** (Branch: feature/chat)
4. **Schichtplanungs-Tool** (Branch: feature/shift-planning)

## Projektstruktur

```
server/
├── models/         # Datenmodelle
├── routes/         # API-Routen
├── middleware/     # Express-Middleware
├── utils/          # Hilfsfunktionen
├── public/         # Statische Dateien
│   ├── css/        # Stylesheets
│   ├── js/         # Client-seitiges JavaScript
│   └── img/        # Bilder
├── templates/      # E-Mail-Templates etc.
├── scripts/        # Hilfsskripte
└── server.js       # Hauptanwendung
```

## Organisationsstruktur in der Anwendung

- **Team**: Eine Gruppe von Mitarbeitern, die an denselben Maschinen arbeiten und einem Teamleiter zugeordnet sind
- **Abteilung**: Alle Mitarbeiter, die einem Abteilungsleiter oder Bereichsleiter zugeordnet sind
- **Firma**: Die Gesamtheit aller Abteilungen und Teams

Bei der Implementierung neuer Features muss diese Organisationsstruktur berücksichtigt werden.

## Hilfe bekommen

- **Dokumentation**: Siehe den `docs/`-Ordner
- **Issues**: Überprüfe bestehende Issues auf GitHub
- **Kontakt**: Wende dich bei Fragen an Simon Öztürk (info@scs-technik.de)

## Lizenz und Urheberrecht

Dieses Projekt ist proprietär und vertraulich. Jede unautorisierte Nutzung, Vervielfältigung, Modifikation, Verteilung oder Anzeige dieses Quellcodes, ganz oder teilweise, ist strengstens untersagt.

© 2024-2025 Simon Öztürk / SCS-Technik. Alle Rechte vorbehalten.