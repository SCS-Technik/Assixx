/**
 * employee-deletion.js
 * Erweiterte Funktionen für die Mitarbeiter-Löschung im Admin-Dashboard.
 * Bietet Optionen zum Archivieren oder vollständigem Löschen von Mitarbeitern,
 * inklusive der Verarbeitung von verknüpften Dokumenten und anderen Daten.
 */

// Variablen für den aktuellen Mitarbeiter und dessen Dokumente
let selectedEmployeeId = null;
let selectedEmployeeName = '';
let documentCount = 0;

/**
 * Zeigt das Mitarbeiter-Löschdialog an mit optionalen Archivierungsoptionen
 * @param {number} employeeId - Die ID des zu löschenden Mitarbeiters
 */
function showDeleteEmployeeDialog(employeeId) {
  selectedEmployeeId = employeeId;
  
  // Token abrufen
  const token = localStorage.getItem('token');
  
  // Mitarbeiter-Informationen abrufen für Anzeige im Dialog
  fetch(`/admin/employees/${employeeId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Mitarbeiter konnte nicht abgerufen werden');
    }
    return response.json();
  })
  .then(employee => {
    selectedEmployeeName = `${employee.first_name} ${employee.last_name}`;
    
    // Prüfen, ob der Mitarbeiter Dokumente hat
    return fetch(`/documents?user_id=${employeeId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Dokumente konnten nicht abgerufen werden');
    }
    return response.json();
  })
  .then(documents => {
    documentCount = documents.length;
    
    // Dialog-Inhalt zusammenstellen basierend auf den Dokumenten
    let dialogContent = `
      <div class="modal" id="delete-employee-modal" style="display: flex;">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">Mitarbeiter löschen: ${selectedEmployeeName}</h3>
            <button class="modal-close" onclick="hideModal('delete-employee-modal')">&times;</button>
          </div>
          <div class="modal-body">
            <p><strong>Möchten Sie den Mitarbeiter "${selectedEmployeeName}" wirklich löschen?</strong></p>`;
    
    // Warnung, wenn Dokumente vorhanden sind
    if (documentCount > 0) {
      dialogContent += `
            <div class="alert alert-warning">
              <p><i class="fas fa-exclamation-triangle"></i> <strong>Achtung:</strong> Dieser Mitarbeiter hat ${documentCount} Dokument${documentCount === 1 ? '' : 'e'} zugeordnet.</p>
              <p>Bitte wählen Sie, wie mit diesen Dokumenten verfahren werden soll:</p>
            </div>
            
            <div class="form-group">
              <label class="form-label">
                <input type="radio" name="deletion-option" value="archive" checked>
                Archivieren <small>(Empfohlen)</small>
              </label>
              <p class="option-description">
                Der Mitarbeiter wird als "archiviert" markiert und seine Dokumente werden beibehalten. Er erscheint nicht mehr in der
                regulären Mitarbeiterliste, aber Sie können bei Bedarf auf seine Daten zugreifen.
              </p>
            </div>
            
            <div class="form-group">
              <label class="form-label">
                <input type="radio" name="deletion-option" value="delete">
                Endgültig löschen
              </label>
              <p class="option-description">
                <strong>WARNUNG:</strong> Der Mitarbeiter und alle zugehörigen Dokumente werden dauerhaft gelöscht.
                Diese Aktion kann <strong>nicht</strong> rückgängig gemacht werden.
              </p>
            </div>`;
    } else {
      dialogContent += `
            <p>Für diesen Mitarbeiter sind keine Dokumente vorhanden. Der Mitarbeiter kann gefahrlos gelöscht werden.</p>
            
            <div class="form-group">
              <label class="form-label">
                <input type="radio" name="deletion-option" value="archive">
                Archivieren
              </label>
              <p class="option-description">
                Der Mitarbeiter wird als "archiviert" markiert. Er erscheint nicht mehr in der
                regulären Mitarbeiterliste, aber Sie können ihn später bei Bedarf wiederherstellen.
              </p>
            </div>
            
            <div class="form-group">
              <label class="form-label">
                <input type="radio" name="deletion-option" value="delete" checked>
                Löschen
              </label>
              <p class="option-description">
                Der Mitarbeiter wird aus der Datenbank entfernt.
              </p>
            </div>`;
    }
    
    dialogContent += `
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" onclick="processEmployeeDeletion()">Bestätigen</button>
            <button type="button" class="btn btn-secondary" onclick="hideModal('delete-employee-modal')">Abbrechen</button>
          </div>
        </div>
      </div>
    `;
    
    // Dialog zur Seite hinzufügen und anzeigen
    document.body.insertAdjacentHTML('beforeend', dialogContent);
  })
  .catch(error => {
    console.error('Fehler bei der Anzeige des Lösch-Dialogs:', error);
    alert(`Fehler: ${error.message}`);
  });
}

