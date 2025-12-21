export class StepWaiver extends HTMLElement {
  connectedCallback() {
    this.render();
    this.fetchWaiver();
    this.setupListeners();
  }

  render() {
    this.innerHTML = `
        <h2 class="text-2xl font-bold text-gray-800 mb-6">Waiver & Release of Liability</h2>

        <div id="waiver-content"
          class="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6 h-64 overflow-y-auto text-sm text-gray-600 leading-relaxed">
          <div class="flex items-center justify-center h-full">
            <i class="fas fa-circle-notch fa-spin text-gray-400 text-2xl"></i>
            <span class="ml-3 text-gray-500">Loading waiver...</span>
          </div>
        </div>

        <form id="waiver-form">
          <div class="flex items-start mb-8">
            <div class="flex items-center h-5">
              <input id="waiver-agree" type="checkbox" required
                class="focus:ring-[var(--sage-green)] h-4 w-4 text-[var(--sage-green)] border-gray-300 rounded">
            </div>
            <div class="ml-3 text-sm">
              <label for="waiver-agree" class="font-medium text-gray-700">I have read and agree to the Liability Waiver</label>
              <p class="text-gray-500">You must agree to continue.</p>
            </div>
          </div>

          <div class="flex justify-between mt-8">
            <button type="button" id="btn-step-2-back"
              class="btn-secondary border-gray-300 text-gray-500 hover:bg-gray-50">
              Back
            </button>
            <button type="submit" class="btn-primary">
              Next: Select Time <i class="fas fa-arrow-right ml-2"></i>
            </button>
          </div>
        </form>
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
            <div class="text-red-500 text-center p-4">
                <p class="font-bold">Failed to load waiver.</p>
                <p class="text-xs mt-2 text-gray-400 font-mono text-left bg-gray-100 p-2 rounded">
                    Error: ${err.message}<br>
                    URL: ${API_BASE}/api/waiver/latest
                </p>
                <button onclick="this.closest('step-waiver').fetchWaiver()" class="mt-4 text-blue-500 text-xs underline">Retry</button>
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
