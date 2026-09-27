---
title: Winning against the clock
title_tr: Saate karşı kazanmak
skills: [game.state, game.loop]
---

# --explanation--

You win Minesweeper when every cell **without** a mine is open. Flags do not count: a player who opened everything but
never placed a single flag has still won. So the check is one line over the grid:

```js
grid.flat().every((cell) => cell.mine || cell.revealed)
```

Run it after every successful reveal. On a win, flag the remaining mines automatically; it is a nice touch that shows
the solved board.

A game this short is about speed, so add a **timer**. It starts at the first click (not when the page loads, which would
punish reading the board) and stops when the game ends. Store the start and end times; the number on screen is
**derived** from them while drawing. The best (lowest) time is saved in `localStorage`. Two traps hide here. "Best"
means *smaller*, so the comparison is `<`. And "no best yet" must not be `0`: a lightning-fast win really does take 0
whole seconds, and it would then look like "no record" and be overwritten by a slower one. Use `null` for "nothing",
and check for it explicitly (`localStorage.getItem` returns `null` when the key was never saved).

Finally, a click after the game ends starts a new one, reusing `newGame()`.

# --explanation-tr--

Mayın Tarlası'nı mayın **olmayan** her hücre açıldığında kazanırsın. Bayraklar sayılmaz: her şeyi açıp tek bir bayrak
bile koymamış bir oyuncu yine de kazanmıştır. Bu yüzden kontrol ızgara üzerinde tek bir satırdır:

```js
grid.flat().every((cell) => cell.mine || cell.revealed)
```

Onu her başarılı açıştan sonra çalıştır. Kazanınca kalan mayınları otomatik olarak bayrakla; çözülmüş tahtayı gösteren
hoş bir dokunuş.

Bu kadar kısa bir oyun hızla ilgilidir; bir **zamanlayıcı** ekle. İlk tıklamada başlar (sayfa yüklenince değil; o,
tahtayı okumayı cezalandırırdı) ve oyun bitince durur. Başlangıç ve bitiş zamanlarını sakla; ekrandaki sayı çizerken
onlardan **türetilir**. En iyi (en düşük) süre `localStorage`'a kaydedilir. Burada iki tuzak saklı. "En iyi" *daha
küçük* demek, bu yüzden karşılaştırma `<`. Ve "henüz rekor yok" `0` olmamalı: yıldırım hızında bir galibiyet gerçekten
0 tam saniye sürer ve o zaman "rekor yok" gibi görünüp daha yavaş bir oyunun altında ezilir. "Hiçbir şey" için `null`
kullan ve onu açıkça kontrol et (`localStorage.getItem`, anahtar hiç kaydedilmediyse `null` döndürür).

Son olarak, oyun bittikten sonraki bir tıklama `newGame()`'i yeniden kullanarak yenisini başlatır.

# --task--

