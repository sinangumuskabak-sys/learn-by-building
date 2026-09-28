---
title: Swipes and a best score
title_tr: Kaydırmalar ve rekor
skills: [game.input]
---

# --explanation--

2048 is at its best on a phone, played with swipes. A swipe is not a built-in event; you build it from two events you
already know:

1. `pointerdown`: remember where the finger (or mouse) went down.
2. `pointerup`: measure how far it moved, `dx` and `dy`.

Then decide what it meant:

- If it barely moved (less than 30 pixels either way), it was a **tap**, not a swipe. Use taps to continue after a
  win or start again after a game over, the same as Space.
- Otherwise the **bigger** of `|dx|` and `|dy|` wins: mostly sideways is left or right, mostly vertical is up or
  down. The sign gives the direction.

Here page pixels are fine as they are, with no scaling to canvas pixels: a swipe is about how far the finger travelled
on the screen, not about a spot in the game.

Recognizing gestures from raw pointer events is the same idea behind pinch-to-zoom, drag-and-drop and every other touch
interaction.

Finally, keep the best score in `localStorage`, like in the other games.

# --explanation-tr--

**Bu adımda:** telefonda parmakla kaydırarak (swipe) oynamayı ve en iyi skoru (`Best`) ekleyeceğiz. Bilgisayarda fareyle
basılı tutup sürükleyerek de deneyebilirsin. Sağ üstte `Best: ...` yazacak ve sayfayı kapatıp açsan bile hatırlanacak.

**Kaydırma hazır bir olay değil.** Tarayıcıda "kaydırıldı" diye bir olay yok; onu zaten bildiğin gibi iki olaydan
kurarız:

1. `pointerdown`: parmağın (ya da farenin) ekrana **değdiği** yeri hatırla.
2. `pointerup`: parmak **kalkınca** ne kadar yol aldığını ölç: yatayda `dx`, dikeyde `dy`.

`event.clientX` ve `event.clientY` dokunuşun ekrandaki konumudur. `dx = bitiş x - başlangıç x`: pozitifse sağa, negatifse
sola gitmiştir. `dy` pozitifse aşağı, negatifse yukarı.

**Ne demek istedi?**

- Parmak neredeyse hiç gitmediyse (iki yönde de 30 pikselden az) bu bir **dokunuştur**, kaydırma değil. Dokunuş
  Boşluk tuşu gibi çalışır: kazandıktan sonra devam ettirir, oyun bitince yeniden başlatır.
- Değilse `|dx|` ile `|dy|`'den **büyük olan** kazanır: çoğunlukla yataysa sol ya da sağ, çoğunlukla dikeyse yukarı ya
  da aşağı. İşaret (artı/eksi) yönü verir.

`Math.abs(sayı)` sayının eksisiz hâlidir (`-120` → `120`); yol uzunluğunu yönden bağımsız ölçer. `Math.max(a, b)`
ikisinden büyüğünü verir. `dx > 0 ? 'right' : 'left'` → `dx` pozitifse sağ, değilse sol.

`swipeStart` başta `null`'dır: **"hiçbir şey"** demek. Parmak kalkınca başlangıç yoksa (`!swipeStart`) hiçbir şey
yapmayız; ölçtükten sonra da yeniden `null` yaparız ki eski dokunuş bir daha kullanılmasın.

Burada sayfa pikselleri olduğu gibi kullanılır, canvas piksellerine çevrilmez: kaydırmada önemli olan parmağın ekranda
ne kadar yol aldığıdır, oyunda hangi noktaya dokunduğu değil. Ham dokunma olaylarından hareket tanımak; iki parmakla
yakınlaştırma, sürükle-bırak gibi bütün dokunmatik etkileşimlerin temelindeki fikirdir.

**Aynı iş için tek fonksiyon: `next()`.** Boşluk, Enter ve dokunuş aynı şeyi yapmalı. Bu kodu iki yere kopyalamak yerine
`next()` adlı bir fonksiyona taşıyıp iki yerden çağırırız.

