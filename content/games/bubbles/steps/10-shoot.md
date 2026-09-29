---
title: Fire!
title_tr: Ateş!
skills: [game.physics, game.input]
---

# --goal--

A shot is a bubble in flight: a position, a velocity along the aim (`SPEED` pixels per frame), and the loaded color. Firing
moves the next bubble into the shooter. Space shoots, and so does letting go of the pointer.

# --goal-tr--

Atış, **uçan bir balondur**: bir yeri, nişan yönünde bir **hızı** (karede `SPEED` piksel) ve yüklü balonun rengi var. Hızı
yine `cos` ve `sin` ile iki parçaya ayırırız: `vx` ve `vy`.

Ateş edince sıradaki balon atıcıya geçer, yeni bir sıradaki seçilir. Havada bir balon varken ikinci atış olmaz. **Boşluk**
ateş eder; fareyi ya da parmağı **kaldırmak** da: telefonda nişan almak istediğin yere dokunur, bırakırsın.

# --code--

```js
const SPEED = 12

let shot // the bubble in flight: { x, y, vx, vy, color }, or null

  shot = null

function shoot() {
  if (shot) return
  shot = { x: SHOOTER.x, y: SHOOTER.y, vx: Math.cos(aim) * SPEED, vy: Math.sin(aim) * SPEED, color: loaded }
  loaded = next
  next = pickColor()
}

  else if (event.key === ' ') shoot()

canvas.addEventListener('pointerup', shoot)

  if (shot) drawBubble(shot.x, shot.y, shot.color)
```

# --meaning--

- `shot` is `null` while nothing flies; `shoot` does nothing if a bubble is already flying.
- The new shot starts at the shooter with a velocity of `SPEED` along the aim, in the loaded color; then the next bubble is
  loaded and a new next is picked.
- The flying bubble is drawn when there is one.

# --meaning-tr--

- `const SPEED = 12` → uçan balonun hızı (piksel/kare).
- `let shot` → havadaki balon; yoksa `null` ("hiçbir şey"). `reset` içinde `shot = null`.
- `if (shot) return` → havada balon varsa ateş etme.
- `shot = { x: SHOOTER.x, y: SHOOTER.y, vx: Math.cos(aim) * SPEED, vy: Math.sin(aim) * SPEED, color: loaded }` → atıcıdan,
  nişan yönünde, yüklü renkte bir balon.
- `loaded = next` ve `next = pickColor()` → sıradaki atıcıya geçer, yeni bir sıradaki gelir.
- `else if (event.key === ' ') shoot()` → Boşluk ateş eder.
- `canvas.addEventListener('pointerup', shoot)` → bırakmak da ateş eder.
- `if (shot) drawBubble(...)` → havada balon varsa onu çiz.

# --task--

1. Under `SHOOTER` write `SPEED`; under `let next ...` write `let shot ...`; in `reset`, under `aim = ...`, write
   `shot = null`.
2. Under `reset`, leave an empty line and write `shoot`.
3. Add the Space line above `else return`, and the `pointerup` line under the `pointerdown` line.
4. In `draw`, under the next bubble, draw the shot.

# --task-tr--

1. `SHOOTER` satırının altına `SPEED` yaz.
2. `let next ...` satırının altına yorumuyla `let shot ...` yaz.
3. `reset` içinde `aim = -Math.PI / 2` satırının altına `shot = null` yaz.
4. `reset` fonksiyonunun altına bir boş satır bırak ve `shoot` fonksiyonunu yaz.
5. Tuş dinleyicisinde `else return` satırının **üstüne** Boşluk satırını yaz.
6. `pointerdown` satırının altına `pointerup` satırını yaz.
7. `draw` içinde sıradaki balonu çizen satırın altına uçan balonu çizen satırı yaz. **Çalıştır** ve Boşluk'a bas.

# --predict--

You press Space. What happens?
- [ ] A bubble flies up
- [x] The shooter changes color, but nothing flies
  The shot exists and is drawn at the shooter, but nothing moves it yet.
- [ ] Nothing at all

# --predict-tr--

Boşluk'a bastın. Ne olur?
- [ ] Bir balon yukarı uçar
- [x] Atıcının rengi değişir ama hiçbir şey uçmaz
  Atış var ve atıcının üstünde çiziliyor, ama onu hareket ettiren henüz yok.
