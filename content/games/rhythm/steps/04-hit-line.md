---
title: The hit line
title_tr: Vuruş çizgisi
skills: [prog.arrays]
---

# --goal--

Near the bottom, each lane gets a colored bar: the hit line. The four colors are kept in an array, one per lane.

# --goal-tr--

Her şeridin altına renkli bir **vuruş çizgisi** koyuyoruz: nota tam bu çizgiye geldiğinde basacaksın. Her şeridin
kendi rengi olacak: kırmızı, turuncu, yeşil, mavi.

Dört rengi tek tek adlandırmak yerine bir **dizi** (array) içinde tutarız: sıralı bir liste, bir alışveriş listesi
gibi. Şerit numarasıyla listeden kendi rengini alır.

# --code--

```js
const HIT_Y = 480 // where a note should be when you press
const COLORS = ['#f43f5e', '#f59e0b', '#22c55e', '#3b82f6']

  ctx.fillRect(x + 2, 0, LANE_W - 4, canvas.height)
  ctx.fillStyle = COLORS[lane]
  ctx.fillRect(x + 6, HIT_Y - 4, LANE_W - 12, 8)
}
```

# --meaning--

- `HIT_Y` is the height of the hit line, 480 pixels from the top.
- `COLORS` is an array; `COLORS[lane]` is the color at that position, counting from 0.
- The bar is 8 pixels tall and centred on `HIT_Y` (`HIT_Y - 4`), 6 pixels in from the lane's sides.

# --meaning-tr--

- `const HIT_Y = 480` → vuruş çizgisinin yüksekliği: yukarıdan 480. piksel. Satır sonundaki `//` bir **yorum**.
- `const COLORS = [...]` → köşeli parantez bir **dizi** açar: virgülle ayrılmış dört renk.
- `COLORS[lane]` → listeden sırası `lane` olan renk. Sayma **0'dan** başlar: `COLORS[0]` kırmızı (`'#f43f5e'`),
  `COLORS[3]` mavi.
- `ctx.fillRect(x + 6, HIT_Y - 4, LANE_W - 12, 8)` → 8 piksel kalınlığında bir çubuk. `HIT_Y - 4`'ten başlayıp 8
  piksel indiği için ortası tam `HIT_Y`'de. Yanlardan 6'şar piksel içeride.
- Bu iki satır döngünün **içinde**: her şerit kendi çubuğunu kendi rengiyle çizer.

# --task--

1. Under the `LEFT` line write `HIT_Y` and `COLORS`.
2. Inside the loop, under the lane's `fillRect`, write the two bar lines.

# --task-tr--

1. `const LEFT = ...` satırının altına `HIT_Y` ve `COLORS` satırlarını yaz.
2. Döngünün içinde, şeridi çizen `ctx.fillRect(x + 2, ...)` satırının altına çubuğun iki satırını yaz (döngünün
   kapanan `}`'sinden önce).
3. **Çalıştır**: şeritlerin altına yakın dört renkli çizgi görmelisin.

# --hint--

The two new lines must be inside the loop, before its `}`; outside it `lane` does not exist.

# --hint-tr--

İki yeni satır döngünün **içinde**, `}`'den önce olmalı; dışarıda `lane` diye bir ad yok.

# --tests--

`HIT_Y` should be 480 and `COLORS` the four lane colors.
tr: `HIT_Y` 480, `COLORS` de dört şeridin renkleri olmalı.

```js
assert.strictEqual(HIT_Y, 480)
assert.deepEqual(COLORS, ['#f43f5e', '#f59e0b', '#22c55e', '#3b82f6'])
```

Each lane should have a bar in its own color, 8 pixels tall, centred on `HIT_Y`.
tr: Her şeridin kendi renginde, 8 piksel kalınlığında, ortası `HIT_Y`'de bir çubuğu olmalı.

```js
for (let lane = 0; lane < 4; lane++) {
  assert.deepEqual($.rects(COLORS[lane]), [{ x: 60 + lane * 70 + 6, y: 476, w: 58, h: 8, color: COLORS[lane] }])
}
```

# --solution--

```js
// Rhythm game, step by step.
// The page already has <canvas id="game" width="400" height="560"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const LANES = 4
const LANE_W = 70
const LEFT = (canvas.width - LANES * LANE_W) / 2
const HIT_Y = 480 // where a note should be when you press
const COLORS = ['#f43f5e', '#f59e0b', '#22c55e', '#3b82f6']

ctx.fillStyle = '#0f172a'
ctx.fillRect(0, 0, canvas.width, canvas.height)
for (let lane = 0; lane < LANES; lane++) {
  const x = LEFT + lane * LANE_W
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(x + 2, 0, LANE_W - 4, canvas.height)
  ctx.fillStyle = COLORS[lane]
  ctx.fillRect(x + 6, HIT_Y - 4, LANE_W - 12, 8)
}
```
