/* =============================================
   NANYA'S LABEL — Booking System JS
   ============================================= */

(function () {
  'use strict';

  // --- STATE ---
  const state = {
    step: 1,
    service: null,
    servicePrice: null,
    serviceDuration: null,
    date: null,
    time: null,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: '',
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
  };

  // Available days: Tue(2)–Sat(6), exclude Sun(0) + Mon(1)
  const AVAILABLE_DAYS = [2, 3, 4, 5, 6];

  // Simulate some fully booked dates (relative to current month)
  const FULL_DATES = new Set([
    formatKey(new Date().getFullYear(), new Date().getMonth(), 8),
    formatKey(new Date().getFullYear(), new Date().getMonth(), 14),
    formatKey(new Date().getFullYear(), new Date().getMonth(), 22),
  ]);

  // Time slots per day
  const ALL_SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];
  // Simulate booked slots per date
  const BOOKED_SLOTS = {
    [formatKey(new Date().getFullYear(), new Date().getMonth(), 10)]: ['10:00 AM', '2:00 PM'],
    [formatKey(new Date().getFullYear(), new Date().getMonth(), 15)]: ['9:00 AM', '11:00 AM', '3:00 PM'],
    [formatKey(new Date().getFullYear(), new Date().getMonth(), 20)]: ['1:00 PM', '4:00 PM'],
  };

  function formatKey(y, m, d) {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  // --- DOM REFS ---
  const steps = {
    1: document.getElementById('step-1'),
    2: document.getElementById('step-2'),
    3: document.getElementById('step-3'),
    4: document.getElementById('step-4'),
    success: document.getElementById('step-success'),
  };
  const dots = {
    1: document.getElementById('step-dot-1'),
    2: document.getElementById('step-dot-2'),
    3: document.getElementById('step-dot-3'),
    4: document.getElementById('step-dot-4'),
  };
  const lines = document.querySelectorAll('.step-line');

  const next1 = document.getElementById('next-1');
  const next2 = document.getElementById('next-2');
  const next3 = document.getElementById('next-3');
  const back2 = document.getElementById('back-2');
  const back3 = document.getElementById('back-3');
  const back4 = document.getElementById('back-4');
  const confirmBtn = document.getElementById('confirm-btn');

  const calMonthYear = document.getElementById('cal-month-year');
  const calDays = document.getElementById('calendar-days');
  const calPrev = document.getElementById('cal-prev');
  const calNext = document.getElementById('cal-next');
  const timeSlotsEl = document.getElementById('time-slots');
  const timeSlotsPH = document.getElementById('time-slots-placeholder');
  const slotsDate = document.getElementById('time-slots-date');
  const slotsGrid = document.getElementById('slots-grid');

  // --- STEP MANAGEMENT ---
  function goToStep(n) {
    Object.values(steps).forEach(el => el && el.classList.add('hidden'));
    const target = steps[n] || steps.success;
    target.classList.remove('hidden');
    state.step = n;
    updateStepIndicator();
    window.scrollTo({ top: document.querySelector('.booking-main').offsetTop - 80, behavior: 'smooth' });
  }

  function updateStepIndicator() {
    Object.entries(dots).forEach(([num, el]) => {
      if (!el) return;
      const n = parseInt(num);
      el.classList.remove('active', 'done');
      if (n === state.step) el.classList.add('active');
      else if (n < state.step) el.classList.add('done');
    });
    lines.forEach((line, i) => {
      line.classList.toggle('done', i + 1 < state.step);
    });
  }

  // --- STEP 1: SERVICE SELECTION ---
  document.querySelectorAll('input[name="service"]').forEach(radio => {
    radio.addEventListener('change', () => {
      state.service = radio.value;
      state.servicePrice = radio.dataset.price;
      state.serviceDuration = radio.dataset.duration;
      next1.disabled = false;
    });
  });

  next1.addEventListener('click', () => {
    if (!state.service) return;
    goToStep(2);
    renderCalendar();
  });

  // --- STEP 2: CALENDAR ---
  function renderCalendar() {
    const { currentMonth: m, currentYear: y } = state;
    const today = new Date();
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    calMonthYear.textContent = `${monthNames[m]} ${y}`;

    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();

    calDays.innerHTML = '';

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('div');
      empty.className = 'cal-day empty';
      calDays.appendChild(empty);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const cell = document.createElement('div');
      const date = new Date(y, m, d);
      const key = formatKey(y, m, d);
      const isToday = date.toDateString() === today.toDateString();
      const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const isFull = FULL_DATES.has(key);
      const isAvailable = AVAILABLE_DAYS.includes(date.getDay()) && !isPast && !isFull;

      cell.className = 'cal-day';
      cell.textContent = d;
      if (isToday) cell.classList.add('today');
      if (isPast) cell.classList.add('past');
      else if (isFull) cell.classList.add('full');
      else if (isAvailable) cell.classList.add('available');

      const selectedKey = state.date ? formatKey(...state.date.split('-').map((v, i) => i === 1 ? parseInt(v) - 1 : parseInt(v))) : null;
      if (key === formatKey(y, m, d) && state.date === key) cell.classList.add('selected');

      if (isAvailable) {
        cell.addEventListener('click', () => {
          state.date = key;
          state.time = null;
          next2.disabled = true;
          renderCalendar();
          renderTimeSlots(key);
        });
      }

      calDays.appendChild(cell);
    }

    // Disable prev if already at current month
    calPrev.disabled = m === today.getMonth() && y === today.getFullYear();
    calPrev.style.opacity = calPrev.disabled ? '.35' : '';
    calPrev.style.cursor = calPrev.disabled ? 'not-allowed' : '';
  }

  function renderTimeSlots(dateKey) {
    timeSlotsEl.classList.remove('hidden');
    timeSlotsPH.classList.add('hidden');

    const parts = dateKey.split('-');
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    slotsDate.textContent = `${dayNames[d.getDay()]}, ${monthNames[d.getMonth()]} ${d.getDate()}`;

    const booked = BOOKED_SLOTS[dateKey] || [];
    slotsGrid.innerHTML = '';

    ALL_SLOTS.forEach(slot => {
      const btn = document.createElement('div');
      btn.className = 'time-slot';
      btn.textContent = slot;
      if (booked.includes(slot)) {
        btn.classList.add('booked');
      } else {
        btn.addEventListener('click', () => {
          state.time = slot;
          document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
          btn.classList.add('selected');
          next2.disabled = false;
        });
      }
      slotsGrid.appendChild(btn);
    });

    // Re-select if already chosen
    if (state.time) {
      const chosen = [...slotsGrid.querySelectorAll('.time-slot')].find(s => s.textContent === state.time);
      if (chosen) { chosen.classList.add('selected'); next2.disabled = false; }
    }
  }

  calPrev.addEventListener('click', () => {
    const today = new Date();
    if (state.currentMonth === today.getMonth() && state.currentYear === today.getFullYear()) return;
    state.currentMonth--;
    if (state.currentMonth < 0) { state.currentMonth = 11; state.currentYear--; }
    renderCalendar();
  });

  calNext.addEventListener('click', () => {
    state.currentMonth++;
    if (state.currentMonth > 11) { state.currentMonth = 0; state.currentYear++; }
    renderCalendar();
  });

  back2.addEventListener('click', () => goToStep(1));
  next2.addEventListener('click', () => {
    if (!state.date || !state.time) return;
    goToStep(3);
  });

  // --- STEP 3: USER DETAILS ---
  function validateStep3() {
    const firstName = document.getElementById('first-name').value.trim();
    const lastName  = document.getElementById('last-name').value.trim();
    const email     = document.getElementById('email').value.trim();
    const phone     = document.getElementById('phone').value.trim();
    const agree     = document.getElementById('agree').checked;
    const emailRx   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let valid = true;

    [['first-name', firstName], ['last-name', lastName], ['email', email], ['phone', phone]].forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (!val || (id === 'email' && !emailRx.test(val))) {
        el.classList.add('error');
        valid = false;
      } else {
        el.classList.remove('error');
      }
    });

    if (!agree) {
      document.getElementById('agree').style.outline = '2px solid #c0392b';
      valid = false;
    } else {
      document.getElementById('agree').style.outline = '';
    }

    if (valid) {
      state.firstName = firstName;
      state.lastName  = lastName;
      state.email     = email;
      state.phone     = phone;
      state.notes     = document.getElementById('notes').value.trim();
    }

    return valid;
  }

  back3.addEventListener('click', () => goToStep(2));
  next3.addEventListener('click', () => {
    if (!validateStep3()) return;
    populateSummary();
    goToStep(4);
  });

  // --- STEP 4: CONFIRM ---
  function populateSummary() {
    document.getElementById('sum-service').textContent  = state.service;
    document.getElementById('sum-price').textContent    = state.servicePrice;
    document.getElementById('sum-duration').textContent = state.serviceDuration;

    const parts = state.date.split('-');
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const dayNames   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    document.getElementById('sum-date').textContent = `${dayNames[d.getDay()]}, ${monthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    document.getElementById('sum-time').textContent = state.time;
    document.getElementById('sum-name').textContent  = `${state.firstName} ${state.lastName}`;
    document.getElementById('sum-email').textContent = state.email;
    document.getElementById('sum-phone').textContent = state.phone;
  }

  back4.addEventListener('click', () => goToStep(3));

  confirmBtn.addEventListener('click', () => {
    confirmBtn.textContent = 'Processing…';
    confirmBtn.disabled = true;

    setTimeout(() => {
      const parts = state.date.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
      const dayNames   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

      document.getElementById('success-summary').innerHTML = `
        <strong>${state.service}</strong><br />
        ${dayNames[d.getDay()]}, ${monthNames[d.getMonth()]} ${d.getDate()} at ${state.time}<br />
        Confirmation sent to <strong>${state.email}</strong>
      `;

      goToStep('success');
    }, 1200);
  });

  // --- INIT ---
  updateStepIndicator();
})();
