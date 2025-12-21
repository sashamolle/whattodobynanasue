export class StepIntake extends HTMLElement {
  connectedCallback() {
    this.render();
    this.hydrate();
    this.setupListeners();
  }

  // Public method for external managers to trigger update
  updateDisplay() {
    this.hydrate();
  }

  render() {
    this.innerHTML = `
        <div class="fade-in max-w-3xl mx-auto">
            <div class="text-center mb-10">
                <h2 class="text-3xl font-bold text-[var(--dark-heading)] mb-3">Intake Details</h2>
                <p class="text-gray-500">Tell us a little about you and your baby so we can prepare.</p>
            </div>

            <form id="step1-form">
                <div class="space-y-10">
                    
                    <!-- Parent Info Section -->
                    <div class="bg-white rounded-xl">
                        <h3 class="flex items-center text-lg font-semibold text-[var(--dark-heading)] mb-6">
                            <div class="w-8 h-8 rounded-full bg-[var(--sage-green-light)] text-[var(--sage-green)] flex items-center justify-center mr-3">
                                <i class="fas fa-user"></i>
                            </div>
                            Parent Information
                        </h3>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-[var(--dark-heading)] mb-2">Your Name</label>
                                <input type="text" id="parentName" required 
                                    class="w-full px-4 py-3 rounded-xl bg-white border-0 ring-1 ring-gray-100 focus:ring-2 focus:ring-[var(--sage-green)] focus:bg-white outline-none transition-all shadow-sm text-gray-700 placeholder-gray-400" 
                                    placeholder="First & Last Name">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-[var(--dark-heading)] mb-2">Email Address</label>
                                <input type="email" id="parentEmail" required 
                                    class="w-full px-4 py-3 rounded-xl bg-white border-0 ring-1 ring-gray-100 focus:ring-2 focus:ring-[var(--sage-green)] focus:bg-white outline-none transition-all shadow-sm text-gray-700 placeholder-gray-400" 
                                    placeholder="you@example.com">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-[var(--dark-heading)] mb-2">Phone Number</label>
                                <input type="tel" id="parentPhone" required 
                                    class="w-full px-4 py-3 rounded-xl bg-white border-0 ring-1 ring-gray-100 focus:ring-2 focus:ring-[var(--sage-green)] focus:bg-white outline-none transition-all shadow-sm text-gray-700 placeholder-gray-400" 
                                    placeholder="(555) 123-4567">
                            </div>
                            <!-- Address Field Container (Hidden if Virtual) -->
                            <div id="address-container">
                                <label class="block text-sm font-medium text-[var(--dark-heading)] mb-2">Home Address <span class="text-xs text-gray-400 font-normal ml-1">(From Step 1)</span></label>
                                <div class="relative">
                                    <input type="text" id="parentAddress" 
                                        class="w-full px-4 py-3 rounded-xl border-0 ring-1 ring-gray-100 bg-gray-50 text-gray-500 cursor-not-allowed outline-none shadow-sm" 
                                        placeholder="Address not provided" readonly>
                                    <div class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                        <i class="fas fa-lock"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="border-t border-gray-100"></div>

                    <!-- Baby Info Section -->
                    <div class="bg-white rounded-xl">
                        <h3 class="flex items-center text-lg font-semibold text-[var(--dark-heading)] mb-6">
                            <div class="w-8 h-8 rounded-full bg-[var(--sage-green-light)] text-[var(--sage-green)] flex items-center justify-center mr-3">
                                <i class="fas fa-baby"></i>
                            </div>
                            Baby's Information
                        </h3>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-[var(--dark-heading)] mb-2">Baby's Name</label>
                                <input type="text" id="babyName" required 
                                    class="w-full px-4 py-3 rounded-xl bg-white border-0 ring-1 ring-gray-100 focus:ring-2 focus:ring-[var(--sage-green)] focus:bg-white outline-none transition-all shadow-sm text-gray-700 placeholder-gray-400" 
                                    placeholder="Baby's Name">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-[var(--dark-heading)] mb-2">Date of Birth</label>
                                <div class="relative">
                                    <input type="date" id="babyDob" required 
                                        class="w-full px-4 py-3 rounded-xl bg-white border-0 ring-1 ring-gray-100 focus:ring-2 focus:ring-[var(--sage-green)] focus:bg-white outline-none transition-all shadow-sm text-gray-700 placeholder-gray-400 appearance-none min-h-[3rem]"
                                        style="min-height: 3rem;"> 
                                    <div class="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                        <i class="fas fa-calendar-alt text-gray-400"></i>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium text-[var(--dark-heading)] mb-2">Primary Concerns / Goals</label>
                                <textarea id="concerns" rows="3" 
                                    class="w-full px-4 py-3 rounded-xl bg-white border-0 ring-1 ring-gray-100 focus:ring-2 focus:ring-[var(--sage-green)] focus:bg-white outline-none transition-all shadow-sm text-gray-700 placeholder-gray-400 resize-none" 
                                    placeholder="What specific milestones are you working on? (e.g., rolling over, crawling, walking)"></textarea>
                            </div>
                        </div>
                    </div>

                </div>

                <div class="mt-10 flex justify-between items-center pt-6 border-t border-gray-100">
                    <button type="button" id="btn-step-1-back" 
                        class="text-gray-500 font-medium hover:text-[var(--dark-heading)] px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                        <i class="fas fa-arrow-left text-sm"></i> Back
                    </button>
                    <button type="submit" id="btn-step-1-next"
                        class="bg-gray-200 text-gray-400 px-8 py-4 rounded-full font-semibold shadow-none cursor-not-allowed transition-all duration-300 flex items-center gap-2" disabled>
                        Next: Waiver <i class="fas fa-arrow-right text-sm"></i>
                    </button>
                </div>
            </form>
        </div>
      `;
  }

  hydrate() {
    // 1. Address Logic: Hide if Virtual
    const addrContainer = this.querySelector('#address-container');
    const addrField = this.querySelector('#parentAddress');

    // Check global bookingData for service type
    const isVirtual = window.bookingData && window.bookingData.serviceType === 'virtual';

    if (isVirtual) {
      addrContainer.classList.add('hidden');
    } else {
      addrContainer.classList.remove('hidden');
      if (window.bookingData && window.bookingData.parentAddress) {
        addrField.value = window.bookingData.parentAddress;
      } else {
        addrField.value = ''; // Should be filled if not virtual, but safe fallback
      }
    }

    // 2. Others from Memory (bookingData)
    const load = (id, key) => {
      if (window.bookingData && window.bookingData[key]) {
        const val = window.bookingData[key];
        const el = this.querySelector(`#${id}`);
        if (el) el.value = val;
      }
    };

    load('parentName', 'parentName');
    load('parentEmail', 'parentEmail');
    load('parentPhone', 'parentPhone');
    load('babyName', 'babyName');
    load('babyDob', 'babyDob');
    load('concerns', 'concerns');
  }

  setupListeners() {
    const form = this.querySelector('#step1-form');
    const backBtn = this.querySelector('#btn-step-1-back');
    const submitBtn = this.querySelector('#btn-step-1-next');

    const checkValidity = () => {
      if (form.checkValidity()) {
        // Enable
        submitBtn.disabled = false;
        submitBtn.classList.remove('bg-gray-200', 'text-gray-400', 'cursor-not-allowed', 'shadow-none', 'transform-none');
        submitBtn.classList.add('bg-[var(--sage-green)]', 'text-white', 'shadow-lg', 'hover:shadow-xl', 'hover:-translate-y-0.5', 'cursor-pointer');
      } else {
        // Disable
        submitBtn.disabled = true;
        submitBtn.classList.add('bg-gray-200', 'text-gray-400', 'cursor-not-allowed', 'shadow-none', 'transform-none');
        submitBtn.classList.remove('bg-[var(--sage-green)]', 'text-white', 'shadow-lg', 'hover:shadow-xl', 'hover:-translate-y-0.5', 'cursor-pointer');
      }
    };

    form.addEventListener('input', checkValidity);
    // Initial check
    checkValidity();

    backBtn.onclick = () => {
      this.dispatchEvent(new CustomEvent('step-back', {
        detail: { step: 1 },
        bubbles: true,
        composed: true
      }));
    };

    form.onsubmit = (e) => {
      e.preventDefault();

      // Save Data
      const getVal = (id) => {
        const el = this.querySelector(`#${id}`);
        return el ? el.value : '';
      };

      window.bookingData.parentName = getVal('parentName');
      window.bookingData.parentEmail = getVal('parentEmail');
      window.bookingData.parentPhone = getVal('parentPhone');
      window.bookingData.babyName = getVal('babyName');
      window.bookingData.babyDob = getVal('babyDob');
      window.bookingData.concerns = getVal('concerns');

      this.dispatchEvent(new CustomEvent('step-complete', {
        detail: { step: 1 },
        bubbles: true,
        composed: true
      }));
    };
  }
}
customElements.define('step-intake', StepIntake);