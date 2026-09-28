---
title: Opening a cell
title_tr: Bir hücreyi açmak
skills: [game.input, game.state]
---

# --explanation--

A click opens the cell under the pointer. Finding it is a direct calculation: scale the click
into canvas pixels, then `Math.floor(x / CELL)` for the column and `Math.floor((y - TOP) / CELL)` for the row. Clicks
on the top strip or outside the board give `undefined`.

`reveal(cell)` is where the rules live:

- the **first** reveal places the mines around that cell and starts the game (`'ready'` → `'playing'`);
- a mine loses the game: every mine is shown, and no more cells can be opened;
- anything else is opened and shows its number, or nothing if it is `0`.

Colored numbers are part of the design, not decoration: each count has its own color (1 blue, 2 green, 3 red...), so
experienced players read the board at a glance without reading the digits. A lookup list, `NUMBER_COLORS[count]`, keeps
that one line of code.

# --explanation-tr--

**Bu adımda:** hücrelere tıklayınca açılmalarını sağlayacağız. İlk tıklamada mayınlar yerleşir; açılan hücre açık
griye döner ve çevresinde mayın varsa renkli bir sayı gösterir. Mayına tıklarsan bütün mayınlar 💣 olarak görünür ve
üstte **Boom!** yazar.

**Oyunun durumu.** `let state` oyunun hangi aşamada olduğunu bir yazıyla tutar: `'ready'` (henüz ilk tıklama
yapılmadı), `'playing'` (oynanıyor), `'lost'` (kaybedildi). `newGame()` her yeni oyunda onu `'ready'` yapar.

**Tıklamayı dinlemek (olay, event).** Tarayıcı fare tıklaması gibi olayları haber verebilir:

```js
canvas.addEventListener('click', (event) => {
  ...
})
```

"Canvas'a tıklandığında bu fonksiyonu çalıştır" demektir. Fonksiyon hemen çalışmaz; her tıklamada tarayıcı onu
çağırır ve tıklamanın bilgilerini `event` adıyla verir. `event.clientX` ve `event.clientY` farenin ekrandaki yeridir.

**Tıklanan hücreyi bulmak: `cellAt(event)`.**

- `canvas.getBoundingClientRect()` canvas'ın ekranda nerede ve hangi boyutta durduğunu verir (`left`, `top`, `width`,
  `height`). Canvas ekranda küçültülmüş ya da büyütülmüş olabilir; o yüzden fare konumundan canvas'ın sol üst
  köşesini çıkarıp `canvas.width / rect.width` oranıyla çarparak **canvas pikseline** çeviririz.
- `Math.floor(x / CELL)` → x'i 40'a bölüp aşağı yuvarlarsak sütun numarasını buluruz (ör. 130 / 40 = 3,25 → 3).
  Satır için önce üst şeridin 40 pikselini çıkarırız: `Math.floor((y - TOP) / CELL)`.
- `||` "veya" demektir. Satır ya da sütun tahtanın dışındaysa `return undefined` ile "hücre yok" cevabı döner.
  `return` fonksiyonu **o anda bitirir**; alttaki satırlar çalışmaz.

Tıklama fonksiyonunda `if (cell) reveal(cell)` "bir hücre bulunduysa aç" demektir; `undefined` "yok" sayılır.

**Kurallar: `reveal(start)`.**

- Hücre zaten açıksa `return` ile hiçbir şey yapmadan çıkar.
- Durum `'ready'` ise bu **ilk tıklamadır**: mayınları bu hücrenin çevresi hariç yerleştir, durumu `'playing'` yap.
- Hücre mayınsa `lose()` çağrılır: durum `'lost'` olur ve bütün mayınlı hücreler açılır.
- Değilse hücre açılır: `start.revealed = true`.

**Çizim.** Artık her hücre için karar veririz: açık mı, kapalı mı? `if (...) { ... } else { ... }` "doğruysa
birinciyi, değilse ikinciyi yap" demektir. `else if` ikinci bir koşul ekler.

- `cell.mine ? '#fca5a5' : '#e2e8f0'` → **kısa if** (üçlü işleç): "mayınsa kırmızımsı, değilse açık gri".
- `ctx.fillText(yazı, x, y)` canvas'a yazı yazar. `ctx.font` yazı tipini ve boyunu, `ctx.textAlign = 'center'` ve
  `ctx.textBaseline = 'middle'` yazının verilen noktaya **ortalanmasını** sağlar. Hücrenin ortası
  `x + CELL / 2` (`/` bölme).
- `String(cell.count)` sayıyı yazıya çevirir (`3` → `'3'`), çünkü `fillText` yazı ister.

