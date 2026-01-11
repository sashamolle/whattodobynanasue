
// booking-manager.js

// booking-manager.js

// Global State is now initialized in booking.html <head> to prevent race conditions.
// window.API_BASE and window.bookingData are already available.

document.addEventListener('DOMContentLoaded', () => {
    // Component Registry (3 steps + confirmation)
    const steps = [
        document.getElementById('step0'), // Service + Schedule
        document.getElementById('step1'), // Intake
        document.getElementById('step2'), // Payment
        document.getElementById('step3')  // Confirmation
    ];

    const indicators = [
        document.getElementById('step-0-indicator'),
        document.getElementById('step-1-indicator'),
        document.getElementById('step-2-indicator')
    ];

    let currentStepIndex = 0;

    // --- Navigation Logic ---
    function showStep(index) {
        // [GA4] Virtual Page View Tracking (Send immediately before UI work)
        trackVirtualPageView(index);

        // Hide all
        steps.forEach(el => el.classList.add('hidden'));

        // Show target
        steps[index].classList.remove('hidden');

        // Call onShow lifecycle method if it exists
        if (steps[index] && typeof steps[index].onShow === 'function') {
            steps[index].onShow();
        }

        // Update mobile summary for intake step
        if (index === 1 && steps[index].updateMobileSummary) {
            steps[index].updateMobileSummary();
        }

        // Update Indicators
        indicators.forEach((ind, i) => {
            if (!ind) return;
            ind.className = "step-circle w-8 h-8 md:w-10 md:h-10 rounded-full border-2 flex items-center justify-center font-bold mb-1 transition-all duration-300 text-xs md:text-base";

            // Special Case: If we are on Confirmation (index 5) or beyond available indicators
            if (index >= indicators.length) {
                // All indicators marked as completed
                ind.classList.add('bg-[var(--sage-green)]', 'text-white', 'border-[var(--sage-green)]');
                ind.innerHTML = '<i class="fas fa-check"></i>';
                return;
            }

            if (i < index) {
                // Completed
                ind.classList.add('bg-[var(--sage-green)]', 'text-white', 'border-[var(--sage-green)]');
                ind.innerHTML = '<i class="fas fa-check"></i>';
            } else if (i === index) {
                // Current
                ind.classList.add('bg-[var(--sage-green)]', 'text-white', 'border-[var(--sage-green)]');
                // Check if it's the last step
                if (i === indicators.length - 1) {
                    ind.innerHTML = (i + 1).toString(); // Keep number for consistency or checkmark? User wants numbering consistency or just current?
                    // Previous logic: if(i === indicators.last) checkmark.
                    // But now last step is Payment (4).
                    // Let's keep it as number to indicate "Step 5" is happening now?
                    // Actually, if it's the current step, distinct style is enough.
                    // Let's stick to number.
                    ind.innerHTML = (i + 1).toString();
                } else {
                    ind.innerHTML = (i + 1).toString();
                }
            } else {
                // Future
                ind.classList.add('bg-white', 'border-gray-300', 'text-gray-400');
                ind.innerHTML = (i + 1).toString();
            }
        });

        // Update Display if supported (re-hydrate data)
        if (steps[index] && typeof steps[index].updateDisplay === 'function') {
            steps[index].updateDisplay();
        }

        currentStepIndex = index;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // --- GA4 Virtual Page Tracking ---
    function trackVirtualPageView(stepIndex) {
        // Mapping Step Index (0-3) to Virtual Paths
        // 0: Service+Schedule  -> step-1
        // 1: Intake            -> step-2
        // 2: Payment           -> step-3
        // 3: Confirm           -> thank-you

        const mapping = {
            0: { path: '/signup/step-1', title: 'Signup - Step 1' },
            1: { path: '/signup/step-2', title: 'Signup - Step 2' },
            2: { path: '/signup/step-3', title: 'Signup - Step 3' },
            3: { path: '/signup/thank-you', title: 'Signup - Complete' }
        };

        const config = mapping[stepIndex];
        if (!config) return;

        const tagId = window.ENV?.GA4_MEASUREMENT_ID;
        const analyticsEnabled = window.ENV?.ENABLE_ANALYTICS !== false;

        // Ensure gtag exists and analytics is enabled
        if (typeof window.gtag === 'function' && tagId && analyticsEnabled) {
            console.log(`[GA4] Sending Virtual Page View: ${config.path}`);

            // [GA4] Use 'event' + 'page_view' for SPA transitions
            // 'config' often gets ignored if sent multiple times without page reload
            window.gtag('event', 'page_view', {
                'page_path': config.path,
                'page_title': config.title,
                'send_to': tagId
            });
        } else {
            if (!analyticsEnabled) {
                console.log(`[GA4] Analytics disabled for localhost testing`);
            }
            // Optional: Log warning only if dev, or silent fail
            // console.warn("[GA4] gtag not found or ID missing");
        }
    }

    // --- Submit Logic (Step 4 -> 5) ---
    async function submitBooking() {
        try {
            const apiBase = window.ENV.API_BASE;
            const response = await fetch(`${apiBase}/api/booking`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(window.bookingData)
            });

            if (response.ok) {
                const data = await response.json();
                if (data.bookingId) window.bookingData.id = data.bookingId;
                return true;
            } else {
                const err = await response.json().catch(() => ({ message: 'Unknown error' }));
                console.error('[BookingManager] Booking submission failed:', err);
                alert(`Error: ${err.message || err.error || 'Server error'}`);
                return false;
            }
        } catch (e) {
            console.error(e);
            alert("Network Error. Please try again.");
            return false;
        }
    }

    // --- Event Listeners ---
    // Listen for events bubbling up from Shadow/Light DOM components

    document.addEventListener('step-complete', async (e) => {
        const stepIdx = e.detail.step; // 0, 1, 2...

        // Validation / Side Effects before moving?
        // Step 2 (Payment) implies Submission
        if (stepIdx === 2) {
            const success = await submitBooking();
            if (success) {
                // Update Confirmation Screen with latest data (email)

                showStep(3);
            } else {
                // Determine how to reset button state in component? 
                // Component handles its own loading state usually. 
                // Ideally we signal back failure?
                // For MVP, alert is handled above. User stays on Step 4.
                // We might need to un-disable the button.
                const paymentComp = document.getElementById('step2');
                const btn = paymentComp.querySelector('#btn-pay-now');
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = 'Pay Now <i class="fas fa-lock ml-2"></i>';
                }
            }
            return;
        }

        // Default Next
        showStep(stepIdx + 1);
    });

    document.addEventListener('step-back', (e) => {
        const stepIdx = e.detail.step;
        showStep(stepIdx - 1);
    });

    // Initialize - Check for Stripe redirect success
    const urlParams = new URLSearchParams(window.location.search);
    const paymentIntentClientSecret = urlParams.get('payment_intent_client_secret');
    const redirectStatus = urlParams.get('redirect_status');

    if (paymentIntentClientSecret && redirectStatus === 'succeeded') {
        // Stripe redirected back after successful payment
        showStep(4);
    } else {
        // Normal flow - start at beginning
        showStep(0);
    }
});
