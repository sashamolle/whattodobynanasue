import { calculateBookingPrice } from '../utils/booking-format.js';

export class StepPayment extends HTMLElement {
  connectedCallback() {
    this.stripe = null;
    this.elements = null;

    console.log('[StepPayment] === INITIALIZATION START ===');
    console.log('[StepPayment] bookingData:', window.bookingData);

    // Fix: Use bookingData.originalPrice if it exists (from previous discount application)
    // Otherwise, calculate the original price from service type and zone
    if (window.bookingData && window.bookingData.originalPrice) {
      this.originalPrice = window.bookingData.originalPrice;
      console.log('[StepPayment] Using stored originalPrice:', this.originalPrice);
    } else if (window.bookingData && window.bookingData.serviceType && window.bookingData.travelZone) {
      // Calculate original price based on service type and zone
      const pricing = calculateBookingPrice(window.bookingData.serviceType, window.bookingData.travelZone);
      this.originalPrice = pricing.total;
      console.log('[StepPayment] Calculated originalPrice from service/zone:', {
        serviceType: window.bookingData.serviceType,
        travelZone: window.bookingData.travelZone,
        pricing,
        originalPrice: this.originalPrice
      });
    } else if (window.bookingData && window.bookingData.price) {
      // Fallback: Use current price if service/zone not available
      this.originalPrice = window.bookingData.price;
      console.log('[StepPayment] Using bookingData.price as originalPrice:', this.originalPrice);
    } else {
      this.originalPrice = 150; // Final fallback
      console.log('[StepPayment] Using fallback originalPrice: 150');
    }

    console.log('[StepPayment] Final originalPrice:', this.originalPrice);
    console.log('[StepPayment] Current bookingData.price:', window.bookingData?.price);
    console.log('[StepPayment] === INITIALIZATION END ===');

    this.render();
    this.setupListeners();
    this.setupDiscountLogic();
    this.updateDisplay();

    // Auto-Populate Promo State if returning
    if (window.bookingData && window.bookingData.promoCode) {
      this.restorePromoState(window.bookingData.promoCode);
    }

    // Initialize Stripe Logic
    this.initStripe();

    // Listen for Price Updates from StepService
    // This fixes the bug where originalPrice was stale (e.g. 150) if StepPayment loaded before Price Update.
    window.addEventListener('price-update', (e) => {
      console.log("[StepPayment] Received price update:", e.detail.price);
      this.originalPrice = e.detail.price;

      // If Discount was cleared by StepService, reflect that in UI
      if (!window.bookingData.promoCode) {
        this.resetPromoUI();
        this.updateDisplay(); // Shows new standard price
        // Re-init Stripe to update amount
        if (this.stripe) this.initStripe();
      }
    });
  }

  // Called by booking manager when this step becomes visible
  onShow() {
    console.log('[StepPayment] === onShow CALLED ===');
    console.log('[StepPayment] Current bookingData:', {
      serviceType: window.bookingData.serviceType,
      travelZone: window.bookingData.travelZone,
      price: window.bookingData.price,
      originalPrice: window.bookingData.originalPrice,
      promoCode: window.bookingData.promoCode
    });

    // Calculate what the price SHOULD be based on current service/zone
    if (window.bookingData.serviceType && window.bookingData.travelZone !== undefined) {
      const pricing = calculateBookingPrice(window.bookingData.serviceType, window.bookingData.travelZone);
      const expectedPrice = pricing.total;

      console.log('[StepPayment] Expected price from service/zone:', expectedPrice);

      // Check if service/zone changed (price doesn't match expected)
      // If so, clear discount and reset to new price
      if (window.bookingData.originalPrice && window.bookingData.originalPrice !== expectedPrice) {
        console.log('[StepPayment] ⚠️ SERVICE/ZONE CHANGED! Clearing discount and resetting price');
        console.log('[StepPayment] Old originalPrice:', window.bookingData.originalPrice, 'New expected:', expectedPrice);

        // Clear discount
        delete window.bookingData.originalPrice;
        delete window.bookingData.promoCode;
        delete window.bookingData.discountAmount;
        window.bookingData.price = expectedPrice;

        // Reset promo UI
        this.resetPromoUI();

        console.log('[StepPayment] ✅ Discount cleared!');
      }

      // Set originalPrice to current expected price
      this.originalPrice = expectedPrice;

      // If no discount applied, make sure price matches expected
      if (!window.bookingData.promoCode) {
        window.bookingData.price = expectedPrice;
      }

      console.log('[StepPayment] Set originalPrice to:', this.originalPrice);
    } else if (window.bookingData.price) {
      // Fallback: use current price
      this.originalPrice = window.bookingData.price;
      console.log('[StepPayment] Using bookingData.price as originalPrice:', this.originalPrice);
    }

    // Update display with current state
    this.updateDisplay();

    // Re-initialize Stripe with current price
    if (this.stripe) {
      this.initStripe();
    }

    // Update mobile summary
    this.updateMobileSummary();

    console.log('[StepPayment] === onShow COMPLETE ===');
  }

