
// booking-manager.js

// booking-manager.js

// Global State is now initialized in booking.html <head> to prevent race conditions.
// window.API_BASE and window.bookingData are already available.

document.addEventListener('DOMContentLoaded', () => {
    // Component Registry
    const steps = [
        document.getElementById('step0'), // Service
        document.getElementById('step1'), // Intake
        document.getElementById('step2'), // Waiver
        document.getElementById('step3'), // Schedule
        document.getElementById('step4'), // Payment
        document.getElementById('step5')  // Confirmation
    ];

    const indicators = [
        document.getElementById('step-0-indicator'),
        document.getElementById('step-1-indicator'),
        document.getElementById('step-2-indicator'),
        document.getElementById('step-3-indicator'),
        document.getElementById('step-4-indicator'),
        document.getElementById('step-5-indicator')
    ];

    let currentStepIndex = 0;

    // --- Navigation Logic ---
    function showStep(index) {
        // Hide all
        steps.forEach(el => el.classList.add('hidden'));

        // Show target
        steps[index].classList.remove('hidden');

        // Update Indicators
        indicators.forEach((ind, i) => {
            if (!ind) return;
            ind.className = "step-circle w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold mb-1 transition-all duration-300";
            if (i < index) {
                // Completed
                ind.classList.add('bg-[var(--sage-green)]', 'text-white', 'border-[var(--sage-green)]');
                ind.innerHTML = '<i class="fas fa-check"></i>';
            } else if (i === index) {
                // Current
                ind.classList.add('bg-[var(--sage-green)]', 'text-white', 'border-[var(--sage-green)]');
                // Check if it's the last step
                if (i === indicators.length - 1) {
                    ind.innerHTML = '<i class="fas fa-check"></i>';
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

    // --- Submit Logic (Step 4 -> 5) ---
    async function submitBooking() {
        try {
            console.log("[BookingManager] Submitting Booking Data:", window.bookingData);
            const response = await fetch(`${window.API_BASE}/api/booking`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(window.bookingData)
            });

            if (response.ok) {
                const data = await response.json();
                if (data.bookingId) window.bookingData.id = data.bookingId;
                return true;
            } else {
                const err = await response.json();
                alert(`Error: ${err.message || 'Server error'}`);
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
        // Step 4 (Payment) implies Submission
        if (stepIdx === 4) {
            const success = await submitBooking();
            if (success) {
                // Update Confirmation Screen with latest data (email)

                showStep(5);
            } else {
                // Determine how to reset button state in component? 
                // Component handles its own loading state usually. 
                // Ideally we signal back failure?
                // For MVP, alert is handled above. User stays on Step 4.
                // We might need to un-disable the button.
                const paymentComp = document.getElementById('step4');
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

    // Initialize
    showStep(0);
});
