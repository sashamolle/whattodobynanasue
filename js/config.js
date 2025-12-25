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
    STRIPE_PK: 'pk_live_51Sgmzi0YXinpks17uQJsIrOoeBT1GUtwazNR60tTzzBUUAvpL1yTusWgVYFTf0I48KEAksBUaXD3MUa401VSbHcO00EV31U2pO'
};

// Freeze object to prevent accidental modification
Object.freeze(window.ENV);
