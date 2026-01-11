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

    // [GA4] Track Conversion
    this.trackPurchase();
  }

  trackPurchase() {
    const data = window.bookingData;

    // Safety checks: Must have ID, Price, and NOT already tracked
    if (!data || !data.paymentIntentId || data.purchaseTracked) return;

    const analyticsEnabled = window.ENV?.ENABLE_ANALYTICS !== false;

    if (window.gtag && analyticsEnabled) {
      console.log(`[GA4] Tracking Purchase: ${data.paymentIntentId} ($${data.price})`);

      window.gtag('event', 'purchase', {
        transaction_id: data.paymentIntentId,
        value: data.totalPaid || data.price, // Prefer totalPaid (with travel fee), fallback to base
        currency: 'USD',
        coupon: data.promoCode || undefined,
        items: [{
          item_id: data.serviceType,
          item_name: 'Booked Session',
          price: data.totalPaid || data.price
        }]
      });

      // Mark as tracked to prevent double-counting on re-renders
      data.purchaseTracked = true;
    } else if (!analyticsEnabled) {
      console.log(`[GA4] Purchase tracking disabled for localhost testing`);
    }
  }

  render() {
    this.innerHTML = `
        <div class="fade-in max-w-3xl mx-auto">
            <!-- Outer Card Wrapper -->
            <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <!-- Main Content Card -->
                <div class="p-8">
                    <div class="bg-white rounded-2xl p-8 md:p-12 border border-gray-100 shadow-sm relative overflow-hidden text-center">
                        <!-- Decorative background element -->
                        <div class="absolute top-0 left-0 w-40 h-40 bg-[var(--sage-green-light)] rounded-br-full opacity-50 -ml-10 -mt-10 pointer-events-none"></div>
                        <div class="absolute bottom-0 right-0 w-40 h-40 bg-[var(--sage-green-light)] rounded-tl-full opacity-50 -mr-10 -mb-10 pointer-events-none"></div>

                        <div class="relative z-10">
                            <div class="w-24 h-24 bg-[var(--sage-green-light)] rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                                <i class="fas fa-check text-4xl text-[var(--sage-green)]"></i>
                            </div>
                            
                            <h2 class="text-3xl font-bold text-[var(--dark-heading)] mb-4">Booking Confirmed!</h2>
                            <p class="text-gray-600 mb-8 max-w-lg mx-auto leading-relaxed">
                                Thank you for booking with What To Do by Nana Sue. We're looking forward to meeting you and your little one!
                            </p>

                            <div class="bg-gray-50 rounded-xl p-6 mb-10 max-w-md mx-auto border border-gray-100 shadow-sm">
                                <div class="flex flex-col md:flex-row items-center justify-between gap-2 mb-4 pb-4 border-b border-gray-200 border-dashed text-center md:text-left">
                                    <span class="text-gray-500 font-medium text-sm uppercase tracking-wide whitespace-nowrap">Confirmation Sent To</span>
                                    <span id="confirm-email" class="text-[var(--dark-heading)] font-bold text-sm break-all">...</span>
                                </div>
                                 <div class="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3 text-[var(--sage-green)] font-semibold bg-white py-4 px-4 rounded-lg border border-[var(--sage-green-light)] text-center">
                                    <i class="fas fa-receipt text-xl md:text-base mb-1 md:mb-0"></i>
                                    <span>Payment Received. Receipt sent to email.</span>
                                </div>
                            </div>

                            <a href="index.html" class="inline-flex items-center justify-center bg-[var(--sage-green)] text-white px-10 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 min-w-[200px]">
                                Back to Home <i class="fas fa-home ml-2 text-sm opacity-80"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      `;
  }
}
customElements.define('step-confirmation', StepConfirmation);