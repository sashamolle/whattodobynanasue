/**
 * Shared utility for updating mobile summary footer across booking steps
 * Single source of truth for displaying booking information
 */
import { formatBookingDateShort, calculateBookingPrice, getServiceIcon } from './booking-format.js';

export function updateMobileSummary(container) {
    const mobileDate = container.querySelector('#mobile-date');
    const mobileServiceIcon = container.querySelector('#mobile-service-icon');
    const mobileServicePrice = container.querySelector('#mobile-service-price');
    const mobileTravelFee = container.querySelector('#mobile-travel-fee');
    const mobileTotal = container.querySelector('#mobile-total');

    // Update Date/Time from bookingData
    if (mobileDate && window.bookingData && window.bookingData.appointmentDate && window.bookingData.appointmentTime) {
        const formattedDate = formatBookingDateShort(window.bookingData.appointmentDate);
        mobileDate.textContent = `${formattedDate} at ${window.bookingData.appointmentTime} (45m)`;
    }

    // Update Service Icon and Price
    const serviceType = window.bookingData.serviceType;
    const pricing = calculateBookingPrice(serviceType, window.bookingData.travelZone);

    if (mobileServiceIcon) {
        mobileServiceIcon.className = `${getServiceIcon(serviceType)} text-gray-400`;
    }

    if (mobileServicePrice) {
        mobileServicePrice.textContent = `$${pricing.basePrice}`;
    }

    // Show/hide travel fee
    if (mobileTravelFee) {
        if (pricing.travelFee > 0) {
            mobileTravelFee.classList.remove('hidden');
        } else {
            mobileTravelFee.classList.add('hidden');
        }
    }

    // Update total - use bookingData.price if available, otherwise use calculated
    if (mobileTotal) {
        const total = window.bookingData.price || pricing.total;
        mobileTotal.textContent = `$${total}`;
    }
}
