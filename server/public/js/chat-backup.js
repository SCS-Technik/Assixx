class ChatClient {
  constructor() {
    this.ws = null;
    this.token = localStorage.getItem('token');
    this.currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    this.currentConversationId = null;
    this.conversations = [];
    this.availableUsers = [];
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.pendingFiles = []; // Files waiting to be sent with message
    this.searchQuery = '';
    this.emojiCategories = {
      smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😇', '😉', '😊', '🙂', '🙃', '☺️', '😋', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '🥲', '🤪', '🤩', '🥳', '😎', '🥸', '🧐', '🤓', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'],
      gestures: ['👋', '🤚', '🖐️', '✋', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦻', '👂', '🦻', '👃', '🧠', '🦾', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋', '💘'],
      hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '💔', '❣️', '💕', '💖', '💗', '💓', '💘', '💝', '💞', '💟', '♥️', '♦️', '♠️', '♣️'],
      animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🦍', '🦧', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🦼', '🐴', '🦄', '🐝', '🦟', '🦗', '🐛', '🐌', '🐚', '🐞', '🐜', '🦞', '🦘', '🐍', '🐢', '🦕', '🦖', '🐙', '🦑', '🦀', '🦞', '🦐', '🦪', '😸', '🐠', '🐟', '🐡', '🐋', '🦈', '🐳', '🐊', '🐅', '🐆', '🦓', '🦌', '🦭', '🐘', '🦛', '🦒'],
      food: ['🍎', '🍏', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🥑', '🥦', '🧄', '🧅', '🌶️', '🥒', '🥬', '🥦', '🥚', '🥞', '🧀', '🍞', '🥐', '🥖', '🧁', '🥨', '🥯', '🥛', '🥓', '🥤', '🌭', '🍔', '🍕', '🍖', '🥪', '🌮', '🌯', '🥙', '🧆', '🥜', '🍳', '🥘', '🍲', '🍥', '🍜', '🍝', '🍠', '🍢', '🍣', '🍤', '🍙', '🍚', '🍛', '🦀', '🦞', '🦐', '🦑', '🍦', '🍧', '🍨', '🍩', '🍪', '🎂', '🍰', '🧁', '🥧', '🍫', '🍬', '🍭', '🍮', '🍯', '🍼', '🥛', '☕', '🍵', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🍾', '🥄', '🧋', '🧊'],
      activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🏓', '🏸', '🏉', '🎾', '🥏', '🎳', '🏏', '🏑', '🏒', '🥍', '🏅', '🥇', '🥈', '🥉', '🏆', '🎱', '🔮', '🎯', '🎲', '🧩', '🎰', '🎳'],
      objects: ['💡', '🔦', '🕯️', '🧪', '🔎', '🔍', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '⏱️', '⏲️', '⏰', '🕰️', '⌚', '⏳', '📡', '🔋', '🔌', '💻', '🖥️', '🖨️', '⌨️', '🖱️', '🖲️', '💽', '💾', '💿', '📀', '📁', '🗂️', '📂', '📃', '📄', '📅', '📆', '🖇️', '📇', '📈', '📉', '📊', '📋', '📌', '📍', '📎', '🖇️', '📏', '📐', '✂️', '🖊️', '🖋️', '✒️', '🖌️', '🖍️', '📑', '📒', '📓', '📔', '📕', '📖', '📗', '📘', '📙', '📚', '📐', '🔖', '📎', '🖇️', '🔐', '🔒', '🔓'],
      symbols: ['✨', '💫', '💥', '🔥', '🌙', '☀️', '🌤️', '⛅', '🌥️', '🌦️', '🌈', '☁️', '🌧️', '⛈️', '🌩️', '⚡', '🔥', '💧', '🌊', '🎆', '🎇', '🎐', '🎑', '🎖️', '🎗️', '🎟️', '🎫', '🏆', '🏅', '🥇', '🥈', '🥉', '🎆', '🎇', '🏧', '🎪', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎵', '🎶', '🎹', '🎻', '🥁', '🎷', '🎺', '🎸', '🎲', '♟️', '🎯', '🎴', '🀄', '🎲', '📣', '📪', '📫', '📬', '📭', '📮', '📯', '📰', '📦', '📧', '📨', '📩', '📤', '📥', '📜', '📃', '📑', '📊', '📈', '📉', '📄', '📅', '📆', '📇', '📁', '📂', '📃', '🗃️', '🗄️', '📋', '🗒️', '🗓️', '🔐', '🔒', '🔓', '🔏', '🔐', '🔑', '🗝️', '🔨', '⛏️', '🔩', '🔪', '🔫', '💉', '💊', '🌡️', '🎒', '🧪', '🧫', '🧬', '🧭', '🧮', '🧯', '🧰', '🧿', '🧫', '🚬', '⚰️', '⚱️', '🏺️', '🗿', '🧿', '📴', '📵', '🛢️']
    };
    
    this.init();
  }

  async init() {
    await this.loadInitialData();
    this.connectWebSocket();
    this.initializeEventListeners();
    this.startTypingTimer();
  }

  async loadInitialData() {
    try {
      // Lade Unterhaltungen
      const response = await fetch('/api/chat/conversations', {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        this.conversations = await response.json();
        this.renderConversations();
      }

      // Lade verfügbare Benutzer
      const usersResponse = await fetch('/api/chat/users', {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (usersResponse.ok) {
        this.availableUsers = await usersResponse.json();
      }

    } catch (error) {
      console.error('Fehler beim Laden der initialen Daten:', error);
      this.showNotification('Fehler beim Laden der Chat-Daten', 'error');
    }
  }

  connectWebSocket() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/chat-ws?token=${this.token}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket-Verbindung hergestellt');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.updateConnectionStatus(true);
        
        // Aktuelle Unterhaltung wieder beitreten
        if (this.currentConversationId) {
          this.joinConversation(this.currentConversationId);
        }
      };

      this.ws.onmessage = (event) => {
        this.handleWebSocketMessage(JSON.parse(event.data));
      };

      this.ws.onclose = () => {
        console.log('WebSocket-Verbindung getrennt');
        this.isConnected = false;
        this.updateConnectionStatus(false);
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket-Fehler:', error);
        this.updateConnectionStatus(false);
      };

    } catch (error) {
      console.error('Fehler beim Verbinden des WebSocket:', error);
      this.attemptReconnect();
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Verbindungsversuch ${this.reconnectAttempts} in ${delay}ms`);
      
      setTimeout(() => {
        this.connectWebSocket();
      }, delay);
    } else {
      this.showNotification('Verbindung zum Chat-Server verloren. Bitte Seite neu laden.', 'error');
    }
  }

  handleWebSocketMessage(message) {
    switch (message.type) {
      case 'connection_established':
        console.log('Chat-Verbindung bestätigt');
        break;
      case 'new_message':
        this.handleNewMessage(message.data);
        break;
      case 'user_typing':
        this.showTypingIndicator(message.data);
        break;
      case 'user_stopped_typing':
        this.hideTypingIndicator(message.data);
        break;
      case 'message_read':
        this.handleMessageRead(message.data);
        break;
      case 'user_status_changed':
        this.handleUserStatusChange(message.data);
        break;
      case 'scheduled_message_delivered':
        this.handleScheduledMessageDelivered(message.data);
        break;
      case 'message_sent':
        this.handleMessageSent(message.data);
        break;
      case 'message_delivered':
        this.handleMessageDelivered(message.data);
        break;
      case 'error':
        this.showNotification(message.data.message, 'error');
        break;
      default:
        console.log('Unbekannte WebSocket-Nachricht:', message);
    }
  }

  handleNewMessage(messageData) {
    // Remove temporary message if this is our own message
    if (messageData.sender_id == this.currentUser.id) {
      const tempMessages = document.querySelectorAll('[data-temp-id]');
      tempMessages.forEach(msg => msg.remove());
    }
    
    // Nachricht zur aktuellen Unterhaltung hinzufügen
    if (messageData.conversation_id == this.currentConversationId) {
      this.displayMessage(messageData);
      this.scrollToBottom();
      
      // Nachricht als gelesen markieren wenn nicht eigene Nachricht
      if (messageData.sender_id != this.currentUser.id) {
        this.markMessageAsRead(messageData.id);
      }
    }

    // Unterhaltungsliste aktualisieren
    this.updateConversationInList(messageData);
    
    // Benachrichtigung anzeigen wenn nicht aktuelle Unterhaltung
    if (messageData.conversation_id != this.currentConversationId && 
        messageData.sender_id != this.currentUser.id) {
      this.showNotification(`Neue Nachricht von ${messageData.sender_name}`, 'info');
    }
  }

  async sendMessage() {
    const input = document.getElementById('messageInput');
    const content = input.value.trim();
    const scheduling = document.getElementById('messageScheduling').value;
    
    if ((!content && this.pendingFiles.length === 0) || !this.currentConversationId) return;

    // Über HTTP API senden wenn Dateien angehängt sind oder geplante Nachrichten
    if (this.pendingFiles.length > 0 || scheduling !== 'immediate') {
      try {
        const formData = new FormData();
        formData.append('content', content);
        formData.append('scheduled_delivery', scheduling);
        
        // Dateien anhängen
        this.pendingFiles.forEach(file => {
          formData.append('attachments', file);
        });

        const response = await fetch(`/api/chat/conversations/${this.currentConversationId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`
          },
          body: formData
        });

        if (response.ok) {
          const result = await response.json();
          if (result.scheduled_delivery) {
            this.showNotification(`Nachricht für ${this.formatSchedulingTime(scheduling)} geplant`, 'success');
          } else {
            this.showNotification('Nachricht gesendet', 'success');
          }
          
          // Pending files löschen
          this.pendingFiles = [];
          this.updateFilePreview();
        }
      } catch (error) {
        console.error('Fehler beim Senden der Nachricht:', error);
        this.showNotification('Fehler beim Senden der Nachricht', 'error');
      }
    } else {
      // Über WebSocket senden für sofortige Zustellung ohne Dateien
      const messageData = {
        type: 'send_message',
        data: {
          conversationId: this.currentConversationId,
          content: content,
          scheduled_delivery: scheduling
        }
      };
      
      if (this.isConnected) {
        try {
          this.ws.send(JSON.stringify(messageData));
          
          // Temporäre Nachricht anzeigen während auf Server-Antwort gewartet wird
          const tempMessage = {
            id: 'temp-' + Date.now(),
            conversation_id: this.currentConversationId,
            content: content,
            sender_id: this.currentUser.id,
            sender_name: this.currentUser.first_name || this.currentUser.last_name || this.currentUser.username || 'Unknown',
            first_name: this.currentUser.first_name || '',
            last_name: this.currentUser.last_name || '',
            profile_picture_url: this.currentUser.profile_picture_url || null,
            created_at: new Date().toISOString(),
            delivery_status: 'sending',
            is_read: false,
            attachments: []
          };
          
          this.displayMessage(tempMessage);
          this.scrollToBottom();
        } catch (error) {
          console.error('Fehler beim Senden über WebSocket:', error);
          this.showNotification('Fehler beim Senden der Nachricht', 'error');
        }
      } else {
        this.showNotification('Keine Verbindung zum Chat-Server', 'error');
      }
    }

    input.value = '';
    this.resizeTextarea();
  }

  async loadMessages(conversationId) {
    try {
      const response = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const messages = await response.json();
        this.displayMessages(messages);
        this.scrollToBottom();
      }
    } catch (error) {
      console.error('Fehler beim Laden der Nachrichten:', error);
      this.showNotification('Fehler beim Laden der Nachrichten', 'error');
    }
  }

  displayMessages(messages) {
    const container = document.getElementById('messagesContainer');
    container.innerHTML = '';
    
    messages.forEach(message => {
      this.displayMessage(message);
    });
  }

  displayMessage(message) {
    const container = document.getElementById('messagesContainer');
    const isOwnMessage = message.sender_id == this.currentUser.id;
    
    // Check if this is a temporary message update
    const tempId = typeof message.id === 'string' && message.id.startsWith('temp-') ? message.id : null;
    const existingMessage = tempId ? container.querySelector(`[data-temp-id="${tempId}"]`) : null;
    
    if (existingMessage) {
      // Remove temporary message when real message arrives
      existingMessage.remove();
    }
    
    const messageElement = document.createElement('div');
    messageElement.className = `message ${isOwnMessage ? 'own' : ''}`;
    
    if (tempId) {
      messageElement.dataset.tempId = message.id;
    } else {
      messageElement.dataset.messageId = message.id;
    }
    
    const time = new Date(message.created_at).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    });

    messageElement.innerHTML = `
      <div class="message-header">
        ${!isOwnMessage ? `
          <img src="${message.profile_picture_url || '/images/default-avatar.svg'}" 
               alt="Avatar" class="message-avatar" onerror="this.src='/images/default-avatar.svg'">
          <span class="message-sender">${message.sender_name || `${message.first_name || ''} ${message.last_name || ''}`.trim() || message.username || 'Unbekannt'}</span>
        ` : ''}
        <span class="message-time">${time}</span>
        ${message.is_scheduled ? '<span class="scheduled-indicator">📅</span>' : ''}
        ${isOwnMessage ? `
          <div class="message-actions">
            <button class="message-action" onclick="chatClient.deleteMessage('${message.id}')" title="Löschen">
              <i class="fas fa-trash"></i>
            </button>
            <button class="message-action" onclick="chatClient.archiveMessage('${message.id}')" title="Archivieren">
              <i class="fas fa-archive"></i>
            </button>
          </div>
        ` : ''}
      </div>
      <div class="message-content">${this.formatMessageContent(message.content)}</div>
      ${message.attachments ? this.renderAttachments(message.attachments) : ''}
      ${isOwnMessage ? `
        <div class="message-status" style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px; text-align: right;">
          ${message.delivery_status === 'failed' ? 
            '<span style="color: #f44336;">❌ Fehler</span>' :
            message.delivery_status === 'sending' ?
              '<span style="color: #9e9e9e;">⏳</span>' :
              message.is_read ? 
                '<span style="color: #2196f3;">✓✓</span>' : 
                message.delivery_status === 'delivered' ?
                  '<span style="color: #9e9e9e;">✓✓</span>' :
                  '<span style="color: #9e9e9e;">✓</span>'
          }
        </div>
      ` : ''}
    `;
    
    container.appendChild(messageElement);
  }

  renderAttachments(attachments) {
    if (!attachments || attachments.length === 0) return '';
    
    return `
      <div class="message-attachments">
        ${attachments.map(attachment => {
          const isImage = attachment.mime_type && attachment.mime_type.startsWith('image/');
          
          if (isImage) {
            return `
              <div class="attachment image-attachment">
                <img src="/api/chat/attachments/${attachment.filename}" 
                     alt="${attachment.original_filename}"
                     style="max-width: 300px; max-height: 200px; border-radius: 8px; cursor: pointer;"
                     onclick="window.open('/api/chat/attachments/${attachment.filename}', '_blank')"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="attachment-fallback" style="display: none;">
                  <a href="/api/chat/attachments/${attachment.filename}" 
                     download="${attachment.original_filename}" 
                     class="attachment-link">
                    🖼️ ${attachment.original_filename}
                  </a>
                </div>
              </div>
            `;
          } else {
            let icon = '📎';
            if (attachment.mime_type === 'application/pdf') icon = '📄';
            else if (attachment.mime_type && attachment.mime_type.includes('word')) icon = '📝';
            
            return `
              <div class="attachment">
                <a href="/api/chat/attachments/${attachment.filename}" 
                   download="${attachment.original_filename}" 
                   class="attachment-link"
                   style="display: flex; align-items: center; gap: 8px; padding: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; text-decoration: none; color: inherit;">
                  <span style="font-size: 1.5rem;">${icon}</span>
                  <div>
                    <div style="font-weight: 500;">${attachment.original_filename}</div>
                    <div style="font-size: 0.8rem; opacity: 0.7;">${this.formatFileSize(attachment.file_size)}</div>
                  </div>
                </a>
              </div>
            `;
          }
        }).join('')}
      </div>
    `;
  }
  
  formatFileSize(bytes) {
    if (!bytes) return '';
    const kb = bytes / 1024;
    const mb = kb / 1024;
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    if (kb >= 1) return `${kb.toFixed(0)} KB`;
    return `${bytes} B`;
  }

  formatMessageContent(content) {
    // Sicherheitscheck für content
    if (!content || typeof content !== 'string') {
      return '';
    }
    
    // Einfache URL-Erkennung und Verlinkung
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return content.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener">$1</a>');
  }

  renderConversations() {
    const container = document.getElementById('conversationsList');
    container.innerHTML = '';

    this.conversations.forEach(conversation => {
      const conversationElement = document.createElement('div');
      conversationElement.className = 'conversation-item';
      conversationElement.dataset.conversationId = conversation.id;
      
      if (conversation.id == this.currentConversationId) {
        conversationElement.classList.add('active');
      }

      const lastMessageTime = conversation.last_message_time ? 
        new Date(conversation.last_message_time).toLocaleTimeString('de-DE', {
          hour: '2-digit',
          minute: '2-digit'
        }) : '';

      conversationElement.innerHTML = `
        <div class="conversation-avatar" style="position: relative;">
          ${conversation.is_group ? 
            `<div style="background: linear-gradient(135deg, #9c27b0, #ba68c8); width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;">
              <i class="fas fa-users"></i>
            </div>` :
            `<img src="${conversation.profile_picture_url || '/images/default-avatar.svg'}" 
                 alt="Avatar">
             <span class="status-indicator ${conversation.user_status || 'offline'}" 
                   data-user-status="${conversation.other_user_id}"
                   style="position: absolute; bottom: 0; right: 0; width: 12px; height: 12px; border-radius: 50%; border: 2px solid var(--background-primary); background: ${conversation.user_status === 'online' ? '#4caf50' : '#9e9e9e'};"
                   title="${conversation.user_status === 'online' ? 'Online' : 'Offline'}"></span>`
          }
          ${conversation.unread_count > 0 ? `<span class="unread-badge">${conversation.unread_count}</span>` : ''}
        </div>
        <div class="conversation-info">
          <div class="conversation-name">
            ${conversation.is_group ? '<i class="fas fa-users" style="font-size: 0.8rem; margin-right: 4px;"></i>' : ''}
            ${conversation.display_name}
          </div>
          <div class="conversation-last-message">${conversation.last_message || 'Keine Nachrichten'}</div>
        </div>
        <div class="conversation-meta">
          <div class="conversation-time">${lastMessageTime}</div>
        </div>
      `;

      conversationElement.addEventListener('click', () => {
        this.selectConversation(conversation.id);
      });

      container.appendChild(conversationElement);
    });
  }

  async selectConversation(conversationId) {
    // Vorherige Auswahl entfernen
    document.querySelectorAll('.conversation-item').forEach(item => {
      item.classList.remove('active');
    });

    // Neue Auswahl markieren
    const selectedItem = document.querySelector(`[data-conversation-id="${conversationId}"]`);
    if (selectedItem) {
      selectedItem.classList.add('active');
    }

    this.currentConversationId = conversationId;
    
    // Find conversation details
    const conversation = this.conversations.find(c => c.id == conversationId);
    if (conversation) {
      // Update chat header
      const chatHeader = document.getElementById('chat-header');
      const chatAvatar = document.getElementById('chat-avatar');
      const chatPartnerName = document.getElementById('chat-partner-name');
      const chatPartnerStatus = document.getElementById('chat-partner-status');
      
      if (chatHeader) chatHeader.style.display = 'flex';
      if (chatPartnerName) chatPartnerName.textContent = conversation.display_name || 'Unbekannt';
      if (chatPartnerStatus) chatPartnerStatus.textContent = conversation.is_group ? 'Gruppenchat' : (conversation.other_user_role || 'Benutzer');
      
      if (chatAvatar) {
        if (conversation.is_group) {
          chatAvatar.innerHTML = '<i class="fas fa-users"></i>';
          chatAvatar.style.background = 'linear-gradient(135deg, #9c27b0, #ba68c8)';
        } else {
          const initials = (conversation.display_name || 'U').split(' ').map(n => n[0]).join('').toUpperCase();
          chatAvatar.textContent = initials;
          chatAvatar.style.background = 'linear-gradient(135deg, var(--primary-color), var(--primary-light))';
        }
      }
    }
    
    // Unterhaltung beitreten
    this.joinConversation(conversationId);
    
    // Nachrichten laden
    await this.loadMessages(conversationId);
    
    // Chat-Bereich anzeigen
    const chatArea = document.getElementById('chatArea');
    const noChatSelected = document.getElementById('noChatSelected');
    
    if (chatArea) chatArea.style.display = 'block';
    if (noChatSelected) noChatSelected.style.display = 'none';
  }

  joinConversation(conversationId) {
    if (this.isConnected) {
      this.ws.send(JSON.stringify({
        type: 'join_conversation',
        data: { conversationId }
      }));
    }
  }

  showNewConversationModal() {
    console.log('📋 showNewConversationModal aufgerufen');
    
    const modal = document.getElementById('newConversationModal');
    const usersList = document.getElementById('availableUsersList');
    const groupChatOptions = document.getElementById('groupChatOptions');
    const groupChatName = document.getElementById('groupChatName');
    
    console.log('Modal Element gefunden:', !!modal);
    console.log('UsersList Element gefunden:', !!usersList);
    console.log('Verfügbare Benutzer:', this.availableUsers.length);
    
    if (!modal) {
      console.error('❌ Modal nicht gefunden!');
      return;
    }
    
    if (!usersList) {
      console.error('❌ UsersList nicht gefunden!');
      return;
    }
    
    // Reset modal state
    if (groupChatName) groupChatName.value = '';
    if (groupChatOptions) groupChatOptions.style.display = 'none';
    
    // Verfügbare Benutzer anzeigen
    usersList.innerHTML = '';
    this.availableUsers.forEach(user => {
      const userElement = document.createElement('div');
      userElement.className = 'available-user';
      const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || 'Unbekannter Benutzer';
      
      userElement.innerHTML = `
        <input type="checkbox" id="user_${user.id}" value="${user.id}" class="user-checkbox">
        <label for="user_${user.id}" style="display: flex; align-items: center; gap: 8px; flex: 1;">
          <div style="position: relative;">
            <img src="${user.profile_picture_url || '/images/default-avatar.svg'}" alt="Avatar" onerror="this.src='/images/default-avatar.svg'">
            <span class="status-indicator ${user.online_status || 'offline'}" 
                  data-user-status="${user.id}"
                  style="position: absolute; bottom: 0; right: 0; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #1a1a2e; background: ${user.online_status === 'online' ? '#4caf50' : '#9e9e9e'};"
                  title="${user.online_status === 'online' ? 'Online' : 'Offline'}"></span>
          </div>
          ${userName} <span class="user-role">(${user.role})</span>
        </label>
      `;
      usersList.appendChild(userElement);
    });
    
    // Event listener für Checkbox-Änderungen
    usersList.addEventListener('change', (e) => {
      if (e.target.classList.contains('user-checkbox')) {
        const checkedCount = usersList.querySelectorAll('.user-checkbox:checked').length;
        if (groupChatOptions) {
          groupChatOptions.style.display = checkedCount > 1 ? 'block' : 'none';
        }
      }
    });

    console.log('👥 Benutzer hinzugefügt, Modal wird angezeigt...');
    modal.style.display = 'block';
    console.log('✅ Modal angezeigt');
  }

  async createNewConversation() {
    const selectedUsers = Array.from(document.querySelectorAll('#availableUsersList input:checked'))
      .map(input => parseInt(input.value));

    if (selectedUsers.length === 0) {
      this.showNotification('Bitte mindestens einen Benutzer auswählen', 'warning');
      return;
    }

    const isGroup = selectedUsers.length > 1;
    const groupNameInput = document.getElementById('groupChatName');
    const groupName = isGroup && groupNameInput ? groupNameInput.value.trim() : null;

    try {
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          participant_ids: selectedUsers,
          is_group: isGroup,
          name: groupName || null
        })
      });

      if (response.ok) {
        const result = await response.json();
        this.showNotification(isGroup ? 'Gruppenchat erfolgreich erstellt' : 'Unterhaltung erfolgreich erstellt', 'success');
        this.closeModal('newConversationModal');
        
        // Unterhaltungen neu laden
        await this.loadInitialData();
        
        // Neue Unterhaltung auswählen
        this.selectConversation(result.id);
      }
    } catch (error) {
      console.error('Fehler beim Erstellen der Unterhaltung:', error);
      this.showNotification('Fehler beim Erstellen der Unterhaltung', 'error');
    }
  }

  initializeEventListeners() {
    // Nur Event-Listener für Message-Input (andere werden in HTML hinzugefügt)
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
      // Enter-Taste zum Senden
      messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });

      // Typing-Indikator
      messageInput.addEventListener('input', () => {
        this.handleTyping();
        this.resizeTextarea();
      });
    }

    // File-Upload Handler
    const fileInput = document.getElementById('fileInput');
    const attachmentBtn = document.getElementById('attachmentBtn');
    
    if (attachmentBtn && fileInput) {
      attachmentBtn.addEventListener('click', (e) => {
        e.preventDefault();
        fileInput.click();
      });
    }
    
    if (fileInput) {
      fileInput.addEventListener('change', async (event) => {
        const files = event.target.files;
        if (files.length > 0) {
          console.log('📎 Dateien ausgewählt:', files);
          await this.handleFileUpload(files);
          // Reset input
          fileInput.value = '';
        }
      });
    }
    
    // Emoji Picker Handler
    const emojiBtn = document.getElementById('emojiBtn');
    if (emojiBtn) {
      emojiBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleEmojiPicker();
      });
    }
    
    // Emoji Category Handlers
    const emojiCategories = document.querySelectorAll('.emoji-category');
    emojiCategories.forEach(category => {
      category.addEventListener('click', (e) => {
        const categoryName = e.target.dataset.category;
        this.showEmojiCategory(categoryName);
        
        // Update active state
        document.querySelectorAll('.emoji-category').forEach(cat => cat.classList.remove('active'));
        e.target.classList.add('active');
      });
    });
    
    // Click outside to close emoji picker
    document.addEventListener('click', (e) => {
      const emojiPicker = document.getElementById('emojiPicker');
      const emojiBtn = document.getElementById('emojiBtn');
      if (emojiPicker && !emojiPicker.contains(e.target) && e.target !== emojiBtn && !emojiBtn.contains(e.target)) {
        emojiPicker.style.display = 'none';
      }
    });
    
    // Search functionality
    const searchBtn = document.querySelector('.chat-action-btn[title="Suchen"]');
    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        this.toggleSearch();
      });
    }
    
    // Delete conversation button
    const deleteConvBtn = document.getElementById('deleteConversationBtn');
    if (deleteConvBtn) {
      deleteConvBtn.addEventListener('click', () => {
        this.deleteCurrentConversation();
      });
    }
  }

  handleTyping() {
    if (!this.currentConversationId || !this.isConnected) return;

    // Typing-Start senden
    this.ws.send(JSON.stringify({
      type: 'typing_start',
      data: { conversationId: this.currentConversationId }
    }));

    // Timer für Typing-Stop
    clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => {
      this.ws.send(JSON.stringify({
        type: 'typing_stop',
        data: { conversationId: this.currentConversationId }
      }));
    }, 2000);
  }

  markMessageAsRead(messageId) {
    if (this.isConnected) {
      this.ws.send(JSON.stringify({
        type: 'mark_read',
        data: { messageId }
      }));
    }
  }

  resizeTextarea() {
    const textarea = document.getElementById('messageInput');
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  }

  scrollToBottom() {
    const container = document.getElementById('messagesContainer');
    container.scrollTop = container.scrollHeight;
  }

  updateConnectionStatus(connected) {
    const indicator = document.getElementById('connectionStatus');
    if (indicator) {
      indicator.className = `connection-status ${connected ? 'connected' : 'disconnected'}`;
      indicator.textContent = connected ? 'Verbunden' : 'Getrennt';
    }
    console.log(`WebSocket Status: ${connected ? 'Verbunden' : 'Getrennt'}`);
  }

  formatSchedulingTime(scheduling) {
    switch (scheduling) {
      case 'break_time': return 'Pausenzeit (12:00)';
      case 'after_work': return 'Feierabend (17:00)';
      default: return 'sofort';
    }
  }

  showNotification(message, type = 'info') {
    // Einfache Benachrichtigung - kann später durch Toast-System ersetzt werden
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }

  closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
  }

  startTypingTimer() {
    // Placeholder für Typing-Timer-Initialisierung
  }

  updateConversationInList(messageData) {
    // Unterhaltung in der Liste aktualisieren
    const conversation = this.conversations.find(c => c.id == messageData.conversation_id);
    if (conversation) {
      conversation.last_message = messageData.content;
      conversation.last_message_time = messageData.created_at;
      if (messageData.sender_id != this.currentUser.id) {
        conversation.unread_count = (conversation.unread_count || 0) + 1;
      }
      this.renderConversations();
    }
  }

  showTypingIndicator(data) {
    // Typing-Indikator anzeigen
    const container = document.getElementById('messagesContainer');
    const existingIndicator = document.getElementById(`typing-${data.userId}`);
    
    if (!existingIndicator && data.conversationId == this.currentConversationId) {
      const indicator = document.createElement('div');
      indicator.id = `typing-${data.userId}`;
      indicator.className = 'typing-indicator';
      indicator.innerHTML = `
        <div class="typing-dots">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
        <span style="margin-left: 8px; color: var(--text-secondary); font-size: 0.85rem;">${data.userName || 'Jemand'} schreibt...</span>
      `;
      container.appendChild(indicator);
      this.scrollToBottom();
    }
  }

  hideTypingIndicator(data) {
    const indicator = document.getElementById(`typing-${data.userId}`);
    if (indicator) {
      indicator.remove();
    }
  }

  handleMessageRead(data) {
    const messageElement = document.querySelector(`[data-message-id="${data.messageId}"]`);
    if (messageElement) {
      const statusElement = messageElement.querySelector('.message-status');
      if (statusElement) {
        statusElement.innerHTML = '<span style="color: #2196f3;">✓✓</span>';
      }
    }
  }

  handleUserStatusChange(data) {
    // Benutzer-Status in der UI aktualisieren
    console.log(`Benutzer ${data.userId} ist jetzt ${data.status}`);
    
    // Update user status in availableUsers
    const user = this.availableUsers.find(u => u.id === data.userId);
    if (user) {
      user.online_status = data.status;
    }
    
    // Update status indicator in conversation list if exists
    const statusIndicator = document.querySelector(`[data-user-status="${data.userId}"]`);
    if (statusIndicator) {
      statusIndicator.className = `status-indicator ${data.status}`;
      statusIndicator.title = data.status === 'online' ? 'Online' : 'Offline';
    }
  }

  handleScheduledMessageDelivered(messageData) {
    if (messageData.conversation_id == this.currentConversationId) {
      this.displayMessage(messageData);
      this.scrollToBottom();
    }
    this.updateConversationInList(messageData);
  }

  async deleteMessage(messageId) {
    if (!confirm('Möchten Sie diese Nachricht wirklich löschen?')) return;
    
    try {
      const response = await fetch(`/api/chat/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      
      if (response.ok) {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
          messageElement.style.opacity = '0';
          setTimeout(() => messageElement.remove(), 300);
        }
        this.showNotification('Nachricht gelöscht', 'success');
      }
    } catch (error) {
      console.error('Fehler beim Löschen der Nachricht:', error);
      this.showNotification('Fehler beim Löschen der Nachricht', 'error');
    }
  }

  async archiveMessage(messageId) {
    try {
      const response = await fetch(`/api/chat/messages/${messageId}/archive`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      
      if (response.ok) {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
          messageElement.style.opacity = '0.5';
          messageElement.classList.add('archived');
        }
        this.showNotification('Nachricht archiviert', 'success');
      }
    } catch (error) {
      console.error('Fehler beim Archivieren der Nachricht:', error);
      this.showNotification('Fehler beim Archivieren der Nachricht', 'error');
    }
  }
  
  async handleFileUpload(files) {
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    for (const file of files) {
      // Größe prüfen
      if (file.size > maxFileSize) {
        this.showNotification(`Datei ${file.name} ist zu groß (max. 10MB)`, 'error');
        continue;
      }
      
      // Typ prüfen
      if (!allowedTypes.includes(file.type)) {
        this.showNotification(`Dateityp ${file.type} nicht erlaubt`, 'error');
        continue;
      }
      
      // Datei zur Liste hinzufügen
      this.pendingFiles.push(file);
    }
    
    // Vorschau aktualisieren
    this.updateFilePreview();
  }
  
  updateFilePreview() {
    // Entfernen Sie alte Vorschau
    const existingPreview = document.getElementById('file-preview');
    if (existingPreview) {
      existingPreview.remove();
    }
    
    if (this.pendingFiles.length === 0) return;
    
    // Neue Vorschau erstellen
    const previewContainer = document.createElement('div');
    previewContainer.id = 'file-preview';
    previewContainer.className = 'file-preview-container';
    previewContainer.style.cssText = `
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 8px;
      margin-bottom: 8px;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    `;
    
    this.pendingFiles.forEach((file, index) => {
      const filePreview = document.createElement('div');
      filePreview.className = 'file-preview-item';
      filePreview.style.cssText = `
        background: rgba(33, 150, 243, 0.1);
        border: 1px solid rgba(33, 150, 243, 0.3);
        border-radius: 4px;
        padding: 4px 8px;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.85rem;
      `;
      
      // Icon basierend auf Dateityp
      let icon = '📎';
      if (file.type.startsWith('image/')) icon = '🖼️';
      else if (file.type === 'application/pdf') icon = '📄';
      else if (file.type.includes('word')) icon = '📝';
      
      filePreview.innerHTML = `
        <span>${icon}</span>
        <span>${file.name}</span>
        <button onclick="chatClient.removeFile(${index})" style="
          background: none;
          border: none;
          color: #f44336;
          cursor: pointer;
          padding: 2px;
          font-size: 1rem;
        ">&times;</button>
      `;
      
      previewContainer.appendChild(filePreview);
    });
    
    // Vorschau über dem Input-Bereich einfügen
    const inputContainer = document.querySelector('.message-input-container');
    const inputWrapper = document.querySelector('.message-input-wrapper');
    inputContainer.insertBefore(previewContainer, inputWrapper);
  }
  
  removeFile(index) {
    this.pendingFiles.splice(index, 1);
    this.updateFilePreview();
  }
  
  handleMessageSent(data) {
    // Update temporary message with real message ID
    const tempMessages = document.querySelectorAll('[data-temp-id]');
    
    if (tempMessages.length > 0) {
      // Use the first temporary message (most recent)
      const messageElement = tempMessages[0];
      messageElement.dataset.messageId = data.messageId;
      delete messageElement.dataset.tempId;
      
      const statusElement = messageElement.querySelector('.message-status');
      if (statusElement) {
        statusElement.innerHTML = '<span style="color: #9e9e9e;">✓</span>';
      }
    }
  }
  
  handleMessageDelivered(data) {
    // Update message status to delivered
    const messageElement = document.querySelector(`[data-message-id="${data.messageId}"]`);
    if (messageElement) {
      const statusElement = messageElement.querySelector('.message-status');
      if (statusElement) {
        statusElement.innerHTML = '<span style="color: #9e9e9e;">✓✓</span>';
      }
    }
  }

  toggleEmojiPicker() {
    const emojiPicker = document.getElementById('emojiPicker');
    if (emojiPicker.style.display === 'none' || !emojiPicker.style.display) {
      emojiPicker.style.display = 'flex';
      this.showEmojiCategory('smileys');
    } else {
      emojiPicker.style.display = 'none';
    }
  }
  
  showEmojiCategory(category) {
    const emojiContent = document.getElementById('emojiContent');
    const emojis = this.emojiCategories[category] || [];
    
    emojiContent.innerHTML = '';
    emojis.forEach(emoji => {
      const emojiItem = document.createElement('div');
      emojiItem.className = 'emoji-item';
      emojiItem.textContent = emoji;
      emojiItem.addEventListener('click', () => {
        this.insertEmoji(emoji);
      });
      emojiContent.appendChild(emojiItem);
    });
  }
  
  insertEmoji(emoji) {
    const messageInput = document.getElementById('messageInput');
    const cursorPos = messageInput.selectionStart;
    const textBefore = messageInput.value.substring(0, cursorPos);
    const textAfter = messageInput.value.substring(cursorPos);
    
    messageInput.value = textBefore + emoji + textAfter;
    messageInput.focus();
    messageInput.setSelectionRange(cursorPos + emoji.length, cursorPos + emoji.length);
    
    this.resizeTextarea();
  }
  
  toggleSearch() {
    const searchContainer = document.querySelector('.chat-search');
    if (!searchContainer) {
      // Create search container
      const chatHeader = document.getElementById('chat-header');
      const searchDiv = document.createElement('div');
      searchDiv.className = 'chat-search';
      searchDiv.innerHTML = `
        <div class="search-input-wrapper">
          <input type="text" class="search-input" id="searchInput" placeholder="Nachrichten durchsuchen...">
          <button class="search-close" onclick="chatClient.closeSearch()" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-secondary); cursor: pointer;">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="search-results" id="searchResults"></div>
      `;
      chatHeader.parentNode.insertBefore(searchDiv, chatHeader.nextSibling);
      
      // Add search event listener
      const searchInput = document.getElementById('searchInput');
      searchInput.addEventListener('input', (e) => {
        this.searchMessages(e.target.value);
      });
      searchInput.focus();
    } else {
      searchContainer.style.display = searchContainer.style.display === 'none' ? 'block' : 'none';
      if (searchContainer.style.display === 'block') {
        document.getElementById('searchInput').focus();
      }
    }
  }
  
  closeSearch() {
    const searchContainer = document.querySelector('.chat-search');
    if (searchContainer) {
      searchContainer.style.display = 'none';
    }
  }
  
  async searchMessages(query) {
    if (!query || query.length < 2) {
      document.getElementById('searchResults').innerHTML = '';
      return;
    }
    
    try {
      const response = await fetch(`/api/chat/conversations/${this.currentConversationId}/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const results = await response.json();
        this.displaySearchResults(results);
      }
    } catch (error) {
      console.error('Fehler bei der Suche:', error);
    }
  }
  
  displaySearchResults(results) {
    const resultsContainer = document.getElementById('searchResults');
    
    if (!results || results.length === 0) {
      resultsContainer.innerHTML = '<div style="padding: 10px; color: var(--text-secondary);">Keine Ergebnisse gefunden</div>';
      return;
    }
    
    resultsContainer.innerHTML = results.map(result => `
      <div class="search-result-item" onclick="chatClient.scrollToMessage(${result.id})">
        <div style="font-weight: 500;">${result.sender_name}</div>
        <div style="font-size: 0.85rem; color: var(--text-secondary);">${result.content}</div>
        <div style="font-size: 0.75rem; color: var(--text-secondary);">${new Date(result.created_at).toLocaleString('de-DE')}</div>
      </div>
    `).join('');
  }
  
  scrollToMessage(messageId) {
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      messageElement.style.animation = 'highlight 2s ease';
      setTimeout(() => {
        messageElement.style.animation = '';
      }, 2000);
    }
    this.closeSearch();
  }
  
  async addReaction(messageId, emoji) {
    try {
      const response = await fetch(`/api/chat/messages/${messageId}/reactions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ emoji })
      });
      
      if (response.ok) {
        // Reaction will be updated via WebSocket
      }
    } catch (error) {
      console.error('Fehler beim Hinzufügen der Reaktion:', error);
    }
  }
  
  async deleteCurrentConversation() {
    if (!this.currentConversationId) {
      this.showNotification('Keine Unterhaltung ausgewählt', 'warning');
      return;
    }
    
    if (!confirm('Möchten Sie diese Unterhaltung wirklich löschen? Alle Nachrichten werden unwiderruflich gelöscht.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/chat/conversations/${this.currentConversationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      
      if (response.ok) {
        this.showNotification('Unterhaltung gelöscht', 'success');
        
        // Remove from conversations list
        this.conversations = this.conversations.filter(c => c.id !== this.currentConversationId);
        this.currentConversationId = null;
        
        // Update UI
        this.renderConversations();
        document.getElementById('messagesContainer').innerHTML = `
          <div class="empty-chat" id="noChatSelected">
            <div class="empty-chat-icon">
              <i class="fas fa-comments"></i>
            </div>
            <h3>Willkommen im Chat</h3>
            <p>Wählen Sie eine Unterhaltung aus der Liste oder starten Sie eine neue Nachricht.</p>
          </div>
        `;
        document.getElementById('chatArea').style.display = 'none';
        document.getElementById('chat-header').style.display = 'none';
      } else {
        const error = await response.json();
        this.showNotification(error.message || 'Fehler beim Löschen der Unterhaltung', 'error');
      }
    } catch (error) {
      console.error('Fehler beim Löschen der Unterhaltung:', error);
      this.showNotification('Fehler beim Löschen der Unterhaltung', 'error');
    }
  }
}

// Chat-Client initialisieren wenn Seite geladen ist
document.addEventListener('DOMContentLoaded', () => {
  window.chatClient = new ChatClient();
  
  // Add CSS for highlight animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes highlight {
      0% { background-color: rgba(33, 150, 243, 0.3); }
      100% { background-color: transparent; }
    }
  `;
  document.head.appendChild(style);
});