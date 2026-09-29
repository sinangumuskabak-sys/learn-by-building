---
title: One after another
title_tr: Sırayla
skills: [fe.css]
---

# --goal--

To light them in turn, the yellow lamp starts its timeline 2 seconds later and the green one 4 seconds later.

# --goal-tr--

Şimdi sırayla yanmaları için her lambanın çizelgesini **farklı zamanda başlatıyoruz**: sarı 2 saniye, yeşil
4 saniye geç başlasın. Kırmızı hemen başlar. Bir tur 6 saniye olduğu için üçü birbirini izler.

# --code--

```css
.lamp:nth-child(2) {
  background: gold;
  animation-delay: 2s;
}

.lamp:nth-child(3) {
  background: limegreen;
  animation-delay: 4s;
}
```

# --meaning--

- `animation-delay` waits before starting the animation. 0, 2 and 4 seconds put the three lamps a third of a round apart.

# --meaning-tr--

- `animation-delay: 2s;` → animasyona başlamadan önce **2 saniye bekle**.
- Kırmızı 0'da, sarı 2'de, yeşil 4'te başlar: her biri turun üçte biri kadar arayla yanar. 6 saniyelik tur bitince
  kırmızı yeniden yanar.

# --task--

Add `animation-delay` to the yellow (2s) and green (4s) rules.

# --task-tr--

Sarı lambanın kuralına `animation-delay: 2s;`, yeşilinkine `animation-delay: 4s;` ekle. **Çalıştır** ve izle.

# --try--

Swap the delays so the order is red, green, yellow, like many real lights.

# --try-tr--

Gecikmelerin yerini değiştir: sıra kırmızı, yeşil, sarı olsun; birçok gerçek lamba gibi.

# --tests--

The yellow lamp should start 2 seconds late and the green one 4 seconds late.
tr: Sarı lamba 2, yeşil lamba 4 saniye geç başlamalı.

```js
const css = (selector, property) => [...document.styleSheets].flatMap((s) => [...s.cssRules]).filter((r) => r.selectorText === selector).map((r) => r.style.getPropertyValue(property)).filter(Boolean).pop() ?? ''
assert.strictEqual(css('.lamp:nth-child(2)', 'animation-delay'), '2s')
assert.strictEqual(css('.lamp:nth-child(3)', 'animation-delay'), '4s')
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
        animation: glow 6s infinite;
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
