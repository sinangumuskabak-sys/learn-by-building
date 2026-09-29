---
title: The jumper
title_tr: Zıplayan
skills: [game.canvas, game.state]
---

# --goal--

We are building a Doodle Jump-style climber: a jumper bounces from platform to platform, higher and higher. First the
jumper: an orange box whose place and size live in an object.

# --goal-tr--

**Doodle Jump tarzı** bir tırmanış oyunu yapıyoruz: bir zıplayan platformdan platforma sekerek durmadan yükseliyor.
Sonunda nasıl olacağını **Bitmiş hâlini gör** ile görebilirsin.

İlk iş zıplayanın kendisi: turuncu bir **kutu**. Yeri ve boyu bir **nesnede** duruyor ki hareket edebilsin.

# --code--

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

let player = { x: 180, y: 460, w: 40, h: 40 }

ctx.fillStyle = '#f8fafc'
ctx.fillRect(0, 0, canvas.width, canvas.height)

ctx.fillStyle = '#f59e0b'
ctx.fillRect(player.x, player.y, player.w, player.h)
```

# --meaning--

- `player` holds the box's left edge `x`, top `y`, width `w` and height `h`.
- The first rectangle paints the whole canvas light grey; the second draws the player from its object.

# --meaning-tr--

- `document.getElementById('game')` → canvas'ı bul; `getContext('2d')` → çizim kalemi.
- `let player = { x: 180, y: 460, w: 40, h: 40 }` → nesne: sol kenar, üst kenar, genişlik, yükseklik. `let` çünkü
  değerleri değişecek.
- İlk `fillRect` bütün tuvali açık griye boyar; ikincisi zıplayanı nesnedeki değerlerle turuncu çizer.

# --task--

Write the lines under the comments, then press **Run**.

# --task-tr--

Satırları yorum satırlarının altına yaz ve **Çalıştır**'a bas: altta turuncu bir kutu görmelisin.

# --tests--

An orange 40×40 box should be drawn at (180, 460).
tr: (180, 460)'ta 40×40 turuncu bir kutu çizilmeli.

```js
assert.deepEqual(player, { x: 180, y: 460, w: 40, h: 40 })
assert.deepEqual($.rects('#f59e0b'), [{ x: 180, y: 460, w: 40, h: 40, color: '#f59e0b' }])
```

# --seed--

```js
// Doodle Jump-style climber, step by step.
// The page already has <canvas id="game" width="400" height="600"></canvas>.
// Write your code below.
```

# --solution--

```js
// Doodle Jump-style climber, step by step.
// The page already has <canvas id="game" width="400" height="600"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

let player = { x: 180, y: 460, w: 40, h: 40 }

ctx.fillStyle = '#f8fafc'
ctx.fillRect(0, 0, canvas.width, canvas.height)

ctx.fillStyle = '#f59e0b'
ctx.fillRect(player.x, player.y, player.w, player.h)
```
