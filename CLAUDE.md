# Assixx Projekt - Unsere privaten Arbeitsnotizen (Simon & Claude)

## Anweisungen für Claude
1. DIESE CLAUDE.md DATEI IMMER ZUERST LESEN BEI JEDEM START
2. Git Status prüfen
3. Dann README.md und ROADMAP.md lesen und analysieren
4. Übersicht und Analyse als Zusammenfassung präsentieren
5. NACHFRAGEN welches Problem oder Feature als nächstes implementiert werden soll
6. NICHT alles auf einmal angehen, immer Schritt für Schritt, Problem für Problem vorgehen
7. IMMER nach der Abarbeitung eines Problems oder Features nachfragen, was als nächstes gemacht werden soll
8. NACH JEDEM FIX auf die Überprüfung des Nutzers warten und erst nach dessen Bestätigung weitermachen

## Projektübersicht
- **Name**: Assixx (SaaS-Plattform für Industriefirmen)
- **Zielgruppe**: Industriefirmen mit Produktionsarbeitern ohne PC-Zugang
- **Business-Modell**: SaaS mit modularen Features (Basic €0, Premium €49, Enterprise €149)
- **Standort**: `/home/scs/projects/Assixx/` (WSL Ubuntu)
- **Repository**: https://github.com/SCS-Technik/Assixx

## Organisationsstruktur in Assixx

### Definitionen
- **Team**: Eine Gruppe von Mitarbeitern, die an denselben Maschinen arbeiten und einem Teamleiter zugeordnet sind
- **Abteilung**: Alle Mitarbeiter, die einem Abteilungsleiter oder Bereichsleiter zugeordnet sind
- **Firma**: Die Gesamtheit aller Abteilungen und Teams

## Was wir heute gemacht haben (2025-05-21)
1. **Aktualisierung der Projektdokumente** ✅
   - ROADMAP.md mit neuen priorisierten Features aktualisiert
   - README.md mit aktualisierten Prioritäten überarbeitet
   - CLAUDE.md mit Strukturdefinitionen ergänzt
   - Dokumentation der neuen Features erstellt
   - Schichtplanungs-Tool als neues Feature hinzugefügt

2. **E-Mail-Benachrichtigungssystem** ✅
   - Nodemailer Integration implementiert
   - E-Mail-Templates für verschiedene Events erstellt
   - Queue für Massen-E-Mails entwickelt
   - Unsubscribe-Funktion implementiert
   - Automatische Benachrichtigungen bei neuen Dokumenten

3. **Employee Dashboard Bugfixes** ✅
   - Dokumentenzähler im Dashboard korrigiert
   - Automatische Aktualisierung nach Änderungen
   - Event-Handler für Dokument-Aktionen verbessert
   - Konsistenz zwischen Anzeige und Datenbankwerten sichergestellt

## Was wir gestern gemacht haben (2025-05-20)
1. **Token-Debugging-System** ✅
   - Token-Debug-Seite implementiert (`/token-debug.html`)
   - JWT Token-Validierung und -Anzeige
   - API-Testmöglichkeit mit aktuellem Token
   - Einheitliche Fehlerbehandlung

2. **Authentifizierungsverbesserungen** ✅
   - Auth-Implementierung vereinheitlicht (`auth-unified.js`)
   - Konsistente Token-Validierung in allen Codepfaden
   - Gemeinsames JWT_SECRET für alle Auth-Funktionen
   - Diagnose-Tool für Token-Validierungsprobleme

3. **Admin Dashboard Verbesserungen** ✅
   - Mitarbeiter-Modal Fix: "Neuer Mitarbeiter"-Button repariert
   - Navigation optimiert: "Verwalten" statt "Alle anzeigen"
   - Konsistente Darstellung für alle Karten (Mitarbeiter, Dokumente, Abteilungen)
   - Event-Handler-Konflikte behoben

