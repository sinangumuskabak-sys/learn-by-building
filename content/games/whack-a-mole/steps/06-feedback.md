---
title: Feedback you can see
title_tr: Görünür geri bildirim
skills: [game.state, prog.arrays]
---

# --explanation--

When you hit a mole it just disappears. Did you hit it, or did it hide on its own a split second earlier? Players need
**feedback**: an immediate, visible answer to every action.

A floating `+1` that drifts up and fades out is a classic. Each one is a short-lived object that remembers **when it was
born**:

```js
popups.push({ x: hole.x, y: hole.y - 40, born: now })
```

Everything about it is **computed from its age** (`now - popup.born`) at draw time:

```js
const t = (now - popup.born) / 600    // 0 → 1 over 600 ms
ctx.globalAlpha = 1 - t               // fade out
ctx.fillText('+1', popup.x, popup.y - t * 30)   // drift up 30 px
```

No per-frame bookkeeping, and old popups are simply filtered out once `t` passes 1. Deriving animation from a start time
is the timestamp idea again, and it keeps the animation smooth even if frames are skipped.

# --explanation-tr--

**Bu adımda:** vurduğun her köstebeğin üstünde sarı bir `+1` belirecek, yukarı süzülüp yavaşça solacak. Böylece
vurduğunu hemen anlayacaksın.

**Geri bildirim (feedback).** Şu an köstebeğe vurunca sadece kayboluyor. Vurdun mu, yoksa köstebek bir an önce kendi
mi saklandı? Oyuncu her hareketine anında, gözle görülür bir cevap ister. Süzülen `+1` bunun klasik bir örneğidir.

**Kısa ömürlü nesneler.** Her `+1` bir nesnedir ve **ne zaman doğduğunu** hatırlar:

```js
popups.push({ x: hole.x, y: hole.y - 40, born: now })
```

Deliğin 40 piksel üstünde, `now` anında doğdu. Hepsini `popups` dizisinde tutarız.

**Her şey yaşından hesaplanır.** Çizerken yaşını (`now - p.born`) 600'e böleriz: `t`, 600 ms boyunca 0'dan 1'e çıkar.

```js
const t = (now - p.born) / 600    // 0 → 1
ctx.globalAlpha = 1 - t            // solarak kaybol
ctx.fillText('+1', p.x, p.y - t * 30)   // 30 piksel yukarı süzül
```

`ctx.globalAlpha` bundan sonra çizilen **her şeyin** saydamlığıdır: 1 tam görünür, 0 görünmez. Bu yüzden `+1`'leri
çizdikten sonra onu mutlaka `1`'e geri alırız; yoksa skor yazısı da soluk çizilir.

Kare kare hesap tutmaya gerek yok; bu yine "ne zaman?" diye zaman saklama fikri. Kare atlansa bile animasyon düzgün
kalır.

**Eskileri atmak.** `popups.filter((p) => now - p.born < 600)` → sadece 600 ms'den genç olanları tutan yeni bir liste
yapar; `popups = ...` ile eskisinin yerine koyarız. Bu satırı `update()`'te `'playing'` kontrolünden **önce** yazarız
ki tur bittikten sonra da son `+1`'ler solmayı bitirebilsin.

# --task--

1. Add `let popups = []`, and empty it in `start()`.
2. When a mole is hit, push `{ x: hole.x, y: hole.y - 40, born: now }`.
3. In `update()`, keep only popups younger than 600 ms (`now - p.born < 600`). Do this before the `'playing'` check,
   so popups still finish fading after the round ends.
4. In `draw()`, draw each popup as `+1` in `'#fef08a'`, `'bold 24px sans-serif'`, centered, with
   `t = (now - p.born) / 600`, `globalAlpha = 1 - t` and `y - t * 30`. Reset `globalAlpha` to `1` afterwards.

# --task-tr--

1. `let best = ...` satırının hemen altına ekle:

   ```js
   let popups = [] // floating "+1"s: { x, y, born }
   ```

