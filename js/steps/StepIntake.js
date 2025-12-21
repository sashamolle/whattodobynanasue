export class StepIntake extends HTMLElement {
    connectedCallback() {
        this.render();
        this.hydrate();
        this.setupListeners();
    }

    render() {
        this.innerHTML = `
        <h2 class="text-2xl font-bold text-gray-800 mb-6">Intake Details</h2>
        <form id="step1-form">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <!-- Parent Info -->
            <div class="col-span-1 md:col-span-2">
              <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Parent Information</h3>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
              <input type="text" id="parentName" required class="form-input" placeholder="First & Last Name">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" id="parentEmail" required class="form-input" placeholder="you@example.com">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input type="tel" id="parentPhone" required class="form-input" placeholder="(555) 123-4567">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Home Address <span class="text-xs text-gray-400 font-normal">(Locked)</span></label>
              <input type="text" id="parentAddress" class="form-input bg-gray-100 text-gray-500 cursor-not-allowed" placeholder="Street, City, Zip" readonly>
            </div>

            <!-- Baby Info -->
            <div class="col-span-1 md:col-span-2 mt-2">
              <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Baby's Information</h3>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Baby's Name</label>
              <input type="text" id="babyName" required class="form-input" placeholder="Baby's Name">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input type="date" id="babyDob" required class="form-input">
            </div>

            <!-- Concerns -->
            <div class="col-span-1 md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Primary Concerns / Goals</label>
              <textarea id="concerns" rows="3" class="form-input" placeholder="What specific milestones are you working on?"></textarea>
            </div>
          </div>

          <div class="mt-8 flex justify-between">
            <button type="button" id="btn-step-1-back" class="btn-secondary border-gray-300 text-gray-500 hover:bg-gray-50">
              Back
            </button>
            <button type="submit" class="btn-primary">
              Next: Waiver <i class="fas fa-arrow-right ml-2"></i>
            </button>
          </div>
        </form>
      `;
    }

    hydrate() {
        // 1. Address is special - comes from Step 0 state
        const addrField = this.querySelector('#parentAddress');
        if (window.bookingData.parentAddress) {
            addrField.value = window.bookingData.parentAddress;
        } else if (localStorage.getItem('booking_address')) {
            // Fallback if reloaded directly on step 1 (though tough without shell logic)
            addrField.value = localStorage.getItem('booking_address');
        }

        // 2. Others from Storage
        const load = (id, key) => {
            const val = localStorage.getItem(key);
            if (val) this.querySelector(`#${id}`).value = val;
        };

        load('parentName', 'booking_parentName');
        load('parentEmail', 'booking_parentEmail');
        load('parentPhone', 'booking_parentPhone');
        load('babyName', 'booking_babyName');
        load('babyDob', 'booking_babyDob');
        load('concerns', 'booking_concerns');
    }

    setupListeners() {
        const form = this.querySelector('#step1-form');
        const backBtn = this.querySelector('#btn-step-1-back');

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
            const getVal = (id) => this.querySelector(`#${id}`).value;

            window.bookingData.parentName = getVal('parentName');
            window.bookingData.parentEmail = getVal('parentEmail');
            window.bookingData.parentPhone = getVal('parentPhone');
            window.bookingData.babyName = getVal('babyName');
            window.bookingData.babyDob = getVal('babyDob');
            window.bookingData.concerns = getVal('concerns');
            // Address is already in bookingData from Step 0, or ReadOnly field logic?
            // If user navigates back to 0 and changes it, Step 0 updates it.
            // Step 1 just displays it.

            // LocalStorage Persistence
            localStorage.setItem('booking_parentName', window.bookingData.parentName);
            localStorage.setItem('booking_parentEmail', window.bookingData.parentEmail);
            localStorage.setItem('booking_parentPhone', window.bookingData.parentPhone);
            localStorage.setItem('booking_babyName', window.bookingData.babyName);
            localStorage.setItem('booking_babyDob', window.bookingData.babyDob);
            localStorage.setItem('booking_concerns', window.bookingData.concerns);

            this.dispatchEvent(new CustomEvent('step-complete', {
                detail: { step: 1 },
                bubbles: true,
                composed: true
            }));
        };
    }
}
customElements.define('step-intake', StepIntake);