4. **Debug-Tools** ✅
   - Token-Validierungs-Diagnose implementiert
   - Debug-Dashboard für Administratoren
   - Verbesserte Fehlerprotokollierung
   - Test-Endpunkte für Entwicklung

## Was wir vorher gemacht haben (2025-05-19)
1. **Admin Dashboard Redesign** ✅
   - Neue Sidebar-Navigation
   - Glassmorphismus-Design
   - SVG-Icons statt Emojis
   - Header auf 56px reduziert

2. **Department-Counter Bug** ✅
   - Problem: Zähler zeigte immer 0
   - Lösung: loadDashboardStats() mit isolierten API-Calls statt Promise.all
   - Alle Test-Tools entfernt

3. **Feature-Management-System** ✅
   - Komplettes System implementiert
   - 12 Features in 3 Kategorien (Basic, Premium, Enterprise)
   - Admin-Interface unter /feature-management.html
   - Middleware checkFeature() für Feature-Prüfung
   - Usage-Tracking eingebaut

4. **Multi-Tenant Architektur** ✅
   - Subdomain-basierte Trennung
   - Feature-Aktivierung pro Tenant
   - Gemeinsame Datenbank mit tenant_id

5. **Sicherheitsvorbereitung** ✅
   - SECURITY-IMPROVEMENTS.md erstellt
   - security-enhanced.js Middleware fertig
   - Tenant-Whitelisting vorbereitet
   - Token-Logging entfernt
   - .env.example für sichere Konfiguration

6. **Dark-Mode Landingpage** ✅
   - Komplett überarbeitet im Assixx-Design
   - Ubuntu Font durchgängig
   - Responsive für alle Geräte
   - Self-Service Signup UI fertig

7. **Sicherheitsverbesserungen** ✅
   - uploadLimiter für Upload-Routen
   - fileUploadSecurity Middleware
   - JWT Secret Rotation
   - CSRF-Schutz mit csrf-csrf
   - Client-seitiger CSRF-Helper

## Was wir als nächstes machen müssen

### 🔴 PRIORITÄT 1 - KERNFUNKTIONEN für Produktionsbetriebe
1. **Blackboard-System** 🔄
   - Firmenweit sichtbares Blackboard für allgemeine Ankündigungen
   - Abteilungsspezifische Blackboards (nur für Mitglieder sichtbar)
   - Team-basierte Blackboards für spezifische Arbeitsgruppen
   - Admin-Panel zur Verwaltung aller Blackboards
   - Leserechte für Mitarbeiter, volle Rechte für Admins

2. **Firmenkalender** 🔄
   - Zentraler Firmenkalender für allgemeine Events
   - Abteilungsspezifische Kalender für interne Meetings
   - Team-spezifische Kalender für Schichten und Arbeitspläne
   - Integration mit externen Kalendersystemen (Google, Outlook)
   - Erinnerungsfunktion für wichtige Termine

3. **Chat-Funktion** 🔄
   - Direkte Kommunikation zwischen Admins und Mitarbeitern
   - Posteingang für jeden Mitarbeiter
   - Benachrichtigungen über neue Nachrichten
   - Archiv für vergangene Konversationen
   - Möglichkeit für Dateianhänge in Nachrichten

4. **Schichtplanungs-Tool** 🔄
   - Interaktiver Schichtplaner für Team- und Abteilungsleiter
   - Automatische Schichtplanerstellung basierend auf Verfügbarkeiten
   - Mitarbeiter-Tauschbörse für Schichten
   - Benachrichtigungen über Schichtänderungen
   - Überstunden- und Fehlzeitenerfassung
   - Integration mit Urlaubs- und Krankmeldungssystem

5. **TPM-Kalender (Total Productive Maintenance)** 🔄
   - Terminplanung für Maschinenwartungen
   - Wiederkehrende Wartungsintervalle
   - Zuständigkeitsverwaltung für Maintenance-Teams
   - Dokumentation durchgeführter Wartungen
   - Warnungen bei überfälligen Wartungsterminen

