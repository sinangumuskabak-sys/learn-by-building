---
title: Moving while a key is held
title_tr: Tuş basılıyken hareket
skills: [game.input, game.loop]
---

# --explanation--

In Snake, one key press meant one turn. Paddles are different: they move **as long as a key is held down**.

`keydown` is the wrong tool on its own. When you hold a key, the browser sends one `keydown`, pauses about half a
second, then repeats at the operating system's typing speed. Movement driven by that stutters and depends on the
player's keyboard settings.

The fix is to separate **events** from **state**:

1. The events only record which keys are down right now:
   ```js
   const keys = {}
   document.addEventListener('keydown', (e) => { keys[e.key] = true })
   document.addEventListener('keyup', (e) => { keys[e.key] = false })
   ```
2. The game loop reads that state every frame and moves smoothly:
   ```js
   if (keys.w) left.y -= PADDLE_SPEED
   ```

This also lets two players hold keys at the same time: `w`/`s` for the left paddle, the arrows for the right one.

Finally, paddles must stay on the court. **Clamping** keeps a number inside a range:

```js
Math.max(0, Math.min(canvas.height - PADDLE_H, left.y))
```

`Math.min` stops it going past the bottom, `Math.max` stops it going above the top.

# --explanation-tr--

Yılan'da bir tuşa basmak bir dönüş demekti. Raketler farklı: **bir tuş basılı tutulduğu sürece** hareket ederler.

Tek başına `keydown` yanlış araçtır. Bir tuşu basılı tuttuğunda tarayıcı bir `keydown` gönderir, yaklaşık yarım saniye
durur, sonra işletim sisteminin yazma hızında tekrarlar. Buna dayanan hareket takılır ve oyuncunun klavye ayarlarına
bağlı olur.

Çözüm, **olayları** **durumdan** ayırmak:

1. Olaylar yalnızca şu an hangi tuşların basılı olduğunu kaydeder:
   ```js
   const keys = {}
   document.addEventListener('keydown', (e) => { keys[e.key] = true })
   document.addEventListener('keyup', (e) => { keys[e.key] = false })
   ```
2. Oyun döngüsü bu durumu her karede okur ve akıcı biçimde hareket ettirir:
   ```js
   if (keys.w) left.y -= PADDLE_SPEED
   ```

Bu, iki oyuncunun aynı anda tuş basılı tutabilmesini de sağlar: sol raket için `w`/`s`, sağ raket için oklar.

Son olarak raketler sahada kalmalı. **Sınırlama** (clamp) bir sayıyı bir aralıkta tutar:

```js
Math.max(0, Math.min(canvas.height - PADDLE_H, left.y))
```

`Math.min` alt kenarı geçmesini, `Math.max` üst kenarın üstüne çıkmasını engeller.

# --task--

1. Add `const PADDLE_SPEED = 6` and `const keys = {}`. On `keydown` set `keys[event.key] = true`, on `keyup` set it
   to `false`.
2. Write `function update()`: move `left` up/down by `PADDLE_SPEED` while `'w'`/`'s'` are held, and `right` while
   `'ArrowUp'`/`'ArrowDown'` are held. Then clamp both `y` values between `0` and `canvas.height - PADDLE_H`.
3. Write `function loop()` that calls `update()`, `draw()` and `requestAnimationFrame(loop)`, and start it instead of
   calling `draw()` once.

# --task-tr--

1. `const PADDLE_SPEED = 6` ve `const keys = {}` ekle. `keydown`'da `keys[event.key] = true`, `keyup`'ta `false` yap.
2. `function update()` yaz: `'w'`/`'s'` basılıyken `left`'i, `'ArrowUp'`/`'ArrowDown'` basılıyken `right`'ı
   `PADDLE_SPEED` kadar yukarı/aşağı taşı. Sonra iki `y` değerini de `0` ile `canvas.height - PADDLE_H` arasında
   sınırla.
3. `update()`, `draw()` ve `requestAnimationFrame(loop)` çağıran `function loop()` yaz ve `draw()`'u bir kez çağırmak
   yerine onu başlat.

# --tests--

`keys` should track which keys are held.
tr: `keys` hangi tuşların basılı olduğunu izlemeli.

```js
$.press('w')
assert.isTrue(keys.w)
$.release('w')
assert.isFalse(keys.w)
```

Holding W should move the left paddle up 6 pixels per frame, and stop when released.
tr: W basılı tutulunca sol raket karede 6 piksel yukarı gitmeli, bırakınca durmalı.

```js
$.press('w')
$.tick(10)
assert.strictEqual(left.y, 100)
$.release('w')
$.tick(10)
assert.strictEqual(left.y, 100)
```

Both paddles should move at the same time.
tr: İki raket aynı anda hareket edebilmeli.

```js
$.press('s')
$.press('ArrowUp')
$.tick(5)
assert.strictEqual(left.y, 190)
assert.strictEqual(right.y, 130)
```

Paddles should stay on the court.
tr: Raketler sahada kalmalı.

```js
$.press('s')
$.press('ArrowUp')
$.run(2)
assert.strictEqual(left.y, 320)
assert.strictEqual(right.y, 0)
```

# --solution--

```js
// Pong, step by step.
// The page already has <canvas id="game" width="600" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const PADDLE_W = 10
const PADDLE_H = 80
const PADDLE_SPEED = 6

let left = { x: 20, y: 160 }
let right = { x: canvas.width - 20 - PADDLE_W, y: 160 }
const keys = {}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function update() {
  if (keys.w) left.y -= PADDLE_SPEED
  if (keys.s) left.y += PADDLE_SPEED
  if (keys.ArrowUp) right.y -= PADDLE_SPEED
  if (keys.ArrowDown) right.y += PADDLE_SPEED
  left.y = clamp(left.y, 0, canvas.height - PADDLE_H)
  right.y = clamp(right.y, 0, canvas.height - PADDLE_H)
}

function draw() {
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'white'
  for (let y = 0; y < canvas.height; y += 30) {
    ctx.fillRect(canvas.width / 2 - 2, y, 4, 15)
  }

  ctx.fillRect(left.x, left.y, PADDLE_W, PADDLE_H)
  ctx.fillRect(right.x, right.y, PADDLE_W, PADDLE_H)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
