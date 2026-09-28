---
title: Short hops and long jumps
title_tr: Kısa sekme ve uzun atlama
skills: [game.input, game.physics]
---

# --explanation--

Every jump is the same height right now. Good platformers let you control it: **tap** for a short hop, **hold** for a
full jump. It feels like the jump button is analog, but the trick is tiny:

> When the button is released while the runner is still going up fast, cut the upward speed.

```js
if (runner.vy < CUT) runner.vy = CUT   // CUT = -4: keep rising a little, then fall early
```

Nothing else changes; gravity does the rest. Releasing early turns the arc into a small hop, and holding lets the full
jump play out.

Two details make input feel solid:

- **Key repeat**: holding a key makes the browser fire `keydown` again and again. Those repeated events have
  `event.repeat === true`; ignore them for the jump, so holding Space does not bounce the runner the instant it lands.
- **Touch and mouse**: `pointerdown` jumps and `pointerup` cuts, so a tap and a long press work the same way as the
  keyboard. Put the release logic in one function, `endJump()`, and call it from both.

# --explanation-tr--

**Bu adımda:** zıplamanın yüksekliğini oyuncu belirleyecek. Tuşa **kısa dokunursan** koşucu küçük bir sekme
yapacak, **basılı tutarsan** tam yükseklikte zıplayacak. Ayrıca oyuna fareyle tıklayarak ya da telefonda dokunarak
da zıplayabileceksin.

**Hile çok küçük.** Tuş bırakıldığında koşucu hâlâ hızla yükseliyorsa, yukarı hızını keseriz:

```js
if (runner.vy < CUT) runner.vy = CUT   // CUT = -4
```

Hatırla: eksi hız yukarı demek. `-11` çok hızlı yukarı, `-4` yavaşça yukarı. `<` "küçüktür" demektir; `-11 < -4`
doğrudur. Yani "hız `-4`'ten daha hızlı yukarıysa, onu `-4`'e düşür". Koşucu biraz daha yükselir, sonra erken düşer.
Geri kalanını yerçekimi halleder. Koşucu zaten düşüyorsa (hız artıysa) koşul yanlış olur ve hiçbir şey değişmez.

**Tuş bırakma olayı.** 2. adımda `keydown` (tuşa basıldı) olayını dinlemiştik. Tuş bırakılınca da `keyup` olayı
gelir. Bırakma işini tek bir fonksiyona, `endJump()`'a koyarız ve hem klavyeden hem dokunmadan onu çağırırız.

**Basılı tutunca tekrar eden tuş.** Bir tuşu basılı tutunca tarayıcı `keydown`'u durmadan tekrar tekrar gönderir.
Bu tekrarlarda `event.repeat` alanı `true` olur. Bunları yok saymazsak, Boşluk'u tutan oyuncu yere değdiği anda
kendiliğinden yeniden zıplar. Bu yüzden koşula bir parça ekleriz:

```js
if ((event.key === ' ' || event.key === 'ArrowUp') && !event.repeat) jump()
```

- `!` "değil" demektir: `!event.repeat` → "bu bir tekrar **değilse**".
- `&&` "ve" demektir: iki taraf da doğru olmalı.
- Dış parantez `( ... || ... )` önce "doğru tuş mu?" sorusunu bir arada tutar, sonra `&&` ile "ve tekrar değil"
  eklenir. Matematikteki parantez gibi, önce içi hesaplanır.

**Fare ve dokunma.** `pointerdown` olayı fareyle tıklanınca ya da ekrana parmakla dokununca gelir, `pointerup` da
bırakılınca. Bunları bu sefer `document`'e değil, `canvas`'a bağlarız (sadece oyun alanına dokunmak sayılsın):

```js
canvas.addEventListener('pointerdown', jump)
```

Burada `jump` yazıp parantez koymuyoruz: fonksiyonu **şimdi çağırmıyor**, "olay olunca bunu çağır" diye tarayıcıya
**veriyoruz**. `jump()` yazsaydık hemen bir kez çalışırdı.

# --task--

