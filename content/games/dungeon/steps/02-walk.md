---
title: Walking and walls
title_tr: Yürümek ve duvarlar
skills: [game.collision, game.input]
---

# --explanation--

The player walks in four directions while an arrow key is held. Walls stop it, and the check works
in pixels: a position is **blocked** if any corner of the player's box is inside a wall tile. Moving one axis at a time
lets the player slide along a wall instead of sticking to it:

```js
if (!blocked(body.x + dx, body.y)) body.x += dx
if (!blocked(body.x, body.y + dy)) body.y += dy
```

The function takes a **body**, not the player, so the enemies can use exactly the same one later.

The player also remembers which way it faces (`dir`), which the sword will need.

On a phone, a faint circle in the bottom left corner is a direction pad: touching it on its left, right, top or bottom side walks
that way until you let go.

# --explanation-tr--

**Bu adımda:** yeşil kareyi ok tuşlarıyla yürüteceksin. Duvarlar seni durduracak, ama duvara çapraz gidersen
boyunca kayacaksın. Telefonda sol alt köşedeki soluk daire yön tuşu olacak.

**Olay (event) nedir?** Bir tuşa basıldığında tarayıcı bir **olay** yayar. Ona önceden "bu olunca şunu yap" diye bir
fonksiyon verebilirsin:

```js
document.addEventListener('keydown', (event) => {
  // bir tuşa basıldığında burası çalışır; event.key basılan tuşun adıdır, örneğin 'ArrowUp'
})
```

`'keydown'` tuşa basılınca, `'keyup'` bırakılınca olur. Hangi tuşların basılı olduğunu `held` adlı bir nesnede
tutarız: basılınca `held[event.key] = true`, bırakılınca `false` (`true` evet, `false` hayır demek). Köşeli parantez
`held['ArrowUp']` ile nokta `held.ArrowUp` aynı şeydir; ad bir değişkenden geliyorsa köşeli parantez kullanılır.
`event.preventDefault()` tarayıcının ok tuşlarıyla sayfayı kaydırmasını engeller.

**Yönler bir tabloda.** `DIRS` her ok tuşunu bir `[dx, dy]` çiftine eşler: sağ `[1, 0]` (x artar), yukarı `[0, -1]`
(y azalır, çünkü y aşağı doğru büyür). Oyuncu her karede yönüyle `SPEED` (2.5 piksel) çarpımı kadar yürür.

**Duvara çarptım mı?** Oyuncunun gövdesi bir kutudur. Kutunun **dört köşesinden** herhangi biri bir duvar ya da kapı
karosunun içindeyse o konum **kapalıdır** (`blocked`). Bir pikselin hangi karoda olduğunu bulmak kolay: `Math.floor(x / T)`
(aşağı yuvarlanmış bölme) sütunu, `Math.floor(y / T)` satırı verir. Şimdilik odanın dışı da duvar sayılır.

**Kaymanın sırrı: eksenleri ayrı dene.** Önce sadece yatay hareketi, sonra sadece dikey hareketi deneriz:

```js
if (!blocked(body.x + dx, body.y)) body.x += dx
if (!blocked(body.x, body.y + dy)) body.y += dy
```

`!` "değil" demektir: "kapalı **değilse** yürü." Duvara çapraz gidersen duvara dik olan kısım durur, duvar boyunca
olan kısım devam eder; yapışıp kalmazsın. `move` fonksiyonu oyuncuyu değil herhangi bir **gövdeyi** (`body`) alır;
ileride düşmanlar da aynı fonksiyonu kullanacak.

**Yeni küçük şeyler:**

