/**
 * Data Store for The Caravan Chronicle
 * Manages persistence, authentication logic, and business rules (SLA, Escalation)
 */

const Store = {
    _KEY: 'CRVN_CHRON_DATA',
    data: {
        users: [],
        tickets: [],
        currentUser: null,
    },

    init() {
        const saved = localStorage.getItem(this._KEY);
        if (saved) {
            this.data = JSON.parse(saved);
        } else {
            this._seed();
        }
        this._autoEscalate();
    },

    _seed() {
        // Initial setup with Admin and some mock data
        this.data.users = [
            { id: 'u1', username: 'ringmaster', password: 'password', role: 'admin', name: 'The Ringmaster' },
            { id: 'u2', username: 'staff1', password: 'password', role: 'staff', name: 'Milo the Mechanic' },
            { id: 'u3', username: 'citizen1', password: 'password', role: 'citizen', name: 'Bella the Acrobat' },
        ];
        
        const now = Date.now();
        this.data.tickets = [
            {
                id: 'T101',
                userId: 'u3',
                type: 'water leakage',
                description: 'Main line leak near the lion tamers tent. Ground is becoming spongy.',
                location: 'Sector 4 - Carnival Row',
                status: 'OPEN',
                urgency: 'high',
                createdAt: now - (1000 * 60 * 60 * 2), // 2 hours ago
                slaDeadline: now + (1000 * 60 * 60 * 24), // 24h SLA
                photo: null
            },
            {
                id: 'T102',
                userId: 'u3',
                type: 'road damage',
                description: 'Pothole on the main elephant pathway. Risk of tripping.',
                location: 'Main Thoroughfare',
                status: 'IN_PROGRESS',
                urgency: 'medium',
                createdAt: now - (1000 * 60 * 60 * 26), // 26 hours ago
                slaDeadline: now - (1000 * 60 * 60 * 2), // Overdue by 2 hours
                photo: null
            }
        ];
        this._save();
    },

    _save() {
        localStorage.setItem(this._KEY, JSON.stringify(this.data));
    },

    // Authentication
    login(username, password) {
        const user = this.data.users.find(u => u.username === username && u.password === password);
        if (user) {
            this.data.currentUser = user;
            this._save();
            return { success: true, user };
        }
        return { success: false, message: 'Invalid credentials' };
    },

    logout() {
        this.data.currentUser = null;
        this._save();
    },

    register(username, password, name, role = 'citizen') {
        if (this.data.users.find(u => u.username === username)) {
            return { success: false, message: 'Username exists' };
        }
        const newUser = { id: 'u' + Date.now(), username, password, name, role };
        this.data.users.push(newUser);
        this._save();
        return { success: true, user: newUser };
    },

    // Ticket Management
    addTicket(ticketData) {
        const id = 'T' + Math.floor(Math.random() * 899 + 100);
        const now = Date.now();
        const newTicket = {
            id,
            userId: this.data.currentUser.id,
            status: 'OPEN',
            createdAt: now,
            slaDeadline: now + (1000 * 60 * 60 * 48), // 48h default SLA
            ...ticketData
        };
        this.data.tickets.push(newTicket);
        this._save();
        return newTicket;
    },

    updateTicketStatus(ticketId, status) {
        const ticket = this.data.tickets.find(t => t.id === ticketId);
        if (ticket) {
            ticket.status = status;
            ticket.updatedAt = Date.now();
            this._save();
            return true;
        }
        return false;
    },

    getTickets() {
        const user = this.data.currentUser;
        if (!user) return [];
        if (user.role === 'admin' || user.role === 'staff') return this.data.tickets;
        return this.data.tickets.filter(t => t.userId === user.id);
    },

    getStats() {
        const tickets = this.data.tickets;
        const total = tickets.length;
        const resolved = tickets.filter(t => t.status === 'RESOLVED').length;
        const pending = total - resolved;
        const overdue = tickets.filter(t => t.status !== 'RESOLVED' && Date.now() > t.slaDeadline).length;
        
        // Avg resolution time (simulated logic)
        const avgResTimeHours = total > 0 ? (resolved * 12 + pending * 6) / total : 0;

        return { total, resolved, pending, overdue, avgResTime: avgResTimeHours.toFixed(1) };
    },

    _autoEscalate() {
        // Simple logic: if ticket is overdue, set urgency to 'emergency' 
        const now = Date.now();
        this.data.tickets.forEach(t => {
            if (t.status !== 'RESOLVED' && now > t.slaDeadline) {
                t.urgency = 'emergency';
            }
        });
        this._save();
    }
};

// Global instance
window.Store = Store;
Store.init();
