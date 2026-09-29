---
title: Homing bullets
title_tr: Güdümlü mermiler
skills: [game.physics, game.collision]
---

# --goal--

Bullets **home in**: every frame they move 0.3 tiles straight towards where the target is now. When the target is
closer than one step, it is hit and the bullet is done.

# --goal-tr--

Mermiler **güdümlü**: her karede, hedefin **şu anki** yerine doğru dümdüz 0.3 kare ilerler. Hedef yürüse de mermi onu
izler. Hedef bir adımdan yakınsa: **isabet**, mermi işini bitirmiştir.

Yönü bulmak için hedefe giden oku kendi uzunluğuna böleriz: böylece boyu 1 olan bir **yön** elde ederiz; onu 0.3 ile
çarpınca adım çıkar.

# --code--

```js
for (const b of bullets) {
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
```

# --meaning--

- `dx, dy` is the arrow from the bullet to the target; `distance` its length.
- `dx / distance`, `dy / distance` is a direction of length 1; times 0.3 it is one step.
- Hit bullets are marked `done` and filtered out after the loop.

# --meaning-tr--

- `const p = pointAt(b.target.d)` → hedefin şu anki yeri.
- `dx`, `dy` → mermiden hedefe olan ok; `distance` → okun boyu (düz uzaklık).
- `if (distance < 0.3) {` → hedef bir adımdan yakınsa: `hit(b)` ile vur, `b.done = true` ile "işim bitti" diye
  işaretle.
- `else` → değilse bir adım yaklaş: `dx / distance` oku 1 boyuna indirir (sadece **yön** kalır); `* 0.3` adımı verir.
- `bullets.filter((b) => !b.done)` → işi bitmemiş mermileri tut. Mermileri döngünün **içinde** silmiyoruz; üzerinde
  gezdiğimiz liste döngü sırasında değişmesin.

# --task--

At the end of `update`, after an empty line, write the bullets loop and the `filter`.

# --task-tr--

1. `update`'in **sonuna**, kule döngüsünden sonra bir boş satır bırakıp mermi döngüsünü ve `filter` satırını yaz.
2. **Çalıştır**, yolun yanına bir kule kur: mermiler düşmanlara uçmalı ve onları düşürmeli.

# --predict--

A bullet is on its way when its target walks off the end of the road. What happens?
- [ ] The bullet disappears
- [x] The game stops with an error
  `pointAt` gives `null` for a target past the end, and `null` has no `x`. The next step fixes it.
- [ ] The bullet follows it off the screen

# --predict-tr--

Mermi yoldayken hedefi yolun sonundan çıkıp gidiyor. Ne olur?
- [ ] Mermi kaybolur
- [x] Oyun bir hatayla durur
  Sondan çıkan hedef için `pointAt` `null` verir; `null`'un `x`'i yoktur. Bir sonraki adım bunu düzeltecek.
- [ ] Mermi onu ekranın dışına kadar izler

# --tests--

A bullet should fly to its target and hurt it.
tr: Mermi hedefine uçmalı ve onu yaralamalı.

```js
toSpawn = 0
$.click(100, 140) // a tower at (2, 2)
enemies = [{ d: 2, hp: 10 }]
$.tick()
const b = bullets[0]
assert.closeTo(Math.hypot(b.x - 2, b.y - 2), 0.3, 1e-9, 'one step of 0.3 towards the target')
$.tick(9)
assert.strictEqual(enemies[0].hp, 6)
assert.lengthOf(bullets, 0)
```

Three hits should kill an enemy.
tr: Üç isabet bir düşmanı öldürmeli.

```js
toSpawn = 0
$.click(100, 140)
enemies = [{ d: 2, hp: 10 }]
$.tick(70)
assert.lengthOf(enemies, 0)
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

function hit(bullet) {
  const kind = TOWERS[bullet.kind]
  bullet.target.hp -= kind.damage
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

  for (const b of bullets) {
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
