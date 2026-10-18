import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ZoneMap from '../components/ZoneMap';
import { determineZone } from '../utils/zoneCoordinates';
import { setCookie } from '../utils/cookies';
import { ZONE_DISPLAY_NAMES } from '../utils/recycling';
import PageHead from '../components/PageHead';

// Simple debounce hook
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

function FindYourZone() {
    const [address, setAddress] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searching, setSearching] = useState(false);
    const [resultZone, setResultZone] = useState(null);
    const [markerPosition, setMarkerPosition] = useState(null);
    const [error, setError] = useState(null);

    const debouncedAddress = useDebounce(address, 300);
    const wrapperRef = useRef(null);

    // Auto-search suggestions
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!debouncedAddress || debouncedAddress.length < 3) {
                setSuggestions([]);
                return;
            }

            // If we just selected a value (searching is strictly for the result view), 
            // we probably don't want to re-open suggestions immediately unless typed.
            // But relying on showSuggestions toggles handles this info.

            try {
                // Bias search to Maplewood, NJ area with a viewbox
                // Box approx: West -74.33, North 40.78, East -74.20, South 40.68
                const viewbox = "-74.33,40.78,-74.20,40.68";

                // We keep the query focused on "Maplewood NJ" context but allow the viewbox to guide it too.
                const query = `${debouncedAddress} Maplewood NJ`;
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5&countrycodes=us&viewbox=${viewbox}&bounded=1`);
                const data = await response.json();

                if (data) {
                    setSuggestions(data);
                    setShowSuggestions(true);
                }
            } catch (err) {
                console.error("Autocomplete fetch error:", err);
            }
        };

        // Only fetch if we are focusing or typing (managed by not searching)
        if (!searching) {
            fetchSuggestions();
        }
    }, [debouncedAddress]);

    // Close suggestions on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const formatAddress = (item) => {
        const addr = item.address;
        if (addr && (addr.house_number || addr.road)) {
            const parts = [];
            if (addr.house_number) parts.push(addr.house_number);
            if (addr.road) parts.push(addr.road);
            return parts.join(' ');
        }
        return item.display_name.split(',')[0];
    };

    const selectSuggestion = (item) => {
        // Use the formatted address for the input
        setAddress(formatAddress(item));
        setShowSuggestions(false);
        setSuggestions([]);

        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);

        processSearchResult(lat, lon);
    };

    const processSearchResult = (lat, lon) => {
        setSearching(true);
        setError(null);
        setResultZone(null);
        setMarkerPosition([lat, lon]);

        const foundZone = determineZone(lat, lon);
        if (foundZone) {
            setResultZone(foundZone);
            setCookie('recycling_zone', foundZone, 365);
        } else {
            setError("Address found, but it looks like it's outside our known recycling zones. Please select your zone manually or check the map.");
        }
        setSearching(false);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!address.trim()) return;

        setSearching(true);
        setShowSuggestions(false);
        setError(null);
        setResultZone(null);
        setMarkerPosition(null);

        try {
            const query = `${address}, Maplewood, NJ`;
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
            const data = await response.json();

            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);
                processSearchResult(lat, lon);
            } else {
                setError("Address not found. Please try again.");
                setSearching(false);
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
            setSearching(false);
        }
    };

    return (
        <>
            <PageHead eyebrow="Zone lookup" title="Find your zone">
                <p className="lede">Enter your street address to see which recycling zone you're in, or tap your area on the map.</p>
            </PageHead>

            <div className="page">
                <form className="address-search" onSubmit={handleSearch} ref={wrapperRef}>
                    <div className="address-field">
                        <label className="visually-hidden" htmlFor="address">Street address</label>
                        <input
                            id="address"
                            type="text"
                            value={address}
                            onChange={(e) => {
                                setAddress(e.target.value);
                                if (!showSuggestions && e.target.value.length > 2) setShowSuggestions(true);
                            }}
                            onFocus={() => {
                                if (suggestions.length > 0) setShowSuggestions(true);
                            }}
                            placeholder="e.g. 123 Maplewood Ave"
                            autoComplete="off"
                        />
                        {showSuggestions && suggestions.length > 0 && (
                            <ul className="suggestions">
                                {suggestions.map((item, idx) => (
                                    <li key={idx}>
                                        <button type="button" onClick={() => selectSuggestion(item)}>
                                            {formatAddress(item)}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <button type="submit" className="btn-primary" disabled={searching}>
                        {searching ? 'Searching…' : 'Search'}
                    </button>
                </form>

                {resultZone && (
                    <div className="notice success" role="status">
                        <p className="notice-title">You're in {ZONE_DISPLAY_NAMES[resultZone]}, with pickup on {resultZone}s.</p>
                        <p>We've saved this as your zone.</p>
                        <Link className="more" to="/"><span className="label">See your schedule</span> <span className="arrow">→</span></Link>
                    </div>
                )}

                {error && (
                    <div className="notice warn" role="alert">
                        <p>{error}</p>
                    </div>
                )}

                <ZoneMap
                    currentZone={resultZone}
                    onZoneSelect={(zone) => {
                        setResultZone(zone);
                        setCookie('recycling_zone', zone, 365);
                    }}
                    markerPosition={markerPosition}
                />

                <p className="aside">
                    Map boundaries are approximate. If you're near a border, double-check with the official township map.
                </p>
            </div>
        </>
    );
}

export default FindYourZone;
