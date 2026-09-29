---
title: A deck of 52
title_tr: 52 kartlık deste
skills: [prog.arrays, prog.loops]
---

# --goal--

`newDeck` builds the whole deck: for each of the 4 suits, the 13 ranks. 4 × 13 = 52 cards, all face down.

# --goal-tr--

Şimdi bütün desteyi kuruyoruz. Bir deste: 4 renk, her renkte 13 değer → 4 × 13 = **52 kart**. Hepsi kapalı başlar.

52 kartı elle yazmak yerine iki **iç içe döngü** kullanacağız: dıştaki döngü renkleri, içteki değerleri gezer.
Ekranda henüz bir şey değişmeyecek; desteyi hazırlıyoruz.

# --code--

```js
function newDeck() {
  const deck = []
  for (let suit = 0; suit < 4; suit++) for (let rank = 1; rank <= 13; rank++) deck.push({ rank, suit, up: false })
  return deck
}
```

# --meaning--

- `const deck = []` starts an empty array.
- The outer `for` runs `suit` 0 to 3; for each, the inner `for` runs `rank` 1 to 13 and `push` adds a card.
- `{ rank, suit, up: false }` is short for `{ rank: rank, suit: suit, up: false }`.
- `return deck` hands the finished deck back to whoever called `newDeck()`.

# --meaning-tr--

- `const deck = []` → boş bir dizi: kartlar buraya eklenecek.
- `for (let suit = 0; suit < 4; suit++)` → **sayan döngü**, üç parçası var: `suit`'i 0'dan başlat; `suit < 4`
  olduğu sürece tekrar et; her turdan sonra `suit++` ile bir artır. Yani 0, 1, 2, 3.
- Aynı satırdaki ikinci `for` → her renk için `rank`'ı 1'den 13'e kadar sayar (`<=` "küçük veya eşit").
  İç içe iki döngü: 4 × 13 = 52 tur.
- `deck.push({ rank, suit, up: false })` → `push` dizinin **sonuna** ekler. `{ rank, suit }` yazmak,
  `{ rank: rank, suit: suit }` yazmanın kısa yoludur: değişkenin adı anahtarın adı olur.
- `return deck` → hazır desteyi, `newDeck()` diye çağıran yere **geri verir**.

# --task--

Under the `isRed` line, leave an empty line and write `newDeck`. Press **Run**.

# --task-tr--

`const isRed = ...` satırının altına bir boş satır bırak ve `newDeck` fonksiyonunu yaz. **Çalıştır**: ekran aynı
kalır, kontroller yeşil olmalı.

# --predict--

How many times does `deck.push` run?
- [ ] 17 (4 + 13)
- [x] 52 (4 × 13)
  The inner loop runs all 13 ranks once for each of the 4 suits.
- [ ] 13

# --predict-tr--

`deck.push` kaç kez çalışır?
- [ ] 17 (4 + 13)
- [x] 52 (4 × 13)
  İçteki döngü, dıştaki döngünün 4 turunun her birinde 13 kez döner.
- [ ] 13

# --tests--

`newDeck()` should return 52 different cards, all face down.
tr: `newDeck()` hepsi kapalı 52 farklı kart vermeli.

```js
const deck = newDeck()
assert.lengthOf(deck, 52)
assert.lengthOf(new Set(deck.map((card) => card.rank + '/' + card.suit)), 52, 'every card once')
assert.isTrue(deck.every((card) => card.up === false), 'face down')
assert.isTrue(deck.every((card) => card.rank >= 1 && card.rank <= 13 && card.suit >= 0 && card.suit <= 3))
```

The deck should go suit by suit: A♠ to K♠, then the hearts.
tr: Deste renk renk gitmeli: A♠'den K♠'ye, sonra kupalar.

```js
const deck = newDeck()
assert.deepEqual(deck[0], { rank: 1, suit: 0, up: false })
assert.deepEqual(deck[12], { rank: 13, suit: 0, up: false })
assert.deepEqual(deck[13], { rank: 1, suit: 1, up: false })
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
