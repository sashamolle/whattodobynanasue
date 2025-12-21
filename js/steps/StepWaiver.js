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

            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 relative">
                
                <!-- Notification Toast -->
                <div id="scroll-toast" class="hidden opacity-0 absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-full shadow-lg z-20 transition-all duration-300 flex items-center whitespace-nowrap">
                    <i class="fas fa-arrow-down mr-2 text-[var(--sage-green)]"></i> Please scroll to the bottom to agree.
                </div>

                <!-- Waiver Content Box -->
                <div id="waiver-content"
                  class="bg-gray-50 border-0 ring-1 ring-gray-100 rounded-xl p-6 mb-8 h-64 overflow-y-auto text-sm text-gray-600 leading-relaxed shadow-inner custom-scrollbar relative scroll-smooth">
                  <div class="flex items-center justify-center h-full">
                    <i class="fas fa-circle-notch fa-spin text-gray-300 text-3xl"></i>
                    <span class="ml-3 text-gray-400 font-medium">Loading waiver...</span>
                  </div>
                </div>

                <form id="waiver-form">
                  <!-- Agreement Container -->
                  <div id="waiver-agree-container" class="flex items-start mb-10 p-4 rounded-lg transition-all duration-300 cursor-not-allowed opacity-60 grayscale select-none">
                    <div class="flex items-center h-6 pointer-events-none">
                      <input id="waiver-agree" type="checkbox" required disabled
                        class="w-5 h-5 text-[var(--sage-green)] border-gray-300 rounded focus:ring-[var(--sage-green)] focus:ring-2 transition-all">
                    </div>
                    <div class="ml-4 text-sm pointer-events-none">
                      <label class="font-medium text-gray-800 text-base">I have read and agree to the Liability Waiver</label>
                      <p class="text-gray-500 mt-1">You must acknowledge this agreement to proceed with booking.</p>
                    </div>
                  </div>

                  <div class="flex justify-between items-center pt-6 border-t border-gray-100">
                    <button type="button" id="btn-step-2-back" 
                        class="text-gray-500 font-medium hover:text-[var(--dark-heading)] px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                        <i class="fas fa-arrow-left text-sm"></i> Back
                    </button>
                    <button type="submit" id="btn-step-2-next"
                        class="bg-gray-200 text-gray-400 px-8 py-4 rounded-full font-semibold shadow-none cursor-not-allowed transition-all duration-300 flex items-center gap-2" disabled>
                        Next: Select Time <i class="fas fa-arrow-right text-sm"></i>
                    </button>
                  </div>
                </form>
            </div>
        </div>
      `;
  }

  async fetchWaiver() {
    const API_BASE = (typeof window.API_BASE !== 'undefined') ? window.API_BASE : 'https://nanasue-backend.onrender.com';
    const container = this.querySelector('#waiver-content');

    try {
      console.log(`[StepWaiver] Fetching waiver from: ${API_BASE}/api/waiver/latest`);
      const res = await fetch(`${API_BASE}/api/waiver/latest`);

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Server returned ${res.status}: ${txt}`);
      }

      const data = await res.json();
      container.innerHTML = data.text.replace(/\n/g, '<br>');
      window.bookingData.waiverVersion = data.version;

      // Check if scrolling is even necessary after load (e.g., short waiver)
      setTimeout(() => this.checkScroll(), 100);

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

  // Separate method to unlock if conditions met
  checkScroll() {
    const content = this.querySelector('#waiver-content');
    if (!content) return;

    // Tolerance of 5px to account for sub-pixel rendering or padding
    const isAtBottom = content.scrollHeight - content.scrollTop <= content.clientHeight + 5;

    if (isAtBottom) {
      this.unlockAgreement();
    }
  }

  unlockAgreement() {
    if (this.isUnlocked) return;
    this.isUnlocked = true;

    const checkbox = this.querySelector('#waiver-agree');
    const container = this.querySelector('#waiver-agree-container');
    const wrapperDivs = container.querySelectorAll('div');

    checkbox.disabled = false;
    container.classList.remove('cursor-not-allowed', 'opacity-60', 'grayscale');
    container.classList.add('cursor-pointer', 'hover:bg-gray-50');

    // Re-enable pointer events for inner elements
    wrapperDivs.forEach(div => div.classList.remove('pointer-events-none'));
  }

  setupListeners() {
    const form = this.querySelector('#waiver-form');
    const backBtn = this.querySelector('#btn-step-2-back');
    const content = this.querySelector('#waiver-content');
    const agreeContainer = this.querySelector('#waiver-agree-container');
    const toast = this.querySelector('#scroll-toast');
    const checkbox = this.querySelector('#waiver-agree');
    const nextBtn = this.querySelector('#btn-step-2-next');

    // Toggle Button Logic
    const updateButton = () => {
      if (checkbox.checked && !checkbox.disabled) {
        nextBtn.disabled = false;
        nextBtn.classList.remove('bg-gray-200', 'text-gray-400', 'cursor-not-allowed', 'shadow-none', 'transform-none');
        nextBtn.classList.add('bg-[var(--sage-green)]', 'text-white', 'shadow-lg', 'hover:shadow-xl', 'hover:-translate-y-0.5', 'cursor-pointer');
      } else {
        nextBtn.disabled = true;
        nextBtn.classList.add('bg-gray-200', 'text-gray-400', 'cursor-not-allowed', 'shadow-none', 'transform-none');
        nextBtn.classList.remove('bg-[var(--sage-green)]', 'text-white', 'shadow-lg', 'hover:shadow-xl', 'hover:-translate-y-0.5', 'cursor-pointer');
      }
    };
    checkbox.addEventListener('change', updateButton);

    this.isUnlocked = false;

    // Scroll Listener
    content.addEventListener('scroll', () => {
      this.checkScroll();
    });

    // Back Button
    backBtn.onclick = () => {
      this.dispatchEvent(new CustomEvent('step-back', {
        detail: { step: 2 },
        bubbles: true,
        composed: true
      }));
    };

    // Container Click Logic (Visual Feedback)
    agreeContainer.onclick = (e) => {
      if (!this.isUnlocked) {
        // Show Toast
        toast.classList.remove('hidden');
        // Trigger reflow for transition
        void toast.offsetWidth;
        toast.classList.remove('opacity-0');

        // Shake animation on text?

        // Hide after 3s
        if (this.toastTimeout) clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => {
          toast.classList.add('opacity-0');
          setTimeout(() => toast.classList.add('hidden'), 300);
        }, 3000);
        return;
      }

      // Handle Click (Manual toggle since we are clicking a DIV)
      // Only toggle if we didn't click the checkbox directly (to avoid double toggle)
      if (e.target !== checkbox) {
        checkbox.checked = !checkbox.checked;
      }
    };

    // Form Submit
    form.onsubmit = (e) => {
      e.preventDefault();
      if (checkbox.checked) {
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