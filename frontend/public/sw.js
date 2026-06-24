self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());

// Minimum requirement for PWA installability in Chrome
self.addEventListener('fetch', (event) => {
  // We can add actual caching logic here later if needed
});