6. **Umfrage-Tool** 🔄
   - Erstellung von Multiple-Choice-Umfragen durch Admins
   - Verpflichtende Umfragen für Mitarbeiter
   - Automatische Auswertung und Visualisierung der Ergebnisse
   - Anonyme Umfragen für sensible Themen
   - Export von Umfrageergebnissen

7. **Urlaubsantrag-System** 🔄
   - Digitale Urlaubsanträge von Mitarbeitern an Admins
   - Übersicht über verfügbare Urlaubstage
   - Genehmigungsprozess mit Benachrichtigungen
   - Kalenderverfügbarkeit zur Vermeidung von Engpässen
   - Übersicht für Admins über alle eingereichten Anträge

8. **KVP-System (Kontinuierlicher Verbesserungsprozess)** 🔄
   - Foto-Upload für Verbesserungsvorschläge oder Problemmeldungen
   - Verfolgung des Status von eingereichten Vorschlägen
   - Bewertungssystem für Vorschläge
   - Belohnungssystem für umgesetzte Ideen
   - Auswertung und Reporting über eingereichte KVPs

9. **Lohnabrechnungs-Upload & Verwaltung** 🔄
   - Sichere Datei-Uploads mit Verschlüsselung
   - Automatische Kategorisierung
   - Versionskontrolle für Dokumente
   - Massenupload-Funktion
   - Automatische Benachrichtigungen bei neuen Dokumenten

10. **Mobile PWA** 🔄
   - Service Worker
   - Offline-Funktionalität
   - Push-Notifications
   - App-Icon und Manifest
   - Installation auf Mobilgeräten

### 🟡 PRIORITÄT 2 - ERWEITERUNGEN
1. **Mehrsprachige Unterstützung**
   - Grundlegende Mehrsprachigkeit (DE, EN)
   - Erweiterung um weitere Sprachen (PL, TR)
   - Sprachauswahl im Benutzerprofil
   - Automatische Spracherkennung
   - Übersetzungsmanagement-System

2. **Digitales Handbuch/Wiki**
   - Maschinen- und Prozessdokumentation
   - Suchbare Anleitungen mit Bildern/Videos
   - QR-Code-Zugriff auf Betriebshandbücher
   - Versionierung von Dokumentationen
   - Offline-Verfügbarkeit kritischer Anleitungen

3. **Stripe Integration**
   ```bash
   npm install stripe
   ```
   - Payment Routes erstellen
   - Webhook Handler
   - Automatische Feature-Aktivierung nach Zahlung

4. **Customer Portal**
   - Subscription Management 
   - Feature-Übersicht
   - Billing Dashboard

5. **Benachrichtigungssystem**
   - E-Mail-Templates anpassbar
   - SMS-Benachrichtigungen (optional)
   - In-App Push-Notifications
   - Benachrichtigungs-Center
   - Eskalationsregeln

### 🟢 PRIORITÄT 3 - OPTIMIERUNGEN
1. **Reporting & Analytics**
   - Dashboard mit KPIs
   - Export-Funktionen
   - Automatische Reports

2. **API & Integrationen**
   - REST API v2
   - Webhook System
   - ERP-Integration

3. **UI/UX Polish**
   - Dark Mode
   - Keyboard Shortcuts
   - Performance-Optimierung

4. **Sicherheit**
   - 2FA einbauen
   - DSGVO-konforme Verschlüsselung
   - Audit Logs erweitern
   - End-to-End-Verschlüsselung

5. **Qualitätssicherungs-Checklisten**
   - Digitale Checklisten für Qualitätskontrollen
   - Fotodokumentation von Qualitätsmängeln
   - Automatische Benachrichtigung bei Abweichungen
   - Trendanalyse von Qualitätsproblemen
   - Integration mit KVP-System

6. **Skill-Matrix/Qualifikationsmanagement**
   - Übersicht über Qualifikationen und Zertifikate
   - Automatische Erinnerungen bei auslaufenden Zertifikaten
   - Planung von Weiterbildungen
   - Personalbedarfsplanung basierend auf Qualifikationen
   - Integration mit Schichtplanung

