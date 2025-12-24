export class StepPayment extends HTMLElement {
  connectedCallback() {
    this.stripe = null;
    this.elements = null;
    // Fix: If originalPrice is already stored (from previous visit), use it. 
    // Otherwise fallback to current price (first visit) or 150 default.
    this.originalPrice = (window.bookingData && window.bookingData.originalPrice)
      ? window.bookingData.originalPrice
      : (window.bookingData ? window.bookingData.price : 150.00);

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

  resetPromoUI() {
    const input = this.querySelector('#promo-input');
    const container = this.querySelector('#promo-container');
    const toggleBtn = this.querySelector('#toggle-promo');
    const applyBtn = this.querySelector('#apply-promo-btn');
    const messageEl = this.querySelector('#promo-message');

    // Reset Input
    input.value = '';
    input.disabled = false;
    input.classList.remove('bg-gray-50', 'text-gray-500');

    // Reset Button
    applyBtn.textContent = 'Apply';
    applyBtn.classList.remove('bg-[var(--sage-green)]', 'pointer-events-none');
    applyBtn.classList.add('bg-gray-800');

    // Hide Message
    messageEl.textContent = '';
    messageEl.classList.add('hidden');

    // Reset Container Visibility (Optional: Keep it open or close it? Let's close it cleanly)
    // container.classList.add('hidden'); 
    // toggleBtn.classList.remove('hidden');
    // Actually, let's keep it open if the user had it open? No, standard reset is safer.
    container.classList.add('hidden');
    toggleBtn.classList.remove('hidden');
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
    const priceDisplay = this.querySelector('#payment-display-price');
    const originalPriceDisplay = this.querySelector('#original-price-display');
    const discountBadge = this.querySelector('#discount-badge');

    if (window.bookingData && window.bookingData.price) {
      // If price is different from original, show discount view
      if (window.bookingData.price < this.originalPrice) {
        priceDisplay.textContent = `$${window.bookingData.price.toFixed(2)}`;
        priceDisplay.classList.add('text-[var(--sage-green)]');

        originalPriceDisplay.textContent = `$${this.originalPrice.toFixed(2)}`;
        originalPriceDisplay.classList.remove('hidden');

        discountBadge.classList.remove('hidden');
      } else {
        // Standard view
        priceDisplay.textContent = `$${window.bookingData.price.toFixed(2)}`;
        priceDisplay.classList.remove('text-[var(--sage-green)]');
        originalPriceDisplay.classList.add('hidden');
        discountBadge.classList.add('hidden');
      }
    }
  }

  render() {
    this.innerHTML = `
        <div class="fade-in max-w-3xl mx-auto">
            <div class="text-center mb-10">
                <h2 class="text-3xl font-bold text-[var(--dark-heading)] mb-3">Payment Details</h2>
                <p class="text-gray-500">Secure your session to complete booking.</p>
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

                        <!-- Button Row -->
                        <div class="mt-8 flex justify-between items-center pt-6 border-t border-gray-100">
                            <button type="button" id="btn-step-4-back" 
                                class="text-gray-500 font-medium hover:text-[var(--dark-heading)] px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                                <i class="fas fa-arrow-left text-sm"></i> Back
                            </button>

                            <button type="submit" id="btn-pay-now" 
                                class="bg-[var(--sage-green)] text-white px-10 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 min-w-[200px] justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none">
                            <span>Pay Now</span> <i class="fas fa-lock text-sm opacity-80"></i>
                            </button>
                        </div>
                    </form>
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
    const handleApply = () => {
      const code = input.value.trim().toUpperCase();
      messageEl.className = "text-xs mt-2 font-medium ml-1 block"; // Reset classes

      // --- CODES CONFIGURATION ---
      const CODES = {
        'FRIENDS20': { type: 'percent', value: 0.20 },
        'NANASUE': { type: 'fixed', value: 20.00 },
        'WELCOME10': { type: 'fixed', value: 10.00 },
        'HRPMAMASQ2': { type: 'fixed', value: 30.00 }
      };

      if (CODES[code]) {
        // Calculate Discount
        const discount = CODES[code];
        let newPrice = this.originalPrice;

        if (discount.type === 'percent') {
          newPrice = this.originalPrice * (1 - discount.value);
        } else {
          newPrice = Math.max(0, this.originalPrice - discount.value);
        }

        // Update Global State
        window.bookingData.price = newPrice;
        window.bookingData.promoCode = code;
        window.bookingData.originalPrice = this.originalPrice;
        window.bookingData.discountAmount = (this.originalPrice - newPrice).toFixed(2);

        // UI Feedback
        messageEl.textContent = "Code applied successfully!";
        messageEl.classList.add('text-[var(--sage-green)]');
        messageEl.classList.remove('text-red-500');

        input.disabled = true;
        input.classList.add('bg-gray-50', 'text-gray-500');
        applyBtn.textContent = 'Applied';
        applyBtn.classList.add('bg-[var(--sage-green)]', 'pointer-events-none');
        applyBtn.classList.remove('bg-gray-800');

        toggleBtn.classList.add('hidden'); // Hide the toggle link so it looks cleaner

        // Refresh Displays
        this.updateDisplay();

        // Re-Initialize Payment (To update Stripe Intent amount)
        // We verify Stripe exists first
        if (this.stripe) {
          // Clear old element to prevent duplicates
          const paymentContainer = this.querySelector('#payment-container');
          paymentContainer.innerHTML = `
                    <div class="flex flex-col items-center justify-center h-40 text-gray-400">
                        <i class="fas fa-circle-notch fa-spin text-2xl mb-2 text-[var(--sage-green)]"></i>
                        <span class="text-sm font-medium">Updating Total...</span>
                    </div>
                `;
          this.initStripe(); // Re-run init to fetch new intent
        }

      } else {
        // Invalid Code
        messageEl.textContent = "Invalid code. Please try again.";
        messageEl.classList.add('text-red-500');
        messageEl.classList.remove('text-[var(--sage-green)]');

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
    const API_BASE = (window.ENV && window.ENV.API_BASE) ? window.ENV.API_BASE : 'https://nanasue-backend.onrender.com';
    const STRIPE_PK = 'pk_test_51Sgmzs0JW9TGIeXSW1dfxballtkTvMzEbGAHSB0pwrwiOlLQmO1IpXayh8sIv5GA20k9QuvDMRy3ml97q9gEnxi600kEZ6CtSx';

    try {
      // 2. Fetch Client Secret from Backend
      // We send the CURRENT price (which might be discounted)
      const response = await fetch(`${API_BASE}/api/create-payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [{ id: "session-fee", amount: window.bookingData.price }] }),
      });

      if (!response.ok) {
        throw new Error(`Backend Error: ${response.status}`);
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
          const { error } = await this.stripe.confirmPayment({
            elements: this.elements,
            clientSecret,
            confirmParams: { return_url: window.location.href },
          });
          if (error) {
            const msgEl = this.querySelector('#payment-message');
            msgEl.textContent = error.message;
            msgEl.classList.remove('hidden');
          } else {
            this.completeBooking();
          }
        });
      }

      // B. Create Card Element
      const paymentElement = this.elements.create("payment", {
        wallets: { applePay: 'never', googlePay: 'never' }
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

    backBtn.onclick = () => {
      this.dispatchEvent(new CustomEvent('step-back', {
        detail: { step: 4 },
        bubbles: true,
        composed: true
      }));
    };

    form.onsubmit = async (e) => {
      e.preventDefault();

      payBtn.disabled = true;
      const origText = payBtn.innerHTML;
      payBtn.innerHTML = `<i class="fas fa-circle-notch fa-spin text-lg"></i>`;

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
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
          // Success
          this.completeBooking(paymentIntent);
        } else {
          console.warn("Unexpected Stripe State:", paymentIntent);
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
    window.bookingData.bookingComplete = true;

    if (paymentIntent) {
      window.bookingData.paymentIntentId = paymentIntent.id;
      // payment_method is usually an ID string here
      window.bookingData.paymentMethodId = paymentIntent.payment_method;
    }

    this.dispatchEvent(new CustomEvent('step-complete', {
      detail: { step: 4 },
      bubbles: true,
      composed: true
    }));
  }
}
customElements.define('step-payment', StepPayment);