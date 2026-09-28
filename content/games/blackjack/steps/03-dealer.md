---
title: The dealer's turn
title_tr: Krupiyenin sırası
skills: [game.state, prog.loops]
---

# --explanation--

When you are happy with your hand you **stand** (S). Then it is the dealer's turn, and the dealer has **no choices at all**.
Casino rules fix them: draw while below 17, stand on 17 or more. That is one `while` loop:

```js
while (handValue(dealer) < 17) dealer.push(nextCard())
```

This rule is also where the house gets its edge. You play first, so if you bust you lose, **even if the dealer would have
busted too**.

Until you stand, the dealer's second card is **face down**. Otherwise you would know exactly what you are playing against. So
while `phase === 'player'`, that card is drawn hidden and the dealer's total only counts the card you can see.

Then the hands are compared: you bust, the dealer busts, the higher total wins, and equal totals are a **push** (a draw).

One small kindness: when you hit to exactly 21, nothing can get better, so the game stands for you.

# --explanation-tr--

**Bu adımda:** eli bitirmek için **durabileceksin** (S tuşu). Krupiyenin ikinci kartı sen durana kadar mavi arka
yüzüyle kapalı kalacak; durunca açılacak, krupiye kurala göre kart çekecek ve ortada kimin kazandığı yazacak.

**Krupiyenin hiç seçeneği yok.** Kumarhane kuralı sabittir: toplam 17'nin altındaysa kart çek, 17 ya da üstündeyse
dur. Bu tek bir `while` döngüsüdür (2. adımda görmüştük: koşul doğru olduğu sürece tekrarla):

```js
while (handValue(dealer) < 17) dealer.push(nextCard())
```

Kumarhanenin avantajı da buradan gelir: önce sen oynarsın; batarsan kaybedersin, **krupiye de batacak olsa bile**.

**Gizli kart.** Sen durana kadar krupiyenin ikinci kartı ters durur; yoksa neye karşı oynadığını tam bilirdin.
`phase === 'player'` iken o kartı gizli çizeriz ve krupiyenin toplamında sadece açık kartı sayarız:

```js
const hide = phase === 'player'   // true ya da false
handValue([dealer[0]])            // yalnızca ilk karttan oluşan bir elin değeri
```

