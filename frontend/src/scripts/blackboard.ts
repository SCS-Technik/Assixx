/* eslint-disable indent */
/**
 * Blackboard System
 * Client-side TypeScript for the blackboard feature
 */

import type { User } from '../types/api.types';
import { getAuthToken, showSuccess, showError } from './auth';
import { closeModal as dashboardCloseModal } from './dashboard-scripts';

interface BlackboardEntry {
  id: number;
  title: string;
  content: string;
  priority_level: 'low' | 'medium' | 'high' | 'critical';
  org_level: 'all' | 'department' | 'team';
  org_id?: number;
  department_id?: number;
  team_id?: number;
  color: string;
  created_by: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
  tags?: string[];
  attachment_count?: number;
}

interface BlackboardAttachment {
  id: number;
  entry_id: number;
  filename: string;
  original_name: string;
  file_size: number;
  mime_type: string;
  uploaded_by: number;
  uploaded_at: string;
  uploader_name?: string;
}

interface Department {
  id: number;
  name: string;
}

interface Team {
  id: number;
  name: string;
  department_id: number;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalEntries: number;
  entriesPerPage: number;
}

interface BlackboardResponse {
  entries: BlackboardEntry[];
  pagination: PaginationInfo;
}

interface UserData extends User {
  departmentId?: number;
  department_id?: number;
  teamId?: number;
  team_id?: number;
}

// Global variables
let currentPage: number = 1;
let currentFilter: string = 'all';
let currentSearch: string = '';
let currentSort: string = 'created_at|DESC';
let departments: Department[] = [];
let teams: Team[] = [];
let isAdmin: boolean = false;
let currentUserId: number | null = null;
let selectedFiles: File[] = [];
let uploadedAttachments: BlackboardAttachment[] = [];

