/** Show View controller - fullscreen renderer for projector display. */
import { io } from 'https://cdn.socket.io/4.5.4/socket.io.esm.min.js';

class ShowView {
    constructor() {
        this.canvas = document.getElementById('show-canvas');
        if (!this.canvas) {
            console.error('Canvas element not found');
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        this.fpsCounter = document.getElementById('fps-counter');
        if (!this.fpsCounter) {
            console.error('FPS counter element not found');
        }
        this.reconnectingEl = document.getElementById('reconnecting');
        
        // FPS tracking
        this.lastFrameTime = performance.now();
        this.fps = 0;
        this.frameCount = 0;
        this.fpsUpdateTime = performance.now();
        
        // State
        this.state = 'IDLE';
        this.currentScene = null;
        this.timeline = null;
        this.currentIndex = 0;
        this.timecodeMs = 0;
        
        // SocketIO connection
        this.socket = null;
        
        // Initialize
        this.setupCanvas();
        this.setupWebSocket();
        this.startRenderLoop();
        
        // Log initialization
        console.log('Show View initialized');
        console.log('Canvas:', this.canvas ? `${this.canvas.width}x${this.canvas.height}` : 'not found');
        console.log('FPS Counter:', this.fpsCounter ? 'found' : 'not found');
        
        // Handle window resize
        window.addEventListener('resize', () => this.setupCanvas());
    }
    
    setupCanvas() {
        // Set canvas to full window size
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Clear to black
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    setupWebSocket() {
        // Connect to /show namespace
        this.socket = io('/show', {
            autoConnect: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000
        });
        
        // Connection events
        this.socket.on('connect', () => {
            console.log('Show View connected to server');
            this.reconnectingEl.classList.remove('show');
            
            // Emit initial status
            this.emitStatus();
        });
        
        this.socket.on('disconnect', () => {
            console.log('Show View disconnected from server');
            this.reconnectingEl.classList.add('show');
        });
        
        this.socket.on('connect_error', (error) => {
            console.error('Show View connection error:', error);
            this.reconnectingEl.classList.add('show');
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
    
    startRenderLoop() {
        const render = (currentTime) => {
            // Calculate FPS
            const delta = currentTime - this.lastFrameTime;
            this.lastFrameTime = currentTime;
            
            if (delta > 0) {
                this.frameCount++;
                const fpsValue = 1000 / delta;
                
                // Update FPS display every second
                if (currentTime - this.fpsUpdateTime >= 1000) {
                    this.fps = Math.round(this.frameCount / ((currentTime - this.fpsUpdateTime) / 1000));
                    if (this.fpsCounter) {
                        this.fpsCounter.textContent = `FPS: ${this.fps}`;
                    }
                    this.frameCount = 0;
                    this.fpsUpdateTime = currentTime;
                    
                    // Emit status update every second
                    this.emitStatus();
                }
            }
            
            // Render blank canvas (black background)
            // Future phases will render scenes here
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Continue loop
            requestAnimationFrame(render);
        };
        
        requestAnimationFrame(render);
    }
    
    emitStatus() {
        if (this.socket && this.socket.connected) {
            this.socket.emit('SHOW_STATUS', {
                fps: this.fps,
                sceneId: this.currentScene ? this.currentScene.id : null,
                itemIndex: this.currentIndex,
                timecodeMs: this.timecodeMs,
                nextId: null
            });
        }
    }
}

// Initialize Show View when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ShowView();
    });
} else {
    new ShowView();
}

