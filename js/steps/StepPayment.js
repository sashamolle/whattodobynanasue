export class StepPayment extends HTMLElement {
  connectedCallback() {
    this.stripe = null;
    this.elements = null;
    this.render();
    this.setupListeners();
    this.updateDisplay();

    // Initialize Stripe Logic
    this.initStripe();
  }

  updateDisplay() {
    const priceDisplay = this.querySelector('#payment-display-price');
    if (window.bookingData && window.bookingData.price) {
      priceDisplay.textContent = `$${window.bookingData.price.toFixed(2)}`;
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

                <div class="flex flex-col md:flex-row justify-between items-center mb-8 pb-8 border-b border-gray-100 relative z-10">
                    <div class="text-center md:text-left mb-4 md:mb-0">
                        <span class="block text-gray-500 text-sm font-medium uppercase tracking-wide mb-1">Total Due</span>
                        <div class="flex items-baseline justify-center md:justify-start">
                            <span id="payment-display-price" class="text-4xl font-bold text-[var(--dark-heading)]">$150.00</span>
                            <span class="text-gray-400 text-sm ml-2">USD</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                        <i class="fas fa-lock text-[var(--sage-green)]"></i>
                        <span>Secure 256-bit SSL Encrypted</span>
                    </div>
                </div>

                <!-- Dynamic Container: Will hold either Stripe Element OR Manual Fallback -->
                <div id="stripe-integration-root" class="relative z-10">
                    
                    <!-- Express Checkout Container -->
                    <div id="express-checkout-container" class="mb-2"></div>
                    
                    <!-- Divider (Hidden by default, shown if Express Checkout loads) -->
                    <div id="payment-divider" class="hidden flex items-center justify-between mb-6 mt-4">
                        <span class="h-px w-full bg-gray-200"></span>
                        <span class="text-xs text-gray-400 font-medium uppercase px-3 whitespace-nowrap">Or pay with card</span>
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
    const API_BASE = (typeof window.API_BASE !== 'undefined') ? window.API_BASE : '';

    // User Provided Key
    const STRIPE_PK = 'pk_test_51Sgmzs0JW9TGIeXSW1dfxballtkTvMzEbGAHSB0pwrwiOlLQmO1IpXayh8sIv5GA20k9QuvDMRy3ml97q9gEnxi600kEZ6CtSx';

    try {
      console.log("[StepPayment] Requesting Payment Intent from:", `${API_BASE}/api/create-payment-intent`);

      // 2. Fetch Client Secret from Backend
      const response = await fetch(`${API_BASE}/api/create-payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send amount to ensure backend creates intent correctly (though backend often validates this)
        body: JSON.stringify({ items: [{ id: "session-fee", amount: window.bookingData.price }] }),
      });

      if (!response.ok) {
        throw new Error(`Backend Error: ${response.status}`);
      }

      const { clientSecret } = await response.json();
      console.log("[StepPayment] Client Secret received.");

      // 3. Initialize Elements
      this.stripe = Stripe(STRIPE_PK);
      const appearance = {
        theme: 'stripe',
        variables: {
          colorPrimary: '#568064', // Sage Green
          colorBackground: '#ffffff',
          colorText: '#1f2937', // Dark Heading
          borderRadius: '12px',
          fontFamily: '"Poppins", sans-serif',
          spacingUnit: '5px',
        },
      };
      this.elements = this.stripe.elements({ appearance, clientSecret });

      // A. Create Express Checkout Element (Apple Pay / Google Pay)
      const expressCheckout = this.elements.create('expressCheckout');
      expressCheckout.mount('#express-checkout-container');

      // Check if Express Checkout is actually available (e.g. device supports it)
      expressCheckout.on('ready', ({ availablePaymentMethods }) => {
        if (availablePaymentMethods) {
          this.querySelector('#payment-divider').classList.remove('hidden');
        }
      });

      // Handle Express Checkout Confirmation
      expressCheckout.on('confirm', async (event) => {
        const { error } = await this.stripe.confirmPayment({
          elements: this.elements,
          clientSecret,
          confirmParams: {
            return_url: window.location.href,
          },
        });
        if (error) {
          const msgEl = this.querySelector('#payment-message');
          msgEl.textContent = error.message;
          msgEl.classList.remove('hidden');
        } else {
          this.completeBooking();
        }
      });

      // B. Create Card Element (Disable Wallets to avoid duplication)
      const paymentElement = this.elements.create("payment", {
        wallets: {
          applePay: 'never',
          googlePay: 'never'
        }
      });

      // Mount Card Element
      const container = this.querySelector('#payment-container');
      container.innerHTML = ''; // Clear loading
      paymentElement.mount("#payment-container");

    } catch (e) {
      console.warn("[StepPayment] Backend connection failed or Stripe init error.", e);
      this.renderManualFallback();
    }
  }

  // --- FALLBACK LOGIC (For Demo / No Backend) ---

  renderManualFallback() {
    const container = this.querySelector('#payment-container');
    if (!container) return;

    // Use the soft styling we designed earlier (bg-white instead of bg-gray-50)
    // Updated: Softer gray ring for focus instead of sage green, and gray demo banner.
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

    // Initial Disable
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
        const { error } = await this.stripe.confirmPayment({
          elements: this.elements,
          confirmParams: {
            // Make sure this points to your deployed success page or handles internally
            // We use if_required to catch completion without redirect if possible
            return_url: window.location.href,
          },
          redirect: "if_required"
        });

        if (error) {
          const msgEl = this.querySelector('#payment-message');
          msgEl.textContent = error.message;
          msgEl.classList.remove('hidden');
          payBtn.disabled = false;
          payBtn.innerHTML = origText;
        } else {
          // Success
          this.completeBooking();
        }
      }
      // 2. Fallback Manual Submit 
      else {
        await new Promise(r => setTimeout(r, 1500)); // Simulate delay
        this.completeBooking();
      }
    };
  }

  completeBooking() {
    window.bookingData.bookingComplete = true;
    this.dispatchEvent(new CustomEvent('step-complete', {
      detail: { step: 4 },
      bubbles: true,
      composed: true
    }));
  }
}
customElements.define('step-payment', StepPayment);