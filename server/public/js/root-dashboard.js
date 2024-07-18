document.addEventListener('DOMContentLoaded', () => {
    console.log('Root dashboard script loaded');
    const token = localStorage.getItem('token');
    console.log('Stored token:', token ? 'Token vorhanden' : 'Kein Token gefunden');
    
    const createAdminForm = document.getElementById('create-admin-form');
    const adminTableBody = document.getElementById('admin-table-body');
    const logoutBtn = document.getElementById('logout-btn');
    const dashboardContent = document.getElementById('dashboard-data');

    if (createAdminForm) createAdminForm.addEventListener('submit', createAdmin);
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    if (!token) {
        console.error('Kein Token gefunden. Umleitung zur Login-Seite...');
        window.location.href = '/';
        return;
    }

    loadDashboardData();
    loadAdmins();

    async function loadDashboardData() {
        console.log('Attempting to load dashboard data');
        try {
            const response = await fetch('/api/root-dashboard-data', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Dashboard response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Dashboard data:', data);
            dashboardContent.innerHTML = `
                <pre>${JSON.stringify(data, null, 2)}</pre>
            `;
        } catch (error) {
            console.error('Error loading dashboard:', error);
            dashboardContent.innerHTML = `
                <p>Fehler beim Laden des Dashboards. Bitte versuchen Sie sich erneut anzumelden.</p>
            `;
            if (error.message.includes('401') || error.message.includes('403')) {
                console.log('Unauthorized access. Redirecting to login...');
                logout();
            }
        }
    }

    async function createAdmin(e) {
        e.preventDefault();
        const formData = new FormData(createAdminForm);
        const adminData = Object.fromEntries(formData.entries());
        try {
            const response = await fetch('/root/create-admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(adminData)
            });
            if (response.ok) {
                alert('Admin erfolgreich erstellt');
                createAdminForm.reset();
                loadAdmins();
            } else {
                const error = await response.json();
                alert(`Fehler: ${error.message}`);
            }
        } catch (error) {
            console.error('Fehler beim Erstellen des Admins:', error);
            alert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
        }
    }

    async function loadAdmins() {
        try {
            const response = await fetch('/root/admins', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const admins = await response.json();
                displayAdmins(admins);
            } else {
                const error = await response.json();
                alert(`Fehler: ${error.message}`);
            }
        } catch (error) {
            console.error('Fehler beim Laden der Admins:', error);
            alert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
        }
    }

    function displayAdmins(admins) {
        if (!adminTableBody) return;
        adminTableBody.innerHTML = '';
        admins.forEach(admin => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${admin.username}</td>
                <td>${admin.email}</td>
                <td>${admin.company || '-'}</td>
            `;
            adminTableBody.appendChild(row);
        });
    }

    function logout() {
        console.log('Logging out...');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = '/';
    }
});