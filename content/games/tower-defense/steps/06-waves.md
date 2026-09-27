---
title: Waves
title_tr: Dalgalar
skills: [game.state]
---

# --explanation--

Tower defense has a rhythm: **build**, then **defend**, then build again. That rhythm is a state machine with two
playing states:

```
'building'  --Start wave-->  'wave'  --all enemies gone-->  'building'
      any state  --no lives left-->  'over'
```

While building, no enemies come and you can take your time. A wave sends `6 + 2 × wave` enemies, and when the last one
is gone you get a bonus of `20 + 5 × wave` gold for the next round.

Each wave also gets **harder**: enemies have 25% more health each time (`10 × 1.25^(wave - 1)`) and come closer together.
The health grows by multiplying (exponentially) while your gold grows by adding, so sooner or later every defense
breaks. That is on purpose: the question is not whether you lose, but how many waves you survive, and that number is
your best score.

On a phone there is no Space key, so the bottom bar gets a **Start** button. It is just a rectangle you check the click
against, like the tiles.

# --explanation-tr--

Kule savunmasının bir ritmi vardır: **kur**, sonra **savun**, sonra yine kur. Bu ritim iki oyun durumu olan bir durum
makinesidir:

```
'building'  --Dalgayı başlat-->  'wave'  --bütün düşmanlar gitti-->  'building'
      herhangi bir durum  --can kalmadı-->  'over'
```

Kurarken düşman gelmez ve acele etmeden düşünebilirsin. Bir dalga `6 + 2 × wave` düşman gönderir; sonuncusu gidince bir
sonraki tur için `20 + 5 × wave` altın bonus alırsın.

Her dalga ayrıca **zorlaşır**: düşmanların canı her seferinde %25 artar (`10 × 1.25^(wave - 1)`) ve birbirlerine daha yakın
gelirler. Can çarparak (üstel olarak) büyürken altının toplayarak büyür; bu yüzden er ya da geç her savunma çöker. Bu
bilerek yapıldı: soru kaybedip kaybetmeyeceğin değil, kaç dalga dayanacağındır ve o sayı en iyi skorundur.

Telefonda Boşluk tuşu yok; bu yüzden alt çubuk bir **Başlat** düğmesi alır. Tıklamayı karşılaştırdığın bir dikdörtgendir,
tıpkı döşemeler gibi.

# --task--

1. Add `BAR = TOP + ROWS * TILE`, `START = { x: 150, w: 180 }`, `wave` and `best` (from `localStorage` `'td-best'`).
   `reset()` sets `wave = 0`, `toSpawn = 0` and state `'building'`.
2. Write `startWave()`: next wave, `toSpawn = 6 + wave * 2`, state `'wave'`; and `enemyHp()`:
   `Math.round(10 * 1.25 ** (wave - 1))`. Space starts a wave while building; so does a click in the bottom bar inside
   the start button.
3. Enemies only spawn during a wave, with `enemyHp()` health, `Math.max(20, 46 - wave * 2)` frames apart.
4. When a wave has nothing left to spawn and no enemies left: back to building, `20 + wave * 5` gold, and a new best if
   `wave` beats it. Losing saves `wave - 1` (the waves you survived) if that is a new best.
5. In the bottom bar draw a `'#4f46e5'` start button with `Start wave 2` while building, `Wave 2: 5 left` during a wave,
   and `Best 4` on the right. The Game Over screen adds `Survived 3 waves (best 4)`.

# --task-tr--

