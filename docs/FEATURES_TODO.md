# Assixx: Offene Features und Aufgaben

Dieses Dokument bietet einen detaillierten Überblick über die noch zu implementierenden Features und Aufgaben im Assixx-Projekt. Es dient als Arbeitsgrundlage für neue Entwickler und als Referenz für die Projektpriorisierung.

## Priorität 1: Kernfunktionen (Aktive Entwicklung)

### 1. Blackboard-System (Branch: feature/blackboard)

Das Blackboard-System ist ein digitales schwarzes Brett für firmenweite Kommunikation. Es ermöglicht Ankündigungen auf verschiedenen Organisationsebenen.

#### Zu implementierende Komponenten:

- [ ] **Datenmodell**
  - [ ] `blackboard_entry`-Tabelle mit Feldern: id, tenant_id, org_level, org_id, title, content, author_id, created_at, updated_at, expires_at, priority, status
  - [ ] `blackboard_read`-Tabelle für Lesebestätigungen: id, entry_id, user_id, read_at

- [ ] **API-Endpunkte**
  - [ ] `GET /api/blackboard` - Alle sichtbaren Einträge abrufen
  - [ ] `GET /api/blackboard/:id` - Einzelnen Eintrag abrufen
  - [ ] `POST /api/blackboard` - Neuen Eintrag erstellen
  - [ ] `PUT /api/blackboard/:id` - Eintrag aktualisieren
  - [ ] `DELETE /api/blackboard/:id` - Eintrag löschen
  - [ ] `POST /api/blackboard/:id/read` - Eintrag als gelesen markieren

- [ ] **Frontend**
  - [ ] Blackboard-Übersichtsseite mit Filterfunktionen
  - [ ] Detailansicht für einzelne Einträge
  - [ ] Editor für neue Einträge (Admin)
  - [ ] Lesebestätigungsfunktion für wichtige Ankündigungen
  - [ ] Dashboard-Widget für neueste Einträge

- [ ] **Berechtigungskonzept**
  - [ ] Firmenweite Einträge für alle sichtbar
  - [ ] Abteilungsspezifische Einträge nur für Mitglieder
  - [ ] Team-basierte Einträge nur für Teammitglieder
  - [ ] Schreibrechte nur für Admin und Teamleiter

- [ ] **UI/UX**
  - [ ] Responsive Design für mobile Nutzung
  - [ ] Priorisierte Anzeige wichtiger Ankündigungen
  - [ ] Ungelesene Einträge hervorheben

### 2. Firmenkalender (Branch: feature/calendar)

Der Firmenkalender ermöglicht die Verwaltung von Terminen auf verschiedenen Organisationsebenen und die Integration mit externen Kalendersystemen.

#### Zu implementierende Komponenten:

- [ ] **Datenmodell**
  - [ ] `calendar_event`-Tabelle: id, tenant_id, org_level, org_id, title, description, start_time, end_time, location, creator_id, created_at, updated_at, status, recurrence
  - [ ] `event_attendee`-Tabelle: id, event_id, user_id, status (accepted, declined, tentative)
  - [ ] `event_reminder`-Tabelle: id, event_id, reminder_time, status

- [ ] **API-Endpunkte**
  - [ ] `GET /api/calendar` - Alle sichtbaren Termine abrufen
  - [ ] `GET /api/calendar/:id` - Einzelnen Termin abrufen
  - [ ] `POST /api/calendar` - Neuen Termin erstellen
  - [ ] `PUT /api/calendar/:id` - Termin aktualisieren
  - [ ] `DELETE /api/calendar/:id` - Termin löschen
  - [ ] `POST /api/calendar/:id/attend` - Teilnahme bestätigen/ablehnen
  - [ ] `GET /api/calendar/export` - Kalender als iCal exportieren

- [ ] **Frontend**
  - [ ] Kalenderansicht mit Monats-, Wochen- und Tagesansicht
  - [ ] Termin-Editor-Modal
  - [ ] Teilnehmerverwaltung
  - [ ] Filter nach Organisationsebene
  - [ ] Termindetails mit Teilnehmerliste
  - [ ] Dashboard-Widget für anstehende Termine

- [ ] **Integration**
  - [ ] iCal-Export-Funktion
  - [ ] Google Calendar Integration (optional)
  - [ ] Outlook Integration (optional)

- [ ] **Benachrichtigungen**
  - [ ] E-Mail-Benachrichtigungen für neue Termine
  - [ ] Erinnerungen vor Terminen
  - [ ] Benachrichtigungen bei Änderungen

### 3. Chat-Funktion (Branch: feature/chat)

