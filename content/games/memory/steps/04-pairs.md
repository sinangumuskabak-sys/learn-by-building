---
title: Pairs, and giving the player time to look
title_tr: Eşler ve oyuncuya bakma süresi vermek
skills: [game.state, game.loop]
---

# --explanation--

Now the actual game. Keep the cards the player has turned over this turn in a small array, `opened`:

- First card: turn it over, remember it.
- Second card: turn it over and count a **move**. If both show the same symbol, they are a pair: mark them `matched`
  and they stay face up. If not, they must turn back over, but **not immediately**, or the player never sees the
  second card.

Waiting is a job for a **timer**. `setTimeout(fn, 800)` runs `fn` once, 800 milliseconds from now, and returns right
away. The rest of the page keeps running in the meantime; nothing "pauses".

```js
setTimeout(() => {
  a.faceUp = false
  b.faceUp = false
  opened = []
  draw()   // nothing else will redraw the board for us
}, 800)
```

During those 800 ms, `opened` still holds two cards. Use exactly that as the rule "ignore clicks while two cards are
showing"; otherwise a fast player could turn over a third card and confuse the game. State that is already there often
answers questions without adding a new variable.

# --explanation-tr--

**Bu adımda:** asıl oyunu yapacağız. İki kart açarsın; aynı meyveyse yeşile döner ve açık kalır, farklıysa bir an
sonra ikisi de kapanır. Üstte `Moves: 1` gibi bir hamle sayacı göreceksin.

**Kural:** Bu turda açılan kartları küçük bir dizide tutarız: `opened`.

- Birinci kart: aç, `opened`'a ekle.
- İkinci kart: aç ve bir **hamle** say. İki meyve aynıysa eştir: ikisini `matched` (eşleşti) yap, açık kalsınlar.
  Değilse kapanmalılar, ama **hemen değil**; yoksa oyuncu ikinci kartı göremez bile.

**Yeni yapı taşları:**

- `opened.push(card)` → diziye sona bir eleman ekler. `opened.length === 2` → "dizide 2 eleman var mı?".
- `===` "**eşit mi?**" sorusudur. Tek `=` ise "değer ver" demektir; ikisini karıştırma.
- `!` "**değil**" demektir: `!card` → "kart yoksa". `||` "**veya**" demektir: biri doğruysa yeter.
- `if (...) return` → koşul doğruysa fonksiyondan hemen çık, aşağısını çalıştırma. Kuralları en başta elemek için
  kullanışlıdır: kart yoksa, zaten açıksa ya da iki kart açık duruyorsa hiçbir şey yapma.
- `moves += 1` → `moves = moves + 1`'in kısası: 1 artır.
- `const [a, b] = opened` → dizinin ilk iki elemanına `a` ve `b` adını verir.
- `'Moves: ' + moves` → yazı ile sayıyı `+` ile birleştirir: `'Moves: 3'`.
- `card.matched ? '#bbf7d0' : '#f8fafc'` → kısa `if`: "eşleştiyse yeşil, değilse beyaz". `?` soru, `:` "yoksa".

**Beklemek: zamanlayıcı.** `setTimeout(fonksiyon, 800)` verdiğin fonksiyonu **800 milisaniye** (0,8 saniye) sonra bir
kez çalıştırır. Bu arada sayfa donmaz, her şey çalışmaya devam eder:

```js
setTimeout(() => {
  a.faceUp = false
  b.faceUp = false
  opened = []
  draw()   // tahtayı bizim yerimize kimse yeniden çizmez
}, 800)
```

Bu 800 ms boyunca `opened` hâlâ iki kart tutar. Tam da bunu "iki kart açıkken tıklamaları yok say" kuralı olarak
kullanırız; yoksa hızlı bir oyuncu üçüncü kartı açıp oyunu karıştırabilir. Zaten var olan bilgi, çoğu zaman yeni bir
değişken eklemeden soruyu cevaplar.

# --task--

1. Add `let opened` and `let moves`, and set them to `[]` and `0` in `newGame()`.
2. Write `function flip(card)`: do nothing if there is no card, it is already face up, or two cards are already
   `opened`. Otherwise turn it face up and push it onto `opened`. When that makes two: add a move; if their symbols
   match, mark both `matched` and empty `opened`; otherwise, after `800` ms, turn both face down, empty `opened` and
   `draw()`.
3. Use `flip(cardAt(x, y))` in the click handler.
4. In `draw()`: face-up cards that are `matched` get a `'#bbf7d0'` background instead of `'#f8fafc'`. Draw `Moves: 3`
   (the real number) in the top strip, white `'18px sans-serif'`, left-aligned at `(GAP, 22)`.

# --task-tr--

1. `let cards` satırının hemen altına iki değişken ekle:

   ```js
   let opened // the cards turned over this turn (0, 1 or 2)
   let moves
   ```

