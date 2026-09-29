---
title: A dark table
title_tr: Koyu bir masa
skills: [game.canvas]
---

# --goal--

Everything in this game is drawn on the page's `<canvas>`. We find it, take its 2D drawing context, and paint the
whole canvas dark in a `draw` function: the table the chess board will lie on.

# --goal-tr--

Bu oyunda her şeyi sayfadaki **canvas**'a (tuval) çizeceğiz: 480×520 piksellik boş bir dikdörtgen. Önce onu bulup
**çizim kalemini** alacağız, sonra bütün tuvali koyu renge boyayacağız. Burası, satranç tahtasını üstüne koyacağımız
**masa**.

Çizim satırlarını baştan `draw` (çiz) adlı bir **fonksiyon**un içine yazıyoruz; çünkü ileride taşlar oynadıkça
resmi tekrar tekrar çizeceğiz.

# --code--

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

function draw() {
  ctx.fillStyle = '#1c1917'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

draw()
```

# --meaning--

- `document.getElementById('game')` finds the canvas; `getContext('2d')` gives the object with the drawing commands.
- `fillStyle` picks the fill color, `fillRect(x, y, width, height)` fills a rectangle. `(0, 0)` is the top-left
  corner; `x` grows to the right and `y` grows **down**.
- `draw()` at the bottom runs the function once.

# --meaning-tr--

- `document.getElementById('game')` → sayfada kimliği (id) `game` olan öğeyi, yani canvas'ı bulur.
- `canvas.getContext('2d')` → canvas'tan **2 boyutlu çizim kalemini** ister. Adı `ctx` (context'in kısaltması);
  bütün çizim komutları `ctx.` ile başlayacak.
- `const` → bir şeye **kalıcı bir ad** verir: bu ad hep aynı şeyi gösterir.
- `function draw() { ... }` → **fonksiyon tanımlar**: süslü parantez içindeki satırlara `draw` adını verir. Bu
  satır tek başına bir şey çizmez; sadece tarifi yazar.
- `ctx.fillStyle = '#1c1917'` → kalemin **dolgu rengini** seçer: çok koyu, sıcak bir kahve-siyah.
- `ctx.fillRect(0, 0, canvas.width, canvas.height)` → içi dolu bir **dikdörtgen** çizer. İlk iki sayı sol üst
  köşesi: canvas'ta **(0, 0) sol üst köşedir**, `x` sağa, `y` **aşağı** doğru büyür. Son ikisi eni ve boyu:
  canvas'ın kendi boyu (480 ve 520), yani her yer.
- En alttaki `draw()` → fonksiyonu **çağırır**: tarifi şimdi uygula.

# --task--

Write the code under the three comment lines, then press **Run**.

# --task-tr--

Kodu editördeki üç yorum satırının (`//` ile başlayanlar) **altına** yaz. Sonra **Çalıştır**'a bas: sağdaki alanın
tamamı koyu renge boyanmalı.

# --hint--

If the screen stays empty, check the `draw()` call at the very end: defining a function does not run it.

# --hint-tr--

Ekran boş kalıyorsa en alttaki `draw()` çağrısına bak: fonksiyonu tanımlamak onu çalıştırmaz. Bir de
`getElementById` içindeki büyük `E`, `B`, `I` harflerini kontrol et.

# --tests--

The whole 480×520 canvas should be painted `#1c1917`.
tr: 480×520'lik canvas'ın tamamı `#1c1917` ile boyanmalı.

```js
const full = $.rects('#1c1917').filter((r) => r.x === 0 && r.y === 0 && r.w === 480 && r.h === 520)
assert.lengthOf(full, 1)
```

`ctx` should be the canvas's 2D context.
tr: `ctx`, canvas'ın 2D çizim bağlamı olmalı.

```js
assert.strictEqual(ctx, $.canvas.getContext('2d'))
```

# --seed--

```js
// Chess, step by step.
// The page already has <canvas id="game" width="480" height="520"></canvas>.
// Write your code below.
```

# --solution--

```js
// Chess, step by step.
// The page already has <canvas id="game" width="480" height="520"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

function draw() {
  ctx.fillStyle = '#1c1917'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

draw()
```
