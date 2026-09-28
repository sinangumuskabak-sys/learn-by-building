---
title: Firing
title_tr: Ateş
skills: [game.input, prog.arrays]
---

# --explanation--

Tap a square of the enemy's sea to fire at it. What happened is stored in a second grid, `myShots`: `null` for a square not
tried yet, `'miss'` or `'hit'`. The enemy's ships stay hidden; only your shots are drawn on their sea: a small white dot for a
miss, a big red one for a hit.

Firing twice at the same square would waste a shot, so the game ignores it. That check is just `if (myShots[r][c]) return`, since
`null` counts as false and both `'miss'` and `'hit'` count as true.

`fire(fleet, record, r, c)` does the work: is there a ship of `fleet` on that square? It writes the answer into `record` and
returns it. It takes the fleet and the grid as parameters so that, a few steps later, the computer can fire at **your** fleet with
the very same function.

# --explanation-tr--

**Bu adımda:** düşman denizinde bir kareye tıklayınca oraya ateş edeceksin. Iskalarsan karede küçük beyaz bir nokta,
vurursan büyük kırmızı bir nokta çıkacak; üstteki yazı `Hit!` (isabet) ya da `Miss` (ıska) diyecek.

**Atışları kaydetmek.** Düşmanın gemileri gizli kalır; onun denizine yalnızca **senin atışların** çizilir. Atışları
ikinci bir 10×10 tabloda tutarız: `myShots`. Her kare üç şeyden biri olur:

- `null` → "hiçbir şey", henüz denenmedi,
- `'miss'` → ıska,
- `'hit'` → isabet.

`grid(null)` (1. adımdaki yardımcı) hepsi `null` olan bir tablo kurar.

**Aynı kareye iki kez ateş etmek** bir atışı boşa harcar; oyun bunu yok sayar:

```js
if (myShots[r][c]) return
```

`if` içine bir değer koyunca bilgisayar onu doğru ya da yanlış sayar: `null` **yanlış**, `'miss'` ve `'hit'` gibi
dolu yazılar **doğru** sayılır. Yani "bu kare zaten denendiyse fonksiyondan çık". `return` fonksiyonu hemen bitirir.

**Orada gemi var mı?**

```js
const shipAt = (fleet, r, c) => fleet.find((s) => s.cells.some(([sr, sc]) => sr === r && sc === c))
```

`find` listede kurala uyan **ilk elemanı** verir; hiçbiri uymazsa `undefined` ("yok") verir. Burada kural: "karelerinden
biri `(r, c)` olan gemi". `!` ise "değil" demektir: `if (!ship)` → "gemi yoksa".

**`fire` fonksiyonu işi yapar.** Karede gemi var mı bakar, cevabı tabloya yazar ve **geri verir** (`return 'hit'`).
Donanmayı ve tabloyu parametre olarak alır; böylece birkaç adım sonra bilgisayar da **senin** donanmana aynı
fonksiyonla ateş edebilecek. Cevabı kullanırken:

```js
message = fire(enemyFleet, myShots, r, c) === 'hit' ? 'Hit!' : 'Miss'
```

"Ateş et; sonuç `'hit'` ise mesaj `'Hit!'`, değilse `'Miss'` olsun."

**Tıklamayı kareye çevirmek.** Ekrana dokununca ya da tıklayınca `pointerdown` olayı olur. `event.clientX` ve
`event.clientY` tıklamanın **pencere** içindeki yeridir. Canvas sayfada bir yerde durur ve ekranda küçültülmüş
olabilir; `canvas.getBoundingClientRect()` onun pencerede nerede ve ne boyda göründüğünü verir (`left`, `top`,
`width`, `height`). Şöyle çeviririz:

- `event.clientX - rect.left` → canvas'ın sol kenarından uzaklık (ekran pikseli).
- `* canvas.width / rect.width` → ekran pikselini canvas pikseline çevirir (küçültmeyi geri alır).
- `- SEA.x` → denizin sol kenarından uzaklık.
- `Math.floor(x / BIG)` → 36'lık karelere bölüp aşağı yuvarlayınca sütun numarası çıkar. Satır için aynısı.

Sonuç 0 ile 9 arasındaysa tıklama denizin içindedir. `>=` "büyük ya da eşit" demektir.

**Daire çizmek.** Fırçayla daire şöyle boyanır:

```js
ctx.beginPath()                          // yeni bir şekle başla
ctx.arc(x, y, yaricap, 0, Math.PI * 2)   // merkez, yarıçap, tam tur
ctx.fill()                               // içini boya
```

`Math.PI * 2` tam bir daire demektir. Noktayı karenin tam ortasına (`x + size / 2`) koyarız. `drawSea`'nın içindeki
`continue`, 1. adımdaki gibi "bu kareyle işin bitti, sıradakine geç" demektir: atış yoksa nokta çizilmez.

