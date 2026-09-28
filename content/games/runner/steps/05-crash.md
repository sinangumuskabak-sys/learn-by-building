---
title: Forgiving hitboxes
title_tr: Affedici çarpışma kutuları
skills: [game.collision, game.state]
---

# --explanation--

Crashing into a cactus should end the run. The collision test is the familiar box-versus-box check, with one
deliberate twist: the boxes are **shrunk** by a few pixels first.

```js
runner.x + MARGIN < o.x + o.w &&
runner.x + runner.w - MARGIN > o.x &&
runner.y + MARGIN < o.y + o.h &&
runner.y + runner.h - MARGIN > o.y
```

Why cheat in the player's favour? Because players judge collisions by what they **see**, and real shapes are rarely
full rectangles (a cactus has arms, a dinosaur has a tail). A corner that barely touches feels like a bug: "I cleared
that!". Almost every action game uses hitboxes a little smaller than the art. Being generous here makes the game feel
fair, and costs nothing.

When the run ends, freeze everything in a new `'over'` state and say so on screen.

# --explanation-tr--

**Bu adımda:** kaktüse çarpınca oyun bitecek. Her şey olduğu yerde donacak ve ortada büyük harflerle "Game Over"
yazacak. Ama bir köşenin zar zor değmesi çarpma sayılmayacak.

**İki kutu çakışıyor mu?** Koşucu da kaktüs de dikdörtgen. İki dikdörtgen, dört koşulun **hepsi** doğruysa üst
üste biner:

- koşucunun sol kenarı, kaktüsün sağ kenarından solda (`runner.x < o.x + o.w`),
- koşucunun sağ kenarı, kaktüsün sol kenarından sağda (`runner.x + runner.w > o.x`),
- koşucunun üst kenarı, kaktüsün alt kenarından yukarıda (`runner.y < o.y + o.h`),
- koşucunun alt kenarı, kaktüsün üst kenarından aşağıda (`runner.y + runner.h > o.y`).

Biri bile yanlışsa aralarında boşluk vardır. Dördünü `&&` ("ve") ile bağlarız.

**Oyuncunun lehine küçük bir hile.** Kutuları önce birkaç piksel **küçültürüz** (`MARGIN = 6`): her kenar 6 piksel
içeri çekilir. Neden? Oyuncu çarpışmayı **gördüğüne** göre değerlendirir; gerçek şekiller de tam dikdörtgen değildir
(kaktüsün kolları, dinozorun kuyruğu vardır). Köşenin hafifçe değmesi oyuncuya hata gibi gelir: "Ama geçmiştim!".
Neredeyse bütün aksiyon oyunları çizimden biraz küçük çarpışma kutusu kullanır. Cömert olmak oyunu adil hissettirir.

```js
function hits(o) {
  return (
    runner.x + MARGIN < o.x + o.w &&
    runner.x + runner.w - MARGIN > o.x &&
    runner.y + MARGIN < o.y + o.h &&
    runner.y + runner.h - MARGIN > o.y
  )
}
```

**Parametre.** `hits(o)` fonksiyonunun parantezindeki `o` bir **parametredir**: çağıran kişinin verdiği şeyin
fonksiyon içindeki geçici adı. `hits(kaktus)` diye çağırınca, içeride `o` o kaktüs olur. `return ( ... )` uzun
koşulu birkaç satıra bölmek için parantez içine alır; sonuç yine tek bir `true`/`false`'tur.

**Herhangi biri çarptı mı?** Dizinin `some` komutu listedeki elemanları tek tek verilen fonksiyona sorar ve **en az
biri** için `true` gelirse `true` döner:

```js
if (obstacles.some(hits)) state = 'over'
```

Yine `hits`'i parantezsiz veriyoruz: "her kaktüs için bunu çağır" diyoruz.

