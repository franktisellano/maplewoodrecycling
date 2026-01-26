// Revised approximate boundaries for Maplewood Zones based on the map image.
// Matches 'Monday' (South + Elmwood), 'Tuesday' (Center/Valley/Prospect), 'Wednesday' (West/Hill).

export const MONDAY_COORDS = [
    // The "L" shape: Bottom area (South of Springfield) + Right strip (Elmwood)
    [40.736, -74.242], // Top Right (border with Irvington/Newark near Elmwood)
    [40.736, -74.252], // Top Left of Elmwood strip
    [40.724, -74.254], // Inner corner (Springfield Ave & Elmwood boundary)
    [40.721, -74.275], // Along Springfield Ave Westwards
    [40.710, -74.278], // SW corner (Millburn border)
    [40.708, -74.265], // Bottom edge
    [40.715, -74.240], // SE corner
    [40.736, -74.242]  // Close loop
];

export const TUESDAY_COORDS = [
    // The Center Wedge (Valley St, Prospect St, N of Springfield)
    [40.748, -74.265], // Top North (South Orange border)
    [40.736, -74.252], // Right edge (Meeting Elmwood strip)
    [40.724, -74.254], // Bottom Right (Springfield Ave)
    [40.721, -74.275], // Bottom Left (Springfield & Ridgewood area)
    [40.742, -74.275], // Left edge (Border with Wednesday)
    [40.748, -74.265]  // Close loop
];

export const WEDNESDAY_COORDS = [
    // The West/North Hill (West of Ridgewood roughly)
    [40.760, -74.282], // Top Tip (The Neck)
    [40.748, -74.270], // Top Right (Meeting Tuesday)
    [40.742, -74.275], // Middle Right (Border with Tuesday)
    [40.721, -74.275], // Bottom Right (Springfield Ave area)
    [40.718, -74.285], // Bottom Left (Millburn/Springfield)
    [40.735, -74.298], // West Bulge (Reservation)
    [40.760, -74.282]  // Close loop
];

export const MAP_CENTER = [40.730, -74.270];

export function isPointInPolygon(point, vs) {
    // point = [lat, lng]
    // vs = [[lat, lng], [lat, lng], ...]

    var x = point[0], y = point[1];

    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];

        var intersect = ((yi > y) !== (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
}

export function determineZone(lat, lng) {
    const point = [lat, lng];
    if (isPointInPolygon(point, MONDAY_COORDS)) return 'Monday';
    if (isPointInPolygon(point, TUESDAY_COORDS)) return 'Tuesday';
    if (isPointInPolygon(point, WEDNESDAY_COORDS)) return 'Wednesday';
    return null;
}
