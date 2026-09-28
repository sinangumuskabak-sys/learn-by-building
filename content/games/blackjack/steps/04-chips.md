---
title: Chips and blackjack
title_tr: Fişler ve blackjack
skills: [game.state]
---

# --explanation--

Now there is something at stake. You start with 100 chips and each round costs a bet of 10, taken **when the cards are
dealt**. At the end, the payout comes back:

| result | paid back | profit |
|---|---|---|
| win | bet × 2 | +10 |
| push | bet | 0 |
| **blackjack** | bet × 2.5 | +15 |
| lose | nothing | −10 |

A **blackjack** is 21 with your **first two cards**: an ace and a ten-valued card. It is the best hand and pays 3 to 2.
If either side has one, the round ends at once. There is nothing left to decide, and the dealer shows the hidden card.
`isBlackjack` needs both conditions: an ace, a 5 and a 5 is 21, but not a blackjack.

Taking the bet at the deal and paying back a total makes the accounting simple: a push is just "give the bet back". When you
run out of chips, the next deal starts again with 100.

JavaScript lets `finish` set two things at once with **destructuring**: `[message, paid] = ['You win', bet * 2]`.

# --explanation-tr--

**Bu adımda:** oyuna fiş (chip) ve bahis gelecek. Sol üstte `Chips 100  Bet 10` yazacak; her el 10 fişe mal olacak,
kazanınca fişlerin artacak. İlk iki kartla 21 yaparsan (**blackjack**) el hemen biter ve daha fazla kazanırsın.

**Ödeme tablosu.** 100 fişle başlarsın. Her el **kartlar dağıtılırken** 10 fişlik bahis alınır. El bitince geri
ödeme gelir:

| sonuç | geri ödenen | kâr |
|---|---|---|
| kazanç | bahis × 2 | +10 |
| berabere | bahis | 0 |
| **blackjack** | bahis × 2,5 | +15 |
| kayıp | hiç | −10 |

Bahsi baştan alıp sonunda toplam ödemek hesabı basitleştirir: berabere sadece "bahsi geri ver" demektir. Fişin
bitince sonraki dağıtım yine 100'le başlar. Kodda ondalık için virgül değil **nokta** kullanılır: `2.5`.

**Blackjack nedir?** **İlk iki kartla** 21: bir as ve 10 değerinde bir kart. En iyi eldir. İki koşul birlikte
gerekir; as + 5 + 5 de 21'dir ama blackjack değildir:

```js
const isBlackjack = (hand) => hand.length === 2 && handValue(hand) === 21
```

"Elde tam 2 kart var **ve** değeri 21." Taraflardan birinde blackjack varsa el hemen biter; karar verilecek bir şey
kalmaz ve krupiye kapalı kartını açar (`finish()` evreyi `'done'` yaptığı için kart kendiliğinden açık çizilir).

**İki değişkene birden değer vermek.** `finish()` hem mesajı hem ödemeyi (`paid`) seçer. JavaScript bunu tek satırda
yapabilir:

```js
;[message, paid] = ['You win', bet * 2]
```

Soldaki listenin ilk kutusuna sağdakinin ilk değeri, ikincisine ikincisi girer. Buna **parçalama**
(destructuring) denir. Kaybedilen ellerde `paid` baştaki `0` değerinde kalır; sadece `message` yazılır.

**Yazıya eklemek.** `message += ' - out of chips!'` mesajın sonuna yazı ekler (`+=` yazılarda "sonuna ekle"
demektir).

# --task--

1. Add `START = 100`, `BET = 10`, `bank` (`START` in `reset()`) and `bet`.
2. In `deal()`: if `bank < BET`, set `bank = START`; then `bet = BET` and take it from `bank`. If either hand is a blackjack,
   `finish()` right away.
3. Write `isBlackjack(hand)`: two cards worth 21.
4. In `finish()`, check blackjacks first (`'Both blackjack: push'`, `'Blackjack!'` paying `bet * 2.5`, `'Dealer blackjack'`),
   then the rules from before; a win pays `bet * 2`, a push `bet`. Add the payment to `bank`, and if `bank < BET` add
   `' - out of chips!'` to the message.
5. Draw `Chips 100  Bet 10` at `(20, 28)`.

# --task-tr--

1. `const PLAYER_Y = 250` satırının hemen **altına** iki sabit ekle:

   ```js
   const START = 100 // chips at the start
   const BET = 10
   ```

