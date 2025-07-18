/**
 * New Shift Planning System - TypeScript Implementation
 * Interactive weekly shift planning with drag & drop functionality
 */

import type { User } from '../types/api.types';

import { getAuthToken, showSuccess, showError, showInfo } from './auth';
import { openModal } from './utils/modal-manager';

interface Employee extends User {
  department_id?: number;
  team_id?: number;
  shift_assignments?: ShiftAssignment[];
  availability_status?: 'available' | 'unavailable' | 'vacation' | 'sick';
}

interface ShiftAssignment {
  id: number;
  employee_id: number;
  date: string;
  shift_type: 'early' | 'late' | 'night';
  department_id?: number;
  machine_id?: number;
  team_leader_id?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface Department {
  id: number;
  name: string;
  description?: string;
}

interface Machine {
  id: number;
  name: string;
  department_id: number;
  description?: string;
}

interface TeamLeader {
  id: number;
  name: string;
  username: string;
}

interface SelectedContext {
  departmentId: number | null;
  machineId: number | null;
  teamLeaderId: number | null;
}

interface WeeklyShifts {
  [key: string]: {
    [key: string]: number[];
  };
}

interface ShiftsWindow extends Window {
  selectOption: (type: string, value: string, text: string) => void;
}

class ShiftPlanningSystem {
  private currentWeek: Date;
  private selectedEmployee: Employee | null;
  private employees: Employee[];
  private weeklyShifts: WeeklyShifts;
  private shiftDetails: {
    [key: string]: {
      employee_id: number;
      first_name: string;
      last_name: string;
      username: string;
    };
  };
  private isAdmin: boolean;
  private userRole: string;
  private currentUserId: number | null;
  private isDragging: boolean;

  // Context data for shift planning
  private departments: Department[];
  private machines: Machine[];
  private teamLeaders: TeamLeader[];
  private selectedContext: SelectedContext;

  private weeklyNotes: string;

  constructor() {
    this.currentWeek = new Date();
    this.selectedEmployee = null;
    this.employees = [];
    this.weeklyShifts = {};
    this.shiftDetails = {};
    this.isAdmin = false;
    this.userRole = '';
    this.currentUserId = null;
    this.isDragging = false;

    // Context data for shift planning
    this.departments = [];
    this.machines = [];
    this.teamLeaders = [];
    this.selectedContext = {
      departmentId: null,
      machineId: null,
      teamLeaderId: null,
    };

    this.weeklyNotes = '';

    void this.init();
  }

  async init(): Promise<void> {
    console.info('[SHIFTS] Initializing Shift Planning System...');

    try {
      // Check user authentication and role
      console.log('[SHIFTS DEBUG] Checking user role...');
      await this.checkUserRole();
      console.log('[SHIFTS DEBUG] User role:', this.userRole, 'Is admin:', this.isAdmin);

      // Initialize event listeners
      console.log('[SHIFTS DEBUG] Setting up event listeners...');
      this.setupEventListeners();

      // Load context data
      console.log('[SHIFTS DEBUG] Loading context data...');
      await this.loadContextData();

      // Load initial data
      console.log('[SHIFTS DEBUG] Loading employees...');
      await this.loadEmployees();
      console.log('[SHIFTS DEBUG] Loaded employees:', this.employees.length);

      console.log('[SHIFTS DEBUG] Loading current week data...');
      await this.loadCurrentWeekData();

      console.log('[SHIFTS DEBUG] Loading weekly notes...');
      try {
        await this.loadWeeklyNotes();
      } catch (error) {
        console.error('[SHIFTS ERROR] Failed to load weekly notes:', error);
      }

      // Update UI based on user role
      console.log('[SHIFTS DEBUG] Updating UI for role:', this.userRole);
      this.updateUIForRole();

      // Check if department is selected and toggle visibility
      this.togglePlanningAreaVisibility();

      // For employees, load department info
      if (!this.isAdmin && this.selectedContext.departmentId) {
        await this.loadDepartments();
      }

      // Load notes again after department is properly set
      if (this.selectedContext.departmentId) {
        console.log('[SHIFTS DEBUG] Loading notes after department is set:', this.selectedContext.departmentId);
        await this.loadWeeklyNotes();
      }

      // Highlight employee's own shifts
      this.highlightEmployeeShifts();

      console.info('[SHIFTS] Shift Planning System initialized successfully');
    } catch (error) {
      console.error('[SHIFTS ERROR] Failed to initialize:', error);
    }
  }

  async checkUserRole(): Promise<void> {
    try {
      // First check localStorage for active role (for role switching)
      const activeRole = localStorage.getItem('activeRole');
      const storedRole = localStorage.getItem('userRole');

      const user = await this.getStoredUserData();
      if (user) {
        // Use activeRole if available (for role switching), otherwise use API role or stored role
        this.userRole = activeRole ?? (user.role || storedRole || 'employee');
        this.isAdmin = ['admin', 'root', 'manager', 'team_lead'].includes(this.userRole);
        this.currentUserId = user.id;

        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
          userNameElement.textContent = user.username ?? 'User';
        }

        // For employees, set their department as selected
        if (!this.isAdmin && user.department_id) {
          this.selectedContext.departmentId = user.department_id;
          console.log('[SHIFTS DEBUG] Employee department auto-selected:', user.department_id);
        }

        // Update info row with user's department/team info
        const currentDeptElement = document.getElementById('currentDepartment');
        if (currentDeptElement && user.department_id) {
          currentDeptElement.textContent = `Department ${user.department_id}`;
        }

        const currentTeamLeaderElement = document.getElementById('currentTeamLeader');
        if (currentTeamLeaderElement && user.position) {
          currentTeamLeaderElement.textContent = user.username ?? '';
        }
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  }

  private async getStoredUserData(): Promise<User | null> {
    const token = getAuthToken();
    if (!token) return null;

    try {
      const response = await fetch('/api/user/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }

    return null;
  }

  setupEventListeners(): void {
    console.log('[SHIFTS DEBUG] Setting up event listeners');

    // Week navigation
    const prevBtn = document.getElementById('prevWeekBtn');
    const nextBtn = document.getElementById('nextWeekBtn');

    console.log('[SHIFTS DEBUG] Previous week button:', prevBtn);
    console.log('[SHIFTS DEBUG] Next week button:', nextBtn);

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        console.log('[SHIFTS DEBUG] Previous week button clicked');
        this.navigateWeek(-1);
      });
    } else {
      console.error('[SHIFTS ERROR] Previous week button not found!');
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        console.log('[SHIFTS DEBUG] Next week button clicked');
        this.navigateWeek(1);
      });
    } else {
      console.error('[SHIFTS ERROR] Next week button not found!');
    }

