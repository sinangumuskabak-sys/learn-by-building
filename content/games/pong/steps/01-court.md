---
title: Draw the court
title_tr: Sahayı çiz
skills: [game.canvas, prog.loops]
---

# --explanation--

Pong's court is a black rectangle with a dashed line down the middle. The dashed line is a good first use of a **loop**
in drawing: instead of writing 14 `fillRect` calls by hand, let a `for` loop place a short dash every 30 pixels.

```js
for (let y = 0; y < canvas.height; y += 30) {
  ctx.fillRect(canvas.width / 2 - 2, y, 4, 15)   // 4 wide, 15 tall, centered on the middle
}
```

Read it as: start at `y = 0`; while `y` is still on the canvas, draw a dash; then move `y` down by 30. A 15 pixel
dash plus a 15 pixel gap repeats all the way down.

Why `canvas.width / 2 - 2`? A rectangle is drawn from its **top-left corner**. To center a 4 pixel wide dash on the
middle line, start it half its width (2 px) to the left.

# --explanation-tr--

Pong sahası, ortasından kesikli bir çizgi geçen siyah bir dikdörtgendir. Kesikli çizgi, çizimde **döngü**
kullanmanın iyi bir ilk örneği: 14 `fillRect` çağrısını elle yazmak yerine, bir `for` döngüsünün her 30 pikselde kısa
bir çizgi koymasına izin ver.

```js
for (let y = 0; y < canvas.height; y += 30) {
  ctx.fillRect(canvas.width / 2 - 2, y, 4, 15)   // 4 geniş, 15 uzun, ortaya hizalı
}
```

Şöyle oku: `y = 0`'dan başla; `y` hâlâ canvas üzerindeyken bir çizgi çiz; sonra `y`'yi 30 aşağı kaydır. 15 piksellik
çizgi ve 15 piksellik boşluk en alta kadar tekrarlanır.

Neden `canvas.width / 2 - 2`? Dikdörtgen **sol üst köşesinden** çizilir. 4 piksel genişliğindeki bir çizgiyi orta
çizgiye hizalamak için onu genişliğinin yarısı (2 px) kadar soldan başlat.

# --task--

1. Store the canvas in `canvas` and its 2D context in `ctx`.
2. Fill the whole canvas with `'black'`.
3. In `'white'`, draw the center line: a dash `4` wide and `15` tall at `x = canvas.width / 2 - 2`, every `30` pixels
   from `y = 0` to the bottom.

# --task-tr--

1. Canvas'ı `canvas`'ta, 2D bağlamını `ctx`'te tut.
2. Canvas'ın tamamını `'black'` ile doldur.
3. `'white'` ile orta çizgiyi çiz: `x = canvas.width / 2 - 2` noktasında, `y = 0`'dan en alta kadar her `30`
   pikselde bir, `4` geniş ve `15` uzun bir çizgi.

# --tests--

The whole 600×400 court should be black.
tr: 600×400 sahanın tamamı siyah olmalı.

```js
assert.strictEqual(canvas, $.canvas)
assert.isTrue($.rects('black').some((r) => r.x === 0 && r.y === 0 && r.w === 600 && r.h === 400))
```

The center line should be 14 white dashes, one every 30 pixels.
tr: Orta çizgi, her 30 pikselde bir olmak üzere 14 beyaz çizgiden oluşmalı.

```js
const dashes = $.rects('white')
assert.lengthOf(dashes, 14)
dashes.forEach((dash, i) => assert.deepEqual(dash, { x: 298, y: i * 30, w: 4, h: 15, color: 'white' }))
```

# --seed--

```js
// Pong, step by step.
// The page already has <canvas id="game" width="600" height="400"></canvas>.
// Write your code below.
```

# --solution--

```js
// Pong, step by step.
// The page already has <canvas id="game" width="600" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

ctx.fillStyle = 'black'
ctx.fillRect(0, 0, canvas.width, canvas.height)

ctx.fillStyle = 'white'
for (let y = 0; y < canvas.height; y += 30) {
  ctx.fillRect(canvas.width / 2 - 2, y, 4, 15)
}
```
