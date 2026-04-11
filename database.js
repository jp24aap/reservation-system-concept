class DatabaseManager {
    constructor() {
        // Initialize storage if it doesn't exist
        if (!localStorage.getItem('reservations')) {
            localStorage.setItem('reservations', JSON.stringify([]));
        }
        if (!localStorage.getItem('orders')) {
            localStorage.setItem('orders', JSON.stringify([]));
        }
    }

    // Reservation Methods
    saveReservation(reservationData) {
        const reservations = this.getReservations();
        reservationData.id = Date.now(); // Unique ID
        reservationData.timestamp = new Date().toISOString();
        reservations.push(reservationData);
        localStorage.setItem('reservations', JSON.stringify(reservations));
        return reservationData.id;
    }

    getReservations() {
        return JSON.parse(localStorage.getItem('reservations')) || [];
    }

    getReservationById(id) {
        const reservations = this.getReservations();
        return reservations.find(r => r.id === id);
    }

    updateReservation(id, updatedData) {
        const reservations = this.getReservations();
        const index = reservations.findIndex(r => r.id === id);
        
        if (index !== -1) {
            // Preserve the original id and timestamp
            updatedData.id = id;
            updatedData.timestamp = reservations[index].timestamp;
            
            reservations[index] = updatedData;
            localStorage.setItem('reservations', JSON.stringify(reservations));
            return true;
        }
        return false;
    }

    deleteReservation(id) {
        const reservations = this.getReservations();
        const filteredReservations = reservations.filter(r => r.id !== id);
        localStorage.setItem('reservations', JSON.stringify(filteredReservations));
    }

    // Order Methods
    saveOrder(orderData) {
        const orders = this.getOrders();
        orderData.id = Date.now(); // Unique ID
        orderData.timestamp = new Date().toISOString();
        orders.push(orderData);
        localStorage.setItem('orders', JSON.stringify(orders));
        return orderData.id;
    }

    getOrders() {
        return JSON.parse(localStorage.getItem('orders')) || [];
    }

    getOrderById(id) {
        const orders = this.getOrders();
        return orders.find(o => o.id === id);
    }

    // Search Methods
    searchReservations(query) {
        const reservations = this.getReservations();
        return reservations.filter(r => 
            r.name.toLowerCase().includes(query.toLowerCase()) ||
            r.email.toLowerCase().includes(query.toLowerCase()) ||
            r.date.includes(query)
        );
    }

    searchOrders(query) {
        const orders = this.getOrders();
        return orders.filter(o => 
            o.customerName.toLowerCase().includes(query.toLowerCase()) ||
            o.items.some(item => item.name.toLowerCase().includes(query.toLowerCase()))
        );
    }

    // Export Data
    exportData() {
        return {
            reservations: this.getReservations(),
            orders: this.getOrders(),
            exportDate: new Date().toISOString()
        };
    }
} 