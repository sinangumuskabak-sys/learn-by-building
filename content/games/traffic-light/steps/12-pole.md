---
title: "Build it yourself: a pole"
title_tr: "Kendin yap: direk"
skills: [fe.html, fe.css]
---

# --goal--

A traffic light stands on a pole. Add one under it: a narrow grey box.

# --goal-tr--

Trafik lambası havada durmaz: bir **direğin** üstündedir. Lambanın altına bir direk ekle: dar, uzun, gri bir kutu.

Bu adımda kod verilmiyor. Bildiklerin yetiyor: bir `div`, bir sınıf adı ve genişlik, yükseklik, renk veren bir kural.

# --task--

- Under the light (after its closing `</div>`), add a `div` with the class `pole`.
- Style `.pole`: narrower than the light, at least 50px tall, with a background color.

# --task-tr--

- Lambanın gövdesinin **altına** (kapanan `</div>`'inden sonra) `pole` sınıflı bir `div` ekle.
- `.pole` için bir kural yaz: lambadan **dar**, en az 50 piksel **uzun**, bir **arka plan rengi** olan.
- Sayfa zaten her şeyi ortalıyor; direk lambanın altına kendiliğinden yerleşir.

# --hint--

A box shows only with a size: give `.pole` a `width`, a `height` and a `background`.

# --hint-tr--

Kutu ancak boyu olunca görünür: `.pole`'a `width`, `height` ve `background` ver.

# --tests--

There should be a pole right after the light.
tr: Lambanın hemen arkasından bir direk gelmeli.

```js
assert.isNotNull(document.querySelector('.light + .pole'), 'a pole div right after the light')
```

The pole should be narrow, tall and colored.
tr: Direk dar, uzun ve renkli olmalı.

```js
const pole = window.getComputedStyle(document.querySelector('.pole'))
const light = window.getComputedStyle(document.querySelector('.light'))
assert.isBelow(parseFloat(pole.width), parseFloat(light.width), 'narrower than the light')
assert.isAtLeast(parseFloat(pole.height), 50, 'at least 50px tall')
assert.notInclude(['', 'rgba(0, 0, 0, 0)', 'transparent'], pole.backgroundColor)
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

      :root {
        --round: 6s;
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
        animation: glow var(--round) infinite;
      }

      .lamp:nth-child(1) {
        background: red;
      }

      .lamp:nth-child(2) {
        background: gold;
        animation-delay: 2s;
      }

      .lamp:nth-child(3) {
        background: limegreen;
        animation-delay: 4s;
      }

      @keyframes glow {
        0%, 30% {
          opacity: 1;
        }
        35%, 100% {
          opacity: 0.25;
        }
      }

      .pole {
        width: 20px;
        height: 120px;
        background: #444;
      }
    </style>
  </head>
  <body>
    <div class="light">
      <div class="lamp"></div>
      <div class="lamp"></div>
      <div class="lamp"></div>
    </div>
    <div class="pole"></div>
  </body>
</html>
```
