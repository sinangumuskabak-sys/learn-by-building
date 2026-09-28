---
title: Traffic that wraps around
title_tr: Başa saran trafik
skills: [game.loop, prog.arrays]
---

# --explanation--

Each road lane is described by a few numbers, not by a list of cars:

```js
{ row: 7, speed: -0.05, len: 1, spacing: 4, color: '#ef4444' }
```

Cars in a lane are `spacing` tiles apart and all move at the lane's `speed` (tiles per frame; negative means to the
left). So the only thing that changes over time is one number per lane, its `offset`, which grows by `speed` every
frame.

Where are the cars right now? A car that drives off one side should come back on the other, so positions **wrap
around** with the remainder operator `%`. The lane repeats every `period` tiles, a multiple of `spacing` that is wider
than the screen plus one car, so a car is always completely off screen before it wraps:

```js
(start + offset) % p        // can be negative in JavaScript when offset is negative!
((start + offset) % p + p) % p   // always between 0 and p
```

In JavaScript `-3 % 16` is `-3`, not `13`. Adding `p` and taking `%` again is the standard fix for a modulo that works
both ways. Subtracting `len` at the end lets a car start just off the left edge.

Describing a lane by a formula instead of a list of objects means nothing ever has to be created, removed or recycled.

# --explanation-tr--

**Bu adımda:** yola trafik ekleyeceğiz. Beş gri yol şeridinin her birinde kendi renginde arabalar (bazı şeritlerde
iki döşemelik kamyonlar) sağa ya da sola akacak; bir kenardan çıkan araba öbür kenardan geri girecek. (Çarpışma henüz
yok, arabaların içinden geçebilirsin.)

**Bir şeridi birkaç sayıyla tarif etmek.** Her arabayı ayrı ayrı tutmak yerine, her yol şeridini birkaç sayıyla
tarif ederiz:

```js
{ row: 7, speed: -0.05, len: 1, spacing: 4, color: '#ef4444' }
```

- `row`: hangi satırda, `color`: arabaların rengi.
- `len`: bir arabanın boyu (döşeme cinsinden; kamyonlar 2).
- `spacing`: arabalar arası mesafe (döşeme): her 4 döşemede bir araba.
- `speed`: her karede kaç döşeme gittikleri; **eksi sola** demek.

Beş şeridi bir **diziye** (liste, köşeli parantezle yazılır) koyarız: `LANES` (şeritler). Listenin her elemanı bir
nesnedir; okunur olsun diye her birini ayrı satıra yazıp sonuna virgül koyarız.

Şeritteki bütün arabalar aynı hızla gittiği için zamanla değişen tek şey, şerit başına **bir sayıdır**: `offset`
(kayma). Her karede `speed` kadar büyür (ya da küçülür). Başta hepsi 0:

```js
for (const lane of LANES) lane.offset = 0
```

`for (const lane of LANES)` → "listedeki her şerit için, ona sırayla `lane` de". Nesneye yeni bir alan böyle,
doğrudan değer vererek eklenebilir.

**Arabalar şu an nerede? Başa sarmak.** Bir kenardan çıkan araba öbür kenardan geri gelmeli. Bunun için **bölümden
kalan** işlemini (`%`) kullanırız: `17 % 16` = 1, `16 % 16` = 0. Bir sayı ne kadar büyürse büyüsün, `% 16` onu hep 0 ile
16 arasına geri sarar, tıpkı saatin 12'den sonra 1'e dönmesi gibi.

Şerit her `period` (periyot) döşemede bir kendini tekrar eder. Periyot, `spacing`'in ekrandan artı bir arabadan
geniş olan bir katıdır; böylece araba başa sarmadan önce ekrandan tamamen çıkmış olur:

```js
lane.spacing * Math.ceil((COLS + lane.len) / lane.spacing)
```

`Math.ceil(sayı)` sayıyı **yukarı** yuvarlar (`3.25` → `4`). Kırmızı şerit için: `(12 + 1) / 4 = 3.25` → `4`, çarpı 4
= 16.

**Eksi sayı tuzağı.** JavaScript'te `-3 % 16` sonucu `13` değil `-3`'tür! Sola giden arabalarda `offset` eksi olduğu
için bu önemli. Çözüm: bir kez daha `p` ekleyip yine `%` almak:

```js
((start + offset) % p + p) % p   // her zaman 0 ile p arasında
```

