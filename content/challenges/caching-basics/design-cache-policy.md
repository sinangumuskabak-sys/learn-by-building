---
id: design-cache-policy
title: Design a cache for a slow price API
title_tr: Yavaş bir fiyat API’si için önbellek tasarla
type: design
skills: [arch.caching]
level: 5
---

# --description--

An online shop calls a third-party price API on every product page view. The API answers in about 800 ms, is
rate-limited to 100 requests per minute, and prices change a few times per day.

# --description-tr--

Bir çevrim içi mağaza, her ürün sayfası açıldığında fiyatı başka bir şirketin API’sinden (uzak bir
servisten) soruyor. Bu servis:

- her cevabı yaklaşık **800 ms**’de veriyor (sayfa bu yüzden yavaş açılıyor),
- dakikada en fazla **100 istek** kabul ediyor (fazlasını reddediyor),
- fiyatları günde yalnızca **birkaç kez** değiştiriyor.

**Önbellek (cache)**, bir kez sorulan cevabı bir süre saklayıp aynı soru tekrar gelince servise gitmeden hemen
geri vermektir. Buradaki soru: bu mağaza için önbelleği nasıl kurarsın?

# --instructions--

Propose a caching approach. Cover where the cache lives, how long entries stay valid, how a price change reaches
users, and what happens when the API is down.

# --instructions-tr--

Önbellek yaklaşımını birkaç paragrafla anlat. Şunlara değin:

1. **Nerede tutulur?** (uygulamanın kendi belleği, Redis gibi ortak bir depo, CDN…) ve neden orası?
2. **Ne kadar geçerli kalır?** Saklanan fiyatın süresi (TTL) ne olmalı, fiyatların ne sıklıkla değiştiğine göre neden?
3. **Fiyat değişince** kullanıcı yeni fiyatı nasıl görür?
4. **API çökerse** ne olur? (eski veriyi göstermek, yedek plan, hata mesajı)

# --rubric--

- Names a concrete cache location (in-process, shared store, CDN) and why it fits
- Chooses an expiry (TTL) and justifies it against how often prices change
- Explains invalidation or refresh when a price changes
- Handles API failure (serve stale data, fallback, error message)
- Mentions the rate limit and how the cache keeps requests under it

# --rubric-tr--

- Önbelleğin nerede tutulacağını somut olarak söylüyor (uygulama belleği, ortak depo, CDN) ve nedenini açıklıyor
- Bir geçerlilik süresi (TTL) seçiyor ve bunu fiyatların değişme sıklığıyla gerekçelendiriyor
- Fiyat değişince önbelleğin nasıl temizlendiğini ya da yenilendiğini anlatıyor
- API çalışmadığında ne olacağını ele alıyor (eski veriyi göster, yedek, hata mesajı)
- Dakikadaki istek sınırından bahsediyor ve önbelleğin istekleri bu sınırın altında nasıl tuttuğunu söylüyor
