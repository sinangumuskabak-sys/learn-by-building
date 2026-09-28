---
title: Building towers with the mouse
title_tr: Fareyle kule kurmak
skills: [game.input]
---

# --explanation--

A click gives you a position in **screen pixels**, but the game thinks in **canvas pixels**, and they are not the same:
the page scales the canvas to fit your screen, bigger on a monitor and smaller on a phone. So first convert:

```js
const rect = canvas.getBoundingClientRect()                 // where the canvas is on screen, and how big
const x = (event.clientX - rect.left) * canvas.width / rect.width
```

Subtracting `rect.left` makes the position relative to the canvas; multiplying by `canvas.width / rect.width` undoes the
scaling. Then `Math.floor(x / TILE)` is the column. Forgetting this step is one of the most common bugs in browser games:
clicks land in the wrong place as soon as the canvas is resized.

A tower can only go on grass, inside the map, on an empty tile, and only if you can pay for it. Putting all of that in one
function, `canBuild`, lets you use the same answer twice: to refuse a click, and to color the **preview** under the mouse
white or red, together with a circle showing the tower's range. Showing players what will happen before they click is
a big part of a game feeling fair.

Tower kinds live in a small table, `TOWERS`, for now with only one kind: `arrow`.

# --explanation-tr--

**Bu adımda:** çimene tıklayarak kule kuracağız. Fare çimenin üstündeyken kare beyazımsı, yolun üstündeyken
kırmızımsı parlayacak ve etrafında kulenin menzilini gösteren bir daire çıkacak. Kuleler mavi kareler olarak görünecek;
sol üstte **Gold 120** yazacak ve her kule 50 altın götürecek.

**Ekran pikseli, canvas pikseli.** Tıklama sana konumu **ekran pikseli** olarak verir, oyun ise **canvas pikseli** ile
düşünür. İkisi aynı değil: sayfa canvas'ı ekrana sığacak şekilde büyütür ya da küçültür (monitörde büyük, telefonda
küçük). O yüzden önce çeviririz:

```js
const rect = canvas.getBoundingClientRect()   // canvas ekranda nerede, ne büyüklükte
const x = ((event.clientX - rect.left) * canvas.width) / rect.width
```

- `event.clientX` farenin ekrandaki yatay konumu. `rect.left`'i çıkarınca konum canvas'ın sol kenarına göre olur.
- `canvas.width / rect.width` oranıyla çarpmak büyütme/küçültmeyi geri alır (`/` bölme).
- Sonra `Math.floor(x / TILE)` sütunu verir (`Math.floor` aşağı yuvarlar: 2,7 → 2). Satır için önce üstteki 40
  piksellik şeridi çıkarırız.

Bu adımı unutmak tarayıcı oyunlarının en yaygın hatalarından biridir: canvas'ın boyu değiştiği an tıklamalar yanlış
yere düşer.

**Fare olayları.** `canvas.addEventListener('pointerdown', (event) => { ... })` "canvas'a basıldığında bu fonksiyonu
çalıştır" demektir; tarayıcı fonksiyonu her basışta çağırır ve bilgileri `event` adıyla verir. **Pointer** olayları hem
fareyle hem dokunmatik ekranla çalışır. `'pointermove'` imleç hareket edince, `'pointerleave'` imleç canvas'tan
çıkınca gelir.

**Kule türleri tablosu.**

```js
const TOWERS = {
  arrow: { cost: 50, range: 2.5, damage: 4, reload: 24, color: '#38bdf8' },
}
```

Bu bir **nesne** (object): `{ ad: değer }` çiftlerinden oluşan bir paket. İçinde `arrow` (ok) adında bir kule türü
var; onun da kendi bilgileri: bedeli, menzili (kare cinsinden), hasarı, yeniden doldurma süresi, rengi. Nesnenin içine
nokta ile (`kind.cost`) ya da adı bir değişkende duruyorsa köşeli parantezle ulaşırız: `selected` içinde `'arrow'`
yazısı varken `TOWERS[selected]` → `TOWERS.arrow`. Şimdilik tek tür var; ileride eklenecek.

**Kurulabilir mi? `canBuild(col, row)`.** Kule yalnızca haritanın içine, çimene, boş bir kareye ve paran yetiyorsa
kurulur:

- `inside` → sütun ve satır sınırların içinde mi? (`&&` "ve", `>=` büyük ya da eşit, `<` küçük)
- `towers.some((t) => ...)` → `some` "listede bu koşulu sağlayan **en az bir** eleman var mı?" diye sorar: bu karede
  zaten bir kule var mı?
- `!road.has(...)` → `!` "değil": yol **değil**. `gold >= ... .cost` → paran yetiyor mu?

