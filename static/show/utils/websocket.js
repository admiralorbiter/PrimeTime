/** WebSocket utilities for Show View. */
import { io } from 'https://cdn.socket.io/4.5.4/socket.io.esm.min.js';

/**
 * Create and configure SocketIO connection for Show View namespace.
 */
export function createShowSocket() {
    return io('/show', {
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000
    });
}

/**
 * Setup WebSocket event handlers for Show View.
 * @param {Socket} socket - SocketIO socket instance
 * @param {Object} handlers - Event handler functions
 */
export function setupShowSocketHandlers(socket, handlers) {
    const {
        onConnect,
        onDisconnect,
        onLoadTimeline,
        onPlay,
        onPause,
        onJump,
        onSkip,
        onSetTimecode,
        onBlackout,
        onHold,
        onSetVolume,
        onSetTheme,
        onCue
    } = handlers;
    
    socket.on('connect', () => {
        console.log('Show View connected to server');
        if (onConnect) onConnect();
    });
    
    socket.on('disconnect', () => {
        console.log('Show View disconnected from server');
        if (onDisconnect) onDisconnect();
    });
    
    socket.on('SHOW_LOAD_TIMELINE', (data) => {
        console.log('SHOW_LOAD_TIMELINE:', data);
        if (onLoadTimeline) onLoadTimeline(data.timeline);
    });
    
    socket.on('SHOW_PLAY', (data) => {
        console.log('SHOW_PLAY:', data);
        if (onPlay) onPlay(data.index);
    });
    
    socket.on('SHOW_PAUSE', (data) => {
        console.log('SHOW_PAUSE:', data);
        if (onPause) onPause();
    });
    
    socket.on('SHOW_JUMP', (data) => {
        console.log('SHOW_JUMP:', data);
        if (onJump) onJump(data.index);
    });
    
    socket.on('SHOW_SKIP', (data) => {
        console.log('SHOW_SKIP:', data);
        if (onSkip) onSkip(data.delta);
    });
    
    socket.on('SHOW_SET_TIMECODE', (data) => {
        if (onSetTimecode) onSetTimecode(data.timecodeMs);
    });
    
    socket.on('SHOW_BLACKOUT', (data) => {
        console.log('SHOW_BLACKOUT:', data);
        if (onBlackout) onBlackout(data.on);
    });
    
    socket.on('SHOW_HOLD', (data) => {
        console.log('SHOW_HOLD:', data);
        if (onHold) onHold(data.on);
    });
    
    socket.on('SHOW_SET_VOLUME', (data) => {
        console.log('SHOW_SET_VOLUME:', data);
        if (onSetVolume) onSetVolume(data.value);
    });
    
    socket.on('SHOW_SET_THEME', (data) => {
        console.log('SHOW_SET_THEME:', data);
        if (onSetTheme) onSetTheme(data.id);
    });
    
    socket.on('SHOW_CUE', (data) => {
        console.log('SHOW_CUE:', data);
        if (onCue) onCue(data.type, data.payload);
    });
    
    // Ping/Pong handlers
    socket.on('PING', (data) => {
        socket.emit('PONG', { timestamp: Date.now(), echo: 'pong' });
    });
}

/**
 * Emit status update to server.
 */
export function emitStatus(socket, status) {
    if (socket && socket.connected) {
        socket.emit('SHOW_STATUS', status);
    }
}

/**
 * Emit error to server.
 */
export function emitError(socket, code, message, context = {}) {
    if (socket && socket.connected) {
        socket.emit('ERROR', { code, message, context });
    }
}

/**
 * Emit asset preload completion.
 */
export function emitPreloadDone(socket, sceneId) {
    if (socket && socket.connected) {
        socket.emit('ASSET_PRELOAD_DONE', { sceneId });
    }
}