## Technische Details zum Feature-System

### Feature in Route verwenden
```javascript
router.post('/api/premium-function',
  authenticateToken,
  checkFeature('advanced_reports'), // Prüft ob Feature aktiv
  async (req, res) => {
    // Code nur wenn Feature verfügbar
  }
);
```

### Feature aktivieren (Admin)
```javascript
POST /features/activate
{
  "tenantId": 1,
  "featureCode": "email_notifications",
  "options": {
    "trialDays": 14,
    "usageLimit": 1000
  }
}
```

### Payment-Flow (zu implementieren)
```javascript
app.post('/webhook/stripe', async (req, res) => {
  const event = req.body;
  
  switch(event.type) {
    case 'checkout.session.completed':
      await Feature.activateForTenant(tenantId, planFeatures);
      await sendWelcomeEmail(customer);
      break;
      
    case 'invoice.payment_failed':
      await Feature.deactivateForTenant(tenantId);
      await sendPaymentFailedEmail(customer);
      break;
  }
});
```

## Wichtige Dateien

### Feature-Management
- `/server/models/feature.js` - Feature-Model
- `/server/middleware/features.js` - Feature-Checks
- `/server/routes/features.js` - API-Endpoints
- `/server/public/feature-management.html` - Admin UI
- `/server/database/feature_management_schema.sql` - DB Schema

### Multi-Tenant
- `/server/middleware/tenant.js` - Tenant-Erkennung
- `/server/config/tenants.js` - Tenant-Konfiguration

### E-Mail-System
- `/server/utils/emailService.js` - E-Mail-Service mit Queue und Templates
- `/server/templates/email/` - Ordner für E-Mail-Templates
  - `welcome.html` - Template für Willkommensnachrichten
  - `new-document.html` - Template für Dokumentenbenachrichtigungen
  - `notification.html` - Allgemeines Template für Benachrichtigungen
- `/server/routes/unsubscribe.js` - Route für E-Mail-Abmeldungen
- `/server/scripts/send-bulk-email.js` - Beispielskript für Massen-E-Mails

## Unsere Arbeitsweise
1. **Kleine Schritte**: Feature für Feature implementieren
2. **Test first**: Immer testen bevor committen
3. **Clean Code**: Nach Funktionalität aufräumen
4. **Dokumentation**: README und ROADMAP aktuell halten

## Notizen für nächste Session
- CLAUDE.md IMMER zuerst lesen
- Git-Status und letzte Commits prüfen
- Blackboard-System und Firmenkalender priorisieren
- Mit Chat-Funktion und Schichtplanungs-Tool fortfahren
- Mobile Design-Mockups für PWA erstellen

## Feature-Preise (bereits in DB)
- **Basic**: €0/Monat
  - Bis 10 Mitarbeiter
  - Basis-Dokumente
  - Lohnabrechnungen
  
- **Premium**: €49/Monat 
  - Unbegrenzte Mitarbeiter
  - E-Mail-Benachrichtigungen (1000/Monat)
  - Erweiterte Berichte
  - Audit Logs
  - Blackboard-System
  - Firmenkalender
  - Chat-Funktion
  - Basis-Schichtplanung
  
- **Enterprise**: €149/Monat
  - API-Zugang
  - Custom Branding
  - Priority Support
  - Automatisierung
  - Multi-Mandanten
  - TPM-Kalender
  - KVP-System
  - Umfrage-Tool
  - Urlaubsantrags-System
  - Erweiterte Schichtplanung mit Auto-Generierung

## Simon's Ziele
- SaaS-Plattform für Industriefirmen
- Modulare Features die einzeln buchbar sind
- Automatische Abrechnung über Stripe
- Skalierbar für viele Kunden
- Mobile-First für Arbeiter
- Intuitive Benutzeroberfläche für Produktionsarbeiter
- Mehrsprachige Unterstützung für internationale Teams
- Effiziente Personalplanung durch Schichtplanungs-Tool

