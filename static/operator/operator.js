/** Operator UI controller - main application logic. */
import { io } from 'https://cdn.socket.io/4.5.4/socket.io.esm.min.js';

class OperatorUI {
    constructor() {
        this.socket = null;
        this.statusBar = null;
        
        // Initialize
        this.setupWebSocket();
        this.setupStatusBar();
    }
    
    setupStatusBar() {
        // Status bar component should be available after DOM is ready
        // Try immediately first, then with a small delay if needed
        this.statusBar = document.querySelector('status-bar');
        if (!this.statusBar) {
            // Wait a bit for custom element to register
            setTimeout(() => {
                this.statusBar = document.querySelector('status-bar');
                if (!this.statusBar) {
                    console.warn('Status bar component not found');
                } else {
                    // Update connection status if we already have a socket connection
                    if (this.socket && this.socket.connected) {
                        this.updateConnectionStatus(true);
                    }
                }
            }, 100);
        } else {
            // Component is ready, update if already connected
            if (this.socket && this.socket.connected) {
                this.updateConnectionStatus(true);
            }
        }
    }
    
    setupWebSocket() {
        // Connect to /control namespace
        this.socket = io('/control', {
            autoConnect: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000
        });
        
        // Connection events
        this.socket.on('connect', () => {
            console.log('Operator UI connected to server');
            // Ensure status bar is available before updating
            if (!this.statusBar) {
                this.statusBar = document.querySelector('status-bar');
            }
            this.updateConnectionStatus(true);
            
            // Request asset list (for future phases)
            // this.socket.emit('ASSET_INDEX_REQUEST', {});
        });
        
        this.socket.on('disconnect', () => {
            console.log('Operator UI disconnected from server');
            this.updateConnectionStatus(false);
        });
        
        this.socket.on('connect_error', (error) => {
            console.error('Operator UI connection error:', error);
            this.updateConnectionStatus(false);
        });
        
        // Ping/Pong handlers
        this.socket.on('PING', (data) => {
            console.log('PING received:', data);
            this.socket.emit('PONG', { timestamp: Date.now(), echo: 'pong' });
        });
        
        this.socket.on('PONG', (data) => {
            console.log('PONG received:', data);
        });
    }
    
    updateConnectionStatus(connected) {
        if (this.statusBar) {
            this.statusBar.setConnected(connected);
        }
    }
    
    updateFPS(fps) {
        if (this.statusBar) {
            this.statusBar.setFPS(fps);
        }
    }
    
    updateTimecode(timecodeMs) {
        if (this.statusBar) {
            this.statusBar.setTimecode(timecodeMs);
        }
    }
}

// Initialize Operator UI when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new OperatorUI();
    });
} else {
    new OperatorUI();
}

