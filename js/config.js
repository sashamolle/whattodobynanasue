// config.js
// Stores "Environment Variables" for the static frontend.
// WARNING: Do not store private keys (like STRIPE_SECRET_KEY) here. ONLY public IDs.

window.ENV = {
    // GA4 Measurement ID
    GA4_MEASUREMENT_ID: 'G-BK0T845CB2',

    // Enable/Disable Analytics (disable for localhost testing)
    ENABLE_ANALYTICS: !(window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.startsWith('192.168.')),

    // API Base URL (Differentiates Localhost vs Production)
    // If hostname is localhost/127.0.0.1/local IP, use backend on port 3001
    // Otherwise, use relative path (proxy for production)
    API_BASE: (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.startsWith('192.168.') ||
        window.location.protocol === 'file:')
        ? `http://${window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'localhost' : window.location.hostname}:3001`
        : '',


    // Stripe Publishable Key
    // Use test key for localhost, live key for production
    STRIPE_PK: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'pk_test_51Sgmzs0JW9TGIeXSW1dfxballtkTvMzEbGAHSB0pwrwiOlLQmO1IpXayh8sIv5GA20k9QuvDMRy3ml97q9gEnxi600kEZ6CtSx'  // Test key for local
        : 'pk_live_51Sgmzi0YXinpks17uQJsIrOoeBT1GUtwazNR60tTzzBUUAvpL1yTusWgVYFTf0I48KEAksBUaXD3MUa401VSbHcO00EV31U2pO',  // Live key for production

    // Google Maps Review URL  
    // Direct link to write a review for what2dobaby
    GOOGLE_REVIEW_URL: 'https://www.google.com/maps/place//data=!4m3!3m2!1s0x244ca95d95124c15:0x9975f6e1d5120242!12e1?source=g.page.m.np._&laa=nmx-review-solicitation-promoted-recommendation-card'
};

// Freeze object to prevent accidental modification
Object.freeze(window.ENV);
