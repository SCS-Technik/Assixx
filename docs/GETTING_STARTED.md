# Erste Schritte mit Assixx

Dieses Dokument hilft dir beim schnellen Einstieg in die Entwicklung von Assixx. Wir führen dich durch das Setup deiner Entwicklungsumgebung und zeigen dir, wie du mit der Entwicklung beginnen kannst.

## Inhaltsverzeichnis

1. [Voraussetzungen](#voraussetzungen)
2. [Entwicklungsumgebung einrichten](#entwicklungsumgebung-einrichten)
3. [Projektstruktur](#projektstruktur)
4. [Erste Änderungen vornehmen](#erste-änderungen-vornehmen)
5. [Die wichtigsten Features](#die-wichtigsten-features)
6. [Häufig gestellte Fragen](#häufig-gestellte-fragen)

## Voraussetzungen

Bevor du beginnen kannst, stelle sicher, dass du folgende Software installiert hast:

- **Node.js** (Version 16 oder höher)
- **MySQL** (Version 5.7 oder höher) oder **XAMPP** (für Windows-Nutzer)
- **Git**

## Entwicklungsumgebung einrichten

### 1. Repository klonen

```bash
git clone https://github.com/SCS-Technik/Assixx.git
cd Assixx
```

### 2. Branch-Struktur verstehen

```bash
git branch
```

- **master**: Produktiv-Branch, immer stabil
- **develop**: Entwicklungs-Branch für Integration
- **feature/xxx**: Feature-Branches für aktive Entwicklung

Wechsle zum Entwicklungs-Branch:

```bash
git checkout develop
```

### 3. Abhängigkeiten installieren

```bash
cd server
npm install
```

### 4. Datenbank einrichten

#### Mit XAMPP (Windows)

1. Starte XAMPP Control Panel und aktiviere MySQL
2. Öffne phpMyAdmin (http://localhost/phpmyadmin)
3. Erstelle eine neue Datenbank namens `lohnabrechnung`
4. Importiere die Datenbankstruktur:
   - Öffne die Datenbank
   - Klicke auf "Importieren"
   - Wähle die Datei `server/database/schema.sql`
   - Klicke auf "OK"

#### Mit MySQL (Linux/Mac)

```bash
mysql -u root -p
CREATE DATABASE lohnabrechnung;
exit
mysql -u root -p lohnabrechnung < server/database/schema.sql
```

### 5. Umgebungsvariablen konfigurieren

Erstelle eine `.env`-Datei im `server`-Verzeichnis:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=dein_passwort
DB_NAME=lohnabrechnung
JWT_SECRET=ein_sicherer_zufälliger_string
```

### 6. Root-Benutzer erstellen

```bash
cd server
node scripts/create-root-user.js
```

Falls dieses Skript nicht existiert, führe folgenden SQL-Befehl in deiner Datenbank aus:

```sql
INSERT INTO users (username, email, password, role) 
VALUES ('root', 'root@example.com', '$2b$10$KbHQjW.ORFZvQmrR15T9.Op08o9SwAKUedMzpVhWsM3V5MNd9Dj/y', 'root');
```

Das Standardpasswort ist `root`.

### 7. Server starten

```bash
cd server
npm run dev
```

Die Anwendung ist jetzt unter http://localhost:3000 erreichbar:
- Benutzername: root
- Passwort: root

## Projektstruktur

Das Assixx-Projekt ist wie folgt strukturiert:

```
Assixx/
├── docs/                 # Projektdokumentation
├── server/               # Backend-Code
│   ├── database/         # Datenbank-Skripte und Schemas
│   ├── middleware/       # Express-Middleware
│   ├── models/           # Datenmodelle
│   ├── public/           # Öffentliche Dateien (Frontend)
│   │   ├── css/          # Stylesheets
│   │   ├── js/           # Client-seitiges JavaScript
│   │   └── img/          # Bilder und Icons
│   ├── routes/           # API-Routen
│   ├── scripts/          # Hilfsskripte
│   ├── templates/        # E-Mail-Templates etc.
│   ├── utils/            # Hilfsfunktionen
│   ├── .env.example      # Beispiel für Umgebungsvariablen
│   ├── package.json      # NPM-Abhängigkeiten
│   └── server.js         # Hauptanwendung
├── .gitignore            # Git-Ignore-Konfiguration
├── CLAUDE.md             # Projektnotizen (privat)
├── README.md             # Projektübersicht
└── ROADMAP.md            # Entwicklungs-Roadmap
```

### Wichtige Dateien und Module

- **server.js**: Startpunkt der Anwendung
- **middleware/auth.js**: Authentifizierungssystem
- **middleware/features.js**: Feature-Management
- **middleware/tenant.js**: Multi-Tenant-Funktionalität
- **routes/**: API-Endpunkte für verschiedene Module
- **models/**: Datenbankmodelle und Geschäftslogik

## Erste Änderungen vornehmen

### 1. Richtigen Feature-Branch auswählen

Wähle den Feature-Branch, an dem du arbeiten möchtest:

```bash
git checkout feature/blackboard   # Für das Blackboard-System
git checkout feature/calendar     # Für den Firmenkalender
git checkout feature/chat         # Für die Chat-Funktion
git checkout feature/shift-planning # Für das Schichtplanungs-Tool
```

### 2. Änderungen implementieren

Implementiere deine Funktionen gemäß der Feature-Beschreibung in der ROADMAP.md.

### 3. Änderungen testen

Teste deine Änderungen lokal:

```bash
npm test               # Führt Tests aus, falls vorhanden
npm run dev            # Startet den Entwicklungsserver
```

### 4. Änderungen committen

```bash
git add .
git commit -m "Feature: Beschreibung deiner Änderungen"
git push origin feature/dein-feature
```

### 5. Pull Request erstellen

Erstelle einen Pull Request von deinem Feature-Branch in den `develop`-Branch über die GitHub-Weboberfläche.

## Die wichtigsten Features

### Aktuelle Prioritäten

Diese Features haben aktuell die höchste Priorität:

1. **Blackboard-System**
   - Digitales schwarzes Brett für Ankündigungen
   - Verschiedene Ebenen: Firma, Abteilung, Team
   - CRUD-Operationen für Administratoren
   - Leserechte für Mitarbeiter

2. **Firmenkalender**
   - Kalender für Termine und Events
   - Verschiedene Ebenen: Firma, Abteilung, Team
   - Termin-Management (erstellen, bearbeiten, löschen)
   - Erinnerungsfunktionen

3. **Chat-Funktion**
   - Direkte Kommunikation zwischen Benutzern
   - Nachrichtenverwaltung und -historie
   - Benachrichtigungen über neue Nachrichten

4. **Schichtplanungs-Tool**
   - Erstellen und Verwalten von Schichtplänen
   - Mitarbeiter-Tauschbörse für Schichten
   - Überstunden-Tracking und Reporting

### Bereits implementierte Features

- Multi-Tenant-Architektur
- Feature-Management-System
- JWT-basierte Authentifizierung
- Benutzerverwaltung (Root, Admin, Mitarbeiter)
- Dokumenten-Upload und -Download
- E-Mail-Benachrichtigungssystem

## Häufig gestellte Fragen

### Wie funktioniert das Multi-Tenant-System?

Assixx verwendet ein tenant_id-basiertes System, bei dem jeder Request auf Basis der Subdomain einem bestimmten Tenant zugeordnet wird. Alle Datenbankabfragen werden automatisch nach tenant_id gefiltert.

### Wie aktiviere ich ein Feature für einen Tenant?

Features können über das Feature-Management-System aktiviert werden:

```javascript
// In einer API-Route
await Feature.activateForTenant(tenantId, 'feature_code', { options });
```

Oder über das Admin-Interface unter `/feature-management.html`.

### Wie füge ich einen neuen API-Endpunkt hinzu?

1. Erstelle eine Route-Datei in `server/routes/`
2. Definiere den Endpunkt mit erforderlichen Middleware:

```javascript
router.post('/api/mein-endpoint',
  authenticateToken,        // Auth-Check
  tenantMiddleware,         // Tenant-Identifikation
  checkFeature('my_feature'), // Feature-Check
  async (req, res) => {
    // Implementierung
  }
);
```

3. Registriere die Route in `server.js`:

```javascript
app.use(require('./routes/meine-route'));
```

### Wie funktioniert die Organisationsstruktur?

Assixx nutzt eine dreistufige Hierarchie:
- **Firma** (Tenant): Die Gesamtorganisation
- **Abteilung** (Department): Untereinheit der Firma
- **Team**: Kleinste Organisationseinheit

Jeder Benutzer kann einer Abteilung und optional einem Team zugeordnet sein.

### Wo finde ich weitere Hilfe?

- Schau in die Dokumentation im `docs/`-Ordner
- Lies die Projektnotizen in CLAUDE.md
- Überprüfe die ROADMAP.md für Entwicklungsprioritäten
- Kontaktiere Simon Öztürk bei spezifischen Fragen