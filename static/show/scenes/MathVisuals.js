/**
 * Base class for math visual presets
 * All math scenes should extend this class
 */

export class MathVisuals {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.width = canvas.width;
        this.height = canvas.height;
        this.params = {};
        this.isActive = false;
        this.startTime = null;
        this.currentTime = 0;
    }
    
    /**
     * Initialize the scene
     * Called when scene is started
     * @param {Object} params - Scene parameters
     */
    init(params = {}) {
        this.params = { ...this.getDefaultParams(), ...params };
        this.isActive = true;
        this.startTime = null; // Will be set on first render
        this.resize();
    }
    
    /**
     * Get default parameters for this scene
     * Override in subclasses
     * @returns {Object} Default parameters
     */
    getDefaultParams() {
        return {};
    }
    
    /**
     * Update scene parameters
     * @param {Object} newParams - New parameter values
     */
    updateParams(newParams) {
        this.params = { ...this.params, ...newParams };
        this.onParamsChanged();
    }
    
    /**
     * Called when parameters change
     * Override in subclasses to react to parameter changes
     */
    onParamsChanged() {
        // Override in subclasses
    }
    
    /**
     * Render the scene
     * Base class handles time tracking, subclasses override to implement rendering
     * @param {number} time - Current time in milliseconds (since page load)
     * @param {number} deltaTime - Time since last frame in milliseconds
     */
    render(time, deltaTime) {
        if (!this.isActive) return;
        
        // Set start time on first render
        if (this.startTime === null) {
            this.startTime = time;
        }
        
        this.currentTime = time - this.startTime;
        
        // Base class just handles time tracking
        // Subclasses override this method to implement actual rendering
    }
    
    /**
     * Handle canvas resize
     */
    resize() {
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.onResize();
    }
    
    /**
     * Called when canvas is resized
     * Override in subclasses to react to resize
     */
    onResize() {
        // Override in subclasses
    }
    
    /**
     * Stop and cleanup the scene
     */
    cleanup() {
        this.isActive = false;
        this.onCleanup();
    }
    
    /**
     * Called during cleanup
     * Override in subclasses to perform cleanup
     */
    onCleanup() {
        // Override in subclasses
    }
}
