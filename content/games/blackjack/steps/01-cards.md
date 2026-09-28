---
title: A deck of cards
title_tr: Bir deste kart
skills: [prog.arrays, game.canvas]
---

# --explanation--

Blackjack is played with a normal deck: 13 **ranks** (A, 2 to 10, J, Q, K) in 4 **suits** (♠ ♥ ♦ ♣), 52 cards in all.
A card is a tiny object, `{ rank: 'Q', suit: '♥' }`, and two nested loops build every combination:

```js
for (const suit of SUITS) for (const rank of RANKS) deck.push(card(rank, suit))
```

Then we shuffle. The fair way is **Fisher–Yates**: go from the last card down, and swap each card with a random card at or
before it. Every order of the 52 cards is then exactly as likely as any other.

Dealing takes cards off the **end** of the array with `pop()`, which is fast and removes the card from the deck, so a card can
never be dealt twice. The player gets two cards and the dealer two.

Suit symbols are just text: `'♥'` can be drawn with `fillText` like any letter. Hearts and diamonds are red. A face-down card
is drawn as a blue back, which we will need soon for the dealer's hidden card.

# --explanation-tr--

**Bu adımda:** bir deste kart yapıp karıştıracağız ve iki el dağıtacağız. Sağda yeşil bir masa, üstte krupiyenin
(dealer) iki kartı, altta senin iki kartın görünecek. Kupa ve karo kırmızı, maça ve sinek siyah olacak.

**Kod nedir, nerede yazılır?** Soldaki kod panelindeki `game.js` dosyası, bilgisayara verdiğin talimatların
listesidir. Bilgisayar onları **yukarıdan aşağıya** okur ve yapar. `//` ile başlayan kısımlar **yorumdur**:
bilgisayar atlar, sadece insanlar için not.

**Canvas ve fırça.** Sayfada 480×460 piksellik bir resim alanı (`canvas`, kimliği `game`) var. Her şeyi onun üstüne
boyarız. Önce kâğıdı, sonra fırçayı (çizim bağlamı, context) alırız:

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')
```

`const ad = değer` bir şeye **sabit** bir ad verir (kutuya etiket yapıştırmak gibi). `let ad` ise içi sonradan
değişebilen bir **değişken** açar. Nokta (`.`) "bunun içindeki" demek; tırnak içindekiler **yazıdır** (metin).
Canvas'ta `(0, 0)` sol üst köşedir: `x` sağa, `y` **aşağı** doğru büyür.

**Dizi (array): sıralı liste.** Köşeli parantez içinde, virgülle: `['A', '2', '3']`. Elemanlar 0'dan numaralanır:
`RANKS[0]` → `'A'`. `.length` eleman sayısıdır. Deste 13 **değer** (A, 2…10, J, Q, K) ve 4 **renkten** (♠ ♥ ♦ ♣)
oluşur: 52 kart.

**Nesne (object): bilgi paketi.** Bir kart `{ rank: 'Q', suit: '♥' }`: süslü parantez içinde `ad: değer` alanları.
`c.rank` ile okunur. Kart yapan kısa bir fonksiyon yazarız:

```js
const card = (rank, suit) => ({ rank, suit })
```

- **Fonksiyon**, bir işi bir ad altında toplar. `(rank, suit)` onun **parametreleri**: çağırırken verdiğin
  değerlerin içerideki adları. `card('Q', '♥')` → `{ rank: 'Q', suit: '♥' }`.
- `=>` "şunu ver" demek (ok fonksiyonu). Nesneyi dış parantez `( )` içine alırız ki süslü parantez "fonksiyonun
  içi" sanılmasın. `{ rank, suit }` kısaltmadır: `{ rank: rank, suit: suit }`.

**Döngü: her renk için her değer.** `for (const suit of SUITS)` listedeki her eleman için bir kez döner. İç içe iki
döngü 4 × 13 = 52 kartın hepsini üretir; `deck.push(...)` her kartı listenin sonuna ekler.

**Karıştırmak (Fisher–Yates).** Adil yol: son karttan başa doğru git, her kartı kendisinden önceki (ya da kendisi)
rastgele bir kartla yer değiştir. Böylece 52 kartın her dizilişi eşit olasılıklıdır.

```js
for (let i = deck.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1))   // 0 ile i arası rastgele tam sayı
  ;[deck[i], deck[j]] = [deck[j], deck[i]]         // i. ve j. kartı takas et
}
```

- Bu, sayan bir döngü: `let i = 51` ile başla; `i > 0` olduğu sürece dön; her turdan sonra `i--` (bir azalt).
- `Math.random()` 0 ile 1 arası rastgele sayı, `Math.floor` aşağı yuvarlar.
- `[a, b] = [b, a]` iki şeyin yerini tek satırda değiştirir. Baştaki `;` önceki satırla karışmasın diye var.

**Dağıtmak.** `deck.pop()` listenin **son** elemanını çıkarıp verir; kart desteden silindiği için iki kez gelemez.
`deste 15'ten azsa yeni deste` kuralı `if` ile yazılır: `if (koşul) komut` → koşul doğruysa yap.

