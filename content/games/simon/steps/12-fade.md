---
title: Go dark again
title_tr: Yeniden sön
skills: [game.loop, game.state]
---

# --goal--

Every frame, `update` counts `litFor` down by one. When it reaches zero, the light goes out: `lit` becomes `-1`. The
loop now updates, then draws.

# --goal-tr--

Her oyunun iki işi vardır: **güncelle** (durumu değiştir) ve **çiz** (göster). Şimdi güncelleyen fonksiyonu
yazıyoruz: `update`.

İlk işi bir **geri sayım**: her karede `litFor` bir azalır; sıfıra inince tuş söner. Mutfak zamanlayıcısı gibi: her
saniye bir azalır, sıfırda zil çalar.

# --code--

```js
function update() {
  if (litFor > 0) {
    litFor -= 1
    if (litFor === 0) lit = -1
  }
}

function loop() {
  update()
  draw()
```

# --meaning--

- While `litFor` is above 0, subtract 1 each frame. `-=` means "take away".
- When it hits exactly 0, turn the light off.
- `loop` calls `update()` before `draw()`, so each frame first changes the state, then shows it.

# --meaning-tr--

- `if (litFor > 0) {` → `>` büyüktür: "yanık kalacak süre varsa..."
- `litFor -= 1` → `-=` "üstünden çıkar": bir kare azalt.
- `if (litFor === 0) lit = -1` → süre tam bittiyse tuşu söndür.
- `loop` içinde `update()` → her karede önce durumu değiştir, sonra `draw()` ile göster.

# --task--

1. Above `function draw`, write `update` and an empty line.
2. In `loop`, write `update()` above `draw()`.

# --task-tr--

1. `function draw() {` satırının **üstüne** (`light`'ın altına) `update` fonksiyonunu yaz; arada boş satır kalsın.
2. `loop` içinde `draw()` satırının **üstüne** `update()` yaz.
3. **Çalıştır**. Denemek için en alta geçici olarak `light(0, 30)` yaz: yeşil tuş yarım saniye yanıp sönmeli. Sonra sil.

# --hint--

`update()` goes inside `loop`, above `draw()`.

# --hint-tr--

`update()` çağrısı `loop`'un içinde, `draw()`'un **üstünde** olmalı.

# --tests--

A lit pad should go dark after its frames run out.
tr: Yanan tuş süresi bitince sönmeli.

```js
light(1, 5)
$.tick(4)
assert.strictEqual(lit, 1)
assert.lengthOf($.rects('#f87171'), 1)
$.tick(1)
assert.strictEqual(lit, -1)
assert.lengthOf($.rects('#f87171'), 0)
```

# --solution--

```js
// Simon memory game, step by step.
// The page already has <canvas id="game" width="400" height="440"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TOP = 40 // room for the score
const HALF = canvas.width / 2
// Each pad: its dim color and its lit color. Pads 0 1 on top, 2 3 below.
const PADS = [
  { dim: '#14532d', lit: '#4ade80' },
  { dim: '#7f1d1d', lit: '#f87171' },
  { dim: '#713f12', lit: '#facc15' },
  { dim: '#1e3a8a', lit: '#60a5fa' },
]

let sequence = [] // the pads to repeat, growing by one every round
let lit = -1 // the pad lit right now, or -1
let litFor = 0

function nextRound() {
  sequence.push(Math.floor(Math.random() * 4))
}

function light(pad, frames) {
  lit = pad
  litFor = frames
}

function update() {
  if (litFor > 0) {
    litFor -= 1
    if (litFor === 0) lit = -1
  }
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  PADS.forEach((pad, i) => {
    const x = (i % 2) * HALF
    const y = TOP + Math.floor(i / 2) * HALF
    ctx.fillStyle = i === lit ? pad.lit : pad.dim
    ctx.fillRect(x + 6, y + 6, HALF - 12, HALF - 12)
  })

  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Round ' + sequence.length, 10, 27)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

nextRound()
requestAnimationFrame(loop)
```
