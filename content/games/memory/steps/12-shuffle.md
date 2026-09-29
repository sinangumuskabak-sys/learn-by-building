---
title: A fair shuffle
title_tr: Adil bir karıştırma
skills: [prog.arrays, prog.functions]
---

# --goal--

Right now the pairs sit side by side. We shuffle the deck with the **Fisher–Yates** shuffle: walk from the last position
to the first, and swap each one with a random position from 0 up to it. Every order is equally likely.

# --goal-tr--

Şu an eşler **yan yana** duruyor (elma, muz, ... sonra yine elma, muz...). Kartları karıştırmalıyız.

İnternette `deck.sort(() => Math.random() - 0.5)` gibi tek satırlık bir yöntem çok görülür ama **yanlıdır**: bazı
sıralar diğerlerinden sık çıkar; oyuncu eşlerin nereye düştüğünü öğrenebilir. Doğrusu **Fisher–Yates**: sondan başa
yürü; her konumu, kendisi ve öncekiler arasından rastgele seçilen bir konumla **yer değiştir**. Kâğıt destesinden sondan
başa kart çekip yer değiştirmek gibi.

# --code--

```js
// Fisher–Yates: every order is equally likely.
function shuffle(items) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[items[i], items[j]] = [items[j], items[i]]
  }
  return items
}

  const deck = shuffle([...SYMBOLS, ...SYMBOLS])
```

# --meaning--

- `i` goes from the last position down to 1 (`i--` subtracts 1).
- `j` is a random position from 0 to `i`: `Math.random()` is 0 up to 1, times `i + 1`, rounded down.
- `[items[i], items[j]] = [items[j], items[i]]` swaps the two items. The leading `;` stops JavaScript from gluing the
  line onto the one before.
- The range must shrink with `i`; picking `j` from the whole array would be biased too.

# --meaning-tr--

- `for (let i = items.length - 1; i > 0; i--)` → `i` **son** konumdan (15) başlar; `i--` her turda 1 **azaltır**;
  `i > 0` olduğu sürece sürer.
- `Math.random()` → 0 ile 1 arasında (1 hariç) rastgele bir sayı. `* (i + 1)` ve `Math.floor` ile **0 ile `i` arasında**
  rastgele bir tam sayı: `j`.
- `;[items[i], items[j]] = [items[j], items[i]]` → iki elemanın **yerini değiştirir** (takas). Baştaki `;`, bu satırın
  bir öncekine yapışmasını engeller; unutma.
- `return items` → karışan diziyi geri ver. Aynı dizi karıştırılır (yeni dizi yapılmaz).
- Dikkat: `j`'yi bütün diziden seçmek de yanlıdır; aralık `i` ile birlikte **daralmalı**.
- `newGame` içinde `shuffle([...SYMBOLS, ...SYMBOLS])` → deste karıştırılarak yapılır.

# --task--

1. Above `function newGame`, write the comment and `shuffle`, then an empty line.
2. In `newGame`, wrap the deck in `shuffle( ... )`.

# --task-tr--

1. `function newGame() {` satırının **üstüne** yorum satırını, `shuffle` fonksiyonunu ve bir boş satır yaz.
2. `newGame` içindeki deste satırını `const deck = shuffle([...SYMBOLS, ...SYMBOLS])` yap.
3. **Çalıştır**. Görmek için `faceUp: false`'u geçici olarak `true` yapabilirsin; sonra geri al.

# --hint--

Check `i + 1` in the random line and the condition `i > 0`, and don't forget the `;` before the swap.

# --hint-tr--

Rastgele satırdaki `i + 1`'i ve `i > 0` koşulunu kontrol et; takas satırının başındaki `;`'yi unutma.

# --tests--

`shuffle()` should keep the same items, in place.
tr: `shuffle()` aynı elemanları yerinde tutmalı.

```js
const items = [1, 2, 3, 4, 5, 6]
const result = shuffle(items)
assert.strictEqual(result, items, 'shuffle the array you were given and return it')
assert.sameMembers(items, [1, 2, 3, 4, 5, 6])
```

`shuffle()` should make every order equally likely.
tr: `shuffle()` her sıralamayı eşit olasılıklı yapmalı.

```js
// 24000 shuffles of three items: each of the 6 orders should come up about 4000 times.
const counts = {}
for (let i = 0; i < 24000; i++) {
  const key = shuffle([1, 2, 3]).join('')
  counts[key] = (counts[key] || 0) + 1
}
assert.lengthOf(Object.keys(counts), 6, 'all 6 orders of three items should appear')
for (const [order, count] of Object.entries(counts)) {
  assert.isAbove(count, 3700, `order ${order} came up ${count} times out of 24000; expected about 4000`)
  assert.isBelow(count, 4300, `order ${order} came up ${count} times out of 24000; expected about 4000`)
}
```

A new game should deal shuffled cards.
tr: Yeni oyun karışık kartlar dağıtmalı.

```js
assert.sameMembers(cards.map((c) => c.symbol), [...SYMBOLS, ...SYMBOLS])
assert.notDeepEqual(cards.map((c) => c.symbol), [...SYMBOLS, ...SYMBOLS])
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

function draw() {
  ctx.fillStyle = '#1e1b4b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.textBaseline = 'middle'
  ctx.font = '44px sans-serif'
  ctx.textAlign = 'center'
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

function loop() {
  draw()
  requestAnimationFrame(loop)
}

newGame()
requestAnimationFrame(loop)
```
