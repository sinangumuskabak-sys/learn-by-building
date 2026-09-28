---
title: Riding logs
title_tr: Kütüklere binmek
skills: [game.collision, game.physics]
---

# --explanation--

The river flips the road's rule around: on the road, touching a car kills you; in the river, **not** touching a log
kills you. Log lanes use exactly the same lane objects and the same `items()` function, with `log: true`, which is the
payoff of describing lanes by numbers.

Standing on a log means **moving with it**. Every frame the frog is carried by the lane's speed:

```js
frog.x += lane.speed
```

Now `frog.x` is no longer a whole number. That is fine while riding, but when the frog hops back onto solid ground it
should **snap** to the grid again with `Math.round`, so the road still lines up tile by tile.

Two more ways to fall in: there is no log under the middle of the frog, or the log carries the frog off the edge of the
screen. Using the frog's **middle** (`x + 0.5`) for "is there a log under me?" is again a forgiving choice: half the frog
may hang over the end of a log.

# --explanation-tr--

**Bu adımda:** nehre kütükler ekleyeceğiz. Beş mavi nehir şeridinde kahverengi kütükler sağa sola akacak. Kurbağa
bir kütüğe zıplarsa onunla birlikte sürüklenecek; suya düşerse ya da kütük onu ekranın dışına taşırsa bir can
gidecek.

**Nehir kuralı tersine çevirir.** Yolda arabaya **değmek** öldürür; nehirde bir kütüğe **değmemek** öldürür.
Kütük şeritleri, yol şeritleriyle tamamen aynı nesneleri ve aynı `items()` fonksiyonunu kullanır; tek fark
`log: true` alanıdır ("bu bir kütük şeridi"). Şeritleri sayılarla tarif etmenin karşılığını şimdi alıyoruz: hiç yeni
hareket kodu yazmıyoruz. Kütük şeritlerinin `color` alanı yok, çünkü hepsi aynı kahverengiyle çizilecek.

**Kütükte durmak = onunla birlikte gitmek.** Her karede kurbağa, şeridin hızı kadar taşınır:

```js
frog.x += lane.speed
```

Artık `frog.x` tam sayı olmayabilir (mesela 5,4). Kütükteyken sorun değil; ama kurbağa sağlam zemine geri zıplayınca
`Math.round` ile ızgaraya yeniden **oturmalı** ki yolda döşeme döşeme hizalı kalsın. `Math.round(sayı)` en yakın tam
sayıya yuvarlar: `4.4` → `4`, `4.6` → `5`.

**Suya düşmenin iki yolu daha.** Kurbağanın ortasının altında kütük yoksa, ya da kütük onu ekranın kenarından
dışarı taşırsa. "Altımda kütük var mı?" sorusu için kurbağanın **ortasını** (`frog.x + 0.5`) kullanmak yine affedici
bir seçim: kurbağanın yarısı kütüğün ucundan sarkabilir.

**`!` ile iki soru.** `if (!lane || !lane.log)` → "şerit **yoksa** **veya** şerit kütük şeridi **değilse**". `!`
"değil", `||` "veya" demektir.

**Kısa "eğer": `? :`.** Çizimde kütükler ve arabalar için farklı değer seçeriz:

```js
lane.log ? '#92400e' : lane.color   // kütükse kahverengi, değilse şeridin rengi
```

"Soru `?` evetse şu `:` değilse bu" diye okunur. Kütükler arabalardan biraz daha kalın çizilir: kenardan 6 yerine 4
piksel içeride başlar (`inset`, iç boşluk).

# --task--

1. Add the five river lanes from the solution (rows 1-5, with `log: true`) at the start of `LANES`.
2. Write `onLog(lane)`: whether the frog's middle, `frog.x + 0.5`, is strictly inside one of the lane's logs.
3. In `update()`: in a car lane, check for cars as before. In a log lane, `die()` if the frog is not on a log;
   otherwise carry it by `lane.speed`, and `die()` if that puts `frog.x` below `-0.5` or above `COLS - 0.5`.
4. In `hop()`, after moving: if the new row has no lane or is not a log lane, round `frog.x`.
5. Draw logs `'#92400e'` with a 4-pixel inset instead of 6.

# --task-tr--

1. `const LANES = [` satırının hemen altına, yani listenin **başına**, beş nehir şeridini ekle:

   ```js
   const LANES = [
     { row: 1, speed: 0.025, len: 3, spacing: 5, log: true },     // ← yeni
     { row: 2, speed: -0.035, len: 4, spacing: 6, log: true },    // ← yeni
     { row: 3, speed: 0.02, len: 2, spacing: 4, log: true },      // ← yeni
     { row: 4, speed: -0.03, len: 3, spacing: 5, log: true },     // ← yeni
     { row: 5, speed: 0.04, len: 4, spacing: 6, log: true },      // ← yeni
     { row: 7, speed: -0.05, len: 1, spacing: 4, color: '#ef4444' },
     ...
   ```

   Yol şeritleri aynen altında kalır.

