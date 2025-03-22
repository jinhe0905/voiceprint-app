const CACHE_NAME = 'voiceprint-app-v1';
const ASSETS = [
  './',
  './index.html',
  './login.html',
  './dashboard.html',
  './verify.html',
  './profile.html',
  './css/style.css',
  './css/login.css',
  './css/dashboard.css',
  './css/verify.css',
  './css/profile.css',
  './js/app.js',
  './js/login.js',
  './js/dashboard.js',
  './js/verify.js',
  './js/profile.js',
  './js/deepseek-api.js',
  './js/audio-recorder.js',
  './js/voiceprint.js',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// 安装Service Worker
self.addEventListener('install', event => {
  console.log('安装Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('缓存应用资源');
        return cache.addAll(ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// 激活Service Worker
self.addEventListener('activate', event => {
  console.log('激活Service Worker...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('清理旧缓存:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 拦截网络请求
self.addEventListener('fetch', event => {
  console.log('拦截请求:', event.request.url);
  
  // 对API请求使用网络优先策略
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
  } else {
    // 对静态资源使用缓存优先策略
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          return cachedResponse || fetch(event.request).then(response => {
            return caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, response.clone());
              return response;
            });
          });
        })
    );
  }
}); 