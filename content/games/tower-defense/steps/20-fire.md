---
title: Fire!
title_tr: Ateş!
skills: [game.state, game.loop]
---

# --goal--

Towers do not shoot every frame. Each has a `cooldown` that counts down; at zero, if it has a target, it fires a
bullet and the cooldown starts again at the kind's `reload`. A timer per thing, counted down in `update`: the same
idea runs every weapon and spell in games.

# --goal-tr--

Kuleler her karede ateş etmez; öyle olsa saniyede 60 mermi atarlardı. Her kulenin bir **soğuma** sayacı (`cooldown`)
var: her karede azalır; sıfıra inince, bir hedefi varsa kule bir **mermi** atar ve sayaç türün `reload` değerinden
(24 kare) yeniden başlar.

Her şeye bir zamanlayıcı, `update` içinde geri sayılır: oyunlardaki her silah ve büyü bu fikirle çalışır. Mermiler şimdilik
kulede duracak; uçmayı bir sonraki adımlarda yazacağız.

# --code--

```js
let bullets

  bullets = []

  for (const t of towers) {
    t.cooldown -= 1
    if (t.cooldown > 0) continue
    const target = targetFor(t)
    if (!target) continue
    bullets.push({ x: t.col, y: t.row, target, kind: t.kind })
    t.cooldown = TOWERS[t.kind].reload
  }

  ctx.fillStyle = '#fef08a'
  for (const b of bullets) {
    ctx.beginPath()
    ctx.arc((b.x + 0.5) * TILE, TOP + (b.y + 0.5) * TILE, 4, 0, Math.PI * 2)
    ctx.fill()
  }
```

# --meaning--

- `continue` skips the rest of the loop for this tower and goes on to the next one.
- A bullet starts on the tower's tile, remembers its target enemy and the tower's kind.
- Bullets are small yellow circles, drawn after the enemies.

# --meaning-tr--

- `let bullets` → uçan mermiler; `reset` içinde boş.
- `t.cooldown -= 1` → soğuma geri sayımı.
- `if (t.cooldown > 0) continue` → hâlâ soğuyorsa `continue`: döngünün geri kalanını **bu kule için atla**, sıradaki
  kuleye geç.
- `const target = targetFor(t)` → hedef; `if (!target) continue` → kimse menzilde değilse atla.
- `bullets.push({ x: t.col, y: t.row, target, kind: t.kind })` → kulenin karesinden yeni bir mermi; hedefini ve
  hangi kuleden çıktığını hatırlar.
- `t.cooldown = TOWERS[t.kind].reload` → sayaç yeniden 24'ten başlar.
- Çizim: sarı (`'#fef08a'`), 4 yarıçaplı küçük daireler; düşmanlardan sonra.

# --task--

1. Under `let towers` write `let bullets`; in `reset`, under `towers = []`, write `bullets = []`.
2. At the end of `update`, after an empty line, write the towers loop.
3. In `draw`, after the enemies loop and an empty line, write the bullets.

# --task-tr--

1. `let towers` satırının altına `let bullets` yaz; `reset` içinde `towers = []` satırının altına `bullets = []` yaz.
2. `update`'in **sonuna**, bir boş satırdan sonra kule döngüsünü yaz.
3. `draw` içinde düşman döngüsünden sonra bir boş satır bırakıp mermi çizimini yaz.
4. **Çalıştır**, yolun yanına bir kule kur ve bekle.

# --predict--

What do the bullets do after this step?
- [ ] Fly to the enemies
- [x] Pile up on the tower, one more every 24 frames
  Nothing moves them yet.
- [ ] Nothing: no bullets appear

# --predict-tr--

Bu adımdan sonra mermiler ne yapar?
- [ ] Düşmanlara uçar
- [x] Kulenin üstünde birikir, 24 karede bir yenisi
  Onları hareket ettiren bir kod henüz yok.
- [ ] Hiçbir şey: mermi görünmez

# --tests--

A tower should fire at its target, then wait `reload` frames.
tr: Kule hedefine ateş etmeli, sonra `reload` kare beklemeli.

```js
toSpawn = 0
$.click(100, 140) // a tower at (2, 2)
enemies = [{ d: 2, hp: 10 }]
$.tick()
assert.lengthOf(bullets, 1)
assert.strictEqual(bullets[0].target, enemies[0])
assert.deepInclude(bullets[0], { x: 2, y: 2, kind: 'arrow' })
$.tick(23)
assert.lengthOf(bullets, 1)
$.tick()
assert.lengthOf(bullets, 2, 'reloaded')
```

With nobody in range, a tower should not fire; bullets should be drawn.
tr: Menzilde kimse yoksa kule ateş etmemeli; mermiler çizilmeli.

```js
toSpawn = 0
$.click(100, 140)
enemies = [{ d: 20, hp: 10 }]
$.tick(5)
assert.lengthOf(bullets, 0)
bullets.push({ x: 2, y: 2, target: enemies[0], kind: 'arrow' })
$.tick()
assert.deepInclude($.arcs(), { x: 100, y: 140, r: 4, color: '#fef08a' })
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
let toSpawn // enemies still to come in this wave
let spawnIn // frames until the next one
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
  toSpawn = 30
  spawnIn = 0
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

function update() {
  if (toSpawn > 0) {
    spawnIn -= 1
    if (spawnIn <= 0) {
      enemies.push({ d: 0, hp: 10 })
      toSpawn -= 1
      spawnIn = 45
    }
  }

  for (const e of enemies) e.d += SPEED
  for (const e of enemies) {
    if (pointAt(e.d) === null) {
      e.hp = 0
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
  ctx.fillText('Gold ' + gold, 10, 26)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
