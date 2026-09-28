---
title: Hits and points
title_tr: İsabetler ve puanlar
skills: [game.collision, prog.arrays]
---

# --explanation--

A bullet that overlaps a living invader destroys it. That is a box test between every bullet and every invader:
**nested loops over two lists**. For each bullet, `find` the first living invader it overlaps.

When a bullet hits, **both** are used up: the invader is marked dead, and the bullet must not go on to hit the invader
behind it. The simplest trick is to move the used bullet off the top of the screen; the `filter` that already removes
off-screen bullets then throws it away. Reusing an existing cleanup instead of writing a second removal path keeps the
code short and hard to get wrong.

Top rows are harder to reach, so they are worth more: `ROW_POINTS[invader.row]`, the same lookup-by-row idea as the
colors.

With 45 invaders and a few bullets, checking every pair is only a hundred or so tests per frame, nothing for a
computer. With thousands of objects, games switch to smarter spatial structures, but the idea of the test stays the
same.

# --explanation-tr--

**Bu adımda:** mermiler istilacıları vuracak. Vurulan istilacı kaybolacak, mermi de harcanacak, sol üstte `SCORE 10`
gibi bir puan yazısı görünecek.

**Çakışıyorlar mı? Kutu testi.** Mermi de istilacı da birer dikdörtgen. İki dikdörtgen, dört koşulun **hepsi** doğruysa
üst üste biner:

```js
function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}
```

- `a` ve `b` fonksiyonun **parametreleridir**: çağırırken verdiğin iki şeyin geçici adları. `overlaps(bullet, invader)`
  yazınca içeride `a` mermi, `b` istilacı olur.
- `a.x < b.x + b.w` → "a'nın sol kenarı, b'nin sağ kenarından solda". `a.x + a.w > b.x` → "a'nın sağ kenarı, b'nin sol
  kenarından sağda". Son ikisi aynı şeyi yukarı-aşağı için söyler. Dördü birden doğruysa kutular kesişir.
- Fonksiyon bu karşılaştırmanın sonucunu (`true` ya da `false`) `return` ile geri verir.

**İlk eşleşeni bulmak (`find`).** Her mermi için, değdiği ilk canlı istilacıyı ararız:

```js
const hit = invaders.find((invader) => invader.alive && overlaps(bullet, invader))
```

`find`, `filter`'a benzer ama liste değil, kurala uyan **ilk elemanı** verir. Hiçbiri uymazsa `undefined` (tanımsız,
"yok") verir. `if (hit)` bu yüzden "bir şey bulunduysa" diye okunur: bulunan nesne doğru, `undefined` yanlış sayılır.

Bu, iki listenin iç içe dolaşılmasıdır: her mermi için bütün istilacılar denenir. 45 istilacı ve birkaç mermiyle bu
karede yüz kadar test eder; bilgisayar için hiçbir şey. Binlerce nesne olsa oyunlar daha akıllı yapılar kullanır, ama
test fikri aynı kalır.

**İkisi de harcanır.** Vuruş olunca istilacı ölü işaretlenir (`hit.alive = false`), mermi de arkadaki istilacıyı
vurmaya devam etmemeli. En basit numara: mermiyi ekranın üstüne, `y = -100`'e ışınlamak. 2. adımda yazdığın `filter`
ekrandan çıkanları zaten atıyor; yani ikinci bir silme yolu yazmak gerekmez. Var olan bir temizliği yeniden kullanmak
kodu kısa ve hataya kapalı tutar. Bunun için vuruş kontrolü `filter` satırından **önce** gelmeli.

**Puan.** Üst sıralara ulaşmak zordur, o yüzden daha değerlidir: `ROW_POINTS[hit.row]`, renklerdeki "sıraya göre
tablodan bak" fikrinin aynısı. `score += 30` puanı 30 artırır.

**Yazı yazmak.** Fırçayla yazı da boyanır:

```js
ctx.font = 'bold 16px monospace'   // kalın, 16 piksel, eşit genişlikli harfler
ctx.textAlign = 'left'             // verdiğin noktadan sağa doğru yaz
ctx.fillText('SCORE ' + score, 10, 24)
```

`'SCORE ' + score` bir yazıyla bir sayıyı `+` ile yan yana ekler: `score` 30 ise sonuç `'SCORE 30'` olur. Tırnağın
içindeki boşluk, kelimeyle sayı arasındaki boşluktur. `10, 24` yazının yeridir.

# --task--

1. Add `ROW_POINTS = [30, 20, 20, 10, 10]`, `let score = 0` and an `overlaps(a, b)` box test.
2. In `update()`, after moving the bullets: for each bullet, find the first living invader it overlaps; if there is
   one, mark it dead, move the bullet to `y = -100`, and add `ROW_POINTS[invader.row]` to the score. (Do this before the
   off-screen `filter`.)