Die Chat-Funktion ermöglicht die direkte Kommunikation zwischen Nutzern, insbesondere zwischen Admins und Mitarbeitern.

#### Zu implementierende Komponenten:

- [ ] **Datenmodell**
  - [ ] `chat_conversation`-Tabelle: id, tenant_id, title, created_at, updated_at, type (direct, group)
  - [ ] `chat_participant`-Tabelle: id, conversation_id, user_id, role, last_read_at
  - [ ] `chat_message`-Tabelle: id, conversation_id, sender_id, content, created_at, status, attachment_id

- [ ] **API-Endpunkte**
  - [ ] `GET /api/chat/conversations` - Alle Konversationen abrufen
  - [ ] `GET /api/chat/conversations/:id` - Einzelne Konversation mit Nachrichten abrufen
  - [ ] `POST /api/chat/conversations` - Neue Konversation erstellen
  - [ ] `POST /api/chat/conversations/:id/messages` - Nachricht senden
  - [ ] `PUT /api/chat/conversations/:id/read` - Als gelesen markieren
  - [ ] `POST /api/chat/conversations/:id/attachment` - Anhang hochladen

- [ ] **Frontend**
  - [ ] Chat-Übersicht mit Konversationsliste
  - [ ] Nachrichten-UI mit Textfeld und Nachrichtenverlauf
  - [ ] Ungelesene Nachrichten hervorheben
  - [ ] Dateiupload-Funktion
  - [ ] Benachrichtigungen für neue Nachrichten
  - [ ] "Typing" Indikator

- [ ] **Echtzeit-Funktionalität**
  - [ ] WebSocket-Integration für Live-Updates
  - [ ] Statusanzeige (online, offline, abwesend)
  - [ ] Notification Badge für ungelesene Nachrichten

- [ ] **Mobile Optimierung**
  - [ ] Responsive Design für Mobilgeräte
  - [ ] Push-Benachrichtigungen
  - [ ] Offline-Funktionalität mit Nachrichtenqueue

### 4. Schichtplanungs-Tool (Branch: feature/shift-planning)

Das Schichtplanungs-Tool ermöglicht die effiziente Planung und Verwaltung von Mitarbeiterschichten in Produktionsbetrieben.

#### Zu implementierende Komponenten:

- [ ] **Datenmodell**
  - [ ] `shift_template`-Tabelle: id, tenant_id, name, start_time, end_time, color, break_duration
  - [ ] `shift_schedule`-Tabelle: id, tenant_id, team_id, start_date, end_date, status, creator_id, created_at
  - [ ] `shift_assignment`-Tabelle: id, schedule_id, employee_id, shift_template_id, date, status, notes
  - [ ] `shift_exchange`-Tabelle: id, tenant_id, requester_id, requested_assignment_id, offered_assignment_id, status, created_at

- [ ] **API-Endpunkte**
  - [ ] `GET /api/shifts/templates` - Schichtvorlagen abrufen
  - [ ] `POST /api/shifts/templates` - Schichtvorlage erstellen
  - [ ] `GET /api/shifts/schedules` - Schichtpläne abrufen
  - [ ] `POST /api/shifts/schedules` - Schichtplan erstellen
  - [ ] `PUT /api/shifts/assignments/:id` - Schichtzuweisung aktualisieren
  - [ ] `POST /api/shifts/exchanges` - Schichttausch beantragen
  - [ ] `PUT /api/shifts/exchanges/:id` - Schichttausch genehmigen/ablehnen

- [ ] **Frontend**
  - [ ] Schichtplan-Editor für Administratoren/Teamleiter
  - [ ] Wochenansicht des Schichtplans
  - [ ] Monatsansicht des Schichtplans
  - [ ] Mitarbeiteransicht der eigenen Schichten
  - [ ] Tauschbörsen-Interface
  - [ ] Überstunden-Tracking-Dashboard

- [ ] **Automatisierungsfunktionen**
  - [ ] Automatische Schichtplanerstellung basierend auf Verfügbarkeiten
  - [ ] Konfliktprüfung bei Schichtzuweisungen
  - [ ] Berücksichtigung von Qualifikationen bei der Planung
  - [ ] Vorschlagssystem für optimale Schichtverteilung

- [ ] **Integration**
  - [ ] Verknüpfung mit Urlaubs- und Krankmeldungssystem
  - [ ] Integration mit Firmenkalender
  - [ ] Export-Funktionen (PDF, Excel)

## Priorität 2: Wichtige Funktionen

### 5. TPM-Kalender (Total Productive Maintenance)

Der TPM-Kalender ermöglicht die Planung und Verwaltung von Maschinenwartungen und -inspektionen im Produktionsumfeld.