## Claude's Aufgaben
- Code sauber halten
- Features modular implementieren
- Sicherheit immer im Blick
- Performance optimieren
- Dokumentation aktuell halten
- Blackboard-System und Firmenkalender entwickeln
- Chat-Funktion implementieren
- Schichtplanungs-Tool entwickeln
- TPM-Kalender erstellen

## Offene Fragen
- Blackboard-System: Sollen Mitarbeiter kommentieren können?
- Firmenkalender: Integration mit externen Kalendern (Google, Outlook)?
- Chat-Funktion: Gruppenchats oder nur 1:1 Admin-Mitarbeiter?
- Schichtplanungs-Tool: Welche Schichttypen müssen unterstützt werden?
- Schichtplanungs-Tool: Automatische Berücksichtigung von Qualifikationen?
- TPM-Kalender: Automatische Benachrichtigungen an Maintenance-Teams?
- Umfrage-Tool: Anonyme Teilnahme erlauben?
- Urlaubsantrags-System: Workflow für Genehmigungen festlegen

## Erfolge bisher
- ✅ Multi-Tenant funktioniert
- ✅ Feature-Management läuft
- ✅ Admin Dashboard modern
- ✅ Department-Management komplett
- ✅ Sichere Authentifizierung
- ✅ E-Mail-Benachrichtigungssystem implementiert
- ✅ Dokumenten-Download fertiggestellt

## Probleme gelöst
- Department-Counter Bug ✅
- Login-Redirect-Loop ✅
- Cookie-Konflikte ✅
- UI-Modernisierung ✅
- Employee Dashboard Bugfixes ✅
- Token-Validierung vereinheitlicht ✅

## Immer dran denken
- Feature-First Development
- Neue Funktionen immer togglebar
- Multi-Tenant bei jedem API-Call
- Sicherheit vor Features
- Mobile User Experience prioritär
- Organisationsstruktur (Team, Abteilung, Firma) berücksichtigen
- Berechtigungen entsprechend der Benutzerrollen anpassen
- Git-Workflow beachten (siehe unten)

## Wörterbuch der Fachbegriffe
- **Blackboard**: Digitales schwarzes Brett für Ankündigungen und Informationen
- **TPM**: Total Productive Maintenance (Ganzheitliche produktive Instandhaltung)
- **KVP**: Kontinuierlicher Verbesserungsprozess
- **Team**: Mitarbeiter an denselben Maschinen unter einem Teamleiter
- **Abteilung**: Mitarbeiter unter einem Abteilungsleiter/Bereichsleiter
- **Feature-Toggle**: System zur dynamischen Aktivierung/Deaktivierung von Funktionen
- **Multi-Tenant**: Mehrere Firmen in einer Instanz mit logischer Trennung
- **PWA**: Progressive Web App (Webseite mit App-ähnlichen Funktionen)
- **Schichtplanung**: Einteilung von Mitarbeitern in verschiedene Arbeitszeiten

## Wichtig für nächste Session

### Zu implementierende Features
1. **Blackboard-System**
   - Frontend mit Ansichten für Firma, Abteilung, Team
   - Backend-Routen und Models
   - Berechtigungsstruktur implementieren

2. **Firmenkalender**
   - Kalender-Komponente mit Tag/Wochen/Monatsansicht
   - Termin-Model und API-Routes
   - Berechtigungen und Filter nach Organisationsebene

3. **Chat-Funktion**
   - Chat-UI für Mitarbeiter und Admins
   - Messaging-System im Backend
   - Benachrichtigungen integrieren

4. **Schichtplanungs-Tool**
   - Planungsansicht für Administratoren und Teamleiter
   - Schicht-Model und API-Routes
   - Mitarbeiter-Tauschbörse
   - Überstunden-Tracking

### Bevor Produktion
1. **Sicherheit aktivieren**
   - /server/SECURITY-IMPROVEMENTS.md durcharbeiten
   - security-enhanced.js einbinden
   - HTTPS-Zertifikate einrichten
   - Environment-Variablen sichern

