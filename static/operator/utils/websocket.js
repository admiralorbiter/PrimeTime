/** WebSocket utilities for Operator UI. */
import { io } from 'https://cdn.socket.io/4.5.4/socket.io.esm.min.js';

/**
 * Create and configure SocketIO connection for Operator UI namespace.
 */
export function createControlSocket() {
    return io('/control', {
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000
    });
}

/**
 * Setup WebSocket event handlers for Operator UI.
 * @param {Socket} socket - SocketIO socket instance
 * @param {Object} handlers - Event handler functions
 */
export function setupControlSocketHandlers(socket, handlers) {
    const {
        onConnect,
        onDisconnect,
        onAssetIndexResponse,
        onTimelineSaved
    } = handlers;
    
    socket.on('connect', () => {
        console.log('Operator UI connected to server');
        if (onConnect) onConnect();
    });
    
    socket.on('disconnect', () => {
        console.log('Operator UI disconnected from server');
        if (onDisconnect) onDisconnect();
    });
    
    // Asset index response
    socket.on('ASSET_INDEX_RESPONSE', (data) => {
        console.log('ASSET_INDEX_RESPONSE:', data);
        if (onAssetIndexResponse) onAssetIndexResponse(data.assets);
    });
    
    // Timeline saved response
    socket.on('TIMELINE_SAVED', (data) => {
        console.log('TIMELINE_SAVED:', data);
        if (onTimelineSaved) onTimelineSaved(data);
    });
    
    // Ping/Pong handlers
    socket.on('PING', (data) => {
        socket.emit('PONG', { timestamp: Date.now(), echo: 'pong' });
    });
}

/**
 * Request asset index from server.
 */
export function requestAssetIndex(socket) {
    if (socket && socket.connected) {
        socket.emit('ASSET_INDEX_REQUEST', {});
    }
}

/**
 * Save timeline to server.
 */
export function saveTimeline(socket, timeline) {
    if (socket && socket.connected) {
        socket.emit('TIMELINE_SAVE', { timeline });
    }
}

