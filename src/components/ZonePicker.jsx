import React from 'react';
import { Link } from 'react-router-dom';
import { ZONE_DISPLAY_NAMES } from '../utils/recycling';

const DAYS = ['Monday', 'Tuesday', 'Wednesday'];

// The three zones as one row of choices, with a way out for people who don't know theirs.
function ZonePicker({ zone, onChange, legend = 'Your zone' }) {
    return (
        <fieldset className="zone-picker">
            <legend>
                {legend}
                <span className="hint">Not sure? <Link to="/find-zone">Look up your address</Link>.</span>
            </legend>
            <div className="choices">
                {DAYS.map(day => (
                    <label key={day} className="choice">
                        <input
                            type="radio"
                            name="zone"
                            value={day}
                            checked={zone === day}
                            onChange={() => onChange(day)}
                        />
                        <span className="choice-body">
                            <span className="choice-title">{ZONE_DISPLAY_NAMES[day]}</span>
                            <span className="choice-sub">{day}s</span>
                        </span>
                    </label>
                ))}
            </div>
        </fieldset>
    );
}

export default ZonePicker;