**Kart çizmek.** `fillRect` dolu dikdörtgen, `strokeRect` sadece çerçeve çizer (`strokeStyle` çerçeve rengi).
`fillText('Q', x, y)` yazı yazar; `ctx.font` yazı tipini, `ctx.textAlign` hizalamayı ayarlar. Renk seçimi:
`koşul ? evetse : hayırsa`. `c.suit === '♥' || c.suit === '♦'` → "kupa **veya** karo mu?" (`===` eşit mi, `||` veya).
Gizli kart mavi bir arka yüzdür; `return` fonksiyondan erken çıkar, yazıları çizmez.

**Eli çizmek.** `hand.forEach((c, i) => ...)` listedeki her kart için çalışır; `c` kart, `i` sırası (0, 1, 2…).
Kartlar `x = 20`'den başlar ve `CARD_W + 8` = 72 piksel arayla dizilir: `20 + i * step`. El çok uzarsa `Math.min`
aralığı küçültür ki kartlar masaya sığsın.

**Döngü.** `requestAnimationFrame(loop)` tarayıcıdan "bir sonraki karede `loop`'u çalıştır" ister; `loop` her
seferinde `draw()`'u çağırıp kendini yeniden ister. Ekran saniyede ~60 kez yeniden çizilir.

# --task--

1. Add `RANKS`, `SUITS = ['♠', '♥', '♦', '♣']`, `CARD_W = 64`, `CARD_H = 90`, `DEALER_Y = 70`, `PLAYER_Y = 250` and
   `card(rank, suit)`.
2. Write `newDeck()` (all 52 cards, shuffled with Fisher–Yates) and `nextCard()`, which pops a card off the deck.
3. Write `deal()`: a new deck if fewer than 15 cards are left, then two cards each for `player` and `dealer`. `reset()` makes a
   new deck and deals.
4. Write `drawCard(c, x, y, hidden)`: a white `CARD_W` by `CARD_H` card with a `'#0f172a'` outline, its rank at
   `(x + 6, y + 22)` in `'bold 18px sans-serif'` and its suit centered at `(x + CARD_W / 2, y + 64)` in `'34px sans-serif'`,
   red (`'#dc2626'`) for ♥ and ♦, otherwise `'#0f172a'`. A hidden card is `'#1d4ed8'` with a `'#93c5fd'` frame 6 pixels in.
5. Write `drawHand(hand, y, hideSecond)`: the cards from `x = 20`, `CARD_W + 8` apart (closer when the hand is long). Fill the
   table with `'#166534'` and draw the dealer's hand at `DEALER_Y` and yours at `PLAYER_Y`.

# --task-tr--

1. Kod panelinde en alttaki `// Write your code below.` satırının **altına** tıkla ve şunları yaz:

   ```js
   const canvas = document.getElementById('game')
   const ctx = canvas.getContext('2d')

   const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
   const SUITS = ['♠', '♥', '♦', '♣']
   const CARD_W = 64
   const CARD_H = 90
   const DEALER_Y = 70
   const PLAYER_Y = 250

   let deck
   let player
   let dealer

   const card = (rank, suit) => ({ rank, suit })
   ```

   Renk simgelerini kopyalayıp yapıştırabilirsin. `CARD_W`/`CARD_H` kartın eni ve boyu, `DEALER_Y`/`PLAYER_Y` iki
   elin yüksekliği.

