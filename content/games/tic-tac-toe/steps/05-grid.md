---
title: Finish the grid
title_tr: Izgarayı tamamla
skills: [game.canvas, prog.loops]
---

# --goal--

The horizontal lines follow the same pattern, with `x` and `y` (and width and height) swapped. One more line in the
loop finishes the 3×3 grid.

# --goal-tr--

Yatay çizgiler de aynı kalıbı izler; sadece **yatay ile dikey yer değiştirir**. Dikey çizgi "x'te ince, boyu tahta
kadar"dı; yatay çizgi "y'de ince, eni tahta kadar" olacak.

Döngüye tek bir satır ekliyoruz ve ızgara bitiyor: dokuz kutu.

# --code--

```js
for (let i = 1; i < 3; i++) {
  ctx.fillRect(i * CELL - 2, 0, 4, canvas.height)
  ctx.fillRect(0, i * CELL - 2, canvas.width, 4)
}
```

# --meaning--

- The new line starts at the left edge (`x = 0`), at `y = i * CELL - 2`, is as wide as the board and 4 pixels tall.
- Each round of the loop now draws one vertical and one horizontal line: four lines in total.

# --meaning-tr--

- `ctx.fillRect(0, i * CELL - 2, canvas.width, 4)` → yeni satır:
  - `0` → sol kenardan başlar.
  - `i * CELL - 2` → y: 98 ya da 198. Bu sefer ortalanan y.
  - `canvas.width, 4` → tahta eninde, 4 piksel boyunda.
- Döngünün her turu artık **bir dikey, bir yatay** çizgi çiziyor. İki tur × iki çizgi = dört çizgi.

# --task--

Inside the loop, under the vertical `fillRect`, add the horizontal one. Press **Run**.

# --task-tr--

Döngünün içinde, dikey çizgiyi çizen `ctx.fillRect(i * CELL - 2, ...)` satırının **altına** yeni satırı yaz. **Çalıştır**: tahta dokuz kutuya bölünmeli.

# --hint--

The order of the four numbers is x, y, width, height: `0, i * CELL - 2, canvas.width, 4`.

# --hint-tr--

Dört sayının sırası: x, y, genişlik, yükseklik. Yatay çizgi için `0, i * CELL - 2, canvas.width, 4`.

# --tests--

There should be four grid lines on the cell borders.
tr: Hücre sınırlarında dört ızgara çizgisi olmalı.

```js
assert.sameDeepMembers($.rects('#585b70'), [
  { x: 98, y: 0, w: 4, h: 300, color: '#585b70' },
  { x: 198, y: 0, w: 4, h: 300, color: '#585b70' },
  { x: 0, y: 98, w: 300, h: 4, color: '#585b70' },
  { x: 0, y: 198, w: 300, h: 4, color: '#585b70' },
])
```

# --solution--

```js
// Tic-tac-toe, step by step.
// The page already has <canvas id="game" width="300" height="300"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const CELL = 100

ctx.fillStyle = '#1e1e2e'
ctx.fillRect(0, 0, canvas.width, canvas.height)

ctx.fillStyle = '#585b70'
for (let i = 1; i < 3; i++) {
  ctx.fillRect(i * CELL - 2, 0, 4, canvas.height)
  ctx.fillRect(0, i * CELL - 2, canvas.width, 4)
}
```
