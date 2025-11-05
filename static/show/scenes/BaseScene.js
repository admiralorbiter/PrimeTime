/** Base Scene class - abstract base for all scene types. */
export class BaseScene {
    constructor(params, canvas, ctx) {
        this.params = params || {};
        this.canvas = canvas;
        this.ctx = ctx;
        this.id = params.id || `scene-${Date.now()}`;
        this.state = 'IDLE'; // IDLE, LOADING, READY, PLAYING, PAUSED, ERROR
        this.loaded = false;
        this.startTime = null;
        this.duration = null;
    }
    
    /**
     * Load scene assets and prepare for rendering.
     * Must be implemented by subclasses.
     */
    async load() {
        this.state = 'LOADING';
        throw new Error('load() must be implemented by subclass');
    }
    
    /**
     * Start playback of the scene.
     */
    play() {
        if (this.state === 'READY' || this.state === 'PAUSED') {
            this.state = 'PLAYING';
            if (!this.startTime) {
                this.startTime = performance.now();
            }
            return true;
        }
        return false;
    }
    
    /**
     * Pause playback.
     */
    pause() {
        if (this.state === 'PLAYING') {
            this.state = 'PAUSED';
            return true;
        }
        return false;
    }
    
    /**
     * Seek to specific timecode in milliseconds.
     */
    seek(timecodeMs) {
        if (this.duration !== null && timecodeMs >= 0 && timecodeMs <= this.duration) {
            this.startTime = performance.now() - timecodeMs;
            return true;
        }
        return false;
    }
    
    /**
     * Update scene (called every frame).
     * Must be implemented by subclasses.
     */
    update(deltaTime) {
        throw new Error('update() must be implemented by subclass');
    }
    
    /**
     * Render scene (called every frame).
     * Must be implemented by subclasses.
     */
    render() {
        throw new Error('render() must be implemented by subclass');
    }
    
    /**
     * Check if scene has finished playing.
     */
    isFinished() {
        if (this.duration === null) {
            return false; // Infinite duration
        }
        if (this.startTime === null) {
            return false;
        }
        const elapsed = performance.now() - this.startTime;
        return elapsed >= this.duration;
    }
    
    /**
     * Get current timecode in milliseconds.
     */
    getTimecode() {
        if (this.startTime === null) {
            return 0;
        }
        const elapsed = performance.now() - this.startTime;
        return Math.max(0, Math.min(elapsed, this.duration || Infinity));
    }
    
    /**
     * Cleanup resources when scene is no longer needed.
     */
    cleanup() {
        this.state = 'IDLE';
        this.loaded = false;
        this.startTime = null;
    }
}

