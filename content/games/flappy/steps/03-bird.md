---
title: Draw the bird
title_tr: Kuşu çiz
skills: [game.canvas, game.state]
---

# --goal--

The bird is a gold circle. We keep what we know about it (where it is, how big it is) in one object, `bird`, and
draw the circle from that object.

# --goal-tr--

Kuşumuz sarı bir **daire** olacak. Önce kuş hakkında bildiklerimizi bir yerde topluyoruz: nerede duruyor, ne kadar
büyük? Sonra daireyi bu bilgilere bakarak çiziyoruz.

Bu ayrım önemli: kuş hareket edince yalnız bilgileri değiştireceğiz, çizim onlara bakıp kuşu yeni yerine koyacak.

# --code--

```js
let bird = { x: 100, y: 300, r: 14 }

ctx.fillStyle = 'gold'
ctx.beginPath()
ctx.arc(bird.x, bird.y, bird.r, 0, Math.PI * 2)
ctx.fill()
```

# --meaning--

- `{ x: 100, y: 300, r: 14 }` is an object: named values in one package. `r` is the radius.
- `let` makes a variable whose value can change later: the bird will move.
- Canvas has no "fill a circle" command. `beginPath` starts a new shape, `arc` describes a full circle around
  (`bird.x`, `bird.y`), `fill` paints it.
- Angles are in radians: a full turn is `Math.PI * 2`, not 360.

# --meaning-tr--

- `let bird =` → **değişken** tanımlar. `const`'tan farkı: `let` ile verilen adın değeri **sonradan
  değiştirilebilir**. Kuş hareket edeceği için `let`.
- `{ x: 100, y: 300, r: 14 }` → bir **nesne** (object): etiketli bilgilerden oluşan bir kart. `x` soldan uzaklık,
  `y` yukarıdan uzaklık, `r` dairenin **yarıçapı** (merkezden kenara uzaklık). Bilgiler virgülle ayrılır.
- `bird.x` → "kuşun x'i" (100). Nokta, paketin içinden bir bilgiyi okur.
- `ctx.fillStyle = 'gold'` → altın sarısı.
- Canvas'ta hazır bir "daire boya" komutu yok; daireyi önce **tarif eder**, sonra **boyarız**:
  - `ctx.beginPath()` → "yeni bir şekle başlıyorum".
  - `ctx.arc(bird.x, bird.y, bird.r, 0, Math.PI * 2)` → (x, y) etrafında, `r` yarıçaplı bir yay. Son iki sayı yayın
    başladığı ve bittiği açı. Açılar derece değil **radyan** ile verilir: tam tur `2π`. `Math.PI` hazır π sayısı
    (3,14...), `*` çarpma. Yani 0'dan `Math.PI * 2`'ye: **tam bir daire**.
  - `ctx.fill()` → tarif edilen şekli boya.
- Kuş satırları gökyüzünden **sonra** yazılır: sonra çizilen, öncekinin üstüne gelir.

# --task--

1. Under `const ctx = ...`, leave an empty line and write the `bird` line.
2. At the very end, leave an empty line and write the four circle lines. Press **Run**.

# --task-tr--

1. `const ctx = ...` satırının altına bir boş satır bırakıp `let bird = ...` satırını yaz.
2. Dosyanın **en sonuna**, bir boş satırdan sonra daireyi çizen dört satırı yaz.
3. **Çalıştır**: mavi gökyüzünün solunda, ortaya yakın sarı küçük bir top görmelisin.

# --hint--

If there is no circle, check that `ctx.fill()` is there: `arc` only describes the shape, `fill` paints it.

# --hint-tr--

Daire görünmüyorsa `ctx.fill()` satırını kontrol et: `arc` şekli yalnız tarif eder, boyayan `fill`.

# --try--

Change `r: 14` to `r: 40` and run: a big fat bird. Put `14` back.

# --try-tr--

`r: 14`'ü `r: 40` yap ve çalıştır: koca, tombul bir kuş. Sonra `14`'e geri al.

# --tests--

`bird` should start at (100, 300) with radius 14.
tr: `bird` (100, 300) noktasında, yarıçapı 14 olarak başlamalı.

```js
assert.include(bird, { x: 100, y: 300, r: 14 })
```

The bird should be drawn as a gold circle.
tr: Kuş altın sarısı bir daire olarak çizilmeli.

```js
assert.deepEqual($.arcs(), [{ x: 100, y: 300, r: 14, color: 'gold' }])
assert.isTrue($.screen().some((c) => c.op === 'fill' && c.fill === 'gold'), 'call ctx.fill() after ctx.arc()')
```

# --solution--

```js
// Flappy, step by step.
// The page already has <canvas id="game" width="400" height="600"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

let bird = { x: 100, y: 300, r: 14 }

ctx.fillStyle = '#70c5ce'
ctx.fillRect(0, 0, canvas.width, canvas.height)

ctx.fillStyle = 'gold'
ctx.beginPath()
ctx.arc(bird.x, bird.y, bird.r, 0, Math.PI * 2)
ctx.fill()
```