# --task--

1. Add `myShots` (`grid(null)` in `reset()`) and `message` (`'Pick a square'`).
2. Write `shipAt(fleet, r, c)`, the ship covering that square or `undefined`, and `fire(fleet, record, r, c)`, which records and
   returns `'miss'` or `'hit'`.
3. Write `playerShoots(r, c)`: ignore a square already tried; otherwise fire and set `message` to `'Hit!'` or `'Miss'`.
4. On `pointerdown`, turn the pointer into a square of the enemy's sea and shoot it if it is on the sea.
5. `drawSea` gets the shots grid as its third parameter: a miss is a `'#e2e8f0'` dot of radius `size / 8`, a hit a `'#ef4444'` dot of
   radius `size / 3`, centered in the square. Draw `message` above the sea.

# --task-tr--

1. `let myFleet` satırının altına iki değişken ekle:

   ```js
   let myShots // myShots[r][c]: null, 'miss' or 'hit' (on the enemy's sea)
   let message
   ```

2. `reset()` fonksiyonunu şöyle yap:

   ```js
   function reset() {
     enemyFleet = placeFleet()
     myFleet = placeFleet()
     myShots = grid(null) // ← yeni
     message = 'Pick a square' // ← yeni
   }
   ```

3. `reset()`'in altına, `drawSea`'nın üstüne şu dört parçayı ekle:

   ```js
   const shipAt = (fleet, r, c) => fleet.find((s) => s.cells.some(([sr, sc]) => sr === r && sc === c))

   // Fire at a square of a fleet and record the result on that shots grid.
   function fire(fleet, record, r, c) {
     const ship = shipAt(fleet, r, c)
     if (!ship) {
       record[r][c] = 'miss'
       return 'miss'
     }
     record[r][c] = 'hit'
     return 'hit'
   }

   function playerShoots(r, c) {
     if (myShots[r][c]) return
     message = fire(enemyFleet, myShots, r, c) === 'hit' ? 'Hit!' : 'Miss'
   }

   canvas.addEventListener('pointerdown', (event) => {
     const rect = canvas.getBoundingClientRect()
     const x = ((event.clientX - rect.left) * canvas.width) / rect.width - SEA.x
     const y = ((event.clientY - rect.top) * canvas.height) / rect.height - SEA.y
     const r = Math.floor(y / BIG)
     const c = Math.floor(x / BIG)
     if (r >= 0 && r < N && c >= 0 && c < N) playerShoots(r, c)
   })
   ```

4. `drawSea`'yı şöyle değiştir: üçüncü parametre olarak atış tablosu (`shotsGrid`) gelir, gemi kontrolü `shipAt`'ı
   kullanır ve karenin altına atış noktası çizilir:

   ```js
   function drawSea(origin, size, shotsGrid, fleet, showShips) { // ← değişti
     for (let r = 0; r < N; r++) {
       for (let c = 0; c < N; c++) {
         const x = origin.x + c * size
         const y = origin.y + r * size
         ctx.fillStyle = '#1e3a8a'
         if (showShips && shipAt(fleet, r, c)) ctx.fillStyle = '#64748b' // ← değişti
         ctx.fillRect(x + 1, y + 1, size - 2, size - 2)
         const shot = shotsGrid[r][c] // ← yeni
         if (!shot) continue // ← yeni
         ctx.fillStyle = shot === 'miss' ? '#e2e8f0' : '#ef4444' // ← yeni
         ctx.beginPath() // ← yeni
         ctx.arc(x + size / 2, y + size / 2, shot === 'miss' ? size / 8 : size / 3, 0, Math.PI * 2) // ← yeni
         ctx.fill() // ← yeni
       }
     }
   }
   ```

5. `draw()` içinde üç satırı değiştir: başlık yerine `message` yazılsın ve iki `drawSea` çağrısı atış tablosunu da
   versin (senin denizin için şimdilik boş bir tablo):

   ```js
     ctx.fillText(message, SEA.x, 34) // ← değişti
     drawSea(SEA, BIG, myShots, enemyFleet, false) // ← değişti
   ```

   ```js
     drawSea(HOME, SMALL, grid(null), myFleet, true) // ← değişti
   ```

6. **Çalıştır**'a bas. Üstte `Pick a square` yazmalı. Düşman denizinde bir kareye tıkla: ıskada küçük beyaz,
   isabette büyük kırmızı nokta çıkmalı ve yazı değişmeli. Alttaki kontrollerin hepsi yeşil olmalı. Tıklama hiçbir
   şey yapmıyorsa `drawSea` çağrılarında parametrelerin sırasını kontrol et: konum, boy, **atışlar**, donanma, göster.

# --tests--

A shot on a ship should hit and a shot on open sea should miss.
tr: Bir gemiye atış isabet etmeli, açık denize atış ıskalamalı.

