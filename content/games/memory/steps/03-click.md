---
title: Which card was clicked?
title_tr: Hangi karta tıklandı?
skills: [game.input]
---

# --explanation--

In Tic-tac-toe every pixel belonged to some cell, so `Math.floor(x / CELL)` was enough. Here there are **gaps**
between the cards, and a click in a gap should do nothing. So instead of computing a cell, ask each card: "is this
point inside you?"

A point is inside a rectangle when it is past the left edge but before the right edge, **and** past the top but before
the bottom:

```js
x >= left && x < left + CARD && y >= top && y < top + CARD
```

`cards.find(...)` returns the first card that says yes, or `undefined` for a click in a gap. This **hit testing** is
how every clickable thing in a canvas UI works: buttons, menu items, units in a strategy game.

Remember to convert the click to canvas pixels first (position and scale), as in every canvas game.

# --explanation-tr--

**Bu adımda:** kartlara tıklanabilir hale getireceğiz. Bir karta tıklayınca beyaza döner ve altındaki meyve görünür.
Kartların arasındaki boşluğa tıklamak hiçbir şey yapmaz.

**Hangi karta tıklandı?** Kartların arasında **boşluklar** var, bu yüzden tıklanan noktadan basit bir hesapla kart
bulamayız. Onun yerine her karta tek tek sorarız: "bu nokta senin içinde mi?" Buna **isabet testi** (hit testing)
denir; canvas'taki her tıklanabilir şey (düğmeler, menüler) böyle çalışır.

Bir nokta, sol kenarın sağında ama sağ kenarın solundaysa **ve** üst kenarın altında ama alt kenarın üstündeyse
dikdörtgenin içindedir:

```js
x >= left && x < left + CARD && y >= top && y < top + CARD
```

- `>=` "büyük ya da eşit", `<` "küçük" demektir. Bunlara **karşılaştırma** denir; sonuçları `true` ya da `false`'tur.
- `&&` "**ve**" demektir: hepsi doğruysa sonuç `true`, biri bile yanlışsa `false`.

**`find` ile aramak.** `cards.find((card) => ...)` kartları sırayla gezer ve ok fonksiyonu `true` döndüren **ilk**
kartı verir. Hiçbiri tutmazsa sonuç `undefined`'dır, yani "hiçbir şey". Ok fonksiyonunun gövdesi birkaç satırsa
`{ }` içine yazılır ve sonucu `return` ile verilir.

**Olay (event) nedir?** Tıklama, tuşa basma gibi kullanıcının yaptığı şeylerdir. Bilgisayara "şu olunca şunu yap"
deriz:

```js
canvas.addEventListener('click', (event) => {
  // canvas'a her tıklandığında burası çalışır
})
```

`addEventListener` bir **dinleyici** ekler: `'click'` olayını bekler, olunca verdiğimiz fonksiyonu çağırır.
`event` olayın bilgisini taşır; `event.clientX` ve `event.clientY` farenin ekrandaki konumudur.

**Ekran konumunu canvas konumuna çevirmek.** Ekran konumu, canvas'ın içindeki konumla aynı değildir: canvas sayfada
bir yerde durur ve ekranda daha küçük ya da büyük gösterilebilir. `canvas.getBoundingClientRect()` canvas'ın ekrandaki
yerini ve boyunu verir (`rect.left`, `rect.top`, `rect.width`). Önce canvas'ın sol kenarını çıkarırız (`-`), sonra
ölçekle çarparız (`canvas.width / rect.width`). Bu iki satırı her canvas oyununda aynen kullanırsın.

`if (card) card.faceUp = true` → "kart bulunduysa onu aç". Tek komutluk `if`'te süslü parantez gerekmez.
`card.faceUp = true` nesnenin alanını değiştirir. Sonra `draw()` ile tahtayı yeniden çizeriz, yoksa değişikliği
göremeyiz.

# --task--

1. Write `function cardAt(x, y)` that returns the card whose square contains the canvas point `(x, y)`, or
   `undefined`.
2. On `click` on the canvas: convert the click to canvas pixels, find the card with `cardAt`, turn it face up if there
   is one, and `draw()`.

(For now cards stay face up. Pairs come next.)

# --task-tr--

1. `function cardY(card) { ... }` fonksiyonunun kapanış `}`'sinden sonra bir satır boşluk bırak ve şunu ekle:

   ```js
   function cardAt(x, y) {
     return cards.find((card) => {
       const left = cardX(card)
       const top = cardY(card)
       return x >= left && x < left + CARD && y >= top && y < top + CARD
     })
   }
   ```

2. Hemen altına tıklama dinleyicisini ekle:

   ```js
   canvas.addEventListener('click', (event) => {
     // The canvas may be displayed at a different size than its own pixels, so scale the click.
     const rect = canvas.getBoundingClientRect()
     const x = (event.clientX - rect.left) * (canvas.width / rect.width)
     const y = (event.clientY - rect.top) * (canvas.height / rect.height)
     const card = cardAt(x, y)
     if (card) card.faceUp = true
     draw()
   })
   ```

   Sondaki `})` önemli: `}` fonksiyonu, `)` ise `addEventListener(` parantezini kapatır.

3. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla: tıkladığın kartlar beyaza dönüp meyvesini göstermeli (şimdilik
   açık kalıyorlar; eşleştirme sonraki adımda). Alttaki kontrollerin hepsi yeşil olmalı. Kenar kontrolü kırmızıysa
   `>=` ile `<`'nin yerlerini kontrol et.

# --tests--

`cardAt()` should find the card under a point, including its edges.
tr: `cardAt()` bir noktanın altındaki kartı, kenarları dahil bulmalı.

```js
assert.strictEqual(cardAt(50, 90), cards[0])
assert.strictEqual(cardAt(12, 52), cards[0], 'top-left corner of the first card')
assert.strictEqual(cardAt(96.9, 136.9), cards[0], 'just inside the bottom-right corner')
assert.strictEqual(cardAt(250, 190), cards[6])
assert.strictEqual(cardAt(350, 400), cards[15])
```

Points in the gaps or the top strip should not hit any card.
tr: Boşluklardaki ya da üst şeritteki noktalar hiçbir karta isabet etmemeli.

```js
assert.isUndefined(cardAt(100, 90), 'gap between the first two columns')
assert.isUndefined(cardAt(50, 140), 'gap between the first two rows')
assert.isUndefined(cardAt(200, 20), 'the top strip')
```

Clicking a card should turn it face up and show it.
tr: Bir karta tıklamak onu açmalı ve göstermeli.

```js
$.click(250, 190)
assert.isTrue(cards[6].faceUp)
assert.strictEqual(cards.filter((c) => c.faceUp).length, 1)
assert.include($.texts(), cards[6].symbol)
$.click(100, 90)
assert.strictEqual(cards.filter((c) => c.faceUp).length, 1, 'a click in a gap does nothing')
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

canvas.addEventListener('click', (event) => {
  // The canvas may be displayed at a different size than its own pixels, so scale the click.
  const rect = canvas.getBoundingClientRect()
  const x = (event.clientX - rect.left) * (canvas.width / rect.width)
  const y = (event.clientY - rect.top) * (canvas.height / rect.height)
  const card = cardAt(x, y)
  if (card) card.faceUp = true
  draw()
})

function draw() {
  ctx.fillStyle = '#1e1b4b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.font = '44px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (const card of cards) {
    const x = cardX(card)
    const y = cardY(card)
    if (card.faceUp) {
      ctx.fillStyle = '#f8fafc'
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
