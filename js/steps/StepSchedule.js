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
        this.initCalendar();
    }

    render() {
        this.innerHTML = `
        <div class="fade-in max-w-4xl mx-auto">
            <div class="text-center mb-10">
                <h2 class="text-3xl font-bold text-[var(--dark-heading)] mb-3">Select a Time</h2>
                <p class="text-gray-500">Choose a date and time that works best for your family.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            <!-- Calendar Grid -->
            <div id="calendar-wrapper" class="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div class="flex justify-between items-center mb-6">
                    <button type="button" id="cal-prev" class="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded-full text-gray-400 hover:text-[var(--dark-heading)] disabled:opacity-30 transition-colors">
                    <i class="fas fa-chevron-left text-sm"></i>
                    </button>
                    <h3 id="cal-month-title" class="font-bold text-lg text-[var(--dark-heading)] font-[Poppins]">Loading...</h3>
                    <button type="button" id="cal-next" class="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded-full text-gray-400 hover:text-[var(--dark-heading)] transition-colors">
                    <i class="fas fa-chevron-right text-sm"></i>
                    </button>
                </div>

                <!-- Days Header -->
                <div class="grid grid-cols-7 gap-y-4 gap-x-1 mb-4 text-center text-[11px] font-bold text-gray-400 uppercase tracking-widest font-[Poppins]">
                    <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                </div>

                <!-- Grid -->
                <div id="cal-grid" class="grid grid-cols-7 gap-y-2 gap-x-1"></div>

                <!-- Legend -->
                <div class="mt-8 flex items-center justify-center gap-6 text-[10px] uppercase tracking-wide font-bold text-gray-400 border-t border-gray-50 pt-4">
                <div class="flex items-center gap-2"><div class="w-2 h-2 rounded-full bg-[var(--sage-green)]"></div> Available</div>
                <div class="flex items-center gap-2"><div class="w-2 h-2 rounded-full bg-gray-200"></div> Booked</div>
                </div>
            </div>

            <!-- Time Slots Panel -->
            <div id="time-panel" class="hidden bg-white border border-gray-100 rounded-2xl p-6 shadow-sm h-full min-h-[420px] flex flex-col relative">
                <div class="text-center mb-6 sticky top-0 bg-white z-10 pb-2 border-b border-gray-50">
                <h2 id="selected-date-header" class="text-xl font-bold text-[var(--dark-heading)]">Select Date</h2>
                <p class="text-xs text-gray-400 font-medium uppercase tracking-wide mt-1">Available Times</p>
                </div>
                <div id="slots-container" class="space-y-3 px-1 overflow-y-auto custom-scrollbar flex-grow">
                    <!-- Slots injected here -->
                </div>
            </div>

            <!-- Placeholder for when no date is selected -->
            <div id="time-panel-placeholder" class="bg-gray-50 border border-gray-100 rounded-2xl p-6 h-full min-h-[420px] flex flex-col justify-center items-center text-center">
                <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                    <i class="far fa-calendar-alt text-2xl text-gray-300"></i>
                </div>
                <p class="text-gray-500 font-medium">Select a date to see available times</p>
            </div>

            </div>

            <div class="mt-10 flex justify-between items-center pt-6 border-t border-gray-100">
                <button type="button" id="btn-step-3-back" 
                    class="text-gray-500 font-medium hover:text-[var(--dark-heading)] px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                    <i class="fas fa-arrow-left text-sm"></i> Back
                </button>
                <button type="button" id="btn-step-3-next" 
                    class="bg-gray-200 text-gray-400 px-8 py-4 rounded-full font-semibold shadow-none cursor-not-allowed transition-all duration-300 flex items-center gap-2" disabled>
                    Next: Payment <i class="fas fa-arrow-right text-sm"></i>
                </button>
            </div>
        </div>
      `;
    }

    setupListeners() {
        this.querySelector('#cal-prev').onclick = () => this.changeMonth(-1);
        this.querySelector('#cal-next').onclick = () => this.changeMonth(1);

        this.querySelector('#btn-step-3-back').onclick = () => {
            this.dispatchEvent(new CustomEvent('step-back', {
                detail: { step: 2 },
                bubbles: true,
                composed: true
            }));
        };

        this.querySelector('#btn-step-3-next').onclick = () => {
            if (!window.bookingData.startTime) {
                // Should be covered by hidden state, but safe guard
                return;
            }
            this.dispatchEvent(new CustomEvent('step-complete', {
                detail: { step: 2 },
                bubbles: true,
                composed: true
            }));
        };
    }

    async initCalendar() {
        console.log("[StepSchedule] Initializing Calendar...");
        const grid = this.querySelector('#cal-grid');

        // API Base
        const API_BASE = window.ENV.API_BASE;

        console.log(`[StepSchedule] Fetching slots from: ${API_BASE}/api/booking/slots`);

        grid.innerHTML = '<div class="col-span-7 py-12 text-center text-gray-400"><i class="fas fa-circle-notch fa-spin text-2xl mb-2"></i><br>Loading availability...</div>';

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
                <div class="col-span-7 text-center text-red-500 text-xs p-4 bg-red-50 rounded-xl">
                    <p class="font-bold">Failed to load calendar.</p>
                    <p class="font-mono mt-1 mb-2">${err.message}</p>
                    <button onclick="this.closest('step-schedule').initCalendar()" class="text-blue-500 underline font-medium">Tap to Retry</button>
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
            // Base style
            btn.className = "h-10 w-10 mx-auto flex items-center justify-center rounded-full text-sm font-medium transition-all duration-200 relative";

            const dayData = calendarData[dStr];

            if (!dayData || dayData.status === 'unavailable' || dayData.status === 'full') {
                btn.classList.add('text-gray-300', 'cursor-not-allowed');
                btn.disabled = true;
                // Optional: Cross-out or minimal visual cue?
            } else {
                // Available
                // Default available state: Sage text, light bg on hover
                btn.classList.add('text-gray-600', 'hover:bg-[var(--sage-green-light)]', 'hover:text-[var(--sage-green)]', 'font-semibold');

                // Dot indicator for availability
                const dot = document.createElement('div');
                dot.className = "absolute bottom-1 w-1 h-1 rounded-full bg-[var(--sage-green)]";
                btn.appendChild(dot);

                if (selectedDateStr === dStr) {
                    btn.classList.remove('text-gray-600', 'hover:bg-[var(--sage-green-light)]', 'hover:text-[var(--sage-green)]');
                    btn.classList.add('bg-[var(--sage-green)]', 'text-white', 'shadow-md', 'transform', 'scale-105');
                    // Hide dot on selected to clean up
                    dot.style.display = 'none';
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
        const placeholder = this.querySelector('#time-panel-placeholder');
        const container = this.querySelector('#slots-container');
        const header = this.querySelector('#selected-date-header');
        const nextBtn = this.querySelector('#btn-step-3-next');

        panel.classList.remove('hidden');
        placeholder.classList.add('hidden');

        // Disable button again when switching days
        nextBtn.disabled = true;
        nextBtn.classList.add('bg-gray-200', 'text-gray-400', 'cursor-not-allowed', 'shadow-none', 'transform-none');
        nextBtn.classList.remove('bg-[var(--sage-green)]', 'text-white', 'shadow-lg', 'hover:shadow-xl', 'hover:-translate-y-0.5', 'cursor-pointer');

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
            // Slot button base style
            btn.className = "w-full py-3 px-6 text-center border border-gray-100 bg-white text-gray-600 rounded-xl hover:border-[var(--sage-green)] hover:text-[var(--sage-green)] hover:bg-[var(--sage-green-light)] transition-all font-medium text-sm shadow-sm";

            btn.onclick = () => {
                // Reset others
                Array.from(container.children).forEach(c => c.className = "w-full py-3 px-6 text-center border border-gray-100 bg-white text-gray-600 rounded-xl hover:border-[var(--sage-green)] hover:text-[var(--sage-green)] hover:bg-[var(--sage-green-light)] transition-all font-medium text-sm shadow-sm");
                // Active style
                btn.className = "w-full py-3 px-6 text-center border border-[var(--sage-green)] bg-[var(--sage-green)] text-white rounded-xl shadow-md transform scale-[1.02] transition-all font-bold text-sm";

                // Save
                window.bookingData.startTime = `${dStr}T${timeStr}:00`;

                // End time logic
                const sDate = new Date(window.bookingData.startTime);
                sDate.setMinutes(sDate.getMinutes() + 45);

                const ey = sDate.getFullYear();
                const em = (sDate.getMonth() + 1).toString().padStart(2, '0');
                const ed = sDate.getDate().toString().padStart(2, '0');
                const eh = sDate.getHours().toString().padStart(2, '0');
                const emm = sDate.getMinutes().toString().padStart(2, '0');
                window.bookingData.endTime = `${ey}-${em}-${ed}T${eh}:${emm}:00`;

                // Show Next Button
                nextBtn.disabled = false;
                nextBtn.classList.remove('bg-gray-200', 'text-gray-400', 'cursor-not-allowed', 'shadow-none', 'transform-none', 'hidden');
                nextBtn.classList.add('bg-[var(--sage-green)]', 'text-white', 'shadow-lg', 'hover:shadow-xl', 'hover:-translate-y-0.5', 'cursor-pointer', 'flex');
                // Ensure flex is there (it was in replacement content but removed hidden)
            };
            container.appendChild(btn);
        });
    }
}
customElements.define('step-schedule', StepSchedule);