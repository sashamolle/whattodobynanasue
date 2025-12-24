// config.js
// Stores "Environment Variables" for the static frontend.
// WARNING: Do not store private keys (like STRIPE_SECRET_KEY) here. ONLY public IDs.

window.ENV = {
    // GA4 Measurement ID
    GA4_MEASUREMENT_ID: 'G-BK0T845CB2',

    // API Base URL (Differentiates Localhost vs Production)
    // If hostname is localhost, use port 3001. Otherwise, use relative path (proxy).
    API_BASE: (window.location.hostname === 'localhost')
        ? 'http://localhost:3001'
        : ''
};

// Freeze object to prevent accidental modification
Object.freeze(window.ENV);
