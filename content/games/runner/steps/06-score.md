---
title: Distance, speed and a best score
title_tr: Mesafe, hız ve rekor
skills: [game.state, game.loop]
---

# --explanation--

An endless runner has no finish line, so the score is **how far you got**. Add the speed to a `distance` counter every
frame and show `distance / 10`, rounded down, so the numbers climb at a satisfying pace.

To keep it endless *and* interesting, the world speeds up a tiny bit every frame:

```js
speed = Math.min(12, speed + 0.003)
```

`0.003` looks like nothing, but over a minute (3600 frames) that is +10.8, which would double the starting speed if it
were not capped at 12. Small per-frame changes add up. When tuning a game, always ask "what does this become after a
minute? after five?".

Scores like `00042` use `String(score).padStart(5, '0')`: pad the text on the left with zeros up to five characters.
The best score is saved in `localStorage` as in the other games, and as always, one `reset()` function sets up every
new run.

# --explanation-tr--

**Bu adımda:** oyuna skor, rekor ve yeniden başlama gelecek. Sağ üstte `HI 00120  00042` gibi bir yazı (rekor ve
şimdiki skor) göreceksin; oyun ilerledikçe hızlanacak; "Game Over"dan sonra Boşluk'a basınca yeni koşu başlayacak.

**Skor = ne kadar uzağa gittin.** Bitiş çizgisi yok. Her kare hızı bir sayaca ekleriz: `distance += speed`. Ekranda
`distance / 10`'u aşağı yuvarlayarak (`Math.floor`) gösteririz; sayılar hoş bir hızla artar.

**Yavaş yavaş hızlanmak.**

```js
speed = Math.min(12, speed + 0.003)
```

`Math.min(a, b)` iki sayıdan **küçük olanı** verir. Yani hız `0.003` artar ama 12'yi asla geçmez (tavan). `0.003`
hiç gibi görünür ama bir dakikada (3600 kare) +10,8 eder. Küçük değişiklikler birikir; bir oyunu ayarlarken hep sor:
"bu bir dakika sonra neye dönüşür?"

**Sayıyı sıfırlarla doldurmak.** `00042` gibi göstermek için önce sayıyı yazıya çeviririz (`String(42)` → `'42'`),
sonra `.padStart(5, '0')` ile soluna 5 karakter olana kadar `'0'` ekleriz → `'00042'`. Yazılar `+` ile
**birleştirilir**: `'HI ' + '00120'` → `'HI 00120'`. `ctx.textAlign = 'right'` verdiğin `x`'i yazının **sağ ucu**
yapar; böylece yazı sağ kenara yaslanır.

**Rekoru saklamak (`localStorage`).** Sayfayı kapatsan da tarayıcının hatırladığı küçük bir defterdir. Her kayıt bir
ad ve bir yazıdır:

```js
localStorage.setItem('runner-best', 124)       // deftere yaz
localStorage.getItem('runner-best')            // oku → '124' (yazı olarak) ya da hiç yoksa null
```

`Number(...)` yazıyı sayıya çevirir. İlk kez oynarken kayıt yoktur; `Number(null)` `0` verir, `|| 0` da sayı
çevrilemezse bile `0` olmasını garanti eder (`a || b` → "`a` boş/sıfırsa `b`'yi al").

**`reset()`: her koşuyu aynı yerden başlatmak.** Yeniden başlarken her değişkeni ilk değerine döndürmemiz gerek. Bu
değerleri iki yerde yazarsak bir gün biri unutulur. Onun yerine değişkenleri **değersiz** tanımlarız (`let runner`)
ve bütün ilk değerleri tek bir fonksiyona koyarız. Oyun açılırken de, her yeniden başlamada da onu çağırırız.

`if`'in içinde birden çok satır olunca süslü parantez `{ }` şarttır; hepsi birlikte ya çalışır ya atlanır. Bir `if`
başka bir `if`'in içinde de olabilir: "çarptıysan, **ve** skor rekordan büyükse, kaydet".

