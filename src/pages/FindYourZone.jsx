import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ZoneMap from '../components/ZoneMap';
import { determineZone } from '../utils/zoneCoordinates';
import { setCookie } from '../utils/cookies';

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
            <div style={{ marginBottom: '20px' }}>
                <Link to="/schedule" style={{ color: 'var(--forest-green)', textDecoration: 'none', fontWeight: '500' }}>← Back to Schedule</Link>
            </div>

            <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '2rem', marginBottom: '10px', color: 'var(--forest-green)' }}>Find Your Zone</h1>
            <p style={{ marginBottom: '30px', color: '#666' }}>Enter your address to see which recycling zone you belong to.</p>

            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '30px', position: 'relative' }} ref={wrapperRef}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <input
                        type="text"
                        value={address}
                        onChange={(e) => {
                            setAddress(e.target.value);
                            if (!showSuggestions && e.target.value.length > 2) setShowSuggestions(true);
                        }}
                        onFocus={() => {
                            if (suggestions.length > 0) setShowSuggestions(true);
                        }}
                        placeholder="Enter your street address (e.g., 123 Maplewood Ave)"
                        style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '2px solid #e0e0e0', fontSize: '1rem' }}
                        autoComplete="off"
                    />
                    {showSuggestions && suggestions.length > 0 && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            backgroundColor: 'white',
                            border: '1px solid #e0e0e0',
                            borderTop: 'none',
                            borderRadius: '0 0 12px 12px',
                            zIndex: 1000,
                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                            maxHeight: '200px',
                            overflowY: 'auto'
                        }}>
                            {suggestions.map((item, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => selectSuggestion(item)}
                                    style={{
                                        padding: '12px 15px',
                                        cursor: 'pointer',
                                        borderBottom: idx === suggestions.length - 1 ? 'none' : '1px solid #eee',
                                        fontSize: '0.95rem',
                                        color: '#333'
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                                >
                                    {formatAddress(item)}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <button
                    type="submit"
                    className="btn-primary"
                    disabled={searching}
                    style={{ width: 'auto', marginTop: 0, padding: '0 30px', height: '100%' }}
                >
                    {searching ? 'Searching...' : 'Search'}
                </button>
            </form>

            {resultZone && (
                <div className="success-banner" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '1.2rem', marginBottom: '5px' }}>
                        You are in <strong>{resultZone} Zone</strong>!
                    </div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                        We've automatically selected this for you.
                    </div>
                    <Link to="/schedule" className="btn-primary" style={{ marginTop: '15px', textAlign: 'center', textDecoration: 'none', display: 'inline-block', width: 'auto', padding: '10px 20px', fontSize: '0.9rem' }}>
                        Go to Schedule
                    </Link>
                </div>
            )}

            {error && (
                <div style={{ backgroundColor: '#fee', color: '#c00', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
                    {error}
                </div>
            )}

            <div style={{ marginTop: '20px' }}>
                <ZoneMap
                    currentZone={resultZone}
                    onZoneSelect={(zone) => {
                        setResultZone(zone);
                        setCookie('recycling_zone', zone, 365);
                    }}
                    markerPosition={markerPosition}
                />
            </div>

            <p style={{ marginTop: '10px', fontSize: '0.85rem', color: '#888', textAlign: 'center' }}>
                Note: Map boundaries are approximate. If your address is near a border, please double-check with the official town map.
            </p>
        </>
    );
}

export default FindYourZone;
