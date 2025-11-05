/** VideoScene - renders HTML5 video element. */
import { BaseScene } from './BaseScene.js';

export class VideoScene extends BaseScene {
    constructor(params, canvas, ctx) {
        super(params, canvas, ctx);
        this.videoElement = null;
        this.src = params.src || '';
        this.loop = params.loop || false;
        this.holdLastFrame = params.holdLastFrame || false;
    }
    
    async load() {
        this.state = 'LOADING';
        
        return new Promise((resolve, reject) => {
            // Create video element
            this.videoElement = document.createElement('video');
            this.videoElement.src = this.src;
            this.videoElement.loop = this.loop;
            this.videoElement.preload = 'auto';
            this.videoElement.style.display = 'none';
            document.body.appendChild(this.videoElement);
            
            // Wait for video to be ready
            const onLoadedMetadata = () => {
                this.duration = this.videoElement.duration * 1000; // Convert to ms
                this.state = 'READY';
                this.loaded = true;
                this.videoElement.removeEventListener('loadedmetadata', onLoadedMetadata);
                this.videoElement.removeEventListener('error', onError);
                resolve();
            };
            
            const onError = (error) => {
                this.state = 'ERROR';
                this.videoElement.removeEventListener('loadedmetadata', onLoadedMetadata);
                this.videoElement.removeEventListener('error', onError);
                reject(new Error(`Failed to load video: ${this.src}`));
            };
            
            this.videoElement.addEventListener('loadedmetadata', onLoadedMetadata);
            this.videoElement.addEventListener('error', onError);
            
            // Load video
            this.videoElement.load();
        });
    }
    
    play() {
        if (super.play() && this.videoElement) {
            this.videoElement.play().catch(err => {
                console.error('Error playing video:', err);
                this.state = 'ERROR';
            });
            return true;
        }
        return false;
    }
    
    pause() {
        if (super.pause() && this.videoElement) {
            this.videoElement.pause();
            return true;
        }
        return false;
    }
    
    seek(timecodeMs) {
        if (super.seek(timecodeMs) && this.videoElement) {
            const timeSeconds = timecodeMs / 1000;
            this.videoElement.currentTime = timeSeconds;
            this.startTime = performance.now() - timecodeMs;
            return true;
        }
        return false;
    }
    
    update(deltaTime) {
        // Video element handles its own playback
        // Just check if finished (if not looping)
        if (!this.loop && this.videoElement && this.videoElement.ended) {
            // Video has ended
        }
    }
    
    render() {
        if (!this.videoElement || !this.loaded) {
            return;
        }
        
        // Draw video frame to canvas
        this.ctx.save();
        
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Calculate scaling to fit video in canvas while maintaining aspect ratio
        const videoWidth = this.videoElement.videoWidth || this.canvas.width;
        const videoHeight = this.videoElement.videoHeight || this.canvas.height;
        
        const canvasAspect = this.canvas.width / this.canvas.height;
        const videoAspect = videoWidth / videoHeight;
        
        let drawWidth, drawHeight, drawX, drawY;
        
        if (canvasAspect > videoAspect) {
            // Canvas is wider - fit to height
            drawHeight = this.canvas.height;
            drawWidth = drawHeight * videoAspect;
            drawX = (this.canvas.width - drawWidth) / 2;
            drawY = 0;
        } else {
            // Canvas is taller - fit to width
            drawWidth = this.canvas.width;
            drawHeight = drawWidth / videoAspect;
            drawX = 0;
            drawY = (this.canvas.height - drawHeight) / 2;
        }
        
        // Draw video frame
        this.ctx.drawImage(
            this.videoElement,
            drawX, drawY, drawWidth, drawHeight
        );
        
        this.ctx.restore();
    }
    
    isFinished() {
        if (this.loop) {
            return false; // Never finishes if looping
        }
        if (this.videoElement && this.videoElement.ended) {
            return true;
        }
        return super.isFinished();
    }
    
    getTimecode() {
        if (this.videoElement && this.loaded) {
            return this.videoElement.currentTime * 1000; // Convert to ms
        }
        return super.getTimecode();
    }
    
    cleanup() {
        super.cleanup();
        if (this.videoElement) {
            this.videoElement.pause();
            this.videoElement.src = '';
            this.videoElement.load();
            if (this.videoElement.parentNode) {
                this.videoElement.parentNode.removeChild(this.videoElement);
            }
            this.videoElement = null;
        }
    }
}