2. `hop()` fonksiyonunun sonuna, sağlam zemine inince hizalayan satırları ekle:

   ```js
   function hop(dx, dy) {
     if (state !== 'playing') return
     frog.x = Math.min(COLS - 1, Math.max(0, frog.x + dx))
     frog.y = Math.min(START_ROW, Math.max(0, frog.y + dy))
     const lane = laneAt(frog.y)                                   // ← yeni
     // Back on solid ground: line up with the grid again.
     if (!lane || !lane.log) frog.x = Math.round(frog.x)           // ← yeni
   }
   ```

3. `hitByCar()` fonksiyonunun kapanış `}`'inden sonra bir boş satır bırak ve "kütükte miyim?" fonksiyonunu yaz:

   ```js
   function onLog(lane) {
     const middle = frog.x + 0.5
     return items(lane).some((x) => middle > x && middle < x + lane.len)
   }
   ```

   Kurbağanın ortası herhangi bir kütüğün sol ucundan sonra **ve** sağ ucundan önceyse kütüktedir.

4. `update()` fonksiyonunun son satırını (`if (lane && hitByCar(lane)) die()`) sil ve yerine şunu yaz:

   ```js
     if (!lane) return
     if (!lane.log) {
       if (hitByCar(lane)) die()
       return
     }
     if (!onLog(lane)) {
       die()
       return
     }
     // The log carries the frog; being carried off the screen is a splash too.
     frog.x += lane.speed
     if (frog.x < -0.5 || frog.x > COLS - 0.5) die()
   ```

   Sırayla: şerit yoksa (çimen) hiçbir şey yapma. Yol şeridiyse arabaları kontrol et ve çık. Kütük şeridiyse ve
   kütükte değilsen suya düştün. Kütükteysen onunla kay; ekrandan taşarsan yine suya düştün.

5. `draw()` fonksiyonunda arabaları çizen döngüyü şöyle değiştir:

   ```js
     for (const lane of LANES) {
       ctx.fillStyle = lane.log ? '#92400e' : lane.color     // ← değişti
       const inset = lane.log ? 4 : 6                        // ← yeni
       for (const x of items(lane)) {
         ctx.fillRect(x * TILE + 2, TOP + lane.row * TILE + inset, lane.len * TILE - 4, TILE - inset * 2)   // ← değişti
       }
     }
   ```

6. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Nehirde kahverengi kütükler akmalı. Oynamak için önce oyuna tıkla,
   yolu geçip güvenli şeritten bir kütüğe zıpla: kurbağa kütükle birlikte kaymalı; suya zıplarsan bir can gitmeli.
   Alttaki kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa `update()`'teki `return`'leri unutmadığından emin ol.

# --tests--

A frog on a log should ride along with it.
tr: Kütükteki kurbağa onunla birlikte gitmeli.

```js
frog = { x: 5, y: 6 }
$.press('ArrowUp') // a log from 2 to 6 is in row 5
$.tick(10)
assert.strictEqual(lives, 3)
assert.strictEqual(frog.y, 5)
assert.closeTo(frog.x, 5.4, 1e-6)
assert.isTrue(onLog(laneAt(5)))
```

Hopping into the water should cost a life.
tr: Suya zıplamak bir cana mal olmalı.

```js
frog = { x: 7, y: 6 }
$.press('ArrowUp') // between two logs
$.tick(1)
assert.strictEqual(lives, 2)
assert.deepEqual(frog, { x: 5, y: 12 })
```

A log that carries the frog off the screen should cost a life.
tr: Kurbağayı ekrandan dışarı taşıyan bir kütük bir cana mal olmalı.

```js
frog = { x: 11, y: 5 } // on the log from 8 to 12, drifting right
$.tick(10)
assert.strictEqual(lives, 3)
$.tick(10)
assert.strictEqual(lives, 2)
```

Hopping from a log onto solid ground should line the frog up with the grid.
tr: Kütükten sağlam zemine zıplamak kurbağayı ızgaraya hizalamalı.

```js
frog = { x: 5, y: 6 }
$.press('ArrowUp')
$.tick(10)
$.press('ArrowLeft')
assert.closeTo(frog.x, 4.4, 1e-6, 'still riding: no rounding')
$.press('ArrowDown')
assert.deepEqual(frog, { x: 4, y: 6 })
```

# --solution--

