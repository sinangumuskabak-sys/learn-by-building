---
title: Turn them off
title_tr: Söndür
skills: [fe.css]
---

# --goal--

A real traffic light shows one lamp at a time. First we dim them all with `opacity`.

# --goal-tr--

Gerçek bir trafik lambasında aynı anda yalnız **bir** ışık yanar. Önce hepsini **söndürelim**: saydamlığı artırıp
sönük gösterelim. Sonra sırayla yakacağız.

# --code--

```css
opacity: 0.25;
```

# --meaning--

- `opacity` goes from `1` (fully visible) to `0` (invisible). `0.25` is a quarter: a dim lamp.

# --meaning-tr--

- `opacity: 0.25;` → **görünürlük**: `1` tam görünür, `0` hiç görünmez. `0.25` dörtte bir: lamba sönük, rengi zar
  zor seçiliyor.
- `.lamp` kuralına yazıyoruz ki üç lambaya birden uygulansın.

# --task--

Add the line inside `.lamp`, under `background`.

# --task-tr--

Satırı `.lamp` kuralının içine, `background` satırının altına ekle. **Çalıştır**.

# --predict--

How will the lamps look?
- [ ] Brighter
- [x] Faded, their colors barely showing
- [ ] Gone completely
  That would be `opacity: 0`.

# --predict-tr--

Lambalar nasıl görünecek?
- [ ] Daha parlak
- [x] Soluk, renkleri zar zor seçilir
- [ ] Tamamen kaybolur
  O `opacity: 0` olurdu.

# --tests--

The lamps should be dimmed to a quarter.
tr: Lambalar dörtte bire karartılmalı.

```js
assert.strictEqual(window.getComputedStyle(document.querySelector('.lamp')).opacity, '0.25')
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