- [ ] Hiçbir şey

# --tests--

Space should launch the loaded bubble and load the next one.
tr: Boşluk yüklü balonu fırlatmalı ve sıradakini yüklemeli.

```js
const color = loaded
const second = next
$.press(' ')
assert.isNotNull(shot)
assert.deepEqual([shot.x, shot.y, shot.color], [200, 490, color])
assert.closeTo(shot.vx, 0, 1e-9)
assert.closeTo(shot.vy, -12, 1e-9)
assert.strictEqual(loaded, second, 'the next bubble moves up')
const first = shot
$.press(' ')
assert.strictEqual(shot, first, 'no second shot while one is flying')
```

Letting go of the pointer should shoot too, and the shot should be drawn.
tr: İşaretçiyi bırakmak da ateş etmeli ve atış çizilmeli.

```js
$.pointerUp(200, 300)
assert.isNotNull(shot)
$.tick(1)
assert.deepInclude($.arcs(), { x: shot.x, y: shot.y, r: 19, color: COLORS[shot.color] })
```

# --solution--

```js
// Bubble shooter, step by step.
// The page already has <canvas id="game" width="400" height="520"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const R = 20 // bubble radius
const COLS = 10 // bubbles in an even row; odd rows have one less and sit half a bubble to the right
const ROWS = 14
const ROW_H = R * Math.sqrt(3) // rows overlap so the bubbles nest
const TOP = 30 // room for the score
const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7']
const SHOOTER = { x: 200, y: 490 }
const SPEED = 12

let grid // grid[r][c]: a color index, or -1 for an empty cell
let aim // angle of the shot, in radians
let loaded // color of the bubble in the shooter
let next // color of the one after
let shot // the bubble in flight: { x, y, vx, vy, color }, or null

const cols = (r) => (r % 2 === 0 ? COLS : COLS - 1)
const cellPos = (r, c) => ({ x: R + c * 2 * R + (r % 2) * R, y: TOP + R + r * ROW_H })

function pickColor() {
  return Math.floor(Math.random() * COLORS.length)
}

function reset() {
  grid = []
  for (let r = 0; r < ROWS; r++) {
    grid.push([])
    for (let c = 0; c < cols(r); c++) grid[r].push(r < 5 ? Math.floor(Math.random() * COLORS.length) : -1)
  }
  aim = -Math.PI / 2
  shot = null
  loaded = pickColor()
  next = pickColor()
}

function shoot() {
  if (shot) return
  shot = { x: SHOOTER.x, y: SHOOTER.y, vx: Math.cos(aim) * SPEED, vy: Math.sin(aim) * SPEED, color: loaded }
  loaded = next
  next = pickColor()
}

const clampAim = (angle) => Math.max(-Math.PI + 0.15, Math.min(-0.15, angle))

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') aim = clampAim(aim - 0.04)
  else if (event.key === 'ArrowRight') aim = clampAim(aim + 0.04)
  else if (event.key === ' ') shoot()
  else return
  event.preventDefault()
})

function pointAt(event) {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height
  if (y < SHOOTER.y) aim = clampAim(Math.atan2(y - SHOOTER.y, x - SHOOTER.x))
}

canvas.addEventListener('pointermove', pointAt)
canvas.addEventListener('pointerdown', pointAt)
canvas.addEventListener('pointerup', shoot)

function drawBubble(x, y, color, r = R) {
  ctx.fillStyle = COLORS[color]
  ctx.beginPath()
  ctx.arc(x, y, r - 1, 0, Math.PI * 2)
  ctx.fill()
}

function draw() {
  ctx.fillStyle = '#1e1b4b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#312e81'
  ctx.fillRect(0, 0, canvas.width, TOP)

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < cols(r); c++) {
      if (grid[r][c] < 0) continue
      const p = cellPos(r, c)
      drawBubble(p.x, p.y, grid[r][c])
    }
  }

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(SHOOTER.x, SHOOTER.y)
  ctx.lineTo(SHOOTER.x + Math.cos(aim) * 80, SHOOTER.y + Math.sin(aim) * 80)
  ctx.stroke()
  drawBubble(SHOOTER.x, SHOOTER.y, loaded)
  drawBubble(SHOOTER.x + 60, SHOOTER.y + 10, next, 12)
  if (shot) drawBubble(shot.x, shot.y, shot.color)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
