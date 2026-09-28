---
title: Scoring each pipe once
title_tr: Her boruyu bir kez saymak
skills: [game.state]
---

# --explanation--

You score a point when a pipe has gone fully past the bird: the pipe's right edge is left of the bird's left edge.

The trap: that condition stays true for **every frame** until the pipe leaves the screen. Add a point whenever it is
true, and one pipe is worth 40 points.

What you want is to react to the moment it **becomes** true, once. The standard fix is a flag on the object itself:

```js
if (!pipe.passed && pipe.x + PIPE_WIDTH < bird.x - bird.r) {
  pipe.passed = true   // remember we already counted this one
  score += 1
}
```

"Has this already happened?" flags are everywhere in game code: achievements unlocked, a door already opened, a sound
already played. Whenever an event should fire once but its condition stays true, reach for one.

# --explanation-tr--

**Bu adımda:** skor ekleyeceğiz. Ekranın üstünde ortada büyük beyaz bir sayı duracak ve kuş her borunun arasından
geçtiğinde bir artacak.

**Ne zaman puan verilir?** Boru kuşu tamamen geçtiğinde, yani borunun sağ kenarı (`pipe.x + PIPE_WIDTH`) kuşun sol
kenarının (`bird.x - bird.r`) solunda kaldığında.

**Tuzak.** Bu koşul, boru ekrandan çıkana kadar **her karede** doğru kalır. Koşul her doğru olduğunda puan
eklersek, tek bir boru 40 puan eder!

Bizim istediğimiz, koşulun doğru **olduğu anda**, bir kez tepki vermek. Bunun alışılmış çözümü, nesnenin üstüne
bir **bayrak** (flag) koymaktır: "bu boruyu saydım mı?" sorusunun cevabını tutan doğru/yanlış bir alan.

```js
if (!pipe.passed && pipe.x + PIPE_WIDTH < bird.x - bird.r) {
  pipe.passed = true   // bu boruyu saydığımızı unutma
  score += 1
}
```

Okuyalım: "Eğer bu boru henüz sayılmadıysa (`!pipe.passed`) **ve** kuşu tamamen geçtiyse: onu sayıldı diye işaretle
ve skoru bir artır." Bir sonraki karede `pipe.passed` artık `true` olduğu için `!pipe.passed` yanlış olur ve puan
tekrar verilmez.

Yeni borular `passed: false` ile doğar. `false` "yanlış / hayır" demektir, `true` ise "doğru / evet". Tırnaksız
yazılırlar, çünkü yazı değil, doğru/yanlış değerleridir.

"Bu zaten oldu mu?" bayrakları oyun kodunda her yerdedir: açılmış bir başarım, bir kez açılan bir kapı, bir kez
çalan bir ses. Bir şeyin bir kez olması gerekip de koşulu doğru kalmaya devam ediyorsa, bir bayrak kullan.

**Döngüde birden fazla satır.** Şu ana kadar `for (const pipe of pipes) pipe.x -= PIPE_SPEED` tek satırdı. Artık
her boru için birkaç iş yapacağız, bu yüzden döngünün işini `{ }` içine alıyoruz.

**Sayıyı yazıya çevirmek.** `fillText` bir yazı ister. `String(score)` sayıyı (`7`) yazıya (`'7'`) çevirir.

# --task--

1. Add `let score = 0`, and give new pipes `passed: false` in `addPipe()`.
2. In `update()`, while moving each pipe: if it is not `passed` and its right edge (`pipe.x + PIPE_WIDTH`) is less
   than the bird's left edge (`bird.x - bird.r`), mark it `passed` and add 1 to `score`.
3. In `draw()`, show the score as white text centered near the top: `ctx.font = 'bold 40px sans-serif'`, at
   `(canvas.width / 2, 70)`.

# --task-tr--

1. `let frame = 0` satırının altına skoru ekle:

   ```js
   let score = 0
   ```

2. `addPipe()` fonksiyonunda `pipes.push(...)` satırını, yeni borular "henüz sayılmadı" diye doğsun diye şöyle
   değiştir:

   ```js
     pipes.push({ x: canvas.width, gapY, passed: false })   // ← değişti
   ```

