/**
 * Unified Navigation Component für alle Dashboards
 * Verwendet rolle-basierte Menüs mit Glassmorphismus-Design
 */

// Import types
import type { User } from '../../../../backend/src/types/models';
import type { NavItem } from '../../types/utils.types';

// Declare global type for window
declare global {
  interface Window {
    UnifiedNavigation: typeof UnifiedNavigation;
    unifiedNav: UnifiedNavigation;
  }
}

interface NavigationItems {
  admin: NavItem[];
  employee: NavItem[];
  root: NavItem[];
}

interface TokenPayload {
  id: number;
  username: string;
  role: 'admin' | 'employee' | 'root';
  tenantId?: number | null;
  email?: string;
}

interface UserProfileResponse {
  user?: User;
  username?: string;
  first_name?: string;
  last_name?: string;
  birthdate?: string;
  profile_picture?: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  profilePicture?: string;
  company_name?: string;
  subdomain?: string;
}

interface UnreadCountResponse {
  unreadCount?: number;
}

interface PendingCountResponse {
  pendingCount?: number;
}

class UnifiedNavigation {
  private currentUser: TokenPayload | null = null;
  private currentRole: 'admin' | 'employee' | 'root' | null = null;
  private navigationItems: NavigationItems;

  constructor() {
    this.navigationItems = this.getNavigationItems();
    this.init();
  }

  private init(): void {
    this.loadUserInfo();
    this.injectNavigationHTML();
    this.attachEventListeners();
  }

