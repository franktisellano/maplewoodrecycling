import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MONDAY_COORDS, TUESDAY_COORDS, WEDNESDAY_COORDS, MAP_CENTER } from '../utils/zoneCoordinates';

// Fix for default marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Draggable Marker Component
function DraggableMarker({ position, index, onDragEnd }) {
    const markerRef = useRef(null);

    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                    const { lat, lng } = marker.getLatLng();
                    onDragEnd(index, [lat, lng]);
                }
            },
        }),
        [index, onDragEnd],
    );

    return (
        <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
        />
    );
}

function ZoneEditor() {
    const [selectedZone, setSelectedZone] = useState('Monday');

    // Manage state for each zone's coordinates locally
    const [zones, setZones] = useState({
        Monday: [...MONDAY_COORDS],
        Tuesday: [...TUESDAY_COORDS],
        Wednesday: [...WEDNESDAY_COORDS]
    });

    const activeCoords = zones[selectedZone];

    const handlePointChange = (index, newPoint) => {
        const newCoords = [...activeCoords];
        newCoords[index] = newPoint;
        setZones({ ...zones, [selectedZone]: newCoords });
    };

    const addPoint = () => {
        // Add a point slightly offset from the last one to be visible
        if (activeCoords.length > 0) {
            const last = activeCoords[activeCoords.length - 1];
            const newPoint = [last[0] + 0.001, last[1] + 0.001];
            setZones({ ...zones, [selectedZone]: [...activeCoords, newPoint] });
        }
    };

    const removeLastPoint = () => {
        if (activeCoords.length > 3) {
            const newCoords = activeCoords.slice(0, -1);
            setZones({ ...zones, [selectedZone]: newCoords });
        }
    };

    const generateExportCode = () => {
        const formatCoords = (coords) => {
            return `[\n  ${coords.map(p => `[${p[0].toFixed(5)}, ${p[1].toFixed(5)}]`).join(',\n  ')}\n]`;
        };

        return `// Copy this into src/utils/zoneCoordinates.js

export const MONDAY_COORDS = ${formatCoords(zones.Monday)};

export const TUESDAY_COORDS = ${formatCoords(zones.Tuesday)};

export const WEDNESDAY_COORDS = ${formatCoords(zones.Wednesday)};

export const MAP_CENTER = [40.730, -74.270];
// ... keep the rest of the file (helper functions) as is`;
    };

    const zoneStyle = (color) => ({
        fillColor: color,
        weight: 2,
        opacity: 1,
        color: color,
        fillOpacity: 0.4
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '90vh', width: '100%', maxWidth: '1200px' }}>
            <div style={{ padding: '20px', background: '#fff', borderBottom: '1px solid #eee' }}>
                <h1 style={{ fontFamily: 'DM Serif Display', margin: '0 0 15px 0' }}>Zone Editor Tool</h1>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>

                    <div className="form-group" style={{ marginBottom: 0, minWidth: '200px' }}>
                        <label style={{ marginBottom: '5px' }}>Editing Zone:</label>
                        <select
                            value={selectedZone}
                            onChange={(e) => setSelectedZone(e.target.value)}
                            style={{ padding: '8px' }}
                        >
                            <option value="Monday">Monday (Green)</option>
                            <option value="Tuesday">Tuesday (Pink)</option>
                            <option value="Wednesday">Wednesday (Yellow)</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn-secondary" onClick={addPoint} style={{ marginTop: 0, width: 'auto', padding: '8px 15px' }}>+ Add Point</button>
                        <button className="btn-secondary" onClick={removeLastPoint} style={{ marginTop: 0, width: 'auto', padding: '8px 15px', borderColor: '#d32f2f', color: '#d32f2f' }}>- Remove Last Point</button>
                    </div>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px' }}>
                    Drag the markers to reshape the zone. Copy the code below when finished.
                </p>
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Map Panel */}
                <div style={{ flex: 2, position: 'relative' }}>
                    <MapContainer center={MAP_CENTER} zoom={13} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {/* Render all polygons for context */}
                        <Polygon positions={zones.Wednesday} pathOptions={zoneStyle('#F4B860')} />
                        <Polygon positions={zones.Tuesday} pathOptions={zoneStyle('#D48FB0')} />
                        <Polygon positions={zones.Monday} pathOptions={zoneStyle('#87C38F')} />

                        {/* Render markers ONLY for the active zone */}
                        {activeCoords.map((pos, idx) => (
                            <DraggableMarker
                                key={`${selectedZone}-${idx}`}
                                position={pos}
                                index={idx}
                                onDragEnd={handlePointChange}
                            />
                        ))}
                    </MapContainer>
                </div>

                {/* Code Output Panel */}
                <div style={{ flex: 1, padding: '20px', background: '#f8f9fa', borderLeft: '1px solid #ccc', overflowY: 'auto' }}>
                    <h3 style={{ marginTop: 0 }}>Export Data</h3>
                    <textarea
                        readOnly
                        value={generateExportCode()}
                        style={{
                            width: '100%',
                            height: '500px',
                            fontFamily: 'monospace',
                            fontSize: '0.85rem',
                            padding: '10px',
                            border: '1px solid #ccc',
                            borderRadius: '5px'
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

export default ZoneEditor;
