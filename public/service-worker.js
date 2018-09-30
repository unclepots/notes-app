importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.2.0/workbox-sw.js');

if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉`);
} else {
  console.log(`Boo! Workbox didn't load 😬`);
}

workbox.core.setLogLevel(4);

const cacheRoutes = ({url, event}) => {
  
  if(
    url.host === 'fonts.googleapis.com' || 
    url.pathname.match('.*\.(css|woff2|js|json|png|jpg|jpeg|svg|gif)$')
  ){
    return true;
  }

  return false;
}

const networkRoutes = ({url, event}) => {
  if(url.origin !== self.origin){
    return false;
  }

  if(url.pathname.match('\/$') && url.pathname.indexOf('auth') < 0){
    return true;
  }

  console.log(url)
  console.log(event)

  return false;
}

workbox.routing.registerRoute(
  cacheRoutes,
  workbox.strategies.networkFirst({
    cacheName: 'cacheFirst',
    plugins: [
      new workbox.expiration.Plugin({
        // Cache for a maximum of a week
        maxAgeSeconds: 14 * 24 * 60 * 60,
      })
    ],
  })
);

workbox.routing.registerRoute(
  // Cache image files
  networkRoutes,
  // Use the cache if it's available
  workbox.strategies.networkFirst({
    // Use a custom cache name
    cacheName: 'networkFirst',
    plugins: [
      new workbox.expiration.Plugin({
        // Cache for a maximum of a week
        maxAgeSeconds: 14 * 24 * 60 * 60,
      })
    ],
  })
);

self.addEventListener('install', (e) => {
  self.skipWaiting();
});