2. Altına desteyi yapan, kart çeken ve dağıtan fonksiyonları yaz:

   ```js
   // A new shuffled deck of 52 cards (Fisher–Yates).
   function newDeck() {
     deck = []
     for (const suit of SUITS) for (const rank of RANKS) deck.push(card(rank, suit))
     for (let i = deck.length - 1; i > 0; i--) {
       const j = Math.floor(Math.random() * (i + 1))
       ;[deck[i], deck[j]] = [deck[j], deck[i]]
     }
   }

   const nextCard = () => deck.pop()

   function deal() {
     if (deck.length < 15) newDeck()
     player = [nextCard(), nextCard()]
     dealer = [nextCard(), nextCard()]
   }

   function reset() {
     newDeck()
     deal()
   }
   ```

3. Altına tek bir kartı çizen fonksiyonu yaz:

   ```js
   function drawCard(c, x, y, hidden) {
     ctx.fillStyle = hidden ? '#1d4ed8' : '#ffffff'
     ctx.fillRect(x, y, CARD_W, CARD_H)
     ctx.strokeStyle = '#0f172a'
     ctx.lineWidth = 1
     ctx.strokeRect(x, y, CARD_W, CARD_H)
     if (hidden) {
       ctx.strokeStyle = '#93c5fd'
       ctx.strokeRect(x + 6, y + 6, CARD_W - 12, CARD_H - 12)
       return
     }
     ctx.fillStyle = c.suit === '♥' || c.suit === '♦' ? '#dc2626' : '#0f172a'
     ctx.font = 'bold 18px sans-serif'
     ctx.textAlign = 'left'
     ctx.fillText(c.rank, x + 6, y + 22)
     ctx.font = '34px sans-serif'
     ctx.textAlign = 'center'
     ctx.fillText(c.suit, x + CARD_W / 2, y + 64)
   }
   ```

   Beyaz kart, koyu çerçeve; sol üstte değer, ortada büyük renk simgesi. Gizliyse mavi arka yüz ve içte açık mavi
   bir çerçeve.

4. Altına bir eli ve bütün masayı çizen fonksiyonları, en sona da oyunu başlatan satırları yaz:

   ```js
   // Cards overlap a little so a long hand still fits.
   function drawHand(hand, y, hideSecond) {
     const step = Math.min(CARD_W + 8, (canvas.width - 40 - CARD_W) / Math.max(1, hand.length - 1))
     hand.forEach((c, i) => drawCard(c, 20 + i * step, y, hideSecond && i === 1))
   }

   function draw() {
     ctx.fillStyle = '#166534'
     ctx.fillRect(0, 0, canvas.width, canvas.height)

     drawHand(dealer, DEALER_Y, false)
     drawHand(player, PLAYER_Y, false)
   }

   function loop() {
     draw()
     requestAnimationFrame(loop)
   }

   reset()
   requestAnimationFrame(loop)
   ```

   `hideSecond && i === 1` "ikinciyi gizle dendiyse **ve** bu ikinci kartsa" demek; şimdilik hep `false`
   veriyoruz, sonraki adımlarda lazım olacak.

5. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Yeşil masada üstte iki, altta iki kart görmelisin; her
   çalıştırmada kartlar değişir. Alttaki kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa renk kodlarını ve
   sayıları (`x + 6, y + 22`, `y + 64`) harf harf karşılaştır.

# --tests--

A new deck should hold all 52 different cards, shuffled.
tr: Yeni bir deste 52 farklı kartın hepsini karıştırılmış olarak tutmalı.

```js
newDeck()
assert.lengthOf(deck, 52)
assert.lengthOf(new Set(deck.map((c) => c.rank + c.suit)), 52, 'no card twice')
for (const suit of SUITS) assert.lengthOf(deck.filter((c) => c.suit === suit), 13)
const first = deck.map((c) => c.rank + c.suit).join()
newDeck()
assert.notStrictEqual(deck.map((c) => c.rank + c.suit).join(), first, 'shuffled')
```

