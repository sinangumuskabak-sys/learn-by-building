---
title: A function for any sea
title_tr: Her deniz için bir fonksiyon
skills: [prog.functions]
---

# --goal--

There will be two seas: the enemy's, big, and yours, small. We turn the drawing into a function, `drawSea(origin, size)`,
that can draw a sea anywhere and at any size.

# --goal-tr--

Oyunda **iki** deniz olacak: üstte düşmanınki (büyük), altta seninki (küçük). Aynı döngüleri iki kez yazmak yerine bir
**fonksiyon** yazıyoruz: `drawSea(origin, size)`. Ona denizin nereden başlayacağını ve karelerin ne kadar büyük
olacağını söylersin, o da çizer.

Ekran aynı görünecek; ama artık denizi tek satırla çizebiliyoruz.

# --code--

```js
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

drawSea(SEA, BIG)
```

# --meaning--

- `origin` and `size` are parameters: `drawSea(SEA, BIG)` runs the function with `origin = SEA` and `size = BIG`.
- `x` and `y` are the square's top-left corner, computed once and used below.
- The fill color is set inside the loop because later squares will get other colors.

# --meaning-tr--

- `function drawSea(origin, size)` → iki **parametre**: `origin` (başlangıç köşesi) ve `size` (kare boyu).
  `drawSea(SEA, BIG)` diye çağırınca içeride `origin` = `SEA`, `size` = `BIG` olur.
- `const x = origin.x + c * size`, `const y = ...` → karenin sol üst köşesi; bir kez hesaplayıp aşağıda kullanıyoruz.
- `ctx.fillStyle = '#1e3a8a'` artık döngünün **içinde**: ileride bazı kareler başka renkte olacak (gemi, isabet...).
- En alttaki `drawSea(SEA, BIG)` → düşman denizini çizer.

# --task--

Turn the two loops into `drawSea` above the background lines, and call `drawSea(SEA, BIG)` under the background.

# --task-tr--

1. Arka planı boyayan iki satırın **üstüne** `drawSea` fonksiyonunu yaz (döngüleri içine taşı ve kodda görüldüğü gibi
   değiştir); altında bir boş satır kalsın.
2. Eski döngüleri ve `ctx.fillStyle = '#1e3a8a'` satırını sil.
3. Arka planın altına, bir boş satırdan sonra `drawSea(SEA, BIG)` yaz.
4. **Çalıştır**: ekran aynı görünmeli.

# --tests--

`drawSea` should draw a sea anywhere, at any size.
tr: `drawSea` bir denizi her yere, her boyda çizebilmeli.

```js
drawSea({ x: 0, y: 0 }, 10)
const small = $.rects('#1e3a8a').filter((r) => r.w === 8)
assert.lengthOf(small, 100)
assert.deepEqual([small[0].x, small[0].y], [1, 1])
```

The enemy's sea should still be drawn.
tr: Düşman denizi yine çizilmeli.

```js
assert.lengthOf($.rects('#1e3a8a').filter((r) => r.w === 34), 100)
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
const SEA = { x: 30, y: 50 }

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
```