**Üçüncü durum: `'over'`.** Çarpınca `state = 'over'` olur. `update()` zaten "koşmuyorsak dur" dediği için her şey
kendiliğinden donar. `jump()` de oyun bittiyse hiçbir şey yapmamalı; en başta `return` ile çıkar.

# --task--

1. Add `const MARGIN = 6` and `function hits(o)` that returns the shrunk box-overlap test above.
2. In `update()`, after moving the obstacles: if any obstacle `hits` the runner, set `state = 'over'`.
3. `jump()` should do nothing when the game is over.
4. When `'over'`, draw `Game Over` centered (`'bold 28px sans-serif'`).

# --task-tr--

1. `const CUT = -4 ...` satırının hemen **altına** ekle:

   ```js
   const MARGIN = 6 // forgiving hitboxes: shrink both boxes by this much
   ```

2. `let state = 'ready' ...` satırının sonundaki yorumu yeni durumu gösterecek şekilde güncelleyebilirsin
   (isteğe bağlı): `let state = 'ready' // 'ready', 'running' or 'over'`.

3. `jump()` fonksiyonunun en başına, oyun bittiyse çıkan satırı ekle:

   ```js
   function jump() {
     if (state === 'over') return // ← yeni
     state = 'running'
     if (onGround()) runner.vy = JUMP
   }
   ```

4. `spawn()` fonksiyonunun kapanan `}`'sinin altına bir satır boşluk bırakıp çarpışma fonksiyonunu yaz:

   ```js
   function hits(o) {
     return (
       runner.x + MARGIN < o.x + o.w &&
       runner.x + runner.w - MARGIN > o.x &&
       runner.y + MARGIN < o.y + o.h &&
       runner.y + runner.h - MARGIN > o.y
     )
   }
   ```

5. `update()` fonksiyonunda en sondaki `obstacles = obstacles.filter(...)` satırının altına, kapanan `}`'den önce,
   bir satır boşluk bırakıp şunu ekle:

   ```js
     if (obstacles.some(hits)) state = 'over'
   ```

6. `draw()` fonksiyonunun sonundaki yazı bölümünü, iki durumu da gösterecek şekilde değiştir. Kaktüsleri çizen
   `for` satırından sonrası şöyle olmalı:

   ```js
     ctx.fillStyle = '#334155'
     ctx.textAlign = 'center'
     if (state === 'ready') {                        // ← değişti
       ctx.font = '16px sans-serif'                  // ← buraya taşındı
       ctx.fillText('Press Space to start', canvas.width / 2, canvas.height / 2)
     }
     if (state === 'over') {                         // ← yeni
       ctx.font = 'bold 28px sans-serif'
       ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2)
     }
   }
   ```

   Her yazının kendi boyu olduğu için `ctx.font` satırı `if`'lerin içine girdi.

7. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla, Boşluk'la başlat ve bir kaktüse çarp: her şey durmalı ve
   "Game Over" yazmalı. Zıplayarak kaktüsleri geçebilmelisin. Alttaki kontrollerin hepsi yeşil olmalı. "Zar zor
   değen köşe" testi kırmızıysa `hits` içindeki `+ MARGIN` ve `- MARGIN` yerlerini karşılaştır.

# --tests--

Only a real overlap should count, not a corner that barely touches.
tr: Zar zor değen bir köşe değil, yalnızca gerçek bir kesişim sayılmalı.

```js
assert.strictEqual(MARGIN, 6)
assert.isTrue(hits({ x: 70, y: 140, w: 20, h: 40 }), 'cactus right in front, overlapping')
assert.isFalse(hits({ x: 86, y: 140, w: 20, h: 40 }), 'overlaps by only 4 px: forgiven')
assert.isFalse(hits({ x: 200, y: 140, w: 20, h: 40 }), 'far away')
runner.y = 90
assert.isFalse(hits({ x: 60, y: 140, w: 20, h: 40 }), 'jumping over it')
```

Running into a cactus should end the game and freeze it.
tr: Bir kaktüse çarpmak oyunu bitirmeli ve dondurmalı.