### Neue potenzielle Dateien
- `/server/models/blackboard.js` - Model für Blackboard-Einträge
- `/server/routes/blackboard.js` - API-Endpoints für Blackboard
- `/server/public/blackboard.html` - Blackboard-Ansicht
- `/server/public/js/blackboard.js` - Frontend-Logik für Blackboard

- `/server/models/calendar.js` - Model für Kalendereinträge
- `/server/routes/calendar.js` - API-Endpoints für Kalender
- `/server/public/calendar.html` - Kalender-Ansicht
- `/server/public/js/calendar.js` - Frontend-Logik für Kalender

- `/server/models/chat.js` - Model für Chat-Nachrichten
- `/server/routes/chat.js` - API-Endpoints für Chat
- `/server/public/chat.html` - Chat-Oberfläche
- `/server/public/js/chat.js` - Frontend-Logik für Chat

- `/server/models/shift.js` - Model für Schichtpläne
- `/server/routes/shift.js` - API-Endpoints für Schichtplanung
- `/server/public/shift-planning.html` - Schichtplanungs-Interface
- `/server/public/js/shift-planning.js` - Frontend-Logik für Schichtplanung
- `/server/public/js/shift-exchange.js` - Frontend-Logik für Schichttausch

### Neue Dateien heute (2025-05-21)
- `/server/utils/emailService.js` - E-Mail-Service mit Queue und Templates
- `/server/templates/email/` - Ordner für E-Mail-Templates
  - `welcome.html` - Template für Willkommensnachrichten
  - `new-document.html` - Template für Dokumentenbenachrichtigungen
  - `notification.html` - Allgemeines Template für Benachrichtigungen
- `/server/routes/unsubscribe.js` - Route für E-Mail-Abmeldungen
- `/server/scripts/send-bulk-email.js` - Beispielskript für Massen-E-Mails

### Neue Dateien gestern (2025-05-20)
- `/server/auth-unified.js` - Vereinheitlichte Auth-Implementierung
- `/server/fix-token-validation.js` - Diagnose-Tool für Token-Probleme
- `/server/update-auth.js` - Script zum Aktualisieren der Auth-Implementierung
- `/server/public/token-debug.html` - Token-Debug-Seite
- `/server/public/js/debug-token.js` - JavaScript für Token-Debug-Seite
- `/server/public/js/employee-modal-fix.js` - Fix für das Mitarbeiter-Modal
- `/server/public/js/dashboard-navigation-fix.js` - Navigationslösung
- `/server/routes/test-db.js` - Test-Routen für Debugging

---
## Git-Workflow für Feature-Entwicklung

### Branches
- **master**: Produktionsbereit, immer stabil
- **develop**: Integrationszweig für fertige Features
- **feature/blackboard**: Entwicklung des Blackboard-Systems
- **feature/calendar**: Entwicklung des Firmenkalenders
- **feature/chat**: Entwicklung der Chat-Funktion
- **feature/shift-planning**: Entwicklung des Schichtplanungs-Tools

### Workflow
1. IMMER vor Beginn der Arbeit den richtigen Feature-Branch auschecken
2. IMMER `git checkout feature/[feature-name]` ausführen
3. IMMER prüfen, ob der korrekte Branch aktiv ist: `git branch`
4. Entwicklung im Feature-Branch durchführen
5. Feature-Branch regelmäßig committen
6. NICHT direkt in master oder develop committen
7. Nach Fertigstellung des Features: Pull Request von Feature-Branch in develop

### Befehle
```bash
# Zum Feature-Branch wechseln
git checkout feature/blackboard

# Status prüfen
git status

# Änderungen hinzufügen
git add .

# Änderungen committen
git commit -m "Feature: Beschreibung der Änderung"

# Änderungen pushen
git push origin feature/blackboard
```

---
Stand: 2025-05-21
Nächste Session: Implementierung des Blackboard-Systems in feature/blackboard