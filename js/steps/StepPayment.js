export class StepPayment extends HTMLElement {
  connectedCallback() {
    this.render();
    this.setupListeners();
    // Listen for price updates? Or assume global `bookingData` is up to date when shown.
    // We can update the display when connected.
    this.updateDisplay();
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

                <form id="payment-form" class="relative z-10">
                  <div class="mb-6">
                    <label class="block text-sm font-medium text-[var(--dark-heading)] mb-2">Card Number</label>
                    <div class="relative">
                      <input type="text" class="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border-0 ring-1 ring-gray-100 focus:ring-2 focus:ring-[var(--sage-green)] focus:bg-white outline-none transition-all shadow-sm text-gray-700 placeholder-gray-400 font-medium" placeholder="0000 0000 0000 0000" maxlength="19" required>
                      <i class="fas fa-credit-card absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg"></i>
                    </div>
                  </div>
                  
                  <div class="grid grid-cols-2 gap-6 mb-8">
                    <div>
                      <label class="block text-sm font-medium text-[var(--dark-heading)] mb-2">Expiry Date</label>
                      <input type="text" class="w-full px-4 py-3 rounded-xl bg-gray-50 border-0 ring-1 ring-gray-100 focus:ring-2 focus:ring-[var(--sage-green)] focus:bg-white outline-none transition-all shadow-sm text-gray-700 placeholder-gray-400 text-center font-medium" placeholder="MM/YY" maxlength="5" required>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-[var(--dark-heading)] mb-2">CVC</label>
                      <div class="relative">
                        <input type="text" class="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border-0 ring-1 ring-gray-100 focus:ring-2 focus:ring-[var(--sage-green)] focus:bg-white outline-none transition-all shadow-sm text-gray-700 placeholder-gray-400 font-medium" placeholder="123" maxlength="3" required>
                        <i class="fas fa-lock absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                      </div>
                    </div>
                  </div>

                  <div class="mt-8 flex justify-between items-center pt-6 border-t border-gray-100">
                    <button type="button" id="btn-step-4-back" 
                        class="text-gray-500 font-medium hover:text-[var(--dark-heading)] px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                        <i class="fas fa-arrow-left text-sm"></i> Back
                    </button>

                    <button type="submit" id="btn-pay-now" 
                        class="bg-[var(--sage-green)] text-white px-10 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 min-w-[200px] justify-center">
                      <span>Pay Now</span> <i class="fas fa-lock text-sm opacity-80"></i>
                    </button>
                  </div>
                </form>

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
      payBtn.classList.add('opacity-80', 'cursor-wait');

      // Simulate Network Delay
      await new Promise(r => setTimeout(r, 1500));

      window.bookingData.bookingComplete = true; // Mark done

      this.dispatchEvent(new CustomEvent('step-complete', {
        detail: { step: 4 },
        bubbles: true,
        composed: true
      }));
      // Note: Error handling if backend fails needs to be handled by Manager usually.
      // Or we can wait for Manager response?
      // For now, assume happy path or Manager handles API error and shows alert.
    };
  }
}
customElements.define('step-payment', StepPayment);