// Modal helper functions to handle different implementations
function openModal(modalId: string): void {
  const modal = document.getElementById(modalId) as HTMLElement;
  if (!modal) return;

  // Check if it's the new modal style (class="modal")
  if (modal.classList.contains('modal') && typeof window.showModal === 'function') {
    window.showModal(modalId);
  } 
  // Check if it's the old modal style (class="modal-overlay")
  else if (modal.classList.contains('modal-overlay')) {
    // Use the original dashboard modal behavior
    modal.style.display = 'flex'; // Add display flex for modal-overlay
    modal.style.opacity = '1';
    modal.style.visibility = 'visible';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  // Try DashboardUI if available
  else if (typeof window.DashboardUI?.openModal === 'function') {
    window.DashboardUI.openModal(modalId);
  } 
  // Fallback implementation
  else {
    modal.style.display = 'flex';
    setTimeout(() => {
      modal.classList.add('active');
    }, 10);
  }
}

function closeModal(modalId: string): void {
  const modal = document.getElementById(modalId) as HTMLElement;
  if (!modal) return;

  // Check if it's the new modal style (class="modal")
  if (modal.classList.contains('modal') && typeof window.hideModal === 'function') {
    window.hideModal(modalId);
  } 
  // Check if it's the old modal style (class="modal-overlay")
  else if (modal.classList.contains('modal-overlay')) {
    // Use the original dashboard modal behavior
    modal.style.opacity = '0';
    modal.style.visibility = 'hidden';
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
  // Try DashboardUI if available
  else if (typeof window.DashboardUI?.closeModal === 'function') {
    window.DashboardUI.closeModal(modalId);
  } 
  // Use imported function as fallback
  else {
    dashboardCloseModal(modalId);
  }
}

// Initialize when document is ready
// Globale Variable, um zu verhindern, dass Endlosanfragen gesendet werden
let entriesLoadingEnabled: boolean = false;

document.addEventListener('DOMContentLoaded', () => {
  // Aktiviere das automatische Laden der Einträge
  entriesLoadingEnabled = true;

  // Alle Schließen-Buttons einrichten
  setupCloseButtons();
  
  // Check if previewAttachment is available
  console.log('[Blackboard] Checking window.previewAttachment:', typeof window.previewAttachment);
  if (typeof window.previewAttachment !== 'function') {
    console.error('[Blackboard] previewAttachment function not found in window!');
  }

  // Check if user is logged in
  checkLoggedIn()
    .then(() => {
      // Load user data
      fetchUserData()
        .then((userData: UserData) => {
          currentUserId = userData.id;
          isAdmin = userData.role === 'admin' || userData.role === 'root';

          // Show/hide "New Entry" button based on permissions
          const newEntryBtn = document.getElementById('newEntryBtn') as HTMLButtonElement;
          if (newEntryBtn) {
            newEntryBtn.style.display = isAdmin ? 'block' : 'none';
          }

          // Load departments and teams for form dropdowns
          loadDepartmentsAndTeams();

          // Check if we have an entry parameter in the URL
          const urlParams = new URLSearchParams(window.location.search);
          const entryId = urlParams.get('entry');
          
          if (entryId) {
            // If we have an entry ID, load all entries and scroll to the specific one
            entriesLoadingEnabled = true;
            loadEntries().then(() => {
              // Scroll to the specific entry after loading
              const entryElement = document.querySelector(`[data-entry-id="${entryId}"]`);
              if (entryElement) {
                entryElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Add a highlight effect
                entryElement.classList.add('highlight-entry');
                setTimeout(() => {
                  entryElement.classList.remove('highlight-entry');
                }, 3000);
              }
            });
          }

          // Wir laden die Einträge erst wenn der Button geklickt wird
          const loadEntriesBtn = document.getElementById('loadEntriesBtn') as HTMLButtonElement;
          if (loadEntriesBtn) {
            loadEntriesBtn.addEventListener('click', () => {
              entriesLoadingEnabled = true; // Erlaube das Laden nur nach Klick
              loadEntries();
            });
          }

          // Retry-Button Ereignisbehandlung
          const retryLoadBtn = document.getElementById('retryLoadBtn') as HTMLButtonElement;
          if (retryLoadBtn) {
            retryLoadBtn.addEventListener('click', () => {
              entriesLoadingEnabled = true; // Erlaube das Laden nur nach Klick
              loadEntries();
            });
          }
        })
        .catch((error) => {
          console.error('Error loading user data:', error);
          window.location.href = '/pages/login.html';
        });

      // Setup event listeners
      setupEventListeners();
    })
    .catch((error) => {
      console.error('Error checking login:', error);
      window.location.href = '/pages/login.html';
    });
});

/**
 * Setup close buttons for all modals
 */
function setupCloseButtons(): void {
  // Füge Event-Listener zu allen Elementen mit data-action="close" hinzu
  document.querySelectorAll<HTMLElement>('[data-action="close"]').forEach((button) => {
    button.addEventListener('click', function (this: HTMLElement) {
      // Finde das übergeordnete Modal (both modal-overlay and modal classes)
      const modal = this.closest('.modal-overlay, .modal') as HTMLElement;
      if (modal) {
        closeModal(modal.id);
      } else {
        console.error('No parent modal found for close button');
      }
    });
  });

  // Schließen beim Klicken außerhalb des Modal-Inhalts
  document.querySelectorAll<HTMLElement>('.modal-overlay, .modal').forEach((modal) => {
    modal.addEventListener('click', (event: MouseEvent) => {
      // Nur schließen, wenn der Klick auf den Modal-Hintergrund erfolgt (nicht auf den Inhalt)
      if (event.target === modal) {
        closeModal(modal.id);
      }
    });
  });
}

/**
 * Setup all event listeners
 */
function setupEventListeners(): void {
  // Filter by level using pill buttons
  document.querySelectorAll<HTMLElement>('.filter-pill[data-value]').forEach((button) => {
    button.addEventListener('click', function (this: HTMLElement) {
      // Remove active class from all pills
      document.querySelectorAll('.filter-pill').forEach((pill) => pill.classList.remove('active'));
      // Add active class to clicked pill
      this.classList.add('active');

      currentFilter = this.dataset.value || 'all';
      currentPage = 1;

      // Nur laden, wenn es aktiviert wurde
      if (entriesLoadingEnabled) {
        loadEntries();
      }
    });
  });

  // Sort entries
  const sortFilter = document.getElementById('sortFilter') as HTMLSelectElement;
  if (sortFilter) {
    sortFilter.addEventListener('change', function (this: HTMLSelectElement) {
      currentSort = this.value;

      // Nur laden, wenn es aktiviert wurde
      if (entriesLoadingEnabled) {
        loadEntries();
      }
    });
  } else {
    console.error('Sort filter not found');
  }

  // Search button
  const searchButton = document.getElementById('searchButton') as HTMLButtonElement;
  const searchInput = document.getElementById('searchInput') as HTMLInputElement;

  if (searchButton && searchInput) {
    searchButton.addEventListener('click', () => {
      currentSearch = searchInput.value.trim();
      currentPage = 1;

      // Nur laden, wenn es aktiviert wurde
      if (entriesLoadingEnabled) {
        loadEntries();
      }
    });

    searchInput.addEventListener('keypress', function (this: HTMLInputElement, e: KeyboardEvent) {
      if (e.key === 'Enter') {
        currentSearch = this.value.trim();
        currentPage = 1;

        // Nur laden, wenn es aktiviert wurde
        if (entriesLoadingEnabled) {
          loadEntries();
        }
      }
    });
  } else {
    console.error('Search elements not found');
  }

  // New entry button
  const newEntryBtn = document.getElementById('newEntryBtn') as HTMLButtonElement;
  if (newEntryBtn) {
    newEntryBtn.addEventListener('click', () => {
      openEntryForm();
    });
  } else {
    console.error('New entry button not found');
  }

  // Save entry button
  const saveEntryBtn = document.getElementById('saveEntryBtn') as HTMLButtonElement;
  if (saveEntryBtn) {
    saveEntryBtn.addEventListener('click', () => {
      saveEntry();
    });
  } else {
    console.error('Save entry button not found');
  }

  // Organization level change
  const entryOrgLevel = document.getElementById('entryOrgLevel') as HTMLSelectElement;
  if (entryOrgLevel) {
    entryOrgLevel.addEventListener('change', function (this: HTMLSelectElement) {
      updateOrgIdDropdown(this.value);
    });
  } else {
    console.error('Organization level dropdown not found');
  }

  // Color selection
  document.querySelectorAll<HTMLElement>('.color-option').forEach((button) => {
    button.addEventListener('click', function (this: HTMLElement) {
      // Remove active class from all color options
      document.querySelectorAll('.color-option').forEach((option) => option.classList.remove('active'));
      // Add active class to clicked option
      this.classList.add('active');
    });
  });

  // File upload handling
  setupFileUploadHandlers();
}

/**
 * Setup file upload handlers for attachments
 */
function setupFileUploadHandlers(): void {
  const dropZone = document.getElementById('attachmentDropZone') as HTMLDivElement;
  const fileInput = document.getElementById('attachmentInput') as HTMLInputElement;

  if (!dropZone || !fileInput) return;

  // Click to upload
  dropZone.addEventListener('click', () => {
    fileInput.click();
  });

  // File input change
  fileInput.addEventListener('change', (event) => {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      handleFileSelection(Array.from(target.files));
    }
  });

  // Drag and drop
  dropZone.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropZone.classList.add('drag-over');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
  });

  dropZone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropZone.classList.remove('drag-over');
    
    if (event.dataTransfer?.files) {
      handleFileSelection(Array.from(event.dataTransfer.files));
    }
  });
}

/**
 * Handle file selection for attachments
 */
function handleFileSelection(files: File[]): void {
  const maxFiles = 5;
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

  // Filter valid files
  const validFiles = files.filter(file => {
    if (!allowedTypes.includes(file.type)) {
      showError(`Dateiformat nicht unterstützt: ${file.name}`);
      return false;
    }
    if (file.size > maxSize) {
      showError(`Datei zu groß (max 10MB): ${file.name}`);
      return false;
    }
    return true;
  });

  // Check total file count
  if (selectedFiles.length + validFiles.length > maxFiles) {
    showError(`Maximal ${maxFiles} Dateien erlaubt`);
    return;
  }

  // Add to selected files
  selectedFiles = [...selectedFiles, ...validFiles];
  
  // Update preview
  updateAttachmentPreview();
}

