---
title: Buttons and a record
title_tr: Düğmeler ve bir rekor
skills: [game.input, game.state]
---

# --explanation--

Card games are natural on a phone, but a phone has no H or S key. So the table gets four buttons: **Hit, Stand, Double,
Deal**. Because every key already goes through `press(button)`, the buttons only have to work out which one was touched and
call the same function. The rules stay in one place.

A button that cannot be used right now is drawn **dimmed**: Deal during a round, Hit and Stand after it, Double after the
third card. It is the same condition the game checks anyway, used a second time to tell the player what is possible. Good
interfaces show what you can do instead of letting you find out by pressing.

Finally, the highest number of chips you ever held is kept in `localStorage` as your record.

# --explanation-tr--

**Bu adımda:** masanın altına dört düğme gelecek: **Hit, Stand, Double, Deal**. Telefonda da parmakla oynanabilecek.
O an kullanılamayan düğmeler soluk yeşil görünecek. Sağ üstte de şimdiye kadarki en yüksek fiş sayın (`Best`)
yazacak.

**Tek yerden kurallar.** Telefonda H ya da S tuşu yok. Neyse ki her tuş zaten `press(button)` üzerinden geçiyor.
Düğmeler de yalnızca hangisine dokunulduğunu bulup aynı `press`'i çağıracak. Kurallar tek yerde kalır.

**Düğme şeridi.** Canvas'ın alt kısmı (`y` 404 ve aşağısı) düğme şeridi. Genişlik dört eşit parçaya bölünür:
`BUTTON_W = 480 / 4 = 120`. Tıklanan yerin `x`'ini 120'ye bölüp aşağı yuvarlarsak düğmenin sırasını buluruz:
`x = 300` → `300 / 120 = 2,5` → `2` → `BUTTONS[2]` = `'Double'`.

**Tıklanan noktayı bulmak.** Tarayıcı tıklamanın konumunu **sayfaya göre** verir (`event.clientX`, `event.clientY`).
Canvas sayfada bir yerde ve ekranda küçültülmüş olabilir. `canvas.getBoundingClientRect()` canvas'ın sayfadaki
yerini ve ekrandaki boyunu verir; ondan canvas içindeki gerçek koordinatı hesaplarız:

```js
const x = ((event.clientX - rect.left) * canvas.width) / rect.width
```

"Canvas'ın sol kenarından ne kadar sağdayım, bunu ekrandaki boydan canvas'ın gerçek boyuna çevir." `y` de aynı.

**Soluk düğmeler.** Bir düğme kullanılamıyorsa soluk çizilir: el sürerken Deal, el bitince Hit ve Stand, üçüncü
karttan sonra Double. Bu, oyunun zaten kontrol ettiği koşulun ikinci kez, oyuncuya "ne yapabilirsin" demek için
kullanılmasıdır. İyi bir arayüz, basıp denemeni beklemek yerine neyin mümkün olduğunu gösterir.

```js
const active = label === 'Deal' ? phase === 'done' : phase === 'player' && (label !== 'Double' || player.length === 2)
```

"Deal ise: el bittiyse etkin. Değilse: senin sıransa **ve** (Double değilse **ya da** elinde 2 kart varsa) etkin."

**Rekor (`localStorage`).** Tarayıcının sayfa kapansa da hatırladığı küçük bir defter. `localStorage.setItem(ad,
değer)` yazar, `getItem(ad)` okur (yazı olarak ya da hiç yoksa `null`). `Number(...)` sayıya çevirir; kayıt yoksa
`|| START` ile 100'den başlarız (`a || b`: `a` boş ya da sıfırsa `b`).

# --task--

1. Add `BAR_Y = 404`, `BUTTONS = ['Hit', 'Stand', 'Double', 'Deal']` and `BUTTON_W = canvas.width / BUTTONS.length`.
2. A `pointerdown` at or below `BAR_Y` presses the button under it.
3. Draw each button 6 pixels in from its sides, 44 high: `'#f8fafc'` when it can be used, otherwise `'#4b7a5a'`, with its
   label in `'#14532d'`, `'bold 18px sans-serif'`, centered at `BAR_Y + 29`. Deal can be used when `'done'`; the others in
   `'player'`, and Double only with two cards.
4. Keep `best` in `localStorage` under `'blackjack-best'` (starting at `START`); save it in `finish()` when `bank` beats it.
   Draw `Best 115` right-aligned at `(canvas.width - 20, 28)`.

# --task-tr--

1. `const DELAY = 30 ...` satırının hemen **altına** düğme ayarlarını ekle:

   ```js
   const BAR_Y = 404
   const BUTTONS = ['Hit', 'Stand', 'Double', 'Deal']
   const BUTTON_W = canvas.width / BUTTONS.length
   ```

2. `let timer` satırının hemen **altına** rekoru ekle:

   ```js
   let best = Number(localStorage.getItem('blackjack-best')) || START
   ```

3. `finish()` fonksiyonunda `bank += paid` satırı ile `if (bank < BET) ...` satırının **arasına** rekoru
   kaydeden kısmı ekle:

   ```js
     bank += paid
     if (bank > best) {                               // ← yeni
       best = bank                                    // ← yeni
       localStorage.setItem('blackjack-best', best)   // ← yeni
     }                                                // ← yeni
     if (bank < BET) message += ' - out of chips!'
   ```

