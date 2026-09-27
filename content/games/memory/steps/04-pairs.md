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

Şimdi asıl oyun. Oyuncunun bu turda çevirdiği kartları küçük bir dizide tut: `opened`.

- İlk kart: çevir, hatırla.
- İkinci kart: çevir ve bir **hamle** say. İkisinde de aynı sembol varsa eştirler: `matched` olarak işaretle, açık
  kalsınlar. Değilse geri kapanmalılar, ama **hemen değil**; yoksa oyuncu ikinci kartı hiç göremez.

Beklemek bir **zamanlayıcının** işi. `setTimeout(fn, 800)` `fn`'yi şu andan 800 milisaniye sonra bir kez çalıştırır ve
hemen döner. Sayfanın geri kalanı bu arada çalışmaya devam eder; hiçbir şey "durmaz".

```js
setTimeout(() => {
  a.faceUp = false
  b.faceUp = false
  opened = []
  draw()   // tahtayı bizim için yeniden çizecek başka bir şey yok
}, 800)
```

O 800 ms boyunca `opened` hâlâ iki kart tutar. "İki kart açıkken tıklamaları yok say" kuralı için tam olarak bunu
kullan; yoksa hızlı bir oyuncu üçüncü bir kartı çevirip oyunu karıştırabilir. Zaten var olan durum, çoğu zaman yeni bir
değişken eklemeden soruları cevaplar.

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

1. `let opened` ve `let moves` ekle; `newGame()` içinde `[]` ve `0` yap.
2. `function flip(card)` yaz: kart yoksa, zaten açıksa ya da hâlihazırda iki kart `opened` ise hiçbir şey yapma. Değilse
   kartı aç ve `opened`'a ekle. Bu ikinciyse: bir hamle ekle; sembolleri aynıysa ikisini de `matched` yap ve `opened`'ı
   boşalt; değilse `800` ms sonra ikisini de kapat, `opened`'ı boşalt ve `draw()` çağır.
3. Tıklama işleyicisinde `flip(cardAt(x, y))` kullan.
4. `draw()` içinde: `matched` olan açık kartların arka planı `'#f8fafc'` yerine `'#bbf7d0'` olsun. Üst şeride beyaz
   `'18px sans-serif'` ile, `(GAP, 22)` noktasına sola hizalı `Moves: 3` (gerçek sayı) yaz.

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
