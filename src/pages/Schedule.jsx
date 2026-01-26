import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { generateScheduleData, formatDateDisplay } from '../utils/recycling';
import { setCookie, getCookie } from '../utils/cookies';


function Schedule() {
    const [zone, setZone] = useState(() => {
        return getCookie('recycling_zone') || 'Monday';
    });
    const [showAll, setShowAll] = useState(false);
    const [schedule, setSchedule] = useState([]);
    const rowRefs = React.useRef({});
    const containerRef = React.useRef(null);

    useEffect(() => {
        setCookie('recycling_zone', zone, 365);
        setSchedule(generateScheduleData(zone));
    }, [zone]);

    // Find the first future or today pickup
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find index of first date >= today
    const upcomingIndex = schedule.findIndex(week => {
        const d = new Date(week.pickupDate);
        d.setHours(0, 0, 0, 0);
        return d >= today;
    });

    // Auto-scroll effect
    useEffect(() => {
        if (showAll && upcomingIndex !== -1 && rowRefs.current[upcomingIndex] && containerRef.current) {
            const rowElement = rowRefs.current[upcomingIndex];
            const containerElement = containerRef.current;
            containerElement.scrollTop = rowElement.offsetTop - containerElement.offsetTop;
        }
    }, [schedule, upcomingIndex, showAll]);

    // Prepare visible rows
    const visibleWeeks = schedule
        .map((week, index) => ({ ...week, originalIndex: index }))
        .filter(week => {
            const d = new Date(week.pickupDate);
            d.setHours(0, 0, 0, 0);
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            return d >= yesterday;
        });

    const displayedWeeks = showAll ? visibleWeeks : visibleWeeks.slice(0, 4);

    return (
        <>
            <div className="form-group">
                <label htmlFor="zone-select">
                    Select Your Zone
                    <span className="schedule-sub">Not sure which zone? <Link to="/find-zone">Find your zone here</Link>.</span>
                </label>
                <select
                    id="zone-select"
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                >
                    <option value="Monday">Zone 1 & 2 (Monday Pickup)</option>
                    <option value="Tuesday">Zone 3 & 4 (Tuesday Pickup)</option>
                    <option value="Wednesday">Zone 5 & 6 (Wednesday Pickup)</option>
                </select>
            </div>

            <div
                className="table-container"
                ref={containerRef}
                style={{ maxHeight: '500px', border: '1px solid #eee', borderRadius: '12px', position: 'relative', display: 'flex', flexDirection: 'column' }}
            >
                <table id="schedule-table">
                    <thead>
                        <tr>
                            <th>Pickup Date</th>
                            <th>Recycling Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedWeeks.map((week) => {
                            const isUpcoming = week.originalIndex === upcomingIndex;
                            return (
                                <tr
                                    key={week.originalIndex}
                                    className={isUpcoming ? 'upcoming-row' : ''}
                                    ref={el => rowRefs.current[week.originalIndex] = el}
                                >
                                    <td>
                                        {formatDateDisplay(week.pickupDate)}
                                        {week.isDelayed && (
                                            <span className="holiday-tag">Delayed ({week.delayReason})</span>
                                        )}
                                        {isUpcoming && (
                                            <span style={{
                                                display: 'block',
                                                fontSize: '0.75rem',
                                                color: 'var(--forest-green)',
                                                marginTop: '4px'
                                            }}>
                                                Next Pickup
                                            </span>
                                        )}
                                    </td>
                                    <td
                                        className="type-badge"
                                        style={{ color: week.type === 'Fibers' ? 'var(--earth)' : 'var(--forest-green)' }}
                                    >
                                        {week.type}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {!showAll && (
                    <div style={{ padding: '15px', textAlign: 'center', borderTop: '1px solid #eee' }}>
                        <button
                            onClick={() => setShowAll(true)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--forest-green)',
                                textDecoration: 'underline',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: '500'
                            }}
                        >
                            View Annual Schedule
                        </button>
                    </div>
                )}
                {showAll && (
                    <div style={{ padding: '15px', textAlign: 'center', borderTop: '1px solid #eee' }}>
                        <button
                            onClick={() => setShowAll(false)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--forest-green)',
                                textDecoration: 'underline',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: '500'
                            }}
                        >
                            Show Less
                        </button>
                    </div>
                )}
            </div>

            <div className="cta-card">
                <h3>Want this on your phone?</h3>
                <p>Generate a Google Calendar file with reminders.</p>
                <Link
                    to="/reminders"
                    className="btn-primary"
                    style={{ display: 'inline-block', textDecoration: 'none', padding: '12px 24px', fontSize: '1rem', width: 'auto', marginTop: '5px', textAlign: 'center' }}
                >
                    Go to Calendar Generator
                </Link>
            </div>
        </>
    );
}

export default Schedule;
