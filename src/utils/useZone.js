import { useState } from 'react';
import { setCookie, getCookie } from './cookies';

const COOKIE = 'recycling_zone';

/**
 * The visitor's zone ("Monday", "Tuesday" or "Wednesday"), remembered in a cookie
 * so every page opens on the same zone.
 */
export function useZone() {
    const [zone, setZoneState] = useState(() => getCookie(COOKIE) || 'Monday');

    const setZone = (next) => {
        setCookie(COOKIE, next, 365);
        setZoneState(next);
    };

    return [zone, setZone];
}
