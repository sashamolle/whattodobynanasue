export class StepSchedule extends HTMLElement {
    connectedCallback() {
        this.render();
        this.state = {
            calendarData: {},
            currentMonthDate: new Date(),
            selectedDateStr: null,
            slots: []
        };
        // Init
        this.setupListeners();
        // Auto-load if visible? Or wait for "show" event?
        // Since components are hidden/shown via CSS, existing DOM is live.
        // We can trigger initCalendar when connected, but better lazily or if visible.
        // For simplicity, we can just init. 
        this.initCalendar();
    }

    render() {
        this.innerHTML = `
        <h2 class="text-2xl font-bold text-gray-800 mb-2">Select a Time</h2>
        <p class="text-gray-500 mb-6">Choose a date and time for your in-home visit.</p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          <!-- Calendar Grid -->
          <div id="calendar-wrapper" class="border-0 rounded-2xl p-6 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
             <div class="flex justify-between items-center mb-6">
                <button type="button" id="cal-prev" class="p-2 hover:bg-gray-50 rounded-full text-gray-400 hover:text-gray-800 disabled:opacity-30">
                  <i class="fas fa-chevron-left text-sm"></i>
                </button>
                <h3 id="cal-month-title" class="font-bold text-lg text-gray-800 font-[Poppins]">Loading...</h3>
                <button type="button" id="cal-next" class="p-2 hover:bg-gray-50 rounded-full text-gray-400 hover:text-gray-800">
                  <i class="fas fa-chevron-right text-sm"></i>
                </button>
             </div>

             <!-- Days Header -->
             <div class="grid grid-cols-7 gap-y-4 gap-x-1 mb-2 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest font-[Poppins]">
                <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
             </div>

             <!-- Grid -->
             <div id="cal-grid" class="grid grid-cols-7 gap-y-2 gap-x-1"></div>

             <!-- Legend -->
             <div class="mt-6 flex items-center justify-center gap-6 text-[10px] uppercase tracking-wide font-bold text-gray-400">
               <div class="flex items-center gap-2"><div class="w-1.5 h-1.5 rounded-full bg-[var(--sage-green)]"></div> Available</div>
               <div class="flex items-center gap-2"><div class="w-1.5 h-1.5 rounded-full bg-gray-200"></div> Booked</div>
             </div>
          </div>

          <!-- Time Slots Panel -->
          <div id="time-panel" class="hidden bg-gray-50 rounded-2xl p-6 h-full min-h-[400px] flex flex-col justify-center">
             <div class="text-center mb-6">
               <h2 id="selected-date-header" class="text-xl font-bold text-gray-800">Select Date</h2>
             </div>
             <div id="slots-container" class="space-y-3 px-4 max-h-[350px] overflow-y-auto custom-scrollbar">
                <!-- Slots injected here -->
             </div>
          </div>

        </div>

        <div class="mt-8 flex justify-between">
            <button type="button" id="btn-step-3-back" class="btn-secondary border-gray-300 text-gray-500 hover:bg-gray-50">
              Back
            </button>
            <button type="button" id="btn-step-3-next" class="btn-primary hidden">
              Next: Payment <i class="fas fa-credit-card ml-2"></i>
            </button>
        </div>
      `;
    }

    setupListeners() {
        this.querySelector('#cal-prev').onclick = () => this.changeMonth(-1);
        this.querySelector('#cal-next').onclick = () => this.changeMonth(1);

        this.querySelector('#btn-step-3-back').onclick = () => {
            this.dispatchEvent(new CustomEvent('step-back', {
                detail: { step: 3 },
                bubbles: true,
                composed: true
            }));
        };

        this.querySelector('#btn-step-3-next').onclick = () => {
            if (!window.bookingData.startTime) {
                alert("Please select a time slot.");
                return;
            }
            this.dispatchEvent(new CustomEvent('step-complete', {
                detail: { step: 3 },
                bubbles: true,
                composed: true
            }));
        };
    }

    async initCalendar() {
        console.log("[StepSchedule] Initializing Calendar...");
        const grid = this.querySelector('#cal-grid');

        // API Base
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        // Note: window.API_BASE is now guaranteed by head script, but we keep fallback just in case
        const API_BASE = (typeof window.API_BASE !== 'undefined') ? window.API_BASE : (isLocal ? 'http://localhost:3001' : '');

        console.log(`[StepSchedule] Fetching slots from: ${API_BASE}/api/booking/slots`);

        grid.innerHTML = '<div class="col-span-7 py-8 text-center text-gray-400"><i class="fas fa-circle-notch fa-spin"></i> Loading availability...</div>';

        try {
            const res = await fetch(`${API_BASE}/api/booking/slots`);
            console.log(`[StepSchedule] Response status: ${res.status}`);

            if (!res.ok) {
                const txt = await res.text();
                throw new Error(`Server returned ${res.status}: ${txt}`);
            }

            this.state.calendarData = await res.json();
            console.log(`[StepSchedule] Loaded ${Object.keys(this.state.calendarData).length} days of availability.`);

            // Auto-Jump Logic
            const firstAvail = Object.entries(this.state.calendarData).find(([k, v]) => v.status === 'available');
            if (firstAvail) {
                const [y, m, d] = firstAvail[0].split('-');
                this.state.currentMonthDate = new Date(parseInt(y), parseInt(m) - 1, 1);
            }
            this.renderMonth();

        } catch (err) {
            console.error("[StepSchedule] Calendar Error", err);
            grid.innerHTML = `
                <div class="col-span-7 text-center text-red-500 text-xs p-4 bg-red-50 rounded">
                    <p class="font-bold">Failed to load calendar.</p>
                    <p class="font-mono mt-1">${err.message}</p>
                    <button onclick="this.closest('step-schedule').initCalendar()" class="mt-2 text-blue-500 underline">Retry</button>
                </div>`;
        }
    }

    changeMonth(offset) {
        this.state.currentMonthDate.setMonth(this.state.currentMonthDate.getMonth() + offset);
        this.renderMonth();
    }

    renderMonth() {
        const { currentMonthDate, calendarData, selectedDateStr } = this.state;
        const year = currentMonthDate.getFullYear();
        const month = currentMonthDate.getMonth();
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        this.querySelector('#cal-month-title').textContent = `${monthNames[month]} ${year}`;

        const grid = this.querySelector('#cal-grid');
        grid.innerHTML = '';

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay();

        // Padding
        for (let i = 0; i < startDayOfWeek; i++) {
            grid.appendChild(document.createElement('div'));
        }

        // Days
        for (let day = 1; day <= daysInMonth; day++) {
            const dStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            const btn = document.createElement('button');
            btn.textContent = day;
            btn.className = "h-10 w-10 mx-auto flex items-center justify-center rounded-full text-sm font-medium transition-all duration-200";

            const dayData = calendarData[dStr];

            if (!dayData || dayData.status === 'unavailable' || dayData.status === 'full') {
                btn.classList.add('text-gray-300', 'cursor-not-allowed');
                btn.disabled = true;
            } else {
                btn.classList.add('text-[var(--sage-green)]', 'bg-[var(--sage-green)]/10', 'hover:bg-[var(--sage-green)]', 'hover:text-white', 'font-bold');
                if (selectedDateStr === dStr) {
                    btn.classList.remove('bg-[var(--sage-green)]/10', 'text-[var(--sage-green)]');
                    btn.classList.add('bg-[var(--sage-green)]', 'text-white', 'shadow-md', 'transform', 'scale-110');
                }
                btn.onclick = () => this.selectDate(dStr);
            }
            grid.appendChild(btn);
        }
    }

    selectDate(dStr) {
        this.state.selectedDateStr = dStr;
        this.renderMonth();
        this.renderSlots(dStr);
    }

    renderSlots(dStr) {
        const panel = this.querySelector('#time-panel');
        const container = this.querySelector('#slots-container');
        const header = this.querySelector('#selected-date-header');
        const nextBtn = this.querySelector('#btn-step-3-next');

        panel.classList.remove('hidden');
        nextBtn.classList.add('hidden'); // Hide until slot picked

        const dObj = new Date(dStr + "T12:00:00");
        header.textContent = dObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

        container.innerHTML = '';
        const slots = this.state.calendarData[dStr].slots || [];

        if (slots.length === 0) {
            container.innerHTML = `<div class="text-center text-gray-400 py-10">No available times.</div>`;
            return;
        }

        slots.forEach(timeStr => {
            const btn = document.createElement('button');
            // Format 09:00 -> 9:00 AM
            const [h, m] = timeStr.split(':');
            const hr = parseInt(h);
            const ampm = hr >= 12 ? 'PM' : 'AM';
            const dh = hr > 12 ? hr - 12 : (hr === 0 ? 12 : hr);

            btn.textContent = `${dh}:${m} ${ampm}`;
            btn.className = "w-full py-3 px-6 text-center border-2 border-transparent bg-gray-50 text-gray-600 rounded-lg hover:border-[var(--sage-green)] hover:text-[var(--sage-green)] transition-all font-semibold text-sm";

            btn.onclick = () => {
                // Reset others
                Array.from(container.children).forEach(c => c.className = "w-full py-3 px-6 text-center border-2 border-transparent bg-gray-50 text-gray-600 rounded-lg hover:border-[var(--sage-green)] hover:text-[var(--sage-green)] transition-all font-semibold text-sm");
                // Active
                btn.className = "w-full py-3 px-6 text-center border-2 border-[var(--sage-green)] bg-[var(--sage-green)] text-white rounded-lg shadow-lg transform scale-[1.02] transition-all font-bold text-sm";

                // Save
                // Raw Time "09:30" + Date "2025-01-01" -> ISO Logic
                // As determined in previous fix, we send "YYYY-MM-DDTHH:mm:00" without Z.
                window.bookingData.startTime = `${dStr}T${timeStr}:00`;

                // End time +45m logic?
                // The backend might expect endTime too.
                // Logic: Start Date object -> add 45m -> format back
                // Using local Date math is tricky with crossing DST/boundaries if not careful, but simple 45m usually safe.
                const sDate = new Date(window.bookingData.startTime);
                // Wait, new Date("2025-01-01T09:00:00") in Browser is Local Wall Time.
                // Add 45 mins
                sDate.setMinutes(sDate.getMinutes() + 45);

                // Format back to "YYYY-MM-DDTHH:mm:00"
                const ey = sDate.getFullYear();
                const em = (sDate.getMonth() + 1).toString().padStart(2, '0');
                const ed = sDate.getDate().toString().padStart(2, '0');
                const eh = sDate.getHours().toString().padStart(2, '0');
                const emm = sDate.getMinutes().toString().padStart(2, '0');
                window.bookingData.endTime = `${ey}-${em}-${ed}T${eh}:${emm}:00`;

                // Show Next Button
                nextBtn.classList.remove('hidden');
            };
            container.appendChild(btn);
        });
    }
}
customElements.define('step-schedule', StepSchedule);
