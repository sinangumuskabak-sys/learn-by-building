---
title: Wait for the first flap
title_tr: İlk çırpışı bekle
skills: [game.state]
---

# --goal--

Right now the bird falls the moment the page loads. A game has phases: `'ready'` (waiting), `'playing'` and later
`'over'`. One variable, `state`, says which one we are in; nothing moves until the first flap.

# --goal-tr--

Şu an sayfa açılır açılmaz kuş düşmeye başlıyor; oyuncu hazırlanamıyor bile. Gerçek bir oyunun **aşamaları** vardır:

| durum | ne olur |
|---|---|
| `'ready'` (hazır) | kuş bekler |
| `'playing'` (oyunda) | yerçekimi çalışır |
| `'over'` (bitti) | her şey donar (sonraki adımda) |

Bunun için her an bu değerlerden **tam olarak birini** tutan **tek** bir değişken kullanırız: `state`. Buna **durum
makinesi** denir. Trafik ışığı gibi: her an tek bir rengi yanar.

# --code--

```js
let state = 'ready' // 'ready', 'playing' or 'over'

function flap() {
  state = 'playing'
  bird.vy = FLAP
}

function update() {
  if (state !== 'playing') return
```

# --meaning--

- `state` starts as `'ready'`.
- A flap sets the state to `'playing'`.
- `update` returns at once unless we are playing: `!==` means "is not equal to", `return` leaves the function.

# --meaning-tr--

- `let state = 'ready'` → oyun **hazır** aşamasında başlar.
- `flap` içinde `state = 'playing'` → ilk çırpış oyunu başlatır (sonrakiler de oyunda tutar).
- `if (state !== 'playing') return` → `!==` "eşit **değil** mi?" (`===`'in tersi). `return` fonksiyondan **hemen
  çıkar**; altındaki satırlar çalışmaz. Yani: "oyunda değilsek hiçbir şey hareket etmesin."
- `draw` yine her karede çalışır: kuş ekranda **bekler**, kaybolmaz.

# --task--

1. Under the `bird` line, write the `state` line.
2. In `flap`, add `state = 'playing'` above `bird.vy = FLAP`.
3. In `update`, add the `if` line at the very top.

# --task-tr--

1. `let bird = ...` satırının hemen altına `state` satırını yaz.
2. `flap` içinde `bird.vy = FLAP` satırının **üstüne** `state = 'playing'` yaz.
3. `update` içinde en üste, `bird.vy += GRAVITY` satırının üstüne `if` satırını yaz.
4. **Çalıştır**: kuş ortada beklemeli. Oyuna tıklayınca uçmaya başlamalı.

# --predict--

You press Run and wait. What does the bird do?
- [x] It stays in the middle until you flap
  `update` returns at once while the state is `'ready'`, but `draw` still shows the bird.
- [ ] It disappears until you flap
- [ ] It falls as before

# --predict-tr--

Çalıştır'a basıp bekliyorsun. Kuş ne yapar?
- [x] Sen çırpana kadar ortada bekler
  Durum `'ready'` iken `update` hemen çıkar; ama `draw` kuşu çizmeye devam eder.
- [ ] Sen çırpana kadar kaybolur
- [ ] Eskisi gibi düşer

# --tests--

The bird should wait in the `'ready'` state until the first flap.
tr: Kuş ilk çırpışa kadar `'ready'` durumunda beklemeli.

```js
assert.strictEqual(state, 'ready')
$.tick(60)
assert.strictEqual(bird.y, 300)
```

The first flap should start the game.
tr: İlk çırpış oyunu başlatmalı.

```js
$.press(' ')
assert.strictEqual(state, 'playing')
$.tick(5)
assert.isBelow(bird.y, 300)
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
let state = 'ready' // 'ready', 'playing' or 'over'

function flap() {
  state = 'playing'
  bird.vy = FLAP
}

document.addEventListener('keydown', (event) => {
  if (event.key === ' ' || event.key === 'ArrowUp') flap()
})
canvas.addEventListener('pointerdown', flap)

function update() {
  if (state !== 'playing') return
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
