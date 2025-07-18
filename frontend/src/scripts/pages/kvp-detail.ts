/**
 * KVP Detail Page Script
 * Handles detailed view of KVP suggestions
 */

// API configuration
const KVP_DETAIL_API_BASE_URL = '/api';

interface User {
  id: number;
  role: 'root' | 'admin' | 'employee';
  tenant_id: number;
}

interface KvpSuggestion {
  id: number;
  title: string;
  description: string;
  status: 'new' | 'in_review' | 'approved' | 'implemented' | 'rejected' | 'archived';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  org_level: 'company' | 'department' | 'team';
  org_id: number;
  department_id: number;
  department_name: string;
  submitted_by: number;
  submitted_by_name: string;
  submitted_by_lastname: string;
  category_id: number;
  category_name: string;
  category_icon: string;
  category_color: string;
  shared_by?: number;
  shared_by_name?: string;
  shared_at?: string;
  created_at: string;
  expected_benefit?: string;
  estimated_cost?: number;
  actual_savings?: number;
  implementation_date?: string;
  assigned_to?: number;
  rejection_reason?: string;
}

interface Comment {
  id: number;
  suggestion_id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  profile_picture_url?: string;
  comment: string;
  is_internal: boolean;
  created_at: string;
}

interface Attachment {
  id: number;
  suggestion_id: number;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_by: number;
  uploaded_by_name: string;
  uploaded_by_lastname: string;
  uploaded_at: string;
}

class KvpDetailPage {
  private currentUser: User | null = null;
  private suggestionId: number = 0;
  private suggestion: KvpSuggestion | null = null;

  constructor() {
    // Get suggestion ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      this.showError('Ungültige Vorschlags-ID');
      setTimeout(() => (window.location.href = '/kvp'), 2000);
      return;
    }

