---
title: Suspense and doubling down
title_tr: Gerilim ve ikiye katlama
skills: [game.loop, game.state]
---

# --explanation--

Right now the dealer's whole turn happens in one frame, and the result just appears. At a real table the dealer turns the
cards **one at a time**, and that pause is where the tension lives.

So the dealer gets its own phase. `stand()` no longer loops; it sets `phase = 'dealer'` and a `timer`. Each frame `update()`
counts the timer down, and when it runs out the dealer takes **one** decision: below 17, draw a card and start the timer
again; otherwise finish. The `while` loop from before has become a loop spread over time, one turn per `DELAY` frames. This
is a general trick for anything that should happen step by step on screen: game logic that waits happens in `update`,
not in a loop.

We also add a real blackjack move: **double down** (D). On your first two cards you may double your bet, but then you get
**exactly one** more card and must stand. With 10 or 11 against a weak dealer card it is often the best play in the game.

# --explanation-tr--

**Bu adımda:** krupiye kartlarını **tek tek**, arada yarım saniye bekleyerek açacak; gerilim artacak. Ayrıca yeni
bir hamle gelecek: **D** tuşuyla bahsini ikiye katlayabileceksin (double down).

**Şu anki sorun.** Krupiyenin bütün sırası tek bir karede olup bitiyor, sonuç birden beliriyor. Gerçek masada
krupiye kartları birer birer çevirir; heyecan o bekleyişte.

**Zamana yayılmış döngü.** `while` döngüsü hepsini bir anda yapar; ekrana çizim ancak döngü bitince olur. Beklemek
için başka bir yol gerekir: krupiyeye kendi **evresini** veririz (`phase = 'dealer'`) ve bir **sayaç** kurarız.

```js
function update() {
  if (phase !== 'dealer') return   // krupiyenin sırası değilse hiçbir şey yapma
  timer -= 1                       // her karede sayacı bir azalt
  if (timer > 0) return            // daha zamanı gelmedi
  if (handValue(dealer) < 17) {    // zamanı geldi: tek bir karar
    dealer.push(nextCard())
    timer = DELAY                  // sayacı yeniden kur
  } else finish()
}
```

`update()`'i oyun döngüsü her karede (saniyede ~60 kez) çağırır. `DELAY = 30` kare yaklaşık yarım saniye. Yani
krupiye her yarım saniyede bir kez "17'nin altında mıyım?" diye bakar, kart çeker ya da biter. Eski `while`
döngüsü, zamana yayılmış bir döngüye dönüştü. Bekleyen oyun mantığı döngüde değil, `update()`'te olur.

`stand()` artık krupiyeyi oynatmaz; sadece `phase = 'dealer'` yapar ve sayacı kurar. `hit()` ve `double()` zaten
`phase !== 'player'` ise çalışmadığı için krupiye çekerken sen kart çekemezsin.

**İkiye katlama (double down).** Yalnızca ilk iki kartındayken bahsini ikiye katlayabilirsin; ama sonra **tam bir**
kart daha alırsın ve durmak zorundasın. Toplamın 10 ya da 11 iken çoğu zaman en iyi hamledir. Koşullar:

```js
if (phase !== 'player' || player.length !== 2 || bank < bet) return
```

"Senin sıran değilse **veya** elinde 2 kart yoksa **veya** fişin bir bahis daha koymaya yetmiyorsa, çık." `||` ile
bağlı koşullardan biri doğruysa hepsi doğru sayılır. `bet *= 2` bahsi ikiyle çarpar (`bet = bet * 2`).

Gizli kart artık yalnızca `'player'` evresinde gizli; krupiye çekerken açık görürsün. 3. adımda yazdığımız
`const hide = phase === 'player'` bunu zaten sağlıyor, değiştirmene gerek yok.

# --task--

1. Add `DELAY = 30` and `timer`. `phase` can now also be `'dealer'`.
2. `stand()` sets `phase = 'dealer'` and `timer = DELAY`. Write `update()`, called before `draw()`: in `'dealer'`, count the
   timer down; at `0`, draw a card and reset the timer if the dealer is below 17, otherwise `finish()`.
3. Write `double()`: only in `'player'`, with exactly two cards and `bank >= bet`. Take another `bet` from `bank`, double
   `bet`, take one card, then `finish()` if it busts, otherwise `stand()`. The D key presses `'Double'`.
4. The hidden card stays hidden only in `'player'`, so you can watch the dealer draw.

# --task-tr--

1. `const BET = 10` satırının hemen **altına** bekleme süresini ekle:

   ```js
   const DELAY = 30 // frames between the dealer's cards
   ```

2. `let bet` satırının altına `let timer` ekle. `let phase` satırının yorumunu da yeni evreyle güncelleyebilirsin:

   ```js
   let phase // 'player' (your turn), 'dealer' (the dealer draws) or 'done' (the round is over)
   ```

   ```js
   let bet
   let timer
   ```

3. `stand()` fonksiyonunu değiştir; altına `double()` fonksiyonunu yaz:

   ```js
   function stand() {
     if (phase !== 'player') return
     phase = 'dealer' // ← yeni (eski while satırı silindi)
     timer = DELAY    // ← yeni
   }

   // Double the bet, take exactly one more card, and stand.
   function double() {
     if (phase !== 'player' || player.length !== 2 || bank < bet) return
     bank -= bet
     bet *= 2
     player.push(nextCard())
     if (handValue(player) > 21) finish()
     else stand()
   }
   ```

   `stand()` içindeki `// The dealer has no choice...` yorumu ve `while` satırı artık burada yok; o yorum
   `update()`'e taşınıyor.