  updateMobileSummary() {
    // Update mobile footer with appointment details
    const mobileDate = this.querySelector('#mobile-date');
    const mobileTotal = this.querySelector('#mobile-total');
    const mobileTravelFeeNote = this.querySelector('#mobile-travel-fee-note');
    const mobilePriceBreakdown = this.querySelector('#mobile-price-breakdown');

    if (mobileDate && window.bookingData.appointmentDate && window.bookingData.appointmentTime) {
      // Format date
      const dateObj = new Date(window.bookingData.appointmentDate + 'T00:00:00');
      const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      mobileDate.textContent = `${dateStr} at ${window.bookingData.appointmentTime} (45m)`;
    }

    if (mobileTotal && window.bookingData.price) {
      mobileTotal.textContent = `$${window.bookingData.price}`;
    }

    // Build price breakdown
    if (mobilePriceBreakdown) {
      const breakdown = [];
      const isInHome = window.bookingData.serviceType === 'in-home';
      const basePrice = isInHome ? 225 : 150;
      const isZone2 = window.bookingData.travelZone === 'zone2';
      const travelFee = (isInHome && isZone2) ? 30 : 0;

      // Session fee
      breakdown.push(`$${basePrice} session`);

      // Travel fee
      if (travelFee > 0) {
        breakdown.push(`$${travelFee} travel`);
      }

      // Join the base parts with +
      let breakdownText = breakdown.join(' + ');

      // Add discount separately (with space, not +)
      if (window.bookingData.promoCode && window.bookingData.discountAmount) {
        breakdownText += ` -$${window.bookingData.discountAmount} ${window.bookingData.promoCode}`;
      }

      mobilePriceBreakdown.textContent = breakdownText;
    }

    // Show/hide travel fee note
    if (mobileTravelFeeNote) {
      const isZone2 = window.bookingData.travelZone === 'zone2';
      if (isZone2) {
        mobileTravelFeeNote.classList.remove('hidden');
      } else {
        mobileTravelFeeNote.classList.add('hidden');
      }
    }
  }

  resetPromoUI() {
    console.log('[StepPayment] resetPromoUI called');

    const input = this.querySelector('#promo-input');
    const container = this.querySelector('#promo-container');
    const toggleBtn = this.querySelector('#toggle-promo');
    const applyBtn = this.querySelector('#apply-promo-btn');
    const messageEl = this.querySelector('#promo-message');

    if (!input || !container || !toggleBtn || !applyBtn || !messageEl) {
      console.warn('[StepPayment] resetPromoUI: Some elements not found');
      return;
    }

    // Reset Input
    input.value = '';
    input.disabled = false;
    input.classList.remove('bg-gray-50', 'text-gray-500');

    // Hide Container
    container.classList.add('hidden');

    // Show Toggle Button
    toggleBtn.classList.remove('hidden');

    // Reset Apply Button
    applyBtn.textContent = 'Apply';
    applyBtn.classList.remove('bg-[var(--sage-green)]', 'pointer-events-none');
    applyBtn.classList.add('bg-gray-800');

    // Hide Message
    messageEl.classList.add('hidden');
    messageEl.textContent = '';

    console.log('[StepPayment] resetPromoUI complete - calling updateDisplay');
    this.updateDisplay();
  }

  restorePromoState(code) {
    const input = this.querySelector('#promo-input');
    const container = this.querySelector('#promo-container');
    const toggleBtn = this.querySelector('#toggle-promo');
    const applyBtn = this.querySelector('#apply-promo-btn');
    const messageEl = this.querySelector('#promo-message');

    // Expand Container
    container.classList.remove('hidden');
    toggleBtn.classList.add('hidden');

    // Fill Input
    input.value = code;
    input.disabled = true;
    input.classList.add('bg-gray-50', 'text-gray-500');

    // Update Button
    applyBtn.textContent = 'Applied';
    applyBtn.classList.add('bg-[var(--sage-green)]', 'pointer-events-none');
    applyBtn.classList.remove('bg-gray-800');

    // Show Message
    messageEl.textContent = "Code applied successfully!";
    messageEl.classList.add('text-[var(--sage-green)]');
    messageEl.classList.remove('text-red-500', 'hidden');
  }

  updateDisplay() {
    console.log('[StepPayment] updateDisplay called');
    console.log('[StepPayment] updateDisplay state:', {
      price: window.bookingData?.price,
      originalPrice: this.originalPrice,
      promoCode: window.bookingData?.promoCode,
      discountAmount: window.bookingData?.discountAmount
    });

    // IMPORTANT: Recalculate originalPrice when this step becomes visible
    // because connectedCallback fires before user selects service/zone
    if (!window.bookingData.originalPrice && window.bookingData.serviceType && window.bookingData.travelZone) {
      const pricing = calculateBookingPrice(window.bookingData.serviceType, window.bookingData.travelZone);
      this.originalPrice = pricing.total;
      console.log('[StepPayment] RECALCULATED originalPrice on display:', {
        serviceType: window.bookingData.serviceType,
        travelZone: window.bookingData.travelZone,
        pricing,
        originalPrice: this.originalPrice
      });
    } else if (!window.bookingData.originalPrice && window.bookingData.price) {
      this.originalPrice = window.bookingData.price;
      console.log('[StepPayment] Set originalPrice from bookingData.price:', this.originalPrice);
    }

    const priceDisplay = this.querySelector('#payment-display-price');
    const originalPriceDisplay = this.querySelector('#original-price-display');
    const discountBadge = this.querySelector('#discount-badge');

    if (window.bookingData && window.bookingData.price) {
      // Check if discount is actually applied (has promo code AND price is less than original)
      const hasDiscount = window.bookingData.promoCode && window.bookingData.price < this.originalPrice;

      console.log('[StepPayment] === DISCOUNT CHECK ===');
      console.log('[StepPayment] hasPromoCode:', !!window.bookingData.promoCode, 'value:', window.bookingData.promoCode);
      console.log('[StepPayment] price < originalPrice:', window.bookingData.price < this.originalPrice, `(${window.bookingData.price} < ${this.originalPrice})`);
      console.log('[StepPayment] hasDiscount:', hasDiscount);

      if (hasDiscount) {
        // Show discount view
        console.log('[StepPayment] SHOWING DISCOUNT VIEW');
        priceDisplay.textContent = `$${window.bookingData.price.toFixed(2)}`;
        priceDisplay.classList.add('text-[var(--sage-green)]');

        originalPriceDisplay.textContent = `$${this.originalPrice.toFixed(2)}`;
        originalPriceDisplay.classList.remove('hidden');

        discountBadge.classList.remove('hidden');
      } else {
        // Standard view - no discount
        console.log('[StepPayment] SHOWING STANDARD VIEW - HIDING DISCOUNT BADGE');
        priceDisplay.textContent = `$${window.bookingData.price.toFixed(2)}`;
        priceDisplay.classList.remove('text-[var(--sage-green)]');
        originalPriceDisplay.classList.add('hidden');
        discountBadge.classList.add('hidden');
        console.log('[StepPayment] discountBadge.className after hiding:', discountBadge?.className);
      }
    }
  }

