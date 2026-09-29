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
adında 480×480 piksellik bir canvas zaten var; sağdaki alan o.

Resim yapmadan önce iki şey lazım: **tuvali** masaya koymak ve **kalemi** eline almak. Bu adımda ikisini yapacağız.
Ekran yine değişmeyecek.

# --code--

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')
```

# --meaning--

- `document.getElementById('game')` finds the element whose id is `game`; we name it `canvas`.
- `canvas.getContext('2d')` gives the canvas's 2D drawing tools; we call them `ctx`. Every drawing line will start
  with `ctx.`

# --meaning-tr--

- `document` → **sayfanın kendisi.** Sayfadaki her şeye buradan ulaşırız.
- `.getElementById('game')` → "kimliği (id) `game` olan öğeyi bul". Nokta (`.`) "bunun içindeki şu komut" demek.
- `const canvas =` → bulunan tuvale **canvas** adını verir.
- `canvas.getContext('2d')` → tuvalden **2 boyutlu çizim kalemini** ister.
- `const ctx =` → kaleme `ctx` adını verir (context, "bağlam" kelimesinin kısaltması). Bundan sonraki bütün çizim
  satırları `ctx.` ile başlayacak: "kalemle şunu yap".

# --task--

Write the two lines under the comment lines, above `const WORDS`, and leave an empty line before the list.

# --task-tr--

İki satırı yorum satırlarının **altına**, `const WORDS = [` satırının **üstüne** yaz. Listeyle arada bir boş satır
kalsın. **Çalıştır**'a bas; ekran değişmez ama kontroller yeşil olmalı.

# --hint--

Letters must match exactly: `getElementById` has a capital `E`, `B` and `I`, and a small `d` at the end.

# --hint-tr--

Harfler tam tutmalı: `getElementById` içinde `E`, `B` ve `I` büyük, sondaki `d` küçük.

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
// Hangman, step by step.
// The page already has <canvas id="game" width="480" height="480"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const WORDS = [
  'APPLE', 'BANANA', 'CASTLE', 'DRAGON', 'ELEPHANT', 'FOREST', 'GARDEN', 'HAMMER', 'ISLAND', 'JACKET',
  'KITCHEN', 'LEMON', 'MONKEY', 'NOTEBOOK', 'ORANGE', 'PENGUIN', 'QUEEN', 'ROCKET', 'SPIDER', 'TIGER',
  'UMBRELLA', 'VIOLIN', 'WINDOW', 'YELLOW', 'ZEBRA', 'BRIDGE', 'CANDLE', 'DOLPHIN', 'ENGINE', 'FLOWER',
  'GUITAR', 'HONEY', 'IGLOO', 'JUNGLE', 'KANGAROO', 'LADDER', 'MARKET', 'NEEDLE', 'OCEAN', 'PIRATE',
  'RABBIT', 'SILVER', 'TURTLE', 'VALLEY', 'WIZARD', 'PLANET', 'COOKIE', 'PUZZLE', 'KEYBOARD', 'CAMERA',
]
```