4. Klavye dinleyicisinin (`document.addEventListener('keydown', ...)`) kapanan `})`'sinin altına bir satır boşluk
   bırakıp dokunma dinleyicisini yaz:

   ```js
   canvas.addEventListener('pointerdown', (event) => {
     const rect = canvas.getBoundingClientRect()
     const x = ((event.clientX - rect.left) * canvas.width) / rect.width
     const y = ((event.clientY - rect.top) * canvas.height) / rect.height
     if (y >= BAR_Y) press(BUTTONS[Math.floor(x / BUTTON_W)])
   })
   ```

   `pointerdown` fareyle tıklamada da parmakla dokunmada da gelir.

5. `draw()` fonksiyonunda `ctx.fillText('Chips ' + ...)` satırının hemen **altına** rekor yazısını ekle:

   ```js
     ctx.textAlign = 'right'
     ctx.fillText('Best ' + best, canvas.width - 20, 28)
   ```

6. `draw()` fonksiyonunun en sonuna, `if (message) { ... }` bloğunun kapanan `}`'sinden sonra ve fonksiyonun
   kapanan `}`'sinden önce düğmeleri çizen kısmı ekle:

   ```js
     BUTTONS.forEach((label, i) => {
       const active = label === 'Deal' ? phase === 'done' : phase === 'player' && (label !== 'Double' || player.length === 2)
       ctx.fillStyle = active ? '#f8fafc' : '#4b7a5a'
       ctx.fillRect(i * BUTTON_W + 6, BAR_Y, BUTTON_W - 12, 44)
       ctx.fillStyle = '#14532d'
       ctx.font = 'bold 18px sans-serif'
       ctx.textAlign = 'center'
       ctx.fillText(label, i * BUTTON_W + BUTTON_W / 2, BAR_Y + 29)
     })
   ```

   Her düğme kendi bölmesinin iki yanından 6 piksel içeride, 44 piksel yüksekliğinde; yazısı bölmenin ortasında.

7. **Çalıştır**'a bas. Altta dört düğme görmelisin; el başında Deal soluk olmalı. Düğmelere tıklayarak oyna; sağ
   üstteki `Best` fişin rekoru geçince artmalı. Alttaki kontrollerin hepsi yeşil olmalı. Düğmeler yanlış işi
   yapıyorsa `BUTTONS` listesinin sırasını kontrol et: `'Hit', 'Stand', 'Double', 'Deal'`.

# --tests--

Each button should do the same as its key.
tr: Her düğme kendi tuşuyla aynı işi yapmalı.

```js
const rig = (...ranks) => {
  deck = Array.from({ length: 20 }, () => card('2', '♣')).concat(ranks.reverse().map((rank) => card(rank, '♠')))
}
rig('K', '6', '10', '7', '2', '9', '2', '10', '8', '10')
deal()
$.click(60, 426)
assert.lengthOf(player, 3, 'Hit')
$.click(180, 426)
assert.strictEqual(phase, 'dealer', 'Stand')
while (phase === 'dealer') $.tick(1)
$.click(420, 426)
assert.strictEqual(phase, 'player', 'Deal')
$.click(300, 426)
assert.lengthOf(player, 3, 'Double')
assert.strictEqual(bet, 20)
```

Buttons that cannot be used should be dimmed.
tr: Kullanılamayan düğmeler soluk olmalı.

```js
const rig = (...ranks) => {
  deck = Array.from({ length: 20 }, () => card('2', '♣')).concat(ranks.reverse().map((rank) => card(rank, '♠')))
}
rig('K', '6', '10', '7')
deal()
$.tick(1)
for (const label of ['Hit', 'Stand', 'Double', 'Deal']) assert.include($.texts(), label)
assert.lengthOf($.rects('#f8fafc'), 3, 'Hit, Stand and Double can be used')
assert.lengthOf($.rects('#4b7a5a'), 1, 'Deal cannot yet')
```

The most chips you ever had should be saved as your best.
tr: Sahip olduğun en çok fiş en iyin olarak kaydedilmeli.

```js
const rig = (...ranks) => {
  deck = Array.from({ length: 20 }, () => card('2', '♣')).concat(ranks.reverse().map((rank) => card(rank, '♠')))
}
assert.strictEqual(best, 100)
bank = 100
rig('A', 'K', '10', '7')
deal()
assert.strictEqual(best, 115)
assert.strictEqual(localStorage.getItem('blackjack-best'), '115')
$.tick(1)
assert.include($.texts(), 'Best 115')
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
const BAR_Y = 404
const BUTTONS = ['Hit', 'Stand', 'Double', 'Deal']
const BUTTON_W = canvas.width / BUTTONS.length

let deck
let player
let dealer
let phase // 'player' (your turn), 'dealer' (the dealer draws) or 'done' (the round is over)
let message
let bank
let bet
let timer
let best = Number(localStorage.getItem('blackjack-best')) || START

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
  if (bank > best) {
    best = bank
    localStorage.setItem('blackjack-best', best)
  }
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

canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height
  if (y >= BAR_Y) press(BUTTONS[Math.floor(x / BUTTON_W)])
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
  ctx.textAlign = 'right'
  ctx.fillText('Best ' + best, canvas.width - 20, 28)

  if (message) {
    ctx.fillStyle = '#fde047'
    ctx.font = 'bold 22px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(message, canvas.width / 2, 212)
  }

  BUTTONS.forEach((label, i) => {
    const active = label === 'Deal' ? phase === 'done' : phase === 'player' && (label !== 'Double' || player.length === 2)
    ctx.fillStyle = active ? '#f8fafc' : '#4b7a5a'
    ctx.fillRect(i * BUTTON_W + 6, BAR_Y, BUTTON_W - 12, 44)
    ctx.fillStyle = '#14532d'
    ctx.font = 'bold 18px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, i * BUTTON_W + BUTTON_W / 2, BAR_Y + 29)
  })
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
