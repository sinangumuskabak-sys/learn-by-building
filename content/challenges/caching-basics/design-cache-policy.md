---
id: design-cache-policy
title: Design a cache for a slow price API
type: design
skills: [arch.caching]
level: 5
---

# --description--

An online shop calls a third-party price API on every product page view. The API answers in about 800 ms, is
rate-limited to 100 requests per minute, and prices change a few times per day.

# --instructions--

Propose a caching approach. Cover where the cache lives, how long entries stay valid, how a price change reaches
users, and what happens when the API is down.

# --rubric--

- Names a concrete cache location (in-process, shared store, CDN) and why it fits
- Chooses an expiry (TTL) and justifies it against how often prices change
- Explains invalidation or refresh when a price changes
- Handles API failure (serve stale data, fallback, error message)
- Mentions the rate limit and how the cache keeps requests under it
