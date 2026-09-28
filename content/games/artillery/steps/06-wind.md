---
title: Wind
title_tr: Rüzgâr
skills: [game.physics]
---

# --explanation--

With the same angle and power, a shot always lands in the same place, so once you find the range the game is over. **Wind** keeps
it interesting: a new random wind every turn, from `-0.05` to `0.05`.

Wind is a small force pushing sideways, so it goes where gravity goes, into the velocity, every frame:

```js
s.vx += wind
s.vy += GRAVITY
```

Because it adds to `vx` every frame, its effect **grows with time**: a long high lob drifts much more than a short flat shot. After
`t` frames the drift is `wind × (1 + 2 + ... + t)`, the same growing sum as a falling object. Players learn to shoot flatter into a
headwind and higher with the wind behind them.

The wind is shown as an arrow and a number from 0 to 5, rounded to whole hundredths so it reads cleanly.

# --explanation-tr--

**Bu adımda:** rüzgâr ekleyeceğiz. Ekranın üst ortasında `Wind → 3` gibi bir yazı olacak: ok rüzgârın yönünü, sayı
gücünü gösterecek. Her sırada rüzgâr değişecek ve mermileri yana itecek.

**Neden rüzgâr?** Aynı açı ve güçle bir atış hep aynı yere düşer; menzili bir kez bulunca oyunun tadı kaçar. Her sırada
yeni, rastgele bir rüzgâr (-0.05 ile 0.05 arası) oyunu ilginç tutar.

**Rüzgâr, yerçekimi gibi bir kuvvettir.** Yerçekimi her karede `vy`'ye ekleniyordu (3. adım). Rüzgâr da her karede
yana doğru, `vx`'e eklenir:

```js
s.vx += wind      // rüzgâr yana iter
s.vy += GRAVITY   // yerçekimi aşağı çeker
```

Her karede `vx`'e eklendiği için etkisi **zamanla büyür**: uzun, yüksek bir atış kısa, düz bir atıştan çok daha fazla
sürüklenir. `t` karede kayma `wind × (1 + 2 + ... + t)` olur; düşen bir cismin hızlanmasıyla aynı büyüyen toplam.
Oyuncular karşıdan esen rüzgârda daha düz, arkadan esende daha yüksek atmayı öğrenir.

**Rastgele rüzgâr, düzgün sayılarla.** `Math.random() - 0.5` -0.5 ile 0.5 arasında bir sayıdır. 10 ile çarpıp
`Math.round` ile yuvarlayınca -5 ile 5 arasında bir **tam sayı** olur; 100'e bölünce -0.05 ile 0.05 arasında, hep tam
yüzdelik (0.03 gibi) bir sayı çıkar. Ekranda bunu 100 ile çarpıp işaretsiz gösteririz (`Math.abs`): `3`.

```js
const newWind = () => (wind = Math.round((Math.random() - 0.5) * 10) / 100)
```

Bu tek satırlık fonksiyon hesaplanan sayıyı `wind` değişkenine koyar. Oyunun başında (`reset`) ve sıra her değiştiğinde
(`endTurn`) çağrılır.

**Ok seçimi:** `wind > 0 ? '→' : wind < 0 ? '←' : ''` → "artıysa sağ ok, eksiyse sol ok, sıfırsa ok yok (boş yazı)".
Artı `vx` sağa doğru demek, o yüzden artı rüzgâr sağa eser.

# --task--

1. Add `wind` and `newWind()`, which sets it to `Math.round((Math.random() - 0.5) * 10) / 100`. Call it in `reset()` and at every
   change of turn.
2. `fly` adds `wind` to `vx` every frame, before gravity.
3. Draw `Wind → 3` (or `←`, or no arrow when calm) centered at `(W / 2, 20)`, with the number `Math.abs(Math.round(wind * 100))`.

# --task-tr--

1. `let timer ...` satırının altına rüzgârı ekle:

   ```js
   let wind
   ```

2. `reset()` içinde `blast = null` satırının altına (`state = 'aiming'`'in üstüne) ekle:

   ```js
     newWind()
   ```

3. `reset()`'in kapanış `}`'sinden sonra, `function fire()`'ın **üstüne** `newWind`'i yaz:

   ```js
   const newWind = () => (wind = Math.round((Math.random() - 0.5) * 10) / 100) // -0.05 to 0.05
   ```

4. `fly()`'ın yorumunu güncelle ve en başına rüzgârı ekle:

   ```js
   // One frame of flight: wind pushes sideways, gravity pulls down. Returns what it hit, or null.
   function fly(s) {
     s.vx += wind // ← yeni
     s.vy += GRAVITY
   ```

5. `endTurn()` içinde, sıra değiştiği yerde `turn = 1 - turn` satırının altına ekle:

   ```js
     else {
       turn = 1 - turn
       newWind() // ← yeni
       state = 'aiming'
     }
   ```

6. `draw()`'da açı yazısını çizen `ctx.fillText('Angle ' ...)` satırının altına (`ctx.textAlign = 'right'`'ın üstüne)
   rüzgâr yazısını ekle:

   ```js
     ctx.textAlign = 'center'
     const arrow = wind > 0 ? '→' : wind < 0 ? '←' : ''
     ctx.fillText('Wind ' + arrow + ' ' + Math.abs(Math.round(wind * 100)), W / 2, 20)
   ```

   `→` ve `←` işaretlerini klavyede bulamazsan bu satırdan kopyala. `'Wind '` ve `' '` içindeki boşluklar önemli.

7. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. Üst ortada rüzgâr yazmalı; her atıştan sonra değişmeli. Yüksek
   atışların rüzgâr yönünde belirgin şekilde kaydığını görmelisin. Alttaki kontrollerin hepsi yeşil olmalı.

# --tests--

The wind should be a whole number of hundredths, at most 0.05, and change.
tr: Rüzgâr tam yüzdelik, en fazla 0.05 olmalı ve değişmeli.

```js
const seen = new Set()
for (let i = 0; i < 40; i++) {
  newWind()
  assert.isAtMost(Math.abs(wind), 0.05 + 1e-9)
  assert.closeTo(wind * 100, Math.round(wind * 100), 1e-9)
  seen.add(wind)
}
assert.isAbove(seen.size, 4, 'the wind changes')
```

The wind should push a shell a little more every frame.
tr: Rüzgâr bir mermiyi her karede biraz daha itmeli.

```js
wind = 0.05
const s = { x: 280, y: 100, vx: 0, vy: -6 }
for (let i = 0; i < 10; i++) fly(s)
assert.closeTo(s.x, 280 + 0.05 * 55, 1e-9, 'the wind pushes a little more every frame')
```

The wind should be shown with its direction.
tr: Rüzgâr yönüyle gösterilmeli.

```js
wind = -0.03
$.tick(1)
assert.include($.texts(), 'Wind ← 3')
wind = 0.05
$.tick(1)
assert.include($.texts(), 'Wind → 5')
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
let tanks // [blue, red]: { x, y, hp, angle, power, color }
let turn // 0 or 1: whose shot it is
let shell // { x, y, vx, vy } or null
let blast // { x, y } while an explosion shows
let timer // frames left to watch the explosion
let wind
let state // 'aiming', 'flying', 'boom', 'won' or 'lost'
let dragging

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
  newWind()
  state = 'aiming'
  dragging = false
}

const newWind = () => (wind = Math.round((Math.random() - 0.5) * 10) / 100) // -0.05 to 0.05

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

// One frame of flight: wind pushes sideways, gravity pulls down. Returns what it hit, or null.
function fly(s) {
  s.vx += wind
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
    newWind()
    state = 'aiming'
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
  if (state !== 'flying') return
  const hit = fly(shell)
  if (!hit) return
  if (hit !== 'away') explode(shell.x, shell.y)
  shell = null
  state = 'boom'
  timer = 20
}

function aimBy(dAngle, dPower) {
  if (state !== 'aiming') return
  const t = tanks[turn]
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
    else fire()
  } else return
  event.preventDefault()
})

// Point from the tank whose turn it is: the direction is the aim, the distance is the power.
function pointAt(event) {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * W) / rect.width
  const y = ((event.clientY - rect.top) * H) / rect.height
  const t = tanks[turn]
  // Below the barrel, atan2 gives an angle between 0 and π: aim flat to that side instead.
  const angle = Math.atan2(y - (t.y - 8), x - t.x)
  t.angle = angle > 0 ? (angle > Math.PI / 2 ? -Math.PI : 0) : angle
  t.power = Math.max(2, Math.min(MAX_POWER, Math.hypot(x - t.x, y - (t.y - 8)) / 12))
}

canvas.addEventListener('pointerdown', (event) => {
  if (state === 'won' || state === 'lost') return reset()
  if (state !== 'aiming') return
  dragging = true
  pointAt(event)
})

canvas.addEventListener('pointermove', (event) => {
  if (dragging) pointAt(event)
})

document.addEventListener('pointerup', () => {
  if (!dragging) return
  dragging = false
  fire()
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

  const now = tanks[turn]
  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Angle ' + Math.round((-now.angle * 180) / Math.PI) + '°  Power ' + now.power.toFixed(1), 10, 20)
  ctx.textAlign = 'center'
  const arrow = wind > 0 ? '→' : wind < 0 ? '←' : ''
  ctx.fillText('Wind ' + arrow + ' ' + Math.abs(Math.round(wind * 100)), W / 2, 20)
  ctx.textAlign = 'right'
  ctx.fillText(turn === 0 ? 'Blue to shoot' : 'Red to shoot', W - 10, 20)
  if (state === 'won' || state === 'lost') {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)'
    ctx.fillRect(140, 110, 280, 80)
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.font = 'bold 22px sans-serif'
    ctx.fillText(state === 'won' ? 'Blue wins!' : 'Red wins!', W / 2, 145)
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