#### Zu implementierende Komponenten:

- [ ] **Datenmodell**
  - [ ] `machine`-Tabelle: id, tenant_id, name, type, location, serial_number, purchase_date, status
  - [ ] `maintenance_plan`-Tabelle: id, machine_id, name, description, interval_type, interval_value
  - [ ] `maintenance_task`-Tabelle: id, plan_id, title, description, duration, required_skills
  - [ ] `maintenance_schedule`-Tabelle: id, plan_id, due_date, assigned_to, status, completed_at, notes

- [ ] **API-Endpunkte**
  - [ ] `GET /api/machines` - Maschinen abrufen
  - [ ] `POST /api/machines` - Maschine erstellen
  - [ ] `GET /api/maintenance/plans` - Wartungspläne abrufen
  - [ ] `POST /api/maintenance/plans` - Wartungsplan erstellen
  - [ ] `GET /api/maintenance/schedule` - Wartungstermine abrufen
  - [ ] `PUT /api/maintenance/schedule/:id` - Wartungstermin aktualisieren (Abschluss, Verschiebung)

- [ ] **Frontend**
  - [ ] Maschinen-Dashboard
  - [ ] Wartungsplan-Editor
  - [ ] Wartungskalender mit Filteroptionen
  - [ ] Detailansicht für Wartungsaufgaben
  - [ ] Statusreporting mit Überfälligkeitsanzeige

- [ ] **Automatisierung**
  - [ ] Automatische Terminplanung basierend auf Intervallen
  - [ ] Benachrichtigungen für anstehende Wartungen
  - [ ] Eskalation bei überfälligen Wartungen

### 6. Umfrage-Tool

Das Umfrage-Tool ermöglicht die Erstellung und Auswertung von Mitarbeiterbefragungen.

#### Zu implementierende Komponenten:

- [ ] **Datenmodell**
  - [ ] `survey`-Tabelle: id, tenant_id, title, description, creator_id, created_at, start_date, end_date, status, is_anonymous
  - [ ] `survey_question`-Tabelle: id, survey_id, position, text, type, options, is_required
  - [ ] `survey_response`-Tabelle: id, survey_id, user_id, started_at, completed_at
  - [ ] `survey_answer`-Tabelle: id, response_id, question_id, answer_value

- [ ] **API-Endpunkte**
  - [ ] `GET /api/surveys` - Umfragen abrufen
  - [ ] `POST /api/surveys` - Umfrage erstellen
  - [ ] `GET /api/surveys/:id` - Umfragedetails abrufen
  - [ ] `POST /api/surveys/:id/responses` - Umfrage beantworten
  - [ ] `GET /api/surveys/:id/results` - Umfrageergebnisse abrufen

- [ ] **Frontend**
  - [ ] Umfrage-Editor für Administratoren
  - [ ] Übersicht verfügbarer Umfragen für Mitarbeiter
  - [ ] Umfrage-Formular zum Ausfüllen
  - [ ] Ergebnisvisualisierung mit Grafiken
  - [ ] Export-Funktionen für Ergebnisse

### 7. Urlaubsantrag-System

Das Urlaubsantrag-System ermöglicht die digitale Beantragung und Verwaltung von Urlauben.

#### Zu implementierende Komponenten:

- [ ] **Datenmodell**
  - [ ] `vacation_balance`-Tabelle: id, user_id, year, total_days, used_days, pending_days
  - [ ] `vacation_request`-Tabelle: id, user_id, start_date, end_date, days_count, type, reason, status, requested_at, approved_by, approved_at, notes

- [ ] **API-Endpunkte**
  - [ ] `GET /api/vacation/balance` - Urlaubskonto abrufen
  - [ ] `GET /api/vacation/requests` - Urlaubsanträge abrufen
  - [ ] `POST /api/vacation/requests` - Urlaubsantrag stellen
  - [ ] `PUT /api/vacation/requests/:id/approve` - Urlaubsantrag genehmigen
  - [ ] `PUT /api/vacation/requests/:id/reject` - Urlaubsantrag ablehnen
  - [ ] `GET /api/vacation/calendar` - Urlaubskalender abrufen

- [ ] **Frontend**
  - [ ] Urlaubsantrag-Formular für Mitarbeiter
  - [ ] Übersicht über eigene Anträge
  - [ ] Genehmigungsinterface für Vorgesetzte
  - [ ] Urlaubskalender mit Teamansicht
  - [ ] Dashboard-Widget für Urlaubskonto

### 8. KVP-System (Kontinuierlicher Verbesserungsprozess)