  private loadUserInfo(): void {
    // User-Info aus Token oder Session laden
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1])) as TokenPayload;
        this.currentUser = payload;
        this.currentRole = payload.role;

        // Also try to load full user profile
        this.loadFullUserProfile();
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  }

  private async loadFullUserProfile(): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      if (!token || token === 'test-mode') return;

      const response = await fetch('/api/user/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData: UserProfileResponse = await response.json();
        const user = userData.user || userData;

        // Update company info (new)
        const companyElement = document.getElementById('sidebar-company-name');
        if (companyElement && userData.company_name) {
          companyElement.textContent = userData.company_name;
        }

        const domainElement = document.getElementById('sidebar-domain');
        if (domainElement && userData.subdomain) {
          domainElement.textContent = `${userData.subdomain}.assixx.de`;
        }

        // Update user info card with full details
        const sidebarUserName = document.getElementById('sidebar-user-name');
        if (sidebarUserName) {
          sidebarUserName.textContent = userData.username || user.username || this.currentUser?.username || 'User';
        }

        const sidebarFullName = document.getElementById('sidebar-user-fullname');
        if (sidebarFullName) {
          const firstName = userData.first_name || userData.firstName || (user as User).firstName || '';
          const lastName = userData.last_name || userData.lastName || (user as User).lastName || '';
          if (firstName || lastName) {
            const fullName = `${firstName} ${lastName}`.trim();
            sidebarFullName.textContent = fullName;
          }
        }

        // Birthdate removed as requested

        // Update avatar if we have profile picture
        const sidebarAvatar = document.getElementById('sidebar-user-avatar') as HTMLImageElement;
        if (sidebarAvatar) {
          const profilePic = userData.profile_picture || userData.profilePicture || (user as User).profilePicture;
          if (profilePic) {
            sidebarAvatar.src = profilePic;
          }
        }
      }
    } catch (error) {
      console.error('Error loading full user profile:', error);
    }
  }

  private getNavigationItems(): NavigationItems {
    return {
      // Admin Navigation (14 Items)
      admin: [
        {
          id: 'dashboard',
          icon: this.getSVGIcon('home'),
          label: 'Übersicht',
          url: '/pages/admin-dashboard.html',
          section: 'dashboard',
        },
        {
          id: 'employees',
          icon: this.getSVGIcon('users'),
          label: 'Mitarbeiter',
          url: '#employees',
          section: 'employees',
          children: [
            {
              id: 'employees-list',
              label: 'Mitarbeiterliste',
              url: '#employees',
              section: 'employees',
            },
          ],
        },
        {
          id: 'departments',
          icon: this.getSVGIcon('building'),
          label: 'Abteilungen',
          url: '#departments',
          section: 'departments',
          children: [
            {
              id: 'departments-all',
              label: 'Alle Abteilungen',
              url: '#departments',
              section: 'departments',
            },
          ],
        },
        {
          id: 'documents',
          icon: this.getSVGIcon('document'),
          label: 'Dokumente',
          url: '#documents',
          section: 'documents',
        },
        {
          id: 'calendar',
          icon: this.getSVGIcon('calendar'),
          label: 'Kalender',
          url: '/pages/calendar.html',
        },
        {
          id: 'shifts',
          icon: this.getSVGIcon('clock'),
          label: 'Schichtplanung',
          url: '/pages/shifts.html',
        },
        {
          id: 'chat',
          icon: this.getSVGIcon('chat'),
          label: 'Chat',
          url: '/pages/chat.html',
          badge: 'unread-messages',
        },
        {
          id: 'kvp',
          icon: this.getSVGIcon('lightbulb'),
          label: 'KVP System',
          url: '/pages/kvp.html',
        },
        {
          id: 'surveys',
          icon: this.getSVGIcon('poll'),
          label: 'Umfragen',
          url: '/pages/survey-admin.html',
        },
        {
          id: 'payslips',
          icon: this.getSVGIcon('money'),
          label: 'Gehaltsabrechnungen',
          url: '#payslips',
          section: 'payslips',
        },
        {
          id: 'teams',
          icon: this.getSVGIcon('team'),
          label: 'Teams',
          url: '#teams',
          section: 'teams',
        },
        {
          id: 'settings',
          icon: this.getSVGIcon('settings'),
          label: 'Einstellungen',
          url: '#settings',
          section: 'settings',
        },
        {
          id: 'features',
          icon: this.getSVGIcon('feature'),
          label: 'Feature Management',
          url: '/pages/feature-management.html',
        },
      ],

      // Employee Navigation (9 Items)
      employee: [
        {
          id: 'dashboard',
          icon: this.getSVGIcon('home'),
          label: 'Dashboard',
          url: '/pages/employee-dashboard.html',
        },
        {
          id: 'documents',
          icon: this.getSVGIcon('document'),
          label: 'Meine Dokumente',
          url: '/pages/employee-documents.html',
        },
        {
          id: 'calendar',
          icon: this.getSVGIcon('calendar'),
          label: 'Kalender',
          url: '/pages/calendar.html',
        },
        {
          id: 'chat',
          icon: this.getSVGIcon('chat'),
          label: 'Chat',
          url: '/pages/chat.html',
          badge: 'unread-messages',
        },
        {
          id: 'shifts',
          icon: this.getSVGIcon('clock'),
          label: 'Schichtplanung',
          url: '/pages/shifts.html',
        },
        {
          id: 'kvp',
          icon: this.getSVGIcon('lightbulb'),
          label: 'KVP System',
          url: '/pages/kvp.html',
        },
        {
          id: 'surveys',
          icon: this.getSVGIcon('poll'),
          label: 'Umfragen',
          url: '/pages/survey-employee.html',
          badge: 'pending-surveys',
        },
        {
          id: 'profile',
          icon: this.getSVGIcon('user'),
          label: 'Mein Profil',
          url: '/pages/profile.html',
        },
      ],

      // Root Navigation (erweitert)
      root: [
        {
          id: 'dashboard',
          icon: this.getSVGIcon('home'),
          label: 'Root Dashboard',
          url: '/pages/root-dashboard.html',
        },
        {
          id: 'admins',
          icon: this.getSVGIcon('admin'),
          label: 'Administratoren',
          url: '/pages/manage-admins.html',
        },
        {
          id: 'features',
          icon: this.getSVGIcon('feature'),
          label: 'Features',
          url: '/pages/root-features.html',
        },
        {
          id: 'profile',
          icon: this.getSVGIcon('user'),
          label: 'Mein Profil',
          url: '/pages/root-profile.html',
        },
        {
          id: 'system',
          icon: this.getSVGIcon('settings'),
          label: 'System',
          url: '#system',
          section: 'system',
        },
      ],
    };
  }

  private getSVGIcon(name: string): string {
    const icons: Record<string, string> = {
      home: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>',
      users:
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>',
      user: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>',
      document:
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/></svg>',
      blackboard:
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>',
      calendar:
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7v-5z"/></svg>',
      clock:
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>',
      chat: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>',
      lightbulb:
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M9 21c0 .5.4 1 1 1h4c.6 0 1-.5 1-1v-1H9v1zm3-19C8.1 2 5 5.1 5 9c0 2.4 1.2 4.5 3 5.7V17h8v-2.3c1.8-1.3 3-3.4 3-5.7 0-3.9-3.1-7-7-7z"/></svg>',
      money:
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>',
      building:
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12,3L1,9V21H23V9M21,19H3V10.53L12,5.68L21,10.53M8,15H10V19H8M12,15H14V19H12M16,15H18V19H16Z"/></svg>',
      team: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>',
      settings:
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></svg>',
      feature:
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19,8L15,12H18C18,15.31 15.31,18 12,18C10.99,18 10.03,17.75 9.2,17.3L7.74,18.76C8.97,19.54 10.43,20 12,20C16.42,20 20,16.42 20,12H23M6,12C6,8.69 8.69,6 12,6C13.01,6 13.97,6.25 14.8,6.7L16.26,5.24C15.03,4.46 13.57,4 12,4C7.58,4 4,7.58 4,12H1L5,16L9,12"/></svg>',
      admin:
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11H9.2V10C9.2,8.6 10.6,7 12,7M8.2,16V13H15.8V16H8.2Z"/></svg>',
      poll: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3,22V8H7V22H3M10,22V2H14V22H10M17,22V14H21V22H17Z"/></svg>',
    };
    return icons[name] || icons.home;
  }

  private getNavigationForRole(role: 'admin' | 'employee' | 'root' | null): NavItem[] {
    if (!role) return [];
    return this.navigationItems[role] || [];
  }

  private injectNavigationHTML(): void {
    const navigation = this.createNavigationHTML();

    // Suche nach bestehender Sidebar und ersetze sie
    const existingSidebar = document.querySelector('.sidebar');
    if (existingSidebar) {
      existingSidebar.innerHTML = navigation;
    } else {
      // Erstelle neue Sidebar falls keine existiert
      this.createSidebarStructure();
    }
  }

  private createSidebarStructure(): void {
    const body = document.body;
    const existingLayout = document.querySelector('.layout-container');

    if (!existingLayout) {
      // Erstelle Layout-Container falls nicht vorhanden
      const header = document.querySelector('.header');
      const container = document.querySelector('.container');

      const layoutContainer = document.createElement('div');
      layoutContainer.className = 'layout-container';

      const sidebar = document.createElement('aside');
      sidebar.className = 'sidebar';
      sidebar.innerHTML = this.createNavigationHTML();

      const mainContent = document.createElement('main');
      mainContent.className = 'main-content';
      if (container) {
        mainContent.appendChild(container);
      }

      layoutContainer.appendChild(sidebar);
      layoutContainer.appendChild(mainContent);

      if (header) {
        body.insertBefore(layoutContainer, header.nextSibling);
      } else {
        body.appendChild(layoutContainer);
      }
    }
  }

  private createNavigationHTML(): string {
    const menuItems = this.getNavigationForRole(this.currentRole);

    // Storage Widget nur für Root User
    const storageWidget = this.currentRole === 'root' ? this.createStorageWidget() : '';

    return `
            <nav class="sidebar-nav">
                <button class="sidebar-toggle" id="sidebar-toggle" title="Sidebar ein-/ausklappen">
                    <svg class="toggle-icon" width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <path class="toggle-icon-path" d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z"/>
                    </svg>
                </button>
                <button class="sidebar-title blackboard-button" onclick="window.location.href='/pages/blackboard.html'" title="Zum Schwarzen Brett">
                    <span class="title-icon pinned-icon">
                        <span class="pin-head"></span>
                        <span class="pin-needle"></span>
                    </span>
                    <span class="title-content">
                        <span class="title-text">Schwarzes Brett</span>
                    </span>
                </button>
                <div class="user-info-card" id="sidebar-user-info-card">
                    <img id="sidebar-user-avatar" class="user-avatar" src="/assets/images/default-avatar.svg" alt="Avatar">
                    <div class="user-details">
                        <div class="company-info">
                            <div class="company-name" id="sidebar-company-name">Firmennamen lädt...</div>
                            <div class="company-domain" id="sidebar-domain">Domain lädt...</div>
                        </div>
                        <div class="user-name" id="sidebar-user-name">${this.currentUser?.username || 'User'}</div>
                        <div class="user-full-name" id="sidebar-user-fullname"></div>
                        <div class="user-role-badge">${this.getRoleDisplay()}</div>
                    </div>
                </div>
                <ul class="sidebar-menu">
                    ${menuItems.map((item, index) => this.createMenuItem(item, index === 0)).join('')}
                </ul>
                ${storageWidget}
            </nav>
        `;
  }

  private createMenuItem(item: NavItem, isActive: boolean = false): string {
    const activeClass = isActive ? 'active' : '';
    const hasChildren = item.children && item.children.length > 0;
    const clickHandler = item.section && !hasChildren ? `onclick="showSection('${item.section}')"` : '';

    // Badge für ungelesene Nachrichten oder offene Umfragen
    let badgeHtml = '';
    if (item.badge === 'unread-messages') {
      badgeHtml = `<span class="nav-badge" id="chat-unread-badge" style="display: none; position: absolute; top: 8px; right: 10px; background: #ff4444; color: white; font-size: 0.7rem; padding: 2px 6px; border-radius: 10px; font-weight: bold; min-width: 18px; text-align: center;">0</span>`;
    } else if (item.badge === 'pending-surveys') {
      badgeHtml = `<span class="nav-badge" id="surveys-pending-badge" style="display: none; position: absolute; top: 8px; right: 10px; background: #ff9800; color: white; font-size: 0.7rem; padding: 2px 6px; border-radius: 10px; font-weight: bold; min-width: 18px; text-align: center;">0</span>`;
    }

    // If has children, create a dropdown
    if (hasChildren) {
      const submenuItems = item.children!.map(child => `
        <li class="submenu-item">
          <a href="${child.url}" class="submenu-link" ${child.section ? `onclick="showSection('${child.section}')"` : ''} data-nav-id="${child.id}">
            <span class="submenu-label">${child.label}</span>
          </a>
        </li>
      `).join('');

      return `
        <li class="sidebar-item has-submenu ${activeClass}" style="position: relative;">
          <a href="#" class="sidebar-link" onclick="toggleSubmenu(event, '${item.id}')" data-nav-id="${item.id}">
            <span class="icon">${item.icon}</span>
            <span class="label">${item.label}</span>
            <span class="nav-indicator"></span>
            <span class="submenu-arrow">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 10l5 5 5-5z"/>
              </svg>
            </span>
            ${badgeHtml}
          </a>
          <ul class="submenu" id="submenu-${item.id}" style="display: none;">
            ${submenuItems}
          </ul>
        </li>
      `;
    }

    return `
            <li class="sidebar-item ${activeClass}" style="position: relative;">
                <a href="${item.url}" class="sidebar-link" ${clickHandler} data-nav-id="${item.id}">
                    <span class="icon">${item.icon}</span>
                    <span class="label">${item.label}</span>
                    <span class="nav-indicator"></span>
                    ${badgeHtml}
                </a>
            </li>
        `;
  }

  // Removed unused method getUserInitials

  private getRoleDisplay(): string {
    const roleMap: Record<string, string> = {
      admin: 'Administrator',
      employee: 'Mitarbeiter',
      root: 'Root User',
    };
    return roleMap[this.currentRole || ''] || this.currentRole || '';
  }

  private attachEventListeners(): void {
    // Navigation Link Clicks
    document.addEventListener('click', (e: MouseEvent) => {
      const navLink = (e.target as HTMLElement).closest('.sidebar-link') as HTMLElement;
      if (navLink) {
        this.handleNavigationClick(navLink, e);
      }

      // Logout Button Click
      if (e.target && (e.target as HTMLElement).id === 'logout-btn') {
        this.handleLogout();
      }
    });

    // Sidebar Toggle
    this.attachSidebarToggle();

    // Update active state on page load
    this.updateActiveNavigation();
  }

  private attachSidebarToggle(): void {
    const toggleBtn = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (!toggleBtn || !sidebar) return;

    // Check localStorage for saved state
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed) {
      sidebar.classList.add('collapsed');
      mainContent?.classList.add('sidebar-collapsed');
      this.updateToggleIcon();
    }

    // Toggle click handler
    toggleBtn.addEventListener('click', () => {
      const isCurrentlyCollapsed = sidebar.classList.contains('collapsed');
      const newState = !isCurrentlyCollapsed;
      
      sidebar.classList.toggle('collapsed');
      mainContent?.classList.toggle('sidebar-collapsed');
      
      // Save state
      localStorage.setItem('sidebarCollapsed', newState.toString());
      
      // Update icon
      this.updateToggleIcon();
    });

    // Hover effect for toggle button
    toggleBtn.addEventListener('mouseenter', () => {
      const isCollapsed = sidebar.classList.contains('collapsed');
      const iconPath = toggleBtn.querySelector('.toggle-icon-path');
      if (iconPath) {
        if (isCollapsed) {
          // Show arrow right when collapsed
          iconPath.setAttribute('d', 'M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z');
        } else {
          // Show sidebar left when expanded
          iconPath.setAttribute('d', 'M14,7L9,12L14,17V7Z');
        }
      }
    });

    toggleBtn.addEventListener('mouseleave', () => {
      const iconPath = toggleBtn.querySelector('.toggle-icon-path');
      if (iconPath) {
        // Reset to hamburger menu
        iconPath.setAttribute('d', 'M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z');
      }
    });

    // Add tooltips for collapsed sidebar items
    this.addCollapsedTooltips();
  }

  private updateToggleIcon(): void {
    const iconPath = document.querySelector('.toggle-icon-path');
    if (iconPath) {
      // Keep hamburger menu as default
      iconPath.setAttribute('d', 'M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z');
    }
  }

  private addCollapsedTooltips(): void {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    const navItems = sidebar.querySelectorAll('.sidebar-link');
    navItems.forEach(item => {
      const label = item.querySelector('.label')?.textContent;
      if (label) {
        item.setAttribute('title', '');
        
        // Show tooltip only when sidebar is collapsed
        item.addEventListener('mouseenter', () => {
          if (sidebar.classList.contains('collapsed')) {
            item.setAttribute('title', label);
          } else {
            item.setAttribute('title', '');
          }
        });
      }
    });
  }

  private handleLogout(): void {
    // Remove token and redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('activeNavigation');

    // Clear user session
    sessionStorage.clear();

    // Redirect to login page
    window.location.href = '/pages/login.html';
  }

  private handleNavigationClick(link: HTMLElement, _event: MouseEvent): void {
    // Update active state
    document.querySelectorAll('.sidebar-item').forEach((item) => {
      item.classList.remove('active');
    });
    link.closest('.sidebar-item')?.classList.add('active');

    // Store active navigation
    const navId = link.dataset.navId;
    if (navId) {
      localStorage.setItem('activeNavigation', navId);
    }

    // Add navigation animation
    this.animateNavigation(link);
  }

  private updateActiveNavigation(): void {
    const activeNav = localStorage.getItem('activeNavigation');
    const currentPath = window.location.pathname;

    // Remove all active states
    document.querySelectorAll('.sidebar-item').forEach((item) => {
      item.classList.remove('active');
    });

    // Set active based on current page or stored state
    if (activeNav) {
      const activeLink = document.querySelector(`[data-nav-id="${activeNav}"]`);
      if (activeLink) {
        activeLink.closest('.sidebar-item')?.classList.add('active');
      }
    } else {
      // Auto-detect active page
      this.autoDetectActivePage(currentPath);
    }
  }

  private autoDetectActivePage(currentPath: string): void {
    const menuItems = this.getNavigationForRole(this.currentRole);
    const matchingItem = menuItems.find((item) => {
      if (!item.url || item.url.startsWith('#')) return false;
      return currentPath.includes(item.url.replace('/', ''));
    });

    if (matchingItem) {
      const link = document.querySelector(`[data-nav-id="${matchingItem.id}"]`);
      if (link) {
        link.closest('.sidebar-item')?.classList.add('active');
      }
    }
  }

  private animateNavigation(link: HTMLElement): void {
    // Add ripple effect
    const ripple = document.createElement('span');
    ripple.className = 'nav-ripple';
    link.appendChild(ripple);

    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 600);
  }

  // Public method to refresh navigation
  public refresh(): void {
    this.loadUserInfo();
    this.injectNavigationHTML();
    this.attachEventListeners();
    
    // Restore sidebar state after refresh
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed) {
      const sidebar = document.querySelector('.sidebar');
      const mainContent = document.querySelector('.main-content');
      sidebar?.classList.add('collapsed');
      mainContent?.classList.add('sidebar-collapsed');
    }
  }

  // Public method to set active navigation
  public setActive(navId: string): void {
    localStorage.setItem('activeNavigation', navId);
    this.updateActiveNavigation();
  }

  // Ungelesene Chat-Nachrichten aktualisieren
  public async updateUnreadMessages(): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      if (!token || token === 'test-mode') return;

      const response = await fetch('/api/chat/unread-count', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data: UnreadCountResponse = await response.json();
        const badge = document.getElementById('chat-unread-badge');
        if (badge) {
          const count = data.unreadCount || 0;
          if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count.toString();
            badge.style.display = 'inline-block';
          } else {
            badge.style.display = 'none';
          }
        }
      }
    } catch (error) {
      console.error('Error updating unread messages:', error);
    }
  }

  // Offene Umfragen aktualisieren
  public async updatePendingSurveys(): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      if (!token || token === 'test-mode') return;

      // Nur für Employees
      const role = localStorage.getItem('userRole');
      if (role !== 'employee') return;

      const response = await fetch('/api/surveys/pending-count', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data: PendingCountResponse = await response.json();
        const badge = document.getElementById('surveys-pending-badge');
        if (badge) {
          const count = data.pendingCount || 0;
          if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count.toString();
            badge.style.display = 'inline-block';
          } else {
            badge.style.display = 'none';
          }
        }
      }
    } catch (error) {
      console.error('Error updating pending surveys:', error);
    }
  }

  // Storage Widget erstellen (nur für Root User)
  private createStorageWidget(): string {
    return `
      <div class="storage-widget" id="storage-widget">
        <div class="storage-header">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19,11H5V9H19M19,7H5V5H19M5,15H11V13H5M3,21H21A2,2 0 0,1 19,19V3A2,2 0 0,1 21,1H3A2,2 0 0,1 5,3V19A2,2 0 0,1 3,21Z"/>
          </svg>
          <span>Speicherplatz</span>
        </div>
        <div class="storage-info">
          <div class="storage-usage-text">
            <span id="storage-used">0 GB</span> von <span id="storage-total">0 GB</span>
          </div>
          <div class="storage-progress">
            <div class="storage-progress-bar" id="storage-progress-bar" style="width: 0%"></div>
          </div>
          <div class="storage-percentage" id="storage-percentage">0% belegt</div>
        </div>
        <button class="storage-upgrade-btn" onclick="window.location.href='/pages/storage-upgrade.html'">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
          </svg>
          Speicher erweitern
        </button>
      </div>
    `;
  }

  // Storage-Informationen aktualisieren
  public async updateStorageInfo(): Promise<void> {
    if (this.currentRole !== 'root') return;

    try {
      const token = localStorage.getItem('token');
      if (!token || token === 'test-mode') return;

      const response = await fetch('/api/root/storage-info', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const { used, total, percentage } = data;

        // Update UI
        const usedElement = document.getElementById('storage-used');
        const totalElement = document.getElementById('storage-total');
        const progressBar = document.getElementById('storage-progress-bar') as HTMLElement;
        const percentageElement = document.getElementById('storage-percentage');

        if (usedElement) usedElement.textContent = this.formatBytes(used);
        if (totalElement) totalElement.textContent = this.formatBytes(total);
        if (progressBar) {
          progressBar.style.width = `${percentage}%`;

          // Farbe basierend auf Nutzung
          if (percentage >= 90) {
            progressBar.style.backgroundColor = 'var(--error-color)';
          } else if (percentage >= 70) {
            progressBar.style.backgroundColor = 'var(--warning-color)';
          } else {
            progressBar.style.backgroundColor = 'var(--success-color)';
          }
        }
        if (percentageElement) percentageElement.textContent = `${percentage}% belegt`;
      }
    } catch (error) {
      console.error('Error updating storage info:', error);
    }
  }

  // Bytes in lesbare Form konvertieren
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 GB';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }
}

