/**
 * UI Management for The Caravan Chronicle
 * Rendering templates, managing modals, and toggling views
 */

const UI = {
    _views: {
        'v-landing': document.getElementById('v-landing'),
        'v-auth': document.getElementById('v-auth'),
        'v-citizen-dashboard': document.getElementById('v-citizen-dashboard'),
        'v-staff-dashboard': document.getElementById('v-staff-dashboard'),
        'v-public-portal': document.getElementById('v-public-portal')
    },

    init() {
        this._updateNav();
        this._renderView('v-landing');
    },

    _updateNav() {
        const user = window.Store.data.currentUser;
        const nav = document.querySelector('.navbar');
        const userBadge = document.getElementById('user-display-name');
        
        if (user) {
            nav.classList.add('is-auth');
            userBadge.textContent = user.name;
            document.body.className = `theme--dark user--${user.role}`;
        } else {
            nav.classList.remove('is-auth');
            document.body.className = 'theme--dark user--guest';
        }
        
        lucide.createIcons(); // Re-initialize icons
    },

    _renderView(viewId) {
        Object.keys(this._views).forEach(id => {
            this._views[id].classList.remove('active');
        });
        this._views[viewId].classList.add('active');

        // Execute view-specific rendering
        if (viewId === 'v-citizen-dashboard') this._renderCitizenDashboard();
        if (viewId === 'v-staff-dashboard') this._renderStaffDashboard();
        if (viewId === 'v-public-portal') this._renderPublicPortal();
        if (viewId === 'v-auth') this._renderAuthView();

        lucide.createIcons();
    },

    showModal(type) {
        const body = document.getElementById('modal-body');
        const overlay = document.getElementById('modal-container');
        
        if (type === 'login') body.innerHTML = this._tplLogin();
        if (type === 'register') body.innerHTML = this._tplRegister();
        if (type === 'complaint') body.innerHTML = this._tplComplaintForm();
        
        overlay.classList.remove('hidden');
        lucide.createIcons();
    },

    hideModal() {
        document.getElementById('modal-container').classList.add('hidden');
    },

    // Templates
    _tplLogin() {
        return `
            <h2 class="mb-4">Citizen Entry</h2>
            <form id="form-login">
                <div class="form-group">
                    <label class="form-label">Username</label>
                    <input type="text" name="username" required placeholder="ringmaster">
                </div>
                <div class="form-group">
                    <label class="form-label">Access Key</label>
                    <input type="password" name="password" required placeholder="password">
                </div>
                <button type="submit" class="btn btn--primary w-full mt-4">Gain Access</button>
                <p class="text-center mt-4 text-dim">New performer? <a href="#" id="link-register" class="text-primary">Join the Caravan</a></p>
            </form>
        `;
    },

    _tplRegister() {
        return `
            <h2 class="mb-4">Become a Citizen</h2>
            <form id="form-register">
                <div class="form-group">
                    <label class="form-label">Full Name</label>
                    <input type="text" name="name" required placeholder="Leo the Lionheart">
                </div>
                <div class="form-group">
                    <label class="form-label">Username</label>
                    <input type="text" name="username" required placeholder="leo_lion">
                </div>
                <div class="form-group">
                    <label class="form-label">Role</label>
                    <select name="role">
                        <option value="citizen">Citizen Performer</option>
                        <option value="staff">Infrastructure Staff</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Password</label>
                    <input type="password" name="password" required>
                </div>
                <button type="submit" class="btn btn--primary w-full mt-4">Create Profile</button>
            </form>
        `;
    },

    _tplComplaintForm() {
        return `
            <h2 class="mb-4">Report an Issue</h2>
            <form id="form-complaint">
                <div class="form-group">
                    <label class="form-label">Nature of Trouble</label>
                    <select name="type" required>
                        <option value="road damage">Pathway Damage</option>
                        <option value="water leakage">Water Leakage</option>
                        <option value="garbage">Garbage Build-up</option>
                        <option value="electrical">Power Outage</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Details</label>
                    <textarea name="description" rows="3" required placeholder="Describe the problem..."></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Location (e.g. Sector 3, Tent 4)</label>
                    <input type="text" name="location" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Urgency</label>
                    <select name="urgency">
                        <option value="low">Routine</option>
                        <option value="medium">Urgent</option>
                        <option value="high">Critical</option>
                    </select>
                </div>
                <button type="submit" class="btn btn--primary w-full">Submit Grievance</button>
            </form>
        `;
    },

    _renderCitizenDashboard() {
        const tickets = window.Store.getTickets();
        const stats = window.Store.getStats();
        
        this._views['v-citizen-dashboard'].innerHTML = `
            <div class="dashboard-header">
                <div>
                    <h1>Your Caravan Portal</h1>
                    <p class="text-dim">Tracking the status of your reported grievances.</p>
                </div>
                <button class="btn btn--primary" id="btn-submit-complaint">
                    <i data-lucide="plus-circle"></i> New Grievance
                </button>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card glass">
                    <div class="stat-value">${tickets.length}</div>
                    <div class="stat-label">Total Reports</div>
                </div>
                <div class="stat-card glass">
                    <div class="stat-value">${tickets.filter(t => t.status === 'RESOLVED').length}</div>
                    <div class="stat-label">Resolved</div>
                </div>
                <div class="stat-card glass">
                    <div class="stat-value">${stats.pending}</div>
                    <div class="stat-label">Pending Total</div>
                </div>
            </div>

            <div class="tickets-grid">
                ${tickets.length ? tickets.map(t => this._tplTicketCard(t)).join('') : '<p class="text-dim">No grievances reported yet.</p>'}
            </div>
        `;
    },

    _renderStaffDashboard() {
        const tickets = window.Store.getTickets();
        const stats = window.Store.getStats();
        
        this._views['v-staff-dashboard'].innerHTML = `
            <div class="dashboard-header">
                <div>
                    <h1>Municipal Command Center</h1>
                    <p class="text-dim">Grounds Manager's perspective on city-wide issues.</p>
                </div>
                <button class="btn btn--outline" id="btn-export-reports">
                    <i data-lucide="download"></i> Monthly Report
                </button>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card glass border-primary">
                    <div class="stat-value">${stats.overdue}</div>
                    <div class="stat-label">Overdue SLAs</div>
                </div>
                <div class="stat-card glass">
                    <div class="stat-value">${stats.avgResTime}h</div>
                    <div class="stat-label">Avg Res Time</div>
                </div>
                <div class="stat-card glass">
                    <div class="stat-value">${stats.total}</div>
                    <div class="stat-label">Total Tickets</div>
                </div>
            </div>

            <div class="flex-row items-center justify-between mb-4">
                <h3>All Active Concerns</h3>
                <div class="search-filters">
                    <input type="text" placeholder="Search issues..." class="search-input" id="search-tickets" onkeyup="UI.filterTickets(this.value)">
                </div>
            </div>

            <div class="tickets-grid" id="staff-tickets-grid">
                ${tickets.map(t => this._tplTicketCard(t, true)).join('')}
            </div>
        `;
    },

    filterTickets(query) {
        const grid = document.getElementById('staff-tickets-grid');
        const tickets = window.Store.getTickets();
        const filtered = tickets.filter(t => 
            t.type.toLowerCase().includes(query.toLowerCase()) || 
            t.description.toLowerCase().includes(query.toLowerCase()) ||
            t.id.toLowerCase().includes(query.toLowerCase())
        );
        grid.innerHTML = filtered.map(t => this._tplTicketCard(t, true)).join('');
        lucide.createIcons();
    },

    _renderPublicPortal() {
        const stats = window.Store.getStats();
        this._views['v-public-portal'].innerHTML = `
            <div class="text-center mb-12">
                <h1 class="mb-2">City Transparency Dashboard</h1>
                <p class="text-dim">Live data from the Grounds Management Department</p>
            </div>
            
            <div class="stats-grid mb-12">
                <div class="stat-card glass">
                    <div class="stat-value">${stats.resolved}</div>
                    <div class="stat-label">Issues Fixed</div>
                </div>
                <div class="stat-card glass">
                    <div class="stat-value">${stats.pending}</div>
                    <div class="stat-label">Pending Issues</div>
                </div>
                <div class="stat-card glass">
                    <div class="stat-value">${stats.avgResTime}h</div>
                    <div class="stat-label">Avg. Resolution</div>
                </div>
                <div class="stat-card glass">
                    <div class="stat-value">${Math.floor((stats.resolved/stats.total || 0)*100)}%</div>
                    <div class="stat-label">Success Rate</div>
                </div>
            </div>

            <div class="heatmap-section glass p-8 rounded-lg mb-12">
                <h2 class="mb-4">Issues Heatmap</h2>
                <div class="heatmap-container" id="heatmap-canvas">
                    <!-- Heatmap simulated with visual grid -->
                    <div class="heatmap-grid">
                        ${Array.from({length: 24}).map(() => `
                            <div class="heat-point level-${Math.floor(Math.random() * 4)}"></div>
                        `).join('')}
                    </div>
                </div>
                <p class="text-dim mt-4 text-sm"><i data-lucide="info" class="inline-icon"></i> Red zones indicate higher density of reported infrastructural issues.</p>
            </div>
        `;
    },

    _tplTicketCard(ticket, isStaffView = false) {
        const date = new Date(ticket.createdAt).toLocaleDateString();
        const isOverdue = Date.now() > ticket.slaDeadline && ticket.status !== 'RESOLVED';
        
        return `
            <div class="ticket-card glass ${isOverdue ? 'overdue-pulse' : ''}" data-id="${ticket.id}">
                <div class="ticket-header">
                    <span class="tag tag--${ticket.status}">${ticket.status.replace('_',' ')}</span>
                    <span class="ticket-id">#${ticket.id}</span>
                </div>
                <h4 class="ticket-title">${ticket.type}</h4>
                <p class="ticket-desc">${ticket.description}</p>
                <div class="ticket-meta">
                    <i data-lucide="map-pin" size="14"></i> <span>${ticket.location}</span>
                </div>
                <div class="ticket-meta">
                    <i data-lucide="calendar" size="14"></i> <span>${date}</span>
                </div>
                ${isOverdue ? '<div class="overdue-tag">SLA BREACHED</div>' : ''}
                
                ${isStaffView ? `
                    <div class="ticket-actions mt-4 border-t border-border pt-4">
                        <select class="status-select" data-id="${ticket.id}">
                            <option value="OPEN" ${ticket.status === 'OPEN' ? 'selected' : ''}>Open</option>
                            <option value="IN_PROGRESS" ${ticket.status === 'IN_PROGRESS' ? 'selected' : ''}>In Progress</option>
                            <option value="RESOLVED" ${ticket.status === 'RESOLVED' ? 'selected' : ''}>Resolved</option>
                        </select>
                    </div>
                ` : ''}
            </div>
        `;
    },

    showToast(msg, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast--${type} glass`;
        toast.textContent = msg;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
};

window.UI = UI;