2. `let message` satırının hemen **altına** iki değişken ekle:

   ```js
   let bank
   let bet
   ```

   `bank` elindeki fişler, `bet` masadaki bahis.

3. `handValue` fonksiyonunun kapanan `}`'sinin altına bir satır boşluk bırakıp blackjack kontrolünü yaz:

   ```js
   const isBlackjack = (hand) => hand.length === 2 && handValue(hand) === 21
   ```

4. `deal()` fonksiyonunu şöyle değiştir:

   ```js
   function deal() {
     if (bank < BET) bank = START // out of chips: start over   ← yeni
     if (deck.length < 15) newDeck()
     bet = BET                                                    // ← yeni
     bank -= bet                                                  // ← yeni
     player = [nextCard(), nextCard()]
     dealer = [nextCard(), nextCard()]
     message = ''
     phase = 'player'
     if (isBlackjack(player) || isBlackjack(dealer)) finish()     // ← yeni
   }
   ```

   İlk satırdaki `← yeni` notu yorumun içinde; yazmana gerek yok.

5. `finish()` fonksiyonunu tamamen şununla değiştir:

   ```js
   // Compare the hands and pay: a win returns the bet twice, blackjack two and a half times, a push gives it back.
   function finish() {
     phase = 'done'
     const p = handValue(player)
     const d = handValue(dealer)
     let paid = 0
     if (isBlackjack(player) && isBlackjack(dealer)) [message, paid] = ['Both blackjack: push', bet]
     else if (isBlackjack(player)) [message, paid] = ['Blackjack!', bet * 2.5]
     else if (isBlackjack(dealer)) message = 'Dealer blackjack'
     else if (p > 21) message = 'Bust!'
     else if (d > 21) [message, paid] = ['Dealer busts, you win', bet * 2]
     else if (p > d) [message, paid] = ['You win', bet * 2]
     else if (p < d) message = 'Dealer wins'
     else [message, paid] = ['Push', bet]
     bank += paid
     if (bank < BET) message += ' - out of chips!'
   }
   ```

   Blackjack kontrolleri en önce gelir. Sonunda ödeme fişlere eklenir; fiş bir bahse yetmiyorsa mesaja not düşülür.

6. `reset()` fonksiyonunun ilk satırı olarak başlangıç fişlerini ver:

   ```js
   function reset() {
     bank = START // ← yeni
     newDeck()
     deal()
   }
   ```

7. `draw()` fonksiyonunda `ctx.fillText('You ' + ...)` satırının hemen **altına** fiş yazısını ekle:

   ```js
     ctx.fillText('Chips ' + bank + '  Bet ' + bet, 20, 28)
   ```

   `'  Bet '`'in başında **iki** boşluk var.

8. **Çalıştır**'a bas. Sol üstte `Chips 90  Bet 10` görmelisin (ilk bahis masada). Oynamak için önce oyuna tıkla;
   H, S ve N ile birkaç el oyna, fişlerin değişmesini izle. Alttaki kontrollerin hepsi yeşil olmalı. Blackjack
   testi kırmızıysa `bet * 2.5`'teki noktayı ve `isBlackjack`'teki `hand.length === 2`'yi kontrol et.

# --tests--

The bet should be taken at the deal, and a win, a push and a loss should pay back the right amount.
tr: Bahis dağıtımda alınmalı; kazanç, berabere ve kayıp doğru miktarı geri ödemeli.

```js
const rig = (...ranks) => {
  deck = Array.from({ length: 20 }, () => card('2', '♣')).concat(ranks.reverse().map((rank) => card(rank, '♠')))
}
assert.strictEqual(bank, 90, 'the first bet is already on the table')
rig('K', '9', '10', '7')
bank = 100
deal()
assert.strictEqual(bank, 90)
stand()
assert.strictEqual(bank, 110, 'a win pays the bet back twice')
rig('K', '8', '10', '8')
deal()
stand()
assert.strictEqual(bank, 110, 'a push gives the bet back')
rig('K', '7', '10', '9')
deal()
stand()
assert.strictEqual(bank, 100)
$.tick(1)
assert.include($.texts(), 'Chips 100  Bet 10')
```

A blackjack should end the round at once and pay 3 to 2; only two cards make one.
tr: Blackjack eli hemen bitirmeli ve 3'e 2 ödemeli; yalnızca iki kart blackjack yapar.