**Renkli sayılar.** Her sayının kendi rengi vardır (1 mavi, 2 yeşil, 3 kırmızı...); deneyimli oyuncular tahtayı
rakamları okumadan renginden tanır. `NUMBER_COLORS` bir renk listesidir; `NUMBER_COLORS[3]` 3'ün rengidir. Sayı 0
olamayacağı için (0'da yazı yazmayız) ilk eleman `null`, yani "boş"tur.

# --task--

1. Add
   `NUMBER_COLORS = [null, '#2563eb', '#16a34a', '#dc2626', '#7c3aed', '#b45309', '#0891b2', '#111827', '#6b7280']`
   and `let state` (`'ready'` in `newGame()`).
2. Write `cellAt(event)` returning the cell under a click (scaled to canvas pixels), or `undefined`.
3. Write `reveal(start)`: skip already revealed cells; on the first reveal, `placeMines(start)` and switch to
   `'playing'`; if it is a mine, call `lose()` (`state = 'lost'` and reveal every mine); otherwise mark it revealed.
4. On `click`, reveal the cell under the pointer unless the game is lost.
5. Draw revealed cells in `'#e2e8f0'` (mines in `'#fca5a5'` with a `💣`), with their count in
   `NUMBER_COLORS[count]` when it is above 0, and `Boom!` at the top when lost.

# --task-tr--

1. `const MINES = 10` satırının altına renk listesini ekle:

   ```js
   const NUMBER_COLORS = [null, '#2563eb', '#16a34a', '#dc2626', '#7c3aed', '#b45309', '#0891b2', '#111827', '#6b7280']
   ```

2. `let grid` satırının altına durumu tutacak değişkeni ekle:

   ```js
   let state // 'ready' (before the first click), 'playing' or 'lost'
   ```

3. `newGame()` fonksiyonunun içinde, kapanış `}`'sinden önce durumu sıfırlayan satırı ekle:

   ```js
   function newGame() {
     grid = Array.from({ length: SIZE }, (_, row) =>
       Array.from({ length: SIZE }, (_, col) => ({ row, col, mine: false, count: 0, revealed: false })),
     )
     state = 'ready' // ← yeni
   }
   ```

4. `placeMines` fonksiyonunun kapanış `}`'sinin altına, `function draw()` satırından önce şu dört parçayı sırayla yaz:

   ```js
   function reveal(start) {
     if (start.revealed) return
     if (state === 'ready') {
       placeMines(start)
       state = 'playing'
     }
     if (start.mine) {
       lose()
       return
     }
     start.revealed = true
   }

   function lose() {
     state = 'lost'
     for (const cell of grid.flat()) if (cell.mine) cell.revealed = true
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
     if (state === 'lost') return
     const cell = cellAt(event)
     if (cell) reveal(cell)
   })
   ```

5. `draw()` fonksiyonunun tamamını sil ve yerine bunu yaz (canvas'ı boyayan ilk iki satır aynı kaldı):

   ```js
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
       }
     }

     ctx.font = 'bold 18px monospace'

     if (state === 'lost') {
       ctx.textAlign = 'center'
       ctx.fillStyle = '#f87171'
       ctx.fillText('Boom!', canvas.width / 2, TOP / 2)
     }
   }
   ```

   `💣` bir emojidir; kopyalayıp yapıştırabilirsin.

6. **Çalıştır**'a bas ve bir hücreye tıkla. Hücre açılmalı, bazı hücrelerde renkli sayılar görünmeli. Alttaki
   kontrollerin hepsi yeşil olmalı. Tıklama hiçbir şey yapmıyorsa `addEventListener` satırındaki `'click'` yazısını
   kontrol et.

# --tests--

A click should open the cell under it, and the first click places the mines.
tr: Bir tıklama altındaki hücreyi açmalı; ilk tıklama da mayınları yerleştirmeli.

```js
assert.strictEqual(state, 'ready')
$.click(4 * 40 + 20, 40 + 4 * 40 + 20)
assert.isTrue(grid[4][4].revealed)
assert.strictEqual(state, 'playing')
assert.strictEqual(grid.flat().filter((c) => c.mine).length, 10)
assert.isUndefined(cellAt({ clientX: 100, clientY: 10 }), 'the top strip is not a cell')
```

Opening a mine should lose the game and show every mine.
tr: Bir mayını açmak oyunu kaybettirmeli ve her mayını göstermeli.

```js
reveal(grid[0][0])
const mine = grid.flat().find((c) => c.mine)
reveal(mine)
assert.strictEqual(state, 'lost')
assert.isTrue(grid.flat().filter((c) => c.mine).every((c) => c.revealed))
const hidden = grid.flat().find((c) => !c.revealed)
$.click(hidden.col * 40 + 20, 40 + hidden.row * 40 + 20)
assert.isFalse(hidden.revealed, 'no more opening after losing')
$.tick()
assert.include($.texts(), 'Boom!')
```

Numbers should be drawn in their color.
tr: Sayılar kendi renklerinde çizilmeli.

```js
reveal(grid[0][0])
const numbered = grid.flat().find((c) => !c.mine && c.count > 0)
reveal(numbered)
$.tick()
const text = $.screen().find((c) => c.op === 'fillText' && c.args[0] === String(numbered.count) && c.args[1] === numbered.col * 40 + 20)
assert.strictEqual(text.fill, NUMBER_COLORS[numbered.count])
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
let state // 'ready' (before the first click), 'playing' or 'lost'

function newGame() {
  grid = Array.from({ length: SIZE }, (_, row) =>
    Array.from({ length: SIZE }, (_, col) => ({ row, col, mine: false, count: 0, revealed: false })),
  )
  state = 'ready'
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
  if (start.revealed) return
  if (state === 'ready') {
    placeMines(start)
    state = 'playing'
  }
  if (start.mine) {
    lose()
    return
  }
  start.revealed = true
}

function lose() {
  state = 'lost'
  for (const cell of grid.flat()) if (cell.mine) cell.revealed = true
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
  if (state === 'lost') return
  const cell = cellAt(event)
  if (cell) reveal(cell)
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
    }
  }

  ctx.font = 'bold 18px monospace'

  if (state === 'lost') {
    ctx.textAlign = 'center'
    ctx.fillStyle = '#f87171'
    ctx.fillText('Boom!', canvas.width / 2, TOP / 2)
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

newGame()
requestAnimationFrame(loop)
```
