---
title: Play and pause
title_tr: Oynat ve duraklat
skills: [game.loop, game.input]
---

# --explanation--

Pressing N for every generation gets tiring. Now the world should run by itself, and **Space** starts and stops it.

At 60 frames per second one generation per frame is too fast to follow, so we count frames and step only on every
`SPEED`th one:

```js
frames += 1
if (playing && frames % SPEED === 0) step()
```

`frames % SPEED === 0` is true on frames 6, 12, 18 and so on: with `SPEED = 6`, that is 10 generations per second. A bigger
`SPEED` means a slower world.

Keys now go through one function, `press(button)`, with a small table from keys to actions. That will pay off in the last
step, when on-screen buttons call the same `press`. N still steps once, and it also pauses: if you want to look at a single
generation, the world should stop.

# --explanation-tr--

**Bu adımda:** dünya kendi kendine yaşayacak. **Boşluk** (Space) tuşuyla başlatıp durduracaksın; **N** ise durdurup
tek bir nesil ilerletecek. Sağda desenlerin kendiliğinden hareket ettiğini göreceksin.

**Doğru / yanlış değerleri.** `playing` değişkeni dünyanın çalışıp çalışmadığını tutar. İçinde ya `true` (doğru) ya da
`false` (yanlış) olur; bir ışık düğmesi gibi. `!` işareti "tersi" demektir: `playing = !playing` açıksa kapatır,
kapalıysa açar.

**Yavaşlatmak.** `loop` saniyede yaklaşık 60 kez çalışır. Her seferinde bir nesil ilerlesek gözle izlenemez. Bu yüzden
kareleri (frame) sayarız ve yalnızca her `SPEED`'inci karede ilerleriz:

```js
frames += 1
if (playing && frames % SPEED === 0) step()
```

`frames % SPEED === 0` (3. adımdaki kalan işareti) `frames` 6, 12, 18... olduğunda doğrudur. `SPEED = 6` ile saniyede
10 nesil olur. `SPEED` büyüdükçe dünya yavaşlar. Bu sayma işini `update()` adlı bir fonksiyona koyar ve `loop` içinde
`draw()`'dan hemen önce çağırırız: önce dünyayı güncelle, sonra çiz.

**Tek bir karar yeri: `press(button)`.** Tuşları doğrudan işlere bağlamak yerine, her tuş bir düğme adına (`'Play'`,
`'Step'`) çevrilir ve hepsi `press`'e gider. Son adımda ekrana düğmeler koyacağız; onlar da aynı `press`'i çağıracak.

```js
if (button === 'Play') playing = !playing
else if (button === 'Step') { ... }
```

`if ... else if ...` → "şuysa bunu yap, **değilse** ve şuysa şunu yap".

**Küçük bir tablo: nesne (object).** `{ ' ': 'Play', n: 'Step' }` bir **nesnedir**: anahtar–değer çiftlerinden
oluşan küçük bir sözlük. `keys['n']` → `'Step'`, `keys[' ']` → `'Play'` (`' '` boşluk tuşunun adıdır). Tabloda olmayan
bir tuş sorulursa sonuç `undefined` (yok) olur.

- `if (!button) return` → "düğme yoksa (bizi ilgilendirmeyen bir tuşsa) burada dur". `return` fonksiyondan hemen çıkar.
- `event.preventDefault()` → tarayıcının o tuşla kendi yaptığı işi engeller. Örneğin boşluk tuşu normalde sayfayı aşağı
  kaydırır; bunu istemeyiz.

N neden durduruyor? Tek bir nesle bakmak istiyorsan dünyanın durması gerekir.

# --task--

1. Add `SPEED = 6`, and `playing` and `frames` (`false` and `0` in `reset()`).
2. Write `update()`, called before `draw()`: count `frames` up, and `step()` when `playing` and `frames % SPEED === 0`.
3. Write `press(button)`: `'Play'` flips `playing`; `'Step'` sets `playing = false` and calls `step()`.
4. On `keydown`, map `' '` to `'Play'` and `n` to `'Step'` (use `event.key.toLowerCase()`); for those keys call
   `preventDefault()` and `press`.

# --task-tr--

1. `const TOP = 36` satırının altına hız sabitini ekle:

   ```js
   const SPEED = 6 // frames per generation while playing
   ```

2. `let generation` satırının altına iki değişken daha ekle:

   ```js
   let playing
   let frames
   ```

3. `reset()` fonksiyonunda ikisine başlangıç değeri ver:

   ```js
   function reset() {
     grid = emptyGrid()
     randomize()
     playing = false // ← yeni
     frames = 0      // ← yeni
   }
   ```

4. Eski N tuşu kodunu (`document.addEventListener('keydown', ...` ile başlayıp `})` ile biten üç satır) sil. Yerine,
   `const population = ...` satırının altına şunları yaz:

   ```js
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
   ```

5. En alttaki `loop()` fonksiyonunda `draw()`'dan önce `update()`'i çağır:

   ```js
   function loop() {
     update() // ← yeni
     draw()
     requestAnimationFrame(loop)
   }
   ```

6. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla, sonra **Boşluk**'a bas: desenler kendiliğinden değişmeli. Tekrar
   bastığında durmalı; **N** bir nesil ilerletip durdurmalı. Alttaki kontrollerin hepsi yeşil olmalı.

# --tests--

Space should start the world at one generation every `SPEED` frames, and stop it again.
tr: Boşluk dünyayı her `SPEED` karede bir nesille başlatmalı ve yeniden durdurmalı.

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
$.press('n')
assert.isFalse(playing, 'stepping pauses')
assert.strictEqual(generation, 3)
$.tick(1)
assert.include($.texts(), 'Generation 3')
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