```js
// Road and river crossing, step by step.
// The page already has <canvas id="game" width="480" height="560"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TILE = 40
const COLS = 12
const TOP = 40 // room for the score and the lives
const START_ROW = 12
// Rows from the top: 0 the far bank with the homes, 1-5 the river, 6 a safe strip, 7-11 the road, 12 the start.
// speed is in tiles per frame (negative = to the left), len and spacing in tiles.
const LANES = [
  { row: 1, speed: 0.025, len: 3, spacing: 5, log: true },
  { row: 2, speed: -0.035, len: 4, spacing: 6, log: true },
  { row: 3, speed: 0.02, len: 2, spacing: 4, log: true },
  { row: 4, speed: -0.03, len: 3, spacing: 5, log: true },
  { row: 5, speed: 0.04, len: 4, spacing: 6, log: true },
  { row: 7, speed: -0.05, len: 1, spacing: 4, color: '#ef4444' },
  { row: 8, speed: 0.035, len: 2, spacing: 6, color: '#f59e0b' },
  { row: 9, speed: -0.06, len: 1, spacing: 5, color: '#e879f9' },
  { row: 10, speed: 0.03, len: 1, spacing: 4, color: '#38bdf8' },
  { row: 11, speed: -0.025, len: 2, spacing: 5, color: '#f97316' },
]

let frog
let lives
let state // 'playing' or 'over'

function newFrog() {
  frog = { x: 5, y: START_ROW }
}

function reset() {
  lives = 3
  state = 'playing'
  for (const lane of LANES) lane.offset = 0
  newFrog()
}

function laneAt(row) {
  return LANES.find((lane) => lane.row === row)
}

// A lane repeats every `period` tiles, which is always wider than the screen plus one car or log.
function period(lane) {
  return lane.spacing * Math.ceil((COLS + lane.len) / lane.spacing)
}

// Left edges (in tiles) of the cars or logs in a lane right now.
function items(lane) {
  const p = period(lane)
  const xs = []
  for (let start = 0; start < p; start += lane.spacing) {
    xs.push((((start + lane.offset) % p) + p) % p - lane.len)
  }
  return xs
}

function hop(dx, dy) {
  if (state !== 'playing') return
  frog.x = Math.min(COLS - 1, Math.max(0, frog.x + dx))
  frog.y = Math.min(START_ROW, Math.max(0, frog.y + dy))
  const lane = laneAt(frog.y)
  // Back on solid ground: line up with the grid again.
  if (!lane || !lane.log) frog.x = Math.round(frog.x)
}

function die() {
  lives -= 1
  if (lives > 0) {
    newFrog()
    return
  }
  state = 'over'
}

const DIRECTIONS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }
document.addEventListener('keydown', (event) => {
  const direction = DIRECTIONS[event.key]
  if (direction) {
    event.preventDefault()
    // One hop per press: holding the key down does not hop again.
    if (!event.repeat) hop(...direction)
  }
  if (event.key === ' ' && state === 'over') reset()
})

// Touch: a swipe hops that way, a short tap hops forward.
let swipeStart = null
canvas.addEventListener('pointerdown', (event) => {
  swipeStart = { x: event.clientX, y: event.clientY }
})
canvas.addEventListener('pointerup', (event) => {
  if (!swipeStart) return
  const dx = event.clientX - swipeStart.x
  const dy = event.clientY - swipeStart.y
  swipeStart = null
  if (state === 'over') {
    reset()
  } else if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) {
    hop(0, -1)
  } else if (Math.abs(dx) > Math.abs(dy)) {
    hop(Math.sign(dx), 0)
  } else {
    hop(0, Math.sign(dy))
  }
})

function hitByCar(lane) {
  return items(lane).some((x) => frog.x + 0.15 < x + lane.len && frog.x + 0.85 > x)
}

function onLog(lane) {
  const middle = frog.x + 0.5
  return items(lane).some((x) => middle > x && middle < x + lane.len)
}

function update() {
  if (state !== 'playing') return
  for (const lane of LANES) lane.offset += lane.speed

  const lane = laneAt(frog.y)
  if (!lane) return
  if (!lane.log) {
    if (hitByCar(lane)) die()
    return
  }
  if (!onLog(lane)) {
    die()
    return
  }
  // The log carries the frog; being carried off the screen is a splash too.
  frog.x += lane.speed
  if (frog.x < -0.5 || frog.x > COLS - 0.5) die()
}

function rowColor(row) {
  if (row === 0) return '#166534'
  if (row <= 5) return '#1e3a8a'
  if (row === 6 || row === START_ROW) return '#4d7c0f'
  return '#1f2937'
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let row = 0; row <= START_ROW; row++) {
    ctx.fillStyle = rowColor(row)
    ctx.fillRect(0, TOP + row * TILE, canvas.width, TILE)
  }

  for (const lane of LANES) {
    ctx.fillStyle = lane.log ? '#92400e' : lane.color
    const inset = lane.log ? 4 : 6
    for (const x of items(lane)) {
      ctx.fillRect(x * TILE + 2, TOP + lane.row * TILE + inset, lane.len * TILE - 4, TILE - inset * 2)
    }
  }

  ctx.fillStyle = '#22c55e'
  ctx.fillRect(frog.x * TILE + 6, TOP + frog.y * TILE + 6, TILE - 12, TILE - 12)

  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText('Lives: ' + lives, canvas.width - 10, 27)

  if (state === 'over') {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.font = 'bold 32px sans-serif'
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2)
    ctx.font = '18px sans-serif'
    ctx.fillText('Press Space to play again', canvas.width / 2, canvas.height / 2 + 32)
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
