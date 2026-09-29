---
title: Walk
title_tr: Yürü
skills: [game.input, game.physics]
---

# --goal--

Up (or W) walks forwards in the looking direction, Down (or S) backwards. The step is the direction's cos and sin times
the speed. Walls don't stop you yet.

# --goal-tr--

Yukarı (ya da W) baktığın yöne **ileri**, aşağı (ya da S) **geri** yürütsün. Adım: yönün cos ve sin'i çarpı hız.
Duvarlar henüz durdurmuyor; içinden geçebilirsin.

# --code--

```js
const MOVE = 0.05 // tiles per frame

function move(dx, dy) {
  player.x += dx
  player.y += dy
}

  const forward = (keys.ArrowUp || keys.w ? 1 : 0) - (keys.ArrowDown || keys.s ? 1 : 0)
  if (forward !== 0) move(Math.cos(player.angle) * MOVE * forward, Math.sin(player.angle) * MOVE * forward)
```

# --meaning--

- `forward` is 1 (up held), -1 (down held) or 0 (neither, or both).
- `Math.cos(angle) * MOVE` is how much of the step goes across, `Math.sin(angle) * MOVE` how much goes down.
- Times `forward`, so walking backwards is the same step reversed.

# --meaning-tr--

- `forward` → yukarı basılıysa 1, aşağı basılıysa -1, ikisi de değilse (ya da ikisi birden) 0.
  `koşul ? 1 : 0` doğruyu 1'e, yanlışı 0'a çevirir.
- `Math.cos(player.angle) * MOVE` → adımın yana düşen payı; `Math.sin(...) * MOVE` aşağı düşen payı. Çapraz bakarken
  ikisi de bir parça.
- `* forward` → geri yürümek aynı adımın tersi.
- `move(dx, dy)` → oyuncuyu kaydırır. Birazdan duvar kontrolü buraya girecek.

# --task--

1. Above `TURN`, write `MOVE`.
2. Above the key listeners, write `move`.
3. At the end of `update`, write the two walking lines.

# --task-tr--

1. `TURN` satırının üstüne `MOVE` yaz.
2. Tuş dinleyicilerinin üstüne `move` fonksiyonunu yaz.
3. `update`'in sonuna iki yürüme satırını yaz. **Çalıştır** ve yürü.

# --tests--

Up should walk forwards along the angle, down backwards.
tr: Yukarı açı boyunca ileri, aşağı geri yürütmeli.

```js
$.press('ArrowUp')
$.tick(10)
assert.closeTo(player.x, 2, 1e-9)
assert.closeTo(player.y, 1.5, 1e-9)
$.release('ArrowUp')
$.press('s')
$.tick(4)
assert.closeTo(player.x, 1.8, 1e-9)
```

Walking should follow the angle.
tr: Yürüme açıyı izlemeli.

```js
player.angle = 0.4
$.press('ArrowUp')
$.tick(10)
assert.closeTo(player.x, 1.5 + Math.cos(0.4) * 0.5, 1e-9)
assert.closeTo(player.y, 1.5 + Math.sin(0.4) * 0.5, 1e-9)
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
const MOVE = 0.05 // tiles per frame
const TURN = 0.04 // radians per frame
const MINI = 8 // minimap pixels per tile

let player
const keys = {}

function reset() {
  player = { x: 1.5, y: 1.5, angle: 0 }
}

function move(dx, dy) {
  player.x += dx
  player.y += dy
}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if (event.key.startsWith('Arrow')) event.preventDefault()
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

function update() {
  if (keys.ArrowLeft || keys.a) player.angle -= TURN
  if (keys.ArrowRight || keys.d) player.angle += TURN
  const forward = (keys.ArrowUp || keys.w ? 1 : 0) - (keys.ArrowDown || keys.s ? 1 : 0)
  if (forward !== 0) move(Math.cos(player.angle) * MOVE * forward, Math.sin(player.angle) * MOVE * forward)
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
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
