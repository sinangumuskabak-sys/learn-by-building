---
title: Spawning pipes
title_tr: Boru üretmek
skills: [prog.arrays, game.loop]
---

# --explanation--

The bird never actually moves forward. The **world** moves backwards past it. That is how most side-scrollers work:
keep the player near a fixed `x` and slide everything else to the left.

A pipe pair is just one object: its `x`, and the `gapY` where the opening starts. The two green rectangles are derived
from it when drawing:

```
top pipe:     from y = 0            down to gapY
bottom pipe:  from y = gapY + GAP   down to the bottom
```

The pipes live in an **array** that changes all the time:

- **spawn**: every `PIPE_EVERY` frames, push a new pipe at the right edge. Count frames with a counter and use the
  remainder operator: `frame % PIPE_EVERY === 0` is true on frames 90, 180, 270...
- **move**: every frame, subtract `PIPE_SPEED` from each pipe's `x`.
- **despawn**: once a pipe is completely off the left edge, remove it. `array.filter` keeps only the items you want.

Forgetting the last part is a real bug called a *memory leak*: the array grows forever, and the game gets slower the
longer you play.

The random gap position uses `Math.random()` scaled into a range, with a margin so the opening is never glued to the
top or bottom edge.

# --explanation-tr--

**Bu adımda:** yeşil borular ekleyeceğiz. Oyun başlayınca sağ kenardan belirli aralıklarla üstte ve altta ikişer
yeşil dikdörtgen çıkacak, aralarında bir boşluk olacak ve sola doğru kayacaklar. (Çarpma henüz yok, borunun
içinden geçebilirsin.)

**Kuş aslında ileri gitmiyor.** **Dünya** kuşun yanından geriye kayıyor. Yandan görünen oyunların çoğu böyle çalışır:
oyuncu hep aynı `x` noktasında kalır, geri kalan her şey sola kaydırılır.

**Bir boru çifti = bir nesne.** Her boru için iki bilgi yeter: `x` (soldan uzaklığı) ve `gapY` (açıklığın başladığı
yükseklik). İki yeşil dikdörtgeni çizerken bunlardan hesaplarız:

```
üst boru:  y = 0'dan            gapY'ye kadar
alt boru:  y = gapY + GAP'ten   canvas'ın dibine kadar
```

`GAP` açıklığın boyu (160 piksel).

**Dizi (array): sıralı bir liste.** Ekranda aynı anda birkaç boru olacak. Birden çok şeyi tutmak için **dizi**
kullanırız. Köşeli parantezle yazılır:

```js
let pipes = []                        // boş bir liste
pipes.push({ x: 400, gapY: 200 })     // listenin sonuna bir boru ekle
pipes.length                          // listede kaç şey var? (şimdi 1)
pipes[0]                              // ilk eleman (sayma 0'dan başlar!)
```

**Her eleman için bir kez: `for ... of` döngüsü.**

```js
for (const pipe of pipes) pipe.x -= PIPE_SPEED
```

