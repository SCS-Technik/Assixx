# Assixx Systemarchitektur

Dieses Dokument beschreibt die Architektur des Assixx-Systems, einschließlich der Komponenten, Datenmodelle und Interaktionsmuster.

## Systemübersicht

Assixx ist eine modulare SaaS-Plattform für Industriefirmen, die speziell für Produktionsarbeiter ohne PC-Zugang entwickelt wurde. Die Architektur folgt einem Multi-Tenant-Design mit Feature-Toggles und rollenbasierter Zugriffssteuerung.

```
+------------------+     +------------------+     +------------------+
|                  |     |                  |     |                  |
|  Mobile Clients  |     |   Web Clients    |     |   Admin Portal   |
|  (Mitarbeiter)   |     | (Teaml./Admin)   |     |    (Root User)   |
|                  |     |                  |     |                  |
+--------+---------+     +--------+---------+     +--------+---------+
         |                        |                        |
         |                        |                        |
         v                        v                        v
+------------------------------------------------------------------+
|                                                                  |
|                        REST API (Express)                        |
|                                                                  |
+------------------------------------------------------------------+
         |                        |                        |
         |                        |                        |
         v                        v                        v
+----------------+      +-------------------+     +------------------+
|                |      |                   |     |                  |
| Authentication |      | Feature Management|     | Business Logic   |
|   (JWT)        |      |                   |     | (Core Modules)   |
|                |      |                   |     |                  |
+----------------+      +-------------------+     +------------------+
         |                        |                        |
         |                        |                        |
         v                        v                        v
+------------------------------------------------------------------+
|                                                                  |
|                       Database (MySQL)                           |
|                                                                  |
+------------------------------------------------------------------+
         |                        |                        |
         |                        |                        |
         v                        v                        v
+----------------+      +-------------------+     +------------------+
|                |      |                   |     |                  |
| User & Tenant  |      | Document & Data   |     |  Feature Config  |
|    Data        |      |    Storage        |     |                  |
|                |      |                   |     |                  |
+----------------+      +-------------------+     +------------------+
```

## Multi-Tenant-Architektur

Die Multi-Tenant-Architektur ermöglicht es, mehrere Kundenorganisationen (Tenants) in einer einzigen Instanz der Anwendung zu hosten:

- Jeder Tenant wird durch eine eindeutige `tenant_id` identifiziert
- Tenants werden durch Subdomains unterschieden (z.B. kunde1.assixx.com)
- Alle Datenbankabfragen werden automatisch nach `tenant_id` gefiltert
- Feature-Aktivierung erfolgt pro Tenant

```javascript
// Beispielcode für Tenant-Middleware
const tenantMiddleware = (req, res, next) => {
  const subdomain = req.hostname.split('.')[0];
  const tenant = getTenantBySubdomain(subdomain);
  
  if (!tenant) {
    return res.status(404).send('Tenant nicht gefunden');
  }
  
  req.tenantId = tenant.id;
  next();
};
```

## Feature-Management-System

Das Feature-Management-System ermöglicht die dynamische Aktivierung/Deaktivierung von Funktionen basierend auf dem Abonnement:

- Features werden in der Datenbank definiert und konfiguriert
- Feature-Checks erfolgen auf API-Ebene durch Middleware
- Features können vom Administrator aktiviert/deaktiviert werden
- Nutzungsdaten werden für jedes Feature protokolliert

```javascript
// Beispielcode für Feature-Check
const checkFeature = (featureCode) => {
  return async (req, res, next) => {
    const hasAccess = await Feature.checkAccess(req.tenantId, featureCode);
    
    if (!hasAccess) {
      return res.status(403).send('Kein Zugriff auf dieses Feature');
    }
    
    next();
  };
};
```

## Authentifizierung & Autorisierung

Die Authentifizierung basiert auf JWT (JSON Web Tokens):

- Tokens enthalten Benutzer-ID, Tenant-ID und Rolle
- Tokens haben eine begrenzte Gültigkeitsdauer
- Rollenbasierte Zugriffssteuerung für API-Endpoints
- Token-Rotation für erhöhte Sicherheit

## Datenmodell

### Hauptentitäten

- **User**: Benutzer mit Rollen (root, admin, teamleader, employee)
- **Tenant**: Kundenorganisationen mit Konfiguration
- **Department**: Abteilungen innerhalb eines Tenants
- **Team**: Teams innerhalb einer Abteilung
- **Document**: Hochgeladene Dokumente mit Metadaten
- **Feature**: Feature-Definitionen und Konfigurationen

### Organisationsstruktur

