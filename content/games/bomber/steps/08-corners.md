---
title: Keep the corners clear
title_tr: Köşeleri boş tut
skills: [prog.arrays, prog.functions]
---

# --goal--

If the player started boxed in by crates, their first bomb would have no escape. So the tiles next to the start
corners (the player's at row 1, column 1 and three for the enemies) are always floor.

# --goal-tr--

Oyuncu kasalarla çevrili başlasaydı ilk bombasından kaçacak yeri olmazdı. Bu yüzden başlangıç köşelerinin
**yanındaki** kareler hep zemin olacak: oyuncunun köşesi (1. satır, 1. sütun) ve düşmanların üç köşesi.

"Yanında" demek: satır farkı ile sütun farkının toplamı **en fazla 1** (köşenin kendisi ve dört komşusu). Bu uzaklığa
**Manhattan uzaklığı** denir: sokakları dik kesişen bir şehirde yürür gibi.

# --code--

```js
const ENEMY_STARTS = [[ROWS - 2, COLS - 2], [1, COLS - 2], [ROWS - 2, 1]]

const near = (r, c, spots) => spots.some(([sr, sc]) => Math.abs(sr - r) + Math.abs(sc - c) <= 1)

// Walls all round, a pillar on every even row and column, and crates on about half of the rest,
// but never next to where the player and the enemies start.
function makeGrid() {

      else if (near(r, c, [[1, 1], ...ENEMY_STARTS]) || Math.random() > 0.55) grid[r].push(' ')
```

# --meaning--

- `ENEMY_STARTS` lists the enemies' corners as `[row, column]`.
- `near(r, c, spots)` is true if `(r, c)` is at most one step from any spot. `some` asks "is it true for at least
  one?"; `([sr, sc])` unpacks each spot.
- `[[1, 1], ...ENEMY_STARTS]` spreads the three enemy corners next to the player's: one list of four spots.

# --meaning-tr--

- `const ENEMY_STARTS = [[ROWS - 2, COLS - 2], [1, COLS - 2], [ROWS - 2, 1]]` → düşmanların üç köşesi, `[satır, sütun]`
  olarak: sağ alt, sağ üst, sol alt (duvarların hemen içi).
- `const near = (r, c, spots) => ...` → kısa bir fonksiyon (ok fonksiyonu): `(r, c)` noktası, listedeki noktalardan
  birine yakın mı?
  - `spots.some(...)` → "noktalardan **en az biri** için doğru mu?"
  - `([sr, sc])` → her nokta iki elemanlı bir dizi; bu yazım onu açıp iki ada koyar.
  - `Math.abs(sr - r) + Math.abs(sc - c) <= 1` → satır farkı + sütun farkı en fazla 1. `Math.abs` eksiyi atar.
- `[[1, 1], ...ENEMY_STARTS]` → `...` (yayma) `ENEMY_STARTS`'ın üç elemanını açıp `[1, 1]`'in yanına koyar: dört
  noktalık tek liste.
- `near(...) || Math.random() > 0.55` → köşeye yakınsa **her zaman** zemin; değilse eskisi gibi rastgele.
- Yorum, `makeGrid`'in bütün kuralını özetliyor.

# --task--

1. Under `TOP` write `ENEMY_STARTS`.
2. Under `let grid`, after an empty line, write `near`.
3. Above `function makeGrid() {` write the two comment lines.
4. In `makeGrid`, put `near(r, c, [[1, 1], ...ENEMY_STARTS]) || ` before `Math.random() > 0.55`.

# --task-tr--

1. `const TOP = ...` satırının altına `ENEMY_STARTS` satırını yaz.
2. `let grid` satırının altında bir boş satır bırakıp `const near = ...` satırını yaz.
3. `function makeGrid() {` satırının **üstüne** iki yorum satırını yaz.
4. `makeGrid` içinde `Math.random() > 0.55`'in önüne `near(r, c, [[1, 1], ...ENEMY_STARTS]) || ` ekle.
5. **Çalıştır** birkaç kez: dört köşe her seferinde açık olmalı.

# --tests--

`near` should measure one step at most.
tr: `near` en fazla bir adımı ölçmeli.

```js
assert.isTrue(near(1, 2, [[1, 1]]))
assert.isTrue(near(1, 1, [[5, 5], [1, 1]]))
assert.isFalse(near(2, 2, [[1, 1]]), 'diagonal is two steps')
assert.isFalse(near(1, 3, [[1, 1]]))
```

The start corners should always be clear.
tr: Başlangıç köşeleri hep açık olmalı.

```js
for (let i = 0; i < 20; i++) {
  makeGrid()
  for (const [r, c] of [[1, 1], [1, 2], [2, 1], [ROWS - 2, COLS - 2], [ROWS - 3, COLS - 2], [1, COLS - 2], [1, COLS - 3], [ROWS - 2, 1], [ROWS - 2, 2]]) {
    assert.strictEqual(grid[r][c], ' ', 'the start corners are clear')
  }
}
```

# --solution--

```js
// Bomberman-style game, step by step.
// The page already has <canvas id="game" width="416" height="384"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const COLS = 13
const ROWS = 11
const TILE = 32
const TOP = 32 // room for the lives and the time
const ENEMY_STARTS = [[ROWS - 2, COLS - 2], [1, COLS - 2], [ROWS - 2, 1]]

let grid // grid[r][c]: '#' wall, '+' crate or ' ' floor

const near = (r, c, spots) => spots.some(([sr, sc]) => Math.abs(sr - r) + Math.abs(sc - c) <= 1)

// Walls all round, a pillar on every even row and column, and crates on about half of the rest,
// but never next to where the player and the enemies start.
function makeGrid() {
  grid = []
  for (let r = 0; r < ROWS; r++) {
    grid.push([])
    for (let c = 0; c < COLS; c++) {
      if (r === 0 || c === 0 || r === ROWS - 1 || c === COLS - 1 || (r % 2 === 0 && c % 2 === 0)) grid[r].push('#')
      else if (near(r, c, [[1, 1], ...ENEMY_STARTS]) || Math.random() > 0.55) grid[r].push(' ')
      else grid[r].push('+')
    }
  }
}

function reset() {
  makeGrid()
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = c * TILE
      const y = TOP + r * TILE
      const tile = grid[r][c]
      ctx.fillStyle = tile === '#' ? '#475569' : tile === '+' ? '#b45309' : '#3f6212'
      ctx.fillRect(x, y, TILE, TILE)
      if (tile === '+') {
        ctx.fillStyle = '#92400e'
        ctx.fillRect(x + 4, y + 14, TILE - 8, 4)
      }
    }
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
