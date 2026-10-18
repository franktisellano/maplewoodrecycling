import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Tooltip, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MONDAY_COORDS, TUESDAY_COORDS, WEDNESDAY_COORDS, MAP_CENTER } from '../utils/zoneCoordinates';

// Fix for default marker icons in React-Leaflet/Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function MapController({ center, zoom, markerPosition }) {
    const map = useMap();
    useEffect(() => {
        if (markerPosition) {
            map.flyTo(markerPosition, 15);
        } else if (center) {
            // map.setView(center, zoom);
        }
    }, [markerPosition, center, zoom, map]);
    return null;
}

function ZoneMap({ onZoneSelect, currentZone, markerPosition }) {

    const zoneStyle = (zoneName, color, isSelected) => ({
        fillColor: color,
        weight: isSelected ? 3 : 1,
        opacity: 1,
        color: isSelected ? '#2f3a33' : '#f8f3e8', // Ink border if selected
        dashArray: isSelected ? '' : '3',
        fillOpacity: isSelected ? 0.7 : 0.4
    });

    return (
        <div className="zone-map">
            <MapContainer center={MAP_CENTER} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Wednesday: Zones 5 & 6 */}
                <Polygon
                    positions={WEDNESDAY_COORDS}
                    pathOptions={zoneStyle('Wednesday', '#c99b62', currentZone === 'Wednesday')}
                    eventHandlers={{
                        click: () => onZoneSelect && onZoneSelect('Wednesday'),
                        mouseover: (e) => { e.target.setStyle({ fillOpacity: 0.7 }); },
                        mouseout: (e) => { e.target.setStyle({ fillOpacity: currentZone === 'Wednesday' ? 0.7 : 0.4 }); }
                    }}
                >
                    <Tooltip sticky>Zone 5 & 6 (Wednesday)</Tooltip>
                </Polygon>

                {/* Tuesday: Zones 3 & 4 */}
                <Polygon
                    positions={TUESDAY_COORDS}
                    pathOptions={zoneStyle('Tuesday', '#6f93ad', currentZone === 'Tuesday')}
                    eventHandlers={{
                        click: () => onZoneSelect && onZoneSelect('Tuesday'),
                        mouseover: (e) => { e.target.setStyle({ fillOpacity: 0.7 }); },
                        mouseout: (e) => { e.target.setStyle({ fillOpacity: currentZone === 'Tuesday' ? 0.7 : 0.4 }); }
                    }}
                >
                    <Tooltip sticky>Zone 3 & 4 (Tuesday)</Tooltip>
                </Polygon>

                {/* Monday: Zones 1 & 2 */}
                <Polygon
                    positions={MONDAY_COORDS}
                    pathOptions={zoneStyle('Monday', '#7f9f78', currentZone === 'Monday')}
                    eventHandlers={{
                        click: () => onZoneSelect && onZoneSelect('Monday'),
                        mouseover: (e) => { e.target.setStyle({ fillOpacity: 0.7 }); },
                        mouseout: (e) => { e.target.setStyle({ fillOpacity: currentZone === 'Monday' ? 0.7 : 0.4 }); }
                    }}
                >
                    <Tooltip sticky>Zone 1 & 2 (Monday)</Tooltip>
                </Polygon>

                {markerPosition && <Marker position={markerPosition} />}

                <MapController center={MAP_CENTER} zoom={13} markerPosition={markerPosition} />
            </MapContainer>
        </div>
    );
}

export default ZoneMap;