  render() {
    this.innerHTML = `
        <div class="fade-in max-w-3xl mx-auto">
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div class="mb-8 text-center">
                    <h2 class="text-3xl font-bold text-gray-800 mb-3">Payment Details</h2>
                    <p class="text-base text-gray-500">Secure your session to complete booking.</p>
                </div>

                <div class="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                    <!-- Decorative background element -->
                    <div class="absolute top-0 right-0 w-32 h-32 bg-[var(--sage-green-light)] rounded-bl-full opacity-50 -mr-10 -mt-10 pointer-events-none"></div>

                    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-8 border-b border-gray-100 relative z-10 gap-6">
                        <div class="text-left">
                            <span class="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total Due</span>
                            <div class="flex items-baseline gap-3">
                            <span id="original-price-display" class="hidden text-xl text-gray-400 line-through decoration-gray-400">$150.00</span>
                            <span id="payment-display-price" class="text-4xl font-bold text-[var(--dark-heading)] transition-colors duration-300">$150.00</span>
                            <span class="text-gray-400 text-sm">USD</span>
                        </div>
                        
                        <!-- Discount Badge -->
                        <div id="discount-badge" class="hidden mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--sage-green-light)] text-[var(--sage-green)] text-xs font-bold uppercase tracking-wide">
                           <i class="fas fa-check-circle"></i> Code Applied
                        </div>

                        <!-- Promo Code Toggle Section -->
                        <div class="mt-3">
                            <button id="toggle-promo" class="text-sm text-[var(--sage-green)] font-medium hover:text-[var(--sage-green-dark)] hover:underline flex items-center gap-2 transition-all group">
                                <i class="fas fa-tag text-xs group-hover:rotate-12 transition-transform"></i> Have a referral code?
                            </button>
                            
                            <!-- Hidden Input Container -->
                            <div id="promo-container" class="hidden mt-3 max-w-[280px]">
                                <div class="flex gap-2">
                                    <input type="text" id="promo-input" 
                                        class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-[var(--sage-green)] focus:ring-1 focus:ring-[var(--sage-green)] outline-none uppercase placeholder-gray-400" 
                                        placeholder="Enter code">
                                    <button id="apply-promo-btn" 
                                        class="px-4 py-2 bg-gray-800 text-white text-xs font-bold rounded-lg hover:bg-gray-700 transition-colors shadow-sm whitespace-nowrap">
                                        Apply
                                    </button>
                                </div>
                                <p id="promo-message" class="hidden text-xs mt-2 font-medium ml-1"></p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Dynamic Container: Will hold either Stripe Element OR Manual Fallback -->
                <div id="stripe-integration-root" class="relative z-10">
                    
                    <!-- Express Checkout Container -->
                    <div id="express-checkout-container" class="mb-2"></div>
                    
                    <!-- Divider (Hidden by default, shown if Express Checkout loads) -->
                    <div id="payment-divider" class="hidden flex items-center justify-between mb-6 mt-4">
                        <span class="h-px w-full bg-gray-200"></span>
                        <span class="h-px w-full bg-gray-200"></span>
                    </div>

                    <form id="payment-form" class="min-h-[250px]">
                        
                        <div id="payment-container" class="min-h-[200px]">
                            <!-- Loading State -->
                            <div class="flex flex-col items-center justify-center h-40 text-gray-400">
                                <i class="fas fa-circle-notch fa-spin text-2xl mb-2 text-[var(--sage-green)]"></i>
                                <span class="text-sm font-medium">Initializing Secure Payment...</span>
                            </div>
                        </div>

                        <!-- Error Message Area -->
                        <div id="payment-message" class="hidden mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center border border-red-100"></div>

                        <!-- Waiver Acceptance Checkbox -->
                        <div class="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <label class="flex items-start gap-3 cursor-pointer group">
                                <input type="checkbox" id="waiver-checkbox" 
                                    class="mt-1 w-5 h-5 rounded border-gray-300 text-[var(--sage-green)] focus:ring-[var(--sage-green)] focus:ring-offset-0 cursor-pointer">
                                <span class="text-sm text-gray-700 leading-relaxed">
                                    I have read and agree to the 
                                    <a href="terms.html" target="_blank" rel="noopener noreferrer" class="text-[var(--sage-green)] font-medium hover:underline">Terms & Conditions</a> and 
                                    <a href="privacy.html" target="_blank" rel="noopener noreferrer" class="text-[var(--sage-green)] font-medium hover:underline">Privacy Policy</a>.
                                </span>
                            </label>
                            
                            <!-- Rescheduling Policy Link -->
                            <div class="mt-3 text-center">
                                <button type="button" class="policy-link text-sm text-[var(--sage-green)] font-medium hover:underline inline-flex items-center gap-1" data-doc="reschedule">
                                    <i class="fas fa-info-circle text-xs"></i>
                                    View Our Rescheduling Policy
                                </button>
                            </div>
                        </div>

                        <!-- Button Row (Desktop Only) -->
                        <div class="hidden md:flex mt-8 flex-col-reverse md:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-100">
                            <button type="button" id="btn-step-4-back" 
                                class="w-full md:w-auto text-gray-500 font-medium hover:text-[var(--dark-heading)] px-4 py-3 md:py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                                <i class="fas fa-arrow-left text-sm"></i> Back
                            </button>

                            <button type="submit" id="btn-pay-now" 
                                class="w-full md:w-auto bg-[var(--sage-green)] text-white px-10 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 min-w-[200px] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none">
                            <span>Pay Now</span> <i class="fas fa-lock text-sm opacity-80"></i>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div class="mt-8 text-center">
                <p class="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-2">Powered by Stripe</p>
                <div class="flex justify-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all duration-300">
                    <i class="fab fa-cc-visa text-2xl text-blue-800"></i>
                    <i class="fab fa-cc-mastercard text-2xl text-red-600"></i>
                    <i class="fab fa-cc-amex text-2xl text-blue-500"></i>
                </div>
            </div>
        </div>

        <!-- Sticky Mobile Footer -->
            <div class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
                <div class="px-4 py-4 pb-safe">
                    <!-- Appointment Summary -->
                    <div class="mb-4 text-xs">
                        <div class="flex items-center justify-between text-gray-800 font-bold">
                            <div class="flex items-center gap-2">
                                <i class="fas fa-calendar-alt text-[var(--sage-green)]"></i>
                                <span id="mobile-date">Select date & time</span>
                            </div>
                            <div class="text-right">
                                <div id="mobile-total" class="text-[var(--sage-green)] text-lg">$150</div>
                                <div id="mobile-price-breakdown" class="text-[9px] text-gray-500 font-normal mt-1 text-right"></div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Buttons -->
                    <div class="flex gap-3">
                        <button type="button" id="btn-step-4-back-mobile"
                            class="flex-shrink-0 text-gray-500 font-medium hover:text-gray-800 px-4 py-3 rounded-full transition-colors flex items-center justify-center gap-2 border border-gray-200">
                            <i class="fas fa-arrow-left text-sm"></i>
                        </button>
                        <button type="submit" form="payment-form" id="btn-pay-now-mobile"
                            class="flex-1 bg-[var(--sage-green)] text-white px-6 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none">
                            Pay Now <i class="fas fa-lock text-sm opacity-80"></i>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Modal for Terms/Privacy/Waiver -->
            <div id="waiver-modal" class="hidden fixed inset-0 z-50 overflow-y-auto">
                <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                    <!-- Background overlay -->
                    <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" id="modal-overlay"></div>
                    
                    <!-- Modal panel -->
                    <div class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
                        <div class="bg-white px-6 pt-6 pb-4">
                            <div class="flex items-start justify-between mb-4">
                                <h3 id="modal-title" class="text-2xl font-bold text-[var(--dark-heading)]"></h3>
                                <button type="button" id="modal-close" class="text-gray-400 hover:text-gray-600 transition-colors">
                                    <i class="fas fa-times text-xl"></i>
                                </button>
                            </div>
                            <div id="modal-content" class="mt-4 max-h-[60vh] overflow-y-auto prose prose-sm max-w-none">
                                <div class="flex items-center justify-center h-40">
                                    <i class="fas fa-circle-notch fa-spin text-2xl text-[var(--sage-green)]"></i>
                                </div>
                            </div>
                        </div>
                        <div class="bg-gray-50 px-6 py-4">
                            <button type="button" id="modal-accept" class="w-full bg-[var(--sage-green)] text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all">
                                I Understand
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      `;
  }

