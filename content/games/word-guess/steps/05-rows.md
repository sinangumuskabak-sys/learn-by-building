---
title: Six rows
title_tr: Altı satır
skills: [prog.loops]
---

# --goal--

There are six tries, so six rows. A second loop around the first repeats the whole row, each one `SIZE + GAP` lower.

# --goal-tr--

Altı deneme hakkın var; yani **altı satır**. Bir satırı çizen döngüyü, onu altı kez tekrarlayan **ikinci bir döngünün**
içine koyacağız: her satır bir öncekinden biraz aşağıda.

# --code--

```js
const TRIES = 6

  for (let row = 0; row < TRIES; row++) {
    for (let i = 0; i < 5; i++) {
      const x = LEFT + i * (SIZE + GAP)
      const y = TOP + row * (SIZE + GAP)
      ctx.strokeStyle = '#3f3f46'
      ctx.lineWidth = 2
      ctx.strokeRect(x + 1, y + 1, SIZE - 2, SIZE - 2)
    }
  }
```

# --meaning--

- `TRIES` is the number of guesses.
- The outer loop runs once per row; for each row, the inner loop draws five tiles. 6 × 5 = 30 tiles.
- `y` moves down `SIZE + GAP` pixels per row.

# --meaning-tr--

- `const TRIES = 6` → deneme sayısı.
- `for (let row = 0; row < TRIES; row++) { ... }` → **dış döngü**: `row` 0'dan 5'e. Her tur bir satır.
- İçteki döngü eskisi gibi beş kare çizer; ama artık dış döngünün **içinde**: 6 × 5 = 30 kare.
- `const y = TOP + row * (SIZE + GAP)` → her satır bir öncekinden 62 piksel aşağıda.
- İçteki satırlar iki boşluk daha içeri alındı: hangi döngünün içinde olduklarını gösterir.

# --task--

1. Above `const SIZE`, write `const TRIES = 6`.
2. In `draw`, wrap the loop in the `row` loop, and change `const y = TOP` to use `row`. Press **Run**.

# --task-tr--

1. `const SIZE = 56 ...` satırının **üstüne** `const TRIES = 6` yaz.
2. `draw` içindeki döngünün üstüne `for (let row = 0; row < TRIES; row++) {`, altına kapanan `}` yaz; içteki satırları
   iki boşluk içeri al.
3. `const y = TOP` satırını `const y = TOP + row * (SIZE + GAP)` yap.
4. **Çalıştır**: 6 satır × 5 kare görmelisin.

# --predict--

How many times does the `strokeRect` line run?
- [ ] 11 (6 + 5)
- [x] 30 (6 × 5)
  For each of the 6 rows the inner loop runs 5 times.
- [ ] 6

# --predict-tr--

`strokeRect` satırı kaç kez çalışır?
- [ ] 11 (6 + 5)
- [x] 30 (6 × 5)
  6 satırın her biri için içteki döngü 5 kez döner.
- [ ] 6

# --tests--

All 30 tiles should be drawn as outlines.
tr: 30 karenin hepsi çerçeve olarak çizilmeli.

```js
draw()
const boxes = $.screen().filter((c) => c.op === 'strokeRect').map((c) => c.args)
assert.lengthOf(boxes, 30)
assert.deepEqual(boxes[0], [29, 13, 54, 54])
assert.deepEqual(boxes[5], [29, 13 + 62, 54, 54])
assert.deepEqual(boxes[29], [29 + 4 * 62, 13 + 5 * 62, 54, 54])
```

# --solution--

```js
// Word guessing game, step by step.
// The page already has <canvas id="game" width="360" height="560"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TRIES = 6
const SIZE = 56 // one letter tile
const GAP = 6
const LEFT = (canvas.width - 5 * SIZE - 4 * GAP) / 2
const TOP = 12

function draw() {
  ctx.fillStyle = '#18181b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let row = 0; row < TRIES; row++) {
    for (let i = 0; i < 5; i++) {
      const x = LEFT + i * (SIZE + GAP)
      const y = TOP + row * (SIZE + GAP)
      ctx.strokeStyle = '#3f3f46'
      ctx.lineWidth = 2
      ctx.strokeRect(x + 1, y + 1, SIZE - 2, SIZE - 2)
    }
  }
}

draw()
```
