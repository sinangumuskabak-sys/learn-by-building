---
title: Ceiling, floor and a loop
title_tr: Tavan, zemin ve döngü
skills: [game.loop, game.canvas]
---

# --goal--

The 3D view needs a ceiling (the top half, dark) and a floor (the bottom half, lighter). They also wipe the old picture
each frame. A loop redraws everything about 60 times a second.

# --goal-tr--

3B görünümün bir **tavanı** (üst yarı, koyu) ve bir **zemini** (alt yarı, daha açık) olsun. İkisi her karede eski
resmi de silmiş olur. Bir **döngü** her şeyi saniyede ~60 kez yeniden çizsin.

# --code--

```js
  const H = canvas.height
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(0, 0, canvas.width, H / 2)
  ctx.fillStyle = '#475569'
  ctx.fillRect(0, H / 2, canvas.width, H / 2)

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```

# --meaning--

- `H` is a short name for the canvas height, used a lot in the drawing.
- The horizon is the middle line, `H / 2`.

# --meaning-tr--

- `const H = canvas.height` → sık kullanacağımız yükseklik için kısa ad.
- Tavan `0`'dan `H / 2`'ye, zemin `H / 2`'den aşağı: ortadaki çizgi **ufuk**.
- `loop` → çiz ve bir sonraki kareyi iste. En alttaki `draw()` yerine `requestAnimationFrame(loop)` başlatıyor.

# --task--

1. At the top of `draw`, write `H` and the ceiling and floor.
2. Replace `draw()` at the bottom with `loop` and `requestAnimationFrame(loop)`.

# --task-tr--

1. `draw`'ın en üstüne `H` satırını, tavanı ve zemini, sonra bir boş satır yaz.
2. En alttaki `draw()` satırını sil; `reset()`'in üstüne `loop` fonksiyonunu, altına `requestAnimationFrame(loop)` yaz.
3. **Çalıştır**.

# --tests--

A ceiling and a floor should be drawn every frame.
tr: Her karede bir tavan ve bir zemin çizilmeli.

```js
$.tick(1)
assert.deepEqual($.rects('#1e293b').map((r) => [r.y, r.h]), [[0, 160]])
assert.deepEqual($.rects('#475569').map((r) => [r.y, r.h]), [[160, 160]])
assert.strictEqual($.pendingFrames, 1)
```

# --solution--

```js
// 3D maze with raycasting, step by step.
// The page already has <canvas id="game" width="480" height="320"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

// # stone wall, 2 brick wall, E the exit (a wall you walk into), . floor.
const MAP = [
  '############',
  '#....#.....#',
  '#.##.#.###.#',
  '#.#..#...#.#',
  '#.#.###2#..#',
  '#.#.....#.##',
  '#.#22#.##..#',
  '#..........#',
  '###.##.#.#.#',
  '#...#..#.#.#',
  '#.#...##.#E#',
  '############',
]
const MINI = 8 // minimap pixels per tile

let player

function reset() {
  player = { x: 1.5, y: 1.5, angle: 0 }
}

function draw() {
  const H = canvas.height
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(0, 0, canvas.width, H / 2)
  ctx.fillStyle = '#475569'
  ctx.fillRect(0, H / 2, canvas.width, H / 2)

  // The minimap, seen from above.
  MAP.forEach((line, row) => {
    ;[...line].forEach((ch, col) => {
      ctx.fillStyle = ch === '.' ? 'rgba(15, 23, 42, 0.6)' : ch === 'E' ? '#22c55e' : 'rgba(226, 232, 240, 0.8)'
      ctx.fillRect(col * MINI, row * MINI, MINI, MINI)
    })
  })
  ctx.fillStyle = '#facc15'
  ctx.fillRect(player.x * MINI - MINI / 4, player.y * MINI - MINI / 4, MINI / 2, MINI / 2)
  ctx.strokeStyle = '#facc15'
  ctx.beginPath()
  ctx.moveTo(player.x * MINI, player.y * MINI)
  ctx.lineTo((player.x + Math.cos(player.angle)) * MINI, (player.y + Math.sin(player.angle)) * MINI)
  ctx.stroke()
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
