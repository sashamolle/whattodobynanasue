// config.js
// Stores "Environment Variables" for the static frontend.
// WARNING: Do not store private keys (like STRIPE_SECRET_KEY) here. ONLY public IDs.

window.ENV = {
    // GA4 Measurement ID
    GA4_MEASUREMENT_ID: 'G-BK0T845CB2',

    // API Base URL (Differentiates Localhost vs Production)
    // If hostname is localhost, use port 3001. Otherwise, use relative path (proxy).
    API_BASE: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:')
        ? 'http://localhost:3001'
        : '',

    // Stripe Publishable Key
    // Replace with your LIVE key (pk_live_...) when ready for production
    STRIPE_PK: 'pk_test_51Sgmzs0JW9TGIeXSW1dfxballtkTvMzEbGAHSB0pwrwiOlLQmO1IpXayh8sIv5GA20k9QuvDMRy3ml97q9gEnxi600kEZ6CtSx'
};

// Freeze object to prevent accidental modification
Object.freeze(window.ENV);
