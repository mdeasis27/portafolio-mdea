// Controlled navigation fixture for browser-component tests, not a route test.
exports.usePathname = () => '/' + window.__portfolioLocale + '/app';
exports.useParams = () => ({lang: window.__portfolioLocale});
exports.useSearchParams = () => new URLSearchParams();
