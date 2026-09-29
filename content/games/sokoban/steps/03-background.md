---
title: The warehouse floor
title_tr: Depo zemini
skills: [game.canvas]
---

# --goal--

Our first drawing: the whole canvas gets a very dark brown, the floor of the warehouse.

# --goal-tr--

İlk çizimimiz: bütün tuvali çok koyu bir kahverengiye boyayacağız. Burası deponun **zemini** olacak.

Çizim hep iki adımdır: önce kalemin **rengini** seçersin, sonra o renkle bir şekil **doldurursun**.

# --code--

```js
ctx.fillStyle = '#1c1917'
ctx.fillRect(0, 0, canvas.width, canvas.height)
```

# --meaning--

- `ctx.fillStyle = '#1c1917'` picks the fill color.
- `ctx.fillRect(x, y, width, height)` fills a rectangle. `0, 0` is the top-left corner; `canvas.width` and
  `canvas.height` (480 and 520) make it cover everything.

# --meaning-tr--

- `ctx.fillStyle = '#1c1917'` → kalemin **dolgu rengini** seçer: siyaha yakın bir kahverengi. (`#` ile başlayan bu
  koda renk kodu denir; `'red'` gibi adlar da olur.)
- `ctx.fillRect(0, 0, canvas.width, canvas.height)` → içi dolu bir **dikdörtgen** çizer:
  - `0, 0` → sol üst köşesi. Canvas'ta (0, 0) **sol üst köşedir**; x sağa, y **aşağı** doğru büyür.
  - `canvas.width, canvas.height` → eni ve boyu: tuvalin kendi boyu (480 ve 520). Yani her yer.

# --task--

At the very end, leave an empty line and write the two lines. Press **Run**.

# --task-tr--

Dosyanın **en sonuna**, listeyi kapatan `]` satırından sonra bir boş satır bırakıp iki satırı yaz. **Çalıştır**: sağdaki
alan koyu renge boyanmalı.

# --tests--

The whole 480×520 canvas should be filled with `#1c1917`.
tr: 480×520'lik tuvalin tamamı `#1c1917` ile boyanmalı.

```js
const full = $.rects('#1c1917').filter((r) => r.x === 0 && r.y === 0 && r.w === 480 && r.h === 520)
assert.lengthOf(full, 1, 'fillRect(0, 0, canvas.width, canvas.height) with fillStyle #1c1917')
```

# --solution--

```js
// Sokoban, step by step.
// The page already has <canvas id="game" width="480" height="520"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

// The classic Sokoban text format: # wall, . goal, $ box, * box on a goal, @ player, + player on a goal.
const LEVELS = [
  [
    '#####',
    '#@$.#',
    '#####',
  ],
]

ctx.fillStyle = '#1c1917'
ctx.fillRect(0, 0, canvas.width, canvas.height)
```
