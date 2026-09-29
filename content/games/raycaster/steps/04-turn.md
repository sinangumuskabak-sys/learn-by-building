---
title: Turn around
title_tr: Dön
skills: [game.input]
---

# --goal--

Left and right (or A and D) turn the player: the angle changes a little every frame while the key is held.

# --goal-tr--

Sol ve sağ oklar (ya da A ve D) oyuncuyu **döndürsün**: tuş basılı kaldıkça açı her karede biraz değişsin.

# --code--

```js
const TURN = 0.04 // radians per frame
const keys = {}

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
}

  update()
```

# --meaning--

- `keys` remembers which keys are held.
- `preventDefault` stops the arrows from scrolling the page.
- A bigger angle turns clockwise on screen (y grows downward), so Right adds.

# --meaning-tr--

- `keys` → basılı tuşları hatırlar: basınca `true`, bırakınca `false`.
- `event.key.startsWith('Arrow')` → ok tuşlarından biriyse `preventDefault()`: sayfa kaymasın.
- `keys.ArrowLeft || keys.a` → sol ok **veya** A.
- Açı büyüyünce ekranda saat yönünde döner (y aşağı doğru büyüdüğü için); o yüzden sağ ok ekliyor.
- `TURN = 0.04` radyan ≈ 2,3°; saniyede ~137°.

# --task--

1. Above `MINI`, write `TURN`; under `player`, write `keys`.
2. Above `draw`, write the key listeners and `update`.
3. In `loop`, call `update()` before `draw()`.

# --task-tr--

1. `MINI` satırının üstüne `TURN`, `let player` satırının altına `keys` yaz.
2. `draw` fonksiyonunun üstüne iki tuş dinleyicisini ve `update`'i yaz.
3. `loop` içinde `draw()`'ın üstüne `update()` yaz.
4. **Çalıştır**, oyuna tıkla ve oklarla dön: mini haritadaki çizgi dönmeli.

# --tests--

Left and right should turn the player.
tr: Sol ve sağ oyuncuyu döndürmeli.

```js
$.press('ArrowRight')
$.tick(10)
assert.closeTo(player.angle, 0.4, 1e-9)
$.release('ArrowRight')
$.press('a')
$.tick(20)
assert.closeTo(player.angle, -0.4, 1e-9)
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
const TURN = 0.04 // radians per frame
const MINI = 8 // minimap pixels per tile

let player
const keys = {}

function reset() {
  player = { x: 1.5, y: 1.5, angle: 0 }
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
