const YEAR = 2026;

const TARGET_HOLIDAYS = [
    "New Year's Day",
    "Memorial Day",
    "Independence Day",
    "Labor Day",
    "Thanksgiving",
    "Christmas Day"
];

const UNEXPECTED_DELAYS = [
    { date: "1/26/2026", reason: "Snowstorm" },
    { date: "1/27/2026", reason: "Snowstorm" },
    { date: "1/28/2026", reason: "Snowstorm" },
];

const ZONE_DISPLAY_NAMES = {
    "Monday": "Zone 1 & 2",
    "Tuesday": "Zone 3 & 4",
    "Wednesday": "Zone 5 & 6"
};

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

export function getUnexpectedDelay(date) {
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    const match = UNEXPECTED_DELAYS.find(d => d.date === dateStr);
    return match ? match.reason : null;
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

/**
 * Gets banner info if there's an upcoming delayed pickup within 4 days.
 * Shows for 4 days leading up to and including the rescheduled pickup day.
 * @param {string} zoneDayName - "Monday", "Tuesday", or "Wednesday"
 * @returns {object|null} Banner info or null if no banner needed
 */
export function getPickupBannerInfo(zoneDayName) {
    const dayMap = { "Monday": 1, "Tuesday": 2, "Wednesday": 3 };
    const pickupDayIndex = dayMap[zoneDayName];
    if (!pickupDayIndex) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const zoneName = ZONE_DISPLAY_NAMES[zoneDayName];

    // Find the next normal pickup day for this zone (this week or next)
    let normalPickupDate = new Date(today);
    while (normalPickupDate.getDay() !== pickupDayIndex) {
        normalPickupDate = addDays(normalPickupDate, 1);
    }

    // If today is past the pickup day this week, check this week's pickup day too
    // by also checking the most recent pickup day (could be today or earlier this week)
    let recentPickupDate = new Date(today);
    while (recentPickupDate.getDay() !== pickupDayIndex) {
        recentPickupDate = addDays(recentPickupDate, -1);
    }

    // Check both the recent and upcoming pickup dates for delays
    for (const checkDate of [recentPickupDate, normalPickupDate]) {
        const holidayName = getHolidayName(checkDate);
        const unexpectedDelay = getUnexpectedDelay(checkDate);

        if ((holidayName && TARGET_HOLIDAYS.includes(holidayName)) || unexpectedDelay) {
            const reason = unexpectedDelay || holidayName;
            const rescheduledDate = addDays(checkDate, 1);

            // Show banner for 4 days leading up to and including the rescheduled pickup day
            const daysUntilPickup = Math.floor((rescheduledDate - today) / (1000 * 60 * 60 * 24));

            if (daysUntilPickup >= 0 && daysUntilPickup <= 3) {
                return {
                    zoneName,
                    originalDate: checkDate,
                    newDate: rescheduledDate,
                    reason
                };
            }
        }
    }

    return null;
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
        let unexpectedDelay = getUnexpectedDelay(scheduledPickupDate);
        let finalPickupDate = scheduledPickupDate;
        let isDelayed = false;
        let delayReason = null;

        if (holidayName && TARGET_HOLIDAYS.includes(holidayName)) {
            isDelayed = true;
            delayReason = holidayName;
            finalPickupDate = addDays(scheduledPickupDate, 1);
        } else if (unexpectedDelay) {
            isDelayed = true;
            delayReason = unexpectedDelay;
            finalPickupDate = addDays(scheduledPickupDate, 1);
        }

        weeks.push({
            pickupDate: finalPickupDate,
            type: currentWeekType,
            isDelayed: isDelayed,
            holidayName: holidayName,
            delayReason: delayReason
        });

        // Iterate
        iteratorDate = addDays(iteratorDate, 7);
        currentWeekType = (currentWeekType === "Commingled") ? "Fibers" : "Commingled";
    }

    return weeks;
}
