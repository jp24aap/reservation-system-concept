document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('reservationForm');

    // Add this after EmailJS initialization
    const db = new DatabaseManager();

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            date: document.getElementById('date').value,
            time: document.getElementById('time').value,
            partySize: document.getElementById('partySize').value,
            requests: document.getElementById('requests').value
        };

        try {
            console.log("Form data collected:", formData);
            
            // Check if DatabaseManager exists
            if (typeof DatabaseManager === 'undefined') {
                console.error("DatabaseManager is not defined!");
                alert("Database error: DatabaseManager not found");
                return;
            }
            
            // Create database instance
            const db = new DatabaseManager();
            console.log("Database initialized");
            
            // Save to database
            const reservationId = db.saveReservation(formData);
            console.log("Reservation saved with ID:", reservationId);
            
            // Check if data was actually saved
            const allReservations = db.getReservations();
            console.log("All reservations:", allReservations);
            
            // Send email confirmation
            await sendConfirmationEmail(formData);
            
            showConfirmation(formData);
            form.reset();
            
        } catch (error) {
            console.error('Error:', error);
            alert('There was an error processing your reservation. Please try again.');
        }
    });

    function showConfirmation(data) {
        // Create a cute confirmation message
        const message = `
            <div class="confirmation-message">
                <h3>✧ Reservation Confirmed! ✧</h3>
                <p>Thank you for choosing Sweet Dreams Maid Café, ${data.name}! ♡</p>
                <p>We've sent a confirmation email to: ${data.email}</p>
                <p>Your reservation details:</p>
                <ul>
                    <li>Date: ${formatDate(data.date)}</li>
                    <li>Time: ${formatTime(data.time)}</li>
                    <li>Party Size: ${data.partySize}</li>
                </ul>
                <p>We can't wait to serve you! ✨</p>
            </div>
        `;

        // Show the message
        const confirmationDiv = document.createElement('div');
        confirmationDiv.className = 'confirmation-overlay';
        confirmationDiv.innerHTML = message;
        document.body.appendChild(confirmationDiv);

        // Remove after 5 seconds
        setTimeout(() => {
            confirmationDiv.remove();
        }, 5000);
    }

    function formatDate(dateStr) {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function formatTime(timeStr) {
        return new Date(`2000/01/01 ${timeStr}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });
    }

    async function sendConfirmationEmail(data) {
        try {
            console.log('Starting email process...');
            console.log('Email data:', data);
            
            // Check if EmailJS is loaded
            if (typeof emailjs === 'undefined') {
                console.error('EmailJS library not loaded!');
                throw new Error('EmailJS library not loaded');
            }
            
            console.log('Initializing EmailJS...');
            emailjs.init("9y50cvB_YePuWIPBK");

            const templateParams = {
                to_name: data.name,
                to_email: data.email,
                reservation_date: formatDate(data.date),
                reservation_time: formatTime(data.time),
                party_size: data.partySize,
                special_requests: data.requests || 'None'
            };
            
            console.log('Email template params:', templateParams);
            console.log('Sending email with service ID: service_dzyohfz, template ID: template_h4vgnfr');

            const response = await emailjs.send(
                "service_dzyohfz",
                "template_h4vgnfr",
                templateParams
            );
            
            console.log('Email sent successfully:', response);
            return response;
        } catch (error) {
            console.error("Failed to send email:", error);
            // Show the error details
            console.error("Error details:", JSON.stringify(error, null, 2));
            throw error;
        }
    }
}); 