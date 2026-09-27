---
title: Four pads
title_tr: Dört tuş
skills: [game.canvas, prog.arrays]
---

# --explanation--

Simon has four colored pads that light up. Each pad needs two colors, a dim one for "off" and a bright one for "lit", so
keep them together in one list of objects:

```js
const PADS = [
  { dim: '#14532d', lit: '#4ade80' },   // green
  ...
]
```

The pads fill the four quarters of the board. Pad `i` is in column `i % 2` and row `Math.floor(i / 2)`: the same
"position in a grid from one number" trick as in the 15 puzzle, here with a 2 by 2 grid.

One variable, `lit`, says which pad is lit (`-1` for none). Drawing each pad simply picks `pad.lit` or `pad.dim` depending
on it. Whatever lights a pad later, the computer showing the sequence or the player pressing, only has to change `lit`.

# --explanation-tr--

Simon'ın yanan dört renkli tuşu vardır. Her tuşun iki rengi olmalı: "sönük" için koyu, "yanık" için parlak; bu yüzden onları tek
bir nesne listesinde bir arada tut:

```js
const PADS = [
  { dim: '#14532d', lit: '#4ade80' },   // yeşil
  ...
]
```

Tuşlar tahtanın dört çeyreğini doldurur. `i` tuşu `i % 2` sütununda ve `Math.floor(i / 2)` satırındadır: 15 bulmacasındaki
"tek bir sayıdan ızgarada konum" hilesinin aynısı, burada 2'ye 2 bir ızgarayla.

Tek bir değişken, `lit`, hangi tuşun yandığını söyler (hiçbiri için `-1`). Her tuşu çizmek, ona göre `pad.lit` ya da `pad.dim`'i
seçmektir. Sonra bir tuşu ne yakarsa yaksın (diziyi gösteren bilgisayar ya da basan oyuncu), yalnızca `lit`'i değiştirmesi
yeter.

# --task--

1. Add `TOP = 40`, `HALF = canvas.width / 2` and the `PADS` list from the solution, and `let lit = -1`.
2. Every frame fill `'#0f172a'` and draw each pad as a square filling its quarter below `TOP`, 6 pixels in from each side
   (`HALF - 12` wide), in its lit color if it is the lit pad and its dim color otherwise.

# --task-tr--

1. `TOP = 40`, `HALF = canvas.width / 2`, çözümdeki `PADS` listesini ve `let lit = -1` ekle.
2. Her karede `'#0f172a'` ile doldur ve her tuşu `TOP`'un altındaki çeyreğini dolduran, her yandan 6 piksel içeride (`HALF - 12`
   genişliğinde) bir kare olarak çiz; yanan tuşsa parlak, değilse sönük renginde.

# --tests--

The four pads should fill the four quarters.
tr: Dört tuş dört çeyreği doldurmalı.

```js
$.tick(1)
const pads = $.rects().filter((r) => r.w === 188)
assert.deepEqual(pads.map((r) => [r.x, r.y, r.color]), [
  [6, 46, '#14532d'],
  [206, 46, '#7f1d1d'],
  [6, 246, '#713f12'],
  [206, 246, '#1e3a8a'],
])
```

The lit pad should be drawn bright.
tr: Yanan tuş parlak çizilmeli.

```js
lit = 3
$.tick(1)
assert.lengthOf($.rects('#60a5fa'), 1)
assert.lengthOf($.rects('#1e3a8a'), 0)
assert.lengthOf($.rects('#14532d'), 1)
```

# --seed--

```js
// Simon memory game, step by step.
// The page already has <canvas id="game" width="400" height="440"></canvas>.
// Write your code below.
```

# --solution--

```js
// Simon memory game, step by step.
// The page already has <canvas id="game" width="400" height="440"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TOP = 40 // room for the score
const HALF = canvas.width / 2
// Each pad: its dim color and its lit color. Pads 0 1 on top, 2 3 below.
const PADS = [
  { dim: '#14532d', lit: '#4ade80' },
  { dim: '#7f1d1d', lit: '#f87171' },
  { dim: '#713f12', lit: '#facc15' },
  { dim: '#1e3a8a', lit: '#60a5fa' },
]

let lit = -1 // the pad lit right now, or -1

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  PADS.forEach((pad, i) => {
    const x = (i % 2) * HALF
    const y = TOP + Math.floor(i / 2) * HALF
    ctx.fillStyle = i === lit ? pad.lit : pad.dim
    ctx.fillRect(x + 6, y + 6, HALF - 12, HALF - 12)
  })
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