3. `update()` fonksiyonunda `for (const pipe of pipes) pipe.x -= PIPE_SPEED` satırını sil ve yerine şunu yaz:

   ```js
     for (const pipe of pipes) {
       pipe.x -= PIPE_SPEED
       if (!pipe.passed && pipe.x + PIPE_WIDTH < bird.x - bird.r) {
         pipe.passed = true
         score += 1
       }
     }
   ```

   Hemen altındaki `pipes = pipes.filter(...)` satırı aynen kalır.

4. `draw()` fonksiyonunda `ctx.textAlign = 'center'` satırının hemen altına (`if (state === 'ready')`'den önce)
   skoru yazan iki satırı ekle:

   ```js
     ctx.font = 'bold 40px sans-serif'
     ctx.fillText(String(score), canvas.width / 2, 70)
   ```

   Yazı yatayda ortada, yukarıdan 70 piksel aşağıda durur. Rengi bir üst satırdaki `'white'`'tan gelir.

5. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Ekranın üstünde `0` görmelisin. Oynamak için önce oyuna tıkla,
   Boşluk'la uç; her borudan geçince sayı bir artmalı. Alttaki kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa
   `!pipe.passed`'daki ünlemi ve `<` işaretinin yönünü kontrol et.

# --tests--

New pipes should start with `passed: false`.
tr: Yeni borular `passed: false` ile başlamalı.

```js
addPipe()
assert.isFalse(pipes[0].passed)
```

A pipe should score once, when it has fully passed the bird.
tr: Bir boru, kuşu tamamen geçtiğinde bir kez puan vermeli.

```js
state = 'playing'
pipes = [{ x: 30, gapY: 250, passed: false }]
update()
assert.strictEqual(score, 0, 'the pipe is still overlapping the bird')
pipes = [{ x: 25, gapY: 250, passed: false }]
update()
assert.strictEqual(score, 1)
assert.isTrue(pipes[0].passed)
update()
update()
assert.strictEqual(score, 1, 'each pipe counts only once')
```

The score should be drawn.
tr: Skor çizilmeli.

```js
score = 7
draw()
assert.include($.texts(), '7')
```

Playing through should earn points.
tr: Oynayarak puan kazanılmalı.

```js
flap()
for (let i = 0; i < 400; i++) {
  // Keep the bird in the middle of each gap so it survives.
  const next = pipes.find((p) => p.x + PIPE_WIDTH > bird.x - bird.r)
  bird.y = next ? next.gapY + GAP / 2 : 300
  bird.vy = 0
  update()
}
assert.strictEqual(state, 'playing')
assert.isAtLeast(score, 2)
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
let score = 0

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
  pipes.push({ x: canvas.width, gapY, passed: false })
}

function hitsPipe(pipe) {
  const overlapsX = bird.x + bird.r > pipe.x && bird.x - bird.r < pipe.x + PIPE_WIDTH
  const insideGap = bird.y - bird.r > pipe.gapY && bird.y + bird.r < pipe.gapY + GAP
  return overlapsX && !insideGap
}

function update() {
  if (state !== 'playing') return
  bird.vy += GRAVITY
  bird.y += bird.vy

  frame += 1
  if (frame % PIPE_EVERY === 0) addPipe()
  for (const pipe of pipes) {
    pipe.x -= PIPE_SPEED
    if (!pipe.passed && pipe.x + PIPE_WIDTH < bird.x - bird.r) {
      pipe.passed = true
      score += 1
    }
  }
  pipes = pipes.filter((pipe) => pipe.x + PIPE_WIDTH > 0)

  const hitGround = bird.y + bird.r >= canvas.height
  const hitSky = bird.y - bird.r <= 0
  if (hitGround || hitSky || pipes.some(hitsPipe)) state = 'over'
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
  ctx.font = 'bold 40px sans-serif'
  ctx.fillText(String(score), canvas.width / 2, 70)
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
