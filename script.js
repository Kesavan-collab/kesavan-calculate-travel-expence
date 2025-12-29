class TravelApp {
    constructor() {
        this.trips = JSON.parse(localStorage.getItem('travelEx_trips')) || [];
        // Default to a trip if none exists
        if (this.trips.length === 0) {
            this.createDefaultTrip();
        }
        
        this.currentTripId = localStorage.getItem('travelEx_currentTripId') || this.trips[0].id;
        this.currentView = 'dashboard';
        
        this.init();
    }

    createDefaultTrip() {
        const defaultTrip = {
            id: Date.now().toString(),
            name: "My First Trip",
            budget: 2000,
            expenses: []
        };
        this.trips.push(defaultTrip);
        this.saveData();
    }

    get currentTrip() {
        return this.trips.find(t => t.id === this.currentTripId) || this.trips[0];
    }

    init() {
        // Set today's date in date input
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date-input').value = today;

        this.render();
    }

    saveData() {
        localStorage.setItem('travelEx_trips', JSON.stringify(this.trips));
        localStorage.setItem('travelEx_currentTripId', this.currentTripId);
    }

    createNewTrip() {
        const name = prompt("Enter trip name:");
        if (!name) return;
        const budget = parseFloat(prompt("Enter trip budget:", "1000"));
        
        if (name && !isNaN(budget)) {
            const newTrip = {
                id: Date.now().toString(),
                name,
                budget,
                expenses: []
            };
            this.trips.push(newTrip);
            this.currentTripId = newTrip.id;
            this.saveData();
            this.render();
            alert(`Switched to new trip: ${name}`);
        }
    }

    navigate(view) {
        this.currentView = view;
        
        // Update Sidebar
        document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`nav-${view}`).classList.add('active');

        // Update Views
        document.getElementById('view-dashboard').classList.add('hidden');
        document.getElementById('view-expenses').classList.add('hidden');
        document.getElementById(`view-${view}`).classList.remove('hidden');

        // Update Title
        document.getElementById('page-title').textContent = view === 'dashboard' ? 'Dashboard' : 'All Expenses';
        
        this.render();
    }

    openModal() {
        document.getElementById('expense-modal').classList.add('open');
    }

    closeModal() {
        document.getElementById('expense-modal').classList.remove('open');
        document.getElementById('expense-form').reset();
        // Reset date to today
        document.getElementById('date-input').value = new Date().toISOString().split('T')[0];
    }

    handleExpenseSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const expense = {
            id: Date.now().toString(),
            title: formData.get('title'),
            amount: parseFloat(formData.get('amount')),
            category: formData.get('category'),
            date: formData.get('date')
        };

        this.currentTrip.expenses.unshift(expense); // Add to top
        this.saveData();
        this.closeModal();
        this.render();
    }

    deleteExpense(id) {
        if(confirm('Are you sure you want to delete this expense?')) {
            this.currentTrip.expenses = this.currentTrip.expenses.filter(e => e.id !== id);
            this.saveData();
            this.render();
        }
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    getCategoryIcon(category) {
        const icons = {
            food: 'ph-hamburger',
            transport: 'ph-taxi',
            accommodation: 'ph-house-line',
            entertainment: 'ph-ticket',
            shopping: 'ph-shopping-bag',
            other: 'ph-dots-three'
        };
        return icons[category] || 'ph-dots-three';
    }

    render() {
        const trip = this.currentTrip;
        document.getElementById('trip-name').textContent = `Current Trip: ${trip.name}`;

        // Calculate Totals
        const totalSpent = trip.expenses.reduce((sum, e) => sum + e.amount, 0);
        const remaining = trip.budget - totalSpent;

        document.getElementById('total-budget').textContent = this.formatCurrency(trip.budget);
        document.getElementById('total-spent').textContent = this.formatCurrency(totalSpent);
        const remainingEl = document.getElementById('total-remaining');
        remainingEl.textContent = this.formatCurrency(remaining);
        remainingEl.style.color = remaining < 0 ? 'var(--danger)' : 'var(--accent)';

        // Render Lists
        const createExpenseHTML = (expense) => `
            <div class="expense-item">
                <div class="expense-info">
                    <div class="category-icon">
                        <i class="ph-fill ${this.getCategoryIcon(expense.category)}"></i>
                    </div>
                    <div class="expense-details">
                        <h3>${expense.title}</h3>
                        <p>${new Date(expense.date).toLocaleDateString()} • ${expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}</p>
                    </div>
                </div>
                <div class="expense-info">
                    <span class="expense-amount">${this.formatCurrency(expense.amount)}</span>
                    <button class="delete-btn" onclick="app.deleteExpense('${expense.id}')">
                        <i class="ph-bold ph-trash"></i>
                    </button>
                </div>
            </div>
        `;

        const recentExpenses = trip.expenses.slice(0, 5).map(e => createExpenseHTML(e)).join('');
        const allExpenses = trip.expenses.map(e => createExpenseHTML(e)).join('');
        
        const emptyState = `<div style="text-align: center; padding: 2rem; color: var(--text-secondary)">No expenses recorded yet.</div>`;

        document.getElementById('recent-expenses-list').innerHTML = recentExpenses || emptyState;
        document.getElementById('all-expenses-list').innerHTML = allExpenses || emptyState;
    }
}

// Initialize App
const app = new TravelApp();