    this.suggestionId = parseInt(id);
    void this.init();
  }

  private async init(): Promise<void> {
    try {
      // Get current user
      this.currentUser = await this.getCurrentUser();

      // Load suggestion details
      await this.loadSuggestion();

      // Setup UI based on role
      this.setupRoleBasedUI();

      // Load related data
      await Promise.all([this.loadComments(), this.loadAttachments()]);

      // Setup event listeners
      this.setupEventListeners();
    } catch (error) {
      console.error('Error initializing KVP detail page:', error);
      this.showError('Fehler beim Laden der Seite');
    }
  }

  private async getCurrentUser(): Promise<User | null> {
    try {
      const response = await fetch(`${KVP_DETAIL_API_BASE_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to get user info');

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  private async loadSuggestion(): Promise<void> {
    try {
      const response = await fetch(`${KVP_DETAIL_API_BASE_URL}/kvp/${this.suggestionId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Keine Berechtigung');
        }
        throw new Error('Failed to load suggestion');
      }

      this.suggestion = await response.json();
      this.renderSuggestion();
    } catch (error) {
      console.error('Error loading suggestion:', error);
      this.showError(error instanceof Error ? error.message : 'Fehler beim Laden des Vorschlags');
      setTimeout(() => (window.location.href = '/kvp'), 2000);
    }
  }

  private renderSuggestion(): void {
    if (!this.suggestion) return;

    // Basic info
    const titleEl = document.getElementById('suggestionTitle');
    const submittedByEl = document.getElementById('submittedBy');
    const createdAtEl = document.getElementById('createdAt');
    const departmentEl = document.getElementById('department');

    if (titleEl) titleEl.textContent = this.suggestion.title;
    if (submittedByEl)
      submittedByEl.textContent = `${this.suggestion.submitted_by_name} ${this.suggestion.submitted_by_lastname}`;
    if (createdAtEl) createdAtEl.textContent = new Date(this.suggestion.created_at).toLocaleDateString('de-DE');
    if (departmentEl) departmentEl.textContent = this.suggestion.department_name;

    // Status and Priority
    const statusBadge = document.getElementById('statusBadge');
    if (statusBadge) {
      statusBadge.className = `status-badge ${this.suggestion.status.replace('_', '')}`;
      statusBadge.textContent = this.getStatusText(this.suggestion.status);
    }

    const priorityBadge = document.getElementById('priorityBadge');
    if (priorityBadge) {
      priorityBadge.className = `priority-badge ${this.suggestion.priority}`;
      priorityBadge.textContent = this.getPriorityText(this.suggestion.priority);
    }

    // Visibility info
    const visibilityInfo = document.getElementById('visibilityInfo');
    if (!visibilityInfo) return;
    if (this.suggestion.org_level === 'company') {
      visibilityInfo.innerHTML = `
        <div class="visibility-badge company">
          <i class="fas fa-globe"></i> Firmenweit geteilt
          ${
            this.suggestion.shared_by_name
              ? `<span> von ${this.suggestion.shared_by_name} am ${this.suggestion.shared_at ? new Date(this.suggestion.shared_at).toLocaleDateString('de-DE') : ''}</span>`
              : ''
          }
        </div>
      `;
    } else {
      visibilityInfo.innerHTML = `
        <div class="visibility-badge department">
          <i class="fas fa-building"></i> Abteilung: ${this.suggestion.department_name}
        </div>
      `;
    }

    // Description
    const descriptionEl = document.getElementById('description');
    if (descriptionEl) descriptionEl.textContent = this.suggestion.description;

    // Expected benefit
    if (this.suggestion.expected_benefit) {
      const benefitSection = document.getElementById('benefitSection');
      const expectedBenefit = document.getElementById('expectedBenefit');
      if (benefitSection) benefitSection.style.display = '';
      if (expectedBenefit) expectedBenefit.textContent = this.suggestion.expected_benefit;
    }

    // Financial info
    if (this.suggestion.estimated_cost || this.suggestion.actual_savings) {
      const financialSection = document.getElementById('financialSection');
      if (financialSection) financialSection.style.display = '';

      if (this.suggestion.estimated_cost) {
        const estimatedCostEl = document.getElementById('estimatedCost');
        if (estimatedCostEl) {
          estimatedCostEl.textContent = new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
          }).format(this.suggestion.estimated_cost);
        }
      }

      if (this.suggestion.actual_savings) {
        const actualSavingsEl = document.getElementById('actualSavings');
        if (actualSavingsEl) {
          actualSavingsEl.textContent = new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
          }).format(this.suggestion.actual_savings);
        }
      }
    }

    // Details sidebar
    const categoryEl = document.getElementById('category');
    if (categoryEl) {
      categoryEl.innerHTML = `
      <span style="color: ${this.suggestion.category_color ?? '#666'}">
        <i class="${this.suggestion.category_icon ?? 'fas fa-tag'}"></i>
        ${this.suggestion.category_name}
      </span>
    `;
    }

    // For non-admins, just show the status text
    const statusElement = document.getElementById('status');
    const statusDropdownContainer = document.getElementById('statusDropdownContainer');
    const statusDisplay = document.getElementById('statusDisplay');

    if (!statusElement || !statusDropdownContainer || !statusDisplay) return;

    if (this.currentUser && (this.currentUser.role === 'admin' || this.currentUser.role === 'root')) {
      // Hide the status text and show the dropdown for admins
      statusElement.style.display = 'none';
      statusDropdownContainer.style.display = '';

      // Update the dropdown display text
      const statusSpan = statusDisplay.querySelector('span');
      if (statusSpan) statusSpan.textContent = this.getStatusText(this.suggestion.status);
      const statusValue = document.getElementById('statusValue');
      if (statusValue) statusValue.setAttribute('value', this.suggestion.status);
    } else {
      // Show only the status text for regular users
      statusElement.textContent = this.getStatusText(this.suggestion.status);
      statusDropdownContainer.style.display = 'none';
    }

    if (this.suggestion.assigned_to) {
      const assignedToItem = document.getElementById('assignedToItem');
      if (assignedToItem) assignedToItem.style.display = '';
      // TODO: Load assigned user name
    }

    if (this.suggestion.implementation_date) {
      const implementationItem = document.getElementById('implementationItem');
      const implementationDate = document.getElementById('implementationDate');
      if (implementationItem) implementationItem.style.display = '';
      if (implementationDate) {
        implementationDate.textContent = new Date(this.suggestion.implementation_date).toLocaleDateString('de-DE');
      }
    }

    if (this.suggestion.rejection_reason) {
      const rejectionItem = document.getElementById('rejectionItem');
      const rejectionReason = document.getElementById('rejectionReason');
      if (rejectionItem) rejectionItem.style.display = '';
      if (rejectionReason) rejectionReason.textContent = this.suggestion.rejection_reason;
    }
  }

  private setupRoleBasedUI(): void {
    if (!this.currentUser || !this.suggestion) return;

    // Show/hide admin elements
    const adminElements = document.querySelectorAll('.admin-only');
    if (this.currentUser.role === 'admin' || this.currentUser.role === 'root') {
      adminElements.forEach((el) => ((el as HTMLElement).style.display = ''));

      // Show actions card
      const actionsCard = document.getElementById('actionsCard');
      if (actionsCard) actionsCard.style.display = '';

      // Configure share/unshare buttons
      const shareBtn = document.getElementById('shareBtn');
      const unshareBtn = document.getElementById('unshareBtn');

      if (this.suggestion.org_level === 'department') {
        if (shareBtn) shareBtn.style.display = '';
        if (unshareBtn) unshareBtn.style.display = 'none';
      } else if (this.suggestion.org_level === 'company') {
        if (shareBtn) shareBtn.style.display = 'none';
        if (this.currentUser.role === 'root' || this.suggestion.shared_by === this.currentUser.id) {
          if (unshareBtn) unshareBtn.style.display = '';
        }
      }
    } else {
      adminElements.forEach((el) => ((el as HTMLElement).style.display = 'none'));
    }
  }

  private async loadComments(): Promise<void> {
    try {
      const response = await fetch(`${KVP_DETAIL_API_BASE_URL}/kvp/${this.suggestionId}/comments`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to load comments');

      const data = await response.json();
      this.renderComments(data.comments ?? []);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  }

  private renderComments(comments: Comment[]): void {
    const container = document.getElementById('commentList');
    if (!container) return;

    if (comments.length === 0) {
      container.innerHTML = '<p class="empty-state">Noch keine Kommentare</p>';
      return;
    }

    container.innerHTML = comments
      .map((comment) => {
        const initials = `${comment.first_name[0]}${comment.last_name[0]}`.toUpperCase();
        const commentClass = comment.is_internal ? 'comment-item comment-internal' : 'comment-item';

        return `
        <div class="${commentClass}">
          <div class="comment-header">
            <div class="comment-author">
              <div class="comment-avatar">${initials}</div>
              <div>
                <strong>${comment.first_name} ${comment.last_name}</strong>
                ${comment.is_internal ? '<span class="internal-badge">Intern</span>' : ''}
              </div>
            </div>
            <span class="comment-date">
              ${new Date(comment.created_at).toLocaleDateString('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <div class="comment-content">
            ${this.escapeHtml(comment.comment)}
          </div>
        </div>
      `;
      })
      .join('');
  }

  private async loadAttachments(): Promise<void> {
    try {
      const response = await fetch(`${KVP_DETAIL_API_BASE_URL}/kvp/${this.suggestionId}/attachments`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to load attachments');

      const data = await response.json();
      this.renderAttachments(data.attachments ?? []);
    } catch (error) {
      console.error('Error loading attachments:', error);
    }
  }

  private renderAttachments(attachments: Attachment[]): void {
    if (attachments.length === 0) return;

    // Filter photo attachments
    const photoTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const photos = attachments.filter((att) => photoTypes.includes(att.file_type));
    const otherFiles = attachments.filter((att) => !photoTypes.includes(att.file_type));

    // Render photo gallery
    if (photos.length > 0) {
      const photoSection = document.getElementById('photoSection');
      const photoGallery = document.getElementById('photoGallery');

      if (photoSection) photoSection.style.display = '';
      if (!photoGallery) return;

      photoGallery.innerHTML = photos
        .map(
          (photo, index) => `
        <div class="photo-thumbnail" onclick="window.openLightbox('${KVP_DETAIL_API_BASE_URL}/kvp/attachments/${photo.id}/download')">
          <img src="${KVP_DETAIL_API_BASE_URL}/kvp/attachments/${photo.id}/download" 
               alt="${this.escapeHtml(photo.file_name)}"
               loading="lazy">
          ${index === 0 && photos.length > 1 ? `<span class="photo-count">${photos.length} Fotos</span>` : ''}
        </div>
      `,
        )
        .join('');
    }

    // Render other attachments
    if (otherFiles.length > 0) {
      const attachmentsCard = document.getElementById('attachmentsCard');
      const container = document.getElementById('attachmentList');

      if (attachmentsCard) attachmentsCard.style.display = '';
      if (!container) return;

      container.innerHTML = otherFiles
        .map((attachment) => {
          const fileIcon = this.getFileIcon(attachment.file_type);
          const fileSize = this.formatFileSize(attachment.file_size);

          return `
          <div class="attachment-item" data-id="${attachment.id}">
            <i class="${fileIcon}"></i>
            <div class="attachment-info">
              <div class="attachment-name">${this.escapeHtml(attachment.file_name)}</div>
              <div class="attachment-meta">
                ${fileSize} • ${attachment.uploaded_by_name} ${attachment.uploaded_by_lastname}
              </div>
            </div>
            <i class="fas fa-download"></i>
          </div>
        `;
        })
        .join('');

      // Add click handlers
      container.querySelectorAll('.attachment-item').forEach((item) => {
        item.addEventListener('click', () => {
          const id = item.getAttribute('data-id');
          if (id) {
            void this.downloadAttachment(parseInt(id));
          }
        });
      });
    }
  }

  private async downloadAttachment(attachmentId: number): Promise<void> {
    try {
      window.open(`${KVP_DETAIL_API_BASE_URL}/kvp/attachments/${attachmentId}/download`, '_blank');
    } catch (error) {
      console.error('Error downloading attachment:', error);
      this.showError('Fehler beim Download');
    }
  }

  private setupEventListeners(): void {
    // Comment form
    const commentForm = document.getElementById('commentForm') as HTMLFormElement;
    commentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      void (async () => {
        await this.addComment();
      })();
    });

    // Action buttons
    document.getElementById('editBtn')?.addEventListener('click', () => {
      // TODO: Navigate to edit page
      alert('Bearbeiten-Funktion noch nicht implementiert');
    });

    document.getElementById('shareBtn')?.addEventListener('click', () => {
      void (async () => {
        await this.shareSuggestion();
      })();
    });

    document.getElementById('unshareBtn')?.addEventListener('click', () => {
      void (async () => {
        await this.unshareSuggestion();
      })();
    });

    document.getElementById('archiveBtn')?.addEventListener('click', () => {
      void (async () => {
        await this.archiveSuggestion();
      })();
    });

    // Status change listener for custom dropdown
    document.addEventListener('statusChange', (e: Event) => {
      void (async () => {
        const customEvent = e as CustomEvent;
        if (customEvent.detail?.status) {
          await this.updateStatus(customEvent.detail.status);
        }
      })();
    });
  }

  private async addComment(): Promise<void> {
    const input = document.getElementById('commentInput') as HTMLTextAreaElement;
    const internalCheckbox = document.getElementById('internalComment') as HTMLInputElement;

    const comment = input.value.trim();
    if (!comment) return;

    try {
      const response = await fetch(`${KVP_DETAIL_API_BASE_URL}/kvp/${this.suggestionId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          comment,
          is_internal: internalCheckbox?.checked ?? false,
        }),
      });

      if (!response.ok) throw new Error('Failed to add comment');

      // Clear form
      input.value = '';
      if (internalCheckbox) internalCheckbox.checked = false;

      // Reload comments
      await this.loadComments();

      this.showSuccess('Kommentar hinzugefügt');
    } catch (error) {
      console.error('Error adding comment:', error);
      this.showError('Fehler beim Hinzufügen des Kommentars');
    }
  }

  private async shareSuggestion(): Promise<void> {
    if (!confirm('Möchten Sie diesen Vorschlag wirklich firmenweit teilen?')) return;

    try {
      const response = await fetch(`${KVP_DETAIL_API_BASE_URL}/kvp/${this.suggestionId}/share`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to share suggestion');

      this.showSuccess('Vorschlag wurde firmenweit geteilt');

      // Reload page to update UI
      await this.loadSuggestion();
      this.setupRoleBasedUI();
    } catch (error) {
      console.error('Error sharing suggestion:', error);
      this.showError('Fehler beim Teilen des Vorschlags');
    }
  }

  private async unshareSuggestion(): Promise<void> {
    if (!confirm('Möchten Sie das Teilen wirklich rückgängig machen?')) return;

    try {
      const response = await fetch(`${KVP_DETAIL_API_BASE_URL}/kvp/${this.suggestionId}/unshare`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to unshare suggestion');

      this.showSuccess('Teilen wurde rückgängig gemacht');

      // Reload page to update UI
      await this.loadSuggestion();
      this.setupRoleBasedUI();
    } catch (error) {
      console.error('Error unsharing suggestion:', error);
      this.showError('Fehler beim Rückgängigmachen');
    }
  }

  private async archiveSuggestion(): Promise<void> {
    if (!confirm('Möchten Sie diesen Vorschlag wirklich archivieren?')) return;

    try {
      const response = await fetch(`${KVP_DETAIL_API_BASE_URL}/kvp/${this.suggestionId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to archive suggestion');

      this.showSuccess('Vorschlag wurde archiviert');

      // Navigate back to list
      setTimeout(() => (window.location.href = '/kvp'), 1500);
    } catch (error) {
      console.error('Error archiving suggestion:', error);
      this.showError('Fehler beim Archivieren');
    }
  }

  private async updateStatus(newStatus: string): Promise<void> {
    try {
      // Only allow admins and root users to update status
      if (!this.currentUser || (this.currentUser.role !== 'admin' && this.currentUser.role !== 'root')) {
        this.showError('Keine Berechtigung zum Ändern des Status');
        return;
      }

      interface UpdateData {
        status: string;
        rejection_reason?: string;
      }

      let updateData: UpdateData = {
        status: newStatus,
      };

      // If status is rejected, ask for rejection reason
      if (newStatus === 'rejected') {
        const reason = prompt('Bitte geben Sie einen Ablehnungsgrund an:');
        if (!reason || reason.trim() === '') {
          this.showError('Ein Ablehnungsgrund ist erforderlich');
          // Reset dropdown
          const statusDisplay = document.getElementById('statusDisplay');
          if (statusDisplay && this.suggestion) {
            const statusSpan = statusDisplay.querySelector('span');
            if (statusSpan) statusSpan.textContent = this.getStatusText(this.suggestion.status);
            const statusValue = document.getElementById('statusValue');
            if (statusValue) statusValue.setAttribute('value', this.suggestion.status);
          }
          return;
        }
        updateData.rejection_reason = reason.trim();
      }

      const response = await fetch(`${KVP_DETAIL_API_BASE_URL}/kvp/${this.suggestionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error ?? 'Failed to update status');
      }

      const data = await response.json();
      this.suggestion = data.suggestion;

      // Update the status badge
      const statusBadge = document.getElementById('statusBadge');
      if (!statusBadge) return;
      statusBadge.className = `status-badge ${newStatus.replace('_', '')}`;
      statusBadge.textContent = this.getStatusText(newStatus);

      // Update rejection reason display
      const rejectionItem = document.getElementById('rejectionItem');
      const rejectionReason = document.getElementById('rejectionReason');

      if (newStatus === 'rejected' && updateData.rejection_reason) {
        if (rejectionItem) rejectionItem.style.display = '';
        if (rejectionReason) rejectionReason.textContent = updateData.rejection_reason;
      } else if (newStatus !== 'rejected') {
        if (rejectionItem) rejectionItem.style.display = 'none';
      }

      this.showSuccess(`Status geändert zu: ${this.getStatusText(newStatus)}`);
    } catch (error) {
      console.error('Error updating status:', error);
      this.showError('Fehler beim Aktualisieren des Status');

      // Reset dropdown to original value on error
      const statusDisplay = document.getElementById('statusDisplay');
      if (statusDisplay && this.suggestion) {
        const statusSpan = statusDisplay.querySelector('span');
        if (statusSpan) statusSpan.textContent = this.getStatusText(this.suggestion.status);
        const statusValue = document.getElementById('statusValue');
        if (statusValue) statusValue.setAttribute('value', this.suggestion.status);
      }
    }
  }

  private getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      new: 'Neu',
      in_review: 'In Prüfung',
      approved: 'Genehmigt',
      implemented: 'Umgesetzt',
      rejected: 'Abgelehnt',
      archived: 'Archiviert',
    };
    return statusMap[status] ?? status;
  }

  private getPriorityText(priority: string): string {
    const priorityMap: Record<string, string> = {
      low: 'Niedrig',
      normal: 'Normal',
      high: 'Hoch',
      urgent: 'Dringend',
    };
    return priorityMap[priority] ?? priority;
  }

  private getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'fas fa-image';
    if (mimeType === 'application/pdf') return 'fas fa-file-pdf';
    if (mimeType.includes('word')) return 'fas fa-file-word';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'fas fa-file-excel';
    return 'fas fa-file';
  }

  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${Math.round(bytes / (1024 * 1024))} MB`;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private showSuccess(message: string): void {
    // TODO: Implement toast notification
    alert(message);
  }

  private showError(message: string): void {
    // TODO: Implement toast notification
    alert(`Fehler: ${message}`);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new KvpDetailPage();
});
