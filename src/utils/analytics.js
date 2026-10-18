import posthog from 'posthog-js';
import { getCookie } from './cookies';

/**
 * Usage counts with PostHog's standard web SDK, into the SOMA Labs project that every product reports to.
 * Page views, sessions and bot filtering come from the SDK. We add which product this is, which channel
 * (so test visits never count as real ones) and the visitor's pickup zone. No location: GeoIP is off.
 * Nothing is sent when the browser asks not to be tracked (Do Not Track or Global Privacy Control).
 */

// The project's public capture key: it can only send events, not read them.
const projectKey = 'phc_BUUkwj9RybgAcwDuNtNnjqVH8kLAbMAgj3VShEFmkmkb';

/** Which visits count: the real site, Netlify's deploy previews, or a machine running `npm run dev`. */
function channel() {
    const host = location.hostname;
    if (host === 'maplewoodrecycling.com' || host === 'www.maplewoodrecycling.com') return 'prod';
    if (host.endsWith('.netlify.app')) return 'preview';
    return 'dev';
}

const zone = () => getCookie('recycling_zone') ?? 'none';

posthog.init(projectKey, {
    api_host: 'https://us.i.posthog.com',
    defaults: '2026-05-30',
    respect_dnt: true,
    loaded: (ph) => ph.register({ product: 'recycling', channel: channel(), zone: zone(), $geoip_disable: true }),
});

/** One of our own events, like "zone found", alongside PostHog's automatic page views. */
export function capture(event, properties = {}) {
    posthog.register({ zone: zone() });
    posthog.capture(event, properties);
}