Das KVP-System ermöglicht das Einreichen, Verfolgen und Bewerten von Verbesserungsvorschlägen.

#### Zu implementierende Komponenten:

- [ ] **Datenmodell**
  - [ ] `kvp_suggestion`-Tabelle: id, tenant_id, submitter_id, title, description, current_state, proposed_solution, expected_benefit, created_at, status, area_id
  - [ ] `kvp_comment`-Tabelle: id, suggestion_id, user_id, content, created_at
  - [ ] `kvp_attachment`-Tabelle: id, suggestion_id, file_name, file_content, uploaded_at, uploader_id
  - [ ] `kvp_rating`-Tabelle: id, suggestion_id, rater_id, rating, comment, rated_at

- [ ] **API-Endpunkte**
  - [ ] `GET /api/kvp/suggestions` - Verbesserungsvorschläge abrufen
  - [ ] `POST /api/kvp/suggestions` - Vorschlag einreichen
  - [ ] `GET /api/kvp/suggestions/:id` - Vorschlagsdetails abrufen
  - [ ] `PUT /api/kvp/suggestions/:id/status` - Status aktualisieren
  - [ ] `POST /api/kvp/suggestions/:id/comments` - Kommentar hinzufügen
  - [ ] `POST /api/kvp/suggestions/:id/attachments` - Anhang hochladen
  - [ ] `POST /api/kvp/suggestions/:id/rate` - Vorschlag bewerten

- [ ] **Frontend**
  - [ ] Formular zum Einreichen von Vorschlägen
  - [ ] Übersicht eingereicher Vorschläge
  - [ ] Detailansicht mit Kommentaren und Anhängen
  - [ ] Bewertungsinterface für Entscheider
  - [ ] Statistik-Dashboard für KVP-Aktivitäten

## Priorität 3: Zusätzliche Features

### 9. Mobile PWA (Progressive Web App)

- [ ] Service Worker für Offline-Funktionalität
- [ ] Push-Notifications
- [ ] App-Icon und Manifest
- [ ] Installation auf Mobilgeräten
- [ ] Offline-Synchronisation

### 10. Mehrsprachige Unterstützung

- [ ] Grundlegende Mehrsprachigkeit (DE, EN)
- [ ] Erweiterung um weitere Sprachen (PL, TR)
- [ ] Sprachauswahl im Benutzerprofil
- [ ] Automatische Spracherkennung
- [ ] Übersetzungsmanagement-System

### 11. Stripe Integration

- [ ] Automatische Abrechnung
- [ ] Webhook Handler
- [ ] Automatische Feature-Aktivierung nach Zahlung
- [ ] Payment Routes erstellen
- [ ] Kundenverwaltung

### 12. Digitales Handbuch/Wiki

- [ ] Maschinen- und Prozessdokumentation
- [ ] Suchbare Anleitungen mit Bildern/Videos
- [ ] QR-Code-Zugriff auf Betriebshandbücher
- [ ] Versionierung von Dokumentationen
- [ ] Offline-Verfügbarkeit kritischer Anleitungen

### 13. Sicherheit & Datenschutz

- [ ] End-to-End-Verschlüsselung für Dokumente
- [ ] 2-Faktor-Authentifizierung
- [ ] DSGVO-konforme Datenverarbeitung
- [ ] Automatisches Löschen alter Dokumente
- [ ] Zugriffskontrolle mit detaillierten Rechten

## Status und Nächste Schritte

### Aktueller Fokus (Q1 2025)

Die folgenden Features werden aktiv entwickelt:

1. **Blackboard-System** (Branch: feature/blackboard)
2. **Firmenkalender** (Branch: feature/calendar)
3. **Chat-Funktion** (Branch: feature/chat)
4. **Schichtplanungs-Tool** (Branch: feature/shift-planning)

### Entwicklungsplan

- **Sofort**: Blackboard- und Kalender-System implementieren
- **Diese Woche**: Chat-Funktion entwickeln
- **Nächste Woche**: Schichtplanungs-Tool konzipieren
- **Dieser Monat**: TPM-Kalender und Umfrage-System
- **Dieses Quartal**: Erste Version des KVP-Systems

### Bereits abgeschlossene Features

- ✅ Multi-Tenant-Architektur
- ✅ Feature-Management-System
- ✅ Benutzerverwaltung (Root, Admin, Mitarbeiter)
- ✅ Dokumenten-Upload und -Download
- ✅ E-Mail-Benachrichtigungssystem
- ✅ Admin Dashboard Redesign
- ✅ Department-Management
- ✅ Token-Debugging-System
- ✅ Authentifizierungsverbesserungen