2. `start()` içinde `nextPop = now` satırının altına ekle:

   ```js
     popups = []
   ```

3. `pointerdown` dinleyicisinde `hole.upUntil = 0` satırının altına ekle:

   ```js
       popups.push({ x: hole.x, y: hole.y - 40, born: now })
   ```

4. `update()` fonksiyonunun **en başına**, `if (state !== 'playing') return` satırının üstüne ekle:

   ```js
     popups = popups.filter((p) => now - p.born < 600)
   ```

5. `draw()` içinde, delik döngüsünü kapatan `}`'den sonra ve `ctx.fillStyle = 'white'` satırından **önce** bir satır
   boşluk bırakıp şunu ekle:

   ```js
     ctx.fillStyle = '#fef08a'
     ctx.font = 'bold 24px sans-serif'
     ctx.textAlign = 'center'
     for (const p of popups) {
       const t = (now - p.born) / 600 // 0 → 1 over the popup's life
       ctx.globalAlpha = 1 - t
       ctx.fillText('+1', p.x, p.y - t * 30)
     }
     ctx.globalAlpha = 1
   ```

6. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla ve bir köstebeğe vur: üstünde sarı bir `+1` yukarı süzülüp
   solmalı. Alttaki kontrollerin hepsi yeşil olmalı. Opaklık kontrolü kırmızıysa döngüden sonraki
   `ctx.globalAlpha = 1` satırını kontrol et.

# --tests--

Hitting a mole should create a `+1` above it.
tr: Bir köstebeğe vurmak onun üstünde bir `+1` oluşturmalı.

```js
$.pointerDown(180, 220)
$.tick()
const hole = holes.find(isUp)
$.pointerDown(hole.x, hole.y)
assert.lengthOf(popups, 1)
assert.deepEqual(popups[0], { x: hole.x, y: hole.y - 40, born: now })
```

The `+1` should drift up, fade out, and disappear after 600 ms.
tr: `+1` yukarı süzülmeli, solmalı ve 600 ms sonra kaybolmalı.

```js
$.pointerDown(180, 220)
popups = [{ x: 100, y: 100, born: now }]
$.run(0.3)
const call = $.screen().find((c) => c.op === 'fillText' && c.args[0] === '+1')
assert.closeTo(call.alpha, 0.5, 0.05)
assert.closeTo(call.args[2], 85, 2)
$.run(0.4)
assert.lengthOf(popups, 0)
const later = $.screen().find((c) => c.op === 'fillText' && c.args[0] === '+1')
assert.isUndefined(later)
```

The opacity should be reset for everything drawn afterwards.
tr: Sonra çizilen her şey için opaklık sıfırlanmalı.

```js
$.pointerDown(180, 220)
popups = [{ x: 100, y: 100, born: now }]
$.run(0.3)
const calls = $.screen()
const index = calls.findIndex((c) => c.op === 'fillText' && c.args[0] === '+1')
assert.isTrue(calls.slice(index + 1).every((c) => c.alpha === 1))
```

# --solution--

