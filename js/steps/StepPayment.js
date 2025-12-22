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
        <div class="fade-in max-w-2xl mx-auto">
            <div class="text-center mb-8">
                <h2 class="text-3xl font-bold text-[var(--dark-heading)] mb-2">Payment Details</h2>
                <p class="text-gray-500">Secure your session to complete booking.</p>
            </div>

            <div class="relative">
                
                <div class="flex flex-col md:flex-row justify-between items-center mb-6 pb-6 border-b border-gray-100">
                    <div class="text-center md:text-left">
                        <span class="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total Due</span>
                        <div class="flex items-baseline gap-2">
                            <span id="payment-display-price" class="text-3xl font-bold text-[var(--dark-heading)]">$150.00</span>
                            <span class="text-gray-400 text-sm">USD</span>
                        </div>
                    </div>
                    <div class="mt-4 md:mt-0 flex items-center gap-2 text-xs text-[var(--sage-green)] bg-[var(--sage-green-light)]/20 px-3 py-1.5 rounded-full border border-[var(--sage-green)]/20">
                        <i class="fas fa-lock"></i>
                        <span>256-bit SSL Encrypted</span>
                    </div>
                </div>

                <form id="payment-form" class="relative z-10 min-h-[250px]">
                    
                    <div id="express-checkout-container" class="mb-6 hidden">
                        </div>

                    <div id="express-divider" class="hidden relative py-2 mb-6">
                        <div class="absolute inset-0 flex items-center" aria-hidden="true">
                            <div class="w-full border-t border-gray-200"></div>
                        </div>
                        <div class="relative flex justify-center">
                            <span class="bg-white px-2 text-sm text-gray-400">or pay with card</span>
                        </div>
                    </div>

                    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        
                        <div class="bg-gray-50/50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                            <i class="fas fa-credit-card text-gray-400"></i>
                            <span class="text-sm font-semibold text-gray-700">Card</span>
                        </div>

                        <div class="p-5">
                            <div id="payment-element-container" class="min-h-[150px]">
                                <div class="flex flex-col items-center justify-center h-40 text-gray-400">
                                    <i class="fas fa-circle-notch fa-spin text-2xl mb-2 text-[var(--sage-green)]"></i>
                                    <span class="text-sm font-medium">Initializing Secure Payment...</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="payment-message" class="hidden mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center border border-red-100"></div>

                    <div class="mt-8 flex justify-between items-center">
                        <button type="button" id="btn-step-4-back" 
                            class="text-gray-500 font-medium hover:text-[var(--dark-heading)] px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                            <i class="fas fa-arrow-left text-sm"></i> Back
                        </button>

                        <button type="submit" id="btn-pay-now" 
                            class="bg-[var(--sage-green)] text-white px-8 py-3 rounded-full font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        <span>Pay Total</span> <i class="fas fa-chevron-right text-xs opacity-80"></i>
                        </button>
                    </div>
                </form>

                <div class="mt-8 text-center">
                    <p class="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-2">Powered by Stripe</p>
                    <div class="flex justify-center gap-2 opacity-40 grayscale hover:grayscale-0 transition-all duration-300">
                        <i class="fab fa-cc-visa text-xl"></i>
                        <i class="fab fa-cc-mastercard text-xl"></i>
                        <i class="fab fa-cc-amex text-xl"></i>
                    </div>
                </div>
            </div>
        </div>
      `;
  }

  // --- STRIPE LOGIC ---

  async initStripe() {
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
    // Replace with your live key when ready
    const STRIPE_PK = 'pk_test_51Sgmzs0JW9TGIeXSW1dfxballtkTvMzEbGAHSB0pwrwiOlLQmO1IpXayh8sIv5GA20k9QuvDMRy3ml97q9gEnxi600kEZ6CtSx';

    try {
      console.log("[StepPayment] Requesting Payment Intent...");

      // 1. Fetch Client Secret
      const response = await fetch(`${API_BASE}/api/create-payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [{ id: "session-fee", amount: window.bookingData.price }] }),
      });

      if (!response.ok) throw new Error(`Backend Error: ${response.status}`);

      const { clientSecret } = await response.json();

      // 2. Initialize Stripe Elements
      this.stripe = Stripe(STRIPE_PK);

      // Customize appearance to match the "GitHub" clean look
      const appearance = {
        theme: 'stripe',
        variables: {
          colorPrimary: '#568064', // Sage Green focus state
          colorBackground: '#ffffff',
          colorText: '#374151',
          borderRadius: '8px',
          fontFamily: '"Poppins", sans-serif',
          fontSizeBase: '15px',
        },
        rules: {
          '.Input': {
            border: '1px solid #e5e7eb',
            boxShadow: 'none'
          },
          '.Input:focus': {
            border: '1px solid #568064',
            boxShadow: '0 0 0 1px #568064'
          }
        }
      };

      this.elements = this.stripe.elements({ appearance, clientSecret });

      // --- A. MOUNT EXPRESS CHECKOUT (Apple/Google Pay) ---
      // This is the big black button at the top
      const expressCheckoutElement = this.elements.create('expressCheckout', {
        buttonTheme: {
          applePay: 'black',
          googlePay: 'black'
        },
        buttonType: {
          applePay: 'buy',
          googlePay: 'buy'
        }
      });

      expressCheckoutElement.mount('#express-checkout-container');

      // Only show the container/divider if the user actually has Apple/Google Pay set up
      expressCheckoutElement.on('ready', ({ availablePaymentMethods }) => {
        if (availablePaymentMethods.applePay || availablePaymentMethods.googlePay) {
          this.querySelector('#express-checkout-container').classList.remove('hidden');
          this.querySelector('#express-divider').classList.remove('hidden');
        }
      });

      // --- B. MOUNT CARD ELEMENT ---
      // We configure wallets: 'never' because we handled them above separately
      const paymentElement = this.elements.create("payment", {
        layout: 'tabs',
        wallets: {
          applePay: 'never',
          googlePay: 'never'
        }
      });

      const container = this.querySelector('#payment-element-container');
      container.innerHTML = '';
      paymentElement.mount("#payment-element-container");

    } catch (e) {
      console.warn("[StepPayment] Backend connection failed or Stripe init error.", e);
      this.renderManualFallback();
    }
  }

  // --- FALLBACK LOGIC (Updated to match new Layout) ---

  renderManualFallback() {
    const container = this.querySelector('#payment-element-container');
    if (!container) return;

    // Hide Express checkout in fallback mode
    this.querySelector('#express-checkout-container').classList.add('hidden');
    this.querySelector('#express-divider').classList.add('hidden');

    container.innerHTML = `
        <div class="fade-in">
            <div class="mb-4 p-2 bg-yellow-50 text-yellow-700 text-xs rounded border border-yellow-100 flex items-center justify-center gap-2">
                <i class="fas fa-wifi"></i> Offline Mode
            </div>
            
            <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Card Number</label>
            <div class="relative mb-4">
                <input type="text" class="manual-input w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-[var(--sage-green)] focus:ring-1 focus:ring-[var(--sage-green)] outline-none transition-all text-gray-700 placeholder-gray-300 font-medium" placeholder="0000 0000 0000 0000" maxlength="19" required>
                <i class="fas fa-credit-card absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
        
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Expiration</label>
                    <input type="text" class="manual-input w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[var(--sage-green)] focus:ring-1 focus:ring-[var(--sage-green)] outline-none transition-all text-gray-700 placeholder-gray-300 text-center font-medium" placeholder="MM/YY" maxlength="5" required>
                </div>
                <div>
                    <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">CVC</label>
                    <div class="relative">
                        <input type="text" class="manual-input w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-[var(--sage-green)] focus:ring-1 focus:ring-[var(--sage-green)] outline-none transition-all text-gray-700 placeholder-gray-300 font-medium" placeholder="123" maxlength="3" required>
                        <i class="fas fa-lock absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Re-attach validation logic
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

      // 1. Stripe Transaction
      if (this.stripe && this.elements) {
        const { error } = await this.stripe.confirmPayment({
          elements: this.elements,
          confirmParams: {
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
          this.completeBooking();
        }
      }
      // 2. Fallback Manual Submit 
      else {
        await new Promise(r => setTimeout(r, 1500));
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