    // Employee selection (fallback for non-drag interaction)
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const employeeItem = target.closest('.employee-item') as HTMLElement;
      if (employeeItem && !this.isDragging) {
        this.selectEmployee(employeeItem);
      }
    });

    // Shift cell assignment (fallback for non-drag interaction)
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const shiftCell = target.closest('.shift-cell') as HTMLElement;
      if (shiftCell && this.isAdmin && !this.isDragging) {
        this.assignEmployeeToShift(shiftCell);
      } else if (shiftCell && !this.isAdmin && !this.isDragging) {
        // Show shift details modal for employees
        this.showShiftDetailsModal(shiftCell);
      }
    });

    // Drag & Drop Events
    this.setupDragAndDrop();

    // Context selection events
    this.setupContextEvents();

    // Weekly notes functionality
    this.setupNotesEvents();

    // Admin actions
    document.getElementById('saveScheduleBtn')?.addEventListener('click', () => void this.saveSchedule());
    document.getElementById('resetScheduleBtn')?.addEventListener('click', () => void this.resetSchedule());

    // Remove logout functionality - handled by unified navigation
  }

  setupDragAndDrop(): void {
    console.log('[SHIFTS DEBUG] Setting up drag and drop. Is admin:', this.isAdmin);
    if (!this.isAdmin) {
      console.log('[SHIFTS DEBUG] User is not admin, drag & drop disabled');
      return;
    }

    // Drag start on employee items
    document.addEventListener('dragstart', (e) => {
      const target = e.target as HTMLElement;
      const employeeItem = target.closest('.employee-item') as HTMLElement;

      if (employeeItem) {
        console.log('[SHIFTS DEBUG] Drag start on employee:', employeeItem.dataset.employeeId);

        // Check if employee is available for dragging
        if (employeeItem.getAttribute('draggable') === 'false') {
          console.log('[SHIFTS DEBUG] Employee not draggable, preventing drag');
          e.preventDefault();
          return;
        }

        this.isDragging = true;
        employeeItem.classList.add('dragging');

        const employeeId = employeeItem.dataset.employeeId;
        if (employeeId && e.dataTransfer) {
          console.log('[SHIFTS DEBUG] Setting drag data:', employeeId);
          e.dataTransfer.effectAllowed = 'copy';
          e.dataTransfer.setData('text/plain', employeeId);
        }
      }
    });

    // Drag end
    document.addEventListener('dragend', (e) => {
      const target = e.target as HTMLElement;
      const employeeItem = target.closest('.employee-item') as HTMLElement;

      if (employeeItem) {
        this.isDragging = false;
        employeeItem.classList.remove('dragging');
      }
    });

    // Drag over shift cells
    document.addEventListener('dragover', (e) => {
      const target = e.target as HTMLElement;
      const shiftCell = target.closest('.shift-cell') as HTMLElement;

      if (shiftCell) {
        e.preventDefault();
        if (e.dataTransfer) {
          e.dataTransfer.dropEffect = 'copy';
        }
        shiftCell.classList.add('drag-over');
      }
    });

    // Drag leave
    document.addEventListener('dragleave', (e) => {
      const target = e.target as HTMLElement;
      const shiftCell = target.closest('.shift-cell') as HTMLElement;

      if (shiftCell) {
        shiftCell.classList.remove('drag-over');
      }
    });

    // Drop on shift cells
    document.addEventListener('drop', (e) => {
      const target = e.target as HTMLElement;
      const shiftCell = target.closest('.shift-cell') as HTMLElement;

      console.log('[SHIFTS DEBUG] Drop event on:', target);

      if (shiftCell) {
        e.preventDefault();
        shiftCell.classList.remove('drag-over');

        const employeeId = e.dataTransfer?.getData('text/plain');
        console.log('[SHIFTS DEBUG] Dropped employee ID:', employeeId);

        if (employeeId) {
          this.assignShift(shiftCell, parseInt(employeeId));
        } else {
          console.error('[SHIFTS ERROR] No employee ID in drop data');
        }
      }
    });
  }

  setupContextEvents(): void {
    // Department selection
    const departmentSelect = document.getElementById('departmentSelect') as HTMLSelectElement;
    departmentSelect?.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      this.selectedContext.departmentId = target.value ? parseInt(target.value) : null;
      void this.onContextChange();
      this.togglePlanningAreaVisibility();
    });

    // Machine selection
    const machineSelect = document.getElementById('machineSelect') as HTMLSelectElement;
    machineSelect?.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      this.selectedContext.machineId = target.value ? parseInt(target.value) : null;
    });
  }

  setupNotesEvents(): void {
    const notesToggle = document.getElementById('notesToggle') as HTMLElement;
    const notesPanel = document.getElementById('notesPanel') as HTMLElement;
    const notesTextarea = document.getElementById('weeklyNotes') as HTMLTextAreaElement;

    notesToggle?.addEventListener('click', () => {
      notesPanel?.classList.toggle('show');
      if (notesPanel?.classList.contains('show')) {
        notesTextarea?.focus();
      }
    });
  }

  async loadContextData(): Promise<void> {
    await Promise.all([this.loadDepartments(), this.loadMachines()]);
  }

  async loadDepartments(): Promise<void> {
    try {
      const response = await fetch('/api/departments', {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.info('Departments API response:', data);
        // API returns array directly
        this.departments = Array.isArray(data) ? data : [];
      } else {
        throw new Error('Failed to load departments');
      }
    } catch (error) {
      console.error('Error loading departments:', error);
      // Fallback data
      this.departments = [
        { id: 1, name: 'Produktion' },
        { id: 2, name: 'Logistik' },
        { id: 3, name: 'Qualitätssicherung' },
        { id: 4, name: 'Wartung' },
      ];
    }
    this.populateDepartmentSelect();
  }

  async loadMachines(): Promise<void> {
    try {
      let url = '/api/machines';
      if (this.selectedContext.departmentId) {
        url += `?department_id=${this.selectedContext.departmentId}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        this.machines = data.machines ?? [];
      } else {
        throw new Error('Failed to load machines');
      }
    } catch (error) {
      console.error('Error loading machines:', error);
      // Fallback data
      this.machines = [
        { id: 1, name: 'Anlage 01', department_id: 1 },
        { id: 2, name: 'Anlage 02', department_id: 1 },
        { id: 3, name: 'Förderband A', department_id: 2 },
        { id: 4, name: 'Förderband B', department_id: 2 },
        { id: 5, name: 'Prüfstand 01', department_id: 3 },
      ];
    }
    this.populateMachineSelect();
  }

  async loadTeamLeaders(): Promise<void> {
    // Skip loading team leaders for non-admins
    // Team leaders are not used anymore
    this.teamLeaders = [];
    this.populateTeamLeaderSelect();
  }

  populateDepartmentSelect(): void {
    const dropdown = document.getElementById('departmentDropdown');
    if (!dropdown) {
      console.error('Department dropdown element not found');
      return;
    }

    dropdown.innerHTML = '';

    console.info('Populating departments:', this.departments);
    this.departments.forEach((dept) => {
      const option = document.createElement('div');
      option.className = 'dropdown-option';
      option.textContent = dept.name;
      option.onclick = () => {
        interface ShiftsWindow extends Window {
          selectOption: (type: string, value: string, text: string) => void;
        }
        (window as unknown as ShiftsWindow).selectOption('department', dept.id.toString(), dept.name);
      };
      dropdown.appendChild(option);
    });

    console.info('Department dropdown populated with', this.departments.length, 'departments');
  }

  populateMachineSelect(): void {
    const dropdown = document.getElementById('machineDropdown');
    if (!dropdown) return;

    dropdown.innerHTML = '';

    // Filter machines by selected department if any
    let filteredMachines = this.machines;
    if (this.selectedContext.departmentId) {
      filteredMachines = this.machines.filter((machine) => machine.department_id === this.selectedContext.departmentId);
    }

    filteredMachines.forEach((machine) => {
      const option = document.createElement('div');
      option.className = 'dropdown-option';
      option.textContent = machine.name;
      option.onclick = () => {
        (window as unknown as ShiftsWindow).selectOption('machine', machine.id.toString(), machine.name);
      };
      dropdown.appendChild(option);
    });
  }

  populateTeamLeaderSelect(): void {
    const dropdown = document.getElementById('teamLeaderDropdown');
    if (!dropdown) return;

    dropdown.innerHTML = '';

    this.teamLeaders.forEach((leader) => {
      const option = document.createElement('div');
      option.className = 'dropdown-option';
      option.textContent = leader.name ?? leader.username;
      option.onclick = () => {
        (window as unknown as ShiftsWindow).selectOption(
          'teamLeader',
          leader.id.toString(),
          leader.name || leader.username,
        );
      };
      dropdown.appendChild(option);
    });
  }

  async onContextChange(): Promise<void> {
    // Reload machines when department changes
    if (this.selectedContext.departmentId) {
      await this.loadMachines();
    }

    // Reload employees based on context
    await this.loadEmployees();

    // Reload weekly notes for new department
    await this.loadWeeklyNotes();
  }

  togglePlanningAreaVisibility(): void {
    const departmentNotice = document.getElementById('departmentNotice');
    const mainPlanningArea = document.getElementById('mainPlanningArea');
    const adminActions = document.getElementById('adminActions');
    const weekNavigation = document.querySelector('.week-navigation') as HTMLElement;

    if (this.selectedContext.departmentId || !this.isAdmin) {
      // Department selected (or employee with auto-selected dept) - show planning area
      if (departmentNotice) departmentNotice.style.display = 'none';
      if (mainPlanningArea) mainPlanningArea.style.display = '';
      if (adminActions && this.isAdmin) adminActions.style.display = 'block';
      if (weekNavigation) weekNavigation.style.display = 'flex';

      // Load data for the selected department
      void this.loadCurrentWeekData().then(() => {
        // Load notes after shift data is loaded
        if (this.selectedContext.departmentId) {
          console.log('[SHIFTS DEBUG] Loading notes in togglePlanningAreaVisibility');
          void this.loadWeeklyNotes();
        }
      });
    } else {
      // No department selected (only for admins) - show notice
      if (departmentNotice) departmentNotice.style.display = 'block';
      if (mainPlanningArea) mainPlanningArea.style.display = 'none';
      if (adminActions) adminActions.style.display = 'none';
      if (weekNavigation) weekNavigation.style.display = 'none';
    }
  }

  async loadEmployees(): Promise<void> {
    // For non-admins, we need to load employees from their department only
    if (!this.isAdmin && !this.selectedContext.departmentId) {
      console.log('[SHIFTS DEBUG] No department selected for employee');
      this.employees = [];
      return;
    }

    try {
      // First load users
      let url = '/api/users';
      const params = new URLSearchParams();

      if (this.selectedContext.departmentId) {
        params.append('department_id', this.selectedContext.departmentId.toString());
      }
      if (this.selectedContext.teamLeaderId) {
        params.append('team_leader_id', this.selectedContext.teamLeaderId.toString());
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const users = Array.isArray(data) ? data : (data.users ?? []);
        this.employees = users.filter((user: User) => user.role === 'employee');

        console.log('[SHIFTS DEBUG] Employees loaded:', this.employees.length, 'employees');
        console.log('[SHIFTS DEBUG] Employee data:', this.employees);

        // Now load current availability status
        await this.loadAvailabilityStatus();

        this.renderEmployeeList();
      } else {
        console.error('[SHIFTS ERROR] Failed to load employees, status:', response.status);
        throw new Error('Failed to load employees');
      }
    } catch (error) {
      console.error('Error loading employees:', error);
      // Fallback data
      this.employees = [];
      this.renderEmployeeList();
    }
  }

  async loadAvailabilityStatus(): Promise<void> {
    try {
      const response = await fetch('/api/availability/current', {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const availabilityData = data.employees ?? [];

        // Update employees with availability status
        this.employees = this.employees.map((emp) => {
          const availability = availabilityData.find(
            (a: { employeeId: number; availabilityStatus?: string }) => a.employeeId === emp.id,
          );
          if (availability) {
            emp.availability_status = availability.availabilityStatus ?? 'available';
          }
          return emp;
        });
      }
    } catch (error) {
      console.error('Error loading availability status:', error);
      // Continue without availability status
    }
  }

  renderEmployeeList(): void {
    // Don't render if no employees loaded
    if (this.employees.length === 0) {
      console.log('[SHIFTS DEBUG] No employees to render');
      return;
    }

    const container = document.getElementById('employeeList');
    console.log('[SHIFTS DEBUG] Employee list container:', container);

    if (!container) {
      console.error('[SHIFTS ERROR] Employee list container not found!');
      return;
    }

    container.innerHTML = '';
    console.log('[SHIFTS DEBUG] Rendering employees:', this.employees.length);

    this.employees.forEach((employee) => {
      const item = document.createElement('div');
      item.className = 'employee-item';
      item.dataset.employeeId = employee.id.toString();

      // Only available employees can be dragged
      const isDraggable =
        this.isAdmin && (employee.availability_status === 'available' || !employee.availability_status);
      item.setAttribute('draggable', isDraggable.toString());

      console.log(
        '[SHIFTS DEBUG] Employee:',
        employee.username,
        'Draggable:',
        isDraggable,
        'Status:',
        employee.availability_status,
      );

      // Add visual indicators for unavailable employees
      if (employee.availability_status && employee.availability_status !== 'available') {
        item.classList.add('unavailable', `status-${employee.availability_status}`);
      }

      const name = `${employee.first_name ?? ''} ${employee.last_name ?? ''}`.trim() || employee.username;
      const statusIcon = this.getAvailabilityIcon(employee.availability_status);
      const statusBadge = this.getAvailabilityBadge(employee.availability_status);

      item.innerHTML = `
        <div class="employee-info">
          <span class="employee-name">${this.escapeHtml(name)}</span>
          ${statusIcon}
          ${statusBadge}
        </div>
        <div class="employee-stats">
          <span class="shift-count">0</span>
        </div>
      `;

      container.appendChild(item);
    });

    console.log('[SHIFTS DEBUG] Employee list rendered');
    // Update shift counts
    this.updateEmployeeShiftCounts();
  }

  getAvailabilityIcon(status?: string): string {
    switch (status) {
      case 'vacation':
        return '<i class="fas fa-plane status-icon vacation" title="Im Urlaub"></i>';
      case 'sick':
        return '<i class="fas fa-notes-medical status-icon sick" title="Krank"></i>';
      case 'unavailable':
        return '<i class="fas fa-ban status-icon unavailable" title="Nicht verfügbar"></i>';
      default:
        return '';
    }
  }

  getAvailabilityBadge(status?: string): string {
    switch (status) {
      case 'available':
        return '<span class="badge badge-success">Verfügbar</span>';
      case 'vacation':
        return '<span class="badge badge-warning">Urlaub</span>';
      case 'sick':
        return '<span class="badge badge-danger">Krank</span>';
      case 'unavailable':
        return '<span class="badge badge-secondary">Nicht verfügbar</span>';
      default:
        // Default to available if no status is set
        return '<span class="badge badge-success">Verfügbar</span>';
    }
  }

  updateEmployeeShiftCounts(): void {
    // Reset all counts
    document.querySelectorAll('.shift-count').forEach((el) => {
      el.textContent = '0';
    });

    // Count shifts for each employee
    const shiftCounts: { [key: number]: number } = {};

    Object.values(this.weeklyShifts).forEach((dayShifts) => {
      Object.values(dayShifts).forEach((employeeIds) => {
        employeeIds.forEach((employeeId) => {
          shiftCounts[employeeId] = (shiftCounts[employeeId] || 0) + 1;
        });
      });
    });

    // Update UI
    Object.entries(shiftCounts).forEach(([employeeId, count]) => {
      const item = document.querySelector(`[data-employee-id="${employeeId}"] .shift-count`);
      if (item) {
        item.textContent = count.toString();
      }
    });
  }

  selectEmployee(employeeItem: HTMLElement): void {
    if (!this.isAdmin) return;

    // Remove previous selection
    document.querySelectorAll('.employee-item').forEach((item) => {
      item.classList.remove('selected');
    });

    // Add selection to clicked item
    employeeItem.classList.add('selected');

    const employeeId = parseInt(employeeItem.dataset.employeeId ?? '0');
    this.selectedEmployee = this.employees.find((e) => e.id === employeeId) ?? null;
  }

  assignEmployeeToShift(shiftCell: HTMLElement): void {
    if (!this.isAdmin || !this.selectedEmployee) return;

    // Let assignShift handle the date calculation
    this.assignShift(shiftCell, this.selectedEmployee.id);
  }

  assignShift(shiftCell: HTMLElement, employeeId: number): void {
    let date = shiftCell.dataset.date;
    const day = shiftCell.dataset.day;
    const shift = shiftCell.dataset.shift;

    // If no date but day exists, calculate date from current week
    if (!date && day) {
      const dayIndex = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].indexOf(day);
      if (dayIndex !== -1) {
        const weekStart = this.getWeekStart(this.currentWeek);
        const cellDate = new Date(weekStart);
        cellDate.setDate(cellDate.getDate() + dayIndex);
        date = this.formatDateKey(cellDate);
        // Also set the data-date attribute for future use
        shiftCell.dataset.date = date;
      }
    }

    console.log('[SHIFTS DEBUG] Assigning shift:', { date, day, shift, employeeId });

    if (!date || !shift) {
      console.error('[SHIFTS ERROR] Missing date or shift data on cell');
      return;
    }

    const employee = this.employees.find((e) => e.id === employeeId);
    if (!employee) {
      console.error('[SHIFTS ERROR] Employee not found:', employeeId);
      return;
    }

    console.log('[SHIFTS DEBUG] Found employee:', employee);

    // Check if employee is available
    if (employee.availability_status && employee.availability_status !== 'available') {
      console.log('[SHIFTS DEBUG] Employee not available:', employee.availability_status);

      // Get status text and badge color
      const statusText =
        {
          vacation: 'Urlaub',
          sick: 'Krank',
          unavailable: 'Beurlaubt',
        }[employee.availability_status] || employee.availability_status;

      const employeeName = `${employee.first_name ?? ''} ${employee.last_name ?? ''}`.trim() || employee.username;

      showError(`Mitarbeiter kann nicht zugewiesen werden: ${employeeName} ist ${statusText}`);
      return;
    }

    // Check if employee already has a shift on this day
    const shiftsOnThisDay = this.weeklyShifts[date] ?? {};
    const employeeName = `${employee.first_name ?? ''} ${employee.last_name ?? ''}`.trim() || employee.username;

    // Check all shifts on this day
    for (const [shiftType, employeeIds] of Object.entries(shiftsOnThisDay)) {
      if (shiftType !== shift && employeeIds.includes(employeeId)) {
        // Employee already has another shift on this day
        const shiftNames: { [key: string]: string } = {
          early: 'Frühschicht',
          late: 'Spätschicht',
          night: 'Nachtschicht',
        };

        showError(
          `Doppelschicht nicht erlaubt! ${employeeName} ist bereits für die ${shiftNames[shiftType]} eingeteilt. Ein Mitarbeiter kann nur eine Schicht pro Tag übernehmen.`,
        );
        return;
      }
    }

    // Initialize data structures if needed
    if (!this.weeklyShifts[date]) {
      this.weeklyShifts[date] = {};
    }
    if (!this.weeklyShifts[date][shift]) {
      this.weeklyShifts[date][shift] = [];
    }

    // Check if employee is already assigned to this shift
    if (this.weeklyShifts[date][shift].includes(employeeId)) {
      // Remove assignment
      this.weeklyShifts[date][shift] = this.weeklyShifts[date][shift].filter((id) => id !== employeeId);
    } else {
      // Add assignment
      this.weeklyShifts[date][shift].push(employeeId);
    }

    // Update UI - pass the cell directly
    this.renderShiftAssignments(shiftCell, date, shift);
    this.updateEmployeeShiftCounts();
  }

  renderShiftAssignments(shiftCell: HTMLElement, date: string, shift: string): void {
    if (!shiftCell) return;

    // Find the employee-assignment div within the cell
    const assignmentDiv = shiftCell.querySelector('.employee-assignment');
    if (!assignmentDiv) {
      console.error('[SHIFTS ERROR] No employee-assignment div found in cell');
      return;
    }

    // Clear existing content
    assignmentDiv.innerHTML = '';

    const employeeIds = this.weeklyShifts[date]?.[shift] ?? [];

    if (employeeIds.length === 0) {
      // Show empty slot
      assignmentDiv.innerHTML = '<div class="empty-slot">Mitarbeiter zuweisen</div>';
    } else {
      // Create employee cards for assigned employees
      employeeIds.forEach((employeeId) => {
        const employee = this.employees.find((e) => e.id === employeeId);
        if (employee) {
          const card = this.createEmployeeCard(employee);
          assignmentDiv.appendChild(card);
        }
      });
    }
  }

  async loadCurrentWeekData(): Promise<void> {
    try {
      const weekStart = this.getWeekStart(this.currentWeek);
      const weekEnd = this.getWeekEnd(this.currentWeek);

      // Format dates for API
      const startStr = this.formatDate(weekStart);
      const endStr = this.formatDate(weekEnd);

      console.log('[SHIFTS DEBUG] Loading shifts for range:', startStr, 'to', endStr);

      const response = await fetch(`/api/shifts?start=${startStr}&end=${endStr}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[SHIFTS DEBUG] API Response:', data);
        console.log('[SHIFTS DEBUG] Number of shifts:', data.shifts?.length ?? 0);
        if (data.shifts && data.shifts.length > 0) {
          console.log('[SHIFTS DEBUG] First shift:', data.shifts[0]);
        }
        this.processShiftData(data.shifts ?? []);
        this.renderWeekView();
      } else {
        throw new Error('Failed to load shift data');
      }
    } catch (error) {
      console.error('Error loading shift data:', error);
      this.renderWeekView();
    }
  }

  processShiftData(
    shifts: Array<{
      date: string;
      shift_type: string;
      employee_id: number;
      first_name: string;
      last_name: string;
      username: string;
    }>,
  ): void {
    this.weeklyShifts = {};
    this.shiftDetails = {}; // Store full shift details including names
    console.log('[SHIFTS DEBUG] Processing shifts:', shifts);

    shifts.forEach((shift) => {
      // Extract date part only (YYYY-MM-DD) from potentially full datetime string
      const dateString = shift.date;
      const date = dateString.split('T')[0]; // Get only YYYY-MM-DD part
      const shiftType = shift.shift_type;

      // Skip custom shifts or convert them based on time
      if (shiftType === 'custom') {
        console.log('[SHIFTS DEBUG] Skipping custom shift type');
        return; // Skip this shift for now
      }

      console.log('[SHIFTS DEBUG] Processing shift:', {
        originalDate: dateString,
        extractedDate: date,
        shiftType,
        employee_id: shift.employee_id,
        employee_name: `${shift.first_name} ${shift.last_name}`,
      });

      if (!this.weeklyShifts[date]) {
        this.weeklyShifts[date] = {};
      }
      if (!this.weeklyShifts[date][shiftType]) {
        this.weeklyShifts[date][shiftType] = [];
      }

      this.weeklyShifts[date][shiftType].push(shift.employee_id);

      // Store the full shift details including names
      if (!this.shiftDetails[`${date}_${shiftType}_${shift.employee_id}`]) {
        this.shiftDetails[`${date}_${shiftType}_${shift.employee_id}`] = {
          employee_id: shift.employee_id,
          first_name: shift.first_name,
          last_name: shift.last_name,
          username: shift.username,
        };
      }
    });

    console.log('[SHIFTS DEBUG] Final weeklyShifts:', this.weeklyShifts);
    console.log('[SHIFTS DEBUG] Shift details:', this.shiftDetails);
  }

  renderWeekView(): void {
    const weekStart = this.getWeekStart(this.currentWeek);

    console.log('[SHIFTS DEBUG] Rendering week view for week starting:', weekStart);

    // Update week display
    const currentWeekElement = document.getElementById('currentWeekInfo');
    if (currentWeekElement) {
      currentWeekElement.textContent = this.formatWeekRange(weekStart);
    } else {
      console.warn('[SHIFTS WARN] currentWeekInfo element not found');
    }

    // Update shift assignments in existing cells
    this.updateShiftCells(weekStart);
  }

  navigateWeek(direction: number): void {
    console.log('[SHIFTS DEBUG] Navigating week. Direction:', direction);
    console.log('[SHIFTS DEBUG] Current week before:', this.currentWeek);

    const newDate = new Date(this.currentWeek);
    newDate.setDate(newDate.getDate() + direction * 7);
    this.currentWeek = newDate;

    console.log('[SHIFTS DEBUG] New week after:', this.currentWeek);

    // Load both shift data and notes for the new week
    Promise.all([this.loadCurrentWeekData(), this.loadWeeklyNotes()])
      .then(() => {
        console.log('[SHIFTS DEBUG] Week data and notes loaded successfully');
      })
      .catch((error) => {
        console.error('[SHIFTS ERROR] Failed to load week data:', error);
      });
  }

  getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    return new Date(d.setDate(diff));
  }

  getWeekEnd(date: Date): Date {
    const weekStart = this.getWeekStart(date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    return weekEnd;
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatWeekRange(weekStart: Date): string {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
    };
    const startStr = weekStart.toLocaleDateString('de-DE', options);
    const endStr = weekEnd.toLocaleDateString('de-DE', options);

    return `${startStr} - ${endStr} ${weekEnd.getFullYear()}`;
  }

  updateShiftCells(weekStart: Date): void {
    console.log('[SHIFTS DEBUG] Updating shift cells for week starting:', weekStart);

    // Update day headers with dates
    const dayHeaders = document.querySelectorAll('.day-header');
    dayHeaders.forEach((header, index) => {
      // Skip the first header which is "Schicht"
      if (index === 0) return;

      const date = new Date(weekStart);
      date.setDate(date.getDate() + (index - 1));

      const dateSpan = header.querySelector('span');
      if (dateSpan) {
        dateSpan.textContent = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      }
    });

    // Update shift cells with assignments
    const shiftTypes = ['early', 'late', 'night'];
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    shiftTypes.forEach((shiftType) => {
      days.forEach((day, dayIndex) => {
        const cell = document.querySelector(`.shift-cell[data-day="${day}"][data-shift="${shiftType}"]`);
        if (!cell) {
          console.warn(`[SHIFTS WARN] Cell not found for ${day} ${shiftType}`);
          return;
        }

        const date = new Date(weekStart);
        date.setDate(date.getDate() + dayIndex);
        const dateKey = this.formatDateKey(date);

        // Clear existing assignments
        const assignmentDiv = cell.querySelector('.employee-assignment');
        if (assignmentDiv) {
          assignmentDiv.innerHTML = '';

          // Get assignments for this shift
          const assignments = this.weeklyShifts[dateKey]?.[shiftType] ?? [];

          console.log('[SHIFTS DEBUG] Updating cell:', { day, shiftType, dateKey, assignments });

          if (assignments.length > 0) {
            // Add employee cards
            assignments.forEach((employeeId) => {
              // First try to find in loaded employees (for admins)
              const employee = this.employees.find((e) => e.id === employeeId);

              // If not found, try shift details (for employees who can't load all users)
              const shiftDetailKey = `${dateKey}_${shiftType}_${employeeId}`;
              const shiftDetail = this.shiftDetails[shiftDetailKey];

              console.log(
                '[SHIFTS DEBUG] Looking for employee:',
                employeeId,
                'Found in employees:',
                !!employee,
                'Found in shiftDetails:',
                !!shiftDetail,
              );

              if (employee) {
                const employeeCard = this.createEmployeeCard(employee);
                assignmentDiv.appendChild(employeeCard);
              } else if (shiftDetail) {
                // Create a temporary employee object from shift details
                const tempEmployee: Employee = {
                  id: shiftDetail.employee_id,
                  first_name: shiftDetail.first_name,
                  last_name: shiftDetail.last_name,
                  username: shiftDetail.username,
                  position: 'Mitarbeiter',
                  email: '',
                  role: 'employee' as const,
                  tenant_id: 0,
                  created_at: '',
                  updated_at: '',
                  is_active: true,
                  is_archived: false,
                };
                const employeeCard = this.createEmployeeCard(tempEmployee);
                assignmentDiv.appendChild(employeeCard);
              } else {
                console.error('[SHIFTS ERROR] Employee not found:', employeeId);
                // Show at least the ID if employee data not found
                const tempCard = document.createElement('div');
                tempCard.className = 'employee-card';
                tempCard.innerHTML = `<div class="employee-name">Mitarbeiter #${employeeId}</div>`;
                assignmentDiv.appendChild(tempCard);
              }
            });
          } else {
            // Show empty slot - different text for employees vs admins
            if (this.isAdmin) {
              assignmentDiv.innerHTML = '<div class="empty-slot">Mitarbeiter zuweisen</div>';
            } else {
              assignmentDiv.innerHTML = '<div class="empty-slot">-</div>';
            }
          }
        }
      });
    });
  }

  createEmployeeCard(employee: Employee): HTMLElement {
    const card = document.createElement('div');
    card.className = 'employee-card';
    card.dataset.employeeId = employee.id.toString();

    const name = `${employee.first_name ?? ''} ${employee.last_name ?? ''}`.trim() || employee.username;

    card.innerHTML = `
      <div class="employee-name">${this.escapeHtml(name)}</div>
      <div class="employee-position">${employee.position ?? 'Mitarbeiter'}</div>
    `;

    // Add remove button for admins
    if (this.isAdmin) {
      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-btn';
      removeBtn.innerHTML = '<i class="fas fa-times"></i>';
      removeBtn.onclick = (e) => {
        e.stopPropagation();
        const cell = card.closest('.shift-cell') as HTMLElement;
        if (cell) {
          this.assignShift(cell, employee.id);
        }
      };
      card.appendChild(removeBtn);
    }

    return card;
  }

  getDayName(date: Date): string {
    return date.toLocaleDateString('de-DE', { weekday: 'short' });
  }

  formatDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async saveSchedule(): Promise<void> {
    if (!this.isAdmin) return;

    // Validate department selection
    if (!this.selectedContext.departmentId) {
      showError('Bitte wählen Sie zuerst eine Abteilung aus');
      return;
    }

    try {
      const weekStart = this.formatDate(this.getWeekStart(this.currentWeek));
      const weekEnd = this.formatDate(this.getWeekEnd(this.currentWeek));

      // Get notes from textarea
      const notesTextarea = document.getElementById('weeklyNotes') as HTMLTextAreaElement;
      const notes = notesTextarea?.value ?? '';

      // Prepare shift assignments
      const assignments: Array<{
        employee_id: number;
        shift_date: string;
        shift_type: string;
        week_start: string;
        week_end: string;
        department_id?: number;
        machine_id?: number;
        team_leader_id?: number;
      }> = [];

      Object.entries(this.weeklyShifts).forEach(([date, shifts]) => {
        Object.entries(shifts).forEach(([shiftType, employeeIds]) => {
          employeeIds.forEach((employeeId) => {
            assignments.push({
              employee_id: employeeId,
              shift_date: date,
              shift_type: shiftType,
              week_start: weekStart,
              week_end: weekEnd,
              department_id: this.selectedContext.departmentId ?? undefined,
              machine_id: this.selectedContext.machineId ?? undefined,
            });
          });
        });
      });

      const response = await fetch('/api/shifts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({
          week_start: weekStart,
          week_end: weekEnd,
          assignments,
          notes,
        }),
      });

      if (response.ok) {
        showSuccess('Schichtplan erfolgreich gespeichert!');
        await this.loadCurrentWeekData();
      } else {
        const error = await response.json();
        showError(error.message ?? 'Fehler beim Speichern des Schichtplans');
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      showError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
    }
  }

  resetSchedule(): void {
    if (!this.isAdmin) return;

    if (!confirm('Möchten Sie den aktuellen Schichtplan wirklich zurücksetzen?')) {
      return;
    }

    this.weeklyShifts = {};
    this.renderWeekView();
    this.updateEmployeeShiftCounts();
    showInfo('Schichtplan wurde zurückgesetzt');
  }

  async loadWeeklyNotes(): Promise<void> {
    try {
      const weekStart = this.formatDate(this.getWeekStart(this.currentWeek));
      console.log('[SHIFTS DEBUG] Loading notes for week:', weekStart);
      console.log('[SHIFTS DEBUG] Current week:', this.currentWeek);
      console.log('[SHIFTS DEBUG] Week start date:', this.getWeekStart(this.currentWeek));
      console.log('[SHIFTS DEBUG] Selected department ID:', this.selectedContext.departmentId);

      let url = `/api/shifts/notes?week=${weekStart}`;
      if (this.selectedContext.departmentId) {
        url += `&department_id=${this.selectedContext.departmentId}`;
      }
      console.log('[SHIFTS DEBUG] Notes API URL:', url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      console.log('[SHIFTS DEBUG] Notes API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('[SHIFTS DEBUG] Notes API response data:', data);
        console.log('[SHIFTS DEBUG] Type of notes:', typeof data.notes);
        console.log('[SHIFTS DEBUG] Notes value:', data.notes);

        // Make sure we're getting a string, not an object
        if (typeof data.notes === 'object' && data.notes !== null) {
          console.error('[SHIFTS ERROR] Notes is an object, not a string:', data.notes);
          this.weeklyNotes = '';
        } else {
          this.weeklyNotes = data.notes ?? '';
        }

        const notesTextarea = document.getElementById('weeklyNotes') as HTMLTextAreaElement;
        if (notesTextarea) {
          // If notes are empty, show placeholder by clearing value
          notesTextarea.value = this.weeklyNotes;
          console.log('[SHIFTS DEBUG] Set textarea value to:', this.weeklyNotes);
        }
      } else {
        console.log('[SHIFTS DEBUG] Notes API error response');
        // If error, clear the notes
        const notesTextarea = document.getElementById('weeklyNotes') as HTMLTextAreaElement;
        if (notesTextarea) {
          notesTextarea.value = '';
        }
        this.weeklyNotes = '';
      }
    } catch (error) {
      console.error('[SHIFTS ERROR] Error loading weekly notes:', error);
      // Clear notes on error
      const notesTextarea = document.getElementById('weeklyNotes') as HTMLTextAreaElement;
      if (notesTextarea) {
        notesTextarea.value = '';
      }
      this.weeklyNotes = '';
    }
  }

  async saveWeeklyNotes(): Promise<void> {
    if (!this.isAdmin) return;

    try {
      const notesTextarea = document.getElementById('weeklyNotes') as HTMLTextAreaElement;
      if (!notesTextarea) return;

      const newNotes = notesTextarea.value ?? '';

      // Only save if notes have actually changed
      if (newNotes === this.weeklyNotes) {
        return;
      }

      this.weeklyNotes = newNotes;

      const weekStart = this.formatDate(this.getWeekStart(this.currentWeek));

      const response = await fetch('/api/shifts/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({
          week: weekStart,
          notes: this.weeklyNotes,
          department_id: this.selectedContext.departmentId,
        }),
      });

      if (response.ok) {
        showSuccess('Notizen gespeichert');
      } else {
        showError('Fehler beim Speichern der Notizen');
      }
    } catch (error) {
      console.error('Error saving notes:', error);
      showError('Ein Fehler ist aufgetreten');
    }
  }

  updateUIForRole(): void {
    const adminControls = document.querySelectorAll('.admin-controls');
    const employeeInfo = document.querySelectorAll('.employee-info-section');
    const adminActions = document.getElementById('adminActions');
    const employeeSidebar = document.querySelector('.employee-sidebar');
    const mainPlanningArea = document.querySelector('.main-planning-area');
    const notesTextarea = document.getElementById('weeklyNotes') as HTMLTextAreaElement;
    const infoRow = document.querySelector('.shift-info-row');

    if (this.isAdmin) {
      // Admin view - show everything (but respect department selection)
      adminControls.forEach((el) => el.classList.remove('hidden'));
      employeeInfo.forEach((el) => el.classList.add('hidden'));
      // adminActions visibility is controlled by togglePlanningAreaVisibility
      if (employeeSidebar) (employeeSidebar as HTMLElement).style.display = 'block';
      if (notesTextarea) notesTextarea.removeAttribute('readonly');
    } else {
      // Employee view - hide admin controls and sidebar
      adminControls.forEach((el) => el.classList.add('hidden'));
      employeeInfo.forEach((el) => el.classList.remove('hidden'));
      if (adminActions) adminActions.style.display = 'none';
      if (employeeSidebar) (employeeSidebar as HTMLElement).style.display = 'none';

      // Hide the info row (department, machine, team leader dropdowns) for employees
      if (infoRow) {
        (infoRow as HTMLElement).style.display = 'none';
      }

      // Make the main planning area full width when sidebar is hidden
      if (mainPlanningArea) {
        mainPlanningArea.classList.add('full-width');
      }

      // Make notes textarea readonly for employees
      if (notesTextarea) {
        notesTextarea.setAttribute('readonly', 'readonly');
        notesTextarea.parentElement?.classList.add('readonly');
      }
    }

    // Update instructions
    const instructions = document.getElementById('instructions');
    if (instructions) {
      if (this.isAdmin) {
        instructions.innerHTML = `
          <p>Ziehen Sie Mitarbeiter auf die gewünschten Schichten oder klicken Sie erst auf einen Mitarbeiter und dann auf eine Schicht.</p>
        `;
      } else {
        instructions.innerHTML = `
          <p>Hier sehen Sie Ihren aktuellen Schichtplan. Ihre Schichten sind hervorgehoben.</p>
        `;
      }
    }
  }

  highlightEmployeeShifts(): void {
    if (this.isAdmin || !this.currentUserId) return;

    // Remove existing highlights
    document.querySelectorAll('.employee-shift').forEach((el) => {
      el.classList.remove('employee-shift');
    });

    // Highlight current employee's shifts
    Object.entries(this.weeklyShifts).forEach(([date, shifts]) => {
      Object.entries(shifts).forEach(([shiftType, employeeIds]) => {
        if (this.currentUserId !== null && employeeIds.includes(this.currentUserId)) {
          const shiftCell = document.querySelector(`[data-date="${date}"][data-shift="${shiftType}"]`);
          shiftCell?.classList.add('employee-shift');
        }
      });
    });
  }

  private escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  private showShiftDetailsModal(shiftCell: HTMLElement): void {
    const date = shiftCell.dataset.date;
    const shift = shiftCell.dataset.shift;

    if (!date || !shift) return;

    // Find shift details
    const shiftDate = new Date(date);
    const dayName = shiftDate.toLocaleDateString('de-DE', { weekday: 'long' });
    const dateStr = shiftDate.toLocaleDateString('de-DE');

    // Get shift time based on type
    const shiftTimes: { [key: string]: string } = {
      early: '06:00 - 14:00',
      late: '14:00 - 22:00',
      night: '22:00 - 06:00',
    };

    const shiftNames: { [key: string]: string } = {
      early: 'Frühschicht',
      late: 'Spätschicht',
      night: 'Nachtschicht',
    };

    // Get assigned employees for this shift
    const employeeIds = this.weeklyShifts[date]?.[shift] ?? [];
    const assignedEmployees = employeeIds
      .map((id) => {
        const employee = this.employees.find((e) => e.id === id);
        if (employee) {
          const name = `${employee.first_name ?? ''} ${employee.last_name ?? ''}`.trim() || employee.username;
          return this.escapeHtml(name);
        }
        return '';
      })
      .filter((name) => name)
      .join(', ');

    const modalContent = `
      <div class="shift-detail-modal">
        <h3>${shiftNames[shift]} - ${dayName}</h3>
        <div class="shift-detail-info">
          <div class="detail-row">
            <span class="detail-label">Datum:</span>
            <span class="detail-value">${dateStr}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Zeit:</span>
            <span class="detail-value">${shiftTimes[shift]}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Zugewiesene Mitarbeiter:</span>
            <span class="detail-value">${assignedEmployees ?? 'Keine Mitarbeiter zugewiesen'}</span>
          </div>
          ${
            this.selectedContext.departmentId
              ? `
          <div class="detail-row">
            <span class="detail-label">Abteilung:</span>
            <span class="detail-value">${this.departments.find((d) => d.id === this.selectedContext.departmentId)?.name ?? '-'}</span>
          </div>`
              : ''
          }
          ${
            this.selectedContext.machineId
              ? `
          <div class="detail-row">
            <span class="detail-label">Maschine:</span>
            <span class="detail-value">${this.machines.find((m) => m.id === this.selectedContext.machineId)?.name ?? '-'}</span>
          </div>`
              : ''
          }
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" onclick="window.modalManager.closeModal()">Schließen</button>
        </div>
      </div>
    `;

    openModal(modalContent, {
      title: 'Schichtdetails',
      size: 'md',
    });
  }
}

// Initialize the system when the page loads
// let shiftPlanningSystem: ShiftPlanningSystem;

document.addEventListener('DOMContentLoaded', () => {
  new ShiftPlanningSystem();
});

// Export to window for backwards compatibility
if (typeof window !== 'undefined') {
  interface WindowWithShiftPlanning extends Window {
    ShiftPlanningSystem: typeof ShiftPlanningSystem;
  }
  (window as unknown as WindowWithShiftPlanning).ShiftPlanningSystem = ShiftPlanningSystem;
}