**Rekor: `localStorage`.** Tarayıcının küçük bir defteri vardır; sayfa kapansa bile içindekiler kalır.
`localStorage.setItem('2048-best', best)` "bu ada bu değeri yaz", `localStorage.getItem('2048-best')` "oku" demektir.
Defter her şeyi yazı olarak saklar; `Number(...)` sayıya çevirir. Hiç kayıt yoksa sonuç sayı olmaz, `|| 0` "o zaman 0
kullan" demektir. Her başarılı hamleden sonra skor rekoru geçtiyse (`score > best`) yeni rekoru kaydederiz.
`textAlign = 'right'` ile yazı verilen noktada **biter**; böylece `Best` sağ kenara yaslanır.

# --task--

1. Move the Space/Enter logic into `function next()` (new game when over, keep playing when won) and call it from the
   key handler.
2. Remember `{ x: event.clientX, y: event.clientY }` on `pointerdown` on the canvas. On `pointerup`, compute `dx` and
   `dy`: under 30 pixels both ways, call `next()`; otherwise move in the direction of the bigger one. Then `draw()`.
3. Add `let best = Number(localStorage.getItem('2048-best')) || 0`; after each successful move, save a higher score as
   the new best. Draw `Best: 40` right-aligned at `(canvas.width - GAP, TOP / 2)`.

# --task-tr--

1. `let keepPlaying ...` satırının hemen altına rekoru hafızadan okuyan satırı ekle:

   ```js
   let best = Number(localStorage.getItem('2048-best')) || 0
   ```

2. `move()` fonksiyonunda `addTile()` satırının hemen altına rekoru kaydeden kısmı ekle:

   ```js
     addTile()
     if (score > best) { // ← yeni
       best = score // ← yeni
       localStorage.setItem('2048-best', best) // ← yeni
     } // ← yeni
     if (!keepPlaying && board.some((row) => row.includes(2048))) state = 'won'
   ```

3. `const directions = ...` satırının altındaki klavye dinleyicisini şu iki parçayla değiştir: önce `next()` fonksiyonu,
   sonra kısalan dinleyici:

   ```js
   // Boşluk, Enter ya da dokunuş: oyun bittiyse yeniden başla, kazandıysan devam et.
   function next() {
     if (state === 'over') newGame()
     else if (state === 'won') {
       state = 'playing'
       keepPlaying = true
     }
   }

   document.addEventListener('keydown', (event) => {
     if (event.key === ' ' || event.key === 'Enter') next() // ← değişti
     const direction = directions[event.key]
     if (direction) {
       event.preventDefault()
       move(direction)
     }
     draw()
   })
   ```

4. Dinleyicinin kapanış `})` satırının altına bir satır boşluk bırakıp kaydırmayı tanıyan kodu yaz:

   ```js
   // Kaydırma: parmağın kalktığı yerin, değdiği yere göre konumu.
   let swipeStart = null
   canvas.addEventListener('pointerdown', (event) => {
     swipeStart = { x: event.clientX, y: event.clientY }
   })
   canvas.addEventListener('pointerup', (event) => {
     if (!swipeStart) return
     const dx = event.clientX - swipeStart.x
     const dy = event.clientY - swipeStart.y
     swipeStart = null
     if (Math.max(Math.abs(dx), Math.abs(dy)) < 30) next() // kaydırma için çok kısa: dokunuş
     else if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 'right' : 'left')
     else move(dy > 0 ? 'down' : 'up')
     draw()
   })
   ```

5. `draw()` fonksiyonunda skoru yazan `ctx.fillText('Score: ' ...)` satırının hemen altına rekoru yazan iki satırı ekle:

   ```js
     ctx.fillText('Score: ' + score, GAP, TOP / 2)
     ctx.textAlign = 'right' // ← yeni
     ctx.fillText('Best: ' + best, canvas.width - GAP, TOP / 2) // ← yeni
   ```

6. Yine `draw()`'da, bitiş örtüsündeki ikinci `ctx.fillText` satırının yazılarını dokunuşu da anlatacak şekilde değiştir:

   ```js
       ctx.fillText(state === 'won' ? 'Space or tap to keep going' : 'Space or tap to try again', canvas.width / 2, TOP + 220) // ← değişti
   ```

