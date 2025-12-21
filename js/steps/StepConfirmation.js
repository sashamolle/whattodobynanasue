export class StepConfirmation extends HTMLElement {
  connectedCallback() {
    this.render();
    this.updateDisplay();
  }

  updateDisplay() {
    if (window.bookingData && window.bookingData.parentEmail) {
      const el = this.querySelector('#confirm-email');
      if (el) el.textContent = window.bookingData.parentEmail;
    }
  }

  render() {
    this.innerHTML = `
        <div class="text-center py-10">
          <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i class="fas fa-check text-3xl text-green-600"></i>
          </div>
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Booking Confirmed!</h2>
          <p class="text-xl text-gray-600 mb-8 max-w-md mx-auto">
            Thank you! Your appointment has been scheduled.
          </p>

          <div class="bg-gray-50 rounded-xl p-6 mb-8 text-left max-w-md mx-auto border border-gray-200">
            <p class="mb-2"><strong class="text-gray-800">Confirmation Sent To:</strong> <span id="confirm-email" class="text-gray-600">...</span></p>
            <p class="text-[var(--sage-green)] font-medium mt-4"><i class="fas fa-wallet mr-2"></i>Payment of $150.00 is due in person.</p>
          </div>

          <a href="index.html" class="btn-secondary">Back to Home</a>
        </div>
      `;
  }
}
customElements.define('step-confirmation', StepConfirmation);
