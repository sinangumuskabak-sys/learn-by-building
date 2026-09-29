---
title: Find the start
title_tr: Başlangıcı bul
skills: [prog.arrays, game.state]
---

# --goal--

`loadLevel` scans every tile of the level text once. At the `P` it creates the player: a 24×30 box standing on the
ground of that tile. The level text stays an unchanging **blueprint**; `player` is **live state** built from it.

# --goal-tr--

Oyuncu nerede başlayacak? Bölüm yazısındaki `P` harfinin olduğu yerde. `loadLevel` (bölümü yükle) fonksiyonu bölümün
**her döşemesini** bir kez gezecek ve `P`'yi bulunca oraya oyuncuyu koyacak: 24×30'luk bir kutu.

Bölüm yazısı hiç değişmeyen bir **plan** (kroki) olarak kalır; oyuncu ise o plandan kurulan **canlı durum**. Bu ayrım
ileride bölümü yeniden başlatmayı çok kolaylaştıracak. Bu adımda ekranda bir şey değişmeyecek.

# --code--

```js
let player

function loadLevel() {
  LEVEL.forEach((line, row) => {
    for (let col = 0; col < COLS; col++) {
      const x = col * TILE
      const y = row * TILE
      if (line[col] === 'P') player = { x: x + 4, y: y + 2, w: 24, h: 30 }
    }
  })
}

loadLevel()
```

# --meaning--

- `forEach((line, row) => ...)` calls the function once for every row, with the row's string and its number.
- The inner loop goes over the characters of that row.
- At `'P'` the player is placed 4 pixels in from the tile's left (it is 24 wide, the tile 32) and 2 pixels down, so its
  bottom (2 + 30 = 32) is exactly on the tile's bottom: standing on the ground below.
- `loadLevel()` runs once before the loop starts.

# --meaning-tr--

- `let player` → oyuncu kutusu; `loadLevel` dolduracak.
- `LEVEL.forEach((line, row) => { ... })` → `forEach` ("her biri için") dizinin her elemanı için fonksiyonu bir kez
  çağırır: `line` o satırın yazısı, `row` sırası (0, 1, 2...). Sayan bir `for` döngüsünün kısa hâli gibi.
- `for (let col = 0; col < COLS; col++)` → o satırın her harfi için.
- `const x = col * TILE`, `const y = row * TILE` → döşemenin sol üst köşesi (piksel).
- `if (line[col] === 'P') player = { x: x + 4, y: y + 2, w: 24, h: 30 }` → `P`'yi bulunca oyuncuyu kur. Oyuncu 24
  genişliğinde, döşeme 32: soldan 4 içeri koyunca ortalanır. 2 aşağı koyunca alt kenarı 2 + 30 = 32'de, yani döşemenin
  tam dibinde: alttaki zeminin üstünde **duruyor**.
- En alttaki `loadLevel()` → döngü başlamadan önce bölümü bir kez yükle.

# --task--

1. Above `function solidAt(x, y) {` write `let player` and an empty line.
2. Above `function draw() {` write `loadLevel`, with an empty line between them.
3. Write `loadLevel()` just above the last line, `requestAnimationFrame(loop)`.

# --task-tr--

1. `function solidAt(x, y) {` satırının **üstüne** `let player` yaz ve bir boş satır bırak.
2. `function draw() {` satırının **üstüne** `loadLevel` fonksiyonunu yaz; aralarında bir boş satır kalsın.
3. En alttaki `requestAnimationFrame(loop)` satırının hemen **üstüne** `loadLevel()` yaz.
4. **Çalıştır**: ekran değişmez, kontroller yeşil olmalı.

# --predict--

What will you see after Run?
- [ ] A red box at the start
- [x] The same picture as before
  `player` exists now, but `draw` does not draw it yet.
- [ ] A `P` written on the ground

# --predict-tr--

Çalıştır'a basınca ne göreceksin?
- [ ] Başlangıçta kırmızı bir kutu
- [x] Öncekiyle aynı resim
  `player` artık var ama `draw` onu henüz çizmiyor.
- [ ] Zeminin üstünde bir `P` harfi

# --tests--

The player should start at the P, standing on the ground.
tr: Oyuncu P'de, zeminde durarak başlamalı.

```js
assert.deepEqual(player, { x: 68, y: 258, w: 24, h: 30 })
assert.isFalse(overlapsSolid(player), 'standing on the ground, not inside it')
assert.isTrue(solidAt(player.x, player.y + player.h), 'ground right under the feet')
```

# --solution--

```js
// Platformer, step by step.
// The page already has <canvas id="game" width="640" height="352"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TILE = 32
const EPS = 0.01 // a hair: the right and bottom edges are just inside the box
// The level as text: '#' ground, 'B' brick, 'o' coin, 'e' enemy, 'P' player start, 'F' flag.
const LEVEL = [
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '....................................oooo........................',
  '.........oooo........................e..........................',
  '.........BBBB.................ooo...BBBB....##..................',
  '....ooo...............#....................###.......oooo.......',
  '..P...................#...e...............####.....e.....e...F..',
  '################..############...#############..################',
  '################..############...#############..################',
]
const ROWS = LEVEL.length
const COLS = LEVEL[0].length
const COLORS = { '#': '#78350f', B: '#c2410c' }

let player

function solidAt(x, y) {
  const col = Math.floor(x / TILE)
  const row = Math.floor(y / TILE)
  if (col < 0 || col >= COLS) return true // invisible walls at both ends of the level
  if (row < 0 || row >= ROWS) return false // open sky above, bottomless pits below
  const tile = LEVEL[row][col]
  return tile === '#' || tile === 'B'
}

// Bodies are never bigger than a tile, so checking their four corners is enough.
function overlapsSolid(body) {
  const right = body.x + body.w - EPS
  const bottom = body.y + body.h - EPS
  return solidAt(body.x, body.y) || solidAt(right, body.y) || solidAt(body.x, bottom) || solidAt(right, bottom)
}

function loadLevel() {
  LEVEL.forEach((line, row) => {
    for (let col = 0; col < COLS; col++) {
      const x = col * TILE
      const y = row * TILE
      if (line[col] === 'P') player = { x: x + 4, y: y + 2, w: 24, h: 30 }
    }
  })
}

function draw() {
  ctx.fillStyle = '#7dd3fc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const tile = LEVEL[row][col]
      if (tile === '#' || tile === 'B') {
        ctx.fillStyle = COLORS[tile]
        ctx.fillRect(col * TILE, row * TILE, TILE, TILE)
      }
    }
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

loadLevel()
requestAnimationFrame(loop)
```
