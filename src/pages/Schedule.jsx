import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { generateScheduleData, formatDateDisplay, getPickupBannerInfo, addDays, TYPE_DETAILS } from '../utils/recycling';
import { useZone } from '../utils/useZone';
import PageHead from '../components/PageHead';
import Painting from '../components/Painting';
import ZonePicker from '../components/ZonePicker';

const UPCOMING_COUNT = 4;

function TypeLabel({ type }) {
    return (
        <span className={`type type-${type.toLowerCase()}`}>
            <span className="type-name">{type}</span>
            <span className="type-detail">{TYPE_DETAILS[type]}</span>
        </span>
    );
}

function Schedule() {
    const [zone, setZone] = useZone();
    const [showAll, setShowAll] = useState(false);

    const schedule = generateScheduleData(zone);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Index of the first pickup today or later
    const upcomingIndex = schedule.findIndex(week => {
        const d = new Date(week.pickupDate);
        d.setHours(0, 0, 0, 0);
        return d >= today;
    });
    const next = upcomingIndex === -1 ? null : schedule[upcomingIndex];
    const later = upcomingIndex === -1 ? [] : schedule.slice(upcomingIndex + 1);
    const displayedWeeks = showAll ? later : later.slice(0, UPCOMING_COUNT);

    const formatLongDate = (date) => date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const formatBannerDate = (date) => date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    const formatShortDate = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // When to put the bin out, in words
    const putOutText = (pickupDate) => {
        const days = Math.round((new Date(pickupDate).setHours(0, 0, 0, 0) - today) / 86400000);
        if (days === 0) return 'Pickup is today. If it isn’t out yet, put it out now.';
        if (days === 1) return 'Put it out tonight.';
        const evening = addDays(pickupDate, -1).toLocaleDateString('en-US', { weekday: 'long' });
        return `Put it out ${evening} evening.`;
    };

    const bannerInfo = getPickupBannerInfo(zone);

    const renderPickupBanner = () => {
        if (!bannerInfo) return null;

        const isPickupDay = today.getTime() === new Date(bannerInfo.newDate).setHours(0, 0, 0, 0);
        const eveningDate = addDays(bannerInfo.newDate, -1);

        return (
            <div className="notice" role="status">
                <p className="notice-title">{bannerInfo.zoneName} pickup moved this week</p>
                <p>
                    Recycling moved from {formatBannerDate(bannerInfo.originalDate)} to {formatBannerDate(bannerInfo.newDate)}.{' '}
                    {isPickupDay
                        ? 'Put out your recycling now.'
                        : `Put out your recycling the evening of ${formatShortDate(eveningDate)}.`}
                </p>
            </div>
        );
    };

    return (
        <>
            <PageHead eyebrow="Maplewood, NJ · 2026" title="Recycling schedule" scenery={false}>
                <ZonePicker zone={zone} onChange={setZone} />

                {renderPickupBanner()}

                {next ? (
                    <section className="next-pickup" aria-labelledby="next-pickup-label">
                        <div className="next-text">
                            <p className="eyebrow" id="next-pickup-label">Next pickup</p>
                            <p className="next-date">{formatLongDate(next.pickupDate)}</p>
                            <p className="next-type">
                                <TypeLabel type={next.type} />
                                {next.isDelayed && <span className="delay-tag">Delayed a day · {next.delayReason}</span>}
                            </p>
                            <p className="next-when">{putOutText(next.pickupDate)}</p>
                            <Link className="next-guide" to="/guidelines">
                                What goes in {next.type === 'Fibers' ? 'fiber' : 'commingled'} week →
                            </Link>
                        </div>
                        <Painting name={next.type === 'Fibers' ? 'fibers' : 'commingled'} className="next-art" />
                    </section>
                ) : (
                    <section className="next-pickup">
                        <p>That's every pickup on the 2026 schedule. The 2027 schedule will be here once the township publishes it.</p>
                    </section>
                )}
            </PageHead>

            <Painting name="street" className="street" />

            {later.length > 0 && (
                <section className="page" aria-labelledby="later-title">
                    <h2 className="section-title" id="later-title">After that</h2>
                    <ol className="weeks">
                        {displayedWeeks.map((week) => (
                            <li key={week.pickupDate.getTime()}>
                                <span className="week-date">
                                    {formatDateDisplay(week.pickupDate)}
                                    {week.isDelayed && <span className="delay-tag">Delayed · {week.delayReason}</span>}
                                </span>
                                <TypeLabel type={week.type} />
                            </li>
                        ))}
                    </ol>
                    {later.length > UPCOMING_COUNT && (
                        <button className="link-button" onClick={() => setShowAll(!showAll)}>
                            {showAll ? 'Show less' : 'Show the rest of the year'}
                        </button>
                    )}
                </section>
            )}

            <section className="page">
                <Painting name="brush" className="brush-rule" />
                <div className="cta">
                    <h2 className="section-title">Never forget to put out your bin</h2>
                    <p>Add every pickup to your calendar, with a reminder the night before or the morning of.</p>
                    <Link className="btn-primary" to="/reminders">Set up reminders</Link>
                </div>
            </section>
        </>
    );
}

export default Schedule;
