---
title: "Build it yourself: a card that reacts"
title_tr: "Kendin yap: tepki veren kart"
skills: [fe.css]
---

# --goal--

Make the whole card grow a little when the mouse is over it, smoothly.

# --goal-tr--

Son dokunuş senden: fare kartın üstüne gelince **bütün kart biraz büyüsün**, hem de birden değil, **yumuşakça**.

Bu adımda kod verilmiyor. Bildiklerin: `:hover` (fare üstündeyken), bir kutunun kuralına özellik eklemek. Yeni iki
özellik gerekecek: `transform: scale(...)` bir şeyi büyütür, `transition` değişimi yumuşatır.

# --task--

- `.card:hover` makes the card larger with `transform: scale(...)` (a bit above 1, like 1.05).
- `.card` gets a `transition` for `transform`, so the change takes a moment instead of jumping.

# --task-tr--

- `.card:hover` kuralı kartı `transform: scale(...)` ile büyütsün (1'den biraz büyük bir sayı, ör. `1.05`).
- `.card` kuralına `transform` için bir `transition` ekle (ör. `transition: transform 0.2s;`): büyüme bir anda değil,
  yumuşakça olsun.
- Sonra fareyi kartın üstüne getirip dene.

# --hint--

`scale(1.05)` is 5% bigger. The `transition` goes on `.card` itself, not on `:hover`, so the card also shrinks back smoothly.

# --hint-tr--

`scale(1.05)` yüzde 5 büyük demek. `transition`'ı `:hover`'a değil `.card`'ın kendisine yaz; böylece kart geri küçülürken de yumuşak olur.

# --tests--

The card should grow when the mouse is over it.
tr: Fare üstündeyken kart büyümeli.

```js
const css = (selector, property) => [...document.styleSheets].flatMap((s) => [...s.cssRules]).filter((r) => r.selectorText === selector).map((r) => r.style.getPropertyValue(property)).filter(Boolean).pop() ?? ''
assert.match(css('.card:hover', 'transform'), /scale\(1\.\d+\)/, '.card:hover { transform: scale(1.05); }')
```

The change should be smooth.
tr: Değişim yumuşak olmalı.

```js
const css = (selector, property) => [...document.styleSheets].flatMap((s) => [...s.cssRules]).filter((r) => r.selectorText === selector).map((r) => r.style.getPropertyValue(property)).filter(Boolean).pop() ?? ''
assert.match(css('.card', 'transition') || css('.card', 'transition-property'), /transform|all/, 'transition: transform 0.2s on .card')
```

# --solution--

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>My card</title>
    <style>
      body {
        font-family: sans-serif;
        background: #f1f5f9;
      }

      .card {
        background: white;
        padding: 24px;
        border-radius: 12px;
        max-width: 320px;
        margin: 40px auto;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transition: transform 0.2s;
      }

      .card:hover {
        transform: scale(1.05);
      }

      h1 {
        margin: 0;
        color: #4f46e5;
      }

      ul {
        list-style: none;
        padding: 0;
        display: flex;
        gap: 16px;
      }

      a {
        color: #4f46e5;
        text-decoration: none;
      }

      a:hover {
        text-decoration: underline;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Ada Lovelace</h1>
      <p>Learning to build websites</p>
      <ul>
        <li><a href="mailto:ada@example.com">E-mail</a></li>
        <li><a href="https://github.com/">GitHub</a></li>
      </ul>
    </div>
  </body>
</html>
```
