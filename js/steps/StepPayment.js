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
        <h2 class="text-2xl font-bold text-gray-800 mb-6">Payment Details</h2>

        <div class="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
          <div class="flex justify-between items-center mb-2">
            <span class="text-gray-600 font-medium">Total Due</span>
            <span id="payment-display-price" class="text-2xl font-bold text-gray-900">$150.00</span>
          </div>
          <p class="text-xs text-gray-500">Secure 256-bit SSL Encrypted</p>
        </div>

        <form id="payment-form">
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
            <div class="relative">
              <input type="text" class="form-input pl-10" placeholder="0000 0000 0000 0000" maxlength="19" required>
              <i class="fas fa-credit-card absolute left-3 top-3 text-gray-400"></i>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
              <input type="text" class="form-input" placeholder="MM/YY" maxlength="5" required>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">CVC</label>
              <div class="relative">
                <input type="text" class="form-input pl-10" placeholder="123" maxlength="3" required>
                <i class="fas fa-lock absolute left-3 top-3 text-gray-400"></i>
              </div>
            </div>
          </div>

          <div class="mt-8 flex justify-between items-center">
            <button type="button" id="btn-step-4-back" class="text-gray-500 hover:text-gray-700 font-medium">
              <i class="fas fa-arrow-left mr-2"></i> Back
            </button>

            <button type="submit" id="btn-pay-now" class="btn-primary w-2/3">
              Pay Now <i class="fas fa-lock ml-2"></i>
            </button>
          </div>
        </form>

        <p class="text-center text-xs text-gray-400 mt-4">
          <i class="fas fa-shield-alt mr-1"></i> Payments are secure and encrypted.
        </p>
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
      payBtn.innerHTML = `<i class="fas fa-circle-notch fa-spin"></i> Processing...`;

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
