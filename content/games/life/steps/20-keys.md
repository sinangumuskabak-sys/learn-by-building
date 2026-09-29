---
title: Space to play, N to step
title_tr: Boşlukla oynat, N ile adım at
skills: [game.input]
---

# --goal--

The keys now just name a button: a small table turns Space into `'Play'` and N into `'Step'`, and `press` does the
rest.

# --goal-tr--

Şimdi tuşları `press`'e bağlıyoruz. Her tuş için ayrı bir `if` yazmak yerine küçük bir **tablo** kuracağız:
"**Boşluk** → Play, **N** → Step". Bir sözlük gibi: tuşu ararsın, karşısındaki düğme adını bulursun.

# --code--

```js
document.addEventListener('keydown', (event) => {
  const keys = { ' ': 'Play', n: 'Step' }
  const button = keys[event.key.toLowerCase()]
  if (!button) return
  event.preventDefault()
  press(button)
})
```

# --meaning--

- `{ ' ': 'Play', n: 'Step' }` is an object used as a table: `keys['n']` is `'Step'`, `keys[' ']` (Space) is `'Play'`.
  A key that is not in it gives `undefined`.
- `if (!button) return` stops for keys we do not use.
- `event.preventDefault()` stops the browser's own action, like Space scrolling the page.

# --meaning-tr--

- `const keys = { ' ': 'Play', n: 'Step' }` → bir **nesne** (object): `anahtar: değer` çiftlerinden oluşan küçük bir
  sözlük. `' '` (tırnak içinde bir boşluk) **boşluk tuşunun** adıdır.
- `keys[event.key.toLowerCase()]` → köşeli parantezle tabloda arama: `keys['n']` → `'Step'`, `keys[' ']` →
  `'Play'`. Tabloda olmayan bir tuş sorulursa sonuç `undefined` (**yok**) olur.
- `if (!button) return` → "düğme yoksa (bizi ilgilendirmeyen bir tuşsa) burada dur". `return` fonksiyondan hemen
  çıkar; alttaki satırlar çalışmaz.
- `event.preventDefault()` → tarayıcının o tuşla **kendi** yaptığı işi engeller. Boşluk tuşu normalde sayfayı aşağı
  kaydırır; bunu istemeyiz.
- `press(button)` → kararı `press` verir.

# --task--

Inside the `keydown` listener, replace the `if (... === 'n') step()` line with the five new lines.

# --task-tr--

1. `keydown` dinleyicisinin içindeki `if (event.key.toLowerCase() === 'n') step()` satırını **sil**.
2. Yerine beş yeni satırı yaz. Dinleyicinin ilk ve son satırı aynı kalır.
3. **Çalıştır**, oyuna tıkla: **Boşluk** dünyayı başlatıp durdurmalı, **N** durdurup bir nesil ilerletmeli.

# --hint--

The Space key's name is a single space in quotes: `' '`. Keep `.toLowerCase()`, so a capital N works too.

# --hint-tr--

Boşluk tuşunun adı tırnak içinde tek bir boşluktur: `' '`. `.toLowerCase()` kalsın ki büyük N de çalışsın.

# --try--

Press Space and watch the soup settle: in the end mostly still blocks and blinking threes remain.

# --try-tr--

Boşluğa bas ve çorbanın nasıl yatıştığını izle: sonunda çoğunlukla duran bloklar ve yanıp sönen üçlüler kalır.

# --tests--

Space should start the world and stop it again.
tr: Boşluk dünyayı başlatmalı ve yeniden durdurmalı.

```js
assert.isFalse(playing)
$.press(' ')
assert.isTrue(playing)
$.tick(60)
assert.strictEqual(generation, 60 / SPEED)
$.press(' ')
$.tick(60)
assert.strictEqual(generation, 60 / SPEED, 'paused')
```

N should pause the world and step once.
tr: N dünyayı duraklatmalı ve bir kez ilerletmeli.

```js
$.press(' ')
$.tick(SPEED * 2)
$.press('N')
assert.isFalse(playing, 'stepping pauses')
assert.strictEqual(generation, 3)
```

Other keys should do nothing.
tr: Başka tuşlar hiçbir şey yapmamalı.

```js
$.press('m')
$.press('Enter')
assert.isFalse(playing)
assert.strictEqual(generation, 0)
```

# --solution--

```js
// Game of Life, step by step.
// The page already has <canvas id="game" width="480" height="480"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const CELL = 8
const COLS = 60
const ROWS = 48
const TOP = 36
const SPEED = 6 // frames per generation while playing

let grid // grid[row][col]: 1 alive, 0 dead
let generation
let playing
let frames

const emptyGrid = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0))

function randomize() {
  grid = grid.map((row) => row.map(() => (Math.random() < 0.25 ? 1 : 0)))
  generation = 0
}

function reset() {
  grid = emptyGrid()
  randomize()
  playing = false
  frames = 0
}

// Live neighbours among the 8 around (r, c). The edges wrap around, so the world has no border.
function countNeighbors(r, c) {
  let count = 0
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      count += grid[(r + dr + ROWS) % ROWS][(c + dc + COLS) % COLS]
    }
  }
  return count
}

// Every cell changes at the same moment, so the next generation is built in a new grid.
function step() {
  const next = emptyGrid()
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const n = countNeighbors(r, c)
      // A live cell survives with 2 or 3 neighbours; a dead cell comes alive with exactly 3.
      next[r][c] = n === 3 || (n === 2 && grid[r][c] === 1) ? 1 : 0
    }
  }
  grid = next
  generation += 1
}

const population = () => grid.reduce((sum, row) => sum + row.reduce((a, b) => a + b, 0), 0)

function press(button) {
  if (button === 'Play') playing = !playing
  else if (button === 'Step') {
    playing = false
    step()
  }
}

document.addEventListener('keydown', (event) => {
  const keys = { ' ': 'Play', n: 'Step' }
  const button = keys[event.key.toLowerCase()]
  if (!button) return
  event.preventDefault()
  press(button)
})

function update() {
  frames += 1
  if (playing && frames % SPEED === 0) step()
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(0, TOP, COLS * CELL, ROWS * CELL)

  ctx.fillStyle = '#4ade80'
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c]) ctx.fillRect(c * CELL, TOP + r * CELL, CELL - 1, CELL - 1)
    }
  }

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Generation ' + generation, 8, 24)
  ctx.textAlign = 'right'
  ctx.fillText('Alive ' + population(), canvas.width - 8, 24)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