```js
const rig = (...ranks) => {
  deck = Array.from({ length: 20 }, () => card('2', '♣')).concat(ranks.reverse().map((rank) => card(rank, '♠')))
}
bank = 100
rig('A', 'K', '10', '7')
deal()
assert.strictEqual(phase, 'done', 'a blackjack ends the round at once')
assert.strictEqual(message, 'Blackjack!')
assert.strictEqual(bank, 115, 'blackjack pays 3 to 2')
assert.isFalse(isBlackjack([card('A', '♠'), card('5', '♥'), card('5', '♦')]), 'only with two cards')
rig('10', '7', 'A', 'Q')
deal()
assert.strictEqual(message, 'Dealer blackjack')
assert.strictEqual(bank, 105)
rig('A', 'J', 'K', 'A')
deal()
assert.strictEqual(message, 'Both blackjack: push')
assert.strictEqual(bank, 105)
```

Running out of chips should be shown, and the next deal should start over with 100.
tr: Fişlerin bitmesi gösterilmeli ve sonraki dağıtım 100 ile yeniden başlamalı.

```js
const rig = (...ranks) => {
  deck = Array.from({ length: 20 }, () => card('2', '♣')).concat(ranks.reverse().map((rank) => card(rank, '♠')))
}
bank = 10
rig('K', '6', '10', '9', '2', '2', '2', '2')
deal()
stand()
assert.strictEqual(bank, 0)
assert.strictEqual(message, 'Dealer wins - out of chips!')
$.press('n')
assert.strictEqual(bank, 90, 'a new game starts with 100 chips')
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
const START = 100 // chips at the start
const BET = 10

let deck
let player
let dealer
let phase // 'player' (your turn) or 'done' (the round is over)
let message
let bank
let bet

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

const isBlackjack = (hand) => hand.length === 2 && handValue(hand) === 21

function deal() {
  if (bank < BET) bank = START // out of chips: start over
  if (deck.length < 15) newDeck()
  bet = BET
  bank -= bet
  player = [nextCard(), nextCard()]
  dealer = [nextCard(), nextCard()]
  message = ''
  phase = 'player'
  if (isBlackjack(player) || isBlackjack(dealer)) finish()
}

function hit() {
  if (phase !== 'player') return
  player.push(nextCard())
  if (handValue(player) > 21) finish()
  else if (handValue(player) === 21) stand()
}

function stand() {
  if (phase !== 'player') return
  // The dealer has no choice: draw below 17, stand on 17 or more.
  while (handValue(dealer) < 17) dealer.push(nextCard())
  finish()
}

// Compare the hands and pay: a win returns the bet twice, blackjack two and a half times, a push gives it back.
function finish() {
  phase = 'done'
  const p = handValue(player)
  const d = handValue(dealer)
  let paid = 0
  if (isBlackjack(player) && isBlackjack(dealer)) [message, paid] = ['Both blackjack: push', bet]
  else if (isBlackjack(player)) [message, paid] = ['Blackjack!', bet * 2.5]
  else if (isBlackjack(dealer)) message = 'Dealer blackjack'
  else if (p > 21) message = 'Bust!'
  else if (d > 21) [message, paid] = ['Dealer busts, you win', bet * 2]
  else if (p > d) [message, paid] = ['You win', bet * 2]
  else if (p < d) message = 'Dealer wins'
  else [message, paid] = ['Push', bet]
  bank += paid
  if (bank < BET) message += ' - out of chips!'
}

function reset() {
  bank = START
  newDeck()
  deal()
}

function press(button) {
  if (button === 'Hit') hit()
  else if (button === 'Stand') stand()
  else if (button === 'Deal' && phase === 'done') deal()
}

document.addEventListener('keydown', (event) => {
  const keys = { h: 'Hit', s: 'Stand', n: 'Deal', ' ': 'Deal' }
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

  const hide = phase === 'player'
  drawHand(dealer, DEALER_Y, hide)
  drawHand(player, PLAYER_Y, false)

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Dealer ' + (hide ? handValue([dealer[0]]) : handValue(dealer)), 20, DEALER_Y - 10)
  ctx.fillText('You ' + handValue(player), 20, PLAYER_Y - 10)
  ctx.fillText('Chips ' + bank + '  Bet ' + bet, 20, 28)

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
