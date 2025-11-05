/**
 * Show View controller
 * Handles WebSocket connection and will manage scene rendering
 */

// Import Socket.io client
import { io } from 'https://cdn.socket.io/4.5.4/socket.io.esm.min.js';

class ShowView {
    constructor() {
        this.socket = null;
        this.statusElement = document.getElementById('status');
        this.init();
    }

    init() {
        this.setupWebSocket();
        console.log('Show View initialized');
    }

    setupWebSocket() {
        // Connect to show namespace
        this.socket = io('/show', {
            autoConnect: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000
        });

        // Connection event handlers
        this.socket.on('connect', () => {
            console.log('Show View connected to server');
            this.updateStatus('Connected');
        });

        this.socket.on('disconnect', () => {
            console.log('Show View disconnected');
            this.updateStatus('Disconnected');
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            this.updateStatus('Connection Error');
        });

        // Handle server commands (will be expanded later)
        this.socket.on('SHOW_LOAD_TIMELINE', (data) => {
            console.log('Load timeline:', data);
            // TODO: Load timeline and start playback
        });

        this.socket.on('SHOW_PLAY', (data) => {
            console.log('Play command:', data);
            // TODO: Start/resume playback
        });

        this.socket.on('SHOW_PAUSE', () => {
            console.log('Pause command');
            // TODO: Pause playback
        });
    }

    updateStatus(text) {
        if (this.statusElement) {
            this.statusElement.textContent = text;
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ShowView();
});

