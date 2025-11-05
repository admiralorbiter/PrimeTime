/**
 * Scene Controls Web Component
 * Provides UI for controlling math visual scenes
 */

class SceneControls extends HTMLElement {
    constructor() {
        super();
        this.socket = null;
        this.currentFPS = 0;
        this.isSceneActive = false;
    }
    
    connectedCallback() {
        this.render();
        this.setupEventListeners();
        // Wait for socket to be available
        this.waitForSocket();
    }
    
    waitForSocket() {
        // Try to get socket immediately
        if (window.operatorUI && window.operatorUI.socket) {
            this.socket = window.operatorUI.socket;
            return;
        }
        
        // Otherwise, wait a bit and try again
        setTimeout(() => {
            if (window.operatorUI && window.operatorUI.socket) {
                this.socket = window.operatorUI.socket;
            } else {
                // Try once more after another delay
                setTimeout(() => {
                    if (window.operatorUI && window.operatorUI.socket) {
                        this.socket = window.operatorUI.socket;
                    }
                }, 500);
            }
        }, 100);
    }
    
    render() {
        this.innerHTML = `
            <div class="scene-controls-panel">
                <h2>Scene Controls</h2>
                
                <div class="fps-display">
                    <span class="fps-label">FPS:</span>
                    <span class="fps-value" id="fps-display">--</span>
                </div>
                
                <div class="scene-buttons">
                    <button id="start-lissajous-btn" class="btn btn-success">Start Lissajous</button>
                    <button id="stop-scene-btn" class="btn btn-danger" disabled>Stop Scene</button>
                </div>
                
                <div class="parameters-panel" id="parameters-panel" style="display: none;">
                    <h3>Parameters</h3>
                    
                    <div class="param-control">
                        <label for="param-a">A (Frequency X):</label>
                        <input type="range" id="param-a" min="1" max="10" step="0.1" value="3">
                        <span class="param-value" id="value-a">3</span>
                    </div>
                    
                    <div class="param-control">
                        <label for="param-b">B (Frequency Y):</label>
                        <input type="range" id="param-b" min="1" max="10" step="0.1" value="2">
                        <span class="param-value" id="value-b">2</span>
                    </div>
                    
                    <div class="param-control">
                        <label for="param-delta">Delta (Phase):</label>
                        <input type="range" id="param-delta" min="0" max="6.28" step="0.1" value="0">
                        <span class="param-value" id="value-delta">0</span>
                    </div>
                    
                    <div class="param-control">
                        <label for="param-speed">Speed:</label>
                        <input type="range" id="param-speed" min="0.1" max="3" step="0.1" value="1">
                        <span class="param-value" id="value-speed">1</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    setupEventListeners() {
        // Start button
        const startBtn = this.querySelector('#start-lissajous-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startLissajous());
        }
        
        // Stop button
        const stopBtn = this.querySelector('#stop-scene-btn');
        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stopScene());
        }
        
        // Parameter sliders with debouncing
        const params = ['a', 'b', 'delta', 'speed'];
        let paramTimeout = null;
        
        params.forEach(param => {
            const slider = this.querySelector(`#param-${param}`);
            const valueDisplay = this.querySelector(`#value-${param}`);
            
            if (slider && valueDisplay) {
                // Update display immediately
                slider.addEventListener('input', (e) => {
                    const value = parseFloat(e.target.value);
                    valueDisplay.textContent = value.toFixed(1);
                    
                    // Debounce parameter updates
                    clearTimeout(paramTimeout);
                    paramTimeout = setTimeout(() => {
                        this.updateParams();
                    }, 100); // 100ms debounce
                });
            }
        });
    }
    
    startLissajous() {
        // Ensure we have socket
        if (!this.socket) {
            this.waitForSocket();
        }
        
        if (!this.socket || !this.socket.connected) {
            console.error('Socket not connected');
            alert('WebSocket not connected. Please wait for connection.');
            return;
        }
        
        // Get initial parameter values
        const params = this.getCurrentParams();
        
        // Send start scene command
        this.socket.emit('CONTROL_START_SCENE', {
            sceneId: 'lissajous',
            params: params
        });
        
        // Update UI
        this.isSceneActive = true;
        this.querySelector('#start-lissajous-btn').disabled = true;
        this.querySelector('#stop-scene-btn').disabled = false;
        this.querySelector('#parameters-panel').style.display = 'block';
    }
    
    stopScene() {
        if (!this.socket || !this.socket.connected) {
            console.error('Socket not connected');
            return;
        }
        
        // Send stop scene command
        this.socket.emit('CONTROL_STOP_SCENE', {});
        
        // Update UI
        this.isSceneActive = false;
        this.querySelector('#start-lissajous-btn').disabled = false;
        this.querySelector('#stop-scene-btn').disabled = true;
        this.querySelector('#parameters-panel').style.display = 'none';
    }
    
    updateParams() {
        if (!this.isSceneActive || !this.socket || !this.socket.connected) {
            return;
        }
        
        const params = this.getCurrentParams();
        
        // Send parameter update
        this.socket.emit('CONTROL_UPDATE_PARAMS', {
            params: params
        });
    }
    
    getCurrentParams() {
        return {
            a: parseFloat(this.querySelector('#param-a').value),
            b: parseFloat(this.querySelector('#param-b').value),
            delta: parseFloat(this.querySelector('#param-delta').value),
            speed: parseFloat(this.querySelector('#param-speed').value)
        };
    }
    
    updateFPS(fps) {
        this.currentFPS = fps;
        const fpsDisplay = this.querySelector('#fps-display');
        if (fpsDisplay) {
            fpsDisplay.textContent = fps;
            
            // Color code based on performance
            if (fps >= 55) {
                fpsDisplay.style.color = '#39FF14'; // Green
            } else if (fps >= 30) {
                fpsDisplay.style.color = '#FFD700'; // Yellow
            } else {
                fpsDisplay.style.color = '#FF4444'; // Red
            }
        }
    }
}

customElements.define('scene-controls', SceneControls);
