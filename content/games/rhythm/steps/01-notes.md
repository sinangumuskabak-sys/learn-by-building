---
title: A stage for the notes
title_tr: Notalar için bir sahne
skills: [game.canvas]
---

# --goal--

In a rhythm game notes slide down lanes towards a line, and you press the lane's key the moment a note reaches it.
First the stage: find the canvas, take its pen and paint it dark.

# --goal-tr--

Bir ritim oyunu yapıyoruz: renkli **notalar** dört şeritte yukarıdan aşağı kayar; nota alttaki çizgiye geldiği an o
şeridin tuşuna basarsın. Müzikle el çırpmak gibi: erken ya da geç değil, **tam zamanında**.

Önce bir **sahne** lazım. Sayfada `game` adında 400×560 piksellik bir **canvas** (tuval) zaten var; sağdaki alan o.
Onu bulacağız, çizim kalemini alacağız ve tamamını koyu renge boyayacağız.

# --code--

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

ctx.fillStyle = '#0f172a'
ctx.fillRect(0, 0, canvas.width, canvas.height)
```

# --meaning--

- `document.getElementById('game')` finds the canvas; `const canvas =` names it.
- `canvas.getContext('2d')` gives the pen with all drawing commands; we call it `ctx`.
- `fillStyle` picks a color, `fillRect(x, y, width, height)` fills a rectangle. `(0, 0)` is the top-left corner, and
  `canvas.width`, `canvas.height` (400, 560) make it cover everything.

# --meaning-tr--

- `document` → **sayfanın kendisi**. `.getElementById('game')` → "kimliği (id) `game` olan öğeyi bul".
- `const canvas =` → bulunan şeye **canvas** adını verir. `const` "bu ad hep aynı şeyi gösterecek" demektir.
- `canvas.getContext('2d')` → canvas'tan **2 boyutlu çizim kalemini** ister. Adı `ctx` (context'in kısaltması);
  bütün çizim satırları `ctx.` ile başlayacak.
- `ctx.fillStyle = '#0f172a'` → kalemin **dolgu rengini** seçer. `#` ile başlayan kod bir renktir; bu çok koyu bir
  lacivert.
- `ctx.fillRect(0, 0, canvas.width, canvas.height)` → içi dolu bir **dikdörtgen** çizer. Dört sayı sırayla: sol üst
  köşenin `x`'i ve `y`'si, sonra genişlik ve yükseklik. Canvas'ta `(0, 0)` **sol üst köşedir**; `x` sağa, `y`
  **aşağı** doğru büyür. `canvas.width` ve `canvas.height` tuvalin tam boyu (400 ve 560), yani her yer boyanır.

# --task--

Write the lines under the three comment lines, then press **Run**.

# --task-tr--

Kodu, editördeki üç yorum satırının (`//` ile başlayanlar; bilgisayar bunları okumaz, insan için nottur) **altına**
yaz. Kopyalama; kendin yaz, harf harf. Sonra **Çalıştır**'a bas: sağdaki alanın tamamı koyu laciverte dönmeli.

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

The whole 400×560 canvas should be filled with `#0f172a`.
tr: 400×560'lık canvas'ın tamamı `#0f172a` ile boyanmalı.

```js
const full = $.rects('#0f172a').filter((r) => r.x === 0 && r.y === 0 && r.w === 400 && r.h === 560)
assert.lengthOf(full, 1)
```

# --seed--

```js
// Rhythm game, step by step.
// The page already has <canvas id="game" width="400" height="560"></canvas>.
// Write your code below.
```

# --solution--

```js
// Rhythm game, step by step.
// The page already has <canvas id="game" width="400" height="560"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

ctx.fillStyle = '#0f172a'
ctx.fillRect(0, 0, canvas.width, canvas.height)
```