"`pipes` listesindeki her eleman için, o elemana sırayla `pipe` de ve `pipe.x`'ten `PIPE_SPEED` çıkar." `-=`
"üstünden çıkar" demektir (`+=`'nin tersi). Döngünün yapacağı iş birden fazla satırsa `{ }` içine yazılır.

**Borular üç iş yapar:**

- **Doğmak:** her `PIPE_EVERY` (90) karede bir, sağ kenarda yeni bir boru eklenir. Kareleri `frame` adlı bir sayaçla
  sayarız. `%` işareti **bölümden kalanı** verir: `180 % 90` sıfırdır, `181 % 90` birdir. Yani
  `frame % PIPE_EVERY === 0` sadece 90, 180, 270... karelerinde doğrudur.
- **Kaymak:** her karede her borunun `x`'inden `PIPE_SPEED` (2) çıkarılır.
- **Silinmek:** sol kenardan tamamen çıkan boru listeden atılır. `filter` bir listenin sadece istediğin elemanlarını
  tutan yeni bir liste verir:

  ```js
  pipes = pipes.filter((pipe) => pipe.x + PIPE_WIDTH > 0)
  ```

  "Sağ kenarı (`pipe.x + PIPE_WIDTH`) hâlâ 0'dan büyük olan boruları tut." Buradaki ok fonksiyonunda `{ }` yok; o
  zaman `=>`'nin sağındaki sorunun cevabı (doğru/yanlış) doğrudan geri verilir.

Son maddeyi unutmak gerçek bir hatadır (*bellek sızıntısı*, memory leak): liste sonsuza kadar büyür ve oynadıkça oyun
yavaşlar.

**Rastgele açıklık.** `Math.random()` her çağrıldığında 0 ile 1 arasında (1 hariç) rastgele bir kesirli sayı
verir. Onu istediğimiz aralığa büyütürüz:

```js
const gapY = 60 + Math.random() * (canvas.height - GAP - 120)
```

`canvas.height - GAP - 120` = 600 − 160 − 120 = 320. Rastgele sayı 320 ile çarpılınca 0–320 arası olur, 60 eklenince
60–380 arası. Böylece açıklık hiçbir zaman üst ya da alt kenara yapışmaz (60 piksellik pay kalır).

`{ x: canvas.width, gapY }` içindeki `gapY` kısaltmadır: `gapY: gapY` yazmakla aynıdır ("`gapY` alanına `gapY`
sabitinin değerini koy").

# --task--

1. Add constants `PIPE_WIDTH = 60`, `GAP = 160`, `PIPE_SPEED = 2`, `PIPE_EVERY = 90`, and variables
   `let pipes = []` and `let frame = 0`.
2. Write `function addPipe()` that pushes `{ x: canvas.width, gapY }` onto `pipes`, where `gapY` is a random number
   between `60` and `canvas.height - GAP - 60`:
   `const gapY = 60 + Math.random() * (canvas.height - GAP - 120)`.
3. In `update()` (while playing), before the ground check: add 1 to `frame` and call `addPipe()` when
   `frame % PIPE_EVERY === 0`; move every pipe left by `PIPE_SPEED`; then keep only pipes whose right edge
   (`pipe.x + PIPE_WIDTH`) is still greater than `0`.
4. In `draw()`, before the bird, draw each pipe as two `'green'` rectangles `PIPE_WIDTH` wide: the top one from `0`
   to `gapY`, the bottom one from `gapY + GAP` to the bottom of the canvas.

# --task-tr--

1. `const FLAP = -8 ...` satırının altına boru ayarlarını ekle:

   ```js
   const PIPE_WIDTH = 60
   const GAP = 160
   const PIPE_SPEED = 2
   const PIPE_EVERY = 90 // frames between new pipes
   ```

2. `let state = 'ready' ...` satırının altına boru listesini ve kare sayacını ekle:

   ```js
   let pipes = []
   let frame = 0
   ```

3. `canvas.addEventListener('pointerdown', flap)` satırının altına bir boş satır bırak ve yeni boru ekleyen
   fonksiyonu yaz:

   ```js
   function addPipe() {
     const gapY = 60 + Math.random() * (canvas.height - GAP - 120)
     pipes.push({ x: canvas.width, gapY })
   }
   ```

4. `update()` fonksiyonuna, kuşu hareket ettiren satırlarla `hitGround` satırı arasına boruların doğma, kayma ve
   silinme satırlarını ekle:

   ```js
   function update() {
     if (state !== 'playing') return
     bird.vy += GRAVITY
     bird.y += bird.vy

     frame += 1                                                // ← yeni
     if (frame % PIPE_EVERY === 0) addPipe()                   // ← yeni
     for (const pipe of pipes) pipe.x -= PIPE_SPEED            // ← yeni
     pipes = pipes.filter((pipe) => pipe.x + PIPE_WIDTH > 0)   // ← yeni

     const hitGround = bird.y + bird.r >= canvas.height
     const hitSky = bird.y - bird.r <= 0
     if (hitGround || hitSky) state = 'over'
   }
   ```

5. `draw()` fonksiyonunda, gökyüzünü boyayan `ctx.fillRect(0, 0, canvas.width, canvas.height)` satırının altına,
   kuştan **önce**, boruları çizen satırları ekle (önce çizilen arkada kalır):

   ```js
     ctx.fillStyle = 'green'
     for (const pipe of pipes) {
       ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY)
       ctx.fillRect(pipe.x, pipe.gapY + GAP, PIPE_WIDTH, canvas.height - pipe.gapY - GAP)
     }
   ```

   Alt borunun boyu: canvas'ın boyundan açıklığın bittiği yer çıkarılınca kalan kısım.

6. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Oynamak için önce oyuna tıkla, sonra Boşluk'a bas: birkaç saniyede
   bir sağdan yeşil borular gelip sola kaymalı. Alttaki kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa: sayıları
   (60, 160, 2, 90) ve `addPipe` içindeki `120`'yi kontrol et.

# --tests--

The pipe constants should have the given values.
tr: Boru sabitleri verilen değerlerde olmalı.

```js
assert.deepEqual([PIPE_WIDTH, GAP, PIPE_SPEED, PIPE_EVERY], [60, 160, 2, 90])
assert.deepEqual(pipes, [])
assert.strictEqual(frame, 0)
```

`addPipe()` should add a pipe at the right edge with its gap inside the margins.
tr: `addPipe()` sağ kenara, açıklığı paylar içinde kalan bir boru eklemeli.

```js
for (let i = 0; i < 40; i++) addPipe()
assert.lengthOf(pipes, 40)
for (const pipe of pipes) {
  assert.strictEqual(pipe.x, 400)
  assert.isAtLeast(pipe.gapY, 60)
  assert.isAtMost(pipe.gapY, 380)
}
assert.isAbove(new Set(pipes.map((p) => p.gapY)).size, 1, 'gapY should be random')
```

A new pipe should appear every 90 frames of play.
tr: Oyun sırasında her 90 karede bir yeni boru çıkmalı.

```js
state = 'playing'
for (let i = 0; i < 89; i++) {
  bird.y = 300
  bird.vy = 0
  update()
}
assert.lengthOf(pipes, 0)
update()
assert.lengthOf(pipes, 1)
```

Pipes should move left and be removed once they leave the screen.
tr: Borular sola kaymalı ve ekrandan çıkınca silinmeli.

```js
state = 'playing'
pipes = [{ x: 200, gapY: 200 }, { x: -59, gapY: 200 }]
update()
assert.lengthOf(pipes, 1)
assert.strictEqual(pipes[0].x, 198)
```

Each pipe should be drawn as a top and a bottom green rectangle.
tr: Her boru üstte ve altta birer yeşil dikdörtgen olarak çizilmeli.

```js
pipes = [{ x: 200, gapY: 150 }]
draw()
assert.sameDeepMembers($.rects('green'), [
  { x: 200, y: 0, w: 60, h: 150, color: 'green' },
  { x: 200, y: 310, w: 60, h: 290, color: 'green' },
])
```

# --solution--

```js
// Flappy, step by step.
// The page already has <canvas id="game" width="400" height="600"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GRAVITY = 0.5 // added to the bird's speed every frame
const FLAP = -8 // the bird's speed right after a flap (negative = up)
const PIPE_WIDTH = 60
const GAP = 160
const PIPE_SPEED = 2
const PIPE_EVERY = 90 // frames between new pipes

let bird = { x: 100, y: 300, vy: 0, r: 14 }
let state = 'ready' // 'ready', 'playing' or 'over'
let pipes = []
let frame = 0

function flap() {
  if (state === 'over') return
  state = 'playing'
  bird.vy = FLAP
}

document.addEventListener('keydown', (event) => {
  if (event.key === ' ' || event.key === 'ArrowUp') flap()
})
canvas.addEventListener('pointerdown', flap)

function addPipe() {
  const gapY = 60 + Math.random() * (canvas.height - GAP - 120)
  pipes.push({ x: canvas.width, gapY })
}

function update() {
  if (state !== 'playing') return
  bird.vy += GRAVITY
  bird.y += bird.vy

  frame += 1
  if (frame % PIPE_EVERY === 0) addPipe()
  for (const pipe of pipes) pipe.x -= PIPE_SPEED
  pipes = pipes.filter((pipe) => pipe.x + PIPE_WIDTH > 0)

  const hitGround = bird.y + bird.r >= canvas.height
  const hitSky = bird.y - bird.r <= 0
  if (hitGround || hitSky) state = 'over'
}

function draw() {
  ctx.fillStyle = '#70c5ce'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'green'
  for (const pipe of pipes) {
    ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY)
    ctx.fillRect(pipe.x, pipe.gapY + GAP, PIPE_WIDTH, canvas.height - pipe.gapY - GAP)
  }

  ctx.fillStyle = 'gold'
  ctx.beginPath()
  ctx.arc(bird.x, bird.y, bird.r, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = 'white'
  ctx.textAlign = 'center'
  if (state === 'ready') {
    ctx.font = '22px sans-serif'
    ctx.fillText('Press Space to start', canvas.width / 2, canvas.height / 2 + 80)
  }
  if (state === 'over') {
    ctx.font = 'bold 36px sans-serif'
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2)
  }
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
