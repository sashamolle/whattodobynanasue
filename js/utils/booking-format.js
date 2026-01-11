/**
 * Shared utility for formatting booking data consistently
 * Used by frontend and backend to ensure identical display
 */

/**
 * Format date from YYYY-MM-DD to human-readable format
 * Avoids timezone issues by parsing manually
 */
export function formatBookingDate(dateString) {
    if (!dateString) return '';

    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
}

/**
 * Format date for short display (e.g., mobile summary)
 */
export function formatBookingDateShort(dateString) {
    if (!dateString) return '';

    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Calculate pricing based on service type and zone
 */
export function calculateBookingPrice(serviceType, travelZone) {
    const isInHome = serviceType === 'in-home';
    const isZone2 = travelZone === 'zone2';

    if (isInHome) {
        const basePrice = 225;
        const travelFee = isZone2 ? 30 : 0;
        return {
            basePrice,
            travelFee,
            total: basePrice + travelFee
        };
    } else {
        return {
            basePrice: 150,
            travelFee: 0,
            total: 150
        };
    }
}

/**
 * Get service name from service type
 */
export function getServiceName(serviceType) {
    return serviceType === 'in-home'
        ? 'In-Home Mobility Class'
        : 'Virtual Mobility Class';
}

/**
 * Get service icon class
 */
export function getServiceIcon(serviceType) {
    return serviceType === 'in-home'
        ? 'fas fa-home'
        : 'fas fa-video';
}
