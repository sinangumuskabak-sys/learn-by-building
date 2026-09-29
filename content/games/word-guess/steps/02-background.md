---
title: Paint the background
title_tr: Arka planı boya
skills: [game.canvas]
---

# --goal--

Our first drawing: the whole canvas gets an almost black background.

# --goal-tr--

İlk çizimimiz: bütün tuvali neredeyse siyah bir renge boyayacağız. Harfler ve renkli kareler bu koyu zeminde parlayacak.

Çizim hep iki adımdır: önce kalemin **rengini** seçersin, sonra o renkle bir şekil **doldurursun**.

# --code--

```js
ctx.fillStyle = '#18181b'
ctx.fillRect(0, 0, canvas.width, canvas.height)
```

# --meaning--

- `ctx.fillStyle = '#18181b'` picks the fill color.
- `ctx.fillRect(x, y, width, height)` fills a rectangle. `0, 0` is the top-left corner; `canvas.width` and
  `canvas.height` (360 and 560) make it cover everything.

# --meaning-tr--

- `ctx.fillStyle = '#18181b'` → kalemin **dolgu rengini** seçer. `#` ile başlayan bu koda renk kodu denir; `'red'` gibi
  adlar da olur.
- `ctx.fillRect(0, 0, canvas.width, canvas.height)` → içi dolu bir **dikdörtgen** çizer:
  - `0, 0` → sol üst köşesi. Canvas'ta (0, 0) **sol üst köşedir**; x sağa, y **aşağı** doğru büyür.
  - `canvas.width, canvas.height` → eni ve boyu: tuvalin kendi boyu (360 ve 560). Yani her yer.

# --task--

Under `const ctx = ...`, leave an empty line and write the two lines. Press **Run**.

# --task-tr--

`const ctx = ...` satırının altına bir boş satır bırakıp iki satırı yaz. **Çalıştır**: sağdaki alan koyu renge
boyanmalı.

# --tests--

The whole 360×560 canvas should be filled with `#18181b`.
tr: 360×560'lık tuvalin tamamı `#18181b` ile boyanmalı.

```js
const full = $.rects('#18181b').filter((r) => r.x === 0 && r.y === 0 && r.w === 360 && r.h === 560)
assert.lengthOf(full, 1, 'fillRect(0, 0, canvas.width, canvas.height) with fillStyle #18181b')
```

# --solution--

```js
// Word guessing game, step by step.
// The page already has <canvas id="game" width="360" height="560"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

ctx.fillStyle = '#18181b'
ctx.fillRect(0, 0, canvas.width, canvas.height)
```
