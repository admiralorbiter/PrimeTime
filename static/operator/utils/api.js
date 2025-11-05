/** REST API client functions for Operator UI. */

const API_BASE = '/api';

/**
 * Fetch assets from API.
 */
export async function fetchAssets(assetType = null) {
    const url = assetType ? `${API_BASE}/assets?type=${assetType}` : `${API_BASE}/assets`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching assets:', error);
        throw error;
    }
}

/**
 * Fetch a specific asset by ID.
 */
export async function fetchAsset(assetId) {
    try {
        const response = await fetch(`${API_BASE}/assets/${assetId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching asset:', error);
        throw error;
    }
}

/**
 * Fetch asset thumbnail.
 */
export function getAssetThumbnailUrl(assetId, size = 'medium') {
    return `${API_BASE}/assets/${assetId}/thumbnail?size=${size}`;
}

/**
 * Fetch all timelines.
 */
export async function fetchTimelines() {
    try {
        const response = await fetch(`${API_BASE}/timelines`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching timelines:', error);
        throw error;
    }
}

/**
 * Fetch active timeline.
 */
export async function fetchActiveTimeline() {
    try {
        const response = await fetch(`${API_BASE}/timelines/active`);
        if (!response.ok) {
            if (response.status === 404) {
                return null; // No active timeline
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching active timeline:', error);
        throw error;
    }
}

/**
 * Create a new timeline.
 */
export async function createTimeline(timelineData) {
    try {
        const response = await fetch(`${API_BASE}/timelines`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(timelineData)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error creating timeline:', error);
        throw error;
    }
}

/**
 * Update a timeline.
 */
export async function updateTimeline(timelineId, updates) {
    try {
        const response = await fetch(`${API_BASE}/timelines/${timelineId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updates)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error updating timeline:', error);
        throw error;
    }
}

/**
 * Fetch a setting.
 */
export async function fetchSetting(key) {
    try {
        const response = await fetch(`${API_BASE}/settings/${key}`);
        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.value;
    } catch (error) {
        console.error('Error fetching setting:', error);
        throw error;
    }
}

/**
 * Update a setting.
 */
export async function updateSetting(key, value) {
    try {
        const response = await fetch(`${API_BASE}/settings/${key}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ value })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error updating setting:', error);
        throw error;
    }
}

