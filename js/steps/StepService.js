export class StepService extends HTMLElement {
    connectedCallback() {
        this.render();
        this.setupLogic();
    }

    render() {
        this.innerHTML = `
        <h2 class="text-2xl font-bold text-gray-800 mb-6">Select Service Type</h2>
        <form id="step0-form">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

            <!-- In-Home Option -->
            <div class="relative">
              <input type="radio" name="serviceType" id="service-in-home" value="in-home" class="peer hidden" checked>
              <label for="service-in-home"
                class="service-card block cursor-pointer bg-white p-6 rounded-lg transition-all">
                <div class="flex flex-col items-center text-center">
                  <i class="fas fa-home text-3xl text-[var(--sage-green)] mb-3"></i>
                  <h3 class="font-bold text-gray-800 text-lg">In-Home Visit</h3>
                  <p class="text-sm text-gray-600 mt-2">We come to you! Available in Manhattan & select areas.</p>
                  <p class="text-xs text-gray-500 mt-1 font-medium">From $150.00</p>
                </div>
              </label>
            </div>

            <!-- Virtual Option -->
            <div class="relative">
              <input type="radio" name="serviceType" id="service-virtual" value="virtual" class="peer hidden">
              <label for="service-virtual"
                class="service-card block cursor-pointer bg-white p-6 rounded-lg transition-all">
                <div class="flex flex-col items-center text-center">
                  <i class="fas fa-video text-3xl text-blue-500 mb-3"></i>
                  <h3 class="font-bold text-gray-800 text-lg">Virtual Visit</h3>
                  <p class="text-sm text-gray-600 mt-2">Expert guidance via video call. Available anywhere.</p>
                  <p class="text-xs text-gray-500 mt-1 font-medium">$150.00 (Flat Rate)</p>
                </div>
              </label>
            </div>
          </div>

          <!-- Address Input Container (Hidden for Virtual) -->
          <div id="location-gate-container" class="mb-8">
            <label class="block text-sm font-medium text-gray-700 mb-1">Enter your Home Address</label>
            <input type="text" id="GateAddress" class="form-input" placeholder="Street, City, Zip" autocomplete="off">
            <!-- Feedback container -->
            <div id="feedback-div" class="hidden mt-4 p-4 rounded-lg flex items-start gap-3 text-sm font-medium fade-in border transition-all duration-300"></div>
          </div>

          <div class="mt-8 flex justify-end">
            <button type="submit" id="btn-step-0-next" class="btn-primary opacity-50 cursor-not-allowed" disabled>
              Next: Details <i class="fas fa-arrow-right ml-2"></i>
            </button>
          </div>
        </form>
      `;
    }

    setupLogic() {
        const radioInHome = this.querySelector('#service-in-home');
        const radioVirtual = this.querySelector('#service-virtual');
        const locationContainer = this.querySelector('#location-gate-container');
        const addressInput = this.querySelector('#GateAddress');
        const nextBtn0 = this.querySelector('#btn-step-0-next');
        const feedbackDiv = this.querySelector('#feedback-div');

        const CHELSEA_ORIGIN = "10011, USA";
        let selectedService = 'in-home';
        let step0Valid = false;

        // Ensure global bookingData exists
        window.bookingData = window.bookingData || {};

        // 1. Service Type Logic
        const updateServiceState = () => {
            if (radioInHome.checked) {
                selectedService = 'in-home';
                locationContainer.classList.remove('hidden');
                // Re-validate address field
                if (addressInput.dataset.valid === 'true') {
                    this.updatePrice(150.00); // Or 180 depending on zone, logic below handles reuse?
                    this.validateStep0(true);
                    if (addressInput.value) this.calculateDistance(addressInput.value, false); // Re-check strictly
                } else {
                    this.validateStep0(false);
                }
            } else {
                selectedService = 'virtual';
                locationContainer.classList.add('hidden');
                this.updatePrice(150.00, 'Virtual Flat Rate');
                this.validateStep0(true); // Virtual is always valid
                addressInput.value = ''; // Clear address
                addressInput.dataset.valid = 'false';
                feedbackDiv.classList.add('hidden');
            }
            // Persist
            window.bookingData.serviceType = selectedService;
        };

        radioInHome.addEventListener('change', updateServiceState);
        radioVirtual.addEventListener('change', updateServiceState);

        // 2. Validation Helper
        this.validateStep0 = (isValid) => {
            step0Valid = isValid;
            if (isValid) {
                nextBtn0.classList.remove('opacity-50', 'cursor-not-allowed');
                nextBtn0.disabled = false;
            } else {
                nextBtn0.classList.add('opacity-50', 'cursor-not-allowed');
                nextBtn0.disabled = true;
            }
        };

        // 3. Price Helper
        this.updatePrice = (price, description = '') => {
            window.bookingData.price = price;
            // Dispatch Event to Header? Or just update global.
            // For now, update global. Header component might need to listen for changes if we had one.
            // Shell will handle header updates via event "price-update"
            this.dispatchEvent(new CustomEvent('price-update', {
                detail: { price, description },
                bubbles: true
            }));
        };

        // 4. Feedback Helper
        this.showFeedback = (msg, type) => {
            feedbackDiv.innerHTML = '';
            feedbackDiv.className = "mt-4 p-4 rounded-lg flex items-start gap-3 text-sm font-medium fade-in border transition-all duration-300";

            let iconHtml = '';
            if (type === 'success') {
                feedbackDiv.classList.add('bg-[var(--sage-green-light)]', 'text-[var(--dark-heading)]', 'border-[var(--sage-green)]');
                iconHtml = `<div class="mt-0.5 min-w-[20px] text-[var(--sage-green)]"><i class="fas fa-check-circle text-lg"></i></div>`;
            } else if (type === 'warning') {
                feedbackDiv.style.backgroundColor = '#FFFDF5';
                feedbackDiv.style.borderColor = '#E5E1D6';
                feedbackDiv.style.color = 'var(--dark-heading)';
                iconHtml = `<div class="mt-0.5 min-w-[20px] text-[#D4AF37]"><i class="fas fa-car text-lg"></i></div>`;
            } else if (type === 'denial') {
                feedbackDiv.classList.add('bg-rose-light');
                iconHtml = `<div class="mt-0.5 min-w-[20px] text-[#742A2A]"><i class="fas fa-video text-lg"></i></div>`;
            } else if (type === 'info') {
                feedbackDiv.classList.add('bg-blue-50', 'text-blue-800', 'border-blue-200');
                iconHtml = `<div class="mt-0.5 min-w-[20px]"><i class="fas fa-info-circle text-lg"></i></div>`;
            } else {
                feedbackDiv.classList.add('bg-red-100', 'text-red-800', 'border-red-200');
                iconHtml = `<div class="mt-0.5 min-w-[20px]"><i class="fas fa-exclamation-circle text-lg"></i></div>`;
            }
            feedbackDiv.innerHTML = iconHtml + `<div>${msg}</div>`;
            feedbackDiv.classList.remove('hidden');

            // Attach Switch Listener
            const link = feedbackDiv.querySelector('a');
            if (link && msg.includes('Switch to Virtual')) {
                link.onclick = (e) => { e.preventDefault(); radioVirtual.click(); };
            }
        };

        // 5. Google Maps Logic
        this.calculateDistance = (destination, isManhattan) => {
            if (!window.google) return; // Wait for load?
            const service = new google.maps.DistanceMatrixService();
            this.showFeedback('Checking availability at this location... <i class="fas fa-spinner fa-spin ml-2"></i>', 'info');
            this.validateStep0(false);

            // Timeout 5s
            const timeoutId = setTimeout(() => {
                this.showFeedback('Calculation timed out. Please try again.', 'error');
            }, 5000);

            service.getDistanceMatrix({
                origins: [CHELSEA_ORIGIN],
                destinations: [destination],
                travelMode: google.maps.TravelMode.WALKING,
                unitSystem: google.maps.UnitSystem.IMPERIAL
            }, (response, status) => {
                clearTimeout(timeoutId);
                if (status !== 'OK' || !response || !response.rows || response.rows.length === 0) {
                    this.showFeedback('Error calculating distance.', 'error');
                    return;
                }
                const element = response.rows[0].elements[0];
                if (element.status !== 'OK') {
                    if (element.status === 'ZERO_RESULTS') {
                        this.showFeedback("No walking route found. Address may be too far.", 'error');
                    } else {
                        this.showFeedback(`Route error: ${element.status}`, 'error');
                    }
                    return;
                }

                const minutes = element.duration.value / 60;
                if (minutes <= 30) {
                    // Zone 1
                    this.updatePrice(150.00);
                    this.showFeedback('Great news! You are in our primary service area.', 'success');
                    addressInput.dataset.valid = 'true';
                    window.bookingData.parentAddress = destination;
                    this.validateStep0(true);
                } else if (isManhattan) {
                    // Zone 2
                    this.updatePrice(180.00, 'Includes $30 Travel Fee');
                    this.showFeedback('We can visit you! Just a heads up, a small travel fee ($30) will be added for this location.', 'warning');
                    addressInput.dataset.valid = 'true';
                    window.bookingData.parentAddress = destination;
                    this.validateStep0(true);
                } else {
                    // Zone 3
                    this.showFeedback(`That address is outside our travel radius, but we can still support you! <a href="#" class="font-bold underline text-[#742A2A] hover:text-red-900 ml-1">Switch to Virtual Visit</a>`, 'denial');
                    addressInput.dataset.valid = 'false';
                    this.validateStep0(false);
                }
            });
        };

        // Init Autocomplete
        this.initMapLogic = () => {
            const addressInput = this.querySelector('#GateAddress');
            if (!window.google || !window.google.maps || !addressInput) return;

            try {
                const autocomplete = new google.maps.places.Autocomplete(addressInput, {
                    componentRestrictions: { country: "us" },
                    fields: ["geometry", "formatted_address", "address_components"]
                });
                autocomplete.addListener('place_changed', () => {
                    const place = autocomplete.getPlace();
                    if (!place.geometry) {
                        addressInput.dataset.valid = 'false';
                        this.showFeedback('Please select a valid address.', 'error');
                        this.validateStep0(false);
                        return;
                    }
                    let isManhattan = false;
                    if (place.address_components) {
                        for (const c of place.address_components) {
                            if (c.long_name === 'New York County' || c.long_name === 'Manhattan') isManhattan = true;
                        }
                    }
                    this.calculateDistance(place.formatted_address, isManhattan);
                });
            } catch (e) { console.error("Maps Init Error", e); }
        };

        if (window.google && window.google.maps) {
            this.initMapLogic();
        } else {
            // Wait for global callback
            document.addEventListener('google-maps-loaded', this.initMapLogic);
        }

        // 6. Submit Handle
        this.querySelector('#step0-form').onsubmit = (e) => {
            e.preventDefault();
            if (step0Valid) {
                this.dispatchEvent(new CustomEvent('step-complete', {
                    detail: { step: 0 },
                    bubbles: true,
                    composed: true
                }));
            }
        };

        // 7. Initial Load
        // Pre-fill from Global or default
        if (window.bookingData.serviceType === 'virtual') {
            radioVirtual.click();
        } else {
            radioInHome.click();
            if (window.bookingData.parentAddress) {
                addressInput.value = window.bookingData.parentAddress;
                // Trigger validation? Might effectively re-run distance check if we had logic, 
                // but Autocomplete usually requires user interaction. 
                // We'll trust stored address for now regarding validity? 
                // Better to re-validate distance if loaded, but that costs API call.
                // Let's just trust valid flag if implementing sophisticated storage.
                // For simplistic approach, re-validation on 'place_changed' is safest.
            }
        }

        // Initial Price
        updateServiceState();
    }
}
customElements.define('step-service', StepService);