2. `newGame()` fonksiyonunda, `}))` satırından sonra, fonksiyonun kapanış `}`'sinden önce iki satır ekle:

   ```js
   function newGame() {
     const deck = shuffle([...SYMBOLS, ...SYMBOLS])
     cards = deck.map((symbol, index) => ({
       symbol,
       col: index % SIZE,
       row: Math.floor(index / SIZE),
       faceUp: false,
       matched: false,
     }))
     opened = []   // ← yeni
     moves = 0     // ← yeni
   }
   ```

3. `cardAt` fonksiyonunun kapanış `}`'sinden sonra, tıklama dinleyicisinden önce `flip` fonksiyonunu ekle:

   ```js
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
   ```

4. Tıklama dinleyicisinde şu iki satırı sil:

   ```js
   const card = cardAt(x, y)
   if (card) card.faceUp = true
   ```

   ve yerine tek satır yaz:

   ```js
   flip(cardAt(x, y))
   ```

5. `draw()` fonksiyonunun başını şöyle değiştir: arka planı boyayan satırlardan sonra hamle sayacını çiz,
   `ctx.textBaseline = 'middle'` satırını sayacın içine taşı ve kartın rengini `matched`'a göre seç:

   ```js
   function draw() {
     ctx.fillStyle = '#1e1b4b'
     ctx.fillRect(0, 0, canvas.width, canvas.height)

     ctx.fillStyle = 'white'                  // ← yeni
     ctx.font = '18px sans-serif'             // ← yeni
     ctx.textAlign = 'left'                   // ← yeni
     ctx.textBaseline = 'middle'              // ← yeni (aşağıdan buraya taşındı)
     ctx.fillText('Moves: ' + moves, GAP, 22) // ← yeni

     ctx.font = '44px sans-serif'
     ctx.textAlign = 'center'
     for (const card of cards) {
       const x = cardX(card)
       const y = cardY(card)
       if (card.faceUp) {
         ctx.fillStyle = card.matched ? '#bbf7d0' : '#f8fafc' // ← değişti
         ctx.fillRect(x, y, CARD, CARD)
         ctx.fillText(card.symbol, x + CARD / 2, y + CARD / 2)
       } else {
   ```

   Geri kalanı (`else` bloğu ve kapanışlar) aynı kalıyor.

6. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla: iki kart aç. Aynıysa yeşile döner, farklıysa bir an sonra
   kapanırlar; üstteki `Moves:` her iki kartta bir artar. Alttaki kontrollerin hepsi yeşil olmalı.

# --tests--

Two cards with the same symbol should stay face up as a pair.
tr: Aynı sembollü iki kart bir çift olarak açık kalmalı.

```js
const [a, b] = cards.filter((c) => c.symbol === cards[0].symbol)
flip(a)
flip(b)
assert.isTrue(a.matched && b.matched)
assert.deepEqual(opened, [])
assert.strictEqual(moves, 1)
$.run(2)
assert.isTrue(a.faceUp && b.faceUp)
```

Two different cards should turn back over after 800 ms.
tr: İki farklı kart 800 ms sonra geri kapanmalı.

```js
const a = cards[0]
const b = cards.find((c) => c.symbol !== a.symbol)
flip(a)
flip(b)
assert.isTrue(a.faceUp && b.faceUp)
assert.strictEqual(moves, 1)
$.run(0.5)
assert.isTrue(a.faceUp && b.faceUp, 'still showing after half a second')
$.run(0.5)
assert.isFalse(a.faceUp || b.faceUp)
assert.isFalse(a.matched || b.matched)
assert.deepEqual(opened, [])
assert.lengthOf($.rects('#6366f1'), 16, 'the board is redrawn face down')
```

A third card should be ignored while two are showing.
tr: İki kart açıkken üçüncü bir kart görmezden gelinmeli.

```js
const a = cards[0]
const b = cards.find((c) => c.symbol !== a.symbol)
const c = cards.find((card) => card !== a && card !== b)
flip(a)
flip(b)
flip(c)
assert.isFalse(c.faceUp)
flip(a)
assert.strictEqual(moves, 1)
```

Clicking works through `flip`, and matched cards and moves are drawn.
tr: Tıklama `flip` üzerinden çalışmalı; eşleşen kartlar ve hamleler çizilmeli.

```js
const [a, b] = cards.filter((c) => c.symbol === cards[0].symbol)
$.click(cardX(a) + 40, cardY(a) + 40)
$.click(cardX(b) + 40, cardY(b) + 40)
assert.isTrue(a.matched)
assert.lengthOf($.rects('#bbf7d0'), 2)
assert.include($.texts(), 'Moves: 1')
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
  // The canvas may be displayed at a different size than its own pixels, so scale the click.
  const rect = canvas.getBoundingClientRect()
  const x = (event.clientX - rect.left) * (canvas.width / rect.width)
  const y = (event.clientY - rect.top) * (canvas.height / rect.height)
  flip(cardAt(x, y))
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
}

newGame()
draw()
```
