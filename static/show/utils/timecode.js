/** Timecode synchronization and formatting utilities. */

/**
 * Format timecode in milliseconds to MM:SS string.
 */
export function formatTimecode(timecodeMs) {
    const totalSeconds = Math.floor(timecodeMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Format timecode to HH:MM:SS string.
 */
export function formatTimecodeLong(timecodeMs) {
    const totalSeconds = Math.floor(timecodeMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return formatTimecode(timecodeMs);
}

/**
 * Timecode synchronizer - handles server authoritative timecode with local interpolation.
 */
export class TimecodeSync {
    constructor() {
        this.serverTimecodeMs = 0;
        this.localTimecodeMs = 0;
        this.lastServerUpdate = performance.now();
        this.lastServerTimecode = 0;
    }
    
    /**
     * Update server timecode (received from server).
     */
    updateServerTimecode(timecodeMs) {
        this.serverTimecodeMs = timecodeMs;
        this.lastServerTimecode = timecodeMs;
        this.lastServerUpdate = performance.now();
    }
    
    /**
     * Get current interpolated timecode.
     */
    getCurrentTimecode() {
        const now = performance.now();
        const elapsed = now - this.lastServerUpdate;
        
        // Interpolate: add elapsed time since last server update
        this.localTimecodeMs = this.lastServerTimecode + elapsed;
        
        return Math.max(0, this.localTimecodeMs);
    }
    
    /**
     * Reset timecode (e.g., on seek/jump).
     */
    reset(timecodeMs = 0) {
        this.serverTimecodeMs = timecodeMs;
        this.localTimecodeMs = timecodeMs;
        this.lastServerTimecode = timecodeMs;
        this.lastServerUpdate = performance.now();
    }
}

