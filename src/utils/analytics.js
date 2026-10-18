import { getCookie } from './cookies';

/**
 * Anonymous usage counts, so we know what's used and how many neighbors use the site (PostHog, US). This is the
 * SOMA Labs project that SOMA Commute also reports to: every event says which product it's from, so the admin
 * console can count each one alone or all of them together.
 *
 * No account, name or location: each browser gets a random ID that isn't tied to anything else, PostHog keeps no
 * person profile for it, drops IP addresses and doesn't guess a place from them. Events say only the page and the
 * pickup zone (one of three). Nothing is sent when the browser asks not to be tracked (Global Privacy Control or Do
 * Not Track).
 */

// The project's public capture key: it can only send events, not read them.
const projectKey = 'phc_BUUkwj9RybgAcwDuNtNnjqVH8kLAbMAgj3VShEFmkmkb';
const endpoint = 'https://us.i.posthog.com/i/v0/e/';

const Key = { id: 'analyticsID' };

/** Which visits count: the real site, Netlify's deploy previews, or a machine running `npm run dev`. */
function channel() {
    const host = location.hostname;
    if (host === 'maplewoodrecycling.com' || host === 'www.maplewoodrecycling.com') return 'prod';
    if (host.endsWith('.netlify.app')) return 'preview';
    return 'dev';
}

// Storage can be missing or throw (private windows, blocked site data): then nothing is counted.
function read(key) {
    try { return localStorage.getItem(key); } catch { return null; }
}
function write(key, value) {
    try { value == null ? localStorage.removeItem(key) : localStorage.setItem(key, value); } catch { /* not counted */ }
}

const enabled = () => navigator.globalPrivacyControl !== true && navigator.doNotTrack !== '1';

function visitorID() {
    let id = read(Key.id);
    if (!id) {
        id = crypto.randomUUID();
        write(Key.id, id);
    }
    return read(Key.id) === id ? id : null;
}

/** One event. Sent right away and forgotten: a lost count doesn't matter. */
export function capture(event, properties = {}) {
    if (!enabled()) return;
    const id = visitorID();
    if (!id) return;
    const body = {
        api_key: projectKey,
        event,
        distinct_id: id,
        timestamp: new Date().toISOString(),
        properties: {
            ...properties,
            $process_person_profile: false,
            $geoip_disable: true,
            $lib: 'soma-web',
            product: 'recycling',
            channel: channel(),
            zone: getCookie('recycling_zone') ?? 'none',
        },
    };
    fetch(endpoint, {
        method: 'POST',
        // Plain text keeps it a simple request (no CORS preflight); PostHog reads the JSON either way.
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(body),
        keepalive: true,
    }).catch(() => {});
}

/** "page viewed", once per page a visitor lands on or moves to. */
export function pageViewed(path) {
    capture('page viewed', { path });
}
