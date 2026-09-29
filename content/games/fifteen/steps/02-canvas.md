---
title: The canvas and the pen
title_tr: Tuval ve kalem
skills: [game.canvas]
---

# --goal--

Games are drawn on a `<canvas>`, a rectangle of pixels. The page already has one with the id `game`. We find it and
take its 2D drawing tools.

# --goal-tr--

Oyunlar sayfadaki bir **canvas** (tuval) üzerine çizilir: piksellerden oluşan boş bir dikdörtgen. Sayfada `game`
adında 400×460 piksellik bir canvas zaten var; sağdaki alan o.

Resim yapmadan önce iki şey lazım: **tuvali** masaya koymak ve **kalemi** eline almak. Ekran yine değişmeyecek.

# --code--

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')
```

# --meaning--

- `document.getElementById('game')` finds the element whose id is `game`; we name it `canvas`.
- `canvas.getContext('2d')` gives the canvas's 2D drawing tools; we call them `ctx`.

# --meaning-tr--

- `document` → **sayfanın kendisi.** Sayfadaki her şeye buradan ulaşırız.
- `.getElementById('game')` → "kimliği (id) `game` olan öğeyi bul". Nokta (`.`) "bunun içindeki şu komut" demek.
- `const canvas =` → bulunan tuvale **canvas** adını verir. `const` "bu ad hep aynı şeyi gösterecek" demek.
- `canvas.getContext('2d')` → tuvalden **2 boyutlu çizim kalemini** ister; ona `ctx` adını veririz (context,
  "bağlam"). Bütün çizim satırları `ctx.` ile başlayacak.

# --task--

Write the two lines under the comment lines, above `let tiles`, and leave an empty line.

# --task-tr--

İki satırı yorum satırlarının **altına**, `let tiles` satırının **üstüne** yaz; arada bir boş satır kalsın.
**Çalıştır**.

# --hint--

Letters must match exactly: `getElementById` has a capital `E`, `B` and `I`.

# --hint-tr--

Harfler tam tutmalı: `getElementById` içinde `E`, `B` ve `I` büyük.

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
// Sliding puzzle, step by step.
// The page already has <canvas id="game" width="400" height="460"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

let tiles // tiles[position] is the number on that square, 0 for the gap; positions go row by row

function reset() {
  tiles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0]
}

reset()
```
