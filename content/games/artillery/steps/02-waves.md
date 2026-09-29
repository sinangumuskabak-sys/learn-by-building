---
title: Hills
title_tr: Tepeler
skills: [game.canvas, prog.loops]
---

# --goal--

A sine wave goes smoothly up and down. Adding three of them, a big slow one and two smaller quicker ones, each with a
random size and position, gives natural-looking hills that are different every game.

# --goal-tr--

Bir **sinüs dalgası** yumuşakça iner çıkar. Üç tanesini **toplamak**, büyük yavaş bir dalga ve iki küçük hızlı dalga,
her biri rastgele boyda ve konumda, doğal görünen ve her oyunda farklı **tepeler** verir.

# --code--

```js
// Hills from three sine waves of random size and position, added together.
  const waves = [1, 2, 3].map((n) => ({ size: (30 / n) * (0.5 + Math.random()), length: W / (n + Math.random()), shift: Math.random() * W }))

    for (const w of waves) y += w.size * Math.sin(((x + w.shift) / w.length) * Math.PI * 2)
    ground.push(Math.max(120, Math.min(H - 20, y)))
```

# --meaning--

- Wave `n` is about `30 / n` pixels high and `W / n` pixels long: the second is half as big and twice as quick.
- `Math.sin(... * Math.PI * 2)` goes once up and down every `length` pixels; `shift` slides it sideways.
- `Math.max(120, Math.min(H - 20, y))` keeps the ground between y = 120 and 20 pixels above the bottom.

# --meaning-tr--

- `[1, 2, 3].map((n) => ({ ... }))` → üç dalga nesnesi. `n`. dalga yaklaşık `30 / n` piksel yüksek (`size`),
  `W / n` piksel uzun (`length`): ikincisi yarı boyda ve iki kat sık. `0.5 + Math.random()` ve `n + Math.random()`
  → her oyunda biraz farklı. `shift` → dalgayı yana kaydırır.
- `Math.sin(((x + w.shift) / w.length) * Math.PI * 2)` → her `length` pikselde bir kez inip çıkan, -1 ile 1 arası bir
  sayı; `w.size` ile çarpınca o dalganın yüksekliği.
- `y +=` → üç dalga 220'nin üstüne **toplanır**.
- `Math.max(120, Math.min(H - 20, y))` → zemini 120 ile alttan 20 piksel arasında tut (**kıskaçla**).

# --task--

1. Above `makeGround`, write the comment; at its top, make the three `waves`.
2. In the loop, add the waves to `y`, and keep it within the limits when you push it.

# --task-tr--

1. `makeGround`'un üstüne yorum satırını, gövdesinin en üstüne `waves` satırını yaz.
2. Döngüde `let y = 220`'nin altına dalgaları toplayan satırı yaz; `ground.push(y)` satırını kıskaçlı hâliyle değiştir.
3. **Çalıştır**'a birkaç kez bas: her seferinde başka tepeler.

# --tests--

The ground should be smooth hills within limits, new every time.
tr: Zemin sınırlar içinde yumuşak tepeler olmalı, her seferinde yeni.

```js
assert.lengthOf(ground, W)
for (const y of ground) {
  assert.isAtLeast(y, 120)
  assert.isAtMost(y, H - 20)
}
for (let x = 1; x < W; x++) assert.isBelow(Math.abs(ground[x] - ground[x - 1]), 3, 'smooth hills, no cliffs')
assert.isFalse(ground.every((y) => y === 220), 'not flat')
const first = ground.join()
makeGround()
assert.notStrictEqual(ground.join(), first, 'new hills every time')
```

# --solution--

```js
// Artillery, step by step.
// The page already has <canvas id="game" width="560" height="320"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const W = canvas.width
const H = canvas.height

let ground // ground[x]: the y of the surface in column x

// Hills from three sine waves of random size and position, added together.
function makeGround() {
  const waves = [1, 2, 3].map((n) => ({ size: (30 / n) * (0.5 + Math.random()), length: W / (n + Math.random()), shift: Math.random() * W }))
  ground = []
  for (let x = 0; x < W; x++) {
    let y = 220
    for (const w of waves) y += w.size * Math.sin(((x + w.shift) / w.length) * Math.PI * 2)
    ground.push(Math.max(120, Math.min(H - 20, y)))
  }
}

function draw() {
  ctx.fillStyle = '#7dd3fc'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#65a30d'
  for (let x = 0; x < W; x++) ctx.fillRect(x, ground[x], 1, H - ground[x])
}

makeGround()
draw()
```