7. **Çalıştır**'a bas. Tahtanın üstünde fareyle basılı tutup sürükle (telefonda parmağınla kaydır): karolar o yöne
   kaymalı. Sağ üstte `Best:` görünmeli ve skor onu geçince birlikte artmalı. Alttaki kontrollerin hepsi yeşil olmalı.
   Kırmızı kalırsa `'2048-best'` adının iki yerde de aynı yazıldığına ve `dx`/`dy` satırlarında çıkarmanın sırasına
   (bitiş eksi başlangıç) bak.

# --tests--

A mostly horizontal swipe should move left or right.
tr: Çoğunlukla yatay bir kaydırma sola ya da sağa hareket ettirmeli.

```js
board = [[2, 2, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
$.pointerDown(100, 200)
$.pointerUp(220, 230)
assert.strictEqual(board[0][3], 4)
```

A mostly vertical swipe should move up or down.
tr: Çoğunlukla dikey bir kaydırma yukarı ya da aşağı hareket ettirmeli.

```js
board = [[0, 0, 0, 0], [0, 0, 0, 0], [2, 0, 0, 0], [2, 0, 0, 0]]
$.pointerDown(200, 400)
$.pointerUp(190, 250)
assert.strictEqual(board[0][0], 4)
```

A short tap should not move the board, but should continue after a win.
tr: Kısa bir dokunuş tahtayı hareket ettirmemeli ama kazandıktan sonra devam ettirmeli.

```js
board = [[2, 2, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
$.pointerDown(100, 200)
$.pointerUp(110, 205)
assert.deepEqual(board[0], [2, 2, 0, 0])
state = 'won'
$.pointerDown(100, 200)
$.pointerUp(100, 200)
assert.strictEqual(state, 'playing')
assert.isTrue(keepPlaying)
```

The best score should be kept and shown.
tr: Rekor saklanmalı ve gösterilmeli.

```js
board = [[16, 16, 0, 0], [8, 8, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
score = 0
$.press('ArrowLeft')
assert.strictEqual(best, 48)
assert.strictEqual(localStorage.getItem('2048-best'), '48')
assert.include($.texts(), 'Best: 48')
```

# --solution--