1. Add `let startTime`, `let endTime` and `let now = 0` (set from the loop's `time`), and load `best` from
   `localStorage.getItem('mines-best')`: `null` if nothing was saved, otherwise the number. Set the start time on the
   first reveal.
2. After a reveal opens cells, if every non-mine cell is open, call `win()`: set `state = 'won'`, stop the clock, flag
   every mine, and save the seconds as the new best if `best` is `null` or they are fewer.
3. `lose()` also stops the clock. A click when won or lost starts a `newGame()`.
4. Draw `⏱ 12` (seconds) right-aligned at the top. When won, show `You win! Best: 12s` in green; when lost,
   `Boom! Click to retry` in red.

# --task-tr--

1. `let startTime`, `let endTime` ve `let now = 0` (döngünün `time`'ından ayarlanır) ekle; `best`'i
   `localStorage.getItem('mines-best')`'ten yükle: hiçbir şey kaydedilmediyse `null`, değilse sayı. Başlangıç zamanını
   ilk açışta ayarla.
2. Bir açış hücreleri açtıktan sonra mayınsız her hücre açıksa `win()` çağır: `state = 'won'` yap, saati durdur, her
   mayını bayrakla ve `best` `null` ise ya da daha azsa saniyeleri yeni rekor olarak kaydet.
3. `lose()` da saati durdursun. Kazanılmış ya da kaybedilmiş oyunda bir tıklama `newGame()` başlatsın.
4. Tepede sağa hizalı `⏱ 12` (saniye) çiz. Kazanınca yeşil `You win! Best: 12s`, kaybedince kırmızı
   `Boom! Click to retry` göster.

# --tests--

Opening every safe cell should win, even without flags.
tr: Her güvenli hücreyi açmak, bayraksız bile kazandırmalı.

```js
reveal(grid[4][4])
for (const cell of grid.flat()) if (!cell.mine) reveal(cell)
assert.strictEqual(state, 'won')
assert.isTrue(grid.flat().filter((c) => c.mine).every((c) => c.flagged))
```

The clock should start at the first click and stop at the end.
tr: Saat ilk tıklamada başlamalı ve sonda durmalı.

```js
$.run(3)
$.tick()
assert.include($.texts(), '⏱ 0', 'no ticking before the first click')
$.click(4 * 40 + 20, 40 + 4 * 40 + 20)
$.run(5.2)
assert.include($.texts(), '⏱ 5')
for (const cell of grid.flat()) if (!cell.mine) reveal(cell)
$.run(3)
assert.include($.texts(), '⏱ 5', 'stopped when the game was won')
assert.strictEqual(best, 5)
assert.strictEqual(localStorage.getItem('mines-best'), '5')
```

A win in under a second is a real best of 0, not "no best".
tr: Bir saniyeden kısa bir galibiyet "rekor yok" değil, gerçek bir 0 rekorudur.

```js
$.click(4 * 40 + 20, 40 + 4 * 40 + 20)
for (const cell of grid.flat()) if (!cell.mine) reveal(cell)
assert.strictEqual(best, 0)
$.click(20, 60)
$.click(4 * 40 + 20, 40 + 4 * 40 + 20)
$.run(4)
for (const cell of grid.flat()) if (!cell.mine) reveal(cell)
assert.strictEqual(best, 0, 'a slower win must not replace a best of 0')
```

A slower win should not replace a faster best.
tr: Daha yavaş bir galibiyet daha hızlı rekorun yerini almamalı.

```js
best = 3
$.click(4 * 40 + 20, 40 + 4 * 40 + 20)
$.run(10)
for (const cell of grid.flat()) if (!cell.mine) reveal(cell)
assert.strictEqual(best, 3)
```

A click after the game ends should start a new one.
tr: Oyun bittikten sonraki bir tıklama yenisini başlatmalı.

```js
reveal(grid[4][4])
reveal(grid.flat().find((c) => c.mine))
assert.strictEqual(state, 'lost')
$.click(20, 60)
assert.strictEqual(state, 'ready')
assert.isTrue(grid.flat().every((c) => !c.revealed && !c.mine))
```

# --solution--

```js
// Minesweeper, step by step.
// The page already has <canvas id="game" width="360" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SIZE = 9
const CELL = 40
const TOP = 40 // room for the mine counter and the timer
const MINES = 10
const NUMBER_COLORS = [null, '#2563eb', '#16a34a', '#dc2626', '#7c3aed', '#b45309', '#0891b2', '#111827', '#6b7280']

let grid
let state // 'ready' (before the first click), 'playing', 'won' or 'lost'
let startTime
let endTime
let now = 0
// null means "no best time yet"; 0 would be a real (very fast) time.
const saved = localStorage.getItem('mines-best')
let best = saved === null ? null : Number(saved)

function newGame() {
  grid = Array.from({ length: SIZE }, (_, row) =>
    Array.from({ length: SIZE }, (_, col) => ({ row, col, mine: false, count: 0, revealed: false, flagged: false })),
  )
  state = 'ready'
  startTime = 0
  endTime = 0
}

// The up to 8 cells around a cell, skipping the ones that would be off the board.
function neighbors(cell) {
  const list = []
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      const row = cell.row + dr
      const col = cell.col + dc
      if (row >= 0 && row < SIZE && col >= 0 && col < SIZE) list.push(grid[row][col])
    }
  }
  return list
}

// Mines are placed on the first click, never on or next to the clicked cell, so the first click always opens space.
function placeMines(safe) {
  const forbidden = new Set([safe, ...neighbors(safe)])
  const candidates = grid.flat().filter((cell) => !forbidden.has(cell))
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[candidates[i], candidates[j]] = [candidates[j], candidates[i]]
  }
  for (const cell of candidates.slice(0, MINES)) cell.mine = true
  for (const cell of grid.flat()) cell.count = neighbors(cell).filter((n) => n.mine).length
}

function reveal(start) {
  if (start.revealed || start.flagged) return
  if (state === 'ready') {
    placeMines(start)
    state = 'playing'
    startTime = now
  }
  if (start.mine) {
    lose()
    return
  }
  // Flood fill with our own stack: open the cell, and keep opening around every empty (0) cell.
  const stack = [start]
  while (stack.length > 0) {
    const cell = stack.pop()
    if (cell.revealed || cell.flagged) continue
    cell.revealed = true
    if (cell.count === 0) {
      for (const next of neighbors(cell)) {
        if (!next.revealed && !next.mine) stack.push(next)
      }
    }
  }
  if (grid.flat().every((cell) => cell.mine || cell.revealed)) win()
}

function toggleFlag(cell) {
  if (cell.revealed || state === 'won' || state === 'lost') return
  cell.flagged = !cell.flagged
}

function lose() {
  state = 'lost'
  endTime = now
  for (const cell of grid.flat()) if (cell.mine) cell.revealed = true
}

function win() {
  state = 'won'
  endTime = now
  for (const cell of grid.flat()) if (cell.mine) cell.flagged = true
  const seconds = Math.floor((endTime - startTime) / 1000)
  if (best === null || seconds < best) {
    best = seconds
    localStorage.setItem('mines-best', best)
  }
}

function cellAt(event) {
  // The canvas may be displayed at a different size than its own pixels, so scale the pointer.
  const rect = canvas.getBoundingClientRect()
  const x = (event.clientX - rect.left) * (canvas.width / rect.width)
  const y = (event.clientY - rect.top) * (canvas.height / rect.height)
  const col = Math.floor(x / CELL)
  const row = Math.floor((y - TOP) / CELL)
  if (row < 0 || row >= SIZE || col < 0 || col >= SIZE) return undefined
  return grid[row][col]
}

canvas.addEventListener('click', (event) => {
  if (state === 'won' || state === 'lost') {
    newGame()
    return
  }
  const cell = cellAt(event)
  if (cell) reveal(cell)
})

canvas.addEventListener('contextmenu', (event) => {
  event.preventDefault() // no browser menu: right click places a flag
  const cell = cellAt(event)
  if (cell) toggleFlag(cell)
})

function draw() {
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.font = 'bold 22px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (const cell of grid.flat()) {
    const x = cell.col * CELL
    const y = TOP + cell.row * CELL
    if (cell.revealed) {
      ctx.fillStyle = cell.mine ? '#fca5a5' : '#e2e8f0'
      ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2)
      if (cell.mine) ctx.fillText('💣', x + CELL / 2, y + CELL / 2 + 1)
      else if (cell.count > 0) {
        ctx.fillStyle = NUMBER_COLORS[cell.count]
        ctx.fillText(String(cell.count), x + CELL / 2, y + CELL / 2 + 1)
      }
    } else {
      ctx.fillStyle = '#94a3b8'
      ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2)
      if (cell.flagged) ctx.fillText('🚩', x + CELL / 2, y + CELL / 2 + 1)
    }
  }

  const flags = grid.flat().filter((cell) => cell.flagged).length
  const seconds = state === 'ready' ? 0 : Math.floor(((state === 'playing' ? now : endTime) - startTime) / 1000)
  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px monospace'
  ctx.textAlign = 'left'
  ctx.fillText('💣 ' + (MINES - flags), 10, TOP / 2)
  ctx.textAlign = 'right'
  ctx.fillText('⏱ ' + seconds, canvas.width - 10, TOP / 2)

  if (state === 'won' || state === 'lost') {
    ctx.textAlign = 'center'
    ctx.fillStyle = state === 'won' ? '#4ade80' : '#f87171'
    ctx.fillText(state === 'won' ? 'You win! Best: ' + best + 's' : 'Boom! Click to retry', canvas.width / 2, TOP / 2)
  }
}

function loop(time) {
  now = time
  draw()
  requestAnimationFrame(loop)
}

newGame()
requestAnimationFrame(loop)
```
