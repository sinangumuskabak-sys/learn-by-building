---
title: Find the canvas
title_tr: Canvas'ı bul
skills: [game.canvas]
---

# --goal--

Games are drawn on a `<canvas>`: a rectangle of pixels on the page. The page already has one with the id `game`.
First we get hold of it from JavaScript.

# --goal-tr--

Oyunlar sayfadaki bir **canvas** (tuval) üzerine çizilir: piksellerden oluşan boş bir dikdörtgen. Sayfada `game`
adında 400×400 piksellik bir canvas zaten var; sağdaki koyu alan o.

Bu adımda ekranda bir şey değişmeyecek. Yalnız JavaScript'e "o canvas'ı bul ve bir ada koy" diyeceğiz. Bir resme
başlamadan önce tuvali masaya koymak gibi.

# --code--

```js
const canvas = document.getElementById('game')
```

# --meaning--

- `document` is the page. `getElementById('game')` finds the element whose id is `game`.
- `const canvas =` gives what was found a name, so later lines can use it.

# --meaning-tr--

- `document` → **sayfanın kendisi.** Sayfadaki her şeye buradan ulaşırız.
- `.getElementById('game')` → "kimliği (id) `game` olan öğeyi bul". Tırnak içindeki ad sayfadaki ad ile aynı olmalı.
- `const canvas =` → bulunan şeye **canvas** adını verir. Bundan sonra "canvas" dediğimizde o tuvali kastediyoruz.
  `const` "bu ad hep aynı şeyi gösterecek" demektir.

# --task--

Write the line under the three comment lines, then press **Run**.

# --task-tr--

Kodu, editördeki üç yorum satırının (`//` ile başlayanlar) **altına** yaz. Kopyalama; kendin yaz, harf harf.
Sonra **Çalıştır**'a bas. Ekran değişmez, ama alttaki kontrol yeşil olmalı.

# --hint--

Check the spelling: `getElementById` has a capital `E`, `B` and `I`, and `'game'` is in quotes.

# --hint-tr--

Yazımı kontrol et: `getElementById` içinde büyük `E`, `B` ve `I` var; `'game'` tırnak içinde olmalı.

# --tests--

`canvas` should be the `#game` canvas element.
tr: `canvas`, sayfadaki `#game` canvas'ı olmalı.

```js
assert.strictEqual(canvas, $.canvas)
```

# --seed--

```js
// Snake, step by step.
// The page already has <canvas id="game" width="400" height="400"></canvas>.
// Write your code below.
```

# --solution--

```js
// Snake, step by step.
// The page already has <canvas id="game" width="400" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
```
