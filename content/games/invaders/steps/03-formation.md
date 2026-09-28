---
title: The formation
title_tr: Düzen
skills: [prog.loops, prog.arrays]
---

# --explanation--

Five rows of nine invaders: 45 objects, built with two nested loops (rows outside, columns inside). Each invader
remembers its **row**, because the row decides its color now and its points later.

```js
invaders.push({ x: 40 + col * SPACING_X, y: 60 + row * SPACING_Y, w: INVADER_W, h: INVADER_H, row, alive: true })
```

Invaders will be shot down one by one. Rather than removing them from the array, mark them `alive: false`. A small
helper, `alive()`, returns just the living ones, so the rest of the code can ask for "the invaders that still matter"
in one call. Keeping a stable list and filtering it on demand is simpler than keeping two lists in sync.

Row colors come from a lookup list, `ROW_COLORS[invader.row]`, so changing the look of a whole row is one edit.

# --explanation-tr--

**Bu adımda:** ekranın üstüne 5 sıra, her sırada 9 tane olmak üzere 45 istilacı dizeceğiz. Çalıştırınca üstte pembe,
mor ve yeşil renkli küçük dikdörtgenlerden bir blok göreceksin.

**Sayarak tekrarlamak: `for` döngüsü.** 45 istilacıyı tek tek yazmak yerine bilgisayara saydırırız:

```js
for (let col = 0; col < 9; col++) {
  // buradaki kod 9 kez çalışır; col sırayla 0, 1, 2, ... 8 olur
}
```

Parantezin içinde üç parça var, noktalı virgülle (`;`) ayrılır:

- `let col = 0` → sayaç 0'dan başlasın.
- `col < 9` → sayaç 9'dan küçük olduğu sürece devam et.
- `col++` → her turdan sonra sayacı 1 artır (`col += 1` ile aynı).

**İç içe döngü.** Bir döngünün içine ikinci bir döngü koyarsak: dıştaki sıraları (`row`, 0'dan 4'e), içteki o
sıradaki sütunları (`col`, 0'dan 8'e) sayar. Dıştaki her tur için içteki baştan sona döner: 5 × 9 = 45 tur. Tıpkı bir
defterin satırlarını tek tek doldurmak gibi.

Her turda bir istilacı ekleriz:

```js
invaders.push({ x: 40 + col * SPACING_X, y: 60 + row * SPACING_Y, w: INVADER_W, h: INVADER_H, row, alive: true })
```

- `*` çarpma işaretidir. `x: 40 + col * 44` → ilk sütun 40'ta, sonraki 84'te, sonraki 128'de... Her sütun bir
  öncekinden 44 piksel sağda. `y` için aynı şey sıralarla: her sıra 36 piksel aşağıda.
- Tek başına `row` yazmak `row: row` demenin kısaltmasıdır: alanın adı ve değeri aynı addan gelir. İstilacı hangi
  sırada olduğunu hatırlar, çünkü sıra şimdi rengini, ileride de puanını belirleyecek.
- `alive: true` → "canlı: evet". `true`/`false` (doğru/yanlış) değerlerine **mantıksal değer** (boolean) denir.

**Silmek yerine işaretlemek.** İstilacılar tek tek vurulacak. Onları listeden silmek yerine `alive: false` diye
işaretleyeceğiz. Küçük bir yardımcı fonksiyon yalnızca canlıları verir:

```js
function alive() {
  return invaders.filter((invader) => invader.alive)
}
```

`return` burada fonksiyonun **cevabını geri verir**: `alive()` yazdığın yere canlı istilacıların listesi gelir.
2. adımdaki `filter` gibi, `invader.alive` doğru olanları tutar. Sabit bir liste tutup gerektiğinde süzmek, iki ayrı
listeyi uyum içinde tutmaktan çok daha kolaydır.

**Renk tablosu.** `ROW_COLORS` beş rengin listesidir. Listedeki elemanlara **sıra numarası** (index) ile ulaşılır ve
sayma **0'dan başlar**: `ROW_COLORS[0]` pembe `'#f472b6'`, `ROW_COLORS[1]` mor, ... `ROW_COLORS[4]` yeşil. Böylece
`ROW_COLORS[invader.row]` istilacının sırasına göre rengini verir; bir sıranın rengini değiştirmek tek düzenleme olur.

# --task--

1. Add `ROWS = 5`, `COLS = 9`, `INVADER_W = 28`, `INVADER_H = 20`, `SPACING_X = 44`, `SPACING_Y = 36` and
   `ROW_COLORS = ['#f472b6', '#a78bfa', '#a78bfa', '#34d399', '#34d399']`.
2. Build `let invaders = []` with nested loops as above.
3. Write `function alive()` returning only the invaders with `alive` set, and draw each living invader as a rectangle in
   its row's color.

# --task-tr--

1. `const COOLDOWN = 350 ...` satırının altına istilacı ayarlarını ekle:

   ```js
   const ROWS = 5
   const COLS = 9
   const INVADER_W = 28
   const INVADER_H = 20
   const SPACING_X = 44
   const SPACING_Y = 36
   const ROW_COLORS = ['#f472b6', '#a78bfa', '#a78bfa', '#34d399', '#34d399']
   ```

