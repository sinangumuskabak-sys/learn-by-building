---
title: A sky for the words
title_tr: Kelimeler için bir gökyüzü
skills: [game.canvas]
---

# --goal--

In this game words fall from the sky, and you type them before they land. First the sky: find the canvas, take its
pen and paint it night blue.

# --goal-tr--

Bu oyunda gökyüzünden **kelimeler yağar**; yere inmeden onları klavyeden yazarsın. Yazdığın kelime kaybolur. Hem
eğlenceli bir yazma alıştırması, hem de canvas'a **yazı** çizmeyi öğrenmek için güzel bir oyun.

Önce gökyüzü. Sayfada `game` adında 480×480 piksellik bir **canvas** (tuval) var; sağdaki alan o. Onu bulacağız,
çizim kalemini alacağız ve gece mavisine boyayacağız.

# --code--

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

ctx.fillStyle = '#020617'
ctx.fillRect(0, 0, canvas.width, canvas.height)
```

# --meaning--

- `document.getElementById('game')` finds the canvas; `const canvas =` names it.
- `canvas.getContext('2d')` gives the pen with all drawing commands; we call it `ctx`.
- `fillStyle` picks a color, `fillRect(x, y, width, height)` fills a rectangle. `(0, 0)` is the top-left corner, and
  `canvas.width`, `canvas.height` (480, 480) make it cover everything.

# --meaning-tr--

- `document` → **sayfanın kendisi**. `.getElementById('game')` → "kimliği (id) `game` olan öğeyi bul".
- `const canvas =` → bulunan şeye **canvas** adını verir. `const` "bu ad hep aynı şeyi gösterecek" demektir.
- `canvas.getContext('2d')` → canvas'tan **2 boyutlu çizim kalemini** ister. Adı `ctx` (context'in kısaltması);
  bütün çizim satırları `ctx.` ile başlayacak.
- `ctx.fillStyle = '#020617'` → kalemin **dolgu rengini** seçer: neredeyse siyah bir gece mavisi. (`#` ile başlayan
  kod bir renktir.)
- `ctx.fillRect(0, 0, canvas.width, canvas.height)` → içi dolu bir **dikdörtgen** çizer. Dört sayı sırayla: sol üst
  köşenin `x`'i ve `y`'si, sonra genişlik ve yükseklik. Canvas'ta `(0, 0)` **sol üst köşedir**; `x` sağa, `y`
  **aşağı** doğru büyür. `canvas.width` ve `canvas.height` tuvalin tam boyu, yani her yer boyanır.

# --task--

Write the lines under the three comment lines, then press **Run**.

# --task-tr--

Kodu, editördeki üç yorum satırının (`//` ile başlayanlar; bilgisayar bunları okumaz, insan için nottur) **altına**
yaz. Kopyalama; kendin yaz, harf harf. Sonra **Çalıştır**'a bas: sağdaki alan gece mavisine dönmeli.

# --hint--

Check the spelling: `getElementById` has a capital `E`, `B` and `I`; `'game'` and `'2d'` are in quotes.

# --hint-tr--

Yazımı kontrol et: `getElementById` içinde büyük `E`, `B` ve `I` var; `'game'` ve `'2d'` tırnak içinde olmalı.

# --tests--

`canvas` should be the `#game` canvas and `ctx` its 2D context.
tr: `canvas` sayfadaki `#game` canvas'ı, `ctx` de onun 2D çizim bağlamı olmalı.

```js
assert.strictEqual(canvas, $.canvas)
assert.strictEqual(ctx, $.canvas.getContext('2d'))
```

The whole 480×480 canvas should be filled with `#020617`.
tr: 480×480'lik canvas'ın tamamı `#020617` ile boyanmalı.

```js
const full = $.rects('#020617').filter((r) => r.x === 0 && r.y === 0 && r.w === 480 && r.h === 480)
assert.lengthOf(full, 1)
```

# --seed--

```js
// Typing game, step by step.
// The page already has <canvas id="game" width="480" height="480"></canvas>.
// Write your code below.
```

# --solution--

```js
// Typing game, step by step.
// The page already has <canvas id="game" width="480" height="480"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

ctx.fillStyle = '#020617'
ctx.fillRect(0, 0, canvas.width, canvas.height)
```