// CSS Styles für die Unified Navigation
const unifiedNavigationCSS = `
    .header .header-actions {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
    }

    .header .header-actions #user-info {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        background: rgba(255, 255, 255, 0.1);
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: 20px;
        border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .header .header-actions #user-info::before {
        content: "";
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 600;
        font-size: 0.9rem;
    }

    .sidebar {
        width: 280px;
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(20px);
        border-right: 1px solid rgba(255, 255, 255, 0.1);
        height: calc(100vh - 60px);
        position: fixed;
        left: 0;
        top: 60px;
        transition: all 0.3s ease;
        overflow-y: auto;
        overflow-x: hidden;
    }

    /* Scrollbar Styling */
    .sidebar::-webkit-scrollbar {
        width: 6px;
    }

    .sidebar::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
    }

    .sidebar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 3px;
    }

    .sidebar::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.3);
    }

    .sidebar-nav {
        padding: var(--spacing-md);
        min-height: 100%;
        display: flex;
        flex-direction: column;
        overflow: visible;
        position: relative;
    }

    .sidebar-title {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.875rem;
        font-weight: 600;
        color: #333;
        margin: 60px 0 var(--spacing-sm) 0;
        padding: var(--spacing-sm) var(--spacing-md);
        background: #e6b800;
        
        border-radius: 0px;
        border: none;
        transition: all 0.3s ease;
        cursor: pointer;
        width: 98%;
        margin-left: 1%;
        margin-right: 1%;
        text-align: center;
        position: relative;
        box-shadow: 0 8px 1px rgb(59, 36, 0), 0 2px 2px rgb(0, 0, 0);
        overflow: visible;
        transform: rotate(-3deg);
    }

    /* Sticky Note folded corner - inner fold */
    .sidebar-title::after {
        content: '';
        position: absolute;
        bottom: 0;
        right: 0;
        width: 20px;
        height: 20px;
        background: linear-gradient(45deg, transparent 50%, rgba(0, 0, 0, 0.1) 50%);
        transform: rotate(45deg);
        transform-origin: bottom right;
    }

    .sidebar-title::before {
        content: '';
        position: absolute;
        bottom: 0;
        right: 0;
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 20px 20px 0 0;
        border-color: #fff transparent #0000 transparent;
        z-index: 1;
    }

    .sidebar-title:hover {
        transform: rotate(-1deg) translateY(-2px);
        box-shadow: 
            0 5px 10px rgba(0, 0, 0, 0.25),
            0 2px 4px rgba(0, 0, 0, 0.15);
    }

    .sidebar-title:hover .pin-head {
        opacity: 0;
    }

    .sidebar-title:hover .pin-needle {
        opacity: 1;
        top: -18px;
    }

    .sidebar-title:active {
        transform: rotate(-1deg) translateY(0);
    }

    /* Pinned icon styles */
    .pinned-icon {
        position: absolute;
        top: -10px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 2;
    }

    /* Pin head (only the head visible - like pushed in) */
    .pin-head {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #d32f2f;
        display: block;
        position: relative;
        box-shadow: 
            0 3px 6px rgba(0, 0, 0, 0.4),
            inset -2px -2px 3px rgba(0, 0, 0, 0.3),
            inset 2px 2px 3px rgba(255, 255, 255, 0.4);
        transition: all 0.2s ease;
    }

    .pin-head::after {
        content: '';
        position: absolute;
        top: 4px;
        left: 4px;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.7);
    }

    /* Pin needle (appears on hover - full pushpin) */
    .pin-needle {
        position: absolute;
        top: -10px;
        left: 50%;
        transform: translateX(-50%);
        opacity: 0;
        transition: all 0.3s ease;
        z-index: 2;
    }

    /* Pin needle head */
    .pin-needle::before {
        content: '';
        position: absolute;
        top: -10px;
        left: 50%;
        transform: translateX(-50%);
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #d32f2f;
        box-shadow: 
            0 3px 6px rgba(0, 0, 0, 0.4),
            inset -2px -2px 3px rgba(0, 0, 0, 0.3),
            inset 2px 2px 3px rgba(255, 255, 255, 0.4);
    }

    /* Pin needle shaft */
    .pin-needle::after {
        content: '';
        position: absolute;
        top: 8px;
        left: 50%;
        transform: translateX(-50%);
        width: 2px;
        height: 22px;
        background: linear-gradient(to bottom, 
            #aaa 0%, 
            #888 50%, 
            #666 100%);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
    }

    .title-content {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-sm);
        width: 100%;
        min-width: 0;
    }

    .title-text {
        transition: opacity 0.3s ease, width 0.3s ease;
        white-space: nowrap;
        overflow: hidden;
    }

    .sidebar-toggle {
        position: absolute;
        top: 10px;
        left: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        background: rgba(255, 255, 255, 0);
        border: 1px solid rgba(255, 255, 255, 0);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        color: white;
        z-index: 100;
    }

    .sidebar-toggle:hover {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.3);
        transform: scale(1.05);
    }

    .sidebar-toggle:hover .toggle-icon {
        opacity: 0.8;
    }

    .toggle-icon {
        transition: transform 0.3s ease;
    }

    /* Collapsed Sidebar Styles */
    .sidebar.collapsed {
        width: 70px;
    }

    .sidebar.collapsed .sidebar-title {
        padding: var(--spacing-sm);
        justify-content: center;
        margin: 40px 4px var(--spacing-sm) 4px;
        width: calc(100% - 8px);
        font-size: 0;
        transform: rotate(-2deg);
        background: #e6b800;
        min-height: 40px;
    }

    .sidebar.collapsed .title-text {
        opacity: 0;
        width: 0;
        display: none;
    }

    .sidebar.collapsed .title-content {
        gap: 0;
        justify-content: center;
    }

    .sidebar.collapsed .sidebar-toggle {
        left: 2px;
        width: 30px;
        height: 30px;
        position: relative;
    }

    .sidebar.collapsed .pinned-icon {
        top: -9px;
    }

    .sidebar.collapsed .pin-head {
        width: 16px;
        height: 16px;
    }

    .sidebar.collapsed .pin-head::after {
        width: 5px;
        height: 5px;
        top: 3px;
        left: 3px;
    }

    .sidebar.collapsed .user-info-card {
        padding: var(--spacing-md);
        flex-direction: column;
        align-items: center;
        min-height: auto;
    }

    .sidebar.collapsed .user-details {
        display: none;
    }

    .sidebar.collapsed .sidebar-link {
        padding: var(--spacing-sm);
        justify-content: center;
    }

    .sidebar.collapsed .sidebar-link .label {
        display: none;
    }

    .sidebar.collapsed .submenu-arrow {
        display: none;
    }

    .sidebar.collapsed .submenu {
        display: none !important;
    }

    .sidebar.collapsed .storage-widget {
        display: none;
    }

    /* Main content adjustment for collapsed sidebar */
    .main-content.sidebar-collapsed {
        margin-left: 70px;
    }
    
    /* Container full width when sidebar collapsed */
    .main-content.sidebar-collapsed .container {
        max-width: none;
    }
    
    /* Content sections full width when sidebar collapsed */
    .main-content.sidebar-collapsed .content-section {
        max-width: none;
        width: 100%;
    }
    
    /* Cards inside collapsed layout use more space */
    .main-content.sidebar-collapsed .card {
        max-width: none;
    }


    /* Tooltip styles for collapsed items */
    .sidebar.collapsed .sidebar-link,
    .sidebar.collapsed .sidebar-title {
        position: relative;
    }

    .sidebar.collapsed .sidebar-link:hover::after,
    .sidebar.collapsed .sidebar-title:hover::after {
        content: attr(title);
        position: absolute;
        left: 100%;
        top: 50%;
        transform: translateY(-50%);
        margin-left: 10px;
        padding: 8px 12px;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        border-radius: 6px;
        font-size: 14px;
        white-space: nowrap;
        z-index: 1000;
        pointer-events: none;
        opacity: 0;
        animation: tooltipFadeIn 0.3s ease forwards;
    }

    @keyframes tooltipFadeIn {
        to {
            opacity: 1;
        }
    }

    /* Badge adjustments for collapsed sidebar */
    .sidebar.collapsed .nav-badge {
        position: absolute !important;
        top: 4px !important;
        right: 4px !important;
        left: auto !important;
        font-size: 0.6rem !important;
        padding: 1px 4px !important;
        min-width: 14px !important;
    }

    /* Smooth transitions */
    .sidebar,
    .main-content,
    .sidebar-link,
    .sidebar-link .label,
    .title-text,
    .user-details,
    .storage-widget {
        transition: all 0.3s ease;
    }

    /* Icon centering in collapsed state */
    .sidebar.collapsed .sidebar-link .icon {
        margin: 0;
    }

    .user-info-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: var(--spacing-lg) var(--spacing-xl);
        background: rgba(255, 255, 255, 0.02);
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: var(--radius-lg);
        margin-bottom: 20px;
        position: relative;
        overflow: hidden;
        transition: all 0.3s ease;
        box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        min-height: 100px;
        animation: fadeInUp 0.6s ease-out;
        margin-top:15px;
    }

    /* Welcome hero style gradient backgrounds */
    .user-info-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background:
            radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.07) 0%, transparent 50%);
        opacity: 1;
        z-index: 0;
    }

    .user-info-card::after {
        content: '';
        position: absolute;
        top: -50%;
        right: -20%;
        width: 200px;
        height: 200px;
        
        border-radius: 50%;
        z-index: 0;
    }

    .user-info-card > * {
        position: relative;
        z-index: 1;
    }

    .user-info-card:hover {
        background: rgba(255, 255, 255, 0.03);
        transform: translateY(-5px);
        border-color: rgba(33, 150, 243, 0.3);
        box-shadow: 
            0 12px 40px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.15),
            0 0 40px rgba(33, 150, 243, 0.1);
    }

    /* Avatar Styles - Ohne Border */
    #sidebar-user-avatar,
    .sidebar .user-avatar,
    .user-info-card .user-avatar {
        display: block !important;
        width: 34px !important;
        height: 34px !important;
        border-radius: 12px !important;
        object-fit: cover !important;
        border: none !important;
        flex-shrink: 0 !important;
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    /* Avatar padding when sidebar is collapsed */
    .sidebar.collapsed .user-avatar {
        padding: 3px;
    }

    .user-info-card:hover .user-avatar {
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .user-details {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
    }

    .company-info {
        display: flex;
        align-items: baseline;
        gap: 6px;
        margin-bottom: 4px;
    }

    .company-name {
        font-weight: 600;
        color: var(--primary-light);
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        text-shadow: 0 0 20px rgba(33, 150, 243, 0.5);
    }

    .company-domain {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.5);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .user-name {
        font-weight: 500;
        color: var(--text-primary);
        font-size: 15px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 1.2;
    }

    .user-full-name {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.6);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .user-role-badge {
        display: inline-flex;
        align-items: center;
        font-size: 11px;
        color: rgba(251, 191, 36, 0.9);
        background: rgba(251, 191, 36, 0.1);
        padding: 3px 8px;
        border-radius: 6px;
        text-transform: uppercase;
        letter-spacing: 0.8px;
        font-weight: 700;
        border: 1px solid rgba(251, 191, 36, 0.2);
        width: fit-content;
        margin-top: 4px;
        transition: all 0.2s ease;
    }

    .user-info-card:hover .user-role-badge {
        background: rgba(251, 191, 36, 0.15);
        border-color: rgba(251, 191, 36, 0.3);
    }
    

    .sidebar-menu {
        list-style: none;
        padding: 0;
        margin: 0;
        flex: 1;
    }

    .sidebar-item {
        margin-bottom: var(--spacing-xs);
    }

    .sidebar-link {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-sm) var(--spacing-md);
        color: var(--text-secondary);
        text-decoration: none;
        border-radius: 18px;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        border: 1px solid transparent;
        font-size: 0.9rem;
    }

    .sidebar-link:hover {
        background: rgba(33, 150, 243, 0.1);
        color: var(--primary-color);
        transform: translateY(-2px);
        border-color: rgba(33, 150, 243, 0.2);
        box-shadow: 0 4px 12px rgba(33, 150, 243, 0.15);
    }

    .sidebar-item.active .sidebar-link {
        background: linear-gradient(135deg, rgba(33, 150, 243, 0.15), rgba(33, 150, 243, 0.08));
        color: var(--primary-color);
        border-color: rgba(33, 150, 243, 0.3);
        box-shadow: 0 4px 20px rgba(33, 150, 243, 0.2);
    }

    .sidebar-link .icon {
        min-width: 20px;
        text-align: center;
        transition: all 0.3s ease;
    }

    .sidebar-link .label {
        font-weight: 500;
        flex: 1;
    }

    .nav-indicator {
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: transparent;
        transition: all 0.3s ease;
    }

    .sidebar-item.active .nav-indicator {
        background: var(--primary-color);
        box-shadow: 0 0 6px rgba(33, 150, 243, 0.6);
    }

    .nav-ripple {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(33, 150, 243, 0.3);
        transform: translate(-50%, -50%);
        animation: ripple 0.6s ease-out;
    }

    @keyframes ripple {
        to {
            width: 200px;
            height: 200px;
            opacity: 0;
        }
    }

    /* Submenu Styles */
    .sidebar-item.has-submenu .sidebar-link {
        position: relative;
    }

    .submenu-arrow {
        margin-left: auto;
        transition: transform 0.3s ease;
        opacity: 0.6;
    }

    .sidebar-item.has-submenu.open .submenu-arrow {
        transform: rotate(180deg);
    }

    .submenu {
        margin-left: 32px;
        margin-top: 4px;
        margin-bottom: 8px;
        list-style: none;
        padding: 0;
        overflow: hidden;
        transition: all 0.3s ease;
    }

    .submenu-item {
        margin-bottom: 2px;
    }

    .submenu-link {
        display: block;
        padding: 8px 16px;
        color: var(--text-secondary);
        text-decoration: none;
        font-size: 0.85rem;
        border-radius: 12px;
        transition: all 0.2s ease;
        border: 1px solid transparent;
    }

    .submenu-link:hover {
        background: rgba(33, 150, 243, 0.08);
        color: var(--primary-color);
        border-color: rgba(33, 150, 243, 0.15);
        transform: translateX(4px);
    }

    .submenu-link.active {
        background: rgba(33, 150, 243, 0.12);
        color: var(--primary-color);
        border-color: rgba(33, 150, 243, 0.2);
        font-weight: 500;
    }

    /* Layout adjustments */
    .layout-container {
        display: flex;
        min-height: calc(100vh - 60px);
        margin-top: 60px;
    }

    .main-content {
        flex: 1;
        margin-left: 280px;
        padding: var(--spacing-xl);
        background: var(--background-primary);
        min-height: calc(100vh - 60px);
    }

    /* Storage Widget - Glassmorphismus Style */
    .storage-widget {
        position: sticky;
        bottom: 0;
        margin: var(--spacing-md);
        margin-top: auto;
        background: rgba(255, 255, 255, 0.03);
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: var(--radius-lg);
        padding: var(--spacing-md);
        box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        transition: all 0.3s ease;
    }

    .storage-widget:hover {
        background: rgba(255, 255, 255, 0.05);
        transform: translateY(-2px);
        box-shadow: 
            0 10px 40px rgba(33, 150, 243, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }

    .storage-header {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-md);
        color: var(--primary-color);
        font-weight: 600;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .storage-info {
        margin-bottom: var(--spacing-md);
    }

    .storage-usage-text {
        font-size: 13px;
        color: var(--text-secondary);
        margin-bottom: var(--spacing-sm);
    }

    .storage-usage-text span {
        color: var(--text-primary);
        font-weight: 600;
    }

    .storage-progress {
        width: 100%;
        height: 8px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: var(--spacing-xs);
        box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
    }

    .storage-progress-bar {
        height: 100%;
        background: var(--success-color);
        border-radius: 4px;
        transition: width 0.5s ease, background-color 0.3s ease;
        position: relative;
        overflow: hidden;
    }

    .storage-progress-bar::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        background: linear-gradient(
            45deg,
            transparent 25%,
            rgba(255, 255, 255, 0.2) 25%,
            rgba(255, 255, 255, 0.2) 50%,
            transparent 50%,
            transparent 75%,
            rgba(255, 255, 255, 0.2) 75%,
            rgba(255, 255, 255, 0.2)
        );
        background-size: 20px 20px;
        animation: progress-stripes 1s linear infinite;
    }

    @keyframes progress-stripes {
        0% {
            background-position: 0 0;
        }
        100% {
            background-position: 20px 20px;
        }
    }

    .storage-percentage {
        font-size: 12px;
        color: var(--text-secondary);
        text-align: right;
    }

    .storage-upgrade-btn {
        width: 100%;
        padding: var(--spacing-sm) var(--spacing-md);
        background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
        color: white;
        border: none;
        border-radius: var(--radius-sm);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-xs);
        box-shadow: 
            0 2px 8px rgba(33, 150, 243, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }

    .storage-upgrade-btn:hover {
        transform: translateY(-2px);
        box-shadow: 
            0 6px 20px rgba(33, 150, 243, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
        .sidebar {
            width: 100%;
            transform: translateX(-100%);
            top: 60px;
        }

        .sidebar.mobile-open {
            transform: translateX(0);
        }

        .main-content {
            margin-left: 0;
        }

        .layout-container {
            flex-direction: column;
        }

        .storage-widget {
            position: relative;
            bottom: auto;
            left: auto;
            right: auto;
            margin-top: var(--spacing-lg);
        }
    }
`;