4. `reset()` fonksiyonunun kapanan `}`'sinin altına bir satır boşluk bırakıp `update()`'i yaz:

   ```js
   function update() {
     if (phase !== 'dealer') return
     timer -= 1
     if (timer > 0) return
     // The dealer has no choice: draw below 17, stand on 17 or more.
     if (handValue(dealer) < 17) {
       dealer.push(nextCard())
       timer = DELAY
     } else finish()
   }
   ```

5. `press()` fonksiyonuna `'Double'`'ı, klavye sözlüğüne `d`'yi ekle:

   ```js
   function press(button) {
     if (button === 'Hit') hit()
     else if (button === 'Stand') stand()
     else if (button === 'Double') double() // ← yeni
     else if (button === 'Deal' && phase === 'done') deal()
   }
   ```

   ```js
     const keys = { h: 'Hit', s: 'Stand', d: 'Double', n: 'Deal', ' ': 'Deal' } // ← değişti
   ```

6. En alttaki `loop()` fonksiyonunda `draw()`'dan önce `update()`'i çağır:

   ```js
   function loop() {
     update() // ← yeni
     draw()
     requestAnimationFrame(loop)
   }
   ```

7. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. S'ye basınca krupiye kartlarını yarım saniye arayla
   açmalı. Yeni bir elde ilk iki kartınla D'ye basınca bahis 20 olmalı, bir kart gelmeli ve sıra krupiyeye
   geçmeli. Alttaki kontrollerin hepsi yeşil olmalı. Krupiye hiç kart çekmiyorsa `loop()` içine `update()`'i
   eklediğini kontrol et.

# --tests--

The dealer should draw one card every `DELAY` frames, and you cannot hit meanwhile.
tr: Krupiye her `DELAY` karede bir kart çekmeli ve bu arada sen kart çekemezsin.

```js
const rig = (...ranks) => {
  deck = Array.from({ length: 20 }, () => card('2', '♣')).concat(ranks.reverse().map((rank) => card(rank, '♠')))
}
rig('K', '7', '10', '4', '2', '3', '9')
deal()
$.press('s')
assert.strictEqual(phase, 'dealer')
assert.lengthOf(dealer, 2)
$.tick(DELAY)
assert.lengthOf(dealer, 3, 'one card every DELAY frames')
$.tick(DELAY - 1)
assert.lengthOf(dealer, 3)
$.tick(1)
assert.lengthOf(dealer, 4)
$.press('h')
assert.lengthOf(player, 2, 'no hitting while the dealer draws')
$.tick(DELAY)
assert.strictEqual(phase, 'done')
assert.strictEqual(message, 'Dealer wins')
```

Doubling should double the bet, give exactly one card and pay double.
tr: İkiye katlamak bahsi ikiye katlamalı, tam bir kart vermeli ve iki kat ödemeli.

```js
const rig = (...ranks) => {
  deck = Array.from({ length: 20 }, () => card('2', '♣')).concat(ranks.reverse().map((rank) => card(rank, '♠')))
}
bank = 100
rig('6', '5', '10', '7', '9')
deal()
$.press('d')
assert.lengthOf(player, 3, 'exactly one more card')
assert.strictEqual(bet, 20)
assert.strictEqual(bank, 80)
assert.strictEqual(phase, 'dealer')
while (phase === 'dealer') $.tick(1)
assert.strictEqual(message, 'You win')
assert.strictEqual(bank, 120)
```

Doubling should only be allowed on the first two cards and with enough chips.
tr: İkiye katlamaya yalnızca ilk iki kartta ve yeterli fişle izin verilmeli.

```js
const rig = (...ranks) => {
  deck = Array.from({ length: 20 }, () => card('2', '♣')).concat(ranks.reverse().map((rank) => card(rank, '♠')))
}
bank = 100
rig('2', '3', '10', '7', '4')
deal()
hit()
double()
assert.strictEqual(bet, 10, 'only on the first two cards')
bank = 5
rig('6', '5', '10', '7', '9')
deal()
bank = 5
double()
assert.strictEqual(bet, 10, 'not without enough chips')
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
const DELAY = 30 // frames between the dealer's cards

let deck
let player
let dealer
let phase // 'player' (your turn), 'dealer' (the dealer draws) or 'done' (the round is over)
let message
let bank
let bet
let timer

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
  phase = 'dealer'
  timer = DELAY
}

// Double the bet, take exactly one more card, and stand.
function double() {
  if (phase !== 'player' || player.length !== 2 || bank < bet) return
  bank -= bet
  bet *= 2
  player.push(nextCard())
  if (handValue(player) > 21) finish()
  else stand()
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

function update() {
  if (phase !== 'dealer') return
  timer -= 1
  if (timer > 0) return
  // The dealer has no choice: draw below 17, stand on 17 or more.
  if (handValue(dealer) < 17) {
    dealer.push(nextCard())
    timer = DELAY
  } else finish()
}

function press(button) {
  if (button === 'Hit') hit()
  else if (button === 'Stand') stand()
  else if (button === 'Double') double()
  else if (button === 'Deal' && phase === 'done') deal()
}

document.addEventListener('keydown', (event) => {
  const keys = { h: 'Hit', s: 'Stand', d: 'Double', n: 'Deal', ' ': 'Deal' }
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
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
