export function formatICSDate(date) {
    if (!date) return '';
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Generates an ICS file content string from a list of events.
 * @param {Array} events - Array of event objects { start, end, summary, description, location }
 * @returns {string} ICS file content
 */
export function generateICS(events) {
    const header = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Maplewood Recycling//NONSGML v1.0//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'X-WR-CALNAME:Maplewood Recycling',
        'X-WR-TIMEZONE:America/New_York', // Simplified, usually handled by client
    ].join('\r\n');

    const footer = '\r\nEND:VCALENDAR';

    const eventStrings = events.map(event => {
        return [
            'BEGIN:VEVENT',
            `UID:${Date.now()}_${Math.random().toString(36).substr(2, 9)}@maplewoodrecycling.com`,
            `DTSTAMP:${formatICSDate(new Date())}`,
            `DTSTART:${formatICSDate(event.start)}`,
            `DTEND:${formatICSDate(event.end)}`,
            `SUMMARY:${event.summary}`,
            `DESCRIPTION:${event.description || ''}`,
            'END:VEVENT'
        ].join('\r\n');
    });

    return header + '\r\n' + eventStrings.join('\r\n') + footer;
}
