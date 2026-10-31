# NameForge browser cache policy

## Why this exists

GitHub Pages controls HTTP response headers; this repository cannot set a custom
Cache-Control policy for its hosted assets. Lighthouse previously observed a
10-minute cache lifetime on the static files. The service worker adds a
browser-managed cache for Vite's content-hashed assets.

## Strategy

- HTML navigation: network-first; the last successful document is used only
  when the network is unavailable.
- Vite assets under `/assets/` whose filenames contain a content hash:
  cache-first. A changed build produces a new URL.
- Other requests and third-party origins: not intercepted.
- Cache versions are explicit. Increment the cache suffix in `public/sw.js`
  when the cache policy or asset compatibility changes.
- The service worker is registered only in production and is scoped to the
  GitHub Pages project base path.

## Limits and validation

- The first visit still downloads the app; this strategy mainly benefits repeat
  visits and offline reloads after the worker has been installed.
- Browser storage can be evicted by the browser; offline availability is best
  effort, not a permanent guarantee.
- The service worker does not claim to improve first-visit LCP. Lighthouse
  mobile previously showed most LCP time in render delay, so JavaScript startup
  and above-the-fold rendering need a separate optimization.