# --task--

1. Declare `runner`, `state`, `obstacles`, `speed`, `nextIn` and a new `distance` with `let` but no values, and write
   `function reset()` that gives them their starting values (runner on the ground with `vy: 0`, `'ready'`, `[]`, `6`,
   `60`, `0`). Call it at startup.
2. While running, add `speed` to `distance` and raise `speed` by `0.003` per frame, up to `12`.
3. Add `let best = Number(localStorage.getItem('runner-best')) || 0`. When the run ends, with
   `score = Math.floor(distance / 10)`, save a new best under `'runner-best'`.
4. When the game is over, `jump()` should call `reset()` instead of doing nothing.
5. Draw `HI 00120  00042` (best, two spaces, score, both padded to 5 digits) right-aligned at `(canvas.width - 10, 24)`
   in `'16px monospace'`, and `Press Space to try again` under `Game Over`.

# --task-tr--

1. `let runner = ...`'dan `let nextIn = 60 ...`'a kadar olan beş satırı sil ve yerine değersiz tanımları, rekoru ve
   `reset()` fonksiyonunu yaz:

   ```js
   let runner
   let state // 'ready', 'running' or 'over'
   let obstacles
   let speed
   let distance
   let nextIn // frames until the next obstacle
   let best = Number(localStorage.getItem('runner-best')) || 0

   function reset() {
     runner = { x: 50, y: GROUND - 44, w: 40, h: 44, vy: 0 }
     state = 'ready'
     obstacles = []
     speed = 6
     distance = 0
     nextIn = 60
   }
   ```

   `reset()` içinde `let` yok: yukarıda tanımlanmış değişkenlere değer veriyoruz, yenilerini açmıyoruz.

2. `jump()` fonksiyonunda, oyun bittiyse artık baştan başlasın:

   ```js
   function jump() {
     if (state === 'over') { // ← değişti
       reset()               // ← yeni
       return
     }                       // ← yeni
     state = 'running'
     if (onGround()) runner.vy = JUMP
   }
   ```

3. `update()` fonksiyonunda, yere inme `if`'inin kapanan `}`'sinin altına mesafe ve hız satırlarını ekle; en
   sondaki çarpma satırını da rekoru kaydeden hâle getir. Fonksiyonun ikinci yarısı şöyle olmalı:

   ```js
     distance += speed                            // ← yeni
     speed = Math.min(12, speed + 0.003)          // ← yeni

     nextIn -= 1
     if (nextIn <= 0) spawn()
     for (const o of obstacles) o.x -= speed
     obstacles = obstacles.filter((o) => o.x + o.w > 0)

     if (obstacles.some(hits)) {                  // ← değişti
       state = 'over'
       const score = Math.floor(distance / 10)
       if (score > best) {
         best = score
         localStorage.setItem('runner-best', best)
       }
     }
   }
   ```

4. `draw()` fonksiyonunda, kaktüsleri çizen `for` satırından sonrasını şöyle yap:

   ```js
     const score = Math.floor(distance / 10)                        // ← yeni
     ctx.fillStyle = '#334155'
     ctx.font = '16px monospace'                                    // ← yeni
     ctx.textAlign = 'right'                                        // ← yeni
     ctx.fillText('HI ' + String(best).padStart(5, '0') + '  ' + String(score).padStart(5, '0'), canvas.width - 10, 24) // ← yeni

     ctx.textAlign = 'center'
     if (state === 'ready') {
       ctx.font = '16px sans-serif'
       ctx.fillText('Press Space to start', canvas.width / 2, canvas.height / 2)
     }
     if (state === 'over') {
       ctx.font = 'bold 28px sans-serif'
       ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2)
       ctx.font = '16px sans-serif'                                 // ← yeni
       ctx.fillText('Press Space to try again', canvas.width / 2, canvas.height / 2 + 28) // ← yeni
     }
   }
   ```

   `'HI '`'dan sonra bir, iki sayı arasında **iki** boşluk var. `monospace` her harfin aynı genişlikte olduğu yazı
   tipidir; rakamlar kaymaz.

