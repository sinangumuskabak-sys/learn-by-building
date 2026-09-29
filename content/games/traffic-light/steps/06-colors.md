---
title: Red, yellow, green
title_tr: Kırmızı, sarı, yeşil
skills: [fe.css]
---

# --goal--

All three lamps share one class, yet each needs its own color. `:nth-child(n)` picks the lamp by its position.

# --goal-tr--

Üç lamba aynı sınıfı taşıyor ama her biri başka renkte olmalı. CSS'e "**kaçıncı** lamba?" diye sorabiliriz:
`:nth-child(1)` birinci, `:nth-child(2)` ikinci...

# --code--

```css
.lamp:nth-child(1) {
  background: red;
}

.lamp:nth-child(2) {
  background: gold;
}

.lamp:nth-child(3) {
  background: limegreen;
}
```

# --meaning--

- `.lamp:nth-child(1)` is a lamp that is the first child of its parent; 2 and 3 are the next ones.
- These rules come after `.lamp`, so their `background` wins over the grey.

# --meaning-tr--

- `.lamp:nth-child(1)` → "ebeveyninin (gövdenin) **birinci** çocuğu olan lamba". `(2)` ikinci, `(3)` üçüncü.
- Her kural kendi lambasına renk veriyor: kırmızı, altın sarısı, yeşil.
- Bu kurallar `.lamp` kuralından **sonra** yazıldığı için onların rengi grinin yerine geçer: CSS'te aynı özelliğe iki
  kural değer verirse, (aynı güçteyse) sonra gelen kazanır.

# --task--

Write the three rules under the `.lamp` rule.

# --task-tr--

Üç kuralı `.lamp` kuralının altına yaz. **Çalıştır**.

# --tests--

The lamps should be red, gold and lime green, top to bottom.
tr: Lambalar yukarıdan aşağı kırmızı, altın sarısı ve yeşil olmalı.

```js
const colors = [...document.querySelectorAll('.lamp')].map((lamp) => window.getComputedStyle(lamp).backgroundColor)
assert.deepEqual(colors, ['rgb(255, 0, 0)', 'rgb(255, 215, 0)', 'rgb(50, 205, 50)'])
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