- `||` "ya da" demektir: `ch === '#' || ch === 'D'` → "duvar ya da kapı".
- `for (const [cx, cy] of [[...], [...]])` → dört köşe noktasının her biri için, onun iki sayısını `cx` ve `cy` diye aç.
- `return true` fonksiyonu hemen bitirir ve "evet" döndürür. Hiçbir köşe çarpmadıysa en sondaki `return false` çalışır.
- `for (const key in DIRS)` → `DIRS` nesnesindeki her adı (`'ArrowUp'`, ...) sırayla `key` yapar.
- `+=` "üstüne ekle" demektir: `x += 3` → `x = x + 3`.
- `null` "hiçbir şey" demektir. `if (dir)` → "`dir` bir şeyse".

**Telefon yön tuşu (pad).** Dokunulan noktayı canvas piksellerine çeviririz (canvas ekranda büyütülmüş ya da küçültülmüş
olabilir, bu yüzden `canvas.width / rect.width` oranıyla çarparız). Sonra dairenin merkezine uzaklığa bakarız:
`Math.hypot(dx, dy)` iki nokta arasındaki düz uzaklıktır. Dairenin içindeyse, yatay fark büyükse sağ/sol, dikey fark
büyükse yukarı/aşağı seçilir. `Math.sign(x)` sayının işaretidir: `1`, `-1` ya da `0`. Daireyi çizmek için
`ctx.arc(x, y, yarıçap, 0, Math.PI * 2)` tam bir çember yolu çizer, `ctx.stroke()` onun sadece çizgisini boyar
(`fill` içini boyardı).

# --task--

1. Add `SPEED = 2.5`, `DIRS` (arrow key to `[dx, dy]`) and a `held` object from `keydown`/`keyup` (`preventDefault()` for arrows).
2. Write `blocked(x, y)`: true if any corner of a `SIZE` box at `(x, y)` is on a wall or door tile, or outside the room (for
   now), and `move(body, dx, dy)` as above.
