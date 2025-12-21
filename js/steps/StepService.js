export class StepService extends HTMLElement {
    connectedCallback() {
        this.render();
        this.setupLogic();
    }

    render() {
        this.innerHTML = `
        <div class="fade-in max-w-3xl mx-auto">
            <div class="text-center mb-10">
                <h2 class="text-3xl font-bold text-[var(--dark-heading)] mb-3">Select Service Type</h2>
                <p class="text-gray-500">Choose the option that works best for you and your little one.</p>
            </div>

            <form id="step0-form">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <!-- In-Home Option -->
                    <div class="relative group">
                        <input type="radio" name="serviceType" id="service-in-home" value="in-home" class="peer hidden" checked>
                        <label for="service-in-home"
                            class="h-full block cursor-pointer bg-white border border-gray-200 rounded-xl p-6 shadow-sm transition-all duration-300
                            hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(86,128,100,0.4)]
                            peer-checked:border-[var(--sage-green)] peer-checked:border-2 peer-checked:bg-[var(--sage-green-light)]">
                            
                            <div class="flex flex-col items-center text-center h-full">
                                <div class="w-14 h-14 rounded-full bg-white border border-gray-100 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                    <i class="fas fa-home text-2xl text-[var(--sage-green)]"></i>
                                </div>
                                <h3 class="font-semibold text-[var(--dark-heading)] text-lg mb-2">In-Home Visit</h3>
                                <p class="text-sm text-[#666] leading-relaxed mb-4 flex-grow">We come to you! Available in Manhattan & select areas.</p>
                                <div class="text-xs font-medium text-gray-400 uppercase tracking-wide mt-auto pt-4 border-t border-gray-50 w-full">From $150.00</div>
                            </div>
                        </label>
                    </div>

                    <!-- Virtual Option -->
                    <div class="relative group">
                        <input type="radio" name="serviceType" id="service-virtual" value="virtual" class="peer hidden">
                        <label for="service-virtual"
                            class="h-full block cursor-pointer bg-white border border-gray-200 rounded-xl p-6 shadow-sm transition-all duration-300
                            hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(86,128,100,0.4)]
                            peer-checked:border-[var(--sage-green)] peer-checked:border-2 peer-checked:bg-[var(--sage-green-light)]">
                            
                            <div class="flex flex-col items-center text-center h-full">
                                <div class="w-14 h-14 rounded-full bg-white border border-gray-100 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                    <i class="fas fa-video text-2xl text-[var(--sage-green)]"></i>
                                </div>
                                <h3 class="font-semibold text-[var(--dark-heading)] text-lg mb-2">Virtual Visit</h3>
                                <p class="text-sm text-[#666] leading-relaxed mb-4 flex-grow">Expert guidance via video call. Available anywhere.</p>
                                <div class="text-xs font-medium text-gray-400 uppercase tracking-wide mt-auto pt-4 border-t border-gray-50 w-full">Flat Rate $150.00</div>
                            </div>
                        </label>
                    </div>
                </div>

                <!-- Address Input Container -->
                <div id="location-gate-container" class="mt-8 transition-all duration-500 ease-in-out">
                     <label for="GateAddress" class="block text-lg font-medium text-[var(--dark-heading)] mb-3 text-center md:text-left">Enter your Home Address</label>
                     <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <i class="fas fa-map-marker-alt text-[var(--sage-green)] opacity-50"></i>
                        </div>
                        <input type="text" id="GateAddress" 
                            class="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:border-[var(--sage-green)] focus:ring-2 focus:ring-[var(--sage-green)] focus:ring-opacity-20 outline-none transition-all shadow-sm text-gray-700 font-medium placeholder-gray-400" 
                            placeholder="Street, City, Zip" autocomplete="off">
                    </div>
                    
                    <!-- Feedback container -->
                    <div id="feedback-div" class="hidden mt-4 p-4 rounded-lg flex items-start gap-4 text-sm font-medium fade-in border transition-all duration-300"></div>
                </div>

                <div class="mt-10 flex justify-end">
                    <button type="submit" id="btn-step-0-next" 
                        class="w-full md:w-auto bg-gray-200 text-gray-400 px-8 py-4 rounded-full font-semibold shadow-none cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2" disabled>
                        Next: Details <i class="fas fa-arrow-right text-sm"></i>
                    </button>
                </div>
            </form>
        </div>
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
                locationContainer.classList.remove('hidden', 'opacity-0');
                locationContainer.classList.add('opacity-100');

                // Re-validate address field
                if (addressInput.dataset.valid === 'true') {
                    if (addressInput.value) this.calculateDistance(addressInput.value, false);
                } else {
                    // CLEAR LOGIC: If returning to In-Home and address was invalid/denied, clear it.
                    addressInput.value = '';
                    feedbackDiv.classList.add('hidden');
                    this.validateStep0(false);
                }
            } else {
                selectedService = 'virtual';
                locationContainer.classList.add('hidden', 'opacity-0');
                this.updatePrice(150.00, 'Virtual Flat Rate');
                this.validateStep0(true);
                addressInput.dataset.valid = 'false';
                feedbackDiv.classList.add('hidden');
            }
            window.bookingData.serviceType = selectedService;
        };

        radioInHome.addEventListener('change', updateServiceState);
        radioVirtual.addEventListener('change', updateServiceState);

        // 2. Validation Helper
        this.validateStep0 = (isValid) => {
            step0Valid = isValid;
            if (isValid) {
                nextBtn0.disabled = false;
                nextBtn0.classList.remove('bg-gray-200', 'text-gray-400', 'cursor-not-allowed', 'shadow-none', 'transform-none', 'opacity-50');
                nextBtn0.classList.add('bg-[var(--sage-green)]', 'text-white', 'shadow-lg', 'hover:shadow-xl', 'hover:-translate-y-0.5', 'cursor-pointer');
            } else {
                nextBtn0.disabled = true;
                nextBtn0.classList.add('bg-gray-200', 'text-gray-400', 'cursor-not-allowed', 'shadow-none', 'transform-none');
                nextBtn0.classList.remove('bg-[var(--sage-green)]', 'text-white', 'shadow-lg', 'hover:shadow-xl', 'hover:-translate-y-0.5', 'cursor-pointer', 'opacity-50');
            }
        };

        // 3. Price Helper
        this.updatePrice = (price, description = '') => {
            window.bookingData.price = price;
            this.dispatchEvent(new CustomEvent('price-update', {
                detail: { price, description },
                bubbles: true
            }));
        };

        // 4. Feedback Helper
        this.showFeedback = (msg, type) => {
            feedbackDiv.innerHTML = '';
            // Reset base classes with rounded-lg (8px) and p-4 (1rem)
            // ALIGNMENT FIX: Changed items-start to items-center
            feedbackDiv.className = "mt-4 p-4 rounded-lg flex items-center gap-3 text-sm font-medium fade-in border transition-all duration-300 shadow-sm";

            // Clear inline styles
            feedbackDiv.style = '';

            let iconHtml = '';
            // ALIGNMENT FIX: Removed mt-0.5 from all icons
            if (type === 'success') {
                // Zone 1: Sage Green
                feedbackDiv.classList.add('bg-[var(--sage-green-light)]', 'text-[var(--dark-heading)]', 'border-[var(--sage-green)]');
                iconHtml = `<div class="min-w-[20px] text-[var(--sage-green)]"><i class="fas fa-check-circle text-lg"></i></div>`;
            } else if (type === 'warning') {
                // Zone 2: Warm Beige / Muted Gold
                feedbackDiv.style.backgroundColor = '#FFFDF5';
                feedbackDiv.style.borderColor = '#E5E1D6';
                feedbackDiv.style.color = '#5C5446';
                iconHtml = `<div class="min-w-[20px] text-[#A69578]"><i class="fas fa-car text-lg"></i></div>`;
            } else if (type === 'denial') {
                // Zone 3: Soft Rose / Video Icon
                feedbackDiv.style.backgroundColor = '#FFF5F5';
                feedbackDiv.style.borderColor = '#FED7D7';
                feedbackDiv.style.color = '#9B2C2C'; // Dark red for readability
                iconHtml = `<div class="min-w-[20px] text-[#E53E3E]"><i class="fas fa-video text-lg"></i></div>`;
            } else if (type === 'info') {
                feedbackDiv.classList.add('bg-blue-50', 'text-blue-800', 'border-blue-200');
                iconHtml = `<div class="min-w-[20px] text-blue-500"><i class="fas fa-info-circle text-lg"></i></div>`;
            } else {
                feedbackDiv.classList.add('bg-red-50', 'text-red-800', 'border-red-100');
                iconHtml = `<div class="min-w-[20px] text-red-500"><i class="fas fa-exclamation-circle text-lg"></i></div>`;
            }
            feedbackDiv.innerHTML = iconHtml + `<div class="leading-relaxed">${msg}</div>`;
            feedbackDiv.classList.remove('hidden');

            // Attach pivot listener
            const link = feedbackDiv.querySelector('a');
            if (link && msg.includes('Switch to Virtual')) {
                link.onclick = (e) => { e.preventDefault(); radioVirtual.click(); };
            }
        };

        // 5. Google Maps Logic
        this.calculateDistance = (destination, isManhattan) => {
            if (!window.google) return;
            const service = new google.maps.DistanceMatrixService();
            this.showFeedback('Checking availability at this location...', 'info');
            this.validateStep0(false);

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
                        this.showFeedback("We couldn't find a route to this address. Is it typed correctly?", 'error');
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
                    this.showFeedback(`That address is outside our travel radius, but we can still support you! <a href="#" class="font-bold underline text-[#C53030] hover:text-[#9B2C2C] ml-1">Switch to Virtual Visit</a>`, 'denial');
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
                        this.showFeedback('Please select a valid address from the list.', 'error');
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
            document.addEventListener('google-maps-loaded', this.initMapLogic);
        }

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

        if (window.bookingData.serviceType === 'virtual') {
            radioVirtual.click();
        } else {
            radioInHome.click();
            if (window.bookingData.parentAddress) {
                addressInput.value = window.bookingData.parentAddress;
            }
        }
        updateServiceState();
    }
}
customElements.define('step-service', StepService);