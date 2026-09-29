---
title: Build, then defend
title_tr: Önce kur, sonra savun
skills: [game.state]
---

# --goal--

Tower defense has a rhythm: **build**, then **defend**, then build again. `state` is `'building'` or `'wave'`. While
building no enemies come; `startWave` sends the next wave of `6 + 2 × wave` enemies.

# --goal-tr--

Kule savunmasının bir **ritmi** var: önce **kur**, sonra **savun**, sonra yine kur. Bunu bir **durum** (state)
değişkeniyle tutuyoruz:

- `'building'` (kurma): düşman gelmez, istediğin kadar düşünüp kule kurarsın,
- `'wave'` (dalga): düşmanlar gelir.

`startWave` (dalgayı başlat) bir sonraki dalgayı gönderir: `6 + 2 × dalga` düşman. 1. dalga 8, 2. dalga 10... Bu adımda
dalgayı başlatacak bir düğme henüz yok; onu sırayla ekleyeceğiz.

# --code--

```js
let wave

let state // 'building', 'wave' or 'over'

  wave = 0
  toSpawn = 0
  spawnIn = 0
  state = 'building'

function startWave() {
  wave += 1
  toSpawn = 6 + wave * 2
  spawnIn = 0
  state = 'wave'
}

  if (state === 'wave' && toSpawn > 0) {
```

# --meaning--

- The game now starts building, with no enemies to come.
- `startWave` counts the wave up, sets how many will come, and switches to `'wave'`.
- Enemies only spawn during a wave.

# --meaning-tr--

- `let wave` → kaçıncı dalga; `reset` içinde 0. `let state` → oyunun durumu; `reset` içinde `'building'`. Yorumda
  bir üçüncü durum da var (`'over'`); onu sonra ekleyeceğiz.
- `toSpawn = 0` → oyun başında gelecek düşman yok (eski `30`'un yerine).
- `function startWave() {` → `wave += 1` (sonraki dalga), `toSpawn = 6 + wave * 2`, `spawnIn = 0` (ilki hemen gelsin),
  `state = 'wave'`.
- `state === 'wave' && toSpawn > 0` → düşmanlar yalnız bir dalga sırasında çıkar.

# --task--

1. Above `let toSpawn` write `let wave`; under `let spawnIn` write `let state`.
2. In `reset`, write `wave = 0` above `toSpawn`, change `toSpawn = 30` to `0`, and write `state = 'building'` under
   `spawnIn = 0`.
3. Under `pointAt` write `startWave`.
4. In `update`, add `state === 'wave' &&` to the spawning `if`.

# --task-tr--

1. `let toSpawn` satırının **üstüne** `let wave`, `let spawnIn` satırının **altına** `let state` yaz.
2. `reset` içinde `toSpawn = 30` satırının üstüne `wave = 0` yaz; `toSpawn = 30`'u `toSpawn = 0` yap; `spawnIn = 0`
   satırının altına `state = 'building'` yaz.
3. `pointAt` fonksiyonunun altında bir boş satır bırakıp `startWave`'i yaz.
4. `update` içinde düşman çıkaran `if (toSpawn > 0) {` satırını `if (state === 'wave' && toSpawn > 0) {` yap.
5. **Çalıştır**: artık hiç düşman gelmemeli. (Dalgayı bir sonraki adımda başlatacağız.)

# --tests--

Nothing should come until a wave is started.
tr: Bir dalga başlatılana kadar hiçbir şey gelmemeli.

```js
assert.strictEqual(state, 'building')
assert.strictEqual(wave, 0)
$.tick(100)
assert.lengthOf(enemies, 0)
```

`startWave` should send `6 + 2 × wave` enemies.
tr: `startWave`, `6 + 2 × dalga` düşman göndermeli.

```js
startWave()
assert.deepEqual([state, wave, toSpawn], ['wave', 1, 8])
$.tick()
assert.lengthOf(enemies, 1)
startWave()
assert.deepEqual([wave, toSpawn], [2, 10])
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
let selected // the kind of tower to build
let hover = null // the tile under the mouse

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
  if (!canBuild(col, row)) return
  const kind = TOWERS[selected]
  gold -= kind.cost
  towers.push({ col, row, kind: selected, cooldown: 0 })
}

canvas.addEventListener('pointerdown', (event) => {
  const p = tileAt(event)
  build(p.col, p.row)
})
canvas.addEventListener('pointermove', (event) => {
  const p = tileAt(event)
  hover = p.row >= 0 && p.row < ROWS ? p : null
})
canvas.addEventListener('pointerleave', () => {
  hover = null
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
  const kind = TOWERS[bullet.kind]
  bullet.target.hp -= kind.damage
}

function update() {
  if (state === 'wave' && toSpawn > 0) {
    spawnIn -= 1
    if (spawnIn <= 0) {
      enemies.push({ d: 0, hp: 10, maxHp: 10 })
      toSpawn -= 1
      spawnIn = 45
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

  if (hover) {
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
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