5. En alttaki `requestAnimationFrame(loop)` satırının hemen **üstüne** oyunu hazırlayan çağrıyı ekle:

   ```js
   reset()
   requestAnimationFrame(loop)
   ```

6. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. Sağ üstte skor artmalı, çarpınca rekor güncellenmeli ve
   Boşluk yeni bir koşu başlatmalı. Alttaki kontrollerin hepsi yeşil olmalı. Skor yazısı testi kırmızıysa
   boşlukları say: `'HI '` ve `'  '`.

# --tests--

Distance should grow with the speed, and the speed should creep up to 12.
tr: Mesafe hızla birlikte artmalı, hız da yavaşça 12'ye çıkmalı.

```js
$.press(' ')
$.release(' ')
update()
assert.closeTo(distance, 6, 0.01)
assert.closeTo(speed, 6.003, 0.0001)
speed = 11.999
obstacles = []
nextIn = 1000
update()
assert.strictEqual(speed, 12)
```

The score should be shown padded to five digits, next to the best score.
tr: Skor beş haneye doldurularak rekorun yanında gösterilmeli.

```js
best = 120
distance = 425
draw()
assert.include($.texts(), 'HI 00120 00042')
```

A new best should be saved when the run ends.
tr: Koşu bitince yeni rekor kaydedilmeli.

```js
$.press(' ')
distance = 1234
obstacles = [{ x: 80, y: 140, w: 20, h: 40 }]
update()
assert.strictEqual(state, 'over')
assert.strictEqual(best, 124)
assert.strictEqual(localStorage.getItem('runner-best'), '124')
```

Jumping after game over should start a fresh run.
tr: Oyun bittikten sonra zıplamak yeni bir koşu başlatmalı.

```js
$.press(' ')
obstacles = [{ x: 80, y: 140, w: 20, h: 40 }]
update()
$.release(' ')
$.press(' ')
assert.strictEqual(state, 'ready')
assert.deepEqual(obstacles, [])
assert.strictEqual(distance, 0)
assert.strictEqual(speed, 6)
assert.include(runner, { y: 136, vy: 0 })
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

let runner
let state // 'ready', 'running' or 'over'
let obstacles
let speed
let distance
let nextIn // frames until the next obstacle
let best = Number(localStorage.getItem('runner-best')) || 0

function reset() {
  runner = { x: 50, y: GROUND - 44, w: 40, h: 44, vy: 0 }
  state = 'ready'
  obstacles = []
  speed = 6
  distance = 0
  nextIn = 60
}

function onGround() {
  return runner.y + runner.h >= GROUND
}

function jump() {
  if (state === 'over') {
    reset()
    return
  }
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

  distance += speed
  speed = Math.min(12, speed + 0.003)

  nextIn -= 1
  if (nextIn <= 0) spawn()
  for (const o of obstacles) o.x -= speed
  obstacles = obstacles.filter((o) => o.x + o.w > 0)

  if (obstacles.some(hits)) {
    state = 'over'
    const score = Math.floor(distance / 10)
    if (score > best) {
      best = score
      localStorage.setItem('runner-best', best)
    }
  }
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

  const score = Math.floor(distance / 10)
  ctx.fillStyle = '#334155'
  ctx.font = '16px monospace'
  ctx.textAlign = 'right'
  ctx.fillText('HI ' + String(best).padStart(5, '0') + '  ' + String(score).padStart(5, '0'), canvas.width - 10, 24)

  ctx.textAlign = 'center'
  if (state === 'ready') {
    ctx.font = '16px sans-serif'
    ctx.fillText('Press Space to start', canvas.width / 2, canvas.height / 2)
  }
  if (state === 'over') {
    ctx.font = 'bold 28px sans-serif'
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2)
    ctx.font = '16px sans-serif'
    ctx.fillText('Press Space to try again', canvas.width / 2, canvas.height / 2 + 28)
  }
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