1. `BAR = TOP + ROWS * TILE`, `START = { x: 150, w: 180 }`, `wave` ve `best` (`localStorage` `'td-best'`'ten) ekle.
   `reset()` `wave = 0`, `toSpawn = 0` ve `'building'` durumunu ayarlar.
2. `startWave()` yaz: sonraki dalga, `toSpawn = 6 + wave * 2`, `'wave'` durumu; ve `enemyHp()`:
   `Math.round(10 * 1.25 ** (wave - 1))`. Kurarken Boşluk bir dalga başlatır; alt çubukta başlat düğmesinin içine tıklamak
   da.
3. Düşmanlar yalnızca bir dalga sırasında, `enemyHp()` canla, `Math.max(20, 46 - wave * 2)` kare arayla çıkar.
4. Bir dalganın çıkaracak düşmanı ve kalan düşmanı yoksa: yeniden kurma, `20 + wave * 5` altın ve `wave` onu geçiyorsa yeni
   bir en iyi. Kaybetmek, yeni bir en iyiyse `wave - 1`'i (dayandığın dalgaları) kaydeder.
5. Alt çubuğa kurarken `Start wave 2` yazan `'#4f46e5'` bir başlat düğmesi, dalga sırasında `Wave 2: 5 left`, sağa da
   `Best 4` çiz. Game Over ekranı `Survived 3 waves (best 4)` ekler.

# --tests--

Nothing should come until the wave is started.
tr: Dalga başlatılana kadar hiçbir şey gelmemeli.

```js
assert.strictEqual(state, 'building')
$.tick(100)
assert.lengthOf(enemies, 0)
assert.include($.texts(), 'Start wave 1')
$.press(' ')
assert.deepEqual([state, wave, toSpawn], ['wave', 1, 8])
$.tick(1)
assert.lengthOf(enemies, 1)
assert.include($.texts(), 'Wave 1: 8 left')
```

The start button in the bottom bar should start a wave too.
tr: Alt çubuktaki başlat düğmesi de bir dalga başlatmalı.

```js
$.click(100, 420)
assert.strictEqual(state, 'building', 'beside the button')
$.click(240, 420)
assert.strictEqual(state, 'wave')
```

Each wave should be stronger and come closer together.
tr: Her dalga daha güçlü olmalı ve daha sık gelmeli.

```js
startWave()
assert.strictEqual(enemyHp(), 10)
$.tick(1)
assert.strictEqual(enemies[0].hp, 10)
assert.strictEqual(spawnIn, 44)
wave = 5
assert.strictEqual(enemyHp(), 24)
wave = 20
$.tick(44)
assert.strictEqual(spawnIn, 20)
```

Clearing a wave should pay a bonus and record the best.
tr: Bir dalgayı temizlemek bonus ödemeli ve en iyiyi kaydetmeli.

```js
startWave()
toSpawn = 0
$.tick(1)
assert.strictEqual(state, 'building')
assert.strictEqual(gold, 145)
assert.strictEqual(best, 1)
assert.strictEqual(localStorage.getItem('td-best'), '1')
$.tick(1)
assert.include($.texts(), 'Start wave 2')
assert.include($.texts(), 'Best 1')
```

Losing should record the waves survived.
tr: Kaybetmek dayanılan dalgaları kaydetmeli.

```js
wave = 3
startWave() // wave 4
lives = 1
enemies = [{ d: 26.99, hp: 10, maxHp: 10 }]
$.tick(1)
assert.strictEqual(state, 'over')
assert.strictEqual(best, 3)
assert.include($.texts(), 'Survived 3 waves (best 3)')
```

# --solution--

```js
// Tower defense, step by step.
// The page already has <canvas id="game" width="480" height="440"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TILE = 40
const COLS = 12
const ROWS = 9
const TOP = 40 // room for gold, lives and the tower buttons
const BAR = TOP + ROWS * TILE // the bottom bar, with the start button, begins here
// The road, as corners in tiles. It starts off the left edge and ends off the right edge.
const PATH = [
  [-1, 1],
  [3, 1],
  [3, 6],
  [7, 6],
  [7, 2],
  [10, 2],
  [10, 7],
  [12, 7],
]
const SPEED = 0.03 // tiles per frame
const TOWERS = {
  arrow: { cost: 50, range: 2.5, damage: 4, reload: 24, color: '#38bdf8' },
}

let road // keys of the tiles the road covers
let enemies
let towers
let bullets
let gold
let lives
let wave
let toSpawn // enemies still to come in this wave
let spawnIn // frames until the next one
let state // 'building', 'wave' or 'over'
let selected // the kind of tower to build: only 'arrow' so far
let hover = null // the tile under the mouse
let best = Number(localStorage.getItem('td-best')) || 0

const key = (col, row) => col + ',' + row

// Every tile between two corners, corner included.
function findRoad() {
  road = new Set()
  for (let i = 1; i < PATH.length; i++) {
    let [x, y] = PATH[i - 1]
    const [tx, ty] = PATH[i]
    while (true) {
      road.add(key(x, y))
      if (x === tx && y === ty) break
      x += Math.sign(tx - x)
      y += Math.sign(ty - y)
    }
  }
}

function reset() {
  findRoad()
  enemies = []
  towers = []
  bullets = []
  gold = 120
  lives = 20
  wave = 0
  toSpawn = 0
  spawnIn = 0
  state = 'building'
  selected = 'arrow'
}

// Where on the road an enemy is after walking `d` tiles (null once it is past the end).
function pointAt(d) {
  for (let i = 1; i < PATH.length; i++) {
    const [ax, ay] = PATH[i - 1]
    const [bx, by] = PATH[i]
    const length = Math.abs(bx - ax) + Math.abs(by - ay)
    if (d <= length) return { x: ax + Math.sign(bx - ax) * d, y: ay + Math.sign(by - ay) * d }
    d -= length
  }
  return null
}

function startWave() {
  wave += 1
  toSpawn = 6 + wave * 2
  spawnIn = 0
  state = 'wave'
}

function enemyHp() {
  return Math.round(10 * 1.25 ** (wave - 1))
}

// Mouse and touch positions are in screen pixels; the canvas may be drawn smaller or bigger than its own pixels.
function tileAt(event) {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height
  return { x, y, col: Math.floor(x / TILE), row: Math.floor((y - TOP) / TILE) }
}

function canBuild(col, row) {
  const inside = col >= 0 && col < COLS && row >= 0 && row < ROWS
  const taken = towers.some((t) => t.col === col && t.row === row)
  return inside && !road.has(key(col, row)) && !taken && gold >= TOWERS[selected].cost
}

function build(col, row) {
  if (state === 'over' || !canBuild(col, row)) return
  const kind = TOWERS[selected]
  gold -= kind.cost
  towers.push({ col, row, kind: selected, cooldown: 0 })
}

// The start button in the bottom bar.
const START = { x: 150, w: 180 }

canvas.addEventListener('pointerdown', (event) => {
  const p = tileAt(event)
  if (state === 'over') {
    reset()
    return
  }
  if (p.y >= BAR) {
    if (state === 'building' && p.x >= START.x && p.x < START.x + START.w) startWave()
    return
  }
  build(p.col, p.row)
})
canvas.addEventListener('pointermove', (event) => {
  const p = tileAt(event)
  hover = p.row >= 0 && p.row < ROWS ? p : null
})
canvas.addEventListener('pointerleave', () => {
  hover = null
})
document.addEventListener('keydown', (event) => {
  if (event.key === ' ') {
    event.preventDefault()
    if (state === 'building') startWave()
    else if (state === 'over') reset()
  }
})

// The enemy in range that has walked the furthest: it is the closest to getting through.
function targetFor(tower) {
  const range = TOWERS[tower.kind].range
  let target = null
  for (const e of enemies) {
    const p = pointAt(e.d)
    const inRange = Math.hypot(p.x - tower.col, p.y - tower.row) <= range
    if (inRange && (!target || e.d > target.d)) target = e
  }
  return target
}

function hit(bullet) {
  bullet.target.hp -= TOWERS[bullet.kind].damage
}

function update() {
  if (state === 'over') return

  if (state === 'wave' && toSpawn > 0) {
    spawnIn -= 1
    if (spawnIn <= 0) {
      const hp = enemyHp()
      enemies.push({ d: 0, hp, maxHp: hp })
      toSpawn -= 1
      // Later waves come closer together, which is where splash damage shines.
      spawnIn = Math.max(20, 46 - wave * 2)
    }
  }

  for (const e of enemies) e.d += SPEED
  // Walked off the end of the road: it got through. Its hp drops to 0 so no bullet chases it any more.
  for (const e of enemies) {
    if (pointAt(e.d) === null) {
      e.hp = 0
      lives -= 1
    }
  }
  enemies = enemies.filter((e) => e.hp > 0)

  for (const t of towers) {
    t.cooldown -= 1
    if (t.cooldown > 0) continue
    const target = targetFor(t)
    if (!target) continue
    bullets.push({ x: t.col, y: t.row, target, kind: t.kind })
    t.cooldown = TOWERS[t.kind].reload
  }

  // Bullets fly towards their target; if it is gone, they fizzle out.
  for (const b of bullets) {
    if (b.target.hp <= 0) {
      b.done = true
      continue
    }
    const p = pointAt(b.target.d)
    const dx = p.x - b.x
    const dy = p.y - b.y
    const distance = Math.hypot(dx, dy)
    if (distance < 0.3) {
      hit(b)
      b.done = true
    } else {
      b.x += (dx / distance) * 0.3
      b.y += (dy / distance) * 0.3
    }
  }
  bullets = bullets.filter((b) => !b.done)

  for (const e of enemies) if (e.hp <= 0) gold += 5
  enemies = enemies.filter((e) => e.hp > 0)

  if (lives <= 0) {
    lives = 0
    state = 'over'
    if (wave - 1 > best) {
      best = wave - 1
      localStorage.setItem('td-best', best)
    }
    return
  }
  if (state === 'wave' && toSpawn === 0 && enemies.length === 0) {
    state = 'building'
    gold += 20 + wave * 5
    if (wave > best) {
      best = wave
      localStorage.setItem('td-best', best)
    }
  }
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      ctx.fillStyle = road.has(key(col, row)) ? '#a8a29e' : '#3f6212'
      ctx.fillRect(col * TILE, TOP + row * TILE, TILE, TILE)
    }
  }

  if (hover && state !== 'over') {
    ctx.fillStyle = canBuild(hover.col, hover.row) ? 'rgba(255, 255, 255, 0.25)' : 'rgba(239, 68, 68, 0.35)'
    ctx.fillRect(hover.col * TILE, TOP + hover.row * TILE, TILE, TILE)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.beginPath()
    ctx.arc((hover.col + 0.5) * TILE, TOP + (hover.row + 0.5) * TILE, TOWERS[selected].range * TILE, 0, Math.PI * 2)
    ctx.stroke()
  }

  for (const t of towers) {
    ctx.fillStyle = TOWERS[t.kind].color
    ctx.fillRect(t.col * TILE + 6, TOP + t.row * TILE + 6, TILE - 12, TILE - 12)
  }

  for (const e of enemies) {
    const p = pointAt(e.d)
    const x = (p.x + 0.5) * TILE
    const y = TOP + (p.y + 0.5) * TILE
    ctx.fillStyle = '#dc2626'
    ctx.beginPath()
    ctx.arc(x, y, 11, 0, Math.PI * 2)
    ctx.fill()
    // Health bar: red underneath, green for what is left.
    ctx.fillStyle = '#7f1d1d'
    ctx.fillRect(x - 14, y - 20, 28, 4)
    ctx.fillStyle = '#22c55e'
    ctx.fillRect(x - 14, y - 20, (28 * e.hp) / e.maxHp, 4)
  }

  ctx.fillStyle = '#fef08a'
  for (const b of bullets) {
    ctx.beginPath()
    ctx.arc((b.x + 0.5) * TILE, TOP + (b.y + 0.5) * TILE, 4, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Gold ' + gold + '  Lives ' + lives, 10, 26)
  ctx.textAlign = 'center'
  if (state === 'building') {
    ctx.fillStyle = '#4f46e5'
    ctx.fillRect(START.x, BAR + 6, START.w, 28)
    ctx.fillStyle = 'white'
    ctx.fillText('Start wave ' + (wave + 1), START.x + START.w / 2, BAR + 26)
  } else if (state === 'wave') {
    ctx.fillText('Wave ' + wave + ': ' + (toSpawn + enemies.length) + ' left', canvas.width / 2, BAR + 26)
  }
  ctx.textAlign = 'right'
  ctx.fillText('Best ' + best, canvas.width - 10, BAR + 26)
  ctx.textAlign = 'center'
  if (state === 'over') {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'white'
    ctx.font = 'bold 32px sans-serif'
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2)
    ctx.font = '18px sans-serif'
    ctx.fillText('Survived ' + (wave - 1) + ' waves (best ' + best + ')', canvas.width / 2, canvas.height / 2 + 30)
    ctx.fillText('Press Space to play again', canvas.width / 2, canvas.height / 2 + 56)
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
