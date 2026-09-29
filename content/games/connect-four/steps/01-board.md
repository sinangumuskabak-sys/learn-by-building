---
title: A dark background
title_tr: Koyu bir arka plan
skills: [game.canvas]
---

# --goal--

We are building Connect Four: drop discs into columns and get four in a row before the computer does. Everything is
painted on a `<canvas>`. First we find it, take its drawing tool and paint the background dark.

# --goal-tr--

**Dört Bağla** (Connect Four) yapacağız: diskleri sütunlara bırakıp bilgisayardan önce dördünü yan yana getirmeye
çalışacaksın.

Oyundaki her şey sayfadaki bir **canvas**'a (tuvale) boyanır: 448 piksel eninde, 520 piksel boyunda boş bir resim alanı.
İlk iş: tuvali bul, fırçayı al ve arka planı koyu laciverte boya.

# --code--

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

ctx.fillStyle = '#0f172a'
ctx.fillRect(0, 0, canvas.width, canvas.height)
```

# --meaning--

- `document.getElementById('game')` finds the canvas; `const canvas =` gives it a name.
- `getContext('2d')` gives its drawing tool, `ctx`.
- `fillStyle` picks a color; `fillRect(x, y, width, height)` paints a rectangle, here the whole canvas.

# --meaning-tr--

- `document` → **sayfanın kendisi**. `.getElementById('game')` → "kimliği (id) `game` olan öğeyi bul". Nokta (`.`)
  "bunun içindeki şu komut" demektir. Tırnak içindeki `'game'` bir **yazı**dır.
- `const canvas =` → bulunan şeye **ad verir**. Kutuya etiket yapıştırmak gibi: bundan sonra "canvas" deyince o tuvali
  kastediyoruz. `const` "bu ad hep aynı şeyi gösterecek" demek.
- `canvas.getContext('2d')` → tuvalin **2B çizim aracını** verir; fırça gibi. Adı `ctx`.
- `ctx.fillStyle = '#0f172a'` → fırçaya renk sürer. Renkler `#` ile başlayan kodlarla yazılır; verileni aynen yaz.
- `ctx.fillRect(x, y, en, boy)` → o renkle dikdörtgen boyar. Tuvalin **sol üst köşesi** `(0, 0)`'dır; `x` sağa, `y`
  **aşağı** doğru büyür. `canvas.width` ve `canvas.height` tuvalin eni (448) ve boyu (520): bütün tuval boyanır.

# --task--

Write the code under the three comment lines and press **Run**.

# --task-tr--

Kodu editördeki üç yorum satırının (`//` ile başlayanlar; bilgisayar onları atlar, sadece insanlar için not) **altına**
yaz. Kopyalama; kendin yaz. **Çalıştır**'a bas: sağdaki oyun alanı koyu lacivert olmalı ve alttaki kontrol yeşile
dönmeli.

# --tests--

The whole canvas should be painted dark.
tr: Bütün canvas koyu renge boyanmalı.

```js
assert.strictEqual(canvas, $.canvas)
assert.deepEqual($.rects('#0f172a').map((r) => [r.x, r.y, r.w, r.h]), [[0, 0, 448, 520]])
```

# --seed--

```js
// Connect four, step by step.
// The page already has <canvas id="game" width="448" height="520"></canvas>.
// Write your code below.
```

# --solution--

```js
// Connect four, step by step.
// The page already has <canvas id="game" width="448" height="520"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

ctx.fillStyle = '#0f172a'
ctx.fillRect(0, 0, canvas.width, canvas.height)
```
