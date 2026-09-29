---
title: Move the paddles
title_tr: Raketleri oynat
skills: [game.input, game.state]
---

# --goal--

Every game has two jobs: **update** (change the state) and **draw** (show it). `update` moves each paddle 6 pixels per
frame while its keys are held: W/S for the left paddle, the arrows for the right one.

# --goal-tr--

Her oyunun iki işi vardır: **güncelle** (durumu değiştir) ve **çiz** (göster). Şimdi güncelleyen fonksiyonu yazıyoruz:
`update`.

Her karede tuş notlarına bakar: W basılıysa sol raket yukarı, S basılıysa aşağı; oklar da sağ raketi oynatır. Karede
6 piksel: saniyede 360 piksel, sahayı bir saniyede geçer.

# --code--

```js
const PADDLE_SPEED = 6

function update() {
  if (keys.w) left.y -= PADDLE_SPEED
  if (keys.s) left.y += PADDLE_SPEED
  if (keys.ArrowUp) right.y -= PADDLE_SPEED
  if (keys.ArrowDown) right.y += PADDLE_SPEED
}

function loop() {
  update()
  draw()
```

# --meaning--

- Each `if` checks one held key; `-=` moves up (y gets smaller), `+=` moves down.
- `loop` calls `update()` before `draw()`, so each frame first changes the state, then shows it.

# --meaning-tr--

- `const PADDLE_SPEED = 6` → raket her karede 6 piksel gider.
- `if (keys.w) left.y -= PADDLE_SPEED` → **eğer** W basılıysa sol raketin y'sinden 6 çıkar. `-=` "üstünden çıkar": y
  küçülür, raket **yukarı** gider (canvas'ta y aşağı büyür).
- `+=` → "üstüne ekle": aşağı.
- `keys.ArrowUp` → `keys` notunda yukarı okun alanı. Tuş hiç basılmadıysa alan yoktur (`undefined`), yanlış sayılır.
- `loop` içinde `update()` → her karede önce durumu değiştir, sonra `draw()` ile göster.

# --task--

1. Under `PADDLE_H`, write `PADDLE_SPEED`.
2. Above `function draw`, write `update` and an empty line.
3. In `loop`, write `update()` above `draw()`.

# --task-tr--

1. `const PADDLE_H = 80` satırının altına `PADDLE_SPEED` satırını yaz.
2. `function draw() {` satırının **üstüne** `update` fonksiyonunu ve bir boş satır yaz.
3. `loop` içinde `draw()` satırının **üstüne** `update()` yaz.
4. **Çalıştır**, oyuna bir kez tıkla (klavye oyuna gitsin), `W`/`S` ve ↑/↓ tuşlarını basılı tut.

# --predict--

You hold S for a few seconds. What happens to the left paddle?
- [ ] It stops at the bottom edge
- [x] It slides down and off the court
  Nothing stops it yet; the next step does.
- [ ] It bounces back up

# --predict-tr--

S'yi birkaç saniye basılı tutuyorsun. Sol rakete ne olur?
- [ ] Alt kenarda durur
- [x] Aşağı kayar ve sahadan çıkıp gider
  Henüz onu durduran bir şey yok; bir sonraki adımda ekleyeceğiz.
- [ ] Geri yukarı seker

# --hint--

Key names are case-sensitive: `keys.w` is lowercase, `keys.ArrowUp` has a capital `A` and `U`.

# --hint-tr--

Tuş adlarında büyük/küçük harf önemli: `keys.w` küçük harf, `keys.ArrowUp` büyük `A` ve büyük `U` ile.

# --tests--

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

function update() {
  if (keys.w) left.y -= PADDLE_SPEED
  if (keys.s) left.y += PADDLE_SPEED
  if (keys.ArrowUp) right.y -= PADDLE_SPEED
  if (keys.ArrowDown) right.y += PADDLE_SPEED
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
