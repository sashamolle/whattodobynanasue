export class StepService extends HTMLElement {
    connectedCallback() {
        this.render();
        this.setupLogic();
    }

    render() {
        this.innerHTML = `
        <div class="fade-in max-w-4xl mx-auto">
            <div class="text-center mb-10">
                <h2 class="text-3xl font-bold text-[var(--dark-heading)] mb-3">Select Your Service</h2>
                <p class="text-gray-500">Choose the type of support you need, then select how we meet.</p>
            </div>

            <form id="step0-form">
                
                <!-- STAGE 1: Service Category -->
                <div class="mb-10">
                    <label class="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">Step 1: Choose Service</label>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        <!-- Option A: Mobility -->
                        <div class="relative group">
                            <input type="radio" name="serviceCategory" id="cat-mobility" value="mobility" class="peer hidden" checked>
                            <label for="cat-mobility"
                                class="h-full flex flex-col cursor-pointer bg-white border border-gray-200 rounded-xl p-6 shadow-sm transition-all duration-300
                                hover:-translate-y-0.5 hover:shadow-md
                                peer-checked:border-[var(--sage-green)] peer-checked:ring-1 peer-checked:ring-[var(--sage-green)] peer-checked:bg-[var(--sage-green-light)]">
                                <div class="flex flex-col items-center text-center gap-4 mb-4">
                                    <div class="w-14 h-14 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm text-[var(--sage-green)] text-2xl flex-shrink-0">
                                        <i class="fas fa-child"></i>
                                    </div>
                                    <div>
                                        <h3 class="font-bold text-[var(--dark-heading)] text-lg">1:1 Mobility Class</h3>
                                        <p class="text-sm text-gray-500 mt-2 leading-relaxed">Personalized support to address your baby's unique movement patterns. We'll work together on tummy time, rolling and crawling, to build strength and coordination.</p>
                                    </div>
                                </div>
                                <div class="mt-auto pt-4 border-t border-gray-100/50 w-full flex items-center justify-between">
                                    <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">From</span>
                                    <span class="text-xl font-bold text-[var(--sage-green)]">$150.00</span>
                                </div>
                            </label>
                        </div>

                        <!-- Option B: Pediatric Chiropractic Visit (Coming Soon) -->
                        <div class="relative group">
                            <input type="radio" name="serviceCategory" id="cat-pt" value="pt" class="peer hidden" disabled>
                            <label for="cat-pt"
                                class="h-full flex flex-col cursor-not-allowed bg-white border border-gray-200 rounded-xl p-6 shadow-sm transition-all duration-300 opacity-60 grayscale relative">
                                <div class="flex flex-col items-center text-center gap-4 mb-4">
                                    <div class="w-14 h-14 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm text-[var(--sage-green)] text-2xl flex-shrink-0">
                                        <i class="fas fa-user-md"></i>
                                    </div>
                                    <div>
                                        <h3 class="font-bold text-[var(--dark-heading)] text-lg">Pediatric Chiropractic Visit</h3>
                                        <p class="text-sm text-gray-500 mt-2 leading-relaxed">Gentle, specialized hands-on care to release tension and improve nervous system function. Ideal for babies with physical discomfort or developmental restrictions.</p>
                                    </div>
                                </div>
                                <div class="mt-auto pt-4 border-t border-gray-100/50 w-full flex items-center justify-end">
                                    <span class="bg-gray-100 text-gray-500 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wide border border-gray-200">Coming Soon</span>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- STAGE 2: Location Type (Dynamic) -->
                <div id="location-section" class="mb-10 transition-all duration-500">
                    <label class="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">Step 2: Choose Location</label>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        
                        <!-- Virtual -->
                        <div class="relative group">
                            <input type="radio" name="serviceType" id="service-virtual" value="virtual" class="peer hidden">
                            <label for="service-virtual"
                                class="h-full flex flex-col items-center justify-center text-center cursor-pointer bg-white border border-gray-200 rounded-xl p-4 shadow-sm transition-all duration-300
                                hover:-translate-y-0.5 hover:border-[var(--sage-green)]
                                peer-checked:border-[var(--sage-green)] peer-checked:bg-[var(--sage-green-light)] peer-checked:text-[var(--dark-heading)]">
                                <i class="fas fa-video text-2xl mb-2 text-gray-400 peer-checked:text-[var(--sage-green)]"></i>
                                <span class="font-semibold text-sm">Virtual Visit</span>
                            </label>
                        </div>

                        <!-- In-Home -->
                        <div class="relative group">
                            <input type="radio" name="serviceType" id="service-in-home" value="in-home" class="peer hidden">
                            <label for="service-in-home"
                                class="h-full flex flex-col items-center justify-center text-center cursor-pointer bg-white border border-gray-200 rounded-xl p-4 shadow-sm transition-all duration-300
                                hover:-translate-y-0.5 hover:border-[var(--sage-green)]
                                peer-checked:border-[var(--sage-green)] peer-checked:bg-[var(--sage-green-light)] peer-checked:text-[var(--dark-heading)]">
                                <i class="fas fa-home text-2xl mb-2 text-gray-400 peer-checked:text-[var(--sage-green)]"></i>
                                <span class="font-semibold text-sm">In-Home</span>
                            </label>
                        </div>

                        <!-- In-Office (Coming Soon) -->
                        <div class="relative group">
                            <input type="radio" name="serviceType" id="service-office" value="office" class="peer hidden" disabled>
                            <label for="service-office"
                                class="h-full flex flex-col items-center justify-center text-center cursor-not-allowed bg-white border border-gray-200 rounded-xl p-4 shadow-sm transition-all duration-300 opacity-60 grayscale relative">
                                <span class="absolute top-2 right-2 bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Coming Soon</span>
                                <i class="fas fa-building text-2xl mb-2 text-gray-400"></i>
                                <span class="font-semibold text-sm">In-Office</span>
                            </label>
                        </div>

                    </div>
                </div>

                <!-- Address Input Container (Only for In-Home) -->
                <div id="location-gate-container" class="mt-8 transition-all duration-500 ease-in-out hidden opacity-0">
                     <label for="GateAddress" class="block text-lg font-medium text-[var(--dark-heading)] mb-3 text-center md:text-left">Enter your Home Address</label>
                     <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <i class="fas fa-map-marker-alt text-[var(--sage-green)] opacity-50"></i>
                        </div>
                        <input type="text" id="GateAddress" 
                            class="form-input pl-12 text-gray-700 font-medium placeholder-gray-400" 
                            placeholder="Street, City, Zip" autocomplete="off">
                    </div>
                    
                    <!-- Feedback container -->
                    <div id="feedback-div" class="hidden mt-4 p-4 rounded-lg flex items-center gap-3 text-sm font-medium fade-in border transition-all duration-300 shadow-sm"></div>
                </div>

                <div class="mt-10 flex justify-end">
                    <button type="submit" id="btn-step-0-next" 
                        class="w-full md:w-auto bg-[var(--dark-heading)] text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2" disabled>
                        Next: Details <i class="fas fa-arrow-right text-sm"></i>
                    </button>
                </div>
            </form>
        </div>
        `;
    }

    setupLogic() {
        const catRadios = this.querySelectorAll('input[name="serviceCategory"]');
        const locRadios = this.querySelectorAll('input[name="serviceType"]');

        const radioVirtual = this.querySelector('#service-virtual');
        const radioInHome = this.querySelector('#service-in-home');
        const radioOffice = this.querySelector('#service-office');

        const locationContainer = this.querySelector('#location-gate-container');
        const addressInput = this.querySelector('#GateAddress');
        const nextBtn0 = this.querySelector('#btn-step-0-next');
        const feedbackDiv = this.querySelector('#feedback-div');

        const CHELSEA_ORIGIN = "10011, USA";

        // Define Pricing/Availability Matrix
        const SERVICES = {
            'mobility': {
                'virtual': 150,
                'in-home': 150,
                'office': null // Disabled
            },
            'pt': {
                'virtual': null, // Disabled
                'in-home': null, // Disabled
                'office': null // Disabled
            }
        };

        let selectedCategory = 'mobility';
        let selectedLocation = null;
        let step0Valid = false;

        window.bookingData = window.bookingData || {};

        // 1. Handle Category Change
        const updateCategory = () => {
            selectedCategory = this.querySelector('input[name="serviceCategory"]:checked').value;

            // Update Prices in UI
            const prices = SERVICES[selectedCategory];

            // Virtual
            radioVirtual.disabled = !prices['virtual'];
            if (!prices['virtual']) radioVirtual.parentElement.classList.add('opacity-50', 'grayscale');
            else radioVirtual.parentElement.classList.remove('opacity-50', 'grayscale');

            // In-Home
            radioInHome.disabled = !prices['in-home'];

            // Office (Always Disabled/Coming Soon via HTML, but logic ensures safety)
            // Force disabled state logic regardless of price being set or null
            // We keep the "Coming Soon" visual badge which is in HTML.
            radioOffice.disabled = true;
            radioOffice.parentElement.classList.add('opacity-60', 'grayscale', 'cursor-not-allowed');
            if (selectedLocation === 'office') {
                radioOffice.checked = false;
                selectedLocation = null;
                this.validateStep0(false);
            }

            // If current selection is valid, update price in global
            if (selectedLocation && prices[selectedLocation]) {
                this.updatePrice(prices[selectedLocation], `${selectedCategory.toUpperCase()} - ${selectedLocation.toUpperCase()}`);
            }
        };

        // 2. Handle Location Change
        const updateLocation = () => {
            const checked = this.querySelector('input[name="serviceType"]:checked');
            if (!checked) return;
            selectedLocation = checked.value;

            // Visibility of Address
            if (selectedLocation === 'in-home') {
                locationContainer.classList.remove('hidden', 'opacity-0');
                // Re-validate address
                if (addressInput.dataset.valid === 'true') {
                    if (addressInput.value) this.calculateDistance(addressInput.value, false);
                } else {
                    this.validateStep0(false);
                }
            } else {
                locationContainer.classList.add('hidden', 'opacity-0');
                feedbackDiv.classList.add('hidden');

                // Set Price
                const price = SERVICES[selectedCategory][selectedLocation];
                this.updatePrice(price, `${selectedCategory} - ${selectedLocation}`);

                // [FIX] Explicitly save Service Type/Category/Zone to Global State for Virtual
                window.bookingData.serviceCategory = selectedCategory;
                window.bookingData.serviceType = selectedLocation;
                window.bookingData.travelZone = 'zone1';

                this.validateStep0(true);
            }
        };

        catRadios.forEach(r => r.addEventListener('change', updateCategory));
        locRadios.forEach(r => r.addEventListener('change', updateLocation));

        // 2. Validation Helper
        this.validateStep0 = (isValid) => {
            step0Valid = isValid;
            if (isValid) {
                nextBtn0.classList.remove('opacity-50', 'cursor-not-allowed');
                nextBtn0.disabled = false;
                nextBtn0.classList.add('bg-[var(--sage-green)]');
                nextBtn0.classList.remove('bg-[var(--dark-heading)]');
            } else {
                nextBtn0.classList.add('opacity-50', 'cursor-not-allowed');
                nextBtn0.disabled = true;
                nextBtn0.classList.remove('bg-[var(--sage-green)]');
                nextBtn0.classList.add('bg-[var(--dark-heading)]');
            }
        };

        // 3. Price Helper
        this.updatePrice = (price, description = '') => {
            window.bookingData.price = price;
            window.bookingData.serviceCategory = selectedCategory;
            window.bookingData.serviceType = selectedLocation;

            // Reset Discount State if price changes (prevents stale originalPrice)
            if (window.bookingData.promoCode) {
                delete window.bookingData.promoCode;
                delete window.bookingData.originalPrice;
                delete window.bookingData.discountAmount;
                // Also verify we aren't carrying over weird states.
                console.log("[StepService] Price changed. Cleared discount state.");
            }

            this.dispatchEvent(new CustomEvent('price-update', {
                detail: { price, description },
                bubbles: true
            }));
        };

        // 4. Feedback Helper
        this.showFeedback = (msg, type) => {
            feedbackDiv.innerHTML = '';
            // Reset base classes with rounded-lg (8px) and p-4 (1rem)
            feedbackDiv.className = "mt-4 p-4 rounded-lg flex items-center gap-3 text-sm font-medium fade-in border transition-all duration-300 shadow-sm";
            feedbackDiv.style = '';

            let iconHtml = '';
            if (type === 'success') {
                feedbackDiv.classList.add('bg-[var(--sage-green-light)]', 'text-[var(--dark-heading)]', 'border-[var(--sage-green)]');
                iconHtml = `<div class="min-w-[20px] text-[var(--sage-green)]"><i class="fas fa-check-circle text-lg"></i></div>`;
            } else if (type === 'warning') {
                feedbackDiv.style.backgroundColor = '#FFFDF5';
                feedbackDiv.style.borderColor = '#E5E1D6';
                feedbackDiv.style.color = '#5C5446';
                iconHtml = `<div class="min-w-[20px] text-[#A69578]"><i class="fas fa-car text-lg"></i></div>`;
            } else if (type === 'denial') {
                feedbackDiv.style.backgroundColor = '#FFF5F5';
                feedbackDiv.style.borderColor = '#FED7D7';
                feedbackDiv.style.color = '#9B2C2C';
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
                // Price Base depends on Category
                const basePrice = SERVICES[selectedCategory]['in-home'];

                if (minutes <= 30) {
                    // Zone 1
                    this.updatePrice(basePrice, 'In-Home Visit');
                    this.showFeedback('Great news! You are in our primary service area.', 'success');
                    addressInput.dataset.valid = 'true';
                    window.bookingData.parentAddress = destination;
                    window.bookingData.travelZone = 'zone1';
                    this.validateStep0(true);
                } else if (isManhattan) {
                    // Zone 2
                    this.updatePrice(basePrice + 30, 'In-Home (Travel Fee Included)');
                    this.showFeedback('We can visit you! Just a heads up, a travel fee ($30) will be added for this location.', 'warning');
                    addressInput.dataset.valid = 'true';
                    window.bookingData.parentAddress = destination;
                    window.bookingData.travelZone = 'zone2';
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

        // Initialize Defaults
        updateCategory();
    }
}
customElements.define('step-service', StepService);