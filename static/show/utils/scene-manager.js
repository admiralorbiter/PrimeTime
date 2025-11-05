/**
 * Scene Manager
 * Manages active scene lifecycle and coordinates with render loop
 */

export class SceneManager {
    constructor(renderer) {
        this.renderer = renderer;
        this.activeScene = null;
        this.sceneRegistry = new Map();
        this.canvas = renderer.canvas;
        this.ctx = renderer.ctx;
    }
    
    /**
     * Register a scene class
     * @param {string} sceneId - Unique identifier for the scene
     * @param {Class} SceneClass - Scene class constructor
     */
    registerScene(sceneId, SceneClass) {
        this.sceneRegistry.set(sceneId, SceneClass);
    }
    
    /**
     * Start a scene
     * @param {string} sceneId - Scene identifier
     * @param {Object} params - Scene parameters
     */
    startScene(sceneId, params = {}) {
        // Validate inputs
        if (!sceneId || typeof sceneId !== 'string') {
            console.error('SceneManager: Invalid sceneId provided');
            return false;
        }
        
        // Check if canvas and context are available
        if (!this.canvas || !this.ctx) {
            console.error('SceneManager: Canvas or context not available');
            const errorEvent = new CustomEvent('scene-error', {
                detail: { 
                    error: 'Canvas context not available',
                    sceneId: sceneId
                }
            });
            document.dispatchEvent(errorEvent);
            return false;
        }
        
        // Stop current scene if any
        if (this.activeScene) {
            this.stopScene();
        }
        
        // Get scene class
        const SceneClass = this.sceneRegistry.get(sceneId);
        if (!SceneClass) {
            console.error(`SceneManager: Scene "${sceneId}" not found in registry`);
            const errorEvent = new CustomEvent('scene-error', {
                detail: { 
                    error: `Scene "${sceneId}" not found`,
                    sceneId: sceneId
                }
            });
            document.dispatchEvent(errorEvent);
            return false;
        }
        
        try {
            console.log(`Creating scene instance: ${sceneId}`, {
                canvas: this.canvas,
                hasCtx: !!this.ctx,
                canvasWidth: this.canvas.width,
                canvasHeight: this.canvas.height
            });
            
            // Create new scene instance
            this.activeScene = new SceneClass(this.canvas, this.ctx);
            this.activeScene.init(params);
            
            console.log(`Started scene: ${sceneId}`, params, {
                isActive: this.activeScene.isActive,
                params: this.activeScene.params
            });
            
            // Emit success event
            const successEvent = new CustomEvent('scene-started', {
                detail: { sceneId: sceneId }
            });
            document.dispatchEvent(successEvent);
            
            return true;
        } catch (error) {
            console.error(`SceneManager: Error starting scene "${sceneId}":`, error);
            console.error('Error stack:', error.stack);
            this.activeScene = null;
            
            // Emit error event
            const errorEvent = new CustomEvent('scene-error', {
                detail: { 
                    error: error.message || 'Unknown error starting scene',
                    sceneId: sceneId,
                    stack: error.stack
                }
            });
            document.dispatchEvent(errorEvent);
            return false;
        }
    }
    
    /**
     * Update parameters of active scene
     * @param {Object} params - Parameter updates
     */
    updateParams(params) {
        if (this.activeScene) {
            this.activeScene.updateParams(params);
        }
    }
    
    /**
     * Stop the active scene
     */
    stopScene() {
        if (this.activeScene) {
            this.activeScene.cleanup();
            this.activeScene = null;
            console.log('Scene stopped');
        }
    }
    
    /**
     * Render callback for render loop
     * Called by renderer on each frame
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} time - Current time
     * @param {number} deltaTime - Delta time
     */
    render(ctx, time, deltaTime) {
        if (this.activeScene) {
            try {
                if (!this.activeScene.isActive) {
                    console.warn('Scene exists but is not active');
                    return;
                }
                this.activeScene.render(time, deltaTime);
            } catch (error) {
                console.error('Error rendering scene:', error);
                console.error('Error stack:', error.stack);
                // Stop scene on error
                this.stopScene();
            }
        }
    }
    
    /**
     * Handle canvas resize
     */
    handleResize() {
        if (this.activeScene) {
            this.activeScene.resize();
        }
    }
    
    /**
     * Get active scene
     * @returns {MathVisuals|null} Active scene instance
     */
    getActiveScene() {
        return this.activeScene;
    }
    
    /**
     * Check if a scene is active
     * @returns {boolean} True if scene is active
     */
    isSceneActive() {
        return this.activeScene !== null && this.activeScene.isActive;
    }
}