```js
// Whack-a-mole, step by step.
// The page already has <canvas id="game" width="360" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SIZE = 3 // holes per row and per column
const CELL = 120
const TOP = 40 // room for the score and timer
const HOLE_R = 40
const ROUND = 30000 // a round lasts 30 seconds

const holes = []
for (let row = 0; row < SIZE; row++) {
  for (let col = 0; col < SIZE; col++) {
    holes.push({ x: col * CELL + CELL / 2, y: TOP + row * CELL + CELL / 2, upUntil: 0 })
  }
}

let now = 0 // time of the current frame, in ms
let nextPop = 0 // when the next mole pops up
let score = 0
let state = 'ready' // 'ready', 'playing' or 'over'
let endsAt = 0
let best = Number(localStorage.getItem('mole-best')) || 0
let popups = [] // floating "+1"s: { x, y, born }

function isUp(hole) {
  return now < hole.upUntil
}

// 0 when the round starts, 1 when it ends.
function progress() {
  return Math.min(1, Math.max(0, 1 - (endsAt - now) / ROUND))
}

// Linear interpolation from the easy value to the hard value as the round goes on.
function upTime() {
  return 1000 - 500 * progress()
}

function popGap() {
  return 700 - 350 * progress()
}

function holeAt(x, y) {
  return holes.find((hole) => {
    const dx = x - hole.x
    const dy = y - hole.y
    return dx * dx + dy * dy <= HOLE_R * HOLE_R
  })
}

function start() {
  state = 'playing'
  score = 0
  endsAt = now + ROUND
  nextPop = now
  popups = []
  for (const hole of holes) hole.upUntil = 0
}

canvas.addEventListener('pointerdown', (event) => {
  if (state !== 'playing') {
    start()
    return
  }
  // The canvas may be displayed at a different size than its own pixels, so scale the pointer.
  const rect = canvas.getBoundingClientRect()
  const x = (event.clientX - rect.left) * (canvas.width / rect.width)
  const y = (event.clientY - rect.top) * (canvas.height / rect.height)
  const hole = holeAt(x, y)
  if (hole && isUp(hole)) {
    score += 1
    hole.upUntil = 0
    popups.push({ x: hole.x, y: hole.y - 40, born: now })
  }
})

function update() {
  popups = popups.filter((p) => now - p.born < 600)
  if (state !== 'playing') return
  if (now >= endsAt) {
    state = 'over'
    for (const hole of holes) hole.upUntil = 0
    if (score > best) {
      best = score
      localStorage.setItem('mole-best', best)
    }
    return
  }
  if (now >= nextPop) {
    const empty = holes.filter((hole) => !isUp(hole))
    if (empty.length > 0) {
      const hole = empty[Math.floor(Math.random() * empty.length)]
      hole.upUntil = now + upTime()
    }
    nextPop = now + popGap()
  }
}

function draw() {
  ctx.fillStyle = '#65a30d'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (const hole of holes) {
    ctx.fillStyle = '#3f2d1d'
    ctx.beginPath()
    ctx.arc(hole.x, hole.y, HOLE_R, 0, Math.PI * 2)
    ctx.fill()
    if (isUp(hole)) {
      ctx.fillStyle = '#92400e'
      ctx.beginPath()
      ctx.arc(hole.x, hole.y, 32, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  ctx.fillStyle = '#fef08a'
  ctx.font = 'bold 24px sans-serif'
  ctx.textAlign = 'center'
  for (const p of popups) {
    const t = (now - p.born) / 600 // 0 → 1 over the popup's life
    ctx.globalAlpha = 1 - t
    ctx.fillText('+1', p.x, p.y - t * 30)
  }
  ctx.globalAlpha = 1

  ctx.fillStyle = 'white'
  ctx.font = 'bold 20px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Score: ' + score, 12, 28)
  if (state === 'playing') {
    ctx.textAlign = 'right'
    ctx.fillText('Time: ' + Math.ceil((endsAt - now) / 1000), canvas.width - 12, 28)
  }

  ctx.textAlign = 'center'
  if (state === 'ready') {
    ctx.fillText('Click to start', canvas.width / 2, canvas.height / 2)
    ctx.font = '16px sans-serif'
    ctx.fillText('Best: ' + best, canvas.width / 2, canvas.height / 2 + 28)
  }
  if (state === 'over') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
    ctx.fillRect(0, 150, canvas.width, 150)
    ctx.fillStyle = 'white'
    ctx.font = 'bold 30px sans-serif'
    ctx.fillText("Time's up!", canvas.width / 2, 190)
    ctx.font = '20px sans-serif'
    ctx.fillText('Score: ' + score, canvas.width / 2, 225)
    ctx.font = '16px sans-serif'
    ctx.fillText('Best: ' + best, canvas.width / 2, 252)
    ctx.fillText('Click to play again', canvas.width / 2, 282)
  }
}

function loop(time) {
  now = time
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
