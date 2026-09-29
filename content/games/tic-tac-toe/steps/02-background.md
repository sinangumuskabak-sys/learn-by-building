---
title: Paint the board
title_tr: Tahtayı boya
skills: [game.canvas]
---

# --goal--

Our first drawing: the whole canvas gets a dark navy background. Drawing is always two moves: pick a color, then
fill a shape with it.

# --goal-tr--

İlk çizimimizi yapıyoruz: bütün canvas'ı **koyu laciverte** boyayacağız. Burası oyun tahtası olacak.

Çizim hep iki hareketle olur: önce kalemin **rengini** seçersin, sonra o renkle bir şekli **doldurursun**. Boyacı
gibi: fırçayı boyaya bandır, sonra duvara sür.

# --code--

```js
ctx.fillStyle = '#1e1e2e'
ctx.fillRect(0, 0, canvas.width, canvas.height)
```

# --meaning--

- `ctx.fillStyle = '#1e1e2e'` picks the fill color, a dark navy.
- `ctx.fillRect(x, y, width, height)` fills a rectangle. `0, 0` is the top-left corner, and `canvas.width` and
  `canvas.height` (300 and 300) make it cover everything.

# --meaning-tr--

- `ctx.fillStyle = '#1e1e2e'` → kalemin **dolgu rengini** seçer. Renkler `'orange'` gibi İngilizce adla ya da
  `#` ile başlayan kodla yazılır. `'#1e1e2e'` koyu bir lacivert. Kodları ezberlemen gerekmez, verileni aynen yaz.
- `ctx.fillRect(0, 0, canvas.width, canvas.height)` → içi dolu bir **dikdörtgen** boyar. Dört sayı sırayla:
  - `0, 0` → dikdörtgenin sol üst köşesi. Canvas'ta (0, 0) **sol üst köşedir**; x sağa, y **aşağı** doğru büyür
    (okuldaki grafiğin tersine).
  - `canvas.width, canvas.height` → genişlik ve yükseklik: canvas'ın kendi eni ve boyu (300 ve 300). Yani bütün tuval.

# --task--

Leave an empty line under `const ctx = ...`, write the two lines, then press **Run**.

# --task-tr--

`const ctx = ...` satırının altında bir satır boşluk bırak, iki satırı yaz ve **Çalıştır**'a bas. Oyun alanı koyu laciverte boyanmalı.

# --predict--

What will you see after Run?
- [x] The whole game area turns dark navy
- [ ] A small dark square in the top-left corner
  `canvas.width` and `canvas.height` are the full size, so the rectangle covers everything.
- [ ] Nothing, because there is no loop yet

# --predict-tr--

Çalıştır'a basınca ne göreceksin?
- [x] Oyun alanının tamamı koyu laciverte boyanır
- [ ] Sol üst köşede küçük koyu bir kare
  `canvas.width` ve `canvas.height` tuvalin tam boyu; dikdörtgen her yeri kaplar.
- [ ] Hiçbir şey, çünkü henüz döngü yok

# --try--

Change `canvas.width` to `150` and run: only the left half is painted. Put `canvas.width` back.

# --try-tr--

`canvas.width` yerine `150` yaz ve çalıştır: yalnız sol yarı boyanır. Sonra `canvas.width`'e geri al.

# --tests--

The whole 300×300 board should be filled with `#1e1e2e`.
tr: 300×300'lük tahtanın tamamı `#1e1e2e` ile boyanmalı.

```js
const full = $.rects('#1e1e2e').filter((r) => r.x === 0 && r.y === 0 && r.w === 300 && r.h === 300)
assert.lengthOf(full, 1, 'fillRect(0, 0, canvas.width, canvas.height) with fillStyle #1e1e2e')
```

# --solution--

```js
// Tic-tac-toe, step by step.
// The page already has <canvas id="game" width="300" height="300"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

ctx.fillStyle = '#1e1e2e'
ctx.fillRect(0, 0, canvas.width, canvas.height)
```
