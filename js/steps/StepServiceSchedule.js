import { updateMobileSummary as updateMobileSummaryUtil } from '../utils/mobile-summary.js';

// StepServiceSchedule.js - Consolidated Service Selection + Scheduling Component

export class StepServiceSchedule extends HTMLElement {
  constructor() {
    super();
    this.calendarData = null;
    this.selectedDate = null;
    this.selectedSlot = null;
    this.serviceSelected = false;
    this.locationSelected = false;
  }

  connectedCallback() {
    this.render();
    this.setupListeners();
    this.updateDisplay();
  }

  render() {
    const API_BASE = window.ENV?.API_BASE || '';

    this.innerHTML = `
      <div class="fade-in max-w-7xl mx-auto">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div class="mb-8 text-center">
            <h2 class="text-3xl font-bold text-gray-800 mb-3">Pick A Time</h2>
            <p class="text-base text-gray-500">Select a service type & time that fits your baby's schedule.</p>
          </div>

          <!-- Two-Column Layout: 40% Left / 60% Right (Desktop) / Stacked (Mobile) -->
          <div class="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-6 lg:gap-8">
          
          <!-- LEFT PANE (40%): Service Selection -->
          <div class="space-y-6">
            
            <!-- Combined Service & Location Selection Card -->
            <div id="service-card" class="bg-white rounded-2xl shadow-lg p-6 border-2 border-transparent transition-all duration-300 relative">
              <i id="service-check" class="hidden fas fa-check-circle text-2xl text-[var(--sage-green)] transition-all duration-300 absolute top-6 right-6"></i>
              <div class="mb-6 pb-2 border-b border-gray-50">
                <h3 class="text-lg font-semibold text-gray-800">Choose Your Class</h3>
              </div>
              
              <div class="space-y-3">
                <!-- Virtual Option -->
                <div class="relative group">
                  <input type="radio" name="service" id="service-virtual" value="virtual" class="peer hidden">
                  <label for="service-virtual"
                    class="flex items-center gap-4 cursor-pointer bg-white border border-gray-200 rounded-xl p-4 shadow-sm transition-all duration-300
                    hover:-translate-y-0.5 hover:border-[var(--sage-green)]
                    peer-checked:border-[var(--sage-green)] peer-checked:bg-[var(--sage-green-light)]">
                    
                    <div class="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <i class="fas fa-video text-[var(--sage-green)] text-lg"></i>
                    </div>
                    
                    <div class="flex-1 text-left">
                      <h3 class="font-bold text-[var(--dark-heading)] text-base">Virtual Private Mobility Class <span class="font-normal text-gray-500">— 45 min</span></h3>
                      <p class="text-sm text-gray-500 mt-1">Expert guidance from the comfort of your own home, wherever you are.</p>
                    </div>
                    
                    <div class="flex flex-col items-end flex-shrink-0">
                      <span class="text-xl font-bold text-[var(--sage-green)]">$150</span>
                    </div>
                  </label>
                </div>

                <!-- In-Home Option -->
                <div class="relative group">
                  <input type="radio" name="service" id="service-in-home" value="in-home" class="peer hidden">
                  <label for="service-in-home"
                    class="block cursor-pointer bg-white border border-gray-200 rounded-xl shadow-sm transition-all duration-300
                    hover:-translate-y-0.5 hover:border-[var(--sage-green)]
                    peer-checked:border-[var(--sage-green)] peer-checked:bg-[var(--sage-green-light)]">
                    
                    <!-- Main Card Content -->
                    <div class="flex items-center gap-4 p-4">
                      <div class="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <i class="fas fa-home text-[var(--sage-green)] text-lg"></i>
                      </div>
                      
                      <div class="flex-1 text-left">
                        <h3 class="font-bold text-[var(--dark-heading)] text-base">In-Home Private Mobility Class <span class="font-normal text-gray-500">— 45 min</span></h3>
                        <p class="text-sm text-gray-500 mt-1">Personalized hands-on support delivered right to your doorstep.</p>
                      </div>
                      
                      <div class="flex flex-col items-end flex-shrink-0">
                        <span class="text-xl font-bold text-[var(--sage-green)]">$225</span>
                      </div>
                    </div>

                    <!-- Address Input (Hidden by default, shown when selected) -->
                    <div id="address-container" class="hidden border-t border-gray-200 p-4 pt-4 bg-white/50">
                      <h4 class="text-sm font-medium text-[var(--dark-heading)] mb-3">Your Address</h4>
                      <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <i class="fas fa-map-marker-alt text-[var(--sage-green)] opacity-50"></i>
                        </div>
                        <input 
                          type="text" 
                          id="address-input" 
                          placeholder="123 Maple Avenue, City, Zip"
                          class="form-input pl-12 text-gray-700 placeholder-gray-400"
                          autocomplete="off"
                        >
                      </div>
                      <div id="zone-feedback" class="hidden mt-3 p-3 rounded-lg flex items-center gap-3 text-sm font-medium transition-all duration-300 border shadow-sm"></div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- RIGHT PANEL: Calendar & Time Selection -->
          <div class="space-y-6">
            
            <!-- Calendar Card -->
            <div id="calendar-card" class="bg-white rounded-2xl shadow-lg p-6 border-2 border-transparent transition-all duration-300 opacity-30 pointer-events-none relative">
              <i id="calendar-check" class="hidden fas fa-check-circle text-2xl text-[var(--sage-green)] transition-all duration-300 absolute top-6 right-6"></i>
              <div class="mb-6 pb-2 border-b border-gray-50">
                <h3 class="text-lg font-semibold text-gray-800">Find Your Perfect Time</h3>
              </div>

              <!-- Placeholder Message -->
              <div id="calendar-placeholder" class="text-center py-12">
                <i class="fas fa-calendar-alt text-5xl text-gray-300 mb-4"></i>
                <p class="text-gray-500 font-medium">Select service and location above to see availability</p>
              </div>

              <!-- Calendar (Hidden initially) -->
              <div id="calendar-content" class="hidden">
                <!-- Month Navigation -->
                <div class="flex items-center justify-between mb-6">
                  <button id="prev-month" class="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <i class="fas fa-chevron-left text-gray-600"></i>
                  </button>
                  <h4 id="month-year" class="text-lg font-bold text-gray-800"></h4>
                  <button id="next-month" class="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <i class="fas fa-chevron-right text-gray-600"></i>
                  </button>
                </div>

                <!-- Calendar Grid -->
                <div class="grid grid-cols-7 gap-2 mb-4">
                  <div class="text-center text-xs font-semibold text-gray-500 py-2">Sun</div>
                  <div class="text-center text-xs font-semibold text-gray-500 py-2">Mon</div>
                  <div class="text-center text-xs font-semibold text-gray-500 py-2">Tue</div>
                  <div class="text-center text-xs font-semibold text-gray-500 py-2">Wed</div>
                  <div class="text-center text-xs font-semibold text-gray-500 py-2">Thu</div>
                  <div class="text-center text-xs font-semibold text-gray-500 py-2">Fri</div>
                  <div class="text-center text-xs font-semibold text-gray-500 py-2">Sat</div>
                </div>
                <div id="calendar-grid" class="grid grid-cols-7 gap-2"></div>

                <!-- Legend -->
                <div class="mt-8 flex items-center justify-center gap-6 text-[10px] uppercase tracking-wide font-bold text-gray-400 border-t border-gray-50 pt-4">
                  <div class="flex items-center gap-2"><div class="w-2 h-2 rounded-full bg-[var(--sage-green)]"></div> Available for You</div>
                </div>

                <!-- Time Slots -->
                <div id="time-slots-container" class="hidden mt-6">
                  <div class="text-center mb-6 sticky top-0 bg-white z-10 pb-2 border-b border-gray-50">
                    <h2 id="selected-date-header" class="text-lg font-bold text-[var(--dark-heading)]">Select Date</h2>
                  </div>
                  <div id="time-slots" class="grid grid-cols-2 gap-3 px-1"></div>
                </div>
              </div>
            </div>
            </div>
          </div>
          
          <!-- Desktop Buttons (inside card at bottom) -->
          <div class="hidden md:flex justify-end items-center mt-8 pt-6 border-t border-gray-100">
            <button id="btn-next" disabled class="bg-gray-200 text-gray-400 px-8 py-4 rounded-full font-semibold shadow-none cursor-not-allowed transition-all duration-300 flex items-center gap-2">
              Next: Details <i class="fas fa-arrow-right text-sm"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Sticky Mobile Footer -->
    <div class="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 shadow-lg z-50">
      <div class="px-4 py-4 pb-safe">
        <div id="mobile-summary" class="hidden mb-4 text-xs">
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
        <button id="btn-next-mobile" disabled class="w-full bg-gray-200 text-gray-400 px-6 py-4 rounded-full font-semibold shadow-none cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 text-sm min-h-[48px]">
          Next: Details <i class="fas fa-arrow-right text-xs"></i>
        </button>
      </div>
    </div>
    `;
  }