```
+-------------+     +-------------+     +-------------+
|             |     |             |     |             |
|    Firma    +---->|  Abteilung  +---->|    Team     |
| (Tenant)    |     | (Department)|     |             |
|             |     |             |     |             |
+-------------+     +-------------+     +-------------+
      ^                    ^                   ^
      |                    |                   |
      |                    |                   |
      |                    |                   |
+-------------+     +-------------+     +-------------+
|             |     |             |     |             |
|    Admin    |     | Abteilungs- |     |  Teamleiter |
|             |     |   leiter    |     |             |
|             |     |             |     |             |
+-------------+     +-------------+     +-------------+
                                                ^
                                                |
                                                |
                                          +-------------+
                                          |             |
                                          | Mitarbeiter |
                                          |             |
                                          |             |
                                          +-------------+
```

## Aktuelle Module und Features (Core)

1. **Benutzerverwaltung**
   - Benutzer erstellen, bearbeiten, löschen
   - Rollenbasierte Berechtigungen
   - Profilverwaltung

2. **Dokumentenverwaltung**
   - Dokumenten-Upload und -Download
   - Kategorisierung
   - Versionierung
   - Berechtigungsprüfung

3. **Dashboard**
   - Admin-Dashboard
   - Mitarbeiter-Dashboard
   - Statistiken und Übersichten

4. **E-Mail-Benachrichtigungen**
   - Templating-System
   - Queue-Management
   - Unsubscribe-Funktion

## Geplante Module (In Entwicklung)

1. **Blackboard-System**
   - Ankündigungen auf verschiedenen Organisationsebenen
   - Lesebestätigungen
   - Anhänge und Formatting

2. **Firmenkalender**
   - Termine auf verschiedenen Organisationsebenen
   - Wiederholende Termine
   - Kalender-Export

3. **Chat-Funktion**
   - Direkte Kommunikation
   - Nachrichtenverlauf
   - Benachrichtigungen

4. **Schichtplanungs-Tool**
   - Schichtplanerstellung
   - Mitarbeiter-Tauschbörse
   - Überstundenerfassung

## Technologiestack

- **Frontend**: HTML, CSS, JavaScript (vanilla)
- **Backend**: Node.js, Express
- **Datenbank**: MySQL
- **Authentifizierung**: JWT (jsonwebtoken)
- **Speicher**: Lokales Dateisystem (für Dokumente)
- **E-Mail**: Nodemailer
- **Geplant**: Progressive Web App (PWA)

## API-Struktur

Die API folgt einer RESTful-Struktur:

- `/api/users` - Benutzerverwaltung
- `/api/departments` - Abteilungsverwaltung
- `/api/documents` - Dokumentenverwaltung
- `/api/features` - Feature-Management
- `/api/blackboard` - Blackboard-System (in Entwicklung)
- `/api/calendar` - Kalender-System (in Entwicklung)
- `/api/chat` - Chat-Funktion (in Entwicklung)
- `/api/shifts` - Schichtplanung (in Entwicklung)

## Sicherheitsmaßnahmen

- HTTPS für alle Verbindungen
- Passwort-Hashing mit bcrypt
- CSRF-Schutz
- Content-Security-Policy
- Rate-Limiting für Login-Versuche
- SQL-Injection-Schutz durch Prepared Statements
- Regelmäßige JWT-Secret-Rotation

## Diagramme

### Datenfluss (Beispiel: Dokumenten-Upload)

```
+----------------+     +---------------+     +---------------+
|                |     |               |     |               |
|    Frontend    +---->+    API        +---->+   Document    |
|    Upload UI   |     |   Router      |     |   Controller  |
|                |     |               |     |               |
+----------------+     +---------------+     +-------+-------+
                                                    |
                                                    v
+-----------------+    +----------------+    +------+--------+
|                 |    |                |    |               |
|  File Storage   +<---+  Document      +<---+   Tenant &    |
|                 |    |  Model         |    |    Auth Check |
|                 |    |                |    |               |
+-----------------+    +----------------+    +---------------+
       |
       v
+----------------+     +---------------+
|                |     |               |
|  Document      +---->+  Email        |
|  Processing    |     |  Notification |
|                |     |               |
+----------------+     +---------------+
```

## Performance-Überlegungen

- Caching für häufig abgerufene Daten
- Pagination für große Datensätze
- Komprimierung von Anfragen/Antworten
- Lazy-Loading für Frontend-Assets
- Dokumenten-Streaming für große Dateien

## Zukunftspläne

- Microservices-Architektur für bessere Skalierbarkeit
- Docker-Containerisierung
- CI/CD-Pipeline für automatisierte Tests und Deployments
- Elasticsearch für bessere Suchfunktionalität
- Redis für verbessertes Caching
- GraphQL API für optimierte Datenabfragen

## Fachspezifische Konzepte

- **TPM**: Total Productive Maintenance - System zur Maschinenwartungsplanung
- **KVP**: Kontinuierlicher Verbesserungsprozess - Workflow für Verbesserungsvorschläge
- **Schichtplanung**: System zur Koordination von Arbeitszeiten im industriellen Umfeld