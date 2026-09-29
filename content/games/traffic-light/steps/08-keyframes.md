---
title: A timeline for a lamp
title_tr: Bir lamba için zaman çizelgesi
skills: [fe.css]
---

# --goal--

An animation is a timeline: what a property is at each moment. `@keyframes glow` says: be bright for the first 30%
of the time, dim for the rest.

# --goal-tr--

Animasyon bir **zaman çizelgesidir**: bir özelliğin (burada `opacity`) zamanın hangi anında ne olacağını söyler.
`@keyframes` ile bu çizelgeyi yazıp ona ad veriyoruz: `glow` (parla). Bu adımda henüz hiçbir lambaya bağlamıyoruz.

# --code--

```css
@keyframes glow {
  0%, 30% {
    opacity: 1;
  }
  35%, 100% {
    opacity: 0.25;
  }
}
```

# --meaning--

- The percentages are moments in the animation: 0% is the start, 100% the end.
- From 0% to 30% the lamp is fully bright; from 35% to 100% it is dim. Between 30% and 35% it fades.

# --meaning-tr--

- `@keyframes glow {` → `glow` adlı bir zaman çizelgesi.
- Yüzdeler animasyonun **anları**: `0%` başlangıç, `100%` son. Animasyon 6 saniye sürerse `30%` = 1,8. saniye.
- `0%, 30% { opacity: 1; }` → başlangıçtan %30'a kadar lamba **tam parlak**.
- `35%, 100% { opacity: 0.25; }` → %35'ten sona kadar **sönük**.
- %30 ile %35 arasını tarayıcı kendisi doldurur: lamba yavaşça söner.

# --task--

Write the `@keyframes` block at the end of the styles, under the green lamp's rule.

# --task-tr--

`@keyframes` bloğunu stillerin sonuna, yeşil lambanın kuralının altına yaz. **Çalıştır**.

# --predict--

Will the lamps start blinking now?
- [ ] Yes, all together
- [x] No, nothing uses `glow` yet
- [ ] Only the red one

# --predict-tr--

Lambalar şimdi yanıp sönmeye başlayacak mı?
- [ ] Evet, hepsi birlikte
- [x] Hayır, `glow`'u henüz kimse kullanmıyor
- [ ] Yalnız kırmızı

# --tests--

There should be a `@keyframes glow` animation with two keyframe groups.
tr: İki anlık gruptan oluşan bir `@keyframes glow` animasyonu olmalı.

```js
const glow = [...document.styleSheets].flatMap((s) => [...s.cssRules]).find((r) => r.name === 'glow')
assert.isOk(glow, '@keyframes glow { ... }')
assert.lengthOf(glow.cssRules, 2)
```

# --solution--

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Traffic light</title>
    <style>
      body {
        display: grid;
        place-items: center;
        min-height: 90vh;
        background: #cbd5e1;
      }

      .light {
        width: 90px;
        height: 250px;
        background: #222;
        border-radius: 16px;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
      }

      .lamp {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: #555;
        opacity: 0.25;
      }

      .lamp:nth-child(1) {
        background: red;
      }

      .lamp:nth-child(2) {
        background: gold;
      }

      .lamp:nth-child(3) {
        background: limegreen;
      }

      @keyframes glow {
        0%, 30% {
          opacity: 1;
        }
        35%, 100% {
          opacity: 0.25;
        }
      }
    </style>
  </head>
  <body>
    <div class="light">
      <div class="lamp"></div>
      <div class="lamp"></div>
      <div class="lamp"></div>
    </div>
  </body>
</html>
```
