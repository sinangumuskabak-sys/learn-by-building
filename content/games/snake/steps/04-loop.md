---
title: The game loop
title_tr: Oyun döngüsü
skills: [game.loop]
---

# --explanation--

A game is a loop that never stops:

```
update the state  →  draw the state  →  wait for the next frame  →  repeat
```

The browser gives you `requestAnimationFrame(fn)`: "call `fn` right before you paint the next frame", which is about
60 times a second. The function asks for the next frame itself, so the loop keeps going:

```js
function loop(time) {
  // ...update and draw...
  requestAnimationFrame(loop)
}
requestAnimationFrame(loop)
```

`time` is the number of milliseconds since the page opened. 60 moves a second would be far too fast for Snake, so we
**only update when enough time has passed** since the last move, but still draw every frame:

```js
if (time - last >= SPEED) {
  last = time
  update()
}
```

Why not just count frames? Because screens run at 60, 120 or 144 frames per second. Measuring **time** makes the snake
move at the same speed on every screen.

# --explanation-tr--

**Bu adımda:** kare hareket etmeye başlayacak. Çalıştırınca yeşil karenin adım adım sağa kaydığını ve sonunda
tahtanın dışına çıkıp kaybolduğunu göreceksin (onu ileride durduracağız).

**Oyun döngüsü (game loop).** Bir oyun, hiç durmayan bir döngüdür:

```
durumu güncelle  →  durumu çiz  →  bir sonraki kareyi bekle  →  baştan
```

Çizgi film gibi düşün: saniyede çok sayıda resim art arda gösterilince hareket görürsün. Her resme **kare
(frame)** denir.

**`requestAnimationFrame`.** Tarayıcı bize şu komutu verir: `requestAnimationFrame(loop)`, yani "ekranı bir
sonraki boyamandan hemen önce `loop` fonksiyonunu çağır". Bu, saniyede yaklaşık 60 kez olur. `loop` işini
bitirince bir sonraki kare için kendini **yeniden ister**, böylece döngü sürer:

```js
function loop(time) {
  // ...güncelle ve çiz...
  requestAnimationFrame(loop)
}
requestAnimationFrame(loop)
```

**Parametre.** `loop(time)` içindeki `time`, fonksiyona dışarıdan verilen bir bilgidir; buna **parametre**
denir. Tarayıcı `loop`'u çağırırken bu kutuya sayfanın açılışından beri geçen süreyi **milisaniye** olarak koyar
(1000 milisaniye = 1 saniye).

**Neden her karede hareket etmiyoruz?** Saniyede 60 adım yılan için çok hızlı. Bu yüzden yalnızca **yeterince
zaman geçtiyse** güncelleriz, ama çizimi her karede yaparız:

```js
if (time - last >= SPEED) {
  last = time
  update()
}
```

Bunu parça parça okuyalım:

- `if ( ... ) { ... }` → "eğer parantezin içindeki doğruysa, süslü parantezin içini yap; değilse atla".
- `time - last` → şimdiki zaman eksi son hareketin zamanı: son hareketten beri geçen süre.
- `>=` → "büyük ya da eşit". Yani "en az `SPEED` milisaniye geçtiyse".
- `last = time` → tek `=` "şunu şuna eşitle" demektir: son hareket zamanını şimdi olarak kaydet.
- `update()` → durumu güncelleyen fonksiyonu çağır.

**Neden kare saymıyoruz da zamana bakıyoruz?** Bazı ekranlar saniyede 60, bazıları 120 ya da 144 kare çizer. Kare
sayarsak yılan hızlı ekranda daha hızlı giderdi. Zamana bakınca her ekranda aynı hızda gider.

**`+=`.** `head.x += 1`, "`head.x`'e 1 ekle" demektir; `head.x = head.x + 1` yazmanın kısa yolu. Sütun
numarası bir artınca kare bir hücre sağa geçer.

# --task--

