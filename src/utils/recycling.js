const YEAR = 2026;

const TARGET_HOLIDAYS = [
    "New Year's Day",
    "Memorial Day",
    "Independence Day",
    "Labor Day",
    "Thanksgiving",
    "Christmas Day"
];

// --- HELPERS ---

export function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

export function getHolidayName(date) {
    const month = date.getMonth();
    const day = date.getDate();
    const dow = date.getDay();

    if (month === 0 && day === 1) return "New Year's Day";
    if (month === 6 && day === 4) return "Independence Day";
    if (month === 11 && day === 25) return "Christmas Day";
    if (month === 4 && dow === 1 && day > 24) return "Memorial Day";
    if (month === 8 && dow === 1 && day <= 7) return "Labor Day";
    if (month === 10 && dow === 4 && day >= 22 && day <= 28) return "Thanksgiving";
    return null;
}

export function formatDateDisplay(date) {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

// Accepts "HH:MM" 24h format
export function formatTimeForCSV(timeStr) {
    const [hourStr, minStr] = timeStr.split(':');
    let hour = parseInt(hourStr);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12;
    return `${hour}:${minStr} ${ampm}`;
}

export function formatDateCSV(date) {
    return date.toISOString().split('T')[0];
}

// --- CORE LOGIC ---

/**
 * Generates the full schedule list for a given zone day.
 * @param {string} zoneDayName - "Monday", "Tuesday", or "Wednesday"
 * @returns {Array} Array of week objects
 */
export function generateScheduleData(zoneDayName) {
    const dayMap = { "Monday": 1, "Tuesday": 2, "Wednesday": 3 };
    const pickupDayIndex = dayMap[zoneDayName];

    if (!pickupDayIndex) return [];

    const weeks = [];

    // Determine Start Date (First Monday of Year)
    let firstMonday = new Date(YEAR, 0, 1);
    while (firstMonday.getDay() !== 1) {
        firstMonday = addDays(firstMonday, 1);
    }

    let currentWeekType = "Commingled"; // Jan 5, 2026 starts as Commingled
    let iteratorDate = new Date(firstMonday);

    while (iteratorDate.getFullYear() === YEAR) {
        let scheduledPickupDate = addDays(iteratorDate, pickupDayIndex - 1);
        let holidayName = getHolidayName(scheduledPickupDate);
        let finalPickupDate = scheduledPickupDate;
        let isDelayed = false;

        if (holidayName && TARGET_HOLIDAYS.includes(holidayName)) {
            isDelayed = true;
            finalPickupDate = addDays(scheduledPickupDate, 1);
        }

        weeks.push({
            pickupDate: finalPickupDate,
            type: currentWeekType,
            isDelayed: isDelayed,
            holidayName: holidayName
        });

        // Iterate
        iteratorDate = addDays(iteratorDate, 7);
        currentWeekType = (currentWeekType === "Commingled") ? "Fibers" : "Commingled";
    }

    return weeks;
}
