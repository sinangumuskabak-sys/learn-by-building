---
title: Stay on the court
title_tr: Sahada kal
skills: [game.state, prog.functions]
---

# --goal--

A paddle must stop at the edges. `clamp(value, min, max)` squeezes a number into a range; we use it to keep each
paddle's `y` between 0 and `canvas.height - PADDLE_H`.

# --goal-tr--

Raketler sahadan çıkmamalı. Bunun için küçük, çok kullanışlı bir fonksiyon yazacağız: `clamp` (sıkıştır). Bir sayıyı
iki sınırın **arasına sıkıştırır**: küçükse alt sınıra, büyükse üst sınıra çeker. Bir odanın duvarları gibi: istediğin
kadar yürü, duvarı geçemezsin.

Raketin y'si 0'ın altına (tavan) ve 320'nin üstüne (400 − 80, zemin) inemeyecek.

# --code--

```js
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

  left.y = clamp(left.y, 0, canvas.height - PADDLE_H)
  right.y = clamp(right.y, 0, canvas.height - PADDLE_H)
```

# --meaning--

- `Math.min(max, value)` never lets the value above `max`; `Math.max(min, ...)` never below `min`.
- At the end of `update`, both paddles are squeezed between 0 and 320.

# --meaning-tr--

- `function clamp(value, min, max)` → üç **parametre**: sıkıştırılacak sayı, alt sınır, üst sınır.
- `Math.min(max, value)` → iki sayıdan **küçüğü**: sayı `max`'tan büyükse `max` olur.
- `Math.max(min, ...)` → iki sayıdan **büyüğü**: sonuç `min`'den küçükse `min` olur.
- `return` → sonucu geri ver. Örnek: `clamp(350, 0, 320)` → 320, `clamp(-6, 0, 320)` → 0, `clamp(100, 0, 320)` → 100.
- `update`'in sonunda iki satır: raketi hareket ettirdikten sonra y'yi 0–320 arasına sıkıştır ve geri yaz.

# --task--

1. Above `function update`, write `clamp` and an empty line.
2. At the end of `update`, write the two `clamp` lines.

# --task-tr--

1. `function update() {` satırının **üstüne** `clamp` fonksiyonunu ve bir boş satır yaz.
2. `update` içinde son satırın (`if (keys.ArrowDown) ...`) **altına** iki `clamp` satırını yaz.
3. **Çalıştır**, raketleri kenarlara sür: orada durmalılar.

# --hint--

`canvas.height - PADDLE_H` is 320: the lowest `y` where the whole paddle is still on the court.

# --hint-tr--

`canvas.height - PADDLE_H` = 320: raketin tamamının hâlâ sahada olduğu en alt y.

# --tests--

`clamp()` should squeeze a number into a range.
tr: `clamp()` bir sayıyı aralığa sıkıştırmalı.

```js
assert.deepEqual([clamp(350, 0, 320), clamp(-6, 0, 320), clamp(100, 0, 320)], [320, 0, 100])
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
