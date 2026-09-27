---
title: Turning and walking
title_tr: Dönmek ve yürümek
skills: [game.input, game.physics]
---

# --explanation--

In a first-person game the arrow keys do not move you up, down, left and right on the map. **Left and right turn**
you, and **up and down walk** forwards and backwards, in whatever direction you are facing:

```js
player.angle += TURN                          // turn a little
player.x += Math.cos(player.angle) * MOVE     // walk along the angle
player.y += Math.sin(player.angle) * MOVE
```

This is why `cos` and `sin` matter: they split one step "forwards" into its across and down parts, for any angle.
Walking backwards is the same step with the opposite sign.

Movement is smooth, so keys are **held**, and the same `keys` object also takes the WASD keys, which many players
prefer. On a phone, holding the left third of the screen turns left, the right third turns right and the middle walks.

For now nothing stops you: you can walk straight through the walls. That comes next.

# --explanation-tr--

Birinci şahıs bir oyunda ok tuşları seni haritada yukarı, aşağı, sola ve sağa taşımaz. **Sol ve sağ seni döndürür**,
**yukarı ve aşağı** da hangi yöne bakıyorsan o yönde ileri ve geri **yürütür**:

```js
player.angle += TURN                          // biraz dön
player.x += Math.cos(player.angle) * MOVE     // açı boyunca yürü
player.y += Math.sin(player.angle) * MOVE
```

`cos` ve `sin`'in önemi budur: "ileri" bir adımı, her açı için yana ve aşağı parçalarına ayırırlar. Geri yürümek, işareti
ters aynı adımdır.

Hareket akıcıdır; bu yüzden tuşlar **basılı tutulur** ve aynı `keys` nesnesi birçok oyuncunun tercih ettiği WASD tuşlarını da
alır. Telefonda ekranın sol üçte birini basılı tutmak sola, sağ üçte birini sağa döndürür, ortası yürütür.

Şimdilik seni hiçbir şey durdurmuyor: duvarların içinden dümdüz geçebilirsin. Sırada o var.

# --task--

1. Add `MOVE = 0.05` (tiles per frame), `TURN = 0.04` (radians per frame) and a `keys` object filled by `keydown` and
   `keyup` (`preventDefault()` for arrow keys).
2. Write `move(dx, dy)` that adds to the player's position, and `update()`: `ArrowLeft` or `a` turns by `-TURN`,
   `ArrowRight` or `d` by `TURN`; `ArrowUp` or `w` walks forwards and `ArrowDown` or `s` backwards by `MOVE` along the
   angle. Call it every frame.
3. On `pointerdown` on the canvas, hold `ArrowLeft`, `ArrowUp` or `ArrowRight` depending on which third of the canvas
   was touched; release all three on `pointerup` and `pointercancel`.

# --task-tr--

1. `MOVE = 0.05` (kare başına döşeme), `TURN = 0.04` (kare başına radyan) ve `keydown` ile `keyup`'ın doldurduğu bir `keys`
   nesnesi ekle (ok tuşları için `preventDefault()`).
2. Oyuncunun konumuna ekleyen `move(dx, dy)` ve `update()` yaz: `ArrowLeft` ya da `a` `-TURN` kadar, `ArrowRight` ya da `d`
   `TURN` kadar döndürür; `ArrowUp` ya da `w` açı boyunca `MOVE` kadar ileri, `ArrowDown` ya da `s` geri yürütür. Her karede
   çağır.
3. Canvas'taki `pointerdown`'da canvas'ın hangi üçte birine dokunulduğuna göre `ArrowLeft`, `ArrowUp` ya da `ArrowRight`'ı
   basılı tut; `pointerup` ve `pointercancel`'da üçünü de bırak.

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

Left and right should turn, and walking should follow the new angle.
tr: Sol ve sağ döndürmeli ve yürüme yeni açıyı izlemeli.

```js
$.press('ArrowRight')
$.tick(10)
assert.closeTo(player.angle, 0.4, 1e-9)
$.release('ArrowRight')
$.press('ArrowUp')
$.tick(10)
assert.closeTo(player.x, 1.5 + Math.cos(0.4) * 0.5, 1e-9)
assert.closeTo(player.y, 1.5 + Math.sin(0.4) * 0.5, 1e-9)
$.release('ArrowUp')
$.press('a')
$.tick(20)
assert.closeTo(player.angle, -0.4, 1e-9)
```

Touching the thirds of the screen should turn and walk.
tr: Ekranın üçte birlerine dokunmak döndürmeli ve yürütmeli.

```js
$.pointerDown(400, 100)
$.tick(5)
assert.closeTo(player.angle, 0.2, 1e-9)
$.pointerUp(400, 100)
$.pointerDown(240, 100)
$.tick(5)
assert.isAbove(player.x, 1.7)
$.pointerUp(240, 100)
$.tick(5)
const x = player.x
$.tick(5)
assert.strictEqual(player.x, x, 'letting go stops')
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
const MINI = 24 // map pixels per tile

let player
const keys = {}

function reset() {
  player = { x: 1.5, y: 1.5, angle: 0 }
}

// For now nothing stops the player.
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

// Touch: hold the left third to turn left, the right third to turn right, the middle to walk.
canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  const third = ((event.clientX - rect.left) / rect.width) * 3
  keys[third < 1 ? 'ArrowLeft' : third < 2 ? 'ArrowUp' : 'ArrowRight'] = true
})
function stopTouch() {
  keys.ArrowLeft = false
  keys.ArrowUp = false
  keys.ArrowRight = false
}
canvas.addEventListener('pointerup', stopTouch)
canvas.addEventListener('pointercancel', stopTouch)

function update() {
  if (keys.ArrowLeft || keys.a) player.angle -= TURN
  if (keys.ArrowRight || keys.d) player.angle += TURN
  const forward = (keys.ArrowUp || keys.w ? 1 : 0) - (keys.ArrowDown || keys.s ? 1 : 0)
  if (forward !== 0) move(Math.cos(player.angle) * MOVE * forward, Math.sin(player.angle) * MOVE * forward)
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // The map, seen from above.
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
