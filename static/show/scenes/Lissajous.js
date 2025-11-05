/**
 * Lissajous curves math visual preset
 * Parametric curves: x = A*sin(a*t + delta), y = B*sin(b*t)
 */

import { MathVisuals } from './MathVisuals.js';

export class Lissajous extends MathVisuals {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        this.trail = [];
        this.maxTrailLength = 500;
    }
    
    getDefaultParams() {
        return {
            a: 3,           // Frequency ratio for x-axis
            b: 2,           // Frequency ratio for y-axis
            delta: 0,       // Phase shift in radians
            speed: 1,       // Animation speed multiplier
            amplitude: 0.4, // Amplitude (as fraction of canvas size)
            lineWidth: 2,
            trailAlpha: 0.05, // Alpha for trail fade
            color: '#39FF14'  // Neon green
        };
    }
    
    render(time, deltaTime) {
        if (!this.isActive) {
            console.warn('Lissajous render called but scene is not active');
            return;
        }
        
        try {
            super.render(time, deltaTime);
            
            const ctx = this.ctx;
            if (!ctx) {
                console.error('Lissajous: No canvas context available');
                return;
            }
            
            const { a, b, delta, speed, amplitude, lineWidth, trailAlpha, color } = this.params;
            
            // Calculate animation time
            const t = (this.currentTime * speed) / 1000; // Convert to seconds
            
            // Calculate position
            const centerX = this.width / 2;
            const centerY = this.height / 2;
            const radius = Math.min(this.width, this.height) * amplitude;
            
            const x = centerX + radius * Math.sin(a * t + delta);
            const y = centerY + radius * Math.sin(b * t);
            
            // Add to trail
            this.trail.push({ x, y, alpha: 1.0 });
            
            // Limit trail length
            if (this.trail.length > this.maxTrailLength) {
                this.trail.shift();
            }
            
            // Fade trail
            this.trail.forEach(point => {
                point.alpha = Math.max(0, point.alpha - trailAlpha);
            });
            
            // Draw trail
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            if (this.trail.length > 1) {
                for (let i = 1; i < this.trail.length; i++) {
                    const prev = this.trail[i - 1];
                    const curr = this.trail[i];
                    
                    // Skip if alpha is too low
                    if (curr.alpha < 0.01) continue;
                    
                    ctx.globalAlpha = curr.alpha;
                    ctx.beginPath();
                    ctx.moveTo(prev.x, prev.y);
                    ctx.lineTo(curr.x, curr.y);
                    ctx.stroke();
                }
            }
            
            // Draw current point
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, lineWidth * 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Reset alpha
            ctx.globalAlpha = 1.0;
        } catch (error) {
            console.error('Lissajous render error:', error);
            console.error('Error stack:', error.stack);
        }
    }
    
    onCleanup() {
        // Clear trail
        this.trail = [];
    }
}