3. Every frame: the direction is the held arrow key (or the pad's); if there is one, set `player.dir` and move by `SPEED`.
4. Add `PAD = { x: 70, y: 330, r: 60 }`. A `pointerdown` inside it (in canvas pixels) sets `padDir` to the direction of the
   longer axis from its center; `pointerup` clears it. Draw it as a `'rgba(255, 255, 255, 0.25)'` circle outline, 2 wide.

# --task-tr--

1. `const SIZE = 22 ...` satırının altına hızı ekle:

   ```js
   const SPEED = 2.5
   ```

2. `const ROWS = 11` satırının altına yön tablosunu ekle:

   ```js
   const DIRS = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }
   ```

3. `let player` satırının altına basılı tuşlar nesnesini ekle:

   ```js
   const held = {}
   ```

4. `findIn` fonksiyonunun kapanış `}`'sinden sonra, `function draw()`'un **üstüne** şunların hepsini yaz:

   ```js
   const solidTile = (ch) => ch === '#' || ch === 'D'

   // Does a box at (x, y) overlap a wall? For now, outside the room counts as a wall too.
   function blocked(x, y) {
     for (const [cx, cy] of [[x, y], [x + SIZE - 1, y], [x, y + SIZE - 1], [x + SIZE - 1, y + SIZE - 1]]) {
       const row = Math.floor(cy / T)
       const col = Math.floor(cx / T)
       if (row < 0 || row >= ROWS || col < 0 || col >= COLS || solidTile(tiles[row][col])) return true
     }
     return false
   }

   // Move a body, one axis at a time, stopping at walls.
   function move(body, dx, dy) {
     if (!blocked(body.x + dx, body.y)) body.x += dx
     if (!blocked(body.x, body.y + dy)) body.y += dy
   }

   document.addEventListener('keydown', (event) => {
     held[event.key] = true
     if (DIRS[event.key]) event.preventDefault()
   })
   document.addEventListener('keyup', (event) => {
     held[event.key] = false
   })

   // Touch: the pad in the corner moves.
   const PAD = { x: 70, y: 330, r: 60 }
   let padDir = null
   canvas.addEventListener('pointerdown', (event) => {
     const rect = canvas.getBoundingClientRect()
     const x = ((event.clientX - rect.left) * canvas.width) / rect.width
     const y = ((event.clientY - rect.top) * canvas.height) / rect.height
     const dx = x - PAD.x
     const dy = y - PAD.y
     if (Math.hypot(dx, dy) < PAD.r) padDir = Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)]
   })
   canvas.addEventListener('pointerup', () => {
     padDir = null
   })

   function update() {
     let dir = padDir
     for (const key in DIRS) if (held[key]) dir = DIRS[key]
     if (dir) {
       player.dir = dir
       move(player, dir[0] * SPEED, dir[1] * SPEED)
     }
   }
   ```

   `SIZE - 1` kullanıyoruz çünkü 22 piksellik kutunun son pikseli 21. sıradadır (sayma 0'dan başlar).
   `update`, önce pad'in yönünü alır; basılı bir ok tuşu varsa onu kullanır; bir yön varsa oyuncuyu o yöne çevirip yürütür.

5. `draw()` fonksiyonunun sonuna, `ctx.restore()` satırından **sonra**, son `}`'den **önce** pad dairesini ekle:

   ```js
     ctx.restore()

     // The touch pad, faint, in the corner. // ← yeni (buradan aşağısı)
     ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)'
     ctx.lineWidth = 2
     ctx.beginPath()
     ctx.arc(PAD.x, PAD.y, PAD.r, 0, Math.PI * 2)
     ctx.stroke()
   }
   ```

   `rgba(255, 255, 255, 0.25)` dörtte bir görünür beyazdır (son sayı saydamlık).

6. `loop()` içinde `draw()`'un **üstüne** `update()` çağrısını ekle:

   ```js
   function loop() {
     update() // ← yeni
     draw()
     requestAnimationFrame(loop)
   }
   ```

7. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla, sonra ok tuşlarıyla yürü. Duvarlarda durmalı, duvara çapraz
   giderken kaymalısın. Alttaki kontrollerin hepsi yeşil olmalı. Oyuncu hiç kıpırdamıyorsa `update()`'i `loop`'a
   eklediğini kontrol et.

# --tests--

Holding an arrow should walk that way and turn the player.
tr: Bir oku basılı tutmak o yöne yürütmeli ve oyuncuyu döndürmeli.

```js
$.press('ArrowRight')
$.tick(10)
assert.strictEqual(player.x, 126)
assert.deepEqual(player.dir, [1, 0])
$.release('ArrowRight')
$.tick(5)
assert.strictEqual(player.x, 126)
```

A wall should stop the player just before it.
tr: Bir duvar oyuncuyu hemen önünde durdurmalı.

```js
$.press('ArrowUp')
$.tick(30)
assert.strictEqual(player.y, 34)
assert.isTrue(blocked(101, 31.5))
assert.isFalse(blocked(101, 34))
```

The player should slide along a wall instead of sticking to it.
tr: Oyuncu duvara yapışmak yerine boyunca kaymalı.

```js
player.y = 34
const x = player.x
move(player, 3, -3)
assert.strictEqual(player.x, x + 3, 'the part along the wall still moves')
assert.strictEqual(player.y, 34)
```

The touch pad should walk while held.
tr: Yön tuşu basılıyken yürütmeli.

```js
$.pointerDown(110, 330) // right side of the pad
$.tick(4)
assert.strictEqual(player.x, 111)
$.pointerUp(110, 330)
$.tick(4)
assert.strictEqual(player.x, 111)
```

# --solution--

```js
// Dungeon adventure, step by step.
// The page already has <canvas id="game" width="480" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const T = 32 // one tile
const TOP = 48 // room for hearts, keys and the timer
const SIZE = 22 // the player's body
const SPEED = 2.5
// Four rooms, in a 2 by 2 grid. # wall, D locked door, k key, h heart, e enemy, E the stairs out, P the start.
// A gap in the wall at the edge of a room leads to the room next to it.
const ROOMS = [
  [
    [
      '###############',
      '#.............#',
      '#..P..........#',
      '#....###......#',
      '#....#.....e..#',
      '#....#.........',
      '#.............#',
      '#..........h..#',
      '#.............#',
      '#.............#',
      '#######.#######',
    ],
    [
      '###############',
      '#.............#',
      '#..e......e...#',
      '#....#####....#',
      '#.............#',
      '..............#',
      '#.............#',
      '#...##...##...#',
      '#.......e.....#',
      '#.............#',
      '#######D#######',
    ],
  ],
  [
    [
      '#######.#######',
      '#.............#',
      '#..e..........#',
      '#...#######...#',
      '#.............#',
      '#.....k.......#',
      '#.............#',
      '#...#######...#',
      '#..........e..#',
      '#.............#',
      '###############',
    ],
    [
      '#######.#######',
      '#.............#',
      '#.e.........e.#',
      '#.............#',
      '#....#####....#',
      '#....#.E.#....#',
      '#....#...#....#',
      '#.............#',
      '#......e......#',
      '#.............#',
      '###############',
    ],
  ],
]
const COLS = 15
const ROWS = 11
const DIRS = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }

let tiles // the current room
let player
const held = {}

function reset() {
  const start = findIn(ROOMS[0][0], 'P')
  player = { x: start.col * T + (T - SIZE) / 2, y: start.row * T + (T - SIZE) / 2, dir: [0, 1] }
  tiles = ROOMS[0][0].map((line) => [...line].map((ch) => (ch === 'P' ? '.' : ch)))
}

function findIn(lines, ch) {
  const row = lines.findIndex((line) => line.includes(ch))
  return { row, col: lines[row].indexOf(ch) }
}

const solidTile = (ch) => ch === '#' || ch === 'D'

// Does a box at (x, y) overlap a wall? For now, outside the room counts as a wall too.
function blocked(x, y) {
  for (const [cx, cy] of [[x, y], [x + SIZE - 1, y], [x, y + SIZE - 1], [x + SIZE - 1, y + SIZE - 1]]) {
    const row = Math.floor(cy / T)
    const col = Math.floor(cx / T)
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS || solidTile(tiles[row][col])) return true
  }
  return false
}

// Move a body, one axis at a time, stopping at walls.
function move(body, dx, dy) {
  if (!blocked(body.x + dx, body.y)) body.x += dx
  if (!blocked(body.x, body.y + dy)) body.y += dy
}

document.addEventListener('keydown', (event) => {
  held[event.key] = true
  if (DIRS[event.key]) event.preventDefault()
})
document.addEventListener('keyup', (event) => {
  held[event.key] = false
})

// Touch: the pad in the corner moves.
const PAD = { x: 70, y: 330, r: 60 }
let padDir = null
canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height
  const dx = x - PAD.x
  const dy = y - PAD.y
  if (Math.hypot(dx, dy) < PAD.r) padDir = Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)]
})
canvas.addEventListener('pointerup', () => {
  padDir = null
})

function update() {
  let dir = padDir
  for (const key in DIRS) if (held[key]) dir = DIRS[key]
  if (dir) {
    player.dir = dir
    move(player, dir[0] * SPEED, dir[1] * SPEED)
  }
}

function draw() {
  ctx.fillStyle = '#0c0a09'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.save()
  ctx.translate(0, TOP)
  tiles.forEach((line, row) => {
    line.forEach((ch, col) => {
      const x = col * T
      const y = row * T
      ctx.fillStyle = ch === '#' ? '#57534e' : '#d6c7a1'
      ctx.fillRect(x, y, T, T)
      if (ch === 'D') {
        ctx.fillStyle = '#92400e'
        ctx.fillRect(x + 2, y + 2, T - 4, T - 4)
      }
    })
  })

  ctx.fillStyle = '#16a34a'
  ctx.fillRect(player.x, player.y, SIZE, SIZE)
  ctx.restore()

  // The touch pad, faint, in the corner.
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(PAD.x, PAD.y, PAD.r, 0, Math.PI * 2)
  ctx.stroke()
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
