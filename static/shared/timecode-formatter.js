/** Timecode formatting utilities (shared between Show View and Operator UI). */

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
 * Parse timecode string (MM:SS or HH:MM:SS) to milliseconds.
 */
export function parseTimecode(timecodeStr) {
    const parts = timecodeStr.split(':').map(p => parseInt(p, 10));
    
    if (parts.length === 2) {
        // MM:SS
        const [minutes, seconds] = parts;
        return (minutes * 60 + seconds) * 1000;
    } else if (parts.length === 3) {
        // HH:MM:SS
        const [hours, minutes, seconds] = parts;
        return (hours * 3600 + minutes * 60 + seconds) * 1000;
    }
    
    return 0;
}