3. Draw `SCORE 120` (the real number) in white `'bold 16px monospace'`, left-aligned at `(10, 24)`.

# --task-tr--

1. `const SPACING_Y = 36` satırının altına sıra puanlarını ekle:

   ```js
   const ROW_POINTS = [30, 20, 20, 10, 10]
   ```

2. `let lastStep = 0` satırının altına skoru ekle:

   ```js
   let score = 0
   ```

3. `const keys = {}` satırının altına, bir boş satır bırakıp kutu testini yaz (`alive` fonksiyonunun üstünde kalacak):

   ```js
   function overlaps(a, b) {
     return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
   }
   ```

4. `update()` içinde mermileri taşıyan satırla onları eleyen satırın **arasına** vuruş kontrolünü ekle:

   ```js
     for (const bullet of bullets) bullet.y -= BULLET_SPEED

     for (const bullet of bullets) { // ← yeni blok
       const hit = invaders.find((invader) => invader.alive && overlaps(bullet, invader))
       if (hit) {
         hit.alive = false
         bullet.y = -100 // used up; removed below
         score += ROW_POINTS[hit.row]
       }
     }
     bullets = bullets.filter((bullet) => bullet.y + bullet.h > 0)
   ```

5. `draw()` fonksiyonunun sonuna, mermileri boyayan satırın altına, bir boş satır bırakıp skoru yazan satırları ekle:

   ```js
     ctx.fillStyle = 'white'
     ctx.font = 'bold 16px monospace'
     ctx.textAlign = 'left'
     ctx.fillText('SCORE ' + score, 10, 24)
   ```

6. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla ve Boşluk ile ateş et: vurduğun istilacı kaybolmalı, sol üstte
   `SCORE 10` yazmalı (üst sıralar 20 ve 30 puan). Alttaki kontrollerin hepsi yeşil olmalı. Bir mermi arka arkaya iki
   istilacıyı vuruyorsa vuruş bloğunu `filter` satırının **üstüne** koyduğundan emin ol.

# --tests--

A bullet should destroy the invader it hits and score its row's points.
tr: Bir mermi çarptığı istilacıyı yok etmeli ve satırının puanını kazandırmalı.

```js
const target = invaders[40] // bottom row
bullets = [{ x: target.x + 10, y: target.y + 25, w: 4, h: 12 }]
update()
assert.isFalse(target.alive)
assert.strictEqual(score, 10)
assert.lengthOf(bullets, 0, 'the bullet is used up')
```

A bullet should only destroy one invader.
tr: Bir mermi yalnızca bir istilacıyı yok etmeli.

```js
const front = invaders[40]
const behind = invaders[31]
bullets = [{ x: front.x + 10, y: front.y + 25, w: 4, h: 12 }]
update()
update()
update()
update()
update()
update()
assert.isFalse(front.alive)
assert.isTrue(behind.alive)
```

Top rows should be worth more, and the score should be shown.
tr: Üst sıralar daha değerli olmalı ve skor gösterilmeli.

```js
const top = invaders[4]
bullets = [{ x: top.x + 10, y: top.y + 25, w: 4, h: 12 }]
update()
assert.strictEqual(score, 30)
draw()
assert.include($.texts(), 'SCORE 30')
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
const ROW_POINTS = [30, 20, 20, 10, 10]
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
let dir = 1 // +1 marching right, -1 marching left
let lastStep = 0
let score = 0
let now = 0
const keys = {}

function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

function alive() {
  return invaders.filter((invader) => invader.alive)
}

function shoot() {
  if (now - lastShot < COOLDOWN) return
  lastShot = now
  bullets.push({ x: ship.x + SHIP_W / 2 - 2, y: ship.y - 12, w: 4, h: 12 })
}

function stepInterval() {
  return 500
}

function march() {
  const living = alive()
  const left = Math.min(...living.map((invader) => invader.x))
  const right = Math.max(...living.map((invader) => invader.x + invader.w))
  if ((dir > 0 && right + 10 > canvas.width - 10) || (dir < 0 && left - 10 < 10)) {
    for (const invader of living) invader.y += 16
    dir = -dir
  } else {
    for (const invader of living) invader.x += 10 * dir
  }
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

  for (const bullet of bullets) {
    const hit = invaders.find((invader) => invader.alive && overlaps(bullet, invader))
    if (hit) {
      hit.alive = false
      bullet.y = -100 // used up; removed below
      score += ROW_POINTS[hit.row]
    }
  }
  bullets = bullets.filter((bullet) => bullet.y + bullet.h > 0)

  if (now - lastStep >= stepInterval()) {
    lastStep = now
    march()
  }
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

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px monospace'
  ctx.textAlign = 'left'
  ctx.fillText('SCORE ' + score, 10, 24)
}

function loop(time) {
  now = time
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
