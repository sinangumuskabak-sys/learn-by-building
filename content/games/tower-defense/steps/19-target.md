---
title: Pick a target
title_tr: Hedef seç
skills: [game.collision]
---

# --goal--

A tower keeps asking: which enemy do I shoot? The classic answer: among those in range, the one that has walked the
furthest, because it is the closest to getting through. With `d`, "furthest" is just the biggest `d`.

# --goal-tr--

Kule saniyede defalarca aynı soruyu sorar: **hangi düşmanı vurayım?** Klasik cevap: menzilimdekiler arasında **en
uzağa yürümüş** olanı, çünkü geçip gitmeye en yakın o. `d` sayesinde "en uzağa" demek sadece "en büyük `d`".

Menzilde mi? Kuleden düşmana düz uzaklık, kulenin menzilinden küçük ya da eşitse.

# --code--

```js
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
```

# --meaning--

- `Math.hypot(dx, dy)` is the straight distance between two points, in tiles here.
- `target` starts as `null`; an enemy in range replaces it if there is none yet or if it has walked further.
- With nobody in range, the answer is `null`.

# --meaning-tr--

- `const range = TOWERS[tower.kind].range` → bu kulenin menzili.
- `let target = null` → şimdilik hedef yok.
- `Math.hypot(p.x - tower.col, p.y - tower.row)` → kuleden düşmana **düz uzaklık** (Pisagor: √(dx² + dy²)), kare olarak.
- `if (inRange && (!target || e.d > target.d)) target = e` → menzildeyse **ve** (henüz hedef yoksa **ya da** bu
  düşman öncekinden uzağa yürümüşse) hedef bu olur. Parantez önemli: `||` önce kendi içinde değerlendirilir.
- `return target` → bulunan hedef, ya da kimse menzilde değilse `null`.

# --task--

Above `function update() {` write the comment and `targetFor`.

# --task-tr--

1. `function update() {` satırının **üstüne** yorumu ve `targetFor`'u yaz.
2. **Çalıştır**: ekranda fark yok; kontroller yeşil olmalı.

# --predict--

A tower at (2, 2) with range 2.5; enemies at d = 1 (0, 1), d = 3 (2, 1) and d = 12 (6, 6). Which is its target?
- [ ] d = 1: it came first
- [x] d = 3: in range and further along
- [ ] d = 12: it walked the furthest
  But it is about 5.7 tiles away, out of range.

# --predict-tr--

(2, 2)'de menzili 2.5 olan bir kule; düşmanlar d = 1 (0, 1), d = 3 (2, 1) ve d = 12 (6, 6)'da. Hedefi hangisi?
- [ ] d = 1: ilk o geldi
- [x] d = 3: menzilde ve daha ileride
- [ ] d = 12: en uzağa o yürüdü
  Ama yaklaşık 5.7 kare uzakta; menzil dışında.

# --tests--

A tower should aim at the enemy in range that has walked the furthest.
tr: Kule menzildeki en uzağa yürümüş düşmanı hedeflemeli.

```js
const tower = { col: 2, row: 2, kind: 'arrow', cooldown: 0 }
enemies = [{ d: 1, hp: 10 }, { d: 3, hp: 10 }, { d: 12, hp: 10 }]
assert.strictEqual(targetFor(tower), enemies[1], '(2, 1) is further along than (0, 1); (6, 6) is out of range')
enemies = [{ d: 12, hp: 10 }]
assert.isNull(targetFor(tower))
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
