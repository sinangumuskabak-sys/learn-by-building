---
title: A 30-second round
title_tr: 30 saniyelik tur
skills: [game.state, game.loop]
---

# --explanation--

Right now the game never ends, and it starts before the player is ready. Give it a shape: a **round** that starts on
the first click and lasts 30 seconds.

The same timestamp idea works for the whole round: when it starts, remember **when it ends**:

```js
endsAt = now + ROUND   // ROUND = 30000 ms
```

Then "how long is left?" is `endsAt - now`, and "is it over?" is `now >= endsAt`. To show whole seconds, round **up**
with `Math.ceil`, so the display says `1` during the last second instead of `0`:

```
remaining 29 400 ms  →  "30"      remaining 400 ms  →  "1"
```

The states are the familiar trio: `'ready'` (waiting for a click), `'playing'`, `'over'` (show the result; the next
click starts again). Starting a round resets everything it needs: score, timer, schedule, and all moles down, all in
one `start()` function.

# --explanation-tr--

**Bu adımda:** oyuna bir başı ve sonu olan **tur** ekleyeceğiz. Açılışta ortada `Click to start` yazar; tıklayınca
30 saniyelik tur başlar ve sağ üstte `Time: 30`'dan geri sayım görünür. Süre bitince `Time's up!` ve skorun çıkar;
bir tıklama yeni tur başlatır.

**Turun sonunu saklamak.** Köstebeklerde kullandığımız "ne zamana kadar?" fikri bütün tur için de işler. Tur
başlarken **ne zaman biteceğini** hatırlarız:

```js
endsAt = now + ROUND   // ROUND = 30000 ms, yani 30 saniye
```

Sonra "ne kadar kaldı?" `endsAt - now`, "bitti mi?" ise `now >= endsAt` olur. Kalanı tam saniye göstermek için
1000'e böleriz ve `Math.ceil` ile **yukarı** yuvarlarız; böylece son saniyede ekranda `0` değil `1` yazar:

```
kalan 29 400 ms  →  "30"      kalan 400 ms  →  "1"
```

**Üç durum.** Oyunun hangi aşamada olduğunu `state` değişkeninde bir yazı olarak tutarız: `'ready'` (tıklama
bekleniyor), `'playing'` (oynanıyor), `'over'` (bitti, sonucu göster; sonraki tıklama yeniden başlatır). `===`
"eşit mi?", `!==` "eşit değil mi?" demektir.

**Her şeyi sıfırlayan tek fonksiyon.** `start()` bir turun ihtiyacı olan her şeyi baştan kurar: durum, skor, bitiş
zamanı, ilk köstebeğin zamanı ve bütün köstebeklerin inmesi. `for (const hole of holes) hole.upUntil = 0` → her delik
için tek satırlık bir döngü; tek komut olduğu için süslü parantez gerekmez.

**`return` ile erken çıkış.** `if (state !== 'playing') return` → "oyun sürmüyorsa fonksiyondan hemen çık, aşağıyı
çalıştırma". Tıklamada da aynısı: oyun sürmüyorsa `start()` de ve çık; vurma kodu çalışmasın.

**Yazıları hizalamak.** `ctx.textAlign = 'right'` yazının **sağ ucunu** verilen noktaya koyar (sağ kenardan 12
piksel içeride durur); `'center'` ortasını koyar. `"Time's up!"` yazısında kesme işareti (`'`) olduğu için bu yazıyı
**çift tırnakla** yazarız; yoksa bilgisayar yazının orada bittiğini sanar. `'rgba(0, 0, 0, 0.6)'` yarı saydam siyahtır
(son sayı saydamlık: 0 görünmez, 1 tam dolu); yazıların arkasına bir şerit çeker.

# --task--

1. Add `const ROUND = 30000`, `let state = 'ready'` and `let endsAt = 0`.
2. Write `function start()`: set `state = 'playing'`, `score = 0`, `endsAt = now + ROUND`, `nextPop = now`, and put
   every mole down (`upUntil = 0`).
3. In the `pointerdown` handler: if not playing, `start()` and stop there; otherwise whack as before.
4. In `update()`: do nothing unless playing. If `now >= endsAt`, set `state = 'over'`, put every mole down, and stop.
5. Draw the seconds left, `Math.ceil((endsAt - now) / 1000)`, as `Time: 30` right-aligned at
   `(canvas.width - 12, 28)` while playing. Show `Click to start` in the middle when ready, and `Time's up!`,
   `Score: 12` and `Click to play again` when over.

# --task-tr--

1. `const HOLE_R = 40` satırının hemen altına ekle:

   ```js
   const ROUND = 30000 // a round lasts 30 seconds
   ```

2. `let score = 0` satırının hemen altına ekle:

   ```js
   let state = 'ready' // 'ready', 'playing' or 'over'
   let endsAt = 0
   ```

3. `holeAt` fonksiyonunun kapanış `}`'sinden sonra, `canvas.addEventListener('pointerdown', ...` satırından önce
   `start`'ı ekle:

   ```js
   function start() {
     state = 'playing'
     score = 0
     endsAt = now + ROUND
     nextPop = now
     for (const hole of holes) hole.upUntil = 0
   }

   ```

