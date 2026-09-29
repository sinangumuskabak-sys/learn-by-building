---
title: Keys being held
title_tr: Basılı tuşlar
skills: [game.input]
---

# --goal--

Which way does the player want to go? We keep the arrow keys being held in a list: a key goes on the end when it is
pressed and leaves when it is let go. The last one is in charge, as players expect.

# --goal-tr--

Oyuncu nereye gitmek istiyor? Ok tuşlarını **basılı tuttukça** yürüyecek. İki tuş birden basılıysa **en son basılan**
kazanır; oyuncular bunu bekler.

Basılı tuşları bir listede (`held`) tutacağız: basılan tuş listenin **sonuna** eklenir, bırakılan tuş listeden çıkar.
Son eleman yönetir. Onu bırakınca kontrol hâlâ basılı olan tuşa geçer.

Her ok tuşunun satıra ve sütuna ne eklediğini de bir **yön tablosunda** (`DIRS`) tutuyoruz. Bu adımda oyuncu henüz
yürümeyecek; önce tuşları doğru dinleyelim.

# --code--

```js
const DIRS = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }

let held // arrow keys being held, the last one pressed at the end

  held = []

document.addEventListener('keydown', (event) => {
  if (DIRS[event.key]) {
    event.preventDefault()
    if (!held.includes(event.key)) held.push(event.key)
  }
})

document.addEventListener('keyup', (event) => {
  held = held.filter((k) => k !== event.key)
})
```

# --meaning--

- `DIRS` maps each arrow key to `[rows, columns]` to move: up is one row less. `DIRS[event.key]` looks a key up and is
  `undefined` for other keys.
- `keydown` adds the key if it is not in the list yet (a held key repeats `keydown`); `preventDefault` stops the page
  from scrolling.
- `keyup` keeps every key except the one let go.

# --meaning-tr--

- `const DIRS = { ArrowUp: [-1, 0], ... }` → yön tablosu: her tuşa `[satır farkı, sütun farkı]`. Yukarı bir satır
  **az** (`-1`), sağ bir sütun **fazla**.
- `let held` → basılı ok tuşları; `reset` onu boş liste yapar.
- `document.addEventListener('keydown', (event) => { ... })` → bir tuşa **basılınca** çalışır; `event.key` tuşun adı
  (`'ArrowRight'` gibi).
- `if (DIRS[event.key])` → köşeli parantez, adı bir değişkende duran alanı okur. Tuş tabloda yoksa `undefined` gelir
  ve `if` yanlış sayar: ok tuşu değilse hiçbir şey yapma.
- `event.preventDefault()` → tarayıcının ok tuşuyla sayfayı kaydırmasını engeller.
- `if (!held.includes(event.key)) held.push(event.key)` → `includes` "listede var mı?", `!` "değil". Basılı tutulan
  tuş `keydown`'ı tekrar tekrar gönderir; listeye bir kez girsin.
- `keyup` → tuş **bırakılınca**: `held.filter((k) => k !== event.key)` bırakılan tuş **dışındakileri** tutar.

# --task--

1. Above `ENEMY_STARTS` write `DIRS`.
2. Under `let player` write `let held`; in `reset`, under the `player` line, write `held = []`.
3. Above `function drawCircle(` write the two listeners.

# --task-tr--

1. `const ENEMY_STARTS = ...` satırının **üstüne** `DIRS` satırını yaz.
2. `let player` satırının altına `let held` yaz.
3. `reset` içinde `player = ...` satırının altına `held = []` yaz.
4. `function drawCircle(` satırının **üstüne** iki dinleyiciyi yaz.
5. **Çalıştır**: ekranda fark yok, kontroller yeşil olmalı.

# --hint--

`held.filter` keeps the keys for which the function returns true: `k !== event.key`.

# --hint-tr--

`held.filter`, fonksiyonun `true` dediği tuşları tutar: `k !== event.key`, bırakılan tuş olmayanlar.

# --tests--

`DIRS` should give each arrow its step.
tr: `DIRS` her okun adımını vermeli.

```js
assert.deepEqual(DIRS, { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] })
```

Held arrows should be listed in order, once each, and leave when let go.
tr: Basılı oklar sırayla, birer kez listelenmeli ve bırakılınca çıkmalı.

```js
$.press('ArrowRight')
$.press('ArrowDown')
$.press('ArrowRight', { repeat: true })
assert.deepEqual(held, ['ArrowRight', 'ArrowDown'])
$.release('ArrowDown')
assert.deepEqual(held, ['ArrowRight'])
$.press('a')
assert.deepEqual(held, ['ArrowRight'], 'only arrows')
```

# --solution--

```js
// Bomberman-style game, step by step.
// The page already has <canvas id="game" width="416" height="384"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const COLS = 13
const ROWS = 11
const TILE = 32
const TOP = 32 // room for the lives and the time
const DIRS = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }
const ENEMY_STARTS = [[ROWS - 2, COLS - 2], [1, COLS - 2], [ROWS - 2, 1]]

let grid // grid[r][c]: '#' wall, '+' crate or ' ' floor
let player // { x, y, target: null or { r, c } }
let held // arrow keys being held, the last one pressed at the end

const near = (r, c, spots) => spots.some(([sr, sc]) => Math.abs(sr - r) + Math.abs(sc - c) <= 1)

// Walls all round, a pillar on every even row and column, and crates on about half of the rest,
// but never next to where the player and the enemies start.
function makeGrid() {
  grid = []
  for (let r = 0; r < ROWS; r++) {
    grid.push([])
    for (let c = 0; c < COLS; c++) {
      if (r === 0 || c === 0 || r === ROWS - 1 || c === COLS - 1 || (r % 2 === 0 && c % 2 === 0)) grid[r].push('#')
      else if (near(r, c, [[1, 1], ...ENEMY_STARTS]) || Math.random() > 0.55) grid[r].push(' ')
      else grid[r].push('+')
    }
  }
}

function reset() {
  makeGrid()
  player = { x: 1, y: 1, target: null }
  held = []
}

document.addEventListener('keydown', (event) => {
  if (DIRS[event.key]) {
    event.preventDefault()
    if (!held.includes(event.key)) held.push(event.key)
  }
})

document.addEventListener('keyup', (event) => {
  held = held.filter((k) => k !== event.key)
})

function drawCircle(m, color, radius) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(m.x * TILE + TILE / 2, TOP + m.y * TILE + TILE / 2, radius, 0, Math.PI * 2)
  ctx.fill()
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = c * TILE
      const y = TOP + r * TILE
      const tile = grid[r][c]
      ctx.fillStyle = tile === '#' ? '#475569' : tile === '+' ? '#b45309' : '#3f6212'
      ctx.fillRect(x, y, TILE, TILE)
      if (tile === '+') {
        ctx.fillStyle = '#92400e'
        ctx.fillRect(x + 4, y + 14, TILE - 8, 4)
      }
    }
  }
  drawCircle(player, '#f8fafc', 12)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