```js
// 2048, step by step.
// The page already has <canvas id="game" width="400" height="460"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SIZE = 4
const GAP = 12
const CELL = (canvas.width - GAP * (SIZE + 1)) / SIZE // 85
const TOP = 60 // room for the score above the board
const COLORS = {
  2: '#eee4da',
  4: '#ede0c8',
  8: '#f2b179',
  16: '#f59563',
  32: '#f67c5f',
  64: '#f65e3b',
  128: '#edcf72',
  256: '#edcc61',
  512: '#edc850',
  1024: '#edc53f',
  2048: '#edc22e',
}

let board
let score
let state // 'playing', 'won' or 'over'
let keepPlaying // true once the player chose to continue after making 2048
let best = Number(localStorage.getItem('2048-best')) || 0

function emptyCells() {
  const cells = []
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      if (board[row][col] === 0) cells.push([row, col])
    }
  }
  return cells
}

function addTile() {
  const cells = emptyCells()
  if (cells.length === 0) return
  const [row, col] = cells[Math.floor(Math.random() * cells.length)]
  board[row][col] = Math.random() < 0.9 ? 2 : 4
}

function newGame() {
  // Array.from calls the function for every row, so each row is its own array.
  board = Array.from({ length: SIZE }, () => Array(SIZE).fill(0))
  score = 0
  state = 'playing'
  keepPlaying = false
  addTile()
  addTile()
}

// Slides one row to the left. Pure: returns a new row and the points gained, and changes nothing else.
function slideRow(row) {
  const tiles = row.filter((value) => value !== 0)
  const result = []
  let gained = 0
  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i] === tiles[i + 1]) {
      result.push(tiles[i] * 2)
      gained += tiles[i] * 2
      i++ // the next tile was used up by this merge
    } else {
      result.push(tiles[i])
    }
  }
  while (result.length < SIZE) result.push(0)
  return { row: result, gained }
}

// Any empty cell, or two equal neighbours (checking right and below covers every pair once).
function canMove() {
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const value = board[row][col]
      if (value === 0) return true
      if (col < SIZE - 1 && value === board[row][col + 1]) return true
      if (row < SIZE - 1 && value === board[row + 1][col]) return true
    }
  }
  return false
}

// Every direction is "slide left" on a row or a column, possibly reversed.
function move(direction) {
  if (state !== 'playing') return false
  const before = JSON.stringify(board)
  const horizontal = direction === 'left' || direction === 'right'
  const reversed = direction === 'right' || direction === 'down'
  for (let i = 0; i < SIZE; i++) {
    const line = horizontal ? [...board[i]] : board.map((row) => row[i])
    if (reversed) line.reverse()
    const { row, gained } = slideRow(line)
    if (reversed) row.reverse()
    score += gained
    if (horizontal) board[i] = row
    else row.forEach((value, r) => (board[r][i] = value))
  }
  if (JSON.stringify(board) === before) return false
  addTile()
  if (score > best) {
    best = score
    localStorage.setItem('2048-best', best)
  }
  if (!keepPlaying && board.some((row) => row.includes(2048))) state = 'won'
  else if (!canMove()) state = 'over'
  return true
}

const directions = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' }

// Space, Enter or a tap: start again after game over, or keep playing after a win.
function next() {
  if (state === 'over') newGame()
  else if (state === 'won') {
    state = 'playing'
    keepPlaying = true
  }
}

document.addEventListener('keydown', (event) => {
  if (event.key === ' ' || event.key === 'Enter') next()
  const direction = directions[event.key]
  if (direction) {
    event.preventDefault()
    move(direction)
  }
  draw()
})

// A swipe is where the pointer came up compared to where it went down.
let swipeStart = null
canvas.addEventListener('pointerdown', (event) => {
  swipeStart = { x: event.clientX, y: event.clientY }
})
canvas.addEventListener('pointerup', (event) => {
  if (!swipeStart) return
  const dx = event.clientX - swipeStart.x
  const dy = event.clientY - swipeStart.y
  swipeStart = null
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 30) next() // too short for a swipe: a tap
  else if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 'right' : 'left')
  else move(dy > 0 ? 'down' : 'up')
  draw()
})

function cellX(col) {
  return GAP + col * (CELL + GAP)
}

function cellY(row) {
  return TOP + GAP + row * (CELL + GAP)
}

function draw() {
  ctx.fillStyle = '#faf8ef'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#bbada0'
  ctx.fillRect(0, TOP, canvas.width, canvas.width)

  ctx.fillStyle = '#776e65'
  ctx.font = 'bold 22px sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('Score: ' + score, GAP, TOP / 2)
  ctx.textAlign = 'right'
  ctx.fillText('Best: ' + best, canvas.width - GAP, TOP / 2)

  ctx.textAlign = 'center'
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const value = board[row][col]
      ctx.fillStyle = value === 0 ? '#cdc1b4' : COLORS[value] || '#3c3a32'
      ctx.fillRect(cellX(col), cellY(row), CELL, CELL)
      if (value !== 0) {
        ctx.fillStyle = value <= 4 ? '#776e65' : '#f9f6f2'
        ctx.font = 'bold ' + (value < 100 ? 40 : value < 1000 ? 34 : 26) + 'px sans-serif'
        ctx.fillText(String(value), cellX(col) + CELL / 2, cellY(row) + CELL / 2)
      }
    }
  }

  if (state !== 'playing') {
    ctx.fillStyle = state === 'won' ? 'rgba(237, 194, 46, 0.5)' : 'rgba(238, 228, 218, 0.75)'
    ctx.fillRect(0, TOP, canvas.width, canvas.width)
    ctx.fillStyle = state === 'won' ? '#f9f6f2' : '#776e65'
    ctx.font = 'bold 44px sans-serif'
    ctx.fillText(state === 'won' ? 'You win!' : 'Game Over', canvas.width / 2, TOP + 170)
    ctx.font = '18px sans-serif'
    ctx.fillText(state === 'won' ? 'Space or tap to keep going' : 'Space or tap to try again', canvas.width / 2, TOP + 220)
  }
}

newGame()
draw()
```