/**
 * Update attachment preview display
 */
function updateAttachmentPreview(): void {
  const preview = document.getElementById('attachmentPreview') as HTMLDivElement;
  const list = document.getElementById('attachmentList') as HTMLDivElement;

  if (!preview || !list) return;

  if (selectedFiles.length === 0) {
    preview.style.display = 'none';
    return;
  }

  preview.style.display = 'block';
  list.innerHTML = '';

  selectedFiles.forEach((file, index) => {
    const item = document.createElement('div');
    item.className = 'attachment-item';
    
    const icon = file.type === 'application/pdf' ? 'fa-file-pdf pdf' : 'fa-file-image image';
    const size = formatFileSize(file.size);
    
    item.innerHTML = `
      <div class="attachment-info">
        <i class="fas ${icon} attachment-icon"></i>
        <div class="attachment-details">
          <div class="attachment-name">${escapeHtml(file.name)}</div>
          <div class="attachment-size">${size}</div>
        </div>
      </div>
      <button type="button" class="attachment-remove" onclick="removeAttachment(${index})">
        <i class="fas fa-times"></i> Entfernen
      </button>
    `;
    
    list.appendChild(item);
  });
}

/**
 * Remove attachment from selection
 */
function removeAttachment(index: number): void {
  selectedFiles.splice(index, 1);
  updateAttachmentPreview();
  
  // Reset file input
  const fileInput = document.getElementById('attachmentInput') as HTMLInputElement;
  if (fileInput) {
    fileInput.value = '';
  }
}

/**
 * Format file size for display
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Load blackboard entries
 */
