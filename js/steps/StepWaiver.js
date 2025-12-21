export class StepWaiver extends HTMLElement {
  connectedCallback() {
    this.render();
    this.fetchWaiver();
    this.setupListeners();
  }

  render() {
    this.innerHTML = `
        <div class="fade-in max-w-3xl mx-auto">
            <div class="text-center mb-10">
                <h2 class="text-3xl font-bold text-[var(--dark-heading)] mb-3">Waiver & Release</h2>
                <p class="text-gray-500">Please review and agree to the terms of service to continue.</p>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                <!-- Waiver Content Box -->
                <div id="waiver-content"
                  class="bg-gray-50 border-0 ring-1 ring-gray-100 rounded-xl p-6 mb-8 h-64 overflow-y-auto text-sm text-gray-600 leading-relaxed shadow-inner custom-scrollbar">
                  <div class="flex items-center justify-center h-full">
                    <i class="fas fa-circle-notch fa-spin text-gray-300 text-3xl"></i>
                    <span class="ml-3 text-gray-400 font-medium">Loading waiver...</span>
                  </div>
                </div>

                <form id="waiver-form">
                  <div class="flex items-start mb-10 p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" onclick="document.getElementById('waiver-agree').click()">
                    <div class="flex items-center h-6">
                      <input id="waiver-agree" type="checkbox" required
                        class="w-5 h-5 text-[var(--sage-green)] border-gray-300 rounded focus:ring-[var(--sage-green)] focus:ring-2 cursor-pointer transition-all">
                    </div>
                    <div class="ml-4 text-sm">
                      <label for="waiver-agree" class="font-medium text-gray-800 cursor-pointer text-base">I have read and agree to the Liability Waiver</label>
                      <p class="text-gray-500 mt-1">You must acknowledge this agreement to proceed with booking.</p>
                    </div>
                  </div>

                  <div class="flex justify-between items-center pt-6 border-t border-gray-100">
                    <button type="button" id="btn-step-2-back" 
                        class="text-gray-500 font-medium hover:text-[var(--dark-heading)] px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                        <i class="fas fa-arrow-left text-sm"></i> Back
                    </button>
                    <button type="submit" 
                        class="bg-[var(--sage-green)] text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2">
                        Next: Select Time <i class="fas fa-arrow-right text-sm"></i>
                    </button>
                  </div>
                </form>
            </div>
        </div>
      `;
  }

  async fetchWaiver() {
    // Assuming API_BASE is globally defined or we use relative path
    const API_BASE = (typeof window.API_BASE !== 'undefined') ? window.API_BASE : 'https://nanasue-backend.onrender.com';
    const container = this.querySelector('#waiver-content');

    try {
      console.log(`[StepWaiver] Fetching waiver from: ${API_BASE}/api/waiver/latest`);
      const res = await fetch(`${API_BASE}/api/waiver/latest`);
      console.log(`[StepWaiver] Response status: ${res.status}`);

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Server returned ${res.status}: ${txt}`);
      }

      const data = await res.json();
      container.innerHTML = data.text.replace(/\n/g, '<br>');
      window.bookingData.waiverVersion = data.version; // Store version
    } catch (err) {
      console.error("[StepWaiver] Error:", err);
      container.innerHTML = `
            <div class="text-red-500 text-center p-4 flex flex-col items-center justify-center h-full">
                <i class="fas fa-exclamation-circle text-2xl mb-2 text-rose-400"></i>
                <p class="font-bold text-gray-700">Failed to load waiver.</p>
                <button onclick="this.closest('step-waiver').fetchWaiver()" class="mt-4 text-blue-500 text-sm font-medium hover:underline">Tap to Retry</button>
            </div>`;
    }
  }

  setupListeners() {
    const form = this.querySelector('#waiver-form');
    const backBtn = this.querySelector('#btn-step-2-back');

    backBtn.onclick = () => {
      this.dispatchEvent(new CustomEvent('step-back', {
        detail: { step: 2 },
        bubbles: true,
        composed: true
      }));
    };

    form.onsubmit = (e) => {
      e.preventDefault();
      const agreed = this.querySelector('#waiver-agree').checked;
      if (agreed) {
        window.bookingData.waiverAgreed = true;
        this.dispatchEvent(new CustomEvent('step-complete', {
          detail: { step: 2 },
          bubbles: true,
          composed: true
        }));
      }
    };
  }
}
customElements.define('step-waiver', StepWaiver);