/**
 * Verarbeitet die Mitarbeiter-Löschung basierend auf der gewählten Option
 */
function processEmployeeDeletion() {
  // Gewählte Option ermitteln
  const options = document.getElementsByName('deletion-option');
  let selectedOption = '';
  
  for (const option of options) {
    if (option.checked) {
      selectedOption = option.value;
      break;
    }
  }
  
  // Token abrufen
  const token = localStorage.getItem('token');
  
  // Basierend auf der gewählten Option unterschiedliche Aktionen ausführen
  if (selectedOption === 'archive') {
    // Mitarbeiter archivieren
    fetch(`/admin/archive-employee/${selectedEmployeeId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({}) // Leerer Körper, da keine Daten benötigt werden
    })
    .then(response => response.json())
    .then(result => {
      if (result.success) {
        // Erfolgsmeldung anzeigen
        alert(`Mitarbeiter "${selectedEmployeeName}" wurde erfolgreich archiviert.`);
        
        // Dialog schließen und Mitarbeiterliste aktualisieren
        hideModal('delete-employee-modal');
        
        // Mitarbeiterliste aktualisieren
        if (typeof loadEmployeesTable === 'function') {
          loadEmployeesTable('reload');
        }
        
        // Dashboard-Statistiken aktualisieren
        if (typeof loadDashboardStats === 'function') {
          loadDashboardStats();
        }
      } else {
        alert(`Fehler: ${result.message || 'Unbekannter Fehler beim Archivieren des Mitarbeiters'}`);
      }
    })
    .catch(error => {
      console.error('Fehler beim Archivieren des Mitarbeiters:', error);
      alert(`Fehler: ${error.message}`);
    });
  } else if (selectedOption === 'delete') {
    // Zusätzliche Bestätigung einholen, wenn Dokumente vorhanden sind
    if (documentCount > 0) {
      const confirmDelete = confirm(
        `WARNUNG: ENDGÜLTIGES LÖSCHEN!\n\n` +
        `Sie sind dabei, den Mitarbeiter "${selectedEmployeeName}" und alle zugehörigen ${documentCount} Dokumente endgültig zu löschen!\n\n` +
        `Diese Aktion kann NICHT rückgängig gemacht werden!\n\n` +
        `Sind Sie absolut sicher, dass Sie fortfahren möchten?`
      );
      
      if (!confirmDelete) {
        return; // Abbrechen, wenn der Benutzer nicht bestätigt
      }
      
      // Force-Delete verwenden, um Mitarbeiter mit Dokumenten zu löschen
      fetch(`/admin/delete-employee/${selectedEmployeeId}/force`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => response.json())
      .then(result => {
        if (result.success) {
          alert(`Mitarbeiter "${selectedEmployeeName}" und alle zugehörigen Dokumente wurden endgültig gelöscht.`);
          hideModal('delete-employee-modal');
          
          // Mitarbeiterliste aktualisieren
          if (typeof loadEmployeesTable === 'function') {
            loadEmployeesTable('reload');
          }
          
          // Dashboard-Statistiken aktualisieren
          if (typeof loadDashboardStats === 'function') {
            loadDashboardStats();
          }
        } else {
          alert(`Fehler: ${result.message || 'Unbekannter Fehler beim Löschen des Mitarbeiters'}`);
        }
      })
      .catch(error => {
        console.error('Fehler beim endgültigen Löschen des Mitarbeiters:', error);
        alert(`Fehler: ${error.message}`);
      });
    } else {
      // Normales Löschen ohne Dokumente
      fetch(`/admin/delete-employee/${selectedEmployeeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => response.json())
      .then(result => {
        if (result.success) {
          alert(`Mitarbeiter "${selectedEmployeeName}" wurde erfolgreich gelöscht.`);
          hideModal('delete-employee-modal');
          
          // Mitarbeiterliste aktualisieren
          if (typeof loadEmployeesTable === 'function') {
            loadEmployeesTable('reload');
          }
          
          // Dashboard-Statistiken aktualisieren
          if (typeof loadDashboardStats === 'function') {
            loadDashboardStats();
          }
        } else {
          alert(`Fehler: ${result.message || 'Unbekannter Fehler beim Löschen des Mitarbeiters'}`);
        }
      })
      .catch(error => {
        console.error('Fehler beim Löschen des Mitarbeiters:', error);
        alert(`Fehler: ${error.message}`);
      });
    }
  }
}

/**
 * Überschreibt die ursprüngliche deleteEmployee-Funktion mit der verbesserten Version
 */
function deleteEmployee(employeeId) {
  showDeleteEmployeeDialog(employeeId);
}

// Dokumentation für die Verwendung in admin-dashboard.js
// Um diese Funktionalität einzubinden, fügen Sie folgende Zeile ein:
// <script src="js/employee-deletion.js"></script>