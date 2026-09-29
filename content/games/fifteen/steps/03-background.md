---
title: Paint the table
title_tr: Masayı boya
skills: [game.canvas]
---

# --goal--

Our first drawing: the whole canvas gets a dark brown-grey, the table the puzzle lies on.

# --goal-tr--

İlk çizimimiz: bütün tuvali koyu, kahverengimsi bir griye boyayacağız. Bulmacanın üstünde durduğu **masa** olacak.

Çizim hep iki adımdır: önce kalemin **rengini** seçersin, sonra o renkle bir şekil **doldurursun**.

# --code--

```js
ctx.fillStyle = '#292524'
ctx.fillRect(0, 0, canvas.width, canvas.height)
```

# --meaning--

- `ctx.fillStyle = '#292524'` picks the fill color.
- `ctx.fillRect(x, y, width, height)` fills a rectangle. `0, 0` is the top-left corner; `canvas.width` and
  `canvas.height` (400 and 460) make it cover everything.

# --meaning-tr--

- `ctx.fillStyle = '#292524'` → kalemin **dolgu rengini** seçer. `#` ile başlayan bu koda renk kodu denir.
- `ctx.fillRect(0, 0, canvas.width, canvas.height)` → içi dolu bir **dikdörtgen** çizer:
  - `0, 0` → sol üst köşesi. Canvas'ta (0, 0) **sol üst köşedir**; x sağa, y **aşağı** doğru büyür.
  - `canvas.width, canvas.height` → eni ve boyu: tuvalin kendi boyu (400 ve 460). Yani her yer.

# --task--

Between the `reset` function and the `reset()` call at the bottom, write the two lines, with empty lines around them.

# --task-tr--

`reset` fonksiyonunun kapanan `}`'si ile en alttaki `reset()` satırının **arasına**, üstünde ve altında birer boş
satır kalacak şekilde iki satırı yaz. **Çalıştır**: sağdaki alan koyu renge boyanmalı.

# --tests--

The whole 400×460 canvas should be filled with `#292524`.
tr: 400×460'lık tuvalin tamamı `#292524` ile boyanmalı.

```js
const full = $.rects('#292524').filter((r) => r.x === 0 && r.y === 0 && r.w === 400 && r.h === 460)
assert.lengthOf(full, 1, 'fillRect(0, 0, canvas.width, canvas.height) with fillStyle #292524')
```

# --solution--

```js
// Sliding puzzle, step by step.
// The page already has <canvas id="game" width="400" height="460"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

let tiles // tiles[position] is the number on that square, 0 for the gap; positions go row by row

function reset() {
  tiles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0]
}

ctx.fillStyle = '#292524'
ctx.fillRect(0, 0, canvas.width, canvas.height)

reset()
```
