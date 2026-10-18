import React, { useState } from 'react';
import {
    generateScheduleData,
    addDays,
    formatTimeForCSV,
    formatDateCSV,
    formatDateDisplay
} from '../utils/recycling';
import { generateICS } from '../utils/ics';
import { useZone } from '../utils/useZone';
import { capture } from '../utils/analytics';
import PageHead from '../components/PageHead';
import ZonePicker from '../components/ZonePicker';

function Reminders() {
    const [zone, setZone] = useZone();
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
                    subject: `Reminder: Recycling Delay (${week.delayReason})`
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
        capture('calendar added', { kind: 'google', reminder: reminderTiming });
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
        capture('calendar added', { kind: 'apple', reminder: reminderTiming });
    };

    const toggleModal = () => {
        setShowPreviewModal(!showPreviewModal);
    };


    // Preview modal, rendered inline
    const renderModal = () => {
        if (!showPreviewModal) return null;
        const weeks = calculateScheduleWithReminders();

        return (
            <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && toggleModal()}>
                <div className="modal" role="dialog" aria-modal="true" aria-labelledby="preview-title">
                    <div className="modal-header">
                        <h2 className="modal-title" id="preview-title">Your 2026 reminders</h2>
                        <button className="close-btn" onClick={toggleModal} aria-label="Close">&times;</button>
                    </div>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Pickup</th>
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
                                                {week.isDelayed && <span className="delay-tag">Delayed · {week.delayReason}</span>}
                                            </td>
                                            <td className={`type-${week.type.toLowerCase()}`}>{week.type}</td>
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
            <PageHead eyebrow="Calendar reminders" title="Never forget to put out your bin">
                <p className="lede">Download the whole 2026 schedule for your zone into Google or Apple Calendar and customize your reminder timing.</p>
            </PageHead>

            <div className="page">
                {!showNextSteps ? (
                    <div id="scheduler-form">
                        <ZonePicker zone={zone} onChange={setZone} legend="Where do you live?" />

                        <fieldset className="field">
                            <legend>
                                When should we remind you?
                                <span className="hint">Events go on your calendar the night before pickup, or the morning of.</span>
                            </legend>
                            <div className="choices two">
                                <label className="choice">
                                    <input
                                        type="radio"
                                        name="reminder-timing"
                                        value="night"
                                        checked={reminderTiming === 'night'}
                                        onChange={() => handleTimingChange('night')}
                                    />
                                    <span className="choice-body">
                                        <span className="choice-title">Night before</span>
                                        <span className="choice-sub">{getZoneLabels().night}</span>
                                    </span>
                                </label>
                                <label className="choice">
                                    <input
                                        type="radio"
                                        name="reminder-timing"
                                        value="morning"
                                        checked={reminderTiming === 'morning'}
                                        onChange={() => handleTimingChange('morning')}
                                    />
                                    <span className="choice-body">
                                        <span className="choice-title">Morning of</span>
                                        <span className="choice-sub">{getZoneLabels().morning}</span>
                                    </span>
                                </label>
                            </div>
                        </fieldset>

                        <div className="field">
                            <label className="field-label" htmlFor="reminder-time">At what time?</label>
                            <input
                                type="time"
                                id="reminder-time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                            />
                        </div>

                        <div className="download-buttons">
                            <button className="btn-primary" onClick={downloadGoogleCSV}>
                                <span className="btn-sub">Download for</span> Google Calendar
                            </button>
                            <button className="btn-primary" onClick={downloadAppleICS}>
                                <span className="btn-sub">Download for</span> Apple Calendar
                            </button>
                        </div>

                        <button className="link-button" onClick={toggleModal}>Preview the reminders first</button>
                    </div>
                ) : (
                    <div id="next-steps">
                        <div className="notice success" role="status">
                            <p className="notice-title">Your download has started.</p>
                            <p>Now bring it into your calendar.</p>
                        </div>

                        {showNextSteps === 'google' ? (
                            <>
                                <h2 className="section-title">Import into Google Calendar</h2>
                                <ol className="steps-list">
                                    <li>Open <strong>Google Calendar</strong> on a desktop computer.</li>
                                    <li>Click the <strong>gear icon</strong> at the top right, then select <strong>Settings</strong>.</li>
                                    <li>In the left sidebar, click <strong>Import & export</strong>.</li>
                                    <li>Click "Select file from your computer" and choose the <strong>.csv file</strong> you just downloaded.</li>
                                    <li><strong>Important:</strong> select the calendar you want to add these events to (e.g., your main calendar).</li>
                                    <li>Click <strong>Import</strong>.</li>
                                </ol>
                            </>
                        ) : (
                            <>
                                <h2 className="section-title">Import into Apple Calendar</h2>
                                <ol className="steps-list">
                                    <li>Find the downloaded <strong>.ics file</strong>.</li>
                                    <li><strong>Double-click</strong> or tap the file to open it.</li>
                                    <li>When prompted, confirm that you want to add the events to your calendar.</li>
                                    <li>Choose which calendar to add them to (e.g., "Home" or "Work") if asked.</li>
                                </ol>
                            </>
                        )}

                        <button className="btn-secondary" onClick={() => setShowNextSteps(false)}>Start over</button>
                    </div>
                )}
            </div>

            {renderModal()}
        </>
    );
}

export default Reminders;
