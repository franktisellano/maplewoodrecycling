import React, { useState } from 'react';
import {
    generateScheduleData,
    addDays,
    formatTimeForCSV,
    formatDateCSV,
    formatDateDisplay
} from '../utils/recycling';
import { generateICS } from '../utils/ics';

function Reminders() {
    const [zone, setZone] = useState('Monday');
    const [reminderTiming, setReminderTiming] = useState('night');
    const [time, setTime] = useState('20:00');
    const [showNextSteps, setShowNextSteps] = useState(false); // 'google', 'apple', or false
    const [showPreviewModal, setShowPreviewModal] = useState(false);

    // Helper to get labels based on zone
    const getZoneLabels = () => {
        const labels = {
            "Monday": { night: "Sunday Night", morning: "Monday Morning" },
            "Tuesday": { night: "Monday Night", morning: "Tuesday Morning" },
            "Wednesday": { night: "Tuesday Night", morning: "Wednesday Morning" }
        };
        return labels[zone] || labels["Monday"];
    };

    const handleTimingChange = (newTiming) => {
        setReminderTiming(newTiming);
        // Set default times
        if (newTiming === 'night') {
            setTime('20:00'); // 8 PM
        } else {
            setTime('07:00'); // 7 AM
        }
    };

    const calculateScheduleWithReminders = () => {
        const basicWeeks = generateScheduleData(zone);

        return basicWeeks.map(week => {
            let reminderDate;
            if (reminderTiming === 'night') {
                reminderDate = addDays(week.pickupDate, -1);
            } else {
                reminderDate = week.pickupDate;
            }

            let holidayWarning = null;
            if (week.isDelayed && reminderTiming === 'night') {
                // Original scheduled day (before delay) -> night before that
                // If pickup is normally Monday, but delayed to Tuesday.
                // Scheduled (not delayed) = Monday. Night before = Sunday.
                // We want to warn on Sunday that there is NO pickup Monday.
                let originalScheduledDate = addDays(week.pickupDate, -1);

                holidayWarning = {
                    date: addDays(originalScheduledDate, -1),
                    subject: `Reminder: Recycling Holiday (${week.holidayName})`
                };
            }

            return {
                ...week,
                reminderDate,
                reminderTimeStr: time,
                holidayWarning
            };
        });
    };

    const downloadGoogleCSV = () => {
        const weeks = calculateScheduleWithReminders();
        let csvContent = "Subject,Start Date,Start Time,End Time,Private\n";

        weeks.forEach(week => {
            const csvStartTime = formatTimeForCSV(week.reminderTimeStr);
            let [h, m] = week.reminderTimeStr.split(':').map(Number);
            let endH = (h + 1) % 24;
            const csvEndTime = formatTimeForCSV(`${endH}:${m}`);

            if (week.holidayWarning) {
                csvContent += `${week.holidayWarning.subject},${formatDateCSV(week.holidayWarning.date)},${csvStartTime},${csvEndTime},False\n`;
            }

            const subject = `Recycling (${week.type})`;
            csvContent += `${subject},${formatDateCSV(week.reminderDate)},${csvStartTime},${csvEndTime},False\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `maplewood_recycling_${zone}_2026.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setShowNextSteps('google');
    };

    const downloadAppleICS = () => {
        const weeks = calculateScheduleWithReminders();
        const events = [];

        weeks.forEach(week => {
            let [h, m] = week.reminderTimeStr.split(':').map(Number);

            // Construct start date
            const start = new Date(week.reminderDate);
            start.setHours(h, m, 0);

            // Construct end date (1 hour duration)
            const end = new Date(start);
            end.setHours(h + 1);

            if (week.holidayWarning) {
                // Holiday warning logic if needed, treating as separate event
                const warnStart = new Date(week.holidayWarning.date);
                warnStart.setHours(h, m, 0);
                const warnEnd = new Date(warnStart);
                warnEnd.setHours(h + 1);

                events.push({
                    start: warnStart,
                    end: warnEnd,
                    summary: week.holidayWarning.subject
                });
            }

            events.push({
                start,
                end,
                summary: `Recycling (${week.type})`,
                description: `Pickup for ${week.type}.`
            });
        });

        const icsContent = generateICS(events);
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `maplewood_recycling_${zone}_2026.ics`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setShowNextSteps('apple');
    };

    const toggleModal = () => {
        setShowPreviewModal(!showPreviewModal);
    };

    // Modal Component (inline for simplicity or extracted)
    const Modal = () => {
        if (!showPreviewModal) return null;
        const weeks = calculateScheduleWithReminders();

        return (
            <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && toggleModal()}>
                <div className="modal">
                    <div className="modal-header">
                        <h2 className="modal-title">Zone Schedule</h2>
                        <button className="close-btn" onClick={toggleModal}>&times;</button>
                    </div>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Pickup Date</th>
                                    <th>Type</th>
                                    <th>Reminder</th>
                                </tr>
                            </thead>
                            <tbody>
                                {weeks.map((week, idx) => {
                                    const dStr = week.reminderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                    const tStr = formatTimeForCSV(week.reminderTimeStr);

                                    return (
                                        <tr key={idx}>
                                            <td>
                                                {formatDateDisplay(week.pickupDate)}
                                                {week.isDelayed && <span className="holiday-tag">Delayed ({week.holidayName})</span>}
                                            </td>
                                            <td className="type-badge">{week.type}</td>
                                            <td className="reminder-text">{dStr} at {tStr}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            {!showNextSteps ? (
                <div id="scheduler-form">
                    <div className="form-group">
                        <label htmlFor="zone-select">Where do you live? <span className="schedule-sub">Find your zone <a href="https://www.maplewoodnj.gov/Home/Components/News/News/1250/15" target="_blank" rel="noopener noreferrer">here</a>.</span></label>
                        <select id="zone-select" value={zone} onChange={(e) => setZone(e.target.value)}>
                            <option value="Monday">Zone 1 & 2 (Monday Pickup)</option>
                            <option value="Tuesday">Zone 3 & 4 (Tuesday Pickup)</option>
                            <option value="Wednesday">Zone 5 & 6 (Wednesday Pickup)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Reminder schedule <span className="schedule-sub">Do you want your calendar events to be on pickup day or the night before?</span></label>
                        <div className="radio-group">
                            <div className="radio-option">
                                <input
                                    type="radio"
                                    id="remind-night"
                                    name="reminder-timing"
                                    value="night"
                                    checked={reminderTiming === 'night'}
                                    onChange={() => handleTimingChange('night')}
                                />
                                <label htmlFor="remind-night">
                                    <span className="option-title">Night Before</span>
                                    <span className="option-day">{getZoneLabels().night}</span>
                                </label>
                            </div>
                            <div className="radio-option">
                                <input
                                    type="radio"
                                    id="remind-morning"
                                    name="reminder-timing"
                                    value="morning"
                                    checked={reminderTiming === 'morning'}
                                    onChange={() => handleTimingChange('morning')}
                                />
                                <label htmlFor="remind-morning">
                                    <span className="option-title">Morning Of</span>
                                    <span className="option-day">{getZoneLabels().morning}</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="reminder-time">Reminder Time</label>
                        <input
                            type="time"
                            id="reminder-time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                        />
                    </div>

                    <div className="download-buttons">
                        <button className="btn-google" onClick={downloadGoogleCSV}>
                            <svg viewBox="0 0 24 24" width="24" height="24" className="icon">
                                <path fill="currentColor" d="M19,4H18V2H16V4H8V2H6V4H5A2,2 0 0,0 3,6V20A2,2 0 0,0 5,22H19A2,2 0 0,0 21,20V6A2,2 0 0,0 19,4M19,20H5V9H19V20M5,7V6H19V7H5Z" />
                            </svg>
                            Google Calendar
                        </button>
                        <button className="btn-apple" onClick={downloadAppleICS}>
                            <svg viewBox="0 0 24 24" width="24" height="24" className="icon">
                                <path fill="currentColor" d="M19,4H18V2H16V4H8V2H6V4H5C3.89,4 3,4.9 3,6V20A2,2 0 0,0 5,22H19A2,2 0 0,0 21,20V6A2,2 0 0,0 19,4M19,20H5V10H19V20M19,8H5V6H19V8M17,13H12V18H17V13Z" />
                            </svg>
                            Apple Calendar
                        </button>
                    </div>

                    <button className="btn-secondary" onClick={toggleModal} style={{ width: '100%', marginTop: '10px' }}>Preview Schedule</button>
                </div>
            ) : (
                <div id="next-steps">
                    <div className="success-banner">
                        <span>✅</span> Download Started!
                    </div>

                    <h2 className="steps-title">Next Steps: Import</h2>

                    {showNextSteps === 'google' ? (
                        <>
                            <p style={{ marginBottom: '20px', color: '#555' }}>Follow these steps to add the file to Google Calendar:</p>
                            <ol className="steps-list">
                                <li>Open <strong>Google Calendar</strong> on a desktop computer.</li>
                                <li>Click the <strong>Gear Icon</strong> ⚙️ at the top right, then select <strong>Settings</strong>.</li>
                                <li>In the left sidebar, click <strong>Import & export</strong>.</li>
                                <li>Click "Select file from your computer" and choose the <strong>.csv file</strong> you just downloaded.</li>
                                <li><strong>Important:</strong> Select the calendar you want to add these events to (e.g., your main calendar).</li>
                                <li>Click <strong>Import</strong>.</li>
                            </ol>
                        </>
                    ) : (
                        <>
                            <p style={{ marginBottom: '20px', color: '#555' }}>For Apple Calendar (iPhone / Mac):</p>
                            <ol className="steps-list">
                                <li>Locate the downloaded <strong>.ics file</strong>.</li>
                                <li><strong>Double-click</strong> or tap the file to open it.</li>
                                <li>When prompted, confirm that you want to add the events to your calendar.</li>
                                <li>Choose which calendar to add them to (e.g., "Home" or "Work") if asked.</li>
                            </ol>
                        </>
                    )}

                    <button className="btn-secondary" onClick={() => setShowNextSteps(false)}>Start Over / Choose Different Zone</button>
                </div>
            )}

            {/* Render Modal if active */}
            <Modal />
        </>
    );
}

export default Reminders;
