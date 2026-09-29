---
title: A dark board
title_tr: Koyu bir tahta
skills: [game.canvas]
---

# --goal--

Our first drawing: the whole canvas becomes dark navy, so the colored pads will glow on it. Drawing is always two moves:
pick a color, then fill a shape with it.

# --goal-tr--

İlk çizimimizi yapıyoruz: bütün canvas'ı **koyu laciverte** boyayacağız. Renkli tuşlar koyu zeminde daha güzel parlar.

Çizim hep iki hareketle olur: önce kalemin **rengini** seçersin, sonra o renkle bir şekli **doldurursun**. Boyacı gibi:
fırçayı boyaya bandır, sonra duvara sür.

# --code--

```js
ctx.fillStyle = '#0f172a'
ctx.fillRect(0, 0, canvas.width, canvas.height)
```

# --meaning--

- `ctx.fillStyle = '#0f172a'` picks the fill color, a dark navy.
- `ctx.fillRect(x, y, width, height)` fills a rectangle. `0, 0` is the top-left corner, and `canvas.width` and
  `canvas.height` (400 and 440) make it cover everything.

# --meaning-tr--

- `ctx.fillStyle = '#0f172a'` → kalemin **dolgu rengini** seçer. Renkler `'white'` gibi İngilizce adla ya da `#` ile
  başlayan kodla yazılır. `'#0f172a'` çok koyu bir lacivert; kodları ezberlemen gerekmez, verileni aynen yaz.
- `ctx.fillRect(0, 0, canvas.width, canvas.height)` → içi dolu bir **dikdörtgen** boyar. Dört sayı sırayla:
  - `0, 0` → dikdörtgenin sol üst köşesi. Canvas'ta (0, 0) **sol üst köşedir**; x sağa, y **aşağı** doğru büyür
    (okuldaki grafiğin tersine).
  - `canvas.width, canvas.height` → genişlik ve yükseklik: canvas'ın kendi eni ve boyu (400 ve 440). Yani bütün tuval.

# --task--

Leave an empty line under `const ctx = ...`, write the two lines, then press **Run**.

# --task-tr--

`const ctx = ...` satırının altında bir satır boşluk bırak, iki satırı yaz ve **Çalıştır**'a bas. Oyun alanı koyu laciverte boyanmalı.

# --try--

Change `'#0f172a'` to `'black'` and run. Put `'#0f172a'` back.

# --try-tr--

`'#0f172a'` yerine `'black'` yaz ve çalıştır. Sonra `'#0f172a'`'ya geri al.

# --tests--

The whole 400×440 board should be filled with `#0f172a`.
tr: 400×440'lık tahtanın tamamı `#0f172a` ile boyanmalı.

```js
const full = $.rects('#0f172a').filter((r) => r.x === 0 && r.y === 0 && r.w === 400 && r.h === 440)
assert.lengthOf(full, 1)
```

# --solution--

```js
// Simon memory game, step by step.
// The page already has <canvas id="game" width="400" height="440"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

ctx.fillStyle = '#0f172a'
ctx.fillRect(0, 0, canvas.width, canvas.height)
```