Hepsini tek bir fonksiyonda toplamak aynı cevabı iki yerde kullanmamızı sağlar: tıklamayı reddetmek için ve farenin
altındaki **önizlemeyi** beyaz ya da kırmızı boyamak için. Oyuncuya tıklamadan önce ne olacağını göstermek, oyunun adil
hissettirmesinin büyük bir parçasıdır.

**Kurmak.** `build` önce `canBuild`'e sorar; olmuyorsa `return` ile çıkar. Oluyorsa bedeli öder (`gold -= ...`,
"üstünden düş") ve `towers` listesine `{ col, row, kind: selected }` ekler. `{ col, row }` kısa yazımdır;
`{ col: col, row: row }` ile aynıdır.

**`hover`.** Farenin altındaki kareyi hatırlar; imleç haritanın dışındaysa `null` ("hiçbir şey"). `if (hover)` "bir
kare varsa" demektir. `koşul ? a : b` **kısa if**'tir: "doğruysa a, değilse b".

**Çerçeve çizmek.** `ctx.strokeStyle` çizgi rengini seçer, `ctx.stroke()` şeklin içini değil **kenarını** çizer.
Menzil dairesinin yarıçapı `range * TILE` = 2,5 × 40 = 100 piksel. Kuleyi karenin her kenarından 6 piksel içeride
çizeriz, boyu `TILE - 12`.

# --task--

1. Add `TOWERS = { arrow: { cost: 50, range: 2.5, damage: 4, reload: 24, color: '#38bdf8' } }`, and `towers`, `gold`,
   `selected` and `hover`; `reset()` sets `[]`, `120` and `'arrow'`.
2. Write `tileAt(event)` returning `{ x, y, col, row }` in canvas pixels and tiles (`row` counts from `TOP`).
3. Write `canBuild(col, row)` and `build(col, row)`, which pays the cost and adds `{ col, row, kind: selected }`. A
   `pointerdown` on the canvas builds on that tile.
4. On `pointermove` remember the tile under the mouse (only rows `0` to `ROWS - 1`), and forget it on `pointerleave`.
   Draw it with `'rgba(255, 255, 255, 0.25)'` if you can build there, `'rgba(239, 68, 68, 0.35)'` if not, and stroke a
   circle of the tower's range around it.
5. Draw towers as squares in their kind's color, 6 pixels smaller than the tile on each side, and `Gold 120` at the top
   left (white, `'bold 16px sans-serif'`).

# --task-tr--

1. `const TOP = 40` satırının sonundaki yorumu değiştir:

   ```js
   const TOP = 40 // room for gold, lives and the tower buttons
   ```

2. `const SPEED = 0.03` satırının altına kule tablosunu ekle:

   ```js
   const TOWERS = {
     arrow: { cost: 50, range: 2.5, damage: 4, reload: 24, color: '#38bdf8' },
   }
   ```

3. Değişken satırlarını şöyle yap (dört yeni satır var):

   ```js
   let road // keys of the tiles the road covers
   let enemies
   let towers // ← yeni
   let gold // ← yeni
   let toSpawn // enemies still to come
   let spawnIn // frames until the next one
   let selected // the kind of tower to build: only 'arrow' so far // ← yeni
   let hover = null // the tile under the mouse // ← yeni
   ```

4. `reset()` fonksiyonunu şöyle yap:

   ```js
   function reset() {
     findRoad()
     enemies = []
     towers = [] // ← yeni
     gold = 120 // ← yeni
     toSpawn = 30
     spawnIn = 0
     selected = 'arrow' // ← yeni
   }
   ```

5. `pointAt` fonksiyonunun kapanış `}`'sinin altına, `function update()` satırından önce şu parçaları yaz:

   ```js
   // Mouse and touch positions are in screen pixels; the canvas may be drawn smaller or bigger than its own pixels.
   function tileAt(event) {
     const rect = canvas.getBoundingClientRect()
     const x = ((event.clientX - rect.left) * canvas.width) / rect.width
     const y = ((event.clientY - rect.top) * canvas.height) / rect.height
     return { x, y, col: Math.floor(x / TILE), row: Math.floor((y - TOP) / TILE) }
   }

   function canBuild(col, row) {
     const inside = col >= 0 && col < COLS && row >= 0 && row < ROWS
     const taken = towers.some((t) => t.col === col && t.row === row)
     return inside && !road.has(key(col, row)) && !taken && gold >= TOWERS[selected].cost
   }

   function build(col, row) {
     if (!canBuild(col, row)) return
     const kind = TOWERS[selected]
     gold -= kind.cost
     towers.push({ col, row, kind: selected })
   }

   canvas.addEventListener('pointerdown', (event) => {
     const p = tileAt(event)
     build(p.col, p.row)
   })
   canvas.addEventListener('pointermove', (event) => {
     const p = tileAt(event)
     hover = p.row >= 0 && p.row < ROWS ? p : null
   })
   canvas.addEventListener('pointerleave', () => {
     hover = null
   })
   ```

