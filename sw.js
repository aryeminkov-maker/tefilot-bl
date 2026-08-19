// Service Worker מינימלי - נדרש על ידי הדפדפן כדי לאפשר "הוספה למסך הבית" כהתקנה אמיתית (PWA).
// לא מבצע caching בכוונה, כדי לא להתערב בנתונים החיים שמגיעים מ-Firebase.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});

// ---------- התראות Push (FCM) ----------
// מטפל בהתראה שמגיעה מה-Worker (Cloudflare) דרך Firebase Cloud Messaging, כשהאפליקציה סגורה/ברקע.
// לא משתמשים בספריית firebase-messaging-sw.js הרשמית בכוונה - כדי לא להוסיף עוד תלות חיצונית
// ל-Service Worker המינימלי הזה; מטפלים ישירות באירוע Push הסטנדרטי של הדפדפן (Push API).
self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (e) {
    payload = {};
  }
  // המבנה ששולח ה-Worker: { notification: { title, body }, webpush: { fcm_options: { link } } } -
  // אבל FCM עצמו עשוי לעטוף את זה מעט אחרת בהגעה בפועל ל-Push API, לכן בודקים כמה אפשרויות.
  const notification = payload.notification || payload.data || payload || {};
  const title = notification.title || 'תפילות ושיעורי תורה בבית אל';
  const body = notification.body || '';
  const link = (payload.fcm_options && payload.fcm_options.link)
    || (payload.webpush && payload.webpush.fcm_options && payload.webpush.fcm_options.link)
    || './';

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      // לא מציינים icon/badge כאן בכוונה - אייקוני האתר מוטמעים כ-base64 בתוך index.html עצמו
      // (apple-touch-icon / favicon), אין קובץ תמונה נפרד שאפשר להצביע אליו כאן. בלי זה, הדפדפן
      // פשוט יציג אייקון ברירת מחדל גנרי במקום לוגו האתר - לא אידיאלי אך לגמרי תקין.
      dir: 'rtl',
      lang: 'he',
      data: { link }
    })
  );
});

// לחיצה על ההתראה עצמה - פותח את האתר, או מעביר פוקוס לטאב קיים אם האתר כבר פתוח באחד מהם
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const link = (event.notification.data && event.notification.data.link) || './';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
      for (const client of clientsArr) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(link);
    })
  );
});