  setupListeners() {
    const API_BASE = window.ENV?.API_BASE || '';

    // Service Selection
    const serviceRadios = this.querySelectorAll('input[name="service"]');
    const serviceCard = this.querySelector('#service-card');
    const serviceCheck = this.querySelector('#service-check');
    const addressContainer = this.querySelector('#address-container');
    const addressInput = this.querySelector('#address-input');

    serviceRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        const previousSelection = window.bookingData.serviceType;


        // Set both service category and type based on selection
        window.bookingData.serviceCategory = 'mobility';
        window.bookingData.serviceType = radio.value; // 'in-home' or 'virtual'
        this.serviceSelected = true;
        this.locationSelected = true;

        // Calculate and set price
        const isInHome = radio.value === 'in-home';
        const isZone2 = window.bookingData.travelZone === 'zone2';
        if (isInHome) {
          const basePrice = 225;
          const travelFee = isZone2 ? 30 : 0;
          window.bookingData.price = basePrice + travelFee;
        } else {
          window.bookingData.price = 150;
        }

        // Show service checkmark only if conditions are met
        const serviceCheck = this.querySelector('#service-check');
        if (serviceCheck) {
          // For Virtual: always show checkmark
          // For In-Home: only show if address is valid
          if (radio.value === 'virtual' || (radio.value === 'in-home' && addressInput.dataset.valid === 'true')) {
            serviceCheck.classList.remove('hidden');
          } else {
            serviceCheck.classList.add('hidden');
          }
        }

        // Show/hide address input based on selection
        if (radio.value === 'in-home') {
          addressContainer.classList.remove('hidden');
          addressContainer.classList.add('animate-slide-down');

          // If switching from virtual to in-home and calendar is loaded, disable it until address is valid
          if (previousSelection === 'virtual' && this.calendarData) {
            const calendarCard = this.querySelector('#calendar-card');

            // Check if we have a valid address already
            if (!addressInput.dataset.valid || addressInput.dataset.valid !== 'true') {
              // No valid address, disable calendar
              calendarCard.classList.add('opacity-30', 'pointer-events-none');

              // Disable next buttons
              const nextBtn = this.querySelector('#btn-next');
              const nextBtnMobile = this.querySelector('#btn-next-mobile');
              if (nextBtn) {
                nextBtn.disabled = true;
                nextBtn.className = 'bg-gray-200 text-gray-400 px-8 py-4 rounded-full font-semibold shadow-none cursor-not-allowed transition-all duration-300 flex items-center gap-2 min-h-[48px]';
              }
              if (nextBtnMobile) {
                nextBtnMobile.disabled = true;
                nextBtnMobile.className = 'w-full bg-gray-200 text-gray-400 px-6 py-4 rounded-full font-semibold shadow-none cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 text-sm min-h-[48px]';
              }
            }
          }
        } else {
          // Virtual selected - hide address input
          addressContainer.classList.add('hidden');
        }

        // Enable calendar if not already loaded
        if (!this.calendarData) {
          this.checkIfReadyForCalendar();
        } else if (radio.value === 'virtual') {
          // Switching to virtual - clear travel zone and update footer
          window.bookingData.travelZone = null;
          this.updateMobileSummary();
          this.updateMobileFooterPricing(); // Update icon and price in footer
          // Re-enable calendar
          const calendarCard = this.querySelector('#calendar-card');
          calendarCard.classList.remove('opacity-30', 'pointer-events-none');
        } else if (radio.value === 'in-home' && addressInput.dataset.valid === 'true') {
          // Switching to in-home with valid address - restore travel zone and re-enable calendar
          if (window.bookingData.parentAddress) {
            const isManhattan = window.bookingData.parentAddress.toLowerCase().includes('manhattan') ||
              window.bookingData.parentAddress.toLowerCase().includes('new york');
            this.calculateDistance(window.bookingData.parentAddress, isManhattan);
          }
          this.updateMobileFooterPricing(); // Update icon and price in footer
          const calendarCard = this.querySelector('#calendar-card');
          calendarCard.classList.remove('opacity-30', 'pointer-events-none');
        } else if (radio.value === 'in-home') {
          // Just switched to in-home, update footer even without address
          this.updateMobileFooterPricing();
        }
      });
    });

    // Address Input with Google Places Autocomplete and Zone Calculation
    const initAutocomplete = () => {
      if (!addressInput || !window.google || !window.google.maps) return;

      const CHELSEA_ORIGIN = "10011, USA";

      // Initialize autocomplete
      const autocomplete = new google.maps.places.Autocomplete(addressInput, {
        componentRestrictions: { country: "us" },
        fields: ["geometry", "formatted_address", "address_components"]
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) {
          addressInput.dataset.valid = 'false';
          this.showZoneFeedback('Please select a valid address from the list.', 'error');
          return;
        }

        let isManhattan = false;
        if (place.address_components) {
          for (const c of place.address_components) {
            if (c.long_name === 'New York County' || c.long_name === 'Manhattan') {
              isManhattan = true;
            }
          }
        }
        this.calculateDistance(place.formatted_address, isManhattan);
      });

      // Listen for manual input changes to invalidate selection
      addressInput.addEventListener('input', () => {
        // Mark address as invalid when user types
        addressInput.dataset.valid = 'false';

        // Hide service checkmark since In-Home requires valid address
        const serviceCheck = this.querySelector('#service-check');
        if (serviceCheck) {
          serviceCheck.classList.add('hidden');
        }

        // Disable calendar and next button if a time was selected
        if (this.selectedSlot) {
          const calendarCard = this.querySelector('#calendar-card');
          const nextBtn = this.querySelector('#btn-next');
          const nextBtnMobile = this.querySelector('#btn-next-mobile');

          calendarCard.classList.add('opacity-30', 'pointer-events-none');

          if (nextBtn) {
            nextBtn.disabled = true;
            nextBtn.className = 'bg-gray-200 text-gray-400 px-8 py-4 rounded-full font-semibold shadow-none cursor-not-allowed transition-all duration-300 flex items-center gap-2 min-h-[48px]';
          }
          if (nextBtnMobile) {
            nextBtnMobile.disabled = true;
            nextBtnMobile.className = 'w-full bg-gray-200 text-gray-400 px-6 py-4 rounded-full font-semibold shadow-none cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 text-sm min-h-[48px]';
          }

          // Clear the selected slot
          this.selectedSlot = null;
        }

        // Hide zone feedback
        const zoneFeedback = this.querySelector('#zone-feedback');
        if (zoneFeedback) {
          zoneFeedback.classList.add('hidden');
        }
      });
    };

    // Initialize autocomplete if Google Maps is already loaded, otherwise wait for it
    if (addressInput) {
      if (window.google && window.google.maps) {
        initAutocomplete();
      } else {
        document.addEventListener('google-maps-loaded', initAutocomplete);
      }
    }

    // Calendar Navigation
    this.querySelector('#prev-month')?.addEventListener('click', () => this.changeMonth(-1));
    this.querySelector('#next-month')?.addEventListener('click', () => this.changeMonth(1));

    // Next Button Click Handlers (both desktop and mobile)
    const handleNextClick = () => {
      if (!this.selectedSlot) return;
      console.log('[StepServiceSchedule] Dispatching step-complete event');
      this.dispatchEvent(new CustomEvent('step-complete', {
        bubbles: true,
        composed: true,
        detail: { step: 0 }
      }));
    };

    const nextBtn = this.querySelector('#btn-next');
    const nextBtnMobile = this.querySelector('#btn-next-mobile');

    if (nextBtn) {
      nextBtn.addEventListener('click', handleNextClick);
      console.log('[StepServiceSchedule] Desktop Next button listener attached');
    }
    if (nextBtnMobile) {
      nextBtnMobile.addEventListener('click', handleNextClick);
      console.log('[StepServiceSchedule] Mobile Next button listener attached');
    }
  }

  checkIfReadyForCalendar() {
    const calendarCard = this.querySelector('#calendar-card');
    const addressInput = this.querySelector('#address-input');

    if (this.serviceSelected && this.locationSelected) {
      // If in-home is selected, require valid address
      if (window.bookingData.serviceType === 'in-home') {
        if (addressInput && addressInput.dataset.valid === 'true') {
          // Valid address entered, enable calendar
          calendarCard.classList.remove('opacity-30', 'pointer-events-none');
          calendarCard.classList.add('animate-fade-in');
          this.loadCalendar();
        } else {
          // No valid address yet, keep calendar disabled
          calendarCard.classList.add('opacity-30', 'pointer-events-none');
          calendarCard.classList.remove('animate-fade-in');
        }
      } else {
        // Virtual visit - no address needed, enable calendar
        calendarCard.classList.remove('opacity-30', 'pointer-events-none');
        calendarCard.classList.add('animate-fade-in');
        this.loadCalendar();
      }
    }
  }

  async loadCalendar() {
    if (this.calendarData) return;

    const API_BASE = window.ENV?.API_BASE || '';
    console.log('[DEBUG] Loading calendar...');
    console.log('[DEBUG] API_BASE:', API_BASE);
    console.log('[DEBUG] Hostname:', window.location.hostname);
    console.log('[DEBUG] Full URL:', `${API_BASE}/api/booking/slots`);

    const placeholder = this.querySelector('#calendar-placeholder');
    const content = this.querySelector('#calendar-content');

    try {
      const response = await fetch(`${API_BASE}/api/booking/slots`);
      this.calendarData = await response.json();

      // Hide placeholder, show calendar
      placeholder.classList.add('hidden');
      content.classList.remove('hidden');

      // Initialize calendar
      this.currentDate = new Date();
      this.renderCalendar();

      // Auto-select first available date
      this.autoSelectFirstAvailableDate();

    } catch (error) {
      console.error('[StepServiceSchedule] Error loading calendar:', error);
      placeholder.innerHTML = '<p class="text-red-500">Error loading availability. Please refresh.</p>';
    }
  }

  autoSelectFirstAvailableDate() {
    // Find the first date with available slots
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all dates sorted
    const availableDates = Object.keys(this.calendarData)
      .filter(dateStr => {
        const dayData = this.calendarData[dateStr];
        return dayData && dayData.status === 'available' && dayData.slots && dayData.slots.length > 0;
      })
      .sort();

    // Find first date that is today or later
    const firstAvailableDate = availableDates.find(dateStr => {
      const date = new Date(dateStr + 'T00:00:00');
      return date >= today;
    });

    if (firstAvailableDate) {
      // Auto-select this date
      this.selectDate(firstAvailableDate);
    }
  }

  renderCalendar() {
    const monthYear = this.querySelector('#month-year');
    const grid = this.querySelector('#calendar-grid');

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    monthYear.textContent = `${monthNames[month]} ${year}`;

    // Clear grid
    grid.innerHTML = '';

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      const emptyCell = document.createElement('div');
      grid.appendChild(emptyCell);
    }

    // Add day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayData = this.calendarData[dateStr];
      const hasSlots = dayData && dayData.status === 'available' && dayData.slots && dayData.slots.length > 0;
      const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
      const isSelected = this.selectedDate === dateStr;

      const dayCell = document.createElement('button');
      dayCell.textContent = day;
      dayCell.className = "h-10 w-10 mx-auto flex items-center justify-center rounded-full text-sm font-medium transition-all duration-200 relative";

      if (!hasSlots) {
        // Unavailable
        dayCell.classList.add('text-gray-300', 'cursor-not-allowed');
        dayCell.disabled = true;
      } else {
        // Available
        dayCell.classList.add('text-gray-600', 'hover:bg-[var(--sage-green-light)]', 'hover:text-[var(--sage-green)]', 'font-semibold');

        // Dot indicator
        const dot = document.createElement('div');
        dot.className = "absolute bottom-1 w-1 h-1 rounded-full bg-[var(--sage-green)]";
        dayCell.appendChild(dot);

        if (isSelected) {
          dayCell.classList.remove('text-gray-600', 'hover:bg-[var(--sage-green-light)]', 'hover:text-[var(--sage-green)]');
          dayCell.classList.add('bg-[var(--sage-green)]', 'text-white', 'shadow-md', 'transform', 'scale-105');
          dot.style.display = 'none';
        }

        dayCell.addEventListener('click', () => this.selectDate(dateStr));
      }

      grid.appendChild(dayCell);
    }
  }

  selectDate(dateStr) {
    this.selectedDate = dateStr;
    this.renderCalendar();

    const dayData = this.calendarData[dateStr];
    const slots = dayData?.slots || [];

    // Show time slots
    const container = this.querySelector('#time-slots-container');
    const slotsDiv = this.querySelector('#time-slots');
    const header = this.querySelector('#selected-date-header');

    container.classList.remove('hidden');
    slotsDiv.innerHTML = '';

    // Format date header
    const dObj = new Date(dateStr + 'T12:00:00');
    header.textContent = dObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    if (slots.length === 0) {
      slotsDiv.innerHTML = '<div class="text-center text-gray-400 py-10">No available times.</div>';
      return;
    }

    slots.forEach(timeStr => {
      // timeStr is like "09:00" or "14:30"
      const btn = document.createElement('button');

      // Format time to 12-hour with AM/PM
      const [h, m] = timeStr.split(':');
      let hour = parseInt(h);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      if (hour > 12) hour -= 12;
      if (hour === 0) hour = 12;
      const displayTime = `${hour}:${m} ${ampm}`;

      btn.textContent = displayTime;
      // Match original StepSchedule styling
      btn.className = 'w-full py-3 px-6 text-center border border-gray-100 bg-white text-gray-600 rounded-xl hover:border-[var(--sage-green)] hover:text-[var(--sage-green)] hover:bg-[var(--sage-green-light)] transition-all font-medium text-sm shadow-sm';
      btn.addEventListener('click', (event) => this.selectSlot(dateStr, timeStr, displayTime, event.target));
      slotsDiv.appendChild(btn);
    });
  }

  selectSlot(dateStr, timeStr, displayTime, targetButton) {
    this.selectedSlot = { date: dateStr, time: timeStr };

    // Calculate end time (45 minutes later)
    const [h, m] = timeStr.split(':');
    const startMinutes = parseInt(h) * 60 + parseInt(m);
    const endMinutes = startMinutes + 45;
    const endHour = Math.floor(endMinutes / 60);
    const endMin = endMinutes % 60;
    const endTimeStr = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

    // Store in ISO format
    window.bookingData.startTime = `${dateStr}T${timeStr}:00`;
    window.bookingData.endTime = `${dateStr}T${endTimeStr}:00`;
    // Update UI - reset all buttons then highlight selected
    this.querySelectorAll('#time-slots button').forEach(btn => {
      btn.className = 'w-full py-3 px-6 text-center border border-gray-100 bg-white text-gray-600 rounded-xl hover:border-[var(--sage-green)] hover:text-[var(--sage-green)] hover:bg-[var(--sage-green-light)] transition-all font-medium text-sm shadow-sm';
    });
    // Store selected slot
    this.selectedSlot = { date: dateStr, time: timeStr };

    // Save to global state
    window.bookingData.startTime = `${dateStr}T${timeStr}:00`;
    window.bookingData.endTime = `${dateStr}T${endTimeStr}:00`;
    window.bookingData.appointmentDate = dateStr;

    // Active style - match original
    targetButton.className = 'w-full py-3 px-6 text-center border border-[var(--sage-green)] bg-[var(--sage-green)] text-white rounded-xl shadow-md transform scale-[1.02] transition-all font-bold text-sm';

    // Enable both desktop and mobile next buttons with sage green styling
    const nextBtn = this.querySelector('#btn-next');
    const nextBtnMobile = this.querySelector('#btn-next-mobile');

    if (nextBtn) {
      nextBtn.disabled = false;
      nextBtn.className = 'bg-[var(--sage-green)] text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer transition-all duration-300 flex items-center gap-2';
    }

    if (nextBtnMobile) {
      nextBtnMobile.disabled = false;
      nextBtnMobile.className = 'w-full bg-[var(--sage-green)] text-white px-6 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 text-sm min-h-[48px]';
    }

    // Update mobile summary
    this.updateMobileSummary();

    // Show calendar checkmark
    const calendarCheck = this.querySelector('#calendar-check');
    if (calendarCheck) {
      calendarCheck.classList.remove('hidden');
    }
  }

  updateMobileSummary() {
    // Use shared utility for consistent mobile summary updates
    updateMobileSummaryUtil(this);

    // Update pricing and travel fee note
    this.updateMobileFooterPricing();

    // Show summary if time is selected
    const mobileSummary = this.querySelector('#mobile-summary');
    if (this.selectedSlot && mobileSummary) {
      mobileSummary.classList.remove('hidden');
    }
  }

  updateMobileFooterPricing() {
    console.log('[DEBUG] updateMobileFooterPricing called');
    console.log('[DEBUG] window.bookingData:', window.bookingData);
    // Update service icon, price, and total when service type changes
    const mobileServiceIcon = this.querySelector('#mobile-service-icon');
    const mobileServicePrice = this.querySelector('#mobile-service-price');
    const mobileTotal = this.querySelector('#mobile-total');
    const mobilePriceBreakdown = this.querySelector('#mobile-price-breakdown');

    const serviceType = window.bookingData.serviceType;
    const isInHome = serviceType === 'in-home';
    const isZone2 = window.bookingData.travelZone === 'zone2';

    // Calculate base pricing
    let basePrice, travelFee, calculatedTotal;
    if (isInHome) {
      basePrice = 225;
      travelFee = isZone2 ? 30 : 0;
      calculatedTotal = basePrice + travelFee;
    } else {
      basePrice = 150;
      travelFee = 0;
      calculatedTotal = 150;
    }

    // Use bookingData.price if it exists (preserves discount), otherwise use calculated
    const total = window.bookingData.price || calculatedTotal;

    console.log('[DEBUG] Pricing values:', {
      basePrice,
      travelFee,
      calculatedTotal,
      'bookingData.price': window.bookingData.price,
      'bookingData.promoCode': window.bookingData.promoCode,
      'bookingData.discountAmount': window.bookingData.discountAmount,
      'final total': total
    });

    // Update icon
    if (mobileServiceIcon) {
      mobileServiceIcon.className = isInHome
        ? 'fas fa-home text-gray-400'
        : 'fas fa-video text-gray-400';
    }

    // Update service price
    if (mobileServicePrice) {
      mobileServicePrice.textContent = `$${basePrice}`;
    }

    // Update total
    if (mobileTotal) {
      mobileTotal.textContent = `$${total}`;
    }

    // Build price breakdown
    if (mobilePriceBreakdown) {
      const breakdown = [];
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
  }

  restoreNextButtonIfTimeSelected() {
    // Check if there's a selected time slot in the UI
    const selectedTimeButton = this.querySelector('#time-slots button.border-\\[var\\(--sage-green\\)\\]');
    if (selectedTimeButton && window.bookingData.appointmentDate && window.bookingData.appointmentTime) {
      // Restore the selectedSlot object
      this.selectedSlot = {
        date: window.bookingData.appointmentDate,
        time: window.bookingData.appointmentTime
      };

      // Re-enable both Next buttons
      const nextBtn = this.querySelector('#btn-next');
      const nextBtnMobile = this.querySelector('#btn-next-mobile');

      if (nextBtn) {
        nextBtn.disabled = false;
        nextBtn.className = 'bg-[var(--sage-green)] text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer transition-all duration-300 flex items-center gap-2 min-h-[48px]';
      }
      if (nextBtnMobile) {
        nextBtnMobile.disabled = false;
        nextBtnMobile.className = 'w-full bg-[var(--sage-green)] text-white px-6 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 text-sm min-h-[48px]';
      }

      // Show service checkmark
      const serviceCheck = this.querySelector('#service-check');
      if (serviceCheck) {
        serviceCheck.classList.remove('hidden');
      }
    }
  }

  convertTo24Hour(time12h) {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');

    if (hours === '12') {
      hours = '00';
    }

    if (modifier === 'PM') {
      hours = parseInt(hours, 10) + 12;
    }

    return `${String(hours).padStart(2, '0')}:${minutes}`;
  }

  changeMonth(delta) {
    this.currentDate.setMonth(this.currentDate.getMonth() + delta);
    this.renderCalendar();
  }

  calculateDistance(destination, isManhattan) {
    if (!window.google) return;

    const CHELSEA_ORIGIN = "10011, USA";
    const service = new google.maps.DistanceMatrixService();
    const addressInput = this.querySelector('#address-input');

    this.showZoneFeedback('Checking availability at this location...', 'info');

    const timeoutId = setTimeout(() => {
      this.showZoneFeedback('Calculation timed out. Please try again.', 'error');
    }, 5000);

    service.getDistanceMatrix({
      origins: [CHELSEA_ORIGIN],
      destinations: [destination],
      travelMode: google.maps.TravelMode.WALKING,
      unitSystem: google.maps.UnitSystem.IMPERIAL
    }, (response, status) => {
      clearTimeout(timeoutId);

      if (status !== 'OK' || !response || !response.rows || response.rows.length === 0) {
        this.showZoneFeedback('Error calculating distance.', 'error');
        return;
      }

      const element = response.rows[0].elements[0];
      if (element.status !== 'OK') {
        if (element.status === 'ZERO_RESULTS') {
          this.showZoneFeedback("We couldn't find a route to this address. Is it typed correctly?", 'error');
        } else {
          this.showZoneFeedback(`Route error: ${element.status}`, 'error');
        }
        return;
      }

      const minutes = element.duration.value / 60;
      const basePrice = 150; // Base price for mobility class

      if (minutes <= 30) {
        // Zone 1
        window.bookingData.parentAddress = destination;
        window.bookingData.travelZone = 'zone1';
        window.bookingData.price = 225; // In-home base price, no travel fee
        addressInput.dataset.valid = 'true';
        this.showZoneFeedback('Great news! You are in our primary service area.', 'success');
        this.updateMobileSummary(); // Update footer
        this.checkIfReadyForCalendar(); // Enable calendar after valid address
        this.restoreNextButtonIfTimeSelected(); // Re-enable button if time was selected

        // Show checkmark for completed In-Home selection
        const serviceCheck = this.querySelector('#service-check');
        if (serviceCheck) {
          serviceCheck.classList.remove('hidden');
        }
      } else if (isManhattan) {
        // Zone 2
        window.bookingData.parentAddress = destination;
        window.bookingData.travelZone = 'zone2';
        window.bookingData.price = 255; // In-home base price + $30 travel fee
        addressInput.dataset.valid = 'true';
        this.showZoneFeedback('We can visit you! Just a heads up, a travel fee ($30) will be added for this location.', 'warning');
        this.updateMobileSummary(); // Update footer
        this.checkIfReadyForCalendar(); // Enable calendar after valid address
        this.restoreNextButtonIfTimeSelected(); // Re-enable button if time was selected

        // Show checkmark for completed In-Home selection
        const serviceCheck = this.querySelector('#service-check');
        if (serviceCheck) {
          serviceCheck.classList.remove('hidden');
        }
      } else {
        // Zone 3 - Outside service area
        addressInput.dataset.valid = 'false';
        window.bookingData.travelZone = null;
        this.updateMobileSummary(); // Update footer
        this.showZoneFeedback('That address is outside our travel radius, but we can still support you! Please select Virtual Visit instead.', 'denial');
      }
    });
  }

  showZoneFeedback(msg, type) {
    const feedbackDiv = this.querySelector('#zone-feedback');
    if (!feedbackDiv) return;

    feedbackDiv.innerHTML = '';
    feedbackDiv.className = "mt-4 p-4 rounded-lg flex items-center gap-3 text-sm font-medium transition-all duration-300 border shadow-sm";

    let iconHtml = '';
    if (type === 'success') {
      feedbackDiv.style.backgroundColor = '#F0F7F4';
      feedbackDiv.style.borderColor = '#9BB5A6';
      feedbackDiv.style.color = '#2D3E36';
      iconHtml = `<div class="min-w-[20px] text-[var(--sage-green)]"><i class="fas fa-check-circle text-lg"></i></div>`;
    } else if (type === 'warning') {
      feedbackDiv.style.backgroundColor = '#FFFDF5';
      feedbackDiv.style.borderColor = '#E5E1D6';
      feedbackDiv.style.color = '#5C5446';
      iconHtml = `<div class="min-w-[20px] text-[#A69578]"><i class="fas fa-car text-lg"></i></div>`;
    } else if (type === 'denial') {
      feedbackDiv.style.backgroundColor = '#FFF5F5';
      feedbackDiv.style.borderColor = '#FED7D7';
      feedbackDiv.style.color = '#9B2C2C';
      iconHtml = `<div class="min-w-[20px] text-[#E53E3E]"><i class="fas fa-video text-lg"></i></div>`;
    } else if (type === 'info') {
      feedbackDiv.classList.add('bg-blue-50', 'text-blue-800', 'border-blue-200');
      iconHtml = `<div class="min-w-[20px] text-blue-500"><i class="fas fa-info-circle text-lg"></i></div>`;
    } else {
      feedbackDiv.classList.add('bg-red-50', 'text-red-800', 'border-red-100');
      iconHtml = `<div class="min-w-[20px] text-red-500"><i class="fas fa-exclamation-circle text-lg"></i></div>`;
    }

    feedbackDiv.innerHTML = iconHtml + `<div class="leading-relaxed">${msg}</div>`;
    feedbackDiv.classList.remove('hidden');
  }

  restoreSelectedSlotUI() {
    // Restore the selected time slot UI and next button state
    if (!this.selectedSlot) return;

    const { date, time } = this.selectedSlot;

    // Re-render the calendar to show the selected date
    this.selectedDate = date;
    this.renderCalendar();

    // Call selectDate to render time slots
    this.selectDate(date);

    // Wait for time slots to render
    setTimeout(() => {
      // Find and highlight the selected time slot button
      const timeSlots = this.querySelectorAll('#time-slots button');
      timeSlots.forEach(btn => {
        // Reset all buttons
        btn.className = 'w-full py-3 px-6 text-center border border-gray-100 bg-white text-gray-600 rounded-xl hover:border-[var(--sage-green)] hover:text-[var(--sage-green)] hover:bg-[var(--sage-green-light)] transition-all font-medium text-sm shadow-sm';

        // Check if this button matches the selected time
        const btnText = btn.textContent.trim();
        const [h, m] = time.split(':');
        let hour = parseInt(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        if (hour > 12) hour -= 12;
        if (hour === 0) hour = 12;
        const displayTime = `${hour}:${m} ${ampm}`;

        if (btnText === displayTime) {
          // Highlight this button
          btn.className = 'w-full py-3 px-6 text-center border border-[var(--sage-green)] bg-[var(--sage-green)] text-white rounded-xl shadow-md transform scale-[1.02] transition-all font-bold text-sm';
        }
      });

      // Re-enable the next button
      const nextBtn = this.querySelector('#btn-next');
      const nextBtnMobile = this.querySelector('#btn-next-mobile');
      if (nextBtn) {
        nextBtn.disabled = false;
        nextBtn.className = 'bg-[var(--sage-green)] text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer transition-all duration-300 flex items-center gap-2';
      }
      if (nextBtnMobile) {
        nextBtnMobile.disabled = false;
        nextBtnMobile.className = 'w-full bg-[var(--sage-green)] text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 text-sm';
      }

      // Update calendar checkmark (no border)
      const calendarCheck = this.querySelector('#calendar-check');
      if (calendarCheck) {
        calendarCheck.classList.remove('text-gray-300');
        calendarCheck.classList.add('text-[var(--sage-green)]');
      }

      // Update mobile summary
      const mobileSummary = this.querySelector('#mobile-summary');
      const mobileDate = this.querySelector('#mobile-date');
      console.log('[Mobile Footer Debug] mobileSummary:', mobileSummary);
      console.log('[Mobile Footer Debug] mobileDate:', mobileDate);
      console.log('[Mobile Footer Debug] date from selectedSlot:', date);
      console.log('[Mobile Footer Debug] displayTime:', displayTime);
      if (mobileSummary && mobileDate) {
        const dateObj = new Date(date); // Use the 'date' from selectedSlot
        console.log('[Mobile Footer Debug] dateObj:', dateObj);
        const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        console.log('[Mobile Footer Debug] formattedDate:', formattedDate);
        const finalText = `${formattedDate} at ${displayTime} (45m)`;
        console.log('[Mobile Footer Debug] Setting mobileDate.textContent to:', finalText);
        mobileDate.textContent = finalText;
        mobileSummary.classList.remove('hidden');
      }
    }, 100);
  }

  updateDisplay() {
    console.log('[StepServiceSchedule] updateDisplay called');
    // Restore state if returning to this step
    if (window.bookingData.serviceCategory) {
      const radio = this.querySelector(`input[name="service"][value="${window.bookingData.serviceCategory}"]`);
      if (radio) radio.click();
    }

    if (window.bookingData.serviceType) {
      const radio = this.querySelector(`input[name="location"][value="${window.bookingData.serviceType}"]`);
      if (radio) radio.click();
    }

    // Update mobile footer pricing (preserves discount)
    this.updateMobileFooterPricing();
  }
}

customElements.define('step-service-schedule', StepServiceSchedule);
