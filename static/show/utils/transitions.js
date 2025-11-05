/** Transition effects for scene changes. */

/**
 * Parse transition string (e.g., "fade:800", "cross:700", "cut").
 * Returns { type: 'fade'|'cross'|'cut', duration: number }
 */
export function parseTransition(transitionStr) {
    if (!transitionStr || transitionStr === 'cut') {
        return { type: 'cut', duration: 0 };
    }
    
    const parts = transitionStr.split(':');
    const type = parts[0] || 'cut';
    const duration = parts[1] ? parseInt(parts[1], 10) : 0;
    
    return { type, duration: Math.max(0, duration) };
}

/**
 * Apply fade transition between two scenes.
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Function} renderOld - Function to render old scene
 * @param {Function} renderNew - Function to render new scene
 * @param {number} progress - Progress 0.0 to 1.0
 */
export function applyFadeTransition(ctx, renderOld, renderNew, progress) {
    ctx.save();
    
    // Render old scene with decreasing opacity
    ctx.globalAlpha = 1 - progress;
    renderOld();
    
    // Render new scene with increasing opacity
    ctx.globalAlpha = progress;
    renderNew();
    
    ctx.restore();
}

/**
 * Apply crossfade transition (similar to fade but optimized).
 */
export function applyCrossTransition(ctx, renderOld, renderNew, progress) {
    // Same as fade for now, could be optimized later
    applyFadeTransition(ctx, renderOld, renderNew, progress);
}

/**
 * Apply cut transition (instant switch).
 */
export function applyCutTransition(ctx, renderNew) {
    renderNew();
}

/**
 * Easing functions for transitions.
 */
export const easing = {
    linear: t => t,
    easeIn: t => t * t,
    easeOut: t => t * (2 - t),
    easeInOut: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeOutQuad: t => t * (2 - t)
};

