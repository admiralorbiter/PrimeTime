/** Timeline JSON validation utilities. */

/**
 * Validate timeline JSON structure.
 * @param {Object} timeline - Timeline object to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateTimeline(timeline) {
    const errors = [];
    
    if (!timeline || typeof timeline !== 'object') {
        errors.push('Timeline must be an object');
        return { valid: false, errors };
    }
    
    // Check required fields
    if (!timeline.name || typeof timeline.name !== 'string') {
        errors.push('Timeline must have a name (string)');
    }
    
    if (!timeline.items || !Array.isArray(timeline.items)) {
        errors.push('Timeline must have an items array');
        return { valid: false, errors };
    }
    
    // Validate each item
    timeline.items.forEach((item, index) => {
        if (!item.id || typeof item.id !== 'string') {
            errors.push(`Item ${index} must have an id (string)`);
        }
        
        if (!item.sceneType || typeof item.sceneType !== 'string') {
            errors.push(`Item ${index} must have a sceneType (string)`);
        }
        
        if (!item.params || typeof item.params !== 'object') {
            errors.push(`Item ${index} must have params (object)`);
        }
        
        // Validate duration
        if (item.duration !== undefined && item.duration !== 'auto') {
            if (typeof item.duration !== 'number' || item.duration < 0) {
                errors.push(`Item ${index} duration must be a positive number or 'auto'`);
            }
        }
        
        // Validate transitions
        const transitions = ['transitionIn', 'transitionOut'];
        transitions.forEach(prop => {
            if (item[prop] !== undefined && typeof item[prop] !== 'string') {
                errors.push(`Item ${index} ${prop} must be a string`);
            }
        });
    });
    
    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Validate a single timeline item.
 */
export function validateTimelineItem(item) {
    const errors = [];
    
    if (!item.id || typeof item.id !== 'string') {
        errors.push('Item must have an id (string)');
    }
    
    if (!item.sceneType || typeof item.sceneType !== 'string') {
        errors.push('Item must have a sceneType (string)');
    }
    
    if (!item.params || typeof item.params !== 'object') {
        errors.push('Item must have params (object)');
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