async function loadEntries(): Promise<void> {
  // Wenn das Laden nicht aktiviert wurde (durch Klick auf den Button), dann abbrechen
  if (!entriesLoadingEnabled) {
    return;
  }

  try {
    // Verstecke die Lade-Button-Karte
    const loadEntriesCard = document.getElementById('loadEntriesCard') as HTMLElement;
    if (loadEntriesCard) loadEntriesCard.classList.add('d-none');

    // Zeige den Ladeindikator
    const loadingIndicator = document.getElementById('loadingIndicator') as HTMLElement;
    if (loadingIndicator) loadingIndicator.classList.remove('d-none');

    // Verstecke vorherige Ergebnisse oder Fehlermeldungen
    const blackboardEntries = document.getElementById('blackboardEntries') as HTMLElement;
    if (blackboardEntries) blackboardEntries.classList.add('d-none');

    const noEntriesMessage = document.getElementById('noEntriesMessage') as HTMLElement;
    if (noEntriesMessage) noEntriesMessage.classList.add('d-none');

    // Parse sort option
    const [sortBy, sortDir] = currentSort.split('|');

    // Get token from localStorage
    const token = getAuthToken();
    if (!token) {
      window.location.href = '/pages/login.html';
      throw new Error('No token found');
    }

    // Fetch entries with authentication token
    const response = await fetch(
      `/api/blackboard?page=${currentPage}&filter=${currentFilter}&search=${encodeURIComponent(currentSearch)}&sortBy=${sortBy}&sortDir=${sortDir}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      if (response.status === 401) {
        // Redirect to login if unauthorized
        window.location.href = '/pages/login.html';
        throw new Error('Unauthorized');
      }
      throw new Error('Failed to load entries');
    }

    const data: BlackboardResponse = await response.json();

    // Update pagination
    updatePagination(data.pagination);

    // Display entries
    displayEntries(data.entries);

    // Erfolgreiche Anfrage - deaktiviere weitere automatische API-Aufrufe
    entriesLoadingEnabled = false;
  } catch (error) {
    console.error('Error loading entries:', error);
    showError('Fehler beim Laden der Einträge.');

    // Bei einem Fehler, zeige die "Keine Einträge" Nachricht mit Wiederholungs-Button
    const noEntriesMessage = document.getElementById('noEntriesMessage') as HTMLElement;
    if (noEntriesMessage) {
      noEntriesMessage.classList.remove('d-none');
    }

    // Zeige die Lade-Button-Karte wieder an
    const loadEntriesCard = document.getElementById('loadEntriesCard') as HTMLElement;
    if (loadEntriesCard) loadEntriesCard.classList.remove('d-none');
  } finally {
    // Verstecke den Ladeindikator
    const loadingIndicator = document.getElementById('loadingIndicator') as HTMLElement;
    if (loadingIndicator) loadingIndicator.classList.add('d-none');
  }
}

/**
 * Check if user is logged in
 */
async function checkLoggedIn(): Promise<void> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  // Verify token is valid
  const response = await fetch('/api/user/profile', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Invalid token');
  }
}

/**
 * Fetch user data
 */
async function fetchUserData(): Promise<UserData> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch('/api/user/profile', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user data');
  }

  return response.json();
}

/**
 * Load departments and teams
 */
async function loadDepartmentsAndTeams(): Promise<void> {
  const token = getAuthToken();
  if (!token) return;

  try {
    // Load departments
    const deptResponse = await fetch('/api/departments', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (deptResponse.ok) {
      departments = await deptResponse.json();
    }

    // Load teams
    const teamResponse = await fetch('/api/teams', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (teamResponse.ok) {
      teams = await teamResponse.json();
    }
  } catch (error) {
    console.error('Error loading departments and teams:', error);
  }
}

/**
 * Display blackboard entries
 */
function displayEntries(entries: BlackboardEntry[]): void {
  const container = document.getElementById('blackboardEntries') as HTMLElement;
  if (!container) return;

  container.innerHTML = '';
  container.classList.remove('d-none');

  if (entries.length === 0) {
    const noEntriesMessage = document.getElementById('noEntriesMessage') as HTMLElement;
    if (noEntriesMessage) {
      noEntriesMessage.classList.remove('d-none');
    }
    return;
  }

  entries.forEach((entry) => {
    const entryCard = createEntryCard(entry);
    container.appendChild(entryCard);
  });
}

/**
 * Create entry card element with pinboard style
 */
function createEntryCard(entry: BlackboardEntry): HTMLElement {
  const container = document.createElement('div');
  container.className = 'pinboard-item';
  
  // Randomly assign rotation class
  const rotations = ['rotate-1', 'rotate-2', 'rotate-3', 'rotate-n1', 'rotate-n2', 'rotate-n3'];
  const randomRotation = rotations[Math.floor(Math.random() * rotations.length)];
  
  // Randomly select pushpin style
  const pushpinStyles = ['pushpin-red', 'pushpin-blue', 'pushpin-yellow', 'pushpin-metal'];
  const randomPushpin = pushpinStyles[Math.floor(Math.random() * pushpinStyles.length)];
  
  // Determine card type based on priority or content
  let cardClass = 'pinboard-sticky';
  let cardColor = entry.color || 'yellow';
  
  // High priority items get info box style
  if (entry.priority_level === 'high' || entry.priority_level === 'critical') {
    cardClass = 'pinboard-info';
  }
  // Longer content gets note style
  else if (entry.content.length > 200) {
    cardClass = 'pinboard-note';
  }
  
  const canEdit = isAdmin || entry.created_by === currentUserId;
  const priorityIcon = getPriorityIcon(entry.priority_level);
  
  container.innerHTML = `
    <div class="${cardClass} ${cardClass === 'pinboard-sticky' ? `color-${cardColor}` : ''} ${randomRotation}" data-entry-id="${entry.id}" onclick="viewEntry(${entry.id})" style="cursor: pointer;">
      <div class="pushpin ${randomPushpin}"></div>
      
      <h4 style="margin: 0 0 10px 0; font-weight: 600; color: #1a1a1a;">
        ${priorityIcon} ${escapeHtml(entry.title)}
      </h4>
      
      <div style="color: #333; font-size: 14px; line-height: 1.5; margin-bottom: 15px;">
        ${escapeHtml(entry.content).substring(0, 150).replace(/\n/g, '<br>')}${entry.content.length > 150 ? '...' : ''}
      </div>
      
      ${entry.attachment_count && entry.attachment_count > 0 ? `
        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(0,0,0,0.1);">
          <i class="fas fa-paperclip" style="color: #666;"></i>
          <span style="color: #666; font-size: 12px;">${entry.attachment_count} Anhang${entry.attachment_count > 1 ? 'änge' : ''}</span>
        </div>
      ` : ''}
      
      <div style="font-size: 12px; color: #666; display: flex; justify-content: space-between; align-items: center;">
        <span>
          <i class="fas fa-user" style="opacity: 0.6;"></i> ${escapeHtml(entry.created_by_name || 'Unknown')}
        </span>
        <span>
          ${formatDate(entry.created_at)}
        </span>
      </div>
      
      ${canEdit ? `
        <div class="entry-actions" style="position: absolute; top: 10px; right: 10px; opacity: 0; transition: opacity 0.2s;">
          <button class="btn btn-sm btn-link p-1" onclick="event.stopPropagation(); editEntry(${entry.id})" title="Bearbeiten">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-link p-1 text-danger" onclick="event.stopPropagation(); deleteEntry(${entry.id})" title="Löschen">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      ` : ''}
    </div>
  `;
  
  // Show actions on hover
  if (canEdit) {
    const card = container.querySelector(`.${cardClass}`) as HTMLElement;
    card.addEventListener('mouseenter', () => {
      const actions = card.querySelector('.entry-actions') as HTMLElement;
      if (actions) actions.style.opacity = '1';
    });
    card.addEventListener('mouseleave', () => {
      const actions = card.querySelector('.entry-actions') as HTMLElement;
      if (actions) actions.style.opacity = '0';
    });
  }
  
  return container;
}

/**
 * Get priority icon
 */
function getPriorityIcon(priority: string): string {
  const icons: Record<string, string> = {
    low: '<i class="fas fa-circle" style="color: #4caf50; font-size: 10px;"></i>',
    medium: '<i class="fas fa-circle" style="color: #2196f3; font-size: 10px;"></i>',
    high: '<i class="fas fa-exclamation-circle" style="color: #ff9800; font-size: 12px;"></i>',
    critical: '<i class="fas fa-exclamation-triangle" style="color: #f44336; font-size: 12px;"></i>'
  };
  return icons[priority] || icons.medium;
}

/**
 * Update pagination UI
 */
function updatePagination(pagination: PaginationInfo): void {
  const paginationContainer = document.getElementById('pagination') as HTMLElement;
  if (!paginationContainer) return;

  paginationContainer.innerHTML = '';

  if (pagination.totalPages <= 1) return;

  // Previous button
  if (currentPage > 1) {
    const prevBtn = document.createElement('button');
    prevBtn.className = 'btn btn-sm btn-secondary';
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.onclick = () => changePage(currentPage - 1);
    paginationContainer.appendChild(prevBtn);
  }

  // Page numbers
  for (let i = 1; i <= pagination.totalPages; i++) {
    if (i === 1 || i === pagination.totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
      const pageBtn = document.createElement('button');
      pageBtn.className = `btn btn-sm ${i === currentPage ? 'btn-primary' : 'btn-secondary'}`;
      pageBtn.textContent = i.toString();
      pageBtn.onclick = () => changePage(i);
      paginationContainer.appendChild(pageBtn);
    } else if (i === currentPage - 3 || i === currentPage + 3) {
      const dots = document.createElement('span');
      dots.textContent = '...';
      dots.className = 'pagination-dots';
      paginationContainer.appendChild(dots);
    }
  }

  // Next button
  if (currentPage < pagination.totalPages) {
    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn-sm btn-secondary';
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.onclick = () => changePage(currentPage + 1);
    paginationContainer.appendChild(nextBtn);
  }
}

/**
 * Change page
 */
function changePage(page: number): void {
  currentPage = page;
  entriesLoadingEnabled = true;
  loadEntries();
}

/**
 * Open entry form for creating/editing
 */
function openEntryForm(entryId?: number): void {
  const modal = document.getElementById('entryFormModal') as HTMLElement;
  if (!modal) return;

  // Reset form
  const form = document.getElementById('entryForm') as HTMLFormElement;
  if (form) form.reset();

  // Reset color selection
  document.querySelectorAll('.color-option').forEach((option) => {
    option.classList.remove('active');
  });
  document.querySelector('.color-option[data-color="yellow"]')?.classList.add('active');

  // Reset file selection
  selectedFiles = [];
  updateAttachmentPreview();
  const fileInput = document.getElementById('attachmentInput') as HTMLInputElement;
  if (fileInput) {
    fileInput.value = '';
  }

  if (entryId) {
    // Load entry data for editing
    loadEntryForEdit(entryId);
  } else {
    // New entry - reset org dropdown
    updateOrgIdDropdown('all');
    const entryOrgLevel = document.getElementById('entryOrgLevel') as HTMLSelectElement;
    if (entryOrgLevel) {
      entryOrgLevel.value = 'company';
      updateOrgIdDropdown('company');
    }
  }

  // Show modal using the wrapper function
  openModal('entryFormModal');
}

/**
 * Update organization ID dropdown based on level
 */
function updateOrgIdDropdown(level: string): void {
  const orgIdContainer = document.getElementById('orgIdContainer') as HTMLElement;
  const orgIdSelect = document.getElementById('entryOrgId') as HTMLSelectElement;

  if (!orgIdContainer || !orgIdSelect) return;

  orgIdSelect.innerHTML = '';

  if (level === 'all') {
    orgIdContainer.style.display = 'none';
  } else if (level === 'department') {
    orgIdContainer.style.display = 'block';
    const label = orgIdContainer.querySelector('label');
    if (label) label.textContent = 'Abteilung';

    departments.forEach((dept) => {
      const option = document.createElement('option');
      option.value = dept.id.toString();
      option.textContent = dept.name;
      orgIdSelect.appendChild(option);
    });
  } else if (level === 'team') {
    orgIdContainer.style.display = 'block';
    const label = orgIdContainer.querySelector('label');
    if (label) label.textContent = 'Team';

    teams.forEach((team) => {
      const option = document.createElement('option');
      option.value = team.id.toString();
      option.textContent = team.name;
      orgIdSelect.appendChild(option);
    });
  }
}

/**
 * Save entry
 */
async function saveEntry(): Promise<void> {
  const form = document.getElementById('entryForm') as HTMLFormElement;
  if (!form) return;

  const formData = new FormData(form);
  const token = getAuthToken();
  if (!token) return;

  // Get selected color
  const selectedColor = document.querySelector('.color-option.active') as HTMLElement;
  const color = selectedColor?.dataset.color || '#f8f9fa';

  const entryData = {
    title: formData.get('title') as string,
    content: formData.get('content') as string,
    priority_level: formData.get('priority_level') as string,
    org_level: formData.get('org_level') as string,
    org_id: formData.get('org_level') === 'all' ? null : parseInt(formData.get('org_id') as string),
    color,
  };

  try {
    const entryId = formData.get('entry_id') as string;
    const url = entryId ? `/api/blackboard/${entryId}` : '/api/blackboard';
    const method = entryId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(entryData),
    });

    if (response.ok) {
      const savedEntry = await response.json();
      
      // Upload attachments if any
      if (selectedFiles.length > 0 && !entryId) {
        // Only upload attachments for new entries
        await uploadAttachments(savedEntry.id);
      }
      
      showSuccess(entryId ? 'Eintrag erfolgreich aktualisiert!' : 'Eintrag erfolgreich erstellt!');
      closeModal('entryFormModal');
      
      // Clear selected files
      selectedFiles = [];
      updateAttachmentPreview();
      
      entriesLoadingEnabled = true;
      loadEntries();
    } else {
      const error = await response.json();
      showError(error.message || 'Fehler beim Speichern des Eintrags');
    }
  } catch (error) {
    console.error('Error saving entry:', error);
    showError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
  }
}

/**
 * Load entry for editing
 */
async function loadEntryForEdit(entryId: number): Promise<void> {
  const token = getAuthToken();
  if (!token) return;

  try {
    const response = await fetch(`/api/blackboard/${entryId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const entry: BlackboardEntry = await response.json();

      // Fill form with entry data
      const form = document.getElementById('entryForm') as HTMLFormElement;
      if (!form) return;

      (form.elements.namedItem('entry_id') as HTMLInputElement).value = entry.id.toString();
      (form.elements.namedItem('title') as HTMLInputElement).value = entry.title;
      (form.elements.namedItem('content') as HTMLTextAreaElement).value = entry.content;
      (form.elements.namedItem('priority_level') as HTMLSelectElement).value = entry.priority_level;
      (form.elements.namedItem('org_level') as HTMLSelectElement).value = entry.org_level;

      // Update org dropdown
      updateOrgIdDropdown(entry.org_level);
      if (entry.org_id) {
        (form.elements.namedItem('org_id') as HTMLSelectElement).value = entry.org_id.toString();
      }

      // Select color
      document.querySelectorAll('.color-option').forEach((option) => {
        option.classList.remove('active');
      });
      const colorOption = document.querySelector(`.color-option[data-color="${entry.color}"]`) as HTMLElement;
      if (colorOption) {
        colorOption.classList.add('active');
      }
    } else {
      showError('Fehler beim Laden des Eintrags');
    }
  } catch (error) {
    console.error('Error loading entry:', error);
    showError('Ein Fehler ist aufgetreten');
  }
}

/**
 * Upload attachments for an entry
 */
async function uploadAttachments(entryId: number): Promise<void> {
  if (selectedFiles.length === 0) return;

  const token = getAuthToken();
  if (!token) return;

  const formData = new FormData();
  selectedFiles.forEach(file => {
    formData.append('attachments', file);
  });

  try {
    const response = await fetch(`/api/blackboard/${entryId}/attachments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      showError(error.message || 'Fehler beim Hochladen der Anhänge');
    }
  } catch (error) {
    console.error('Error uploading attachments:', error);
    showError('Fehler beim Hochladen der Anhänge');
  }
}

/**
 * Load attachments for an entry
 */
async function loadAttachments(entryId: number): Promise<BlackboardAttachment[]> {
  const token = getAuthToken();
  if (!token) return [];

  try {
    const response = await fetch(`/api/blackboard/${entryId}/attachments`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Error loading attachments:', error);
  }

  return [];
}

/**
 * Delete entry
 */
async function deleteEntry(entryId: number): Promise<void> {
  // eslint-disable-next-line no-alert
  if (!confirm('Möchten Sie diesen Eintrag wirklich löschen?')) {
    return;
  }

  const token = getAuthToken();
  if (!token) return;

  try {
    const response = await fetch(`/api/blackboard/${entryId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      showSuccess('Eintrag erfolgreich gelöscht!');
      entriesLoadingEnabled = true;
      loadEntries();
    } else {
      const error = await response.json();
      showError(error.message || 'Fehler beim Löschen des Eintrags');
    }
  } catch (error) {
    console.error('Error deleting entry:', error);
    showError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
  }
}

// Utility functions
function getPriorityBadge(priority: string): string {
  const badges: Record<string, string> = {
    low: '<span class="badge badge-success">Niedrig</span>',
    medium: '<span class="badge badge-warning">Mittel</span>',
    high: '<span class="badge badge-danger">Hoch</span>',
    critical: '<span class="badge badge-dark">Kritisch</span>',
  };
  return badges[priority] || '';
}

function getOrgLevelBadge(level: string): string {
  const badges: Record<string, string> = {
    all: '<span class="badge badge-info">Alle</span>',
    department: '<span class="badge badge-primary">Abteilung</span>',
    team: '<span class="badge badge-secondary">Team</span>',
  };
  return badges[level] || '';
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * View entry details
 */
async function viewEntry(entryId: number): Promise<void> {
  console.log(`[Blackboard] viewEntry called for entry ${entryId}`);
  const token = getAuthToken();
  if (!token) return;

  try {
    console.log(`[Blackboard] Fetching entry ${entryId}...`);
    const response = await fetch(`/api/blackboard/${entryId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const entry = await response.json();
      console.log(`[Blackboard] Entry ${entryId} loaded:`, entry);
      
      // Load attachments FIRST
      console.log(`[Blackboard] Loading attachments for entry ${entryId}...`);
      const attachments = await loadAttachments(entryId);
      console.log(`[Blackboard] Attachments loaded:`, attachments);
      
      // Show entry detail modal
      const detailContent = document.getElementById('entryDetailContent') as HTMLElement;
      if (detailContent) {
        const priorityIcon = getPriorityIcon(entry.priority_level);
        const canEdit = isAdmin || entry.created_by === currentUserId;
        
        detailContent.innerHTML = `
          <div class="entry-detail-header">
            <h2>${priorityIcon} ${escapeHtml(entry.title)}</h2>
            <div class="entry-detail-meta">
              <span><i class="fas fa-user"></i> ${escapeHtml(entry.created_by_name || 'Unknown')}</span>
              <span><i class="fas fa-clock"></i> ${formatDate(entry.created_at)}</span>
            </div>
          </div>
          <div class="entry-detail-content">
            ${escapeHtml(entry.content).replace(/\n/g, '<br>')}
          </div>
          ${entry.tags && entry.tags.length > 0 ? `
            <div class="entry-tags">
              ${entry.tags.map(tag => `<span class="badge badge-secondary">${escapeHtml(tag)}</span>`).join(' ')}
            </div>
          ` : ''}
          ${attachments.length > 0 ? `
            <div class="entry-attachments">
              <h4 class="entry-attachments-title">
                <i class="fas fa-paperclip"></i> Anhänge (${attachments.length})
              </h4>
              <div class="entry-attachment-list" id="attachment-list-${entryId}">
                ${attachments.map(att => {
                  const isPDF = att.mime_type === 'application/pdf';
                  const isImage = att.mime_type.startsWith('image/');
                  
                  console.log(`[Blackboard] Rendering attachment:`, att);
                  
                  return `
                    <div class="entry-attachment-item" 
                         data-attachment-id="${att.id}"
                         data-mime-type="${att.mime_type}"
                         data-filename="${escapeHtml(att.original_name)}"
                         style="cursor: pointer;"
                         title="Vorschau: ${escapeHtml(att.original_name)}"
                         onclick="console.log('[Blackboard] Inline onclick fired!', ${att.id}); window.previewAttachment && window.previewAttachment(${att.id}, '${att.mime_type}', '${escapeHtml(att.original_name).replace(/'/g, "\\'")}'); return false;">
                      <i class="fas ${isPDF ? 'fa-file-pdf' : 'fa-file-image'}"></i>
                      <span>${escapeHtml(att.original_name)}</span>
                      <span class="attachment-size">(${formatFileSize(att.file_size)})</span>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          ` : ''}
        `;
        
        // Update footer buttons BEFORE showing modal
        const footer = document.getElementById('entryDetailFooter') as HTMLElement;
        if (footer && canEdit) {
          footer.innerHTML = `
            <button type="button" class="btn btn-secondary" data-action="close">Schließen</button>
            <button type="button" class="btn btn-primary" onclick="editEntry(${entryId})">
              <i class="fas fa-edit"></i> Bearbeiten
            </button>
            <button type="button" class="btn btn-danger" onclick="deleteEntry(${entryId})">
              <i class="fas fa-trash"></i> Löschen
            </button>
          `;
        }
      }
      
      // Show modal FIRST
      console.log('[Blackboard] Showing entry detail modal');
      const detailModal = document.getElementById('entryDetailModal');
      if (!detailModal) {
        console.error('[Blackboard] Entry detail modal not found!');
        return;
      }
      
      // Use modal wrapper to show detail modal
      console.log('[Blackboard] Opening entry detail modal');
      openModal('entryDetailModal');
      
      console.log('[Blackboard] Entry detail modal displayed');
      
      // Re-attach close button listeners after modal is shown
      setupCloseButtons();
      
      // NOW add click handlers for attachments AFTER modal is visible
      if (attachments.length > 0) {
        setTimeout(() => {
          const attachmentList = document.getElementById(`attachment-list-${entryId}`);
          console.log(`[Blackboard] Attachment list element:`, attachmentList);
          
          if (!attachmentList) {
            console.error('[Blackboard] Attachment list not found!');
            return;
          }
          
          const attachmentItems = attachmentList.querySelectorAll('.entry-attachment-item');
          console.log(`[Blackboard] Found ${attachmentItems.length} attachment items`);
          
          // Debug DOM structure
          console.log('[Blackboard] Attachment list HTML:', attachmentList.innerHTML);
          
          attachmentItems.forEach((item, index) => {
            const htmlItem = item as HTMLElement;
            const attachmentId = parseInt(htmlItem.getAttribute('data-attachment-id') || '0');
            const mimeType = htmlItem.getAttribute('data-mime-type') || '';
            const filename = htmlItem.getAttribute('data-filename') || '';
            
            console.log(`[Blackboard] Setting up attachment ${index}:`, { 
              attachmentId, 
              mimeType, 
              filename,
              element: htmlItem,
              parentElement: htmlItem.parentElement
            });
            
            // Direct click handler without cloning
            htmlItem.onclick = (e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log(`[Blackboard] Attachment onclick fired:`, { attachmentId, mimeType, filename });
              
              // Call preview function
              if (typeof window.previewAttachment === 'function') {
                console.log('[Blackboard] Calling window.previewAttachment');
                window.previewAttachment(attachmentId, mimeType, filename);
              } else if (typeof previewAttachment === 'function') {
                console.log('[Blackboard] Calling previewAttachment directly');
                previewAttachment(attachmentId, mimeType, filename);
              } else {
                console.error('[Blackboard] previewAttachment function not found!');
              }
            };
            
            // Also add addEventListener as backup
            htmlItem.addEventListener('click', (e) => {
              console.log(`[Blackboard] Attachment addEventListener fired:`, { attachmentId, mimeType, filename });
            }, true); // Use capture phase
            
            // Visual feedback
            htmlItem.style.cursor = 'pointer';
            htmlItem.style.transition = 'all 0.2s ease';
            
            htmlItem.addEventListener('mouseenter', () => {
              htmlItem.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              htmlItem.style.transform = 'scale(1.02)';
            });
            
            htmlItem.addEventListener('mouseleave', () => {
              htmlItem.style.backgroundColor = '';
              htmlItem.style.transform = '';
            });
            
            // Log computed styles to check for issues
            const computedStyle = window.getComputedStyle(htmlItem);
            console.log(`[Blackboard] Attachment ${index} computed styles:`, {
              display: computedStyle.display,
              visibility: computedStyle.visibility,
              pointerEvents: computedStyle.pointerEvents,
              zIndex: computedStyle.zIndex,
              position: computedStyle.position
            });
          });
          
          // Check if modal is blocking
          const modal = document.getElementById('entryDetailModal');
          if (modal) {
            const modalStyle = window.getComputedStyle(modal);
            console.log('[Blackboard] Modal computed styles:', {
              zIndex: modalStyle.zIndex,
              position: modalStyle.position,
              pointerEvents: modalStyle.pointerEvents,
              display: modalStyle.display,
              visibility: modalStyle.visibility,
              opacity: modalStyle.opacity
            });
            console.log('[Blackboard] Modal dimensions:', {
              offsetWidth: modal.offsetWidth,
              offsetHeight: modal.offsetHeight
            });
          }
          
          // Check modal content
          const modalContent = document.querySelector('#entryDetailModal .modal-body');
          if (modalContent) {
            const contentStyle = window.getComputedStyle(modalContent as HTMLElement);
            console.log('[Blackboard] Modal content styles:', {
              display: contentStyle.display,
              visibility: contentStyle.visibility,
              overflow: contentStyle.overflow
            });
            console.log('[Blackboard] Modal content dimensions:', {
              offsetWidth: (modalContent as HTMLElement).offsetWidth,
              offsetHeight: (modalContent as HTMLElement).offsetHeight
            });
          }
          
          // Test direct element access
          console.log('[Blackboard] Testing direct access...');
          const testAttachment = document.querySelector(`#attachment-list-${entryId} .entry-attachment-item`) as HTMLElement;
          if (testAttachment) {
            console.log('[Blackboard] Test attachment found:', testAttachment);
            console.log('[Blackboard] Can you see and click this element?', {
              offsetWidth: testAttachment.offsetWidth,
              offsetHeight: testAttachment.offsetHeight,
              offsetTop: testAttachment.offsetTop,
              offsetLeft: testAttachment.offsetLeft
            });
          }
        }, 300); // Increased timeout to ensure modal is fully rendered
      }
    }
  } catch (error) {
      console.error('Error viewing entry:', error);
      showError('Fehler beim Laden des Eintrags');
    }
}

// Extend window interface for modal and attachment functions
declare global {
  interface Window {
    showModal?: (modalId: string) => void;
    hideModal?: (modalId: string) => void;
    openEntryForm?: (entryId?: number) => void;
    viewEntry?: (entryId: number) => void;
    editEntry?: (entryId: number) => void;
    deleteEntry?: (entryId: number) => void;
    confirmEntryRead?: (entryId: number) => void;
    viewConfirmationStatus?: (entryId: number) => void;
    handleFileDownload?: (attachmentId: number, filename: string) => void;
    previewAttachment?: (attachmentId: number, mimeType: string, fileName: string) => void;
    deleteAttachment?: (attachmentId: number) => void;
    DashboardUI?: {
      openModal: (modalId: string) => void;
      closeModal: (modalId: string) => void;
      showToast: (message: string, type?: 'info' | 'success' | 'error' | 'warning') => void;
      formatDate: (dateString: string) => string;
    };
  }
}

/**
 * Preview attachment in modal
 */
async function previewAttachment(attachmentId: number, mimeType: string, fileName: string): Promise<void> {
  console.log(`[Blackboard] previewAttachment called:`, { attachmentId, mimeType, fileName });
  const token = getAuthToken();
  if (!token) {
    console.error('[Blackboard] No auth token for preview');
    return;
  }

  // Create preview modal if it doesn't exist
  let previewModal = document.getElementById('attachmentPreviewModal');
  if (!previewModal) {
    previewModal = document.createElement('div');
    previewModal.id = 'attachmentPreviewModal';
    previewModal.className = 'modal-overlay';
    previewModal.innerHTML = `
      <div class="modal-container modal-lg">
        <div class="modal-header">
          <h2 id="previewTitle">Vorschau</h2>
          <button type="button" class="modal-close" data-action="close">&times;</button>
        </div>
        <div class="modal-body" id="previewContent" style="overflow: auto; max-height: calc(90vh - 200px); min-height: 400px;">
          <div class="text-center">
            <i class="fas fa-spinner fa-spin fa-3x"></i>
            <p>Lade Vorschau...</p>
          </div>
        </div>
        <div class="modal-footer">
          <a id="downloadLink" class="btn btn-primary" download>
            <i class="fas fa-download"></i> Herunterladen
          </a>
          <button type="button" class="btn btn-secondary" data-action="close">Schließen</button>
        </div>
      </div>
    `;
    document.body.appendChild(previewModal);
    setupCloseButtons();
  }

  // Show modal using the same approach as other modals
  console.log('[Blackboard] Showing preview modal');
  previewModal.style.display = 'flex';
  previewModal.classList.add('active');
  previewModal.style.opacity = '1';
  previewModal.style.visibility = 'visible';
  
  // Update title
  const titleElement = document.getElementById('previewTitle');
  if (titleElement) titleElement.textContent = `Vorschau: ${fileName}`;
  
  // Update download link
  const downloadLink = document.getElementById('downloadLink') as HTMLAnchorElement;
  if (downloadLink) {
    downloadLink.href = `/api/blackboard/attachments/${attachmentId}?download=true`;
    downloadLink.setAttribute('download', fileName);
    // Add click handler to download with auth token
    downloadLink.onclick = async (e) => {
      e.preventDefault();
      try {
        const response = await fetch(`/api/blackboard/attachments/${attachmentId}?download=true`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) throw new Error('Download failed');
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Download error:', error);
        showError('Fehler beim Herunterladen der Datei');
      }
    };
  }
  
  // Load preview content
  const previewContent = document.getElementById('previewContent');
  if (!previewContent) return;

  try {
    const attachmentUrl = `/api/blackboard/attachments/${attachmentId}`;
    
    if (mimeType.startsWith('image/')) {
      // Fetch image with authorization header and convert to blob URL
      const response = await fetch(attachmentUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to load image');
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      // Display image
      previewContent.innerHTML = `
        <div class="text-center">
          <img src="${blobUrl}" alt="${fileName}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        </div>
      `;
      
      // Clean up blob URL when modal is closed
      const closeButtons = previewModal.querySelectorAll('[data-action="close"]');
      closeButtons.forEach(btn => {
        btn.addEventListener('click', () => URL.revokeObjectURL(blobUrl), { once: true });
      });
    } else if (mimeType === 'application/pdf') {
      // For PDFs, use object tag instead of iframe to avoid CSP issues
      const response = await fetch(attachmentUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to load PDF');
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      // Display PDF using object tag
      previewContent.innerHTML = `
        <div style="width: 100%; height: 600px; position: relative;">
          <object data="${blobUrl}" 
                  type="application/pdf" 
                  width="100%" 
                  height="100%" 
                  style="border: none; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="text-align: center; padding: 40px;">
              <i class="fas fa-file-pdf fa-5x" style="color: #e74c3c; margin-bottom: 20px;"></i>
              <p>PDF-Vorschau konnte nicht geladen werden.</p>
              <button id="openPdfNewTab" class="btn btn-primary" style="margin-top: 20px;">
                <i class="fas fa-external-link-alt"></i> In neuem Tab öffnen
              </button>
            </div>
          </object>
        </div>
      `;
      
      // Add click handler for "open in new tab" button
      setTimeout(() => {
        const openButton = document.getElementById('openPdfNewTab');
        if (openButton) {
          openButton.onclick = async () => {
            try {
              const response = await fetch(attachmentUrl, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              const blob = await response.blob();
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.target = '_blank';
              a.click();
              setTimeout(() => URL.revokeObjectURL(url), 100);
            } catch (error) {
              console.error('Error opening PDF in new tab:', error);
              showError('Fehler beim Öffnen der PDF');
            }
          };
        }
      }, 100);
      
      // Clean up blob URL when modal is closed
      const closeButtons = previewModal.querySelectorAll('[data-action="close"]');
      closeButtons.forEach(btn => {
        btn.addEventListener('click', () => URL.revokeObjectURL(blobUrl), { once: true });
      });
    } else {
      // Unsupported file type
      previewContent.innerHTML = `
        <div class="text-center" style="padding: 40px;">
          <i class="fas fa-file fa-5x" style="color: var(--text-secondary); margin-bottom: 20px;"></i>
          <p>Vorschau für diesen Dateityp nicht verfügbar.</p>
          <p class="text-muted">${fileName}</p>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading preview:', error);
    previewContent.innerHTML = `
      <div class="text-center" style="padding: 40px;">
        <i class="fas fa-exclamation-circle fa-3x" style="color: var(--danger-color); margin-bottom: 20px;"></i>
        <p>Fehler beim Laden der Vorschau.</p>
      </div>
    `;
  }
}

declare global {
  interface Window {
    editEntry: typeof openEntryForm;
    deleteEntry: typeof deleteEntry;
    changePage: typeof changePage;
    viewEntry: typeof viewEntry;
    openEntryForm: typeof openEntryForm;
    removeAttachment: typeof removeAttachment;
    previewAttachment: typeof previewAttachment;
  }
}

// Export functions to window for backwards compatibility
if (typeof window !== 'undefined') {
  window.editEntry = openEntryForm;
  window.deleteEntry = deleteEntry;
  window.changePage = changePage;
  window.viewEntry = viewEntry;
  window.openEntryForm = openEntryForm;
  window.removeAttachment = removeAttachment;
  window.previewAttachment = previewAttachment;
}