```js
enemyFleet = [{ cells: [[0, 0], [0, 1]] }]
$.click(48, 68)
assert.strictEqual(myShots[0][0], 'hit')
assert.strictEqual(message, 'Hit!')
$.click(228, 248)
assert.strictEqual(myShots[5][5], 'miss')
assert.strictEqual(message, 'Miss')
```

The same square twice, or a tap off the sea, should do nothing.
tr: Aynı kareye iki kez ya da denizin dışına dokunmak hiçbir şey yapmamalı.

```js
enemyFleet = [{ cells: [[0, 0], [0, 1]] }]
$.click(48, 68)
message = ''
$.click(48, 68)
assert.strictEqual(message, '', 'the same square twice does nothing')
$.click(10, 10)
assert.strictEqual(message, '', 'outside the sea: nothing')
```

Hits and misses should be drawn on the enemy's sea.
tr: İsabetler ve ıskalar düşman denizine çizilmeli.

```js
enemyFleet = [{ cells: [[0, 0], [0, 1]] }]
$.click(48, 68)
$.click(156, 140)
$.tick(1)
assert.deepInclude($.arcs(), { x: 48, y: 68, r: 12, color: '#ef4444' }, 'a hit')
assert.deepInclude($.arcs(), { x: 48 + 36 * 3, y: 68 + 72, r: 4.5, color: '#e2e8f0' }, 'a miss')
assert.include($.texts(), 'Miss')
```

# --solution--

```js
// Battleship, step by step.
// The page already has <canvas id="game" width="420" height="620"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const N = 10
const SHIPS = [5, 4, 3, 3, 2]
const BIG = 36 // cell size of the enemy's sea, where you shoot
const SMALL = 20 // cell size of your own sea
const SEA = { x: 30, y: 50 }
const HOME = { x: 30, y: 440 }

let enemyFleet // ships: { cells: [[r, c], ...] }
let myFleet
let myShots // myShots[r][c]: null, 'miss' or 'hit' (on the enemy's sea)
let message

const grid = (value) => Array.from({ length: N }, () => Array(N).fill(value))
const shipCells = (r, c, length, down) => Array.from({ length }, (_, i) => (down ? [r + i, c] : [r, c + i]))

// A random fleet: each ship tries random spots until it fits on the sea without overlapping another.
function placeFleet() {
  const taken = grid(false)
  return SHIPS.map((length) => {
    for (;;) {
      const down = Math.random() < 0.5
      const r = Math.floor(Math.random() * (down ? N - length + 1 : N))
      const c = Math.floor(Math.random() * (down ? N : N - length + 1))
      const cells = shipCells(r, c, length, down)
      if (cells.some(([cr, cc]) => taken[cr][cc])) continue
      for (const [cr, cc] of cells) taken[cr][cc] = true
      return { cells }
    }
  })
}

function reset() {
  enemyFleet = placeFleet()
  myFleet = placeFleet()
  myShots = grid(null)
  message = 'Pick a square'
}

const shipAt = (fleet, r, c) => fleet.find((s) => s.cells.some(([sr, sc]) => sr === r && sc === c))

// Fire at a square of a fleet and record the result on that shots grid.
function fire(fleet, record, r, c) {
  const ship = shipAt(fleet, r, c)
  if (!ship) {
    record[r][c] = 'miss'
    return 'miss'
  }
  record[r][c] = 'hit'
  return 'hit'
}

function playerShoots(r, c) {
  if (myShots[r][c]) return
  message = fire(enemyFleet, myShots, r, c) === 'hit' ? 'Hit!' : 'Miss'
}

canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width - SEA.x
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height - SEA.y
  const r = Math.floor(y / BIG)
  const c = Math.floor(x / BIG)
  if (r >= 0 && r < N && c >= 0 && c < N) playerShoots(r, c)
})

function drawSea(origin, size, shotsGrid, fleet, showShips) {
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const x = origin.x + c * size
      const y = origin.y + r * size
      ctx.fillStyle = '#1e3a8a'
      if (showShips && shipAt(fleet, r, c)) ctx.fillStyle = '#64748b'
      ctx.fillRect(x + 1, y + 1, size - 2, size - 2)
      const shot = shotsGrid[r][c]
      if (!shot) continue
      ctx.fillStyle = shot === 'miss' ? '#e2e8f0' : '#ef4444'
      ctx.beginPath()
      ctx.arc(x + size / 2, y + size / 2, shot === 'miss' ? size / 8 : size / 3, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(message, SEA.x, 34)
  drawSea(SEA, BIG, myShots, enemyFleet, false)

  ctx.fillStyle = 'white'
  ctx.font = 'bold 14px sans-serif'
  ctx.fillText('Your fleet', HOME.x, HOME.y - 10)
  drawSea(HOME, SMALL, grid(null), myFleet, true)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
