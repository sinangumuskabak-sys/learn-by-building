---
title: The canvas and the pen
title_tr: Tuval ve kalem
skills: [game.canvas]
---

# --goal--

A word game like Wordle: guess the secret five-letter word in six tries; after every guess, colours show which letters
are right. Everything is drawn on the page's `<canvas>`, so first we find it and take its 2D drawing tools.

# --goal-tr--

**Wordle** tarzı bir kelime oyunu yapıyoruz: gizli beş harfli kelimeyi **altı denemede** bul. Her tahminden sonra
renkler ipucu verir: yeşil doğru yerde, sarı kelimede ama başka yerde, gri kelimede yok.

Oyun sayfadaki bir **canvas** (tuval) üzerine çizilecek: `game` adında, 360×560 piksellik boş bir dikdörtgen. Resim
yapmadan önce **tuvali** bulup **kalemi** eline alman lazım. Bu adımda ekran değişmeyecek.

# --code--

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')
```

# --meaning--

- `document.getElementById('game')` finds the element whose id is `game`; `const canvas =` names it.
- `canvas.getContext('2d')` gives the canvas's 2D drawing tools; we call them `ctx`.

# --meaning-tr--

- `document` → **sayfanın kendisi.** Sayfadaki her şeye buradan ulaşırız.
- `.getElementById('game')` → "kimliği (id) `game` olan öğeyi bul". Nokta (`.`) "bunun içindeki şu komut" demek.
- `const canvas =` → bulunan tuvale **canvas** adını verir. `const` "bu ad hep aynı şeyi gösterecek" demek.
- `canvas.getContext('2d')` → tuvalden **2 boyutlu çizim kalemini** ister; ona `ctx` (context, "bağlam") adını
  veririz. Bütün çizim satırları `ctx.` ile başlayacak.

# --task--

Write the two lines under the three comment lines, then press **Run**.

# --task-tr--

İki satırı editördeki üç yorum satırının (`//` ile başlayanlar) **altına** yaz. Kopyalama; kendin yaz, harf harf.
**Çalıştır**'a bas. Ekran değişmez, alttaki kontroller yeşil olmalı.

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

# --seed--

```js
// Word guessing game, step by step.
// The page already has <canvas id="game" width="360" height="560"></canvas>.
// Write your code below.
```

# --solution--

```js
// Word guessing game, step by step.
// The page already has <canvas id="game" width="360" height="560"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')
```
