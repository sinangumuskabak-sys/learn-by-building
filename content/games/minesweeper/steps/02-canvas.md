---
title: The canvas and the pen
title_tr: Tuval ve kalem
skills: [game.canvas]
---

# --goal--

The page has a 360×400 canvas with the id `game`. We find it and take its 2D drawing tools.

# --goal-tr--

Sayfada `game` kimlikli, 360×400 piksellik bir **canvas** (tuval) var; oyunu onun üstüne boyayacağız. Önce tuvali
bulup **çizim kalemini** (context) alıyoruz.

# --code--

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')
```

# --meaning--

- `document.getElementById('game')` finds the canvas; `getContext('2d')` gives its drawing tools, `ctx`.

# --meaning-tr--

- `document.getElementById('game')` → sayfada kimliği (id) `game` olan öğeyi bulur: tuval.
- `canvas.getContext('2d')` → tuvalin **2 boyutlu çizim kalemini** verir. Adı `ctx` (context); bütün çizim satırları
  `ctx.` ile başlayacak.

# --task--

Write the two lines under the comment lines, above `const SIZE = 9`, with an empty line after them.

# --task-tr--

İki satırı yorum satırlarının **altına**, `const SIZE = 9` satırının **üstüne** yaz; arada bir boş satır kalsın.
**Çalıştır**.

# --tests--

`canvas` should be the `#game` canvas element.
tr: `canvas`, sayfadaki `#game` canvas'ı olmalı.

```js
assert.strictEqual(canvas, $.canvas)
```

`ctx` should be the canvas's 2D context.
tr: `ctx`, canvas'ın 2D çizim bağlamı olmalı.

```js
assert.strictEqual(ctx, $.canvas.getContext('2d'))
```

# --solution--

```js
// Minesweeper, step by step.
// The page already has <canvas id="game" width="360" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SIZE = 9

let grid

function newGame() {
  grid = Array.from({ length: SIZE }, (_, row) =>
    Array.from({ length: SIZE }, (_, col) => ({ row, col })),
  )
}

newGame()
```
