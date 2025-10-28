/* ==========================================================================
   CALENDAR.JS - Orthodox Calendar 2025 with Filters & ICS Export
   ========================================================================== */

(function() {
    'use strict';

    let orthodoxEvents = [];
    let localEvents = [];
    let allEvents = [];
    let filteredEvents = [];
    let currentMonth = new Date().getMonth();
    let currentYear = 2025;

    document.addEventListener('DOMContentLoaded', function() {
        initCalendar();
    });

    /**
     * Initialize Calendar
     */
    async function initCalendar() {
        await loadEvents();
        setupViewToggle();
        setupFilters();
        setupCalendarNavigation();
        setupExport();
        renderListView();
    }

    /**
     * Load events from JSON files
     */
    async function loadEvents() {
        try {
            // Load orthodox calendar events
            const orthodoxResponse = await fetch('/data/orthodox-2025.json');
            orthodoxEvents = await orthodoxResponse.json();

            // Load local events (optional)
            try {
                const localResponse = await fetch('/data/events-local.json');
                localEvents = await localResponse.json();
            } catch (e) {
                console.log('No local events file found');
                localEvents = [];
            }

            // Combine all events
            allEvents = [...orthodoxEvents, ...localEvents];
            filteredEvents = [...allEvents];

        } catch (error) {
            console.error('Error loading events:', error);
        }
    }

    /**
     * Setup view toggle (List/Calendar)
     */
    function setupViewToggle() {
        const listBtn = document.getElementById('view-list');
        const calendarBtn = document.getElementById('view-calendar');
        const listView = document.getElementById('list-view');
        const calendarView = document.getElementById('calendar-view');

        if (!listBtn || !calendarBtn) return;

        listBtn.addEventListener('click', function() {
            listBtn.classList.add('active');
            calendarBtn.classList.remove('active');
            listView.style.display = 'block';
            calendarView.style.display = 'none';
            renderListView();
        });

        calendarBtn.addEventListener('click', function() {
            calendarBtn.classList.add('active');
            listBtn.classList.remove('active');
            calendarView.style.display = 'block';
            listView.style.display = 'none';
            renderCalendarView();
        });
    }

    /**
     * Setup filters
     */
    function setupFilters() {
        const typeFilter = document.getElementById('type-filter');
        const monthFilter = document.getElementById('month-filter');

        if (typeFilter) {
            typeFilter.addEventListener('change', applyFilters);
        }

        if (monthFilter) {
            monthFilter.addEventListener('change', applyFilters);
        }
    }

    /**
     * Apply filters to events
     */
    function applyFilters() {
        const typeFilter = document.getElementById('type-filter');
        const monthFilter = document.getElementById('month-filter');

        const selectedType = typeFilter?.value || 'all';
        const selectedMonth = monthFilter?.value || 'all';

        filteredEvents = allEvents.filter(event => {
            const eventDate = new Date(event.date);
            const typeMatch = selectedType === 'all' || event.type === selectedType;
            const monthMatch = selectedMonth === 'all' || eventDate.getMonth() === parseInt(selectedMonth);

            return typeMatch && monthMatch;
        });

        // Re-render current view
        const listView = document.getElementById('list-view');
        if (listView && listView.style.display !== 'none') {
            renderListView();
        } else {
            renderCalendarView();
        }
    }

    /**
     * Render list view
     */
    function renderListView() {
        const listView = document.getElementById('list-view');
        if (!listView) return;

        if (filteredEvents.length === 0) {
            listView.innerHTML = '<p style="text-align:center; padding:2rem;">Nu există evenimente pentru filtrele selectate.</p>';
            return;
        }

        // Sort events by date
        const sortedEvents = [...filteredEvents].sort((a, b) => 
            new Date(a.date) - new Date(b.date)
        );

        let html = '<div class="events-timeline">';

        sortedEvents.forEach(event => {
            const date = new Date(event.date);
            const day = date.getDate();
            const month = getMonthNameShort(date.getMonth());

            html += `
                <div class="event-item">
                    <div class="event-date">
                        <span class="event-day">${day}</span>
                        <span class="event-month">${month}</span>
                    </div>
                    <div class="event-content">
                        <h3 class="event-title">${event.title}</h3>
                        <p class="event-meta">${event.type}${event.fast ? ' • ' + event.fast : ''}</p>
                        ${event.description ? `<p>${event.description}</p>` : ''}
                    </div>
                </div>
            `;
        });

        html += '</div>';
        listView.innerHTML = html;
    }

    /**
     * Setup calendar navigation
     */
    function setupCalendarNavigation() {
        const prevBtn = document.getElementById('prev-month');
        const nextBtn = document.getElementById('next-month');

        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                currentMonth--;
                if (currentMonth < 0) {
                    currentMonth = 11;
                    currentYear--;
                }
                renderCalendarView();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                currentMonth++;
                if (currentMonth > 11) {
                    currentMonth = 0;
                    currentYear++;
                }
                renderCalendarView();
            });
        }
    }

    /**
     * Render calendar view
     */
    function renderCalendarView() {
        const calendarDays = document.getElementById('calendar-days');
        const monthYearDisplay = document.getElementById('current-month-year');

        if (!calendarDays) return;

        // Update month/year display
        if (monthYearDisplay) {
            monthYearDisplay.textContent = `${getMonthName(currentMonth)} ${currentYear}`;
        }

        // Get first day of month and number of days
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

        let html = '';

        // Previous month days
        for (let i = firstDay - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            html += `<div class="calendar-day other-month">${day}</div>`;
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const hasEvent = filteredEvents.some(e => e.date === dateStr);
            const className = hasEvent ? 'calendar-day has-event' : 'calendar-day';
            
            html += `<div class="${className}" data-date="${dateStr}">${day}</div>`;
        }

        // Next month days to fill grid
        const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
        const remainingCells = totalCells - (firstDay + daysInMonth);
        for (let day = 1; day <= remainingCells; day++) {
            html += `<div class="calendar-day other-month">${day}</div>`;
        }

        calendarDays.innerHTML = html;

        // Add click events to days with events
        calendarDays.querySelectorAll('.has-event').forEach(dayEl => {
            dayEl.addEventListener('click', function() {
                const date = this.getAttribute('data-date');
                showDayEvents(date);
            });
        });
    }

    /**
     * Show events for a specific day
     */
    function showDayEvents(date) {
        const dayEvents = filteredEvents.filter(e => e.date === date);
        
        if (dayEvents.length === 0) return;

        let message = `Evenimente pentru ${formatDate(date)}:\n\n`;
        dayEvents.forEach(event => {
            message += `• ${event.title}\n`;
            if (event.type) message += `  ${event.type}\n`;
            if (event.fast) message += `  ${event.fast}\n`;
            message += '\n';
        });

        alert(message);
    }

    /**
     * Setup ICS export
     */
    function setupExport() {
        const exportBtn = document.getElementById('export-ics');
        
        if (exportBtn) {
            exportBtn.addEventListener('click', exportToICS);
        }
    }

    /**
     * Export events to ICS file
     */
    function exportToICS() {
        let icsContent = 'BEGIN:VCALENDAR\n';
        icsContent += 'VERSION:2.0\n';
        icsContent += 'PRODID:-//Mitropolia Targovistei//Calendar 2025//RO\n';
        icsContent += 'CALSCALE:GREGORIAN\n';
        icsContent += 'METHOD:PUBLISH\n';
        icsContent += 'X-WR-CALNAME:Calendar Ortodox 2025\n';
        icsContent += 'X-WR-TIMEZONE:Europe/Bucharest\n';

        filteredEvents.forEach(event => {
            const eventDate = new Date(event.date);
            const dateStr = formatDateForICS(eventDate);

            icsContent += 'BEGIN:VEVENT\n';
            icsContent += `DTSTART;VALUE=DATE:${dateStr}\n`;
            icsContent += `DTEND;VALUE=DATE:${dateStr}\n`;
            icsContent += `SUMMARY:${escapeICS(event.title)}\n`;
            
            let description = event.type;
            if (event.fast) description += ' - ' + event.fast;
            if (event.description) description += ' - ' + event.description;
            
            icsContent += `DESCRIPTION:${escapeICS(description)}\n`;
            icsContent += `UID:${event.date}-${Date.now()}@mitropolia-targovistei.ro\n`;
            icsContent += 'END:VEVENT\n';
        });

        icsContent += 'END:VCALENDAR';

        // Create blob and download
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'calendar-ortodox-2025.ics';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Helper: Format date for ICS (YYYYMMDD)
     */
    function formatDateForICS(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    }

    /**
     * Helper: Escape special characters for ICS
     */
    function escapeICS(str) {
        return str.replace(/\\/g, '\\\\')
                  .replace(/;/g, '\\;')
                  .replace(/,/g, '\\,')
                  .replace(/\n/g, '\\n');
    }

    /**
     * Helper: Get month name
     */
    function getMonthName(month) {
        const months = [
            'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
            'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'
        ];
        return months[month];
    }

    /**
     * Helper: Get short month name
     */
    function getMonthNameShort(month) {
        const months = ['IAN', 'FEB', 'MAR', 'APR', 'MAI', 'IUN', 'IUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        return months[month];
    }

    /**
     * Helper: Format date for display
     */
    function formatDate(dateStr) {
        const date = new Date(dateStr);
        const day = date.getDate();
        const month = getMonthName(date.getMonth());
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    }

})();