2. `let lastShot = -COOLDOWN` satırının altına istilacı listesini kuran döngüleri ekle:

   ```js
   let invaders = []
   for (let row = 0; row < ROWS; row++) {
     for (let col = 0; col < COLS; col++) {
       invaders.push({ x: 40 + col * SPACING_X, y: 60 + row * SPACING_Y, w: INVADER_W, h: INVADER_H, row, alive: true })
     }
   }
   ```

   Her `{` açılışının bir `}` kapanışı olmalı: burada iki döngü var, sonda iki `}` var.

3. `const keys = {}` satırının altına, bir boş satır bırakıp `alive` fonksiyonunu yaz (`shoot` fonksiyonunun üstünde
   kalacak):

   ```js
   function alive() {
     return invaders.filter((invader) => invader.alive)
   }
   ```

4. `draw()` içinde, arka planı boyayan `ctx.fillRect(0, 0, canvas.width, canvas.height)` satırının altına, bir boş
   satır bırakıp canlı istilacıları boyayan bloğu ekle:

   ```js
     for (const invader of alive()) {
       ctx.fillStyle = ROW_COLORS[invader.row]
       ctx.fillRect(invader.x, invader.y, invader.w, invader.h)
     }
   ```

   Döngünün gövdesi iki satır olduğu için süslü parantez içine aldık.

5. **Çalıştır**'a bas. Üstte 5 sıra × 9 istilacıdan oluşan renkli bir blok görmelisin: en üst sıra pembe, sonraki iki
   sıra mor, alttaki iki sıra yeşil. Alttaki kontrollerin hepsi yeşil olmalı.

# --tests--

There should be 45 invaders in 5 rows of 9.
tr: 9'luk 5 sırada 45 istilacı olmalı.

```js
assert.lengthOf(invaders, 45)
assert.deepEqual(invaders[0], { x: 40, y: 60, w: 28, h: 20, row: 0, alive: true })
assert.deepEqual(invaders[44], { x: 392, y: 204, w: 28, h: 20, row: 4, alive: true })
assert.strictEqual(invaders[9].row, 1)
```

`alive()` should skip the invaders that are down.
tr: `alive()` düşürülmüş istilacıları atlamalı.

```js
invaders[0].alive = false
invaders[10].alive = false
assert.lengthOf(alive(), 43)
assert.notInclude(alive(), invaders[0])
```

Living invaders should be drawn in their row's color.
tr: Canlı istilacılar kendi satırlarının renginde çizilmeli.

```js
invaders[0].alive = false
$.tick()
assert.lengthOf($.rects('#f472b6'), 8)
assert.lengthOf($.rects('#a78bfa'), 18)
assert.lengthOf($.rects('#34d399'), 18)
```

# --solution--

```js
// Invaders, step by step.
// The page already has <canvas id="game" width="480" height="520"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SHIP_Y = 480
const SHIP_W = 36
const SHIP_H = 16
const SHIP_SPEED = 4
const BULLET_SPEED = 8
const COOLDOWN = 350 // milliseconds between shots
const ROWS = 5
const COLS = 9
const INVADER_W = 28
const INVADER_H = 20
const SPACING_X = 44
const SPACING_Y = 36
const ROW_COLORS = ['#f472b6', '#a78bfa', '#a78bfa', '#34d399', '#34d399']

let ship = { x: canvas.width / 2 - SHIP_W / 2, y: SHIP_Y, w: SHIP_W, h: SHIP_H }
let bullets = []
let lastShot = -COOLDOWN
let invaders = []
for (let row = 0; row < ROWS; row++) {
  for (let col = 0; col < COLS; col++) {
    invaders.push({ x: 40 + col * SPACING_X, y: 60 + row * SPACING_Y, w: INVADER_W, h: INVADER_H, row, alive: true })
  }
}
let now = 0
const keys = {}

function alive() {
  return invaders.filter((invader) => invader.alive)
}

function shoot() {
  if (now - lastShot < COOLDOWN) return
  lastShot = now
  bullets.push({ x: ship.x + SHIP_W / 2 - 2, y: ship.y - 12, w: 4, h: 12 })
}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if (event.key === ' ') shoot()
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

function update() {
  if (keys.ArrowLeft) ship.x -= SHIP_SPEED
  if (keys.ArrowRight) ship.x += SHIP_SPEED
  ship.x = Math.max(0, Math.min(canvas.width - SHIP_W, ship.x))

  for (const bullet of bullets) bullet.y -= BULLET_SPEED
  bullets = bullets.filter((bullet) => bullet.y + bullet.h > 0)
}

function draw() {
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (const invader of alive()) {
    ctx.fillStyle = ROW_COLORS[invader.row]
    ctx.fillRect(invader.x, invader.y, invader.w, invader.h)
  }

  ctx.fillStyle = '#22d3ee'
  ctx.fillRect(ship.x, ship.y, ship.w, ship.h)
  ctx.fillRect(ship.x + SHIP_W / 2 - 3, ship.y - 6, 6, 6)

  ctx.fillStyle = '#f8fafc'
  for (const bullet of bullets) ctx.fillRect(bullet.x, bullet.y, bullet.w, bullet.h)
}

function loop(time) {
  now = time
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