1. Add `const SPEED = 150` (milliseconds between moves) and `let last = 0`.
2. Write `function update()` that moves the head one cell to the right (`head.x` goes up by 1).
3. Write `function loop(time)` that calls `update()` only when `time - last >= SPEED` (then sets `last = time`),
   calls `draw()` every time, and requests the next frame with `requestAnimationFrame(loop)`.
4. Replace the single `draw()` call at the end with `requestAnimationFrame(loop)`.

Run it: the square should glide to the right and leave the board. We will stop that later.

# --task-tr--

1. `const CELL = 20` satırının hemen altına hız sabitini ekle:

   ```js
   const SPEED = 150 // milliseconds between moves
   ```

   Satırın sonundaki `//` ile başlayan kısım bir yorumdur, yazmasan da olur.

2. `let head = { x: 5, y: 5 }` satırının hemen altına son hareketin zamanını tutacak değişkeni ekle:

   ```js
   let last = 0
   ```

3. `function draw() {` satırının **üstüne** (araya bir boş satır bırakarak) güncelleme fonksiyonunu yaz:

   ```js
   function update() {
     head.x += 1
   }
   ```

4. `draw` fonksiyonunun kapanan `}` işaretinin altına döngü fonksiyonunu yaz:

   ```js
   function loop(time) {
     if (time - last >= SPEED) {
       last = time
       update()
     }
     draw()
     requestAnimationFrame(loop)
   }
   ```

5. En alttaki tek başına duran `draw()` satırını sil ve yerine döngüyü başlatan satırı yaz:

   ```js
   requestAnimationFrame(loop)
   ```

   Artık en altta `draw()` yok; çizimi döngü her karede kendisi yapıyor.

6. **Çalıştır**'a bas. Yeşil kare sağa doğru kaymalı ve tahtadan çıkıp kaybolmalı. Alttaki kontrollerin hepsi
   yeşil olmalı. Kare hiç kıpırdamıyorsa `loop` içindeki `requestAnimationFrame(loop)` satırını ya da en alttaki
   başlatma satırını kontrol et.

# --tests--

`update()` should move the head one cell to the right.
tr: `update()` başı bir hücre sağa taşımalı.

```js
head = { x: 3, y: 4 }
update()
assert.deepEqual(head, { x: 4, y: 4 })
```

The loop should keep running by requesting the next frame.
tr: Döngü bir sonraki kareyi isteyerek çalışmaya devam etmeli.

```js
$.tick(10)
assert.strictEqual($.pendingFrames, 1, 'loop() should call requestAnimationFrame(loop) once per frame')
```

The head should not move every frame, only every `SPEED` milliseconds.
tr: Baş her karede değil, yalnızca her `SPEED` milisaniyede bir hareket etmeli.

```js
$.tick(5)
assert.strictEqual(head.x, 5)
```

After one second the head should have moved about 6 cells.
tr: Bir saniye sonra baş yaklaşık 6 hücre ilerlemiş olmalı.

```js
$.run(1)
assert.isAtLeast(head.x, 10)
assert.isAtMost(head.x, 12)
assert.strictEqual(head.y, 5)
```

The square on screen should follow the head.
tr: Ekrandaki kare başı takip etmeli.

```js
$.run(1)
assert.deepEqual($.rects('lime'), [{ x: head.x * 20, y: 100, w: 20, h: 20, color: 'lime' }])
```

# --solution--

```js
// Snake, step by step.
// The page already has <canvas id="game" width="400" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const CELL = 20
const SPEED = 150 // milliseconds between moves
let head = { x: 5, y: 5 }
let last = 0

function update() {
  head.x += 1
}

function draw() {
  ctx.fillStyle = '#111'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'lime'
  ctx.fillRect(head.x * CELL, head.y * CELL, CELL, CELL)
}

function loop(time) {
  if (time - last >= SPEED) {
    last = time
    update()
  }
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
