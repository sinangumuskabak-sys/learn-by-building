---
title: Play the timeline
title_tr: Çizelgeyi oynat
skills: [fe.css]
---

# --goal--

`animation` connects the timeline to the lamps: play `glow` over 6 seconds, again and again.

# --goal-tr--

Zaman çizelgesini lambalara bağlıyoruz: "`glow`'u 6 saniyede oynat ve **sonsuza kadar** tekrarla".

# --code--

```css
animation: glow 6s infinite;
```

# --meaning--

- `glow` is the name of the keyframes, `6s` how long one round takes, `infinite` repeats it forever.

# --meaning-tr--

- `animation:` → hangi animasyon, ne kadar sürede, kaç kez:
  - `glow` → az önce yazdığımız zaman çizelgesi.
  - `6s` → bir tur **6 saniye**: lamba ~1,8 saniye yanar, sonra söner.
  - `infinite` → bitince **baştan başla**, hiç durma.

# --task--

Add the line inside `.lamp`, under `opacity`. Watch for a few seconds.

# --task-tr--

Satırı `.lamp` kuralının içine, `opacity` satırının altına ekle. **Çalıştır** ve birkaç saniye izle.

# --predict--

What will the three lamps do?
- [x] Light up and go dim all together
  They all play the same timeline at the same time.
- [ ] Light up one after another
- [ ] Stay dim

# --predict-tr--

Üç lamba ne yapacak?
- [x] Hepsi birlikte yanıp sönecek
  Üçü de aynı çizelgeyi aynı anda oynatıyor.
- [ ] Sırayla yanacak
- [ ] Sönük kalacak

# --tests--

The lamps should play `glow` for 6 seconds, forever.
tr: Lambalar `glow`'u 6 saniyelik turlarla sonsuza kadar oynatmalı.

```js
const css = (selector, property) => [...document.styleSheets].flatMap((s) => [...s.cssRules]).filter((r) => r.selectorText === selector).map((r) => r.style.getPropertyValue(property)).filter(Boolean).pop() ?? ''
const animation = css('.lamp', 'animation')
assert.match(animation, /glow/)
assert.match(animation, /6s/)
assert.match(animation, /infinite/)
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