```js
$.press(' ')
$.tick(60)
runner.y = 136
runner.vy = 0
obstacles = [{ x: 80, y: 140, w: 20, h: 40 }]
update()
assert.strictEqual(state, 'over')
const x = obstacles[0].x
$.tick(10)
assert.strictEqual(obstacles[0].x, x)
assert.include($.texts(), 'Game Over')
$.press(' ')
assert.strictEqual(state, 'over')
```

Jumping at the right time should clear a cactus.
tr: Doğru anda zıplamak bir kaktüsü geçmeyi sağlamalı.

```js
$.press(' ')
$.release(' ')
$.tick(40)
obstacles = [{ x: 200, y: 140, w: 20, h: 40 }]
nextIn = 1000
// The cactus reaches the runner in about 20 frames; jump 10 frames before that.
$.tick(10)
$.press(' ')
$.tick(40)
assert.strictEqual(state, 'running')
```

# --solution--

```js
// Endless runner, step by step.
// The page already has <canvas id="game" width="600" height="220"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GROUND = 180 // y of the ground line
const GRAVITY = 0.6
const JUMP = -11 // speed at the start of a jump (negative = up)
const CUT = -4 // letting go early caps the upward speed at this
const MARGIN = 6 // forgiving hitboxes: shrink both boxes by this much

let runner = { x: 50, y: GROUND - 44, w: 40, h: 44, vy: 0 }
let state = 'ready' // 'ready', 'running' or 'over'
let obstacles = []
let speed = 6
let nextIn = 60 // frames until the next obstacle

function onGround() {
  return runner.y + runner.h >= GROUND
}

function jump() {
  if (state === 'over') return
  state = 'running'
  if (onGround()) runner.vy = JUMP
}

// Letting go early makes a short hop: cap the upward speed.
function endJump() {
  if (runner.vy < CUT) runner.vy = CUT
}

document.addEventListener('keydown', (event) => {
  if ((event.key === ' ' || event.key === 'ArrowUp') && !event.repeat) jump()
})
document.addEventListener('keyup', (event) => {
  if (event.key === ' ' || event.key === 'ArrowUp') endJump()
})
canvas.addEventListener('pointerdown', jump)
canvas.addEventListener('pointerup', endJump)

function spawn() {
  obstacles.push({ x: canvas.width, y: GROUND - 40, w: 20, h: 40 })
  // At least 50 frames apart, so there is always room to land and jump again.
  nextIn = 50 + Math.floor(Math.random() * 70)
}

function hits(o) {
  return (
    runner.x + MARGIN < o.x + o.w &&
    runner.x + runner.w - MARGIN > o.x &&
    runner.y + MARGIN < o.y + o.h &&
    runner.y + runner.h - MARGIN > o.y
  )
}

function update() {
  if (state !== 'running') return

  runner.vy += GRAVITY
  runner.y += runner.vy
  if (onGround()) {
    runner.y = GROUND - runner.h
    runner.vy = 0
  }

  nextIn -= 1
  if (nextIn <= 0) spawn()
  for (const o of obstacles) o.x -= speed
  obstacles = obstacles.filter((o) => o.x + o.w > 0)

  if (obstacles.some(hits)) state = 'over'
}

function draw() {
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#475569'
  ctx.fillRect(0, GROUND, canvas.width, 2)

  ctx.fillStyle = '#334155'
  ctx.fillRect(runner.x, runner.y, runner.w, runner.h)

  ctx.fillStyle = '#15803d'
  for (const o of obstacles) ctx.fillRect(o.x, o.y, o.w, o.h)

  ctx.fillStyle = '#334155'
  ctx.textAlign = 'center'
  if (state === 'ready') {
    ctx.font = '16px sans-serif'
    ctx.fillText('Press Space to start', canvas.width / 2, canvas.height / 2)
  }
  if (state === 'over') {
    ctx.font = 'bold 28px sans-serif'
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
