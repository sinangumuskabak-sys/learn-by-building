---
title: All pairs found
title_tr: Bütün eşler bulundu
skills: [game.state]
---

# --explanation--

The game is won when every card is matched: `cards.every((card) => card.matched)`. There is no need for a separate
`won` variable that could fall out of sync. The answer can be **derived** from the cards whenever you need it.

That is a rule worth keeping: **store as little state as possible, derive the rest**. Every extra variable is one more
thing that has to be updated in every right place, and one more way to create a bug where two variables disagree. A
small function like `won()` computes the answer fresh each time, so it can never be stale.

When the game is won, show the result over the board and let a click start a new game, which reshuffles the cards so
it is never the same layout twice.

# --explanation-tr--

**Bu adımda:** oyunun bir sonu olacak. Son çifti bulunca tahta kararır ve ortada `You found them all!`, kaç hamlede
bitirdiğin ve `Click to play again` yazar. Tıklayınca kartlar yeniden karışır ve yeni oyun başlar.

**Kazandık mı?** Bütün kartlar eşleştiyse kazanmışızdır. Dizilerin bunun için hazır bir komutu var:

```js
cards.every((card) => card.matched)
```

`every` ("her biri") her kart için ok fonksiyonunu çalıştırır; **hepsi** `true` derse sonuç `true`, bir tanesi bile
`false` derse sonuç `false` olur.

**Saklama, hesapla.** Ayrı bir `won = true` değişkeni tutmak yerine cevabı kartlardan her seferinde yeniden
hesaplayan küçük bir `won()` fonksiyonu yazarız. Neden? Her fazladan değişken, doğru her yerde güncellenmesi gereken
bir şey daha demektir; biri unutulursa iki bilgi birbirini tutmaz ve hata çıkar. Hesaplanan cevap ise hiç eskimez.
İyi bir kural: **olabildiğince az şey sakla, gerisini hesapla**.

**Yarı saydam renk.** `'rgba(0, 0, 0, 0.6)'` rengi kırmızı, yeşil, mavi değerleriyle (0–255) verir; dördüncü sayı
saydamlıktır (0 görünmez, 1 tam dolu). `0.6` ile siyah bir perde çekeriz, kartlar arkadan hafifçe görünür.

**`if` ve `else` ile iki yol.** Tıklamada artık iki durum var: oyun bittiyse yeni oyun başlat, bitmediyse eskisi gibi
kart çevir. `if (won()) { ... } else { ... }` tam bunu söyler. `newGame()` kartları yeniden karıştırdığı için her
oyunun dizilişi farklı olur.

Yazıları ortalamak için `canvas.width / 2` (200) kullanırız; `ctx.textAlign` zaten `'center'` olduğu için yazının
ortası o noktaya gelir. `'bold 30px sans-serif'` kalın ve 30 piksel yazı demektir.

# --task--

1. Write `function won()` that returns whether every card is matched.
2. In the click handler, if the game is won, start a `newGame()` instead of flipping.
3. When won, draw over the board: a `'rgba(0, 0, 0, 0.6)'` rectangle covering the canvas, then in white and centered:
   `You found them all!`, `in 12 moves` (the real number), and `Click to play again`.

# --task-tr--

1. `cardAt` fonksiyonunun kapanış `}`'sinden sonra, `function flip(card)`'dan önce şunu ekle:

   ```js
   function won() {
     return cards.every((card) => card.matched)
   }
   ```

2. Tıklama dinleyicisini şöyle değiştir: eski dört satırı `else { }` içine al, üstüne `if (won())` ekle:

   ```js
   canvas.addEventListener('click', (event) => {
     if (won()) {                // ← yeni
       newGame()                 // ← yeni
     } else {                    // ← yeni
       // The canvas may be displayed at a different size than its own pixels, so scale the click.
       const rect = canvas.getBoundingClientRect()
       const x = (event.clientX - rect.left) * (canvas.width / rect.width)
       const y = (event.clientY - rect.top) * (canvas.height / rect.height)
       flip(cardAt(x, y))
     }                           // ← yeni
     draw()
   })
   ```

3. `draw()` fonksiyonunun en sonunda, `for` döngüsünü kapatan `}`'den sonra ve fonksiyonun kapanış `}`'sinden önce
   bir satır boşluk bırakıp şunu ekle:

   ```js
     if (won()) {
       ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
       ctx.fillRect(0, 0, canvas.width, canvas.height)
       ctx.fillStyle = 'white'
       ctx.font = 'bold 30px sans-serif'
       ctx.fillText('You found them all!', canvas.width / 2, 190)
       ctx.font = '20px sans-serif'
       ctx.fillText('in ' + moves + ' moves', canvas.width / 2, 230)
       ctx.font = '16px sans-serif'
       ctx.fillText('Click to play again', canvas.width / 2, 270)
     }
   ```

   Yani `draw()`'un sonu şöyle görünmeli: kartları çizen döngünün `}`'si, sonra bu `if` bloğu, en sonda da
   fonksiyonu kapatan `}`.

4. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla ve bütün çiftleri bul. Son çiftte tahta kararmalı ve üç satır
   yazı çıkmalı; tıklayınca yeni oyun başlamalı. Alttaki kontrollerin hepsi yeşil olmalı. Yazı kontrolü kırmızıysa
   `'in '` ve `' moves'` içindeki boşlukları kontrol et.

# --tests--

`won()` should be true only when every card is matched.
tr: `won()` yalnızca her kart eşleştiğinde doğru olmalı.

```js
assert.isFalse(won())
cards.forEach((c) => (c.matched = c.faceUp = true))
assert.isTrue(won())
cards[3].matched = false
assert.isFalse(won())
```

Finding the last pair should show the result.
tr: Son çifti bulmak sonucu göstermeli.

```js
for (const card of cards) card.matched = card.faceUp = card.symbol !== cards[0].symbol
moves = 11
const [a, b] = cards.filter((c) => !c.matched)
$.click(cardX(a) + 40, cardY(a) + 40)
$.click(cardX(b) + 40, cardY(b) + 40)
assert.isTrue(won())
assert.includeMembers($.texts(), ['You found them all!', 'in 12 moves', 'Click to play again'])
```

Clicking after winning should start a fresh, reshuffled game.
tr: Kazandıktan sonra tıklamak yeni ve yeniden karıştırılmış bir oyun başlatmalı.

```js
const before = cards.map((c) => c.symbol).join()
cards.forEach((c) => (c.matched = c.faceUp = true))
moves = 20
$.click(200, 200)
assert.isFalse(won())
assert.strictEqual(moves, 0)
assert.isTrue(cards.every((c) => !c.faceUp), 'the click only starts the new game; it does not flip a card')
assert.notStrictEqual(cards.map((c) => c.symbol).join(), before)
```

# --solution--

```js
// Memory, step by step.
// The page already has <canvas id="game" width="400" height="440"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SIZE = 4 // cards per row and per column
const CARD = 85
const GAP = 12
const TOP = 40 // room for the move counter above the cards
const SYMBOLS = ['🍎', '🍌', '🍇', '🍒', '🥝', '🍋', '🍉', '🍑']

let cards
let opened // the cards turned over this turn (0, 1 or 2)
let moves

// Fisher–Yates: every order is equally likely.
function shuffle(items) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[items[i], items[j]] = [items[j], items[i]]
  }
  return items
}

function newGame() {
  const deck = shuffle([...SYMBOLS, ...SYMBOLS])
  cards = deck.map((symbol, index) => ({
    symbol,
    col: index % SIZE,
    row: Math.floor(index / SIZE),
    faceUp: false,
    matched: false,
  }))
  opened = []
  moves = 0
}

function cardX(card) {
  return GAP + card.col * (CARD + GAP)
}

function cardY(card) {
  return TOP + GAP + card.row * (CARD + GAP)
}

function cardAt(x, y) {
  return cards.find((card) => {
    const left = cardX(card)
    const top = cardY(card)
    return x >= left && x < left + CARD && y >= top && y < top + CARD
  })
}

function won() {
  return cards.every((card) => card.matched)
}

function flip(card) {
  if (!card || card.faceUp || opened.length === 2) return
  card.faceUp = true
  opened.push(card)
  if (opened.length < 2) return

  moves += 1
  const [a, b] = opened
  if (a.symbol === b.symbol) {
    a.matched = true
    b.matched = true
    opened = []
  } else {
    // Give the player time to see the second card before hiding both again.
    setTimeout(() => {
      a.faceUp = false
      b.faceUp = false
      opened = []
      draw()
    }, 800)
  }
}

canvas.addEventListener('click', (event) => {
  if (won()) {
    newGame()
  } else {
    // The canvas may be displayed at a different size than its own pixels, so scale the click.
    const rect = canvas.getBoundingClientRect()
    const x = (event.clientX - rect.left) * (canvas.width / rect.width)
    const y = (event.clientY - rect.top) * (canvas.height / rect.height)
    flip(cardAt(x, y))
  }
  draw()
})

function draw() {
  ctx.fillStyle = '#1e1b4b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'white'
  ctx.font = '18px sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('Moves: ' + moves, GAP, 22)

  ctx.font = '44px sans-serif'
  ctx.textAlign = 'center'
  for (const card of cards) {
    const x = cardX(card)
    const y = cardY(card)
    if (card.faceUp) {
      ctx.fillStyle = card.matched ? '#bbf7d0' : '#f8fafc'
      ctx.fillRect(x, y, CARD, CARD)
      ctx.fillText(card.symbol, x + CARD / 2, y + CARD / 2)
    } else {
      ctx.fillStyle = '#6366f1'
      ctx.fillRect(x, y, CARD, CARD)
    }
  }

  if (won()) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'white'
    ctx.font = 'bold 30px sans-serif'
    ctx.fillText('You found them all!', canvas.width / 2, 190)
    ctx.font = '20px sans-serif'
    ctx.fillText('in ' + moves + ' moves', canvas.width / 2, 230)
    ctx.font = '16px sans-serif'
    ctx.fillText('Click to play again', canvas.width / 2, 270)
  }
}

newGame()
draw()
```
