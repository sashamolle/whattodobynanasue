import { updateMobileSummary as updateMobileSummaryUtil } from '../utils/mobile-summary.js';

export class StepIntake extends HTMLElement {
  connectedCallback() {
    this.render();
    this.hydrate(); // Populate form with existing data
    this.setupListeners();
    // Update summary after DOM is ready
    setTimeout(() => this.updateMobileSummary(), 0);
  }

  updateMobileSummary() {
    updateMobileSummaryUtil(this);
  }

  // Public method for external managers to trigger update
  updateDisplay() {
    this.hydrate();
  }

  render() {
    const today = new Date().toISOString().split('T')[0];
    this.innerHTML = `
        <div class="fade-in max-w-3xl mx-auto">
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div class="mb-8 text-center">
                    <h2 class="text-3xl font-bold text-gray-800 mb-3">Intake Details</h2>
                    <p class="text-base text-gray-500">Tell us a little about you and your baby so we can prepare.</p>
                </div>

                <form id="step1-form" method="POST">
                    <div class="space-y-10">
                    
                    <!-- Parent Info Section -->
                    <div class="bg-white rounded-xl">
                        <h3 class="flex items-center text-lg font-semibold text-gray-800 mb-6">
                            <div class="w-8 h-8 rounded-full bg-[var(--sage-green-light)] text-[var(--sage-green)] flex items-center justify-center mr-3">
                                <i class="fas fa-user"></i>
                            </div>
                            Parent Information
                        </h3>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-800 mb-2">Your Name</label>
                                <input type="text" id="parentName" required 
                                    class="form-input text-gray-700 placeholder-gray-400" 
                                    placeholder="First & Last Name">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-800 mb-2">Email Address</label>
                                <input type="email" id="parentEmail" required 
                                    class="form-input text-gray-700 placeholder-gray-400" 
                                    placeholder="you@example.com">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-800 mb-2">Phone Number</label>
                                <input type="tel" id="parentPhone" required 
                                    class="form-input text-gray-700 placeholder-gray-400" 
                                    placeholder="(555) 123-4567">
                            </div>
                            <!-- Address Field Container (Hidden if Virtual) -->
                            <div id="address-container">
                                <label class="block text-sm font-medium text-gray-800 mb-2">Home Address <span class="text-xs text-gray-400 font-normal ml-1">(From Step 1)</span></label>
                                <div class="relative">
                                    <input type="text" id="parentAddress" 
                                        class="form-input bg-gray-50 text-gray-500 cursor-not-allowed shadow-none" 
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
                        <h3 class="flex items-center text-lg font-semibold text-gray-800 mb-6">
                            <div class="w-8 h-8 rounded-full bg-[var(--sage-green-light)] text-[var(--sage-green)] flex items-center justify-center mr-3">
                                <i class="fas fa-baby"></i>
                            </div>
                            Baby's Information
                        </h3>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-800 mb-2">Baby's Name</label>
                                <input type="text" id="babyName" required 
                                    class="form-input text-gray-700 placeholder-gray-400" 
                                    placeholder="Baby's Name">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-800 mb-2">Date of Birth</label>
                                <input type="date" id="babyDob" required 
                                    max="${today}"
                                    min="2020-01-01"
                                    class="form-input date-input text-gray-700 placeholder-gray-400"
                                    placeholder="Date of Birth">
                            </div>
                            
                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium text-gray-800 mb-2">Primary Concerns / Goals</label>
                                <textarea id="concerns" rows="3" 
                                    class="form-input text-gray-700 placeholder-gray-400 resize-none font-sans" 
                                    placeholder="What specific milestones are you working on? (e.g., rolling over, crawling, walking)"></textarea>
                            </div>
                        </div>
                    </div>

                </div>
                </form>
                
                <!-- Desktop Buttons (inside card at bottom) -->
                <div class="hidden md:flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
                    <button type="button" id="btn-step-1-back"
                        class="text-gray-500 font-medium hover:text-gray-800 px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                        <i class="fas fa-arrow-left text-sm"></i> Back
                    </button>
                    <button type="submit" form="step1-form" id="btn-step-1-next"
                        class="bg-gray-200 text-gray-400 px-8 py-4 rounded-full font-semibold shadow-none cursor-not-allowed transition-all duration-300 flex items-center gap-2 min-h-[48px]" disabled>
                        Next: Payment <i class="fas fa-arrow-right text-sm"></i>
                    </button>
                </div>
            </div>


            <!-- Sticky Footer (Mobile) -->
            <div class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
                <div class="px-4 py-4 pb-safe">
                    <div class="mb-4 text-xs">
                        <!-- Appointment: Date & Time with Price -->
                        <div class="flex items-center justify-between text-gray-800 font-bold">
                            <div class="flex items-center gap-2">
                                <i class="fas fa-calendar-alt text-[var(--sage-green)]"></i>
                                <span id="mobile-date">Select date & time</span>
                            </div>
                            <div class="text-right">
                                <div id="mobile-total" class="text-[var(--sage-green)] text-lg">$150</div>
                                <div id="mobile-price-breakdown" class="text-[9px] text-gray-500 font-normal mt-1 text-right"></div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Buttons -->
                    <div class="flex gap-3">
                        <button type="button" id="btn-step-1-back-mobile"
                            class="flex-shrink-0 text-gray-500 font-medium hover:text-gray-800 px-4 py-3 rounded-full transition-colors flex items-center justify-center gap-2 border border-gray-200">
                            <i class="fas fa-arrow-left text-sm"></i>
                        </button>
                        <button type="submit" form="step1-form" id="btn-step-1-next-mobile"
                            class="flex-1 bg-gray-200 text-gray-400 px-6 py-4 rounded-full font-semibold shadow-none cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 text-sm min-h-[48px]" disabled>
                            Next: Payment <i class="fas fa-arrow-right text-sm"></i>
                        </button>
                    </div>
                </div>
            </div>
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

    // 3. Update mobile price breakdown
    const mobilePriceBreakdown = this.querySelector('#mobile-price-breakdown');
    if (mobilePriceBreakdown && window.bookingData) {
      const breakdown = [];
      const isInHome = window.bookingData.serviceType === 'in-home';
      const basePrice = isInHome ? 225 : 150;
      const isZone2 = window.bookingData.travelZone === 'zone2';
      const travelFee = (isInHome && isZone2) ? 30 : 0;

      breakdown.push(`$${basePrice} session`);

      if (travelFee > 0) {
        breakdown.push(`$${travelFee} travel`);
      }

      // Join the base parts with +
      let breakdownText = breakdown.join(' + ');

      // Add discount separately (with space, not +)
      if (window.bookingData.promoCode && window.bookingData.discountAmount) {
        breakdownText += ` -$${window.bookingData.discountAmount} ${window.bookingData.promoCode}`;
      }

      mobilePriceBreakdown.textContent = breakdownText;
    }

    // 4. Set Max Date for DOB to Today (Prevent future dates & 6-digit years)
    const dobInput = this.querySelector('#babyDob');
    if (dobInput) {
      const today = new Date().toISOString().split('T')[0];
      dobInput.max = today;
      // Optional: Year 2000 reasonable min?
      dobInput.min = "2020-01-01";

      // Force 4 digit year on manual entry if browser allows
      dobInput.addEventListener('input', (e) => {
        const val = e.target.value;
        if (val) {
          const year = val.split('-')[0];
          if (year.length > 4) {
            e.target.value = val.substring(0, 10); // Standard YYYY-MM-DD length
          }
        }
      });
    }
  }



  setupListeners() {
    const form = this.querySelector('#step1-form');
    const backBtn = this.querySelector('#btn-step-1-back');
    const backBtnMobile = this.querySelector('#btn-step-1-back-mobile');
    const nextBtn = this.querySelector('#btn-step-1-next');
    const nextBtnMobile = this.querySelector('#btn-step-1-next-mobile');

    // Validate baby DOB - prevent future dates (backup for mobile browsers that ignore max attribute)
    const babyDobInput = this.querySelector('#babyDob');
    if (babyDobInput) {
      babyDobInput.addEventListener('change', (e) => {
        const selectedDate = new Date(e.target.value + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate > today) {
          // Silently clear invalid future dates
          e.target.value = '';
          // Clear from bookingData as well
          if (window.bookingData) {
            window.bookingData.babyDob = '';
          }
        }
      });
    }

    // Back button handlers
    const handleBack = () => {
      this.dispatchEvent(new CustomEvent('step-back', {
        detail: { step: 1 },
        bubbles: true,
        composed: true
      }));
    };

    if (backBtn) backBtn.onclick = handleBack;
    if (backBtnMobile) backBtnMobile.onclick = handleBack;

    // Form validation
    const checkValidity = () => {
      if (form.checkValidity()) {
        // Enable both buttons
        [nextBtn, nextBtnMobile].forEach(btn => {
          if (btn) {
            btn.disabled = false;
            btn.classList.remove('bg-gray-200', 'text-gray-400', 'cursor-not-allowed', 'shadow-none');
            btn.classList.add('bg-[var(--sage-green)]', 'text-white', 'shadow-lg', 'hover:shadow-xl', 'hover:-translate-y-0.5', 'cursor-pointer');
          }
        });
      } else {
        // Disable both buttons
        [nextBtn, nextBtnMobile].forEach(btn => {
          if (btn) {
            btn.disabled = true;
            btn.classList.add('bg-gray-200', 'text-gray-400', 'cursor-not-allowed', 'shadow-none');
            btn.classList.remove('bg-[var(--sage-green)]', 'text-white', 'shadow-lg', 'hover:shadow-xl', 'hover:-translate-y-0.5', 'cursor-pointer');
          }
        });
      }
    };

    // Listen to form changes
    form.addEventListener('input', checkValidity);
    checkValidity(); // Initial check

    // Form submission
    form.onsubmit = (e) => {
      e.preventDefault();

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