1. Add `const CUT = -4` and `function endJump()` that sets `runner.vy = CUT` when `runner.vy < CUT`.
2. Call `endJump()` on `keyup` for Space and `'ArrowUp'`, and on `pointerup` on the canvas.
3. Ignore repeated `keydown` events (`event.repeat`) when jumping, and also jump on `pointerdown` on the canvas.

# --task-tr--

1. `const JUMP = -11 ...` satırının hemen **altına** yeni sabiti ekle:

   ```js
   const CUT = -4 // letting go early caps the upward speed at this
   ```

2. `function jump() { ... }` fonksiyonunun kapanan `}`'sinin altına bir satır boşluk bırakıp bırakma fonksiyonunu
   yaz:

   ```js
   // Letting go early makes a short hop: cap the upward speed.
   function endJump() {
     if (runner.vy < CUT) runner.vy = CUT
   }
   ```

3. Var olan `keydown` dinleyicisini değiştir ve altına üç yeni dinleyici ekle. Bu bölüm sonunda şöyle olmalı:

   ```js
   document.addEventListener('keydown', (event) => {
     if ((event.key === ' ' || event.key === 'ArrowUp') && !event.repeat) jump() // ← değişti
   })
   document.addEventListener('keyup', (event) => {          // ← yeni
     if (event.key === ' ' || event.key === 'ArrowUp') endJump()
   })
   canvas.addEventListener('pointerdown', jump)             // ← yeni
   canvas.addEventListener('pointerup', endJump)            // ← yeni
   ```

   `// ← ...` notlarını yazmana gerek yok, sadece neyin eklendiğini gösteriyor.

4. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. Boşluk'a kısa dokun: küçük sekme. Basılı tut: yüksek
   zıplama. Oyun alanına tıklamak da zıplatmalı. Alttaki kontrollerin hepsi yeşil olmalı. Kısa sekme olmuyorsa
   `endJump()` içindeki `<` işaretinin yönünü kontrol et.

# --tests--

Releasing early should cut the upward speed to `CUT`.
tr: Erken bırakmak yukarı hızı `CUT`'a indirmeli.

```js
assert.strictEqual(CUT, -4)
$.press(' ')
$.tick(3)
$.release(' ')
assert.strictEqual(runner.vy, -4)
```

A short hop should stay lower than a full jump.
tr: Kısa sekme tam zıplamadan daha alçakta kalmalı.

```js
function peak(holdFrames) {
  let highest = runner.y
  $.press(' ')
  for (let i = 0; i < 60; i++) {
    if (i === holdFrames) $.release(' ')
    $.tick()
    highest = Math.min(highest, runner.y)
  }
  $.release(' ')
  return 136 - highest
}
const hop = peak(3)
const full = peak(60)
assert.isBelow(hop, 50)
assert.isAbove(full, 90)
```

Releasing while already falling should change nothing.
tr: Zaten düşerken bırakmak hiçbir şeyi değiştirmemeli.

```js
$.press(' ')
$.tick(25)
const vy = runner.vy
assert.isAbove(vy, 0)
$.release(' ')
assert.strictEqual(runner.vy, vy)
```

Tapping the game should jump, and letting go should cut the jump too.
tr: Oyuna dokunmak zıplatmalı, parmağı kaldırmak da zıplamayı kesmeli.

```js
$.pointerDown(100, 100)
assert.strictEqual(runner.vy, -11)
$.tick(2)
$.pointerUp(100, 100)
assert.strictEqual(runner.vy, -4)
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

let runner = { x: 50, y: GROUND - 44, w: 40, h: 44, vy: 0 }

function onGround() {
  return runner.y + runner.h >= GROUND
}

function jump() {
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

function update() {
  runner.vy += GRAVITY
  runner.y += runner.vy
  if (onGround()) {
    runner.y = GROUND - runner.h
    runner.vy = 0
  }
}

function draw() {
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#475569'
  ctx.fillRect(0, GROUND, canvas.width, 2)

  ctx.fillStyle = '#334155'
  ctx.fillRect(runner.x, runner.y, runner.w, runner.h)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
