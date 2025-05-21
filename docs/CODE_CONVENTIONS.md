# Assixx Code-Konventionen

Dieses Dokument definiert die Code-Konventionen und Best Practices für das Assixx-Projekt. Es soll sicherstellen, dass der Code konsistent, lesbar und wartbar bleibt, insbesondere bei der Zusammenarbeit mehrerer Entwickler.

## Inhaltsverzeichnis

1. [Allgemeine Richtlinien](#allgemeine-richtlinien)
2. [JavaScript-Konventionen](#javascript-konventionen)
3. [Code-Organisation](#code-organisation)
4. [Datenbank-Konventionen](#datenbank-konventionen)
5. [Frontend-Konventionen](#frontend-konventionen)
6. [Dokumentation](#dokumentation)
7. [Testing](#testing)
8. [Sicherheit](#sicherheit)

## Allgemeine Richtlinien

### Versioning

- Wir verwenden [Semantic Versioning](https://semver.org/) (MAJOR.MINOR.PATCH)
- Die Version wird in `package.json` definiert

### Dateibenennung

- Verwende `kebab-case` für alle Dateinamen
- Verwende sprechende Namen, die den Inhalt der Datei beschreiben
- Beispiel: `user-management.js`, `document-upload.js`

### Kodierung

- UTF-8 für alle Dateien
- LF (Unix-style) Zeilenenden
- Leerzeichen statt Tabs (2 Spaces)
- Keine Trailing Whitespaces

### Sprache

- Code-Kommentare auf Englisch
- Benutzersichtbare Texte (UI) primär auf Deutsch, später mehrsprachig
- Dokumentation auf Deutsch

## JavaScript-Konventionen

### Syntax

- ES6+ Features bevorzugen
- `const` und `let` statt `var`
- Arrow-Funktionen für anonyme Funktionen
- Template-Strings statt Konkatenation
- Destrukturierung nutzen, wo sinnvoll
- Spread/Rest-Operatoren für sauberen Code

```javascript
// Gut
const user = { name: 'Max', role: 'admin' };
const { name, role } = user;
const newUser = { ...user, department: 'IT' };

// Schlecht
var userName = user.name;
var userRole = user.role;
var newUser = Object.assign({}, user, { department: 'IT' });
```

### Coding Style

- Semikolons am Ende jeder Anweisung
- Geschweifte Klammern für alle Blöcke (auch einzeilige)
- Einrückung: 2 Spaces
- Maximal 100 Zeichen pro Zeile
- Kommas am Ende, nicht am Anfang der Zeile
- Kein Trailing Comma im letzten Element

```javascript
// Gut
const config = {
  host: 'localhost',
  port: 3000,
  debug: true
};

// Schlecht
const config = {
  host: 'localhost'
  , port: 3000
  , debug: true
  ,
};
```

### Namenskonventionen

- **Variablen/Funktionen**: camelCase
- **Klassen/Konstruktoren**: PascalCase
- **Konstanten**: UPPER_SNAKE_CASE (nur für echte Konstanten)
- **Private Variablen/Methoden**: mit Unterstrich präfixieren (_privateVar)
- **HTML-Attribute**: data-kebab-case
- **CSS-Klassen**: kebab-case

```javascript
// Variablen und Funktionen
const maxUsers = 100;
function calculateTotalPrice() {}

// Klassen
class UserManager {}

// Konstanten
const API_BASE_URL = 'https://api.example.com';

// Private Eigenschaften
class User {
  constructor() {
    this._password = null;
  }
}
```

### Funktionen

- Funktionen sollten eine Sache tun und das gut
- Kurze, beschreibende Namen verwenden
- Maximale Länge: ~25 Zeilen (bei Überschreitung aufteilen)
- Maximal 3 Parameter (bei mehr: Optionsobjekt verwenden)
- Default-Parameter nutzen, wo sinnvoll

```javascript
// Gut
function createUser({ name, email, role = 'user' }) {
  // Implementation
}

// Schlecht
function createUser(name, email, role, department, active, createdAt) {
  // Implementation
}
```

### Asynchroner Code

- Async/Await statt Callbacks verwenden
- Promise-Ketten vermeiden (zugunsten von Async/Await)
- Try-Catch-Blöcke für Error-Handling

```javascript
// Gut
async function fetchUserData(userId) {
  try {
    const response = await fetch(`/api/users/${userId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    throw error;
  }
}

// Schlecht
function fetchUserData(userId) {
  return fetch(`/api/users/${userId}`)
    .then(response => response.json())
    .then(data => data)
    .catch(error => {
      console.error('Failed to fetch user data:', error);
      throw error;
    });
}
```

### Imports/Exports

- Gruppenweise importieren und alphabetisch sortieren
- Node.js Core Module zuerst, dann externe Pakete, dann eigene Module
- Default-Exports für Hauptkomponenten, Named Exports für Utilities

```javascript
// Node.js Core Module
const path = require('path');
const fs = require('fs');

// Externe Pakete
const express = require('express');
const jwt = require('jsonwebtoken');

// Eigene Module
const auth = require('../middleware/auth');
const { validateUser } = require('../utils/validation');
```

## Code-Organisation

### Projektstruktur

- Klare Trennung zwischen Backend und Frontend
- Route-Handler sollten dünn sein und Logik an Services delegieren
- Trennung von Geschäftslogik und Datenzugriff

```
server/
├── models/         # Datenmodelle
├── routes/         # API-Routes (dünn)
├── controllers/    # Controller (Verbindung Route zu Service)
├── services/       # Business-Logik
├── middleware/     # Express Middleware
├── utils/          # Hilfsfunktionen
├── config/         # Konfiguration
└── server.js       # Startpunkt
```

### Modularisierung

- Eine Datei sollte eine klar definierte Verantwortlichkeit haben
- Maximale Dateigröße: ~300 Zeilen
- Verwandte Funktionalität in Module gruppieren
- Zirkuläre Abhängigkeiten vermeiden

### Middleware-Struktur

- Middleware-Komponenten sollten eine Sache tun und das gut
- Middleware-Ketten für komplexere Funktionalität verwenden
- Middleware in separate Dateien auslagern

```javascript
// Gut
const auth = require('./middleware/auth');
const tenantCheck = require('./middleware/tenant');
const featureCheck = require('./middleware/features');

app.use('/api/admin', auth, tenantCheck, featureCheck('admin_access'), adminRoutes);

// Schlecht
app.use('/api/admin', (req, res, next) => {
  // Auth-Logik
  // Tenant-Check
  // Feature-Check
  next();
}, adminRoutes);
```

## Datenbank-Konventionen

### Tabellennamen

- Pluralform (users, documents)
- Kleinbuchstaben mit Unterstrich (snake_case)
- Sprechende Namen (keine Abkürzungen)
- Präfixe für logische Gruppierung (z.B. auth_users, auth_permissions)

### Feldnamen

- Singular
- Snake_case
- Sprechende Namen
- Fremdschlüssel: referenzierte_tabelle_id (z.B. user_id)

### SQL-Queries

- Prepared Statements für alle dynamischen Werte
- Keine rohen SQL-Strings mit String-Konkatenation
- Indentation für bessere Lesbarkeit bei komplexen Queries

```javascript
// Gut
const users = await db.query(
  'SELECT * FROM users WHERE tenant_id = ? AND role = ?',
  [tenantId, role]
);

// Schlecht
const users = await db.query(
  'SELECT * FROM users WHERE tenant_id = ' + tenantId + ' AND role = "' + role + '"'
);
```

### Indizes

- Indizes für alle Fremdschlüssel
- Indizes für häufig abgefragte Felder
- Zusammengesetzte Indizes für häufige Kombinationen
- Unique-Indizes für eindeutige Werte

## Frontend-Konventionen

### HTML

- Semantisches HTML5 verwenden
- Kein Inline-CSS oder Inline-JavaScript
- Attribute in konsistenter Reihenfolge (id, class, name, data-*, src/href, etc.)
- Alt-Texte für alle Bilder

### CSS/SCSS

- BEM-Methodologie (Block, Element, Modifier)
- Mobile-First-Ansatz
- Vermeidung von !important
- Wiederverwendbarkeit durch Klassenhierarchien

```css
/* BEM-Format */
.card {} /* Block */
.card__title {} /* Element */
.card--featured {} /* Modifier */
```

### JavaScript (Frontend)

- Kein globaler Zustand
- Modularisierung durch ES6-Module oder IIFE
- Event-Delegation für dynamische Elemente
- Trennung von Logik und DOM-Manipulation

```javascript
// Gut - Modularisiert
const UserManager = (function() {
  function createUser() { /* ... */ }
  function deleteUser() { /* ... */ }
  
  return {
    create: createUser,
    delete: deleteUser
  };
})();

// Nutzung
UserManager.create();
```

## Dokumentation

### Code-Kommentare

- Kommentare beschreiben WARUM, nicht WAS (der Code sollte selbsterklärend sein)
- JSDoc für öffentliche Funktionen und Klassen
- TODO- und FIXME-Kommentare mit Namen und Datum

```javascript
/**
 * Berechnet den Preis eines Produkts unter Berücksichtigung von Steuern und Rabatten.
 * 
 * @param {number} basePrice - Der Grundpreis des Produkts
 * @param {number} taxRate - Der Steuersatz (z.B. 0.19 für 19%)
 * @param {number} [discount=0] - Der Rabatt in Prozent (z.B. 0.1 für 10%)
 * @returns {number} Der Endpreis inklusive Steuern und Rabatt
 */
function calculatePrice(basePrice, taxRate, discount = 0) {
  // Rabatt vom Grundpreis abziehen
  const discountedPrice = basePrice * (1 - discount);
  
  // FIXME: Rundungsfehler bei bestimmten Werten - John, 2025-01-15
  
  // Steuern hinzufügen
  return discountedPrice * (1 + taxRate);
}
```

### API-Dokumentation

- Jeder API-Endpunkt sollte dokumentiert sein
- Parameter, Rückgabewerte und Fehler beschreiben
- Beispielanfragen und -antworten bereitstellen

## Testing

### Allgemeine Testregeln

- Jede neue Funktionalität sollte getestet werden
- Tests sollten isoliert und unabhängig voneinander sein
- Keine gegenseitigen Abhängigkeiten zwischen Tests

### Unit-Tests

- Tests für alle Services und Utilities
- Mocking von externen Abhängigkeiten
- Fokus auf Geschäftslogik

### Integrationstests

- Tests für API-Endpunkte
- Testen der Interaktion verschiedener Komponenten
- End-to-End-Workflows

## Sicherheit

### Allgemeine Sicherheitsregeln

- Niemals sensible Daten im Code speichern (Passwörter, API-Schlüssel)
- Umgebungsvariablen für Konfiguration verwenden
- Keine sensiblen Informationen loggen

### Input-Validierung

- Validierung aller Benutzereingaben
- Desinfizierung von HTML/Markdown-Input
- Parametertypisierung und -validierung

```javascript
// Gut - Mit Validierung
const { email, password } = req.body;

if (!email || !isValidEmail(email)) {
  return res.status(400).send('Ungültige E-Mail-Adresse');
}

if (!password || password.length < 8) {
  return res.status(400).send('Passwort muss mindestens 8 Zeichen lang sein');
}

// Weiterer Code...
```

### Authentifizierung & Autorisierung

- JWT verwenden (mit angemessener Gültigkeitsdauer)
- Passwörter mit bcrypt hashen
- CSRF-Schutz implementieren
- Berechtigungsprüfungen auf API-Ebene (nicht nur im Frontend)

### Multi-Tenant-Sicherheit

- Jede Datenbankabfrage muss tenant_id filtern
- Cross-Tenant-Zugriff verhindern
- Validierung von tenant_id in allen APIs

```javascript
// Gut - Mit Tenant-Isolation
async function getUserDocuments(userId, tenantId) {
  return db.query(
    'SELECT * FROM documents WHERE user_id = ? AND tenant_id = ?',
    [userId, tenantId]
  );
}

// Schlecht - Ohne Tenant-Isolation
async function getUserDocuments(userId) {
  return db.query('SELECT * FROM documents WHERE user_id = ?', [userId]);
}
```

## Weiteres Lesen

- [JavaScript Style Guide (Airbnb)](https://github.com/airbnb/javascript)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

Diese Konventionen sind verpflichtend und werden bei Code-Reviews durchgesetzt. Sie können bei Bedarf erweitert oder angepasst werden, wenn das Team einen Konsens darüber findet.