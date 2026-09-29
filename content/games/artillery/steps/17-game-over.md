---
title: Win or lose
title_tr: Kazan ya da kaybet
skills: [game.state]
---

# --goal--

When a shot leaves a tank at 0 health the game is over: you win if it's the computer's tank, you lose if it's yours.
A box says so, and Space starts a new game with new hills.

# --goal-tr--

Bir atış bir tankın canını 0'a indirince oyun **biter**: bilgisayarınki ise kazanırsın, seninki ise kaybedersin. Bir
kutu bunu söylesin; Boşluk yeni tepelerle **yeni bir oyun** başlatsın.

# --code--

```js
function endTurn() {
  if (tanks[1].hp === 0) state = 'won'
  else if (tanks[0].hp === 0) state = 'lost'
  else {
    turn = 1 - turn
    state = 'aiming'
    if (turn === 1) thinking = 60
  }
}

    if (state === 'won' || state === 'lost') reset()
    else if (turn === 0) fire()

  if (state === 'won' || state === 'lost') {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)'
    ctx.fillRect(140, 110, 280, 80)
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.font = 'bold 22px sans-serif'
    ctx.fillText(state === 'won' ? 'You win!' : 'You lose', W / 2, 145)
    ctx.font = '15px sans-serif'
    ctx.fillText('Space or tap to play again', W / 2, 172)
  }
```

# --meaning--

- The game-over checks come first; only if nobody is at 0 does the turn pass.
- In `'won'` and `'lost'` nothing flies, aims or thinks, so the game waits for Space.

# --meaning-tr--

- `endTurn` önce oyunun bitip bitmediğine bakar; kimse 0'da değilse (`else { ... }`) sıra geçer. Eski üç satır bu
  bloğun içine girdi.
- `'won'` ya da `'lost'` durumunda hiçbir şey uçmaz, nişan alınmaz, düşünülmez: oyun Boşluk'u bekler.
- Boşluk: oyun bittiyse `reset()` (yeni tepeler, dolu canlar), değilse sıra sendeyse ateş.

# --task--

1. Rewrite `endTurn` with the win and lose checks first.
2. On Space, start again when the game is over.
3. At the end of `draw`, draw the game-over box.

# --task-tr--

1. `endTurn`'ü kazanma ve kaybetme kontrolleri önde olacak şekilde yeniden yaz.
2. Boşluk bloğunda `if (turn === 0) fire()` satırının üstüne yeniden başlatma satırını yaz ve onu `else if` yap.
3. `draw`'ın sonuna oyun bitti kutusunu yaz. **Çalıştır**.

# --tests--

A tank at 0 health should end the game, and Space should start again.
tr: Canı 0 olan tank oyunu bitirmeli, Boşluk yeniden başlatmalı.

```js
tanks[1].hp = 20
explode(tanks[1].x, tanks[1].y - 6)
state = 'boom'
timer = 1
$.tick(1)
assert.strictEqual(state, 'won')
$.tick(1)
assert.include($.texts(), 'You win!')
$.press(' ')
assert.strictEqual(state, 'aiming')
assert.strictEqual(tanks[1].hp, 100)
```

Losing all your health should lose the game.
tr: Bütün canını kaybetmek oyunu kaybettirmeli.

```js
tanks[0].hp = 10
turn = 1
explode(tanks[0].x, tanks[0].y - 6)
state = 'boom'
timer = 1
$.tick(1)
assert.strictEqual(state, 'lost')
$.tick(1)
assert.include($.texts(), 'You lose')
```

# --solution--

