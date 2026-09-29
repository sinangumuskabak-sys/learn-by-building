---
title: Shuffle
title_tr: Karıştır
skills: [prog.arrays, prog.loops]
---

# --goal--

A new deck is in order. We shuffle it the fair way: going from the last card to the first, swap each card with a random
card at or before it.

# --goal-tr--

Yeni deste sıralı: önce bütün maçalar, sonra kupalar... Oynamadan önce **karıştırmalıyız**.

Adil karıştırmanın bilinen bir yolu var: **sondan başa** doğru gideriz; her kartı, kendisi ya da kendinden önceki
kartlardan **rastgele biriyle** yer değiştiririz. Elindeki kartlardan rastgele birini çekip destenin altına koymak gibi.
Böylece her sıralanışın çıkma şansı eşit olur.

# --code--

```js
for (let i = deck.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1))
  ;[deck[i], deck[j]] = [deck[j], deck[i]]
}
```

# --meaning--

- The loop counts `i` down from 51 to 1 (`i--` takes 1 off).
- `Math.random() * (i + 1)` is a number from 0 to just under `i + 1`; `Math.floor` cuts the decimals: a whole
  number from 0 to `i`.
- `[deck[i], deck[j]] = [deck[j], deck[i]]` swaps two cards in one line. The `;` in front stops JavaScript from
  gluing this line (it starts with `[`) onto the line before.

# --meaning-tr--

- `for (let i = deck.length - 1; i > 0; i--)` → `i` 51'den başlar, 1'e kadar **geriye** sayar (`i--` bir azaltır).
- `Math.random()` → 0 ile 1 arasında rastgele bir sayı (1'in kendisi hiç gelmez).
- `Math.random() * (i + 1)` → 0 ile `i + 1`'in hemen altı arası, ör. 37.62.
- `Math.floor(...)` → küsuratı **atar**: 37.62 → 37. Sonuç 0 ile `i` arasında rastgele bir sıra numarası: `j`.
- `[deck[i], deck[j]] = [deck[j], deck[i]]` → iki kartın **yerini değiştirir**. Sağda iki kartlık yeni bir dizi
  kurulur, solda o dizi tekrar iki yere dağıtılır.
- Satırın başındaki `;` → satır `[` ile başladığı için JavaScript onu bir üstteki satırla birleştirmeye kalkabilir.
  Noktalı virgül "önceki satır burada bitti" der. Unutulursa garip hatalar çıkar.

# --task--

In `newDeck`, between the `for` line that builds the deck and `return deck`, write the shuffle loop.

# --task-tr--

`newDeck` içinde desteyi kuran uzun `for` satırı ile `return deck` satırının **arasına** karıştırma döngüsünü yaz.
**Çalıştır**.

# --hint--

Did you start the swap line with `;`? Without it JavaScript reads it as part of the line above.

# --hint-tr--

Yer değiştirme satırını `;` ile başlattın mı? O olmadan JavaScript onu üstteki satırın devamı sanar.

# --tests--

`newDeck()` should still give 52 different cards.
tr: `newDeck()` yine 52 farklı kart vermeli.

```js
const deck = newDeck()
assert.lengthOf(deck, 52)
assert.lengthOf(new Set(deck.map((card) => card.rank + '/' + card.suit)), 52, 'every card once')
```

The deck should be shuffled, differently each time.
tr: Deste karışık olmalı, her seferinde farklı.

```js
const deck = newDeck()
const inOrder = deck.every((card, i) => card.suit === Math.floor(i / 13) && card.rank === (i % 13) + 1)
assert.isFalse(inOrder, 'the deck should not be in order')
assert.notDeepEqual(newDeck(), newDeck())
```

# --solution--

```js
// Solitaire, step by step.
// The page already has <canvas id="game" width="480" height="560"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SUITS = ['♠', '♥', '♦', '♣']
const RANKS = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
const CW = 56 // card width
const CH = 78

const isRed = (card) => card.suit === 1 || card.suit === 2

function newDeck() {
  const deck = []
  for (let suit = 0; suit < 4; suit++) for (let rank = 1; rank <= 13; rank++) deck.push({ rank, suit, up: false })
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

function drawCardAt(card, x, y) {
  ctx.fillStyle = card.up ? '#ffffff' : '#1d4ed8'
  ctx.fillRect(x, y, CW, CH)
  ctx.strokeStyle = '#0f172a'
  ctx.lineWidth = 1
  ctx.strokeRect(x, y, CW, CH)
  if (!card.up) return
  ctx.fillStyle = isRed(card) ? '#dc2626' : '#0f172a'
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(RANKS[card.rank] + SUITS[card.suit], x + 4, y + 16)
  ctx.font = '28px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(SUITS[card.suit], x + CW / 2, y + 54)
}

function draw() {
  ctx.fillStyle = '#166534'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  drawCardAt({ rank: 12, suit: 1, up: true }, 16, 40)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