Each hand should get two cards off the end of the deck.
tr: Her el destenin sonundan iki kart almalı.

```js
assert.lengthOf(player, 2)
assert.lengthOf(dealer, 2)
assert.lengthOf(deck, 48)
const top = deck[deck.length - 1]
assert.strictEqual(nextCard(), top, 'cards come off the end of the deck')
assert.lengthOf(deck, 47)
```

Cards should be drawn in place, hearts and diamonds in red, and a hidden card as its back.
tr: Kartlar yerlerinde çizilmeli, kupa ve karo kırmızı, gizli bir kart da arka yüzüyle.

```js
player = [card('Q', '♥'), card('7', '♣')]
dealer = [card('A', '♠'), card('10', '♦')]
$.tick(1)
const whites = $.rects('#ffffff')
assert.deepInclude(whites, { x: 20, y: 250, w: 64, h: 90, color: '#ffffff' })
assert.deepInclude(whites, { x: 92, y: 250, w: 64, h: 90, color: '#ffffff' })
assert.deepInclude(whites, { x: 20, y: 70, w: 64, h: 90, color: '#ffffff' })
const texts = $.screen().filter((c) => c.op === 'fillText')
assert.strictEqual(texts.find((c) => c.args[0] === 'Q').fill, '#dc2626', 'hearts are red')
assert.strictEqual(texts.find((c) => c.args[0] === '7').fill, '#0f172a', 'clubs are black')
assert.include(texts.map((c) => c.args[0]), '♦')
drawCard(card('K', '♠'), 300, 100, true)
assert.deepInclude($.rects('#1d4ed8'), { x: 300, y: 100, w: 64, h: 90, color: '#1d4ed8' }, 'a hidden card shows its back')
```

# --seed--

```js
// Blackjack, step by step.
// The page already has <canvas id="game" width="480" height="460"></canvas>.
// Write your code below.
```

# --solution--

```js
// Blackjack, step by step.
// The page already has <canvas id="game" width="480" height="460"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
const SUITS = ['♠', '♥', '♦', '♣']
const CARD_W = 64
const CARD_H = 90
const DEALER_Y = 70
const PLAYER_Y = 250

let deck
let player
let dealer

const card = (rank, suit) => ({ rank, suit })

// A new shuffled deck of 52 cards (Fisher–Yates).
function newDeck() {
  deck = []
  for (const suit of SUITS) for (const rank of RANKS) deck.push(card(rank, suit))
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
}

const nextCard = () => deck.pop()

function deal() {
  if (deck.length < 15) newDeck()
  player = [nextCard(), nextCard()]
  dealer = [nextCard(), nextCard()]
}

function reset() {
  newDeck()
  deal()
}

function drawCard(c, x, y, hidden) {
  ctx.fillStyle = hidden ? '#1d4ed8' : '#ffffff'
  ctx.fillRect(x, y, CARD_W, CARD_H)
  ctx.strokeStyle = '#0f172a'
  ctx.lineWidth = 1
  ctx.strokeRect(x, y, CARD_W, CARD_H)
  if (hidden) {
    ctx.strokeStyle = '#93c5fd'
    ctx.strokeRect(x + 6, y + 6, CARD_W - 12, CARD_H - 12)
    return
  }
  ctx.fillStyle = c.suit === '♥' || c.suit === '♦' ? '#dc2626' : '#0f172a'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(c.rank, x + 6, y + 22)
  ctx.font = '34px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(c.suit, x + CARD_W / 2, y + 64)
}

// Cards overlap a little so a long hand still fits.
function drawHand(hand, y, hideSecond) {
  const step = Math.min(CARD_W + 8, (canvas.width - 40 - CARD_W) / Math.max(1, hand.length - 1))
  hand.forEach((c, i) => drawCard(c, 20 + i * step, y, hideSecond && i === 1))
}

function draw() {
  ctx.fillStyle = '#166534'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  drawHand(dealer, DEALER_Y, false)
  drawHand(player, PLAYER_Y, false)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
