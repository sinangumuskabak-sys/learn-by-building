---
title: Your own sea
title_tr: Senin denizin
skills: [game.canvas]
---

# --goal--

Your own fleet sails on a second, smaller sea at the bottom, with a title above it. The same function draws it.

# --goal-tr--

Senin filonun denizi altta, **daha küçük** kareli ikinci bir deniz; üstünde de bir başlık: `Your fleet` (senin filon).
Aynı fonksiyon onu da çizer; yalnız başka bir köşe ve başka bir boy veriyoruz.

# --code--

```js
const SMALL = 20 // cell size of your own sea
const HOME = { x: 30, y: 440 }

ctx.fillStyle = 'white'
ctx.font = 'bold 14px sans-serif'
ctx.fillText('Your fleet', HOME.x, HOME.y - 10)
drawSea(HOME, SMALL)
```

# --meaning--

- `SMALL` is the square size of your sea, `HOME` its top-left corner.
- `font` sets the text size and typeface; `fillText` writes the title 10 pixels above your sea.
- `drawSea(HOME, SMALL)` reuses the function for the second sea.

# --meaning-tr--

- `const SMALL = 20` → senin denizinin kare boyu. `const HOME = { x: 30, y: 440 }` → senin denizinin sol üst köşesi.
- `ctx.font = 'bold 14px sans-serif'` → yazı **tipi ve boyu**: kalın, 14 piksel.
- `ctx.fillText('Your fleet', HOME.x, HOME.y - 10)` → yazıyı denizin 10 piksel üstüne yazar.
- `drawSea(HOME, SMALL)` → aynı fonksiyon, başka bilgilerle: ikinci deniz. Fonksiyon yazmanın faydası bu.

# --task--

1. Under `const BIG` write `SMALL`; under `const SEA` write `HOME`.
2. At the very end, leave an empty line and write the four lines.

# --task-tr--

1. `const BIG ...` satırının altına `SMALL`, `const SEA ...` satırının altına `HOME` sabitini yaz.
2. Kodun en sonuna, bir boş satırdan sonra dört satırı yaz.
3. **Çalıştır**: altta küçük bir deniz ve üstünde `Your fleet` yazısı görmelisin.

# --tests--

Your sea should be drawn smaller at the bottom, with its title.
tr: Senin denizin altta daha küçük çizilmeli, başlığıyla.

```js
const small = $.rects('#1e3a8a').filter((r) => r.w === 18)
assert.lengthOf(small, 100)
assert.deepEqual([small[0].x, small[0].y], [31, 441])
assert.include($.texts(), 'Your fleet')
```

# --solution--

```js
// Battleship, step by step.
// The page already has <canvas id="game" width="420" height="620"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const N = 10
const BIG = 36 // cell size of the enemy's sea, where you shoot
const SMALL = 20 // cell size of your own sea
const SEA = { x: 30, y: 50 }
const HOME = { x: 30, y: 440 }

function drawSea(origin, size) {
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const x = origin.x + c * size
      const y = origin.y + r * size
      ctx.fillStyle = '#1e3a8a'
      ctx.fillRect(x + 1, y + 1, size - 2, size - 2)
    }
  }
}

ctx.fillStyle = '#0f172a'
ctx.fillRect(0, 0, canvas.width, canvas.height)

drawSea(SEA, BIG)

ctx.fillStyle = 'white'
ctx.font = 'bold 14px sans-serif'
ctx.fillText('Your fleet', HOME.x, HOME.y - 10)
drawSea(HOME, SMALL)
```