`dealer[0]` listenin ilk elemanıdır (numaralar 0'dan başlar). Onu `[ ]` içine alınca tek kartlık yeni bir liste
olur; `handValue` bir liste beklediği için böyle veririz. 1. adımda yazdığımız `drawHand`'in `hideSecond`
parametresi şimdi işe yarıyor: `hide` doğruysa ikinci kart arka yüzüyle çizilir.

**Sonucu bulmak.** Eller sırayla karşılaştırılır; ilk doğru olan koşul kazanır. Uzun bir `else if` zinciri bunu
yapar:

```js
if (p > 21) message = 'Bust!'                       // sen battın
else if (d > 21) message = 'Dealer busts, you win'  // krupiye battı
else if (p > d) message = 'You win'                 // senin toplamın büyük
else if (p < d) message = 'Dealer wins'             // krupiyeninki büyük
else message = 'Push'                               // eşit: berabere
```

`p` ve `d` kısa adlar: senin (player) ve krupiyenin (dealer) toplamı. Sıra önemli: batma kontrolleri önce gelir.

**Küçük bir kolaylık.** Kart çekip tam 21 yaptıysan daha iyisi olamaz; oyun senin yerine durur.

# --task--

1. Write `stand()`: only in `'player'`; the dealer draws while below 17, then `finish()`.
2. `finish()` compares the hands and sets `message`: `'Bust!'` (you are over 21), `'Dealer busts, you win'`, `'You win'`,
   `'Dealer wins'` or `'Push'`.
3. `hit()` stands by itself when your total is exactly 21. The S key presses `'Stand'`.
4. While `phase === 'player'`, draw the dealer's second card hidden and show `Dealer` with the value of the first card only.

# --task-tr--

1. `hit()` fonksiyonunun sonuna 21 kontrolünü ekle, altına da `stand()` fonksiyonunu yaz:

   ```js
   function hit() {
     if (phase !== 'player') return
     player.push(nextCard())
     if (handValue(player) > 21) finish()
     else if (handValue(player) === 21) stand() // ← yeni
   }

   function stand() {
     if (phase !== 'player') return
     // The dealer has no choice: draw below 17, stand on 17 or more.
     while (handValue(dealer) < 17) dealer.push(nextCard())
     finish()
   }
   ```

2. `finish()` fonksiyonunu tamamen şununla değiştir:

   ```js
   // Compare the hands.
   function finish() {
     phase = 'done'
     const p = handValue(player)
     const d = handValue(dealer)
     if (p > 21) message = 'Bust!'
     else if (d > 21) message = 'Dealer busts, you win'
     else if (p > d) message = 'You win'
     else if (p < d) message = 'Dealer wins'
     else message = 'Push'
   }
   ```

3. `press()` fonksiyonuna `'Stand'` düğmesini, klavye sözlüğüne de `s` tuşunu ekle:

   ```js
   function press(button) {
     if (button === 'Hit') hit()
     else if (button === 'Stand') stand() // ← yeni
     else if (button === 'Deal' && phase === 'done') deal()
   }
   ```

   ```js
     const keys = { h: 'Hit', s: 'Stand', n: 'Deal', ' ': 'Deal' } // ← değişti
   ```

4. `draw()` fonksiyonunda iki `drawHand` satırının üstüne `hide` satırını ekle, krupiyeninkini değiştir; krupiye
   toplamını yazan satırı da değiştir:

   ```js
     const hide = phase === 'player'   // ← yeni
     drawHand(dealer, DEALER_Y, hide)  // ← değişti
     drawHand(player, PLAYER_Y, false)

     ctx.fillStyle = 'white'
     ctx.font = 'bold 16px sans-serif'
     ctx.textAlign = 'left'
     ctx.fillText('Dealer ' + (hide ? handValue([dealer[0]]) : handValue(dealer)), 20, DEALER_Y - 10) // ← değişti
     ctx.fillText('You ' + handValue(player), 20, PLAYER_Y - 10)
   ```

   Parantez içindeki `hide ? ... : ...` önce hesaplanır, sonra `'Dealer '` yazısına eklenir.

5. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. Krupiyenin ikinci kartı mavi ve kapalı olmalı; S'ye basınca
   açılmalı, krupiye gerekirse kart çekmeli ve sonuç yazmalı. N ya da Boşluk yeni el dağıtır. Alttaki kontrollerin
   hepsi yeşil olmalı. Mesaj testleri kırmızıysa yazıları (ör. `'Dealer busts, you win'`) virgülüyle aynen yaz.

# --tests--

The dealer's second card should stay hidden until you stand; then the dealer should draw up to 17.
tr: Krupiyenin ikinci kartı sen durana kadar gizli kalmalı; sonra krupiye 17'ye kadar çekmeli.

```js
const rig = (...ranks) => {
  deck = Array.from({ length: 20 }, () => card('2', '♣')).concat(ranks.reverse().map((rank) => card(rank, '♠')))
}
rig('K', '8', '10', '6', '3', '5')
deal()
$.tick(1)
assert.lengthOf($.rects('#1d4ed8'), 1, 'the dealer\'s second card is face down')
assert.include($.texts(), 'Dealer 10')
$.press('s')
assert.strictEqual(phase, 'done')
assert.lengthOf(dealer, 3, 'the dealer draws below 17 and stops on 19')
assert.strictEqual(message, 'Dealer wins')
$.tick(1)
assert.lengthOf($.rects('#1d4ed8'), 0, 'the card is turned over')
assert.include($.texts(), 'Dealer 19')
```

The hands should be compared: dealer bust, push, and a win; the dealer stands on 17.
tr: Eller karşılaştırılmalı: krupiye batar, berabere ve kazanç; krupiye 17'de durur.

```js
const rig = (...ranks) => {
  deck = Array.from({ length: 20 }, () => card('2', '♣')).concat(ranks.reverse().map((rank) => card(rank, '♠')))
}
rig('K', '9', '10', '6', 'Q')
deal()
stand()
assert.strictEqual(message, 'Dealer busts, you win')
rig('K', '8', '10', '8')
deal()
stand()
assert.strictEqual(message, 'Push')
rig('K', '8', '10', '7')
deal()
stand()
assert.strictEqual(message, 'You win')
assert.lengthOf(dealer, 2, 'the dealer stands on 17')
```

Reaching 21 should stand by itself.
tr: 21'e ulaşmak kendiliğinden durmalı.

```js
const rig = (...ranks) => {
  deck = Array.from({ length: 20 }, () => card('2', '♣')).concat(ranks.reverse().map((rank) => card(rank, '♠')))
}
rig('5', '6', '10', '7', 'K')
deal()
$.press('h')
assert.strictEqual(handValue(player), 21)
assert.strictEqual(phase, 'done', 'reaching 21 stands by itself')
assert.strictEqual(message, 'You win')
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
  else if (handValue(player) === 21) stand()
}

function stand() {
  if (phase !== 'player') return
  // The dealer has no choice: draw below 17, stand on 17 or more.
  while (handValue(dealer) < 17) dealer.push(nextCard())
  finish()
}

// Compare the hands.
function finish() {
  phase = 'done'
  const p = handValue(player)
  const d = handValue(dealer)
  if (p > 21) message = 'Bust!'
  else if (d > 21) message = 'Dealer busts, you win'
  else if (p > d) message = 'You win'
  else if (p < d) message = 'Dealer wins'
  else message = 'Push'
}

function reset() {
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
