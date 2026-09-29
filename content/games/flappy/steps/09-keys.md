---
title: Space, Up arrow or a tap
title_tr: Boşluk, yukarı ok ya da dokunuş
skills: [game.input]
---

# --goal--

Now the player flaps: with Space, the Up arrow, or a click or tap on the game. One behavior (`flap`), many triggers.

# --goal-tr--

Şimdi kanadı oyuncu çırpacak: **Boşluk** tuşuyla, **Yukarı ok** ile ya da oyuna **tıklayarak / dokunarak** (telefonda).

Tarayıcıya "şu olunca bana haber ver" deriz. Buna **olay dinlemek** (event listener) denir: kapı zili gibi, çalınca ne
yapacağını önceden söylersin. Çırpma işi tek bir fonksiyonda (`flap`) duruyor; her giriş onu çağırıyor. Bir davranış,
birçok tetikleyici.

# --code--

```js
document.addEventListener('keydown', (event) => {
  if (event.key === ' ' || event.key === 'ArrowUp') flap()
})
canvas.addEventListener('pointerdown', flap)
```

# --meaning--

- `keydown` fires when a key goes down, anywhere on the page (`document`).
- `event.key` is the key's name: `' '` for Space, `'ArrowUp'` for the Up arrow. `||` means "or".
- `pointerdown` fires when the canvas is clicked or touched; it calls `flap` directly.

# --meaning-tr--

- `document.addEventListener('keydown', (event) => { ... })` → "sayfada bir tuşa **basıldığında** (keydown) süslü
  parantez içini çalıştır". `(event) => { }` adı olmayan kısa bir fonksiyon (ok fonksiyonu); tarayıcı ona basılan
  tuşun bilgilerini `event` adıyla verir.
- `event.key` → basılan tuşun adı. Boşluk için `' '` (tırnak içinde tek bir boşluk), yukarı ok için `'ArrowUp'`.
- `if (...) flap()` → **eğer** koşul doğruysa `flap()`'i çalıştır. `===` "tam olarak eşit mi?" diye sorar (tek `=`
  "içine koy" demekti).
- `||` → "**veya**": iki koşuldan biri doğruysa yeter.
- `canvas.addEventListener('pointerdown', flap)` → canvas'a fareyle tıklanınca ya da parmakla dokununca `flap`'i
  çalıştır. `flap` burada **parantezsiz**: "şimdi çalıştır" değil, "olunca sen çalıştır".

# --task--

Write the lines under `flap`, after an empty line. Run, click the game once, then press Space.

# --task-tr--

1. `flap` fonksiyonunun kapanan `}` işaretinin altına bir boş satır bırak ve dört satırı yaz.
2. **Çalıştır**, oyuna bir kez tıkla (klavye oyuna gitsin), sonra Boşluk'a bas: kuş yukarı sıçramalı.

# --hint--

Space is `' '`: a quote, one space, a quote. `'ArrowUp'` has a capital `A` and `U`.

# --hint-tr--

Boşluk tuşu `' '`: tırnak, tek bir boşluk, tırnak. `'ArrowUp'` büyük `A` ve büyük `U` ile yazılır.

# --tests--

Space and the Up arrow should flap, other keys should not.
tr: Boşluk ve yukarı ok kanat çırpmalı, başka tuşlar çırpmamalı.

```js
bird.vy = 5
$.press(' ')
assert.strictEqual(bird.vy, -8)
bird.vy = 5
$.press('ArrowUp')
assert.strictEqual(bird.vy, -8)
bird.vy = 5
$.press('ArrowDown')
assert.strictEqual(bird.vy, 5)
```

Clicking or tapping the game should flap.
tr: Oyuna tıklamak ya da dokunmak kanat çırpmalı.

```js
bird.vy = 5
$.click(200, 300)
assert.strictEqual(bird.vy, -8)
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

let bird = { x: 100, y: 300, vy: 0, r: 14 }

function flap() {
  bird.vy = FLAP
}

document.addEventListener('keydown', (event) => {
  if (event.key === ' ' || event.key === 'ArrowUp') flap()
})
canvas.addEventListener('pointerdown', flap)

function update() {
  bird.vy += GRAVITY
  bird.y += bird.vy
}

function draw() {
  ctx.fillStyle = '#70c5ce'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'gold'
  ctx.beginPath()
  ctx.arc(bird.x, bird.y, bird.r, 0, Math.PI * 2)
  ctx.fill()
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