4. `pointerdown` dinleyicisinin **en başına**, `(event) => {` satırının hemen altına ekle:

   ```js
     if (state !== 'playing') {
       start()
       return
     }
   ```

5. `update()` fonksiyonunun **en başına**, `function update() {` satırının hemen altına ekle:

   ```js
     if (state !== 'playing') return
     if (now >= endsAt) {
       state = 'over'
       for (const hole of holes) hole.upUntil = 0
       return
     }
   ```

6. `draw()` içinde `ctx.fillText('Score: ' + score, 12, 28)` satırının altına, fonksiyonun kapanış `}`'sinden önce
   şunu ekle:

   ```js
     if (state === 'playing') {
       ctx.textAlign = 'right'
       ctx.fillText('Time: ' + Math.ceil((endsAt - now) / 1000), canvas.width - 12, 28)
     }

     ctx.textAlign = 'center'
     if (state === 'ready') ctx.fillText('Click to start', canvas.width / 2, canvas.height / 2)
     if (state === 'over') {
       ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
       ctx.fillRect(0, 150, canvas.width, 130)
       ctx.fillStyle = 'white'
       ctx.font = 'bold 30px sans-serif'
       ctx.fillText("Time's up!", canvas.width / 2, 190)
       ctx.font = '20px sans-serif'
       ctx.fillText('Score: ' + score, canvas.width / 2, 225)
       ctx.font = '16px sans-serif'
       ctx.fillText('Click to play again', canvas.width / 2, 260)
     }
   ```

7. **Çalıştır**'a bas. Ortada `Click to start` görmelisin ve hiç köstebek çıkmamalı. Oynamak için oyuna tıkla: tur
   başlar, sağ üstte süre geri sayar; 30 saniye sonra `Time's up!` çıkar. Alttaki kontrollerin hepsi yeşil olmalı.
   Süre kontrolü kırmızıysa `Math.floor` değil `Math.ceil` yazdığından emin ol.

# --tests--

Nothing should happen until the first click.
tr: İlk tıklamaya kadar hiçbir şey olmamalı.

```js
assert.strictEqual(ROUND, 30000)
$.run(2)
assert.strictEqual(state, 'ready')
assert.strictEqual(holes.filter(isUp).length, 0)
assert.include($.texts(), 'Click to start')
```

The first click should start a 30-second round.
tr: İlk tıklama 30 saniyelik bir tur başlatmalı.

```js
$.run(1)
$.pointerDown(180, 220)
assert.strictEqual(state, 'playing')
assert.closeTo(endsAt - now, 30000, 1)
assert.strictEqual(score, 0)
$.tick()
assert.strictEqual(holes.filter(isUp).length, 1)
assert.include($.texts(), 'Time: 30')
```

The timer should count down in whole seconds, rounded up.
tr: Süre tam saniyelerle, yukarı yuvarlanarak geri saymalı.

```js
$.pointerDown(180, 220)
$.run(29.5)
assert.include($.texts(), 'Time: 1')
```

When time runs out, the round should end and the moles should go down.
tr: Süre bitince tur bitmeli ve köstebekler inmeli.

```js
$.pointerDown(180, 220)
score = 12
$.run(30.1)
assert.strictEqual(state, 'over')
assert.strictEqual(holes.filter(isUp).length, 0)
assert.includeMembers($.texts(), ["Time's up!", 'Score: 12'])
$.run(2)
assert.strictEqual(holes.filter(isUp).length, 0, 'no new moles after the round')
```

Clicking after the round should start a new one from zero.
tr: Turdan sonra tıklamak sıfırdan yeni bir tur başlatmalı.

```js
$.pointerDown(180, 220)
score = 5
$.run(31)
$.pointerDown(180, 220)
assert.strictEqual(state, 'playing')
assert.strictEqual(score, 0)
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

function isUp(hole) {
  return now < hole.upUntil
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
  }
})

function update() {
  if (state !== 'playing') return
  if (now >= endsAt) {
    state = 'over'
    for (const hole of holes) hole.upUntil = 0
    return
  }
  if (now >= nextPop) {
    const empty = holes.filter((hole) => !isUp(hole))
    if (empty.length > 0) {
      const hole = empty[Math.floor(Math.random() * empty.length)]
      hole.upUntil = now + 1000
    }
    nextPop = now + 700
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

  ctx.fillStyle = 'white'
  ctx.font = 'bold 20px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Score: ' + score, 12, 28)
  if (state === 'playing') {
    ctx.textAlign = 'right'
    ctx.fillText('Time: ' + Math.ceil((endsAt - now) / 1000), canvas.width - 12, 28)
  }

  ctx.textAlign = 'center'
  if (state === 'ready') ctx.fillText('Click to start', canvas.width / 2, canvas.height / 2)
  if (state === 'over') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
    ctx.fillRect(0, 150, canvas.width, 130)
    ctx.fillStyle = 'white'
    ctx.font = 'bold 30px sans-serif'
    ctx.fillText("Time's up!", canvas.width / 2, 190)
    ctx.font = '20px sans-serif'
    ctx.fillText('Score: ' + score, canvas.width / 2, 225)
    ctx.font = '16px sans-serif'
    ctx.fillText('Click to play again', canvas.width / 2, 260)
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