6. `draw()` içinde, kareleri çizen iki döngü ile düşmanları çizen `for (const e of enemies)` döngüsünün **arasına**
   önizlemeyi ve kuleleri ekle:

   ```js
     if (hover) {
       ctx.fillStyle = canBuild(hover.col, hover.row) ? 'rgba(255, 255, 255, 0.25)' : 'rgba(239, 68, 68, 0.35)'
       ctx.fillRect(hover.col * TILE, TOP + hover.row * TILE, TILE, TILE)
       ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
       ctx.beginPath()
       ctx.arc((hover.col + 0.5) * TILE, TOP + (hover.row + 0.5) * TILE, TOWERS[selected].range * TILE, 0, Math.PI * 2)
       ctx.stroke()
     }

     for (const t of towers) {
       ctx.fillStyle = TOWERS[t.kind].color
       ctx.fillRect(t.col * TILE + 6, TOP + t.row * TILE + 6, TILE - 12, TILE - 12)
     }
   ```

   `rgba(...)`'nın son sayısı saydamlıktır: 0.25 yani %25 görünür; alttaki çimen seçilmeye devam eder.

7. `draw()`'un en sonuna, düşman döngüsünün kapanış `}`'sinin altına altın yazısını ekle:

   ```js
     ctx.fillStyle = 'white'
     ctx.font = 'bold 16px sans-serif'
     ctx.textAlign = 'left'
     ctx.fillText('Gold ' + gold, 10, 26)
     ctx.textAlign = 'center'
   }
   ```

   `ctx.fillText(yazı, x, y)` canvas'a yazı yazar; `'Gold ' + gold` yazı ile sayıyı birleştirir (`'Gold 120'`).
   `textAlign = 'left'` yazıyı noktadan sağa doğru yazar; sondaki `'center'` sonraki yazılar için ortalamaya döner.

8. **Çalıştır**'a bas. Fareyi haritada gezdir: çimende beyazımsı, yolda kırmızımsı bir kare ve etrafında bir daire
   görmelisin. Çimene tıklayınca mavi bir kule çıkmalı ve altın 70'e düşmeli. Alttaki kontrollerin hepsi yeşil
   olmalı. Kule tıkladığın yerden farklı bir yere çıkıyorsa `tileAt` içindeki çarpma ve bölmeyi kontrol et.

# --tests--

Clicking on grass should build a tower and pay for it.
tr: Çimene tıklamak bir kule kurmalı ve bedelini ödemeli.

```js
$.click(60, 180) // tile (1, 3)
assert.lengthOf(towers, 1)
assert.deepEqual(towers[0], { col: 1, row: 3, kind: 'arrow' })
assert.strictEqual(gold, 70)
$.tick(1)
assert.deepEqual($.rects('#38bdf8').map((r) => [r.x, r.y, r.w]), [[46, 166, 28]])
assert.include($.texts(), 'Gold 70')
```

Towers should not go on the road, on another tower or outside the map, or cost more than you have.
tr: Kuleler yola, başka bir kulenin üstüne ya da harita dışına kurulmamalı ve paradan fazlasına mal olmamalı.

```js
$.click(140, 180) // (3, 3) is road
$.click(60, 20) // the top bar
assert.lengthOf(towers, 0)
$.click(60, 180)
$.click(60, 180)
assert.lengthOf(towers, 1)
$.click(60, 220)
assert.strictEqual(gold, 20)
$.click(60, 260)
assert.lengthOf(towers, 2, 'only 20 gold left')
assert.isFalse(canBuild(1, 7))
gold = 50
assert.isTrue(canBuild(1, 7))
```

Clicks should be converted from screen pixels to canvas pixels.
tr: Tıklamalar ekran piksellerinden canvas piksellerine çevrilmeli.

```js
canvas.getBoundingClientRect = () => ({ left: 10, top: 20, width: 240, height: 220 }) // drawn at half size
$.click(10 + 30, 20 + 90)
assert.deepEqual(towers[0], { col: 1, row: 3, kind: 'arrow' })
```

The tile under the mouse should show whether you can build there, and the range.
tr: Farenin altındaki döşeme oraya kurulup kurulamayacağını ve menzili göstermeli.

```js
$.move(60, 180)
$.tick(1)
assert.lengthOf($.rects('rgba(255, 255, 255, 0.25)'), 1)
assert.isTrue($.arcs().some((a) => a.r === 100), 'a range circle of 2.5 tiles')
$.move(140, 180)
$.tick(1)
assert.lengthOf($.rects('rgba(239, 68, 68, 0.35)'), 1)
```

# --solution--

