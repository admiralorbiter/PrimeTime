/** Status Bar Web Component - displays connection status, FPS, and timecode. */
class StatusBar extends HTMLElement {
    constructor() {
        super();
        this.connected = false;
        this.fps = 0;
        this.timecodeMs = 0;
    }
    
    connectedCallback() {
        // Render immediately when component is added to DOM
        this.render();
    }
    
    render() {
        this.innerHTML = `
            <div class="status-grid">
                <div class="status-item">
                    <span class="status-label">Connection</span>
                    <span class="status-value ${this.connected ? 'connected' : 'disconnected'}" data-status="connection">
                        ${this.connected ? 'Connected' : 'Disconnected'}
                    </span>
                </div>
                <div class="status-item">
                    <span class="status-label">FPS</span>
                    <span class="status-value" data-status="fps">${this.fps}</span>
                </div>
                <div class="status-item">
                    <span class="status-label">Timecode</span>
                    <span class="status-value timecode" data-status="timecode">${this.formatTimecode(this.timecodeMs)}</span>
                </div>
            </div>
        `;
    }
    
    setConnected(connected) {
        this.connected = connected;
        const connectionEl = this.querySelector('[data-status="connection"]');
        if (connectionEl) {
            connectionEl.textContent = connected ? 'Connected' : 'Disconnected';
            connectionEl.className = `status-value ${connected ? 'connected' : 'disconnected'}`;
        } else {
            // If element doesn't exist, re-render
            this.render();
        }
    }
    
    setFPS(fps) {
        this.fps = fps;
        const fpsEl = this.querySelector('[data-status="fps"]');
        if (fpsEl) {
            fpsEl.textContent = fps;
        }
    }
    
    setTimecode(timecodeMs) {
        this.timecodeMs = timecodeMs;
        const timecodeEl = this.querySelector('[data-status="timecode"]');
        if (timecodeEl) {
            timecodeEl.textContent = this.formatTimecode(timecodeMs);
        }
    }
    
    formatTimecode(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
}

// Register the custom element
customElements.define('status-bar', StatusBar);

