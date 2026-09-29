---
title: Draw the walls
title_tr: Duvarları çiz
skills: [game.canvas]
---

# --goal--

Every tile is a 48-pixel square. A small `tile` helper paints one square, slightly inset; then every wall in the Set is
drawn with it.

# --goal-tr--

Duvarları görelim. Her kare 48×48 piksel olacak: `TILE`. Duvarlar, kutular, hedefler, oyuncu... hepsi bir karenin
içinde çizilecek; bu yüzden kare boyayan küçük bir **yardımcı** yazıyoruz: `tile`.

Yardımcı bir de **inset** (içeri çekme) alır: kareyi her yandan o kadar piksel küçültür. Duvar neredeyse tam kare
olacak, hedef ise ortada küçük bir nokta.

# --code--

```js
const TILE = 48

function draw() {
  ctx.fillStyle = '#1c1917'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const tile = (x, y, color, inset = 0) => {
    ctx.fillStyle = color
    ctx.fillRect(x * TILE + inset, y * TILE + inset, TILE - inset * 2, TILE - inset * 2)
  }

  for (const k of walls) {
    const [x, y] = k.split(',').map(Number)
    tile(x, y, '#78716c', 1)
  }
}
```

# --meaning--

- `tile(x, y, color, inset)` paints the tile at column `x`, row `y`: `x * TILE` pixels from the left, shrunk by `inset`
  on each side. `inset = 0` is a default when it is left out.
- `for (const k of walls)` goes through the Set. `k.split(',')` cuts `'3,2'` into `['3', '2']`, `.map(Number)` makes
  them numbers, and `const [x, y] =` names the two.
- Walls are grey, inset by 1 pixel, so a thin line shows between them.

# --meaning-tr--

- `const TILE = 48` → bir karenin kenarı, piksel olarak.
- `const tile = (x, y, color, inset = 0) => { ... }` → dört parametreli bir ok fonksiyonu. `inset = 0` → bu değer
  verilmezse **0** kullan (varsayılan değer).
- `x * TILE + inset` → `x`. sütun soldan `x * 48` pikselde başlar; `inset` kadar içeri kayar. `y` için aynısı.
- `TILE - inset * 2` → iki yandan da `inset` kadar küçüldüğü için genişlik `48 - 2 × inset`.
- `for (const k of walls)` → "kümedeki **her eleman** için": `k` sırayla `'0,0'`, `'1,0'`...
- `k.split(',')` → yazıyı virgülden **böler**: `'3,2'` → `['3', '2']`. `.map(Number)` → her parçayı **sayıya**
  çevirir: `[3, 2]`.
- `const [x, y] = ...` → listenin ilk elemanına `x`, ikincisine `y` adını verir.
- `tile(x, y, '#78716c', 1)` → gri, 1 piksel içeri çekilmiş duvar. Aralarında ince bir çizgi görünür.

# --task--

1. Above `// The classic ...` write `const TILE = 48`.
2. In `draw`, under the `fillRect` line, leave an empty line and write `tile` and the `for` loop. Press **Run**.

# --task-tr--

1. `// The classic ...` yorumunun **üstüne** `const TILE = 48` yaz (`ctx` satırından sonraki boş satırın altına).
2. `draw` içinde `ctx.fillRect(...)` satırının altına bir boş satır bırak; `tile` yardımcısını ve `for` döngüsünü
   yaz (aralarında bir boş satır).
3. **Çalıştır**: sol üstte gri duvarlardan bir çerçeve görmelisin.

# --try--

Change the wall's inset `1` to `10` and run: the walls become small blocks. Put `1` back.

# --try-tr--

Duvarın `1` olan inset değerini `10` yap ve çalıştır: duvarlar küçük bloklara döner. Sonra `1`'e geri al.

# --tests--

`TILE` should be 48.
tr: `TILE` 48 olmalı.

```js
assert.strictEqual(TILE, 48)
```

All 12 walls should be drawn as grey squares inset by 1 pixel.
tr: 12 duvarın hepsi 1 piksel içeri çekilmiş gri kareler olarak çizilmeli.

```js
draw()
const grey = $.rects('#78716c')
assert.lengthOf(grey, 12)
assert.deepInclude(grey, { x: 1, y: 1, w: 46, h: 46, color: '#78716c' })
assert.deepInclude(grey, { x: 4 * 48 + 1, y: 2 * 48 + 1, w: 46, h: 46, color: '#78716c' })
```

# --solution--

```js
// Sokoban, step by step.
// The page already has <canvas id="game" width="480" height="520"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TILE = 48
// The classic Sokoban text format: # wall, . goal, $ box, * box on a goal, @ player, + player on a goal.
const LEVELS = [
  [
    '#####',
    '#@$.#',
    '#####',
  ],
]

let level = 0
let walls

const key = (x, y) => x + ',' + y // one string per tile, so tiles can go in a Set

function loadLevel(index) {
  level = index
  walls = new Set()
  LEVELS[level].forEach((line, y) => {
    ;[...line].forEach((ch, x) => {
      if (ch === '#') walls.add(key(x, y))
    })
  })
}

function draw() {
  ctx.fillStyle = '#1c1917'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const tile = (x, y, color, inset = 0) => {
    ctx.fillStyle = color
    ctx.fillRect(x * TILE + inset, y * TILE + inset, TILE - inset * 2, TILE - inset * 2)
  }

  for (const k of walls) {
    const [x, y] = k.split(',').map(Number)
    tile(x, y, '#78716c', 1)
  }
}

loadLevel(0)
draw()
```