// CSS automatisch einbinden
if (!document.querySelector('#unified-navigation-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'unified-navigation-styles';
  styleSheet.textContent = unifiedNavigationCSS;
  document.head.appendChild(styleSheet);
}

// Export to window for backwards compatibility

// Global function for submenu toggle
(window as any).toggleSubmenu = function(event: Event, itemId: string) {
  event.preventDefault();
  const submenu = document.getElementById(`submenu-${itemId}`);
  const parentItem = submenu?.closest('.sidebar-item');
  
  if (submenu && parentItem) {
    const isOpen = submenu.style.display !== 'none';
    
    // Close all other submenus
    document.querySelectorAll('.submenu').forEach(menu => {
      (menu as HTMLElement).style.display = 'none';
      menu.closest('.sidebar-item')?.classList.remove('open');
    });
    
    // Toggle current submenu
    if (!isOpen) {
      submenu.style.display = 'block';
      parentItem.classList.add('open');
    }
  }
};

// Navigation automatisch initialisieren
document.addEventListener('DOMContentLoaded', () => {
  window.unifiedNav = new UnifiedNavigation();

  // Ungelesene Nachrichten beim Start und periodisch aktualisieren
  if (window.unifiedNav && typeof window.unifiedNav.updateUnreadMessages === 'function') {
    window.unifiedNav.updateUnreadMessages();
    setInterval(() => window.unifiedNav.updateUnreadMessages(), 30000); // Alle 30 Sekunden
  }

  // Offene Umfragen beim Start und periodisch aktualisieren
  if (window.unifiedNav && typeof window.unifiedNav.updatePendingSurveys === 'function') {
    window.unifiedNav.updatePendingSurveys();
    setInterval(() => window.unifiedNav.updatePendingSurveys(), 30000); // Alle 30 Sekunden
  }

  // Storage-Informationen für Root User beim Start und periodisch aktualisieren
  if (window.unifiedNav && typeof window.unifiedNav.updateStorageInfo === 'function') {
    window.unifiedNav.updateStorageInfo();
    setInterval(() => window.unifiedNav.updateStorageInfo(), 60000); // Alle 60 Sekunden
  }
});

// Export to window for legacy support
window.UnifiedNavigation = UnifiedNavigation;

// Export for ES modules
export default UnifiedNavigation;
