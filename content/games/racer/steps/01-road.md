---
title: Sky and ground
title_tr: Gökyüzü ve zemin
skills: [game.canvas]
---

# --goal--

Arcade racers of the eighties had no 3D hardware, yet their roads rushed towards you. We will build that trick piece
by piece. First the scenery: a blue sky over green ground. The line between them will be the horizon.

# --goal-tr--

Seksenlerin atari yarış oyunlarında gerçek 3B yoktu, ama yol üstüne üstüne akardı. Bu oyunda o hileyi **parça parça**
kuracağız.

İlk iş manzara: üstte mavi bir **gökyüzü**, altta yeşil bir **zemin**. İkisinin birleştiği çizgi, ileride yolun
uzakta kaybolacağı **ufuk** olacak.

# --code--

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const W = canvas.width
const H = canvas.height

ctx.fillStyle = '#7dd3fc'
ctx.fillRect(0, 0, W, H)
ctx.fillStyle = '#15803d'
ctx.fillRect(0, H / 2, W, H / 2)
```

# --meaning--

- `getElementById('game')` finds the canvas; `getContext('2d')` gives its drawing tool, `ctx`.
- `W` and `H` are the canvas size (480 × 320).
- `fillStyle` picks a color, `fillRect(x, y, width, height)` paints a rectangle: first the whole canvas blue, then the
  lower half (from `H / 2`) green.

# --meaning-tr--

- `document.getElementById('game')` → sayfada kimliği `game` olan **canvas**'ı (tuvali) bulur. `const canvas =` ona
  bir ad verir.
- `canvas.getContext('2d')` → tuvalin **2B çizim aracını** verir; fırça gibi düşün. Bütün çizimi `ctx` ile yapacağız.
- `W` ve `H` → tuvalin eni (480) ve boyu (320). Sayıları her yere yazmak yerine bu kısa adları kullanacağız.
- `ctx.fillStyle = '#7dd3fc'` → fırçaya renk sürer (açık mavi). Renkler `#` ile başlayan kodlarla yazılır.
- `ctx.fillRect(x, y, en, boy)` → o renkle bir dikdörtgen boyar. İlki bütün tuvali maviye boyar.
- İkincisi `H / 2`'den (160) başlar ve `H / 2` boyundadır: **alt yarıyı** koyu yeşile boyar.
- Tuvalin sol üst köşesi `(0, 0)`'dır; `x` sağa, `y` **aşağı** doğru büyür.

# --task--

Write the code under the three comment lines and press **Run**.

# --task-tr--

Kodu editördeki üç yorum satırının (`//` ile başlayanlar) **altına** yaz. **Çalıştır**'a bas: üst yarı mavi, alt yarı
yeşil olmalı.

# --tests--

The whole canvas should be painted sky blue first.
tr: Önce bütün canvas gökyüzü mavisine boyanmalı.

```js
assert.strictEqual(W, 480)
assert.strictEqual(H, 320)
assert.deepEqual($.rects('#7dd3fc').map((r) => [r.x, r.y, r.w, r.h]), [[0, 0, 480, 320]])
```

The lower half should be green ground.
tr: Alt yarı yeşil zemin olmalı.

```js
assert.deepEqual($.rects('#15803d').map((r) => [r.x, r.y, r.w, r.h]), [[0, 160, 480, 160]])
```

# --seed--

```js
// Pseudo-3D racer, step by step.
// The page already has <canvas id="game" width="480" height="320"></canvas>.
// Write your code below.
```

# --solution--

```js
// Pseudo-3D racer, step by step.
// The page already has <canvas id="game" width="480" height="320"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const W = canvas.width
const H = canvas.height

ctx.fillStyle = '#7dd3fc'
ctx.fillRect(0, 0, W, H)
ctx.fillStyle = '#15803d'
ctx.fillRect(0, H / 2, W, H / 2)
```
