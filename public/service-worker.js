importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.2.0/workbox-sw.js');

const static_items = [
  './',
  './main/main.css',
  './main/main.js',
  './main/note.css',
  './main/note.js',
  './manifest.json',
  './main/note_fallback.json',
  'https://fonts.googleapis.com/css?family=Roboto',
  'https://code.jquery.com/jquery-3.3.1.slim.min.js'
];

if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉`);
} else {
  console.log(`Boo! Workbox didn't load 😬`);
}

workbox.routing.registerRoute(
  'https://fonts.googleapis.com/css?family=Roboto',
  workbox.strategies.staleWhileRevalidate({
    // Use a custom cache name
    cacheName: 'font-cache',
  })
);

workbox.routing.registerRoute(
  /.*\.js/,
  workbox.strategies.staleWhileRevalidate({
    // Use a custom cache name
    cacheName: 'js-cache',
  })
);

workbox.routing.registerRoute(
  // Cache CSS files
  /.*\.css/,
  // Use cache but update in the background ASAP
  workbox.strategies.staleWhileRevalidate({
    // Use a custom cache name
    cacheName: 'css-cache',
  })
);

workbox.routing.registerRoute(
  // Cache image files
  /.*\.(?:png|jpg|jpeg|svg|gif)/,
  // Use the cache if it's available
  workbox.strategies.cacheFirst({
    // Use a custom cache name
    cacheName: 'image-cache',
    plugins: [
      new workbox.expiration.Plugin({
        // Cache only 20 images
        maxEntries: 20,
        // Cache for a maximum of a week
        maxAgeSeconds: 7 * 24 * 60 * 60,
      })
    ],
  })
);