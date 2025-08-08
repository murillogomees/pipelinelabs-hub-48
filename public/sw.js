
const CACHE_NAME = 'app-cache-v1';
const CACHE_SIZE_LIMIT = 50; // Maximum number of cached responses

// List of URLs to cache on install
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('🔧 Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Service Worker: Caching static assets');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('✅ Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ Service Worker: Installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Activation complete');
        return self.clients.claim();
      })
      .catch(error => {
        console.error('❌ Service Worker: Activation failed:', error);
      })
  );
});

// Fetch event - implement caching strategy
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension requests
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  try {
    const url = new URL(request.url);
    
    // For HTML pages, use network-first strategy
    if (request.destination === 'document' || url.pathname.endsWith('.html') || url.pathname === '/') {
      return await networkFirstStrategy(request);
    }
    
    // For static assets, use cache-first strategy
    if (isStaticAsset(request)) {
      return await cacheFirstStrategy(request);
    }
    
    // For API calls, use network-first with short cache
    if (url.pathname.startsWith('/api/') || url.hostname !== location.hostname) {
      return await networkFirstStrategy(request, 60000); // 1 minute cache
    }
    
    // Default to network-first
    return await networkFirstStrategy(request);
  } catch (error) {
    console.error('❌ Service Worker: Request handling failed:', error);
    return new Response('Network error', { 
      status: 500,
      statusText: 'Service Worker Error'
    });
  }
}

async function networkFirstStrategy(request, maxAge = 300000) { // 5 minutes default
  const cache = await caches.open(CACHE_NAME);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Clone the response before caching
      const responseToCache = networkResponse.clone();
      
      // Add timestamp for cache validation
      const responseWithTimestamp = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: {
          ...Object.fromEntries(responseToCache.headers.entries()),
          'sw-cache-timestamp': Date.now().toString()
        }
      });
      
      // Cache the response
      await cache.put(request, responseWithTimestamp);
      await manageCacheSize();
      
      return networkResponse;
    }
  } catch (error) {
    console.warn('🌐 Service Worker: Network request failed, trying cache:', error.message);
  }
  
  // Network failed, try cache
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    // Check if cache is still valid
    const cacheTimestamp = cachedResponse.headers.get('sw-cache-timestamp');
    if (cacheTimestamp && (Date.now() - parseInt(cacheTimestamp)) < maxAge) {
      console.log('📦 Service Worker: Serving from cache:', request.url);
      return cachedResponse;
    }
  }
  
  // Both network and cache failed
  throw new Error('No network connection and no cached response available');
}

async function cacheFirstStrategy(request) {
  const cache = await caches.open(CACHE_NAME);
  
  // Try cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    console.log('📦 Service Worker: Serving static asset from cache:', request.url);
    return cachedResponse;
  }
  
  // Cache miss, fetch from network
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache the response
      await cache.put(request, networkResponse.clone());
      await manageCacheSize();
      
      console.log('🌐 Service Worker: Cached static asset:', request.url);
      return networkResponse;
    }
  } catch (error) {
    console.error('❌ Service Worker: Failed to fetch static asset:', error);
  }
  
  throw new Error('Failed to fetch static asset');
}

function isStaticAsset(request) {
  const url = new URL(request.url);
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf'];
  
  return staticExtensions.some(ext => url.pathname.toLowerCase().endsWith(ext));
}

async function manageCacheSize() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    
    if (keys.length > CACHE_SIZE_LIMIT) {
      console.log(`🧹 Service Worker: Cache size (${keys.length}) exceeds limit (${CACHE_SIZE_LIMIT}), cleaning up...`);
      
      // Get cache entries with timestamps
      const entries = await Promise.all(
        keys.map(async (key) => {
          try {
            const response = await cache.match(key);
            // Check if response exists and has headers
            if (!response || !response.headers) {
              return { key, timestamp: 0 };
            }
            
            const timestamp = response.headers.get('sw-cache-timestamp');
            return {
              key,
              timestamp: timestamp ? parseInt(timestamp) : 0
            };
          } catch (error) {
            console.warn('⚠️ Service Worker: Error processing cache entry:', error);
            return { key, timestamp: 0 };
          }
        })
      );
      
      // Sort by timestamp (oldest first) and remove oldest entries
      entries.sort((a, b) => a.timestamp - b.timestamp);
      const entriesToDelete = entries.slice(0, keys.length - CACHE_SIZE_LIMIT);
      
      await Promise.all(
        entriesToDelete.map(async (entry) => {
          try {
            await cache.delete(entry.key);
            console.log('🗑️ Service Worker: Deleted old cache entry:', entry.key.url);
          } catch (error) {
            console.warn('⚠️ Service Worker: Failed to delete cache entry:', error);
          }
        })
      );
      
      console.log(`✅ Service Worker: Cache cleanup complete. Removed ${entriesToDelete.length} entries.`);
    }
  } catch (error) {
    console.error('❌ Service Worker: Cache management failed:', error);
  }
}

// Handle messages from the main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('🔧 Service Worker: Script loaded');
