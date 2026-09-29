---
title: A black court
title_tr: Siyah saha
skills: [game.canvas]
---

# --goal--

Our first drawing: the whole canvas becomes black, like the old arcade screens. Drawing is always two moves: pick a
color, then fill a shape with it.

# --goal-tr--

İlk çizimimizi yapıyoruz: bütün canvas'ı **siyaha** boyayacağız; eski salon oyunlarının ekranı gibi. Burası saha.

Çizim hep iki hareketle olur: önce kalemin **rengini** seçersin, sonra o renkle bir şekli **doldurursun**. Boyacı gibi:
fırçayı boyaya bandır, sonra duvara sür.

# --code--

```js
ctx.fillStyle = 'black'
ctx.fillRect(0, 0, canvas.width, canvas.height)
```

# --meaning--

- `ctx.fillStyle = 'black'` picks the fill color.
- `ctx.fillRect(x, y, width, height)` fills a rectangle. `0, 0` is the top-left corner, and `canvas.width` and
  `canvas.height` (600 and 400) make it cover everything.

# --meaning-tr--

- `ctx.fillStyle = 'black'` → kalemin **dolgu rengini** seçer. Renkler `'black'` gibi İngilizce adla ya da `#` ile
  başlayan kodla yazılır.
- `ctx.fillRect(0, 0, canvas.width, canvas.height)` → içi dolu bir **dikdörtgen** boyar. Dört sayı sırayla:
  - `0, 0` → dikdörtgenin sol üst köşesi. Canvas'ta (0, 0) **sol üst köşedir**; x sağa, y **aşağı** doğru büyür
    (okuldaki grafiğin tersine).
  - `canvas.width, canvas.height` → genişlik ve yükseklik: canvas'ın kendi eni ve boyu (600 ve 400). Yani bütün tuval.

# --task--

Leave an empty line under `const ctx = ...`, write the two lines, then press **Run**.

# --task-tr--

`const ctx = ...` satırının altında bir satır boşluk bırak, iki satırı yaz ve **Çalıştır**'a bas. Oyun alanı siyaha boyanmalı.

# --try--

Change `'black'` to `'darkgreen'` and run: a tennis court. Put `'black'` back.

# --try-tr--

`'black'` yerine `'darkgreen'` yaz ve çalıştır: bir tenis kortu. Sonra `'black'`'e geri al.

# --tests--

The whole 600×400 court should be black.
tr: 600×400 sahanın tamamı siyah olmalı.

```js
assert.isTrue($.rects('black').some((r) => r.x === 0 && r.y === 0 && r.w === 600 && r.h === 400))
```

# --solution--

```js
// Pong, step by step.
// The page already has <canvas id="game" width="600" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

ctx.fillStyle = 'black'
ctx.fillRect(0, 0, canvas.width, canvas.height)
```
