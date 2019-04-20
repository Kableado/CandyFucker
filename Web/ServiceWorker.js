var cacheName = 'CandyFucker-v3';
var filesToCache = [
    './index.html',
    './style.css',
    './code/CandyFucker.js',
    './code/GameLib.js',
    './gfx/BallsBlue.png',
    './gfx/BallsCyan.png',
    './gfx/BallsGreen.png',
    './gfx/BallsRed.png',
    './gfx/BallsYellow.png',
    './gfx/favicon.ico',
    './gfx/favicon.png',
    './gfx/FragsBlue.png',
    './gfx/FragsCyan.png',
    './gfx/FragsGreen.png',
    './gfx/FragsRed.png',
    './gfx/FragsYellow.png',
    './gfx/logo.png',
    //'../sfx/explosion1.wav',
    //'../sfx/pickcandy.wav',
    //'../sfx/swapinvalid.wav',
];

self.addEventListener('install', function (e) {
    console.log('[ServiceWorker] Install');
    e.waitUntil(
        caches.open(cacheName).then(function (cache) {
            console.log('[ServiceWorker] Caching app shell');
            return cache.addAll(filesToCache);
        })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request, { ignoreSearch: true }).then(response => {
            return response || fetch(event.request);
        })
    );
});