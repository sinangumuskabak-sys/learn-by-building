---
title: The table
title_tr: Masa
skills: [game.canvas]
---

# --goal--

Our first drawing: the whole canvas becomes a dark indigo table for the cards. Drawing is always two moves: pick a
color, then fill a shape with it.

# --goal-tr--

İlk çizimimizi yapıyoruz: bütün canvas'ı **koyu çivit mavisine** boyayacağız. Kartları dizeceğimiz masa burası.

Çizim hep iki hareketle olur: önce kalemin **rengini** seçersin, sonra o renkle bir şekli **doldurursun**. Boyacı gibi:
fırçayı boyaya bandır, sonra duvara sür.

# --code--

```js
ctx.fillStyle = '#1e1b4b'
ctx.fillRect(0, 0, canvas.width, canvas.height)
```

# --meaning--

- `ctx.fillStyle = '#1e1b4b'` picks the fill color, a dark indigo.
- `ctx.fillRect(x, y, width, height)` fills a rectangle. `0, 0` is the top-left corner, and `canvas.width` and
  `canvas.height` (400 and 440) make it cover everything.

# --meaning-tr--

- `ctx.fillStyle = '#1e1b4b'` → kalemin **dolgu rengini** seçer. Renkler `'white'` gibi İngilizce adla ya da `#` ile
  başlayan kodla yazılır. Kodları ezberlemen gerekmez, verileni aynen yaz.
- `ctx.fillRect(0, 0, canvas.width, canvas.height)` → içi dolu bir **dikdörtgen** boyar. Dört sayı sırayla:
  - `0, 0` → dikdörtgenin sol üst köşesi. Canvas'ta (0, 0) **sol üst köşedir**; x sağa, y **aşağı** doğru büyür
    (okuldaki grafiğin tersine).
  - `canvas.width, canvas.height` → genişlik ve yükseklik: canvas'ın kendi eni ve boyu (400 ve 440). Yani bütün tuval.

# --task--

Leave an empty line under `const ctx = ...`, write the two lines, then press **Run**.

# --task-tr--

`const ctx = ...` satırının altında bir satır boşluk bırak, iki satırı yaz ve **Çalıştır**'a bas. Oyun alanı koyu renge boyanmalı.

# --try--

Change `canvas.width` to `200` and run: only the left half is painted. Put `canvas.width` back.

# --try-tr--

`canvas.width` yerine `200` yaz ve çalıştır: yalnız sol yarı boyanır. Sonra `canvas.width`'e geri al.

# --tests--

The whole 400×440 canvas should be filled with `#1e1b4b`.
tr: 400×440'lık canvas'ın tamamı `#1e1b4b` ile boyanmalı.

```js
assert.isTrue($.rects('#1e1b4b').some((r) => r.x === 0 && r.y === 0 && r.w === 400 && r.h === 440))
```

# --solution--

```js
// Memory, step by step.
// The page already has <canvas id="game" width="400" height="440"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

ctx.fillStyle = '#1e1b4b'
ctx.fillRect(0, 0, canvas.width, canvas.height)
```
