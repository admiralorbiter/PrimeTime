/**
 * Main Operator UI controller
 * Handles WebSocket connection and UI initialization
 */

// Import Socket.io client
import { io } from 'https://cdn.socket.io/4.5.4/socket.io.esm.min.js';

class OperatorUI {
    constructor() {
        this.socket = null;
        this.connectionStatus = document.getElementById('connection-status');
        this.init();
    }

    init() {
        this.setupWebSocket();
        console.log('Operator UI initialized');
    }

    setupWebSocket() {
        // Connect to control namespace
        this.socket = io('/control', {
            autoConnect: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000
        });

        // Connection event handlers
        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.updateConnectionStatus('Connected', 'connected');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            this.updateConnectionStatus('Disconnected', 'disconnected');
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            this.updateConnectionStatus('Connection Error', 'error');
        });

        // Handle server responses
        this.socket.on('status', (data) => {
            console.log('Server status:', data);
        });
    }

    updateConnectionStatus(text, className) {
        if (this.connectionStatus) {
            this.connectionStatus.textContent = text;
            this.connectionStatus.className = className;
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new OperatorUI();
});

