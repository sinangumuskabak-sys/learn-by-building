---
title: Counting to 21
title_tr: 21'e kadar saymak
skills: [prog.functions, game.state]
---

# --explanation--

The goal is a hand closer to 21 than the dealer's, without going over. Number cards count their number, J, Q and K count 10.

The **ace** is the interesting one: it counts 11 or 1, whichever is better. A + 7 is 18, but A + 7 + 9 would be 27, so the
ace drops to 1 and the hand is 17. Trying every combination would be slow and messy. A simple trick works instead: count
every ace as 11 first, and while the total is over 21 and some ace is still counted as 11, take 10 off:

```js
while (total > 21 && aces > 0) {
  total -= 10
  aces -= 1
}
```

This always gives the best total, because counting an ace as 11 never hurts unless it makes you bust.

**Hit** (H) takes another card. Over 21 is a **bust**: the round is over and you lose. For now that is the only way a round
ends, so N deals a new one only after that; standing comes next.

A round is a small state machine: `phase` is `'player'` while you can act and `'done'` when the round is over. Each key checks
the phase first, so you cannot hit after busting or deal in the middle of a round.

# --explanation-tr--

**Bu adımda:** ellerin toplamını sayacağız ve kart çekebileceksin. Kartların üstünde `Dealer 17`, `You 19` gibi
toplamlar görünecek. **H** tuşu yeni kart çeker; 21'i geçersen ortada sarı "Bust!" (battın) yazar, o zaman **N**
ya da **Boşluk** yeni el dağıtır.

**Kural.** Amaç 21'i geçmeden krupiyeden 21'e daha yakın olmak. Sayı kartları kendi sayısı kadar, J, Q ve K 10
sayılır. **As** ise 11 ya da 1'dir, hangisi işine yararsa. A + 7 = 18; ama A + 7 + 9 = 27 olurdu, o yüzden as 1'e
düşer ve el 17 olur.

**Basit hile.** Önce her ası 11 say. Sonra toplam 21'i geçtiği **sürece** ve hâlâ 11 sayılan as varsa 10 çıkar:

```js
while (total > 21 && aces > 0) {
  total -= 10
  aces -= 1
}
```

`while (koşul) { ... }` koşul doğru olduğu sürece içini **tekrar tekrar** yapar; koşul yanlış olunca durur. `-=`
"şu kadar azalt" demek. Bu yöntem hep en iyi toplamı verir: bir ası 11 saymak ancak seni batırıyorsa zarar verir.

**Toplamı hesaplamak, parça parça:**

```js
for (const { rank } of hand) {
  if (rank === 'A') {
    total += 11
    aces += 1
  } else total += ['J', 'Q', 'K'].includes(rank) ? 10 : Number(rank)
}
```

- `const { rank } of hand` → eldeki her kartın yalnızca `rank` alanını al ve ona `rank` de.
- `if (...) { ... } else ...` → koşul doğruysa ilk kısım, **değilse** `else`'den sonraki kısım çalışır.
- `['J', 'Q', 'K'].includes(rank)` → "bu listede `rank` var mı?" (`true`/`false`).
- `Number('7')` yazıyı sayıya çevirir → `7`. (`'7'` bir yazı; toplama yapmak için sayı gerek.)
- `return total` sonucu fonksiyonu çağırana geri verir.

**Oyunun evresi (phase).** Bir el küçük bir durum makinesidir: `phase` sen oynayabilirken `'player'`, el bitince
`'done'`. Her tuş önce evreye bakar: batınca kart çekemezsin, el ortasında yeniden dağıtamazsın. `message` ekranda
yazacak sonucu tutar (`''` boş yazı = mesaj yok).

**Tuşları düğmelere çevirmek.** Birkaç tuşu bir sözlük nesnesiyle düğme adlarına bağlarız:

```js
const keys = { h: 'Hit', n: 'Deal', ' ': 'Deal' }
const button = keys[event.key.toLowerCase()]
```