Sonunda `len` çıkarırız ki araba sol kenarın hemen dışından başlayabilsin.

**`items(lane)`: arabaların listesi.** Bu fonksiyon boş bir liste açar, her araba için hesaplanan sol kenarı
`push` ile listenin sonuna ekler ve listeyi `return` ile geri verir:

```js
for (let start = 0; start < p; start += lane.spacing) { ... }
```

Bu `for` döngüsü sayacı 1'er değil `spacing`'er artırır: 0, 4, 8, 12 gibi. Her `start` bir arabadır.

Bir şeridi nesne listesi yerine bir formülle tarif etmek şu demek: hiçbir şeyin yaratılması, silinmesi ya da geri
dönüştürülmesi gerekmez.

**`update()`.** Döngüde çizimden önce her şeridin `offset`'ine hızını ekleyen bir fonksiyon çağırırız: önce durumu
güncelle, sonra çiz.

# --task--

1. Add the five road lanes, and set every lane's `offset` to `0`:

   ```js
   const LANES = [
     { row: 7, speed: -0.05, len: 1, spacing: 4, color: '#ef4444' },
     { row: 8, speed: 0.035, len: 2, spacing: 6, color: '#f59e0b' },
     { row: 9, speed: -0.06, len: 1, spacing: 5, color: '#e879f9' },
     { row: 10, speed: 0.03, len: 1, spacing: 4, color: '#38bdf8' },
     { row: 11, speed: -0.025, len: 2, spacing: 5, color: '#f97316' },
   ]
   ```

2. Write `period(lane)`: `spacing` times `Math.ceil((COLS + len) / spacing)`.
3. Write `items(lane)` returning the left edge (in tiles) of every car: for each `start` from `0` up to the period in
   steps of `spacing`, the wrapped `start + offset`, minus `len`.
4. Write `update()` that adds each lane's `speed` to its `offset`, and call it in the loop before `draw()`.
5. Draw every car in its lane's color: `x * TILE + 2` from the left, 6 pixels below the top of its row, `len * TILE - 4`
   wide and `TILE - 12` high.

# --task-tr--

1. `// Rows from the top: ...` yorum satırının hemen altına şeritlerin listesini ekle:

   ```js
   // speed is in tiles per frame (negative = to the left), len and spacing in tiles.
   const LANES = [
     { row: 7, speed: -0.05, len: 1, spacing: 4, color: '#ef4444' },
     { row: 8, speed: 0.035, len: 2, spacing: 6, color: '#f59e0b' },
     { row: 9, speed: -0.06, len: 1, spacing: 5, color: '#e879f9' },
     { row: 10, speed: 0.03, len: 1, spacing: 4, color: '#38bdf8' },
     { row: 11, speed: -0.025, len: 2, spacing: 5, color: '#f97316' },
   ]
   ```

2. `let frog = { x: 5, y: START_ROW }` satırının hemen altına, her şeridin kaymasını sıfırlayan satırı ekle:

   ```js
   for (const lane of LANES) lane.offset = 0
   ```

3. Bir boş satır bırak ve periyot ile araba konumlarını hesaplayan iki fonksiyonu yaz:

   ```js
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
   ```

   `push` satırındaki parantezleri dikkatle say: açılan her parantez kapanmalı.

4. Dokunmatik kodunun (`canvas.addEventListener('pointerup', ...)`) kapanış `})`'inden sonra, `function rowColor`'dan
   **önce**, şeritleri kaydıran fonksiyonu yaz:

   ```js
   function update() {
     for (const lane of LANES) lane.offset += lane.speed
   }
   ```