```js
// Tower defense, step by step.
// The page already has <canvas id="game" width="480" height="440"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TILE = 40
const COLS = 12
const ROWS = 9
const TOP = 40 // room for gold, lives and the tower buttons
// The road, as corners in tiles. It starts off the left edge and ends off the right edge.
const PATH = [
  [-1, 1],
  [3, 1],
  [3, 6],
  [7, 6],
  [7, 2],
  [10, 2],
  [10, 7],
  [12, 7],
]
const SPEED = 0.03 // tiles per frame
const TOWERS = {
  arrow: { cost: 50, range: 2.5, damage: 4, reload: 24, color: '#38bdf8' },
}

let road // keys of the tiles the road covers
let enemies
let towers
let gold
let toSpawn // enemies still to come
let spawnIn // frames until the next one
let selected // the kind of tower to build: only 'arrow' so far
let hover = null // the tile under the mouse

const key = (col, row) => col + ',' + row

// Every tile between two corners, corner included.
function findRoad() {
  road = new Set()
  for (let i = 1; i < PATH.length; i++) {
    let [x, y] = PATH[i - 1]
    const [tx, ty] = PATH[i]
    while (true) {
      road.add(key(x, y))
      if (x === tx && y === ty) break
      x += Math.sign(tx - x)
      y += Math.sign(ty - y)
    }
  }
}

function reset() {
  findRoad()
  enemies = []
  towers = []
  gold = 120
  toSpawn = 30
  spawnIn = 0
  selected = 'arrow'
}

// Where on the road an enemy is after walking `d` tiles (null once it is past the end).
function pointAt(d) {
  for (let i = 1; i < PATH.length; i++) {
    const [ax, ay] = PATH[i - 1]
    const [bx, by] = PATH[i]
    const length = Math.abs(bx - ax) + Math.abs(by - ay)
    if (d <= length) return { x: ax + Math.sign(bx - ax) * d, y: ay + Math.sign(by - ay) * d }
    d -= length
  }
  return null
}

// Mouse and touch positions are in screen pixels; the canvas may be drawn smaller or bigger than its own pixels.
function tileAt(event) {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height
  return { x, y, col: Math.floor(x / TILE), row: Math.floor((y - TOP) / TILE) }
}

function canBuild(col, row) {
  const inside = col >= 0 && col < COLS && row >= 0 && row < ROWS
  const taken = towers.some((t) => t.col === col && t.row === row)
  return inside && !road.has(key(col, row)) && !taken && gold >= TOWERS[selected].cost
}

function build(col, row) {
  if (!canBuild(col, row)) return
  const kind = TOWERS[selected]
  gold -= kind.cost
  towers.push({ col, row, kind: selected })
}

canvas.addEventListener('pointerdown', (event) => {
  const p = tileAt(event)
  build(p.col, p.row)
})
canvas.addEventListener('pointermove', (event) => {
  const p = tileAt(event)
  hover = p.row >= 0 && p.row < ROWS ? p : null
})
canvas.addEventListener('pointerleave', () => {
  hover = null
})

function update() {
  if (toSpawn > 0) {
    spawnIn -= 1
    if (spawnIn <= 0) {
      enemies.push({ d: 0 })
      toSpawn -= 1
      spawnIn = 45
    }
  }

  for (const e of enemies) e.d += SPEED
  // Walked off the end of the road: gone.
  enemies = enemies.filter((e) => pointAt(e.d) !== null)
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      ctx.fillStyle = road.has(key(col, row)) ? '#a8a29e' : '#3f6212'
      ctx.fillRect(col * TILE, TOP + row * TILE, TILE, TILE)
    }
  }

  if (hover) {
    ctx.fillStyle = canBuild(hover.col, hover.row) ? 'rgba(255, 255, 255, 0.25)' : 'rgba(239, 68, 68, 0.35)'
    ctx.fillRect(hover.col * TILE, TOP + hover.row * TILE, TILE, TILE)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.beginPath()
    ctx.arc((hover.col + 0.5) * TILE, TOP + (hover.row + 0.5) * TILE, TOWERS[selected].range * TILE, 0, Math.PI * 2)
    ctx.stroke()
  }

  for (const t of towers) {
    ctx.fillStyle = TOWERS[t.kind].color
    ctx.fillRect(t.col * TILE + 6, TOP + t.row * TILE + 6, TILE - 12, TILE - 12)
  }

  for (const e of enemies) {
    const p = pointAt(e.d)
    const x = (p.x + 0.5) * TILE
    const y = TOP + (p.y + 0.5) * TILE
    ctx.fillStyle = '#dc2626'
    ctx.beginPath()
    ctx.arc(x, y, 11, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Gold ' + gold, 10, 26)
  ctx.textAlign = 'center'
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
