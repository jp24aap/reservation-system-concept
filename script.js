class AIAssistant {
    constructor() {
        this.messages = document.getElementById('chatMessages');
        this.input = document.getElementById('userInput');
        this.maidSprite = document.getElementById('maidSprite');
        this.setupEventListeners();
        
        // Menu items with descriptions and prices
        this.menuItems = {
            'omurice': {
                name: 'Omurice',
                description: 'Fluffy omelette filled with fried rice and topped with ketchup art! ♡',
                price: 12.99
            },
            'curry': {
                name: 'Curry Rice',
                description: 'Homemade Japanese curry with tender chicken and vegetables ♪',
                price: 14.99
            },
            'parfait': {
                name: 'Kawaii Parfait',
                description: 'Layers of ice cream, fruit, and cookies with cute decorations! ✧',
                price: 9.99
            },
            'matcha': {
                name: 'Matcha Latte',
                description: 'Premium green tea latte with kawaii latte art! ♡',
                price: 5.99
            },
            'crepe': {
                name: 'Sweet Crepe',
                description: 'Delicate crepe filled with cream and fresh strawberries ✿',
                price: 8.99
            }
        };

        this.orderInProgress = false;
        this.currentOrder = [];

        this.responses = {
            'menu': 'Let me show you our menu, Master! ♪\n' + this.formatMenu(),
            'order': 'I\'d be happy to take your order! What would you like to have? ♡',
            'help': 'You can ask to see our menu, place an order, or ask about any specific dish! ✧',
            'default': 'How may I assist you today, Master? ♪'
        };

        this.chatBox = document.getElementById('aiChat');
        this.toggleBtn = document.getElementById('chatToggleBtn');
        
        // Add back the setupChatToggle call
        this.setupChatToggle();
        
        // Check saved state when initializing
        if (localStorage.getItem('chatBoxOpen') === 'true') {
            this.openChat();
        }

        // Add click event listener to document
        document.addEventListener('click', (e) => {
            // Only close if clicking outside AND not clicking a navigation link
            if (!e.target.closest('.ai-assistant') && 
                !e.target.closest('nav') && 
                this.chatBox.classList.contains('active')) {
                this.closeChat();
            }
        });
    }

    formatMenu() {
        let menuText = '✧ Our Special Menu ✧\n\n';
        for (const [key, item] of Object.entries(this.menuItems)) {
            menuText += `${item.name} - $${item.price}\n${item.description}\n\n`;
        }
        return menuText;
    }

    handleUserInput(input) {
        const userMessage = document.createElement('p');
        userMessage.textContent = `You: ${input}`;
        this.messages.appendChild(userMessage);

        this.playAnimation('thinking');

        setTimeout(() => {
            const response = this.processInput(input.toLowerCase());
            const aiMessage = document.createElement('p');
            aiMessage.textContent = response;
            this.messages.appendChild(aiMessage);
            this.messages.scrollTop = this.messages.scrollHeight;

            this.playAnimation('greeting');
        }, 500);
    }

    processInput(input) {
        // Check for menu request
        if (input.includes('menu')) {
            return this.responses.menu;
        }

        // Check for order intent
        if (input.includes('order') || input.includes('i want') || input.includes('i would like')) {
            this.orderInProgress = true;
            return "Of course! What would you like to order, Master? ♪";
        }

        // Process order
        if (this.orderInProgress) {
            return this.processOrder(input);
        }

        // Check for specific menu items
        for (const [key, item] of Object.entries(this.menuItems)) {
            if (input.includes(key.toLowerCase())) {
                return `Ah, the ${item.name}! ${item.description} Would you like to order it? ♡`;
            }
        }

        return this.responses.default;
    }

    processOrder(input) {
        let orderFound = false;
        let response = '';

        for (const [key, item] of Object.entries(this.menuItems)) {
            if (input.includes(key.toLowerCase())) {
                this.currentOrder.push(item);
                orderFound = true;
                response = `I've added ${item.name} to your order! ($${item.price})\n`;
            }
        }

        if (orderFound) {
            response += "Would you like anything else, Master? ♪\n";
            response += "(Say 'finish order' when you're done)";
        } else if (input.includes('finish') || input.includes('done')) {
            if (this.currentOrder.length > 0) {
                response = this.finalizeOrder();
            } else {
                response = "Oh! You haven't ordered anything yet. Would you like to see our menu? ♡";
            }
        } else {
            response = "I'm sorry, I didn't quite catch that. Would you like to see our menu? ♡";
        }

        return response;
    }

    finalizeOrder() {
        const total = this.currentOrder.reduce((sum, item) => sum + item.price, 0);
        
        // Save order to database
        const orderData = {
            items: this.currentOrder,
            total: total,
            timestamp: new Date().toISOString(),
            status: 'pending'
        };
        
        const db = new DatabaseManager();
        const orderId = db.saveOrder(orderData);
        
        let response = "✧ Your Order Summary ✧\n\n";
        this.currentOrder.forEach(item => {
            response += `${item.name} - $${item.price}\n`;
        });
        
        response += `\nTotal: $${total.toFixed(2)}\n`;
        response += `Order ID: #${orderId}\n\n`;
        response += "Thank you for your order, Master! It will be ready shortly! ♡";
        
        this.orderInProgress = false;
        this.currentOrder = [];
        
        return response;
    }

    playAnimation(animationType) {
        this.maidSprite.className = 'maid-sprite';
        void this.maidSprite.offsetWidth;
        this.maidSprite.classList.add(animationType);
    }

    setupEventListeners() {
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.target.value.trim() !== '') {
                const userInput = e.target.value;
                
                // Add user message
                this.addMessage(userInput, 'user');
                
                // Process user input and get response
                const response = this.processUserInput(userInput.toLowerCase());
                
                // Clear input
                e.target.value = '';
                
                // Add maid response with slight delay
                setTimeout(() => {
                    this.addMessage(response, 'maid');
                }, 500);
            }
        });
    }

    addMessage(text, sender) {
        const messageElement = document.createElement('p');
        messageElement.className = sender === 'user' ? 'user-message' : 'maid-message';
        messageElement.textContent = sender === 'user' ? text : text;
        this.messages.appendChild(messageElement);
        
        // Scroll to bottom
        this.messages.scrollTop = this.messages.scrollHeight;
        
        // Add animation to maid sprite
        if (sender === 'maid') {
            this.maidSprite.classList.add('greeting');
            setTimeout(() => this.maidSprite.classList.remove('greeting'), 1000);
        }
    }

    processUserInput(input) {
        if (input.includes('menu') || input.includes('food') || input.includes('drink')) {
            return "I'd be happy to tell you about our menu! We have delicious omurice, kawaii decorated cakes, and special themed drinks. Would you like to know more about any specific items? 🍰";
        }
        else if (input.includes('reservation') || input.includes('book') || input.includes('table')) {
            return "I can help you make a reservation! Please let me know: \n• How many people? \n• What date and time? \n• Any special requests? 📅";
        }
        else if (input.includes('event') || input.includes('special')) {
            return "We have exciting events every week! This weekend we're having a magical girl theme party. Would you like to know more? ✨";
        }
        else if (input.includes('hello') || input.includes('hi')) {
            return "Welcome back, Master! How may I serve you today? 💝";
        }
        else {
            return "Is there anything specific you'd like to know about our café? I can tell you about our menu, help with reservations, or inform you about our special events! ✧";
        }
    }

    setupChatToggle() {
        this.toggleBtn.addEventListener('click', (e) => {
            // Prevent this click from immediately closing the chat
            e.stopPropagation();
            this.openChat();
        });
    }

    openChat() {
        this.chatBox.classList.add('active');
        this.playAnimation('greeting');
        localStorage.setItem('chatBoxOpen', 'true');
    }

    closeChat() {
        this.chatBox.classList.remove('active');
        this.toggleBtn.style.opacity = '1';
        this.toggleBtn.style.visibility = 'visible';
        localStorage.setItem('chatBoxOpen', 'false');
    }
}

// Initialize AI Assistant
document.addEventListener('DOMContentLoaded', () => {
    const assistant = new AIAssistant();
    assistant.playAnimation('greeting');
}); 