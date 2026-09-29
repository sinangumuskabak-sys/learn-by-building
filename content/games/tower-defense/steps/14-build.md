---
title: Click to build
title_tr: Tıkla ve kur
skills: [game.input, game.state]
---

# --goal--

You start with 120 gold. A click builds a tower of the `selected` kind on that tile and pays its cost. For now a
click builds anywhere; the next step adds the rules.

# --goal-tr--

**120 altınla** başlıyorsun. Haritaya tıklamak, seçili türde (`selected`, şimdilik hep `'arrow'`) bir kuleyi o kareye
kurar ve bedelini öder.

Şimdilik her yere kurabiliyorsun, hatta yolun üstüne ve borca. Kuralları bir sonraki adımda koyacağız.

# --code--

```js
let gold

let selected // the kind of tower to build

  gold = 120

  selected = 'arrow'

function build(col, row) {
  const kind = TOWERS[selected]
  gold -= kind.cost
  towers.push({ col, row, kind: selected, cooldown: 0 })
}

canvas.addEventListener('pointerdown', (event) => {
  const p = tileAt(event)
  build(p.col, p.row)
})
```

# --meaning--

- `build` pays the kind's cost and adds `{ col, row, kind, cooldown }`; `cooldown` will count the frames until the
  tower can shoot again.
- `pointerdown` fires when a mouse button or a finger goes down on the canvas.

# --meaning-tr--

- `let gold` → altın; `reset` içinde 120. `let selected` → kurulacak kule türü; `reset` içinde `'arrow'`.
- `function build(col, row) {` → kurma:
  - `const kind = TOWERS[selected]` → seçili türün bilgileri.
  - `gold -= kind.cost` → bedeli öde.
  - `towers.push({ col, row, kind: selected, cooldown: 0 })` → listeye yeni kule. `cooldown` (soğuma) kulenin tekrar
    ateş edebilmesine kaç kare kaldığı; ateş etmeyi yazınca kullanacağız.
- `canvas.addEventListener('pointerdown', ...)` → canvas'a fare tuşu ya da parmak **basılınca**: tıklanan kareyi bul,
  oraya kur.

# --task--

1. Above `let toSpawn` write `let gold`; under `let spawnIn` write `let selected`.
2. In `reset`, above `toSpawn = 30` write `gold = 120`, and at the end `selected = 'arrow'`.
3. Above `function update() {` write `build` and the `pointerdown` listener.

# --task-tr--

1. `let toSpawn` satırının **üstüne** `let gold`, `let spawnIn` satırının **altına** `let selected` yaz.
2. `reset` içinde `toSpawn = 30` satırının üstüne `gold = 120`, en sona da `selected = 'arrow'` yaz.
3. `function update() {` satırının **üstüne** `build` fonksiyonunu ve `pointerdown` dinleyicisini yaz.
4. **Çalıştır** ve çimene tıkla: mavi bir kule belirmeli.

# --predict--

You click three times on grass. How much gold is left?
- [ ] 20: the third click is refused
- [x] -30
  Nothing checks the gold yet. The next step adds the rules.
- [ ] 120

# --predict-tr--

Çimene üç kez tıklıyorsun. Ne kadar altın kalır?
- [ ] 20: üçüncü tıklama reddedilir
- [x] -30
  Henüz altını kontrol eden bir şey yok. Kuralları bir sonraki adımda koyacağız.
- [ ] 120

# --tests--

Clicking should build a tower and pay for it.
tr: Tıklamak bir kule kurmalı ve bedelini ödemeli.

```js
assert.strictEqual(gold, 120)
assert.strictEqual(selected, 'arrow')
$.click(60, 180) // tile (1, 3)
assert.lengthOf(towers, 1)
assert.deepEqual(towers[0], { col: 1, row: 3, kind: 'arrow', cooldown: 0 })
assert.strictEqual(gold, 70)
$.tick()
assert.deepEqual($.rects('#38bdf8').map((r) => [r.x, r.y, r.w]), [[46, 166, 28]])
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

function build(col, row) {
  const kind = TOWERS[selected]
  gold -= kind.cost
  towers.push({ col, row, kind: selected, cooldown: 0 })
}

canvas.addEventListener('pointerdown', (event) => {
  const p = tileAt(event)
  build(p.col, p.row)
})

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
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
