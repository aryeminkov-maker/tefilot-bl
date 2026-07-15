// Service Worker מינימלי - נדרש על ידי הדפדפן כדי לאפשר "הוספה למסך הבית" כהתקנה אמיתית (PWA).
// לא מבצע caching בכוונה, כדי לא להתערב בנתונים החיים שמגיעים מ-Firebase.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