```js
// Artillery, step by step.
// The page already has <canvas id="game" width="560" height="320"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const W = canvas.width
const H = canvas.height
const GRAVITY = 0.15
const BLAST = 30 // explosion radius
const MAX_POWER = 12
const FALL = 2 // pixels per frame a tank drops when the ground under it is gone

let ground // ground[x]: the y of the surface in column x
let tanks // [you, the computer]: { x, y, hp, angle, power, color }
let turn // 0 or 1: whose shot it is
let shell // { x, y, vx, vy } or null
let blast // { x, y } while an explosion shows
let timer // frames left to watch the explosion
let state // 'aiming', 'flying', 'boom', 'won' or 'lost'
let thinking // frames until the computer shoots

// Hills from three sine waves of random size and position, added together.
function makeGround() {
  const waves = [1, 2, 3].map((n) => ({ size: (30 / n) * (0.5 + Math.random()), length: W / (n + Math.random()), shift: Math.random() * W }))
  ground = []
  for (let x = 0; x < W; x++) {
    let y = 220
    for (const w of waves) y += w.size * Math.sin(((x + w.shift) / w.length) * Math.PI * 2)
    ground.push(Math.max(120, Math.min(H - 20, y)))
  }
}

const groundAt = (x) => ground[Math.max(0, Math.min(W - 1, Math.round(x)))]

function reset() {
  makeGround()
  tanks = [
    { x: 70, y: 0, hp: 100, angle: -Math.PI / 4, power: 8, color: '#2563eb' },
    { x: W - 70, y: 0, hp: 100, angle: (-3 * Math.PI) / 4, power: 8, color: '#dc2626' },
  ]
  for (const t of tanks) t.y = groundAt(t.x)
  turn = 0
  shell = null
  blast = null
  state = 'aiming'
}

function fire() {
  if (state !== 'aiming') return
  const t = tanks[turn]
  // The shell leaves from the end of the barrel.
  shell = {
    x: t.x + Math.cos(t.angle) * 14,
    y: t.y - 8 + Math.sin(t.angle) * 14,
    vx: Math.cos(t.angle) * t.power,
    vy: Math.sin(t.angle) * t.power,
  }
  state = 'flying'
}

// One frame of flight: gravity pulls down. Returns what it hit, or null.
function fly(s) {
  s.vy += GRAVITY
  s.x += s.vx
  s.y += s.vy
  if (s.x < 0 || s.x >= W) return 'away'
  if (s.y >= groundAt(s.x)) return 'ground'
  if (tanks.some((t) => t !== tanks[turn] && Math.hypot(t.x - s.x, t.y - 6 - s.y) < 12)) return 'tank'
  return null
}

// Blow a round hole in the ground and hurt the tanks nearby.
function explode(x, y) {
  for (let cx = Math.floor(x - BLAST); cx <= x + BLAST; cx++) {
    if (cx < 0 || cx >= W) continue
    const bottom = y + Math.sqrt(BLAST * BLAST - (cx - x) ** 2)
    if (bottom > ground[cx]) ground[cx] = Math.min(H - 2, bottom)
  }
  for (const t of tanks) {
    const d = Math.hypot(t.x - x, t.y - 6 - y)
    if (d < BLAST) t.hp = Math.max(0, Math.round(t.hp - (1 - d / BLAST) * 60))
  }
  blast = { x, y }
}

function endTurn() {
  if (tanks[1].hp === 0) state = 'won'
  else if (tanks[0].hp === 0) state = 'lost'
  else {
    turn = 1 - turn
    state = 'aiming'
    if (turn === 1) thinking = 60
  }
}

function update() {
  for (const t of tanks) {
    if (t.y < groundAt(t.x)) t.y = Math.min(groundAt(t.x), t.y + FALL) // nothing under it: it falls
    else t.y = groundAt(t.x)
  }
  if (state === 'boom' && --timer === 0) {
    blast = null
    endTurn()
  }
  if (state === 'aiming' && turn === 1 && --thinking === 0) {
    fire()
  }
  if (state !== 'flying') return
  const hit = fly(shell)
  if (!hit) return
  if (hit !== 'away') explode(shell.x, shell.y)
  shell = null
  state = 'boom'
  timer = 20
}

function aimBy(dAngle, dPower) {
  if (state !== 'aiming' || turn !== 0) return
  const t = tanks[0]
  t.angle = Math.max(-Math.PI, Math.min(0, t.angle + dAngle))
  t.power = Math.max(2, Math.min(MAX_POWER, t.power + dPower))
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') aimBy(-0.03, 0)
  else if (event.key === 'ArrowRight') aimBy(0.03, 0)
  else if (event.key === 'ArrowUp') aimBy(0, 0.25)
  else if (event.key === 'ArrowDown') aimBy(0, -0.25)
  else if (event.key === ' ') {
    if (state === 'won' || state === 'lost') reset()
    else if (turn === 0) fire()
  } else return
  event.preventDefault()
})

function draw() {
  ctx.fillStyle = '#7dd3fc'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#65a30d'
  for (let x = 0; x < W; x++) ctx.fillRect(x, ground[x], 1, H - ground[x])

  for (const [i, t] of tanks.entries()) {
    ctx.fillStyle = t.color
    ctx.fillRect(t.x - 10, t.y - 8, 20, 8)
    ctx.strokeStyle = t.color
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(t.x, t.y - 8)
    ctx.lineTo(t.x + Math.cos(t.angle) * 14, t.y - 8 + Math.sin(t.angle) * 14)
    ctx.stroke()
    // Health bar
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(t.x - 16, t.y - 22, 32, 4)
    ctx.fillStyle = t.hp > 30 ? '#22c55e' : '#ef4444'
    ctx.fillRect(t.x - 16, t.y - 22, (32 * t.hp) / 100, 4)
    if (i === turn && state === 'aiming') {
      ctx.fillStyle = '#0f172a'
      ctx.beginPath()
      ctx.moveTo(t.x - 5, t.y - 34)
      ctx.lineTo(t.x + 5, t.y - 34)
      ctx.lineTo(t.x, t.y - 27)
      ctx.fill()
    }
  }

  if (shell) {
    ctx.fillStyle = '#0f172a'
    ctx.beginPath()
    ctx.arc(shell.x, shell.y, 3, 0, Math.PI * 2)
    ctx.fill()
  }
  if (blast) {
    // The fireball grows as the timer runs down.
    ctx.fillStyle = 'rgba(249, 115, 22, 0.8)'
    ctx.beginPath()
    ctx.arc(blast.x, blast.y, BLAST * (1 - timer / 40), 0, Math.PI * 2)
    ctx.fill()
  }

  const you = tanks[0]
  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Angle ' + Math.round((-you.angle * 180) / Math.PI) + '°  Power ' + you.power.toFixed(1), 10, 20)
  ctx.textAlign = 'right'
  ctx.fillText(turn === 0 ? 'Your turn' : 'Computer', W - 10, 20)
  if (state === 'won' || state === 'lost') {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)'
    ctx.fillRect(140, 110, 280, 80)
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.font = 'bold 22px sans-serif'
    ctx.fillText(state === 'won' ? 'You win!' : 'You lose', W / 2, 145)
    ctx.font = '15px sans-serif'
    ctx.fillText('Space or tap to play again', W / 2, 172)
  }
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