`event.key` basılan tuş, `.toLowerCase()` onu küçük harfe çevirir (H de h de çalışsın). `keys['h']` → `'Hit'`.
Listede olmayan tuş için sonuç boş (`undefined`) olur; `if (!button) return` ("düğme yoksa çık"; `!` "değil")
onları atlar. `event.preventDefault()` tarayıcının o tuşla kendi yaptığı işi (ör. Boşluk'la sayfayı kaydırmak)
engeller. Tuşlar doğrudan iş yapmaz, `press('Hit')` gibi bir düğmeye basar; sonraki adımlarda ekrandaki gerçek
düğmeler de aynı `press`'i kullanacak.

`else if` zincirlemektir: "ilk koşul değilse, şu koşula bak".

# --task--

1. Write `handValue(hand)`: J, Q and K count 10, aces 11, then take 10 off per ace while the total is over 21.
2. Add `phase` and `message`. `deal()` sets `phase = 'player'` and `message = ''`.
3. Write `hit()`: only in `'player'`, add a card to `player`; over 21, call `finish()`, which sets `phase = 'done'` and
   `message = 'Bust!'`.
4. Write `press(button)`: `'Hit'` hits, `'Deal'` deals only when `phase === 'done'`. The keys H (Hit), N and Space (Deal)
   press them (`preventDefault()`).
5. Draw `Dealer 17` at `(20, DEALER_Y - 10)` and `You 19` at `(20, PLAYER_Y - 10)` (white, `'bold 16px sans-serif'`), and the
   message in `'#fde047'`, `'bold 22px sans-serif'`, centered at `y = 212`.

# --task-tr--

1. `let dealer` satırının hemen **altına** iki değişken ekle:

   ```js
   let phase // 'player' (your turn) or 'done' (the round is over)
   let message
   ```

2. `const nextCard = () => deck.pop()` satırının altına bir satır boşluk bırakıp toplam hesaplayan fonksiyonu yaz:

   ```js
   // Aces count 11, unless that would bust the hand: then they count 1.
   function handValue(hand) {
     let total = 0
     let aces = 0
     for (const { rank } of hand) {
       if (rank === 'A') {
         total += 11
         aces += 1
       } else total += ['J', 'Q', 'K'].includes(rank) ? 10 : Number(rank)
     }
     while (total > 21 && aces > 0) {
       total -= 10
       aces -= 1
     }
     return total
   }
   ```

3. `deal()` fonksiyonunun sonuna iki satır ekle, altına da `hit()` ve `finish()` fonksiyonlarını yaz:

   ```js
   function deal() {
     if (deck.length < 15) newDeck()
     player = [nextCard(), nextCard()]
     dealer = [nextCard(), nextCard()]
     message = ''     // ← yeni
     phase = 'player' // ← yeni
   }

   function hit() {
     if (phase !== 'player') return
     player.push(nextCard())
     if (handValue(player) > 21) finish()
   }

   function finish() {
     phase = 'done'
     message = 'Bust!'
   }
   ```

   `!==` "eşit değil" demek: senin sıran değilse `hit()` hiçbir şey yapmadan çıkar.

4. `reset()` fonksiyonunun kapanan `}`'sinin altına düğme ve klavye kodunu yaz:

   ```js
   function press(button) {
     if (button === 'Hit') hit()
     else if (button === 'Deal' && phase === 'done') deal()
   }

   document.addEventListener('keydown', (event) => {
     const keys = { h: 'Hit', n: 'Deal', ' ': 'Deal' }
     const button = keys[event.key.toLowerCase()]
     if (!button) return
     event.preventDefault()
     press(button)
   })
   ```

   `addEventListener('keydown', ...)` "bir tuşa basılınca şu fonksiyonu çalıştır" der; tarayıcı tuş bilgisini
   `event` içinde verir.

5. `draw()` fonksiyonunda `drawHand(player, PLAYER_Y, false)` satırının altına, kapanan `}`'den önce toplamları ve
   mesajı çizen satırları ekle:

   ```js
     ctx.fillStyle = 'white'
     ctx.font = 'bold 16px sans-serif'
     ctx.textAlign = 'left'
     ctx.fillText('Dealer ' + handValue(dealer), 20, DEALER_Y - 10)
     ctx.fillText('You ' + handValue(player), 20, PLAYER_Y - 10)

     if (message) {
       ctx.fillStyle = '#fde047'
       ctx.font = 'bold 22px sans-serif'
       ctx.textAlign = 'center'
       ctx.fillText(message, canvas.width / 2, 212)
     }
   ```

   `'You ' + 19` yazı ile sayıyı birleştirir → `'You 19'`. `if (message)` mesaj boş değilse doğrudur.

6. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. H ile kart çek; 21'i geçince "Bust!" yazmalı, sonra N ya da
   Boşluk yeni el dağıtmalı. Alttaki kontrollerin hepsi yeşil olmalı. Aslı eller yanlış sayılıyorsa `while`
   satırındaki `&&` ve `aces -= 1`'i kontrol et.

# --tests--

`handValue` should count face cards as 10 and aces as 11 or 1, whichever is best.
tr: `handValue` resimli kartları 10, asları da hangisi iyiyse 11 ya da 1 saymalı.

```js
assert.strictEqual(handValue([card('K', '♠'), card('7', '♥')]), 17)
assert.strictEqual(handValue([card('A', '♠'), card('K', '♥')]), 21)
assert.strictEqual(handValue([card('A', '♠'), card('5', '♥'), card('9', '♥')]), 15, 'the ace counts 1 now')
assert.strictEqual(handValue([card('A', '♠'), card('A', '♥')]), 12)
assert.strictEqual(handValue([card('A', '♠'), card('A', '♥'), card('A', '♦'), card('8', '♥')]), 21)
```

H should take a card; over 21 the round should end in a bust, and only then N should deal again.
tr: H bir kart almalı; 21'in üstünde el batarak bitmeli ve ancak o zaman N yeniden dağıtmalı.

```js
const rig = (...ranks) => {
  deck = Array.from({ length: 20 }, () => card('2', '♣')).concat(ranks.reverse().map((rank) => card(rank, '♠')))
}
rig('10', '6', '9', '8', '4', 'K')
deal()
assert.strictEqual(phase, 'player')
$.press('h')
assert.lengthOf(player, 3)
assert.strictEqual(phase, 'player', '20 is fine')
$.press('n')
assert.lengthOf(player, 3, 'no new deal in the middle of a round')
$.press('h')
assert.strictEqual(handValue(player), 30)
assert.strictEqual(phase, 'done')
assert.strictEqual(message, 'Bust!')
$.press('h')
assert.lengthOf(player, 4, 'no more cards after the round is over')
$.press('n')
assert.lengthOf(player, 2)
assert.strictEqual(message, '')
```

Both totals should be drawn.
tr: İki toplam da çizilmeli.

```js
const rig = (...ranks) => {
  deck = Array.from({ length: 20 }, () => card('2', '♣')).concat(ranks.reverse().map((rank) => card(rank, '♠')))
}
rig('K', '9', '7', 'Q')
deal()
$.tick(1)
assert.include($.texts(), 'You 19')
assert.include($.texts(), 'Dealer 17')
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
let phase // 'player' (your turn) or 'done' (the round is over)
let message

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

// Aces count 11, unless that would bust the hand: then they count 1.
function handValue(hand) {
  let total = 0
  let aces = 0
  for (const { rank } of hand) {
    if (rank === 'A') {
      total += 11
      aces += 1
    } else total += ['J', 'Q', 'K'].includes(rank) ? 10 : Number(rank)
  }
  while (total > 21 && aces > 0) {
    total -= 10
    aces -= 1
  }
  return total
}

function deal() {
  if (deck.length < 15) newDeck()
  player = [nextCard(), nextCard()]
  dealer = [nextCard(), nextCard()]
  message = ''
  phase = 'player'
}

function hit() {
  if (phase !== 'player') return
  player.push(nextCard())
  if (handValue(player) > 21) finish()
}

function finish() {
  phase = 'done'
  message = 'Bust!'
}

function reset() {
  newDeck()
  deal()
}

function press(button) {
  if (button === 'Hit') hit()
  else if (button === 'Deal' && phase === 'done') deal()
}

document.addEventListener('keydown', (event) => {
  const keys = { h: 'Hit', n: 'Deal', ' ': 'Deal' }
  const button = keys[event.key.toLowerCase()]
  if (!button) return
  event.preventDefault()
  press(button)
})

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

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Dealer ' + handValue(dealer), 20, DEALER_Y - 10)
  ctx.fillText('You ' + handValue(player), 20, PLAYER_Y - 10)

  if (message) {
    ctx.fillStyle = '#fde047'
    ctx.font = 'bold 22px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(message, canvas.width / 2, 212)
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
