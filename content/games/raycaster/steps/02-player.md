---
title: The player
title_tr: Oyuncu
skills: [game.canvas, game.physics]
---

# --goal--

The player stands at a point on the grid, measured in tiles: (1.5, 1.5) is the middle of the top-left floor tile. They
also look in a direction, an angle. On the minimap they are a yellow dot with a line showing where they look.

# --goal-tr--

Oyuncu ızgarada bir **noktada** duruyor; birimi **kare**: (1.5, 1.5) sol üstteki zemin karesinin tam ortası. Bir de
bir **yöne bakıyor**: bir açı. Açı 0 → sağa bakar. Mini haritada sarı bir nokta ve baktığı yönü gösteren bir çizgi.

# --code--

```js
let player

function reset() {
  player = { x: 1.5, y: 1.5, angle: 0 }
}

  ctx.fillStyle = '#facc15'
  ctx.fillRect(player.x * MINI - MINI / 4, player.y * MINI - MINI / 4, MINI / 2, MINI / 2)
  ctx.strokeStyle = '#facc15'
  ctx.beginPath()
  ctx.moveTo(player.x * MINI, player.y * MINI)
  ctx.lineTo((player.x + Math.cos(player.angle)) * MINI, (player.y + Math.sin(player.angle)) * MINI)
  ctx.stroke()

reset()
```

# --meaning--

- `reset` puts the player at the start; the game will call it again to play once more.
- Multiplying by `MINI` turns tiles into minimap pixels. The dot is 4×4, centered.
- `Math.cos(angle)` and `Math.sin(angle)` give the step one tile long in the looking direction: across and down.

# --meaning-tr--

- `reset()` → oyuncuyu başa koyar; ileride yeniden oynamak için de çağıracağız. En altta `draw()`'dan önce çağrılıyor.
- `player.x * MINI` → kare biriminden mini harita pikseline. Nokta 4×4, ortalanmış (`- MINI / 4`).
- `Math.cos(angle)` ve `Math.sin(angle)` → baktığın yönde **bir kare** uzunluğundaki adımın yana ve aşağı payları.
  Açı 0 iken cos 1, sin 0: tam sağa. Çizgi oyuncudan bu adımın ucuna gidiyor.
- Açılar **radyan** cinsinden: `Math.PI` yarım tur (180°), `Math.PI / 2` çeyrek tur.

# --task--

1. Under `MINI`, write `player` and `reset`.
2. At the end of `draw`, draw the dot and the direction line.
3. At the bottom, call `reset()` above `draw()`.

# --task-tr--

1. `MINI` satırının altına, bir boş satırdan sonra `player` ve `reset` yaz.
2. `draw`'ın sonuna (minimap döngüsünün altına) noktayı ve yön çizgisini çizen satırları yaz.
3. En alttaki `draw()` satırının üstüne `reset()` yaz. **Çalıştır**.

# --tests--

The player should be a yellow dot looking right.
tr: Oyuncu sağa bakan sarı bir nokta olmalı.

```js
assert.deepEqual(player, { x: 1.5, y: 1.5, angle: 0 })
assert.deepEqual($.rects('#facc15'), [{ x: 10, y: 10, w: 4, h: 4, color: '#facc15' }])
const lines = $.screen().filter((c) => c.op === 'lineTo').map((c) => c.args)
assert.deepEqual(lines, [[20, 12]])
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

reset()
draw()
```