5. `draw()` fonksiyonunda, satırları çizen `for` döngüsünün kapanış `}`'inden sonra (kurbağadan **önce**) arabaları
   çiz:

   ```js
     for (const lane of LANES) {
       ctx.fillStyle = lane.color
       for (const x of items(lane)) {
         ctx.fillRect(x * TILE + 2, TOP + lane.row * TILE + 6, lane.len * TILE - 4, TILE - 12)
       }
     }
   ```

   Her şerit için rengini seç, sonra o şeritteki her arabayı bir dikdörtgen olarak çiz: soldan 2, üstten 6 piksel
   içeride, boyu kadar geniş (kenarlarda 2'şer piksel boşluk) ve 28 piksel yüksek.

6. `loop()` fonksiyonunda `draw()`'dan **önce** `update()`'i çağır:

   ```js
   function loop() {
     update()   // ← yeni
     draw()
     requestAnimationFrame(loop)
   }
   ```

7. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Yol şeritlerinde renkli arabalar akmalı; kenardan çıkan araba öbür
   taraftan girmeli. Alttaki kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa `LANES`'teki sayıları ve `items`
   içindeki `+ p) % p` kısmını kontrol et.

# --tests--

A lane's period should be a multiple of its spacing wider than the screen plus one car.
tr: Bir şeridin periyodu, aralığının ekran artı bir arabadan geniş bir katı olmalı.

```js
assert.strictEqual(period({ spacing: 4, len: 1 }), 16)
assert.strictEqual(period({ spacing: 6, len: 2 }), 18)
assert.strictEqual(period({ spacing: 7, len: 3 }), 21)
```

Cars should start one spacing apart and move at their lane's speed.
tr: Arabalar bir aralık arayla başlamalı ve şeritlerinin hızıyla hareket etmeli.

```js
const red = LANES.find((lane) => lane.row === 7)
assert.deepEqual(items(red), [-1, 3, 7, 11])
const yellow = LANES.find((lane) => lane.row === 8)
$.tick(100)
const xs = items(yellow)
assert.lengthOf(xs, 3)
;[1.5, 7.5, 13.5].forEach((x, i) => assert.closeTo(xs[i], x, 1e-6))
```

Cars that leave the screen should come back on the other side.
tr: Ekrandan çıkan arabalar öbür taraftan geri gelmeli.

```js
const red = LANES.find((lane) => lane.row === 7) // drives to the left
for (let i = 0; i < 50; i++) {
  $.tick(13)
  const xs = items(red)
  assert.lengthOf(xs, 4)
  for (const x of xs) assert.isTrue(x >= -1 && x < 15, 'car at ' + x + ' is outside its lane')
}
const orange = LANES.find((lane) => lane.row === 11) // drives to the left too, slowly
$.tick(2000)
for (const x of items(orange)) assert.isTrue(x >= -2 && x < 13)
```

The cars should be drawn in their lanes.
tr: Arabalar şeritlerinde çizilmeli.

```js
$.tick(1)
const red = $.rects('#ef4444')
assert.lengthOf(red, 4)
assert.closeTo(red[1].x, 3 * 40 + 2 - 2, 1e-6)
assert.strictEqual(red[1].y, 40 + 7 * 40 + 6)
assert.strictEqual(red[1].w, 36)
assert.strictEqual(red[1].h, 28)
assert.lengthOf($.rects('#f97316'), 3, 'the slow orange trucks')
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
  { row: 7, speed: -0.05, len: 1, spacing: 4, color: '#ef4444' },
  { row: 8, speed: 0.035, len: 2, spacing: 6, color: '#f59e0b' },
  { row: 9, speed: -0.06, len: 1, spacing: 5, color: '#e879f9' },
  { row: 10, speed: 0.03, len: 1, spacing: 4, color: '#38bdf8' },
  { row: 11, speed: -0.025, len: 2, spacing: 5, color: '#f97316' },
]

let frog = { x: 5, y: START_ROW }
for (const lane of LANES) lane.offset = 0

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
  frog.x = Math.min(COLS - 1, Math.max(0, frog.x + dx))
  frog.y = Math.min(START_ROW, Math.max(0, frog.y + dy))
}

const DIRECTIONS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }
document.addEventListener('keydown', (event) => {
  const direction = DIRECTIONS[event.key]
  if (direction) {
    event.preventDefault()
    // One hop per press: holding the key down does not hop again.
    if (!event.repeat) hop(...direction)
  }
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
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) {
    hop(0, -1)
  } else if (Math.abs(dx) > Math.abs(dy)) {
    hop(Math.sign(dx), 0)
  } else {
    hop(0, Math.sign(dy))
  }
})

function update() {
  for (const lane of LANES) lane.offset += lane.speed
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
    ctx.fillStyle = lane.color
    for (const x of items(lane)) {
      ctx.fillRect(x * TILE + 2, TOP + lane.row * TILE + 6, lane.len * TILE - 4, TILE - 12)
    }
  }

  ctx.fillStyle = '#22c55e'
  ctx.fillRect(frog.x * TILE + 6, TOP + frog.y * TILE + 6, TILE - 12, TILE - 12)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