  // --- DISCOUNT LOGIC ---
  setupDiscountLogic() {
    const toggleBtn = this.querySelector('#toggle-promo');
    const container = this.querySelector('#promo-container');
    const input = this.querySelector('#promo-input');
    const applyBtn = this.querySelector('#apply-promo-btn');
    const messageEl = this.querySelector('#promo-message');

    // Toggle Visibility
    toggleBtn.onclick = (e) => {
      e.preventDefault();
      container.classList.toggle('hidden');
      if (!container.classList.contains('hidden')) {
        input.focus();
      }
    };

    // Apply Code
    const handleApply = async () => {
      const code = input.value.trim().toUpperCase();
      messageEl.className = "text-xs mt-2 font-medium ml-1 block"; // Reset classes
      messageEl.textContent = "Verifying...";
      messageEl.classList.remove('text-red-500', 'text-[var(--sage-green)]');
      messageEl.classList.add('text-gray-500');

      try {
        const API_BASE = window.ENV.API_BASE;
        const res = await fetch(`${API_BASE}/api/verify-promo`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        });

        const data = await res.json();

        if (data.valid) {
          console.log('[Promo] === DISCOUNT CALCULATION START ===');
          console.log('[Promo] Discount data:', data);
          console.log('[Promo] this.originalPrice BEFORE calculation:', this.originalPrice);
          console.log('[Promo] window.bookingData.originalPrice BEFORE:', window.bookingData.originalPrice);

          // Calculate new price based on discount
          let newPrice = this.originalPrice;
          if (data.type === 'percentage') {
            newPrice = this.originalPrice * (1 - (data.value / 100)); // Backend returns value as number (e.g. 20 for 20%)
            console.log('[Promo] Type: percentage, value:', data.value, 'newPrice:', newPrice);
          } else if (data.type === 'percent') {
            // Flexible handling: If value is 0.2 (20%), or 20 (20%)
            // Assume if value <= 1, it's a decimal (0.2), else it's a percentage (20)
            if (data.value <= 1) {
              newPrice = this.originalPrice * (1 - data.value); // Handle 0.20
              console.log('[Promo] Type: percent (decimal), value:', data.value, 'newPrice:', newPrice);
            } else {
              newPrice = this.originalPrice * (1 - (data.value / 100)); // Handle 20
              console.log('[Promo] Type: percent (whole), value:', data.value, 'newPrice:', newPrice);
            }
          } else if (data.type === 'fixed') {
            // Fixed discount: Subtract value from original price
            newPrice = Math.max(0, this.originalPrice - data.value);
            console.log('[Promo] Type: fixed, value:', data.value, 'newPrice:', newPrice);
          } else if (data.type === 'override') {
            newPrice = data.value;
            console.log('[Promo] Type: override, value:', data.value, 'newPrice:', newPrice);
          }

          // Store discount info in bookingData
          window.bookingData.promoCode = code;
          // IMPORTANT: Don't overwrite originalPrice - it should stay as the pre-discount price
          if (!window.bookingData.originalPrice) {
            window.bookingData.originalPrice = this.originalPrice;
            console.log('[Promo] SET window.bookingData.originalPrice to:', this.originalPrice);
          } else {
            console.log('[Promo] KEPT existing window.bookingData.originalPrice:', window.bookingData.originalPrice);
          }

          const discountAmount = (this.originalPrice - newPrice).toFixed(2);
          window.bookingData.discountAmount = discountAmount;
          window.bookingData.price = parseFloat(newPrice.toFixed(2));

          console.log('[Promo] Final values:', {
            code,
            type: data.type,
            value: data.value,
            'this.originalPrice': this.originalPrice,
            'window.bookingData.originalPrice': window.bookingData.originalPrice,
            newPrice,
            discountAmount,
            'window.bookingData.price': window.bookingData.price
          });
          console.log('[Promo] === DISCOUNT CALCULATION END ===');
          // UI Feedback
          messageEl.textContent = "Code applied successfully!";
          messageEl.classList.add('text-[var(--sage-green)]');
          messageEl.classList.remove('text-gray-500');

          input.disabled = true;
          input.classList.add('bg-gray-50', 'text-gray-500');
          applyBtn.textContent = 'Applied';
          applyBtn.classList.add('bg-[var(--sage-green)]', 'pointer-events-none');
          applyBtn.classList.remove('bg-gray-800');

          toggleBtn.classList.add('hidden');

          // Refresh Displays
          this.updateDisplay();
          this.updateMobileSummary();

          // Update Payment Intent amount without re-mounting (preserves card details)
          if (this.clientSecret) {
            try {
              const API_BASE = window.ENV.API_BASE;
              const response = await fetch(`${API_BASE}/api/update-payment-intent`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  clientSecret: this.clientSecret,
                  amount: Math.round(newPrice * 100) // Convert to cents
                })
              });

              if (response.ok) {
                const data = await response.json();
                this.clientSecret = data.clientSecret;
                console.log('[StepPayment] Payment Intent amount updated successfully');
              } else {
                console.error('[StepPayment] Failed to update Payment Intent amount');
              }
            } catch (error) {
              console.error('[StepPayment] Error updating Payment Intent:', error);
            }
          }

        } else {
          // Invalid Code
          throw new Error(data.error || "Invalid Code");
        }
      } catch (err) {
        // Error Handling
        messageEl.textContent = err.message || "Invalid code. Please try again.";
        messageEl.classList.add('text-red-500');
        messageEl.classList.remove('text-gray-500', 'text-[var(--sage-green)]');

        // Shake animation
        input.classList.add('ring-2', 'ring-red-200', 'border-red-300');
        setTimeout(() => {
          input.classList.remove('ring-2', 'ring-red-200', 'border-red-300');
        }, 500);
      }
    };

    applyBtn.onclick = (e) => { e.preventDefault(); handleApply(); };
    input.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); handleApply(); } };
  }

  // --- STRIPE LOGIC ---

  async initStripe() {
    // 1. Load Stripe.js dynamically if not present
    if (!window.Stripe) {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.onload = () => this.initializePaymentIntent();
      script.onerror = () => {
        console.warn("Stripe.js failed to load. Using fallback.");
        this.renderManualFallback();
      };
      document.head.appendChild(script);
    } else {
      this.initializePaymentIntent();
    }
  }

  async initializePaymentIntent() {

    const API_BASE = window.ENV.API_BASE;
    const STRIPE_PK = window.ENV.STRIPE_PK;

    try {
      // 2. Fetch Client Secret from Backend
      // We send the CURRENT price (which might be discounted)
      const payload = {
        items: [{ id: "session-fee", amount: window.bookingData.price }],
        promoCode: window.bookingData.promoCode,
        serviceCategory: window.bookingData.serviceCategory,
        serviceType: window.bookingData.serviceType,
        travelZone: window.bookingData.travelZone
      };

      console.log('[StepPayment] === CREATING PAYMENT INTENT ===');
      console.log('[StepPayment] Payload:', payload);
      console.log('[StepPayment] Full bookingData:', window.bookingData);

      const response = await fetch(`${API_BASE}/api/create-payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log('[StepPayment] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[StepPayment] Payment intent error:', errorData);
        throw new Error(`Backend Error: ${response.status} - ${errorData.error || 'Unknown'}`);
      }

      const { clientSecret } = await response.json();

      // 3. Initialize Elements
      // Note: We create a NEW Stripe instance or element group for the new secret
      this.stripe = Stripe(STRIPE_PK);
      const appearance = {
        theme: 'stripe',
        variables: {
          colorPrimary: '#568064',
          colorBackground: '#ffffff',
          colorText: '#1f2937',
          borderRadius: '12px',
          fontFamily: '"Poppins", sans-serif',
          spacingUnit: '5px',
        },
      };
      this.elements = this.stripe.elements({ appearance, clientSecret });

      // A. Create Express Checkout Element (Apple Pay)
      // Check if container exists (it might be re-rendering)
      const expressContainer = this.querySelector('#express-checkout-container');
      if (expressContainer) {
        expressContainer.innerHTML = ''; // Clear previous if any
        const expressCheckout = this.elements.create('expressCheckout', {
          wallets: { applePay: 'always', googlePay: 'never' }
        });
        expressCheckout.mount('#express-checkout-container');

        expressCheckout.on('ready', ({ availablePaymentMethods }) => {
          if (availablePaymentMethods) {
            this.querySelector('#payment-divider')?.classList.remove('hidden');
          }
        });

        expressCheckout.on('confirm', async (event) => {
          const { error, paymentIntent } = await this.stripe.confirmPayment({
            elements: this.elements,
            clientSecret,
            confirmParams: { return_url: window.location.href },
            redirect: "if_required",
          });
          if (error) {
            const msgEl = this.querySelector('#payment-message');
            msgEl.textContent = error.message;
            msgEl.classList.remove('hidden');
          } else {
            console.log("[StepPayment] Apple Pay Success:", paymentIntent);
            this.completeBooking(paymentIntent);
          }
        });
      }

      // B. Create Card Element
      const paymentElement = this.elements.create("payment", {
        wallets: { applePay: 'never', googlePay: 'never' }
      });

      // Auto-Disable/Enable Pay Button based on validity
      const payBtn = this.querySelector('#btn-pay-now');
      const waiverCheckbox = this.querySelector('#waiver-checkbox');

      if (payBtn) {
        payBtn.disabled = true;
        payBtn.classList.add('opacity-50', 'cursor-not-allowed');
      }

      paymentElement.on('change', (event) => {
        // Store payment validity for checkbox handler to use
        this.paymentValid = event.complete;

        if (payBtn && waiverCheckbox) {
          // Button is enabled only if BOTH payment is complete AND waiver is checked
          const isPaymentComplete = event.complete;
          const isWaiverChecked = waiverCheckbox.checked;

          payBtn.disabled = !(isPaymentComplete && isWaiverChecked);

          if (isPaymentComplete && isWaiverChecked) {
            payBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            payBtn.title = '';
          } else {
            payBtn.classList.add('opacity-50', 'cursor-not-allowed');
            if (!isWaiverChecked) {
              payBtn.title = 'Please accept the terms to continue';
            } else {
              payBtn.title = 'Please complete payment information';
            }
          }
        }
      });

      // Listen for payment element changes to update button state
      paymentElement.on('change', (event) => {
        this.paymentValid = event.complete;

        // Call updatePayButtonState if it exists
        if (this.updatePayButtonState) {
          this.updatePayButtonState();
        }
      });

      // Mount Card Element
      const container = this.querySelector('#payment-container');
      if (container) {
        container.innerHTML = ''; // Clear loading
        paymentElement.mount("#payment-container");
      }

    } catch (e) {
      console.warn("[StepPayment] Backend connection failed or Stripe init error.", e);
      this.renderManualFallback();
    }
  }

  // --- FALLBACK LOGIC (For Demo / No Backend) ---

  renderManualFallback() {
    const container = this.querySelector('#payment-container');
    if (!container) return;

    container.innerHTML = `
        <div class="mb-6 fade-in">
            <div class="mb-4 p-3 bg-gray-50 text-gray-500 text-xs rounded-lg border border-gray-100 flex items-center justify-center gap-2">
                <i class="fas fa-info-circle"></i> Demo Mode: Backend not connected. Enter any details.
            </div>
            <label class="block text-sm font-medium text-[var(--dark-heading)] mb-2">Card Number</label>
            <div class="relative">
                <input type="text" class="manual-input w-full pl-12 pr-4 py-3 rounded-xl bg-white border-0 ring-1 ring-gray-100 focus:ring-2 focus:ring-gray-300 focus:bg-white outline-none transition-all shadow-sm text-gray-700 placeholder-gray-400 font-medium" placeholder="0000 0000 0000 0000" maxlength="19" required>
                <i class="fas fa-credit-card absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg"></i>
            </div>
        </div>
        
        <div class="grid grid-cols-2 gap-6 mb-8 fade-in">
            <div>
                <label class="block text-sm font-medium text-[var(--dark-heading)] mb-2">Expiry Date</label>
                <input type="text" class="manual-input w-full px-4 py-3 rounded-xl bg-white border-0 ring-1 ring-gray-100 focus:ring-2 focus:ring-gray-300 focus:bg-white outline-none transition-all shadow-sm text-gray-700 placeholder-gray-400 text-center font-medium" placeholder="MM/YY" maxlength="5" required>
            </div>
            <div>
                <label class="block text-sm font-medium text-[var(--dark-heading)] mb-2">CVC</label>
                <div class="relative">
                    <input type="text" class="manual-input w-full pl-12 pr-4 py-3 rounded-xl bg-white border-0 ring-1 ring-gray-100 focus:ring-2 focus:ring-gray-300 focus:bg-white outline-none transition-all shadow-sm text-gray-700 placeholder-gray-400 font-medium" placeholder="123" maxlength="3" required>
                    <i class="fas fa-lock absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                </div>
            </div>
        </div>
    `;

    // Re-attach validation logic for manual inputs
    const inputs = container.querySelectorAll('.manual-input');
    const payBtn = this.querySelector('#btn-pay-now');

    payBtn.disabled = true;
    payBtn.classList.add('opacity-50', 'cursor-not-allowed');

    const checkValid = () => {
      const allFilled = Array.from(inputs).every(i => i.value.length > 2);
      if (allFilled) {
        payBtn.disabled = false;
        payBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      } else {
        payBtn.disabled = true;
        payBtn.classList.add('opacity-50', 'cursor-not-allowed');
      }
    };
    inputs.forEach(i => i.addEventListener('input', checkValid));
  }

  // --- SUBMIT HANDLING ---

  setupListeners() {
    const form = this.querySelector('#payment-form');
    const backBtn = this.querySelector('#btn-step-4-back');
    const payBtn = this.querySelector('#btn-pay-now');
    const waiverCheckbox = this.querySelector('#waiver-checkbox');
    const waiverLinks = this.querySelectorAll('.waiver-link');
    const modal = this.querySelector('#waiver-modal');
    const modalOverlay = this.querySelector('#modal-overlay');
    const modalClose = this.querySelector('#modal-close');
    const modalAccept = this.querySelector('#modal-accept');
    const modalTitle = this.querySelector('#modal-title');
    const modalContent = this.querySelector('#modal-content');

    // Waiver checkbox validation - disable Pay button until checked
    const payBtnMobile = this.querySelector('#btn-pay-now-mobile');

    // Store as instance method so Stripe listener can call it
    this.updatePayButtonState = () => {
      const isWaiverAccepted = waiverCheckbox.checked;
      const isPaymentValid = this.paymentValid || false; // Use stored validity from Stripe element

      // Update both desktop and mobile buttons
      [payBtn, payBtnMobile].forEach(btn => {
        if (!btn) return;

        if (!isWaiverAccepted) {
          btn.disabled = true;
          btn.classList.add('opacity-50', 'cursor-not-allowed');
          btn.title = 'Please accept the terms to continue';
        } else if (isWaiverAccepted && isPaymentValid) {
          btn.disabled = false;
          btn.classList.remove('opacity-50', 'cursor-not-allowed');
          btn.title = '';
        } else {
          // Checkbox is checked but payment is incomplete
          btn.disabled = true;
          btn.classList.add('opacity-50', 'cursor-not-allowed');
          btn.title = 'Please complete payment information';
        }
      });
    };

    // Set initial state (disabled until waiver is checked)
    this.updatePayButtonState();

    waiverCheckbox.addEventListener('change', this.updatePayButtonState);

    // Modal handling for Terms/Privacy/Waiver links
    const openModal = async (docType) => {
      const titles = {
        terms: 'Terms & Conditions',
        privacy: 'Privacy Policy',
        waiver: 'Safety Waiver',
        reschedule: 'Our Rescheduling Policy'
      };

      modalTitle.textContent = titles[docType] || 'Document';
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';

      // Load content
      modalContent.innerHTML = '<div class="flex items-center justify-center h-40"><i class="fas fa-circle-notch fa-spin text-2xl text-[var(--sage-green)]"></i></div>';

      try {
        const API_BASE = window.ENV.API_BASE;
        let content = '';

        if (docType === 'waiver') {
          // Fetch waiver from backend
          const response = await fetch(`${API_BASE}/api/waiver/latest`);
          const data = await response.json();
          content = data.content || 'Waiver content not available.';

          // Store terms version for audit trail
          if (data.version) {
            window.bookingData.termsVersion = '1.0';
          }
        } else if (docType === 'reschedule') {
          content = `
            <div class="space-y-6">
              <div class="bg-gradient-to-br from-[var(--sage-green-light)] to-white border border-[var(--sage-green)] rounded-xl p-6">
                <div class="flex items-start gap-3">
                  <div class="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <i class="fas fa-calendar-check text-[var(--sage-green)] text-lg"></i>
                  </div>
                  <div class="flex-1">
                    <h5 class="font-bold text-[var(--dark-heading)] text-lg mb-2">Flexible Rescheduling</h5>
                    <p class="text-gray-700 leading-relaxed">Need to change your time? No problem! You can reschedule for free up to 24 hours before our session.</p>
                  </div>
                </div>
              </div>
              
              <div class="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <div class="flex items-start gap-3">
                  <div class="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <i class="fas fa-heart text-[var(--sage-green)] text-lg"></i>
                  </div>
                  <div class="flex-1">
                    <h5 class="font-bold text-[var(--dark-heading)] text-lg mb-2">No Refunds</h5>
                    <p class="text-gray-700 leading-relaxed">To keep our small business running smoothly, all bookings are final and non-refundable. We are happy to move your appointment to a new date, but we cannot issue cash refunds.</p>
                  </div>
                </div>
              </div>
              
              <div class="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <div class="flex items-start gap-3">
                  <div class="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <i class="fas fa-clock text-amber-600 text-lg"></i>
                  </div>
                  <div class="flex-1">
                    <h5 class="font-bold text-[var(--dark-heading)] text-lg mb-2">The 24-Hour Rule</h5>
                    <p class="text-gray-700 leading-relaxed">Because Nana Sue reserves this time specifically for your family, changes made with less than 24 hours' notice will forfeit the session fee.</p>
                  </div>
                </div>
              </div>
            </div>
          `;
        } else if (docType === 'terms') {
          content = `
            <h4>Terms & Conditions</h4>
            <p>By booking a session with What To Do by Nana Sue, you agree to the following terms:</p>
            <ul>
              <li>Sessions must be cancelled at least 24 hours in advance for a full refund</li>
              <li>Late cancellations (less than 24 hours) will forfeit 50% of the session fee</li>
              <li>No-shows will forfeit the full session fee</li>
              <li>All advice provided is educational and not a substitute for medical advice</li>
            </ul>
          `;
        } else if (docType === 'privacy') {
          content = `
            <h4>Privacy Policy</h4>
            <p>We respect your privacy and are committed to protecting your personal information.</p>
            <ul>
              <li>We collect only necessary information to provide our services</li>
              <li>Your information is never sold or shared with third parties</li>
              <li>Payment information is securely processed through Stripe</li>
              <li>You may request deletion of your data at any time</li>
            </ul>
          `;
        }

        modalContent.innerHTML = content;
      } catch (error) {
        modalContent.innerHTML = '<p class="text-red-600">Error loading document. Please try again.</p>';
      }
    };

    const closeModal = () => {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    };

    waiverLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const docType = link.getAttribute('data-doc');
        openModal(docType);
      });
    });

    // Policy links (e.g., Rescheduling Policy)
    const policyLinks = this.querySelectorAll('.policy-link');
    policyLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const docType = link.getAttribute('data-doc');
        openModal(docType);
      });
    });

    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);
    modalAccept.addEventListener('click', closeModal);

    backBtn.onclick = () => {
      this.dispatchEvent(new CustomEvent('step-back', {
        detail: { step: 2 },
        bubbles: true,
        composed: true
      }));
    };

    // Mobile back button
    const backBtnMobile = this.querySelector('#btn-step-4-back-mobile');
    if (backBtnMobile) {
      backBtnMobile.onclick = () => {
        this.dispatchEvent(new CustomEvent('step-back', {
          detail: { step: 2 },
          bubbles: true,
          composed: true
        }));
      };
    }

    form.onsubmit = async (e) => {
      e.preventDefault();

      // Ensure waiver is accepted
      if (!waiverCheckbox.checked) {
        alert('Please accept the waiver to continue.');
        return;
      }

      // Store terms and conditions acceptance
      window.bookingData.termsAndConditionsAccepted = true;
      window.bookingData.termsVersion = '1.0';
      // acceptedAt will be set by backend using serverTimestamp for consistency

      payBtn.disabled = true;
      const origText = payBtn.innerHTML;
      payBtn.innerHTML = `<i class="fas fa-circle-notch fa-spin text-lg"></i>`;

      // Also disable and show loading on mobile button
      if (payBtnMobile) {
        payBtnMobile.disabled = true;
        payBtnMobile.innerHTML = `<i class="fas fa-circle-notch fa-spin text-lg"></i>`;
      }

      // 1. If Stripe Elements are active (Real Transaction)
      if (this.stripe && this.elements) {
        const { error, paymentIntent } = await this.stripe.confirmPayment({
          elements: this.elements,
          confirmParams: {
            return_url: window.location.origin + window.location.pathname,
          },
          redirect: "if_required"
        });

        if (error) {
          const msgEl = this.querySelector('#payment-message');
          msgEl.textContent = error.message;
          msgEl.classList.remove('hidden');
          payBtn.disabled = false;
          payBtn.innerHTML = origText;
          if (payBtnMobile) {
            payBtnMobile.disabled = false;
            payBtnMobile.innerHTML = 'Pay Now <i class="fas fa-lock text-sm opacity-80"></i>';
          }
        } else {
          // Payment succeeded or is processing
          console.log('[StepPayment] Payment Intent Status:', paymentIntent?.status);
          this.completeBooking(paymentIntent);
        }
      }
      // 2. Fallback Manual Submit 
      else {
        await new Promise(r => setTimeout(r, 1500)); // Simulate delay
        this.completeBooking(null);
      }
    };
  }


  completeBooking(paymentIntent) {
    console.log('[StepPayment] completeBooking called');
    window.bookingData.bookingComplete = true;

    if (paymentIntent) {
      window.bookingData.paymentIntentId = paymentIntent.id;
      // payment_method is usually an ID string here
      window.bookingData.paymentMethodId = paymentIntent.payment_method;
    }

    console.log('[StepPayment] Dispatching step-complete event for step 2');
    this.dispatchEvent(new CustomEvent('step-complete', {
      detail: { step: 2 },
      bubbles: true,
      composed: true
    }));
  }
}
customElements.define('step-payment', StepPayment);