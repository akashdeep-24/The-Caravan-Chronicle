/**
 * Main Application Logic for The Caravan Chronicle
 * Wiring everything together: Events, Data and UI
 */

const App = {
    init() {
        console.log('App Initializing...');
        window.Store.init();
        this._bindEvents();
        window.UI.init();
        this._setupHeroAnimation();
    },

    _bindEvents() {
        // Navigation clicks
        document.body.addEventListener('click', (e) => {
            const navLink = e.target.closest('.nav-link');
            if (navLink) {
                e.preventDefault();
                const view = navLink.getAttribute('data-view');
                window.UI._renderView(view);
            }
        });

        // Auth & Modal buttons
        document.getElementById('btn-login').addEventListener('click', () => window.UI.showModal('login'));
        document.getElementById('btn-hero-report').addEventListener('click', () => {
            if (!Store.data.currentUser) {
                window.UI.showModal('login');
                window.UI.showToast('Please login to file a grievance.', 'info');
            } else {
                window.UI.showModal('complaint');
            }
        });
        document.getElementById('btn-hero-stats').addEventListener('click', () => window.UI._renderView('v-public-portal'));
        document.getElementById('modal-close').addEventListener('click', () => window.UI.hideModal());

        // Dynamic Event Delegation
        document.body.addEventListener('submit', (e) => this._handleFormSubmit(e));
        document.body.addEventListener('click', (e) => this._handleGlobalClicks(e));
        document.body.addEventListener('change', (e) => this._handleGlobalChanges(e));
        
        // Logout
        document.getElementById('btn-logout').addEventListener('click', () => {
            window.Store.logout();
            window.UI._updateNav();
            window.UI._renderView('v-landing');
            window.UI.showToast('Logged out of the Chronicle.');
        });
    },

    _handleFormSubmit(e) {
        e.preventDefault();
        const formId = e.target.id;
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        if (formId === 'form-login') {
            const res = window.Store.login(data.username, data.password);
            if (res.success) {
                window.UI.hideModal();
                window.UI._updateNav();
                window.UI._renderView(res.user.role === 'citizen' ? 'v-citizen-dashboard' : 'v-staff-dashboard');
                window.UI.showToast(`Welcome back, ${res.user.name}`);
            } else {
                window.UI.showToast(res.message, 'error');
            }
        }

        if (formId === 'form-register') {
            const res = window.Store.register(data.username, data.password, data.name, data.role);
            if (res.success) {
                window.UI.showToast('Profile created! You can login now.');
                window.UI.showModal('login');
            } else {
                window.UI.showToast(res.message, 'error');
            }
        }

        if (formId === 'form-complaint') {
            const ticket = window.Store.addTicket({
                type: data.type,
                description: data.description,
                location: data.location,
                urgency: data.urgency
            });
            window.UI.hideModal();
            window.UI.showToast(`Grievance #${ticket.id} filed successfully.`, 'success');
            window.UI._renderView('v-citizen-dashboard');
        }
    },

    _handleGlobalClicks(e) {
        if (e.target.id === 'link-register') {
            e.preventDefault();
            window.UI.showModal('register');
        }
        if (e.target.id === 'btn-submit-complaint') {
            window.UI.showModal('complaint');
        }
        if (e.target.id === 'btn-export-reports' || e.target.closest('#btn-export-reports')) {
            this._exportToCSV();
        }
    },

    _handleGlobalChanges(e) {
        if (e.target.classList.contains('status-select')) {
            const ticketId = e.target.getAttribute('data-id');
            const newStatus = e.target.value;
            window.Store.updateTicketStatus(ticketId, newStatus);
            window.UI.showToast(`Ticket #${ticketId} status updated to ${newStatus}`);
            window.UI._renderView('v-staff-dashboard');
        }
    },

    _setupHeroAnimation() {
        const hero = document.getElementById('v-landing');
        // The background image path needs to be relative to the CSS location or direct in JS
        // Let's use the CSS variable or direct style
        hero.style.background = `linear-gradient(rgba(10, 10, 12, 0.7), rgba(10, 10, 12, 0.7)), url('assets/img/hero-bg.png') no-repeat center center/cover`;
        
        const logo = document.querySelector('.logo-icon');
        logo.style.mask = "url('assets/img/logo.png') no-repeat center/contain";
        logo.style.webkitMask = "url('assets/img/logo.png') no-repeat center/contain";
        logo.style.backgroundColor = "var(--primary)";
        logo.style.width = "32px";
        logo.style.height = "32px";
    },

    _exportToCSV() {
        const tickets = window.Store.data.tickets;
        const headers = ['ID', 'Type', 'Description', 'Status', 'CreatedAt', 'Location'];
        const csvRows = [headers.join(',')];

        tickets.forEach(t => {
            const row = [
                t.id,
                t.type,
                `"${t.description.replace(/"/g, '""')}"`,
                t.status,
                new Date(t.createdAt).toISOString(),
                `"${t.location}"`
            ];
            csvRows.push(row.join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Caravan_Chronicle_Report_${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.UI.showToast('Monthly report exported successfully.');
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
