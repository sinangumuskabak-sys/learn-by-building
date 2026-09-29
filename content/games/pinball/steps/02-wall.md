---
title: Draw one wall
title_tr: Bir duvar çiz
skills: [game.canvas]
---

# --goal--

The walls of the table are straight lines. We draw the first one: the left wall, from `(20, 470)` up to `(20, 120)`.

# --goal-tr--

Masanın duvarları **düz çizgilerden** oluşuyor. Şimdi ilk duvarı çiziyoruz: sol duvar. Aşağıda `(20, 470)`
noktasından başlayıp yukarıda `(20, 120)` noktasına kadar giden gri bir çizgi.

Çizgi çizmek, kâğıda kalemle çizmek gibidir: kalemi bir noktaya **koy**, başka bir noktaya kadar **çiz**, sonra
**boya**.

# --code--

```js
ctx.strokeStyle = '#a8a29e'
ctx.lineWidth = 4
ctx.lineCap = 'round'
ctx.beginPath()
ctx.moveTo(20, 470)
ctx.lineTo(20, 120)
ctx.stroke()
```

# --meaning--

- `strokeStyle` is the line color, `lineWidth` its thickness, `lineCap = 'round'` rounds its ends.
- `beginPath()` starts a new shape, `moveTo` puts the pen down, `lineTo` draws to a point, `stroke()` paints the line.

# --meaning-tr--

- `ctx.strokeStyle = '#a8a29e'` → **çizgi rengi** (açık gri). `fillStyle` içi doldurmak, `strokeStyle` çizgi
  çekmek içindir.
- `ctx.lineWidth = 4` → çizginin kalınlığı: 4 piksel.
- `ctx.lineCap = 'round'` → çizginin uçları yuvarlak olsun. Birazdan birçok çizgi uç uca eklenecek; yuvarlak uçlar
  köşelerin birleşik görünmesini sağlar.
- `ctx.beginPath()` → "yeni bir şekle başlıyorum".
- `ctx.moveTo(20, 470)` → kalemi `(20, 470)` noktasına **koyar** (henüz çizmez).
- `ctx.lineTo(20, 120)` → oradan `(20, 120)`'ye kadar bir çizgi **planlar**. `x` aynı, `y` küçülüyor: çizgi yukarı
  gidiyor.
- `ctx.stroke()` → planlanan çizgiyi seçilen renk ve kalınlıkla **boyar**. Bu satır olmadan hiçbir şey görünmez.

# --task--

Write the seven lines at the very end, under the `fillRect` line, then press **Run**.

# --task-tr--

1. Yedi satırı dosyanın **en sonuna**, `ctx.fillRect(...)` satırının altına yaz.
2. **Çalıştır**: masanın solunda dikey, gri bir çizgi görmelisin.

# --predict--

What happens if you forget the last line, `ctx.stroke()`?
- [ ] The line is drawn anyway
- [x] Nothing is drawn
  `moveTo` and `lineTo` only plan the line; `stroke()` paints it.
- [ ] The whole canvas turns grey

# --predict-tr--

Son satırı, `ctx.stroke()`'u unutursan ne olur?
- [ ] Çizgi yine de çizilir
- [x] Hiçbir şey çizilmez
  `moveTo` ve `lineTo` çizgiyi yalnız planlar; boyayan `stroke()`'tur.
- [ ] Bütün canvas gri olur

# --try--

Set `lineWidth` to `12` and run: a thick wall. Put `4` back.

# --try-tr--

`lineWidth`'i `12` yap ve çalıştır: kalın bir duvar. Sonra `4`'e geri al.

# --tests--

The left wall should be drawn from (20, 470) to (20, 120) and stroked.
tr: Sol duvar (20, 470)'ten (20, 120)'ye çizilip boyanmalı.

```js
const ops = $.screen().map((c) => c.op + ' ' + c.args.join())
assert.include(ops, 'moveTo 20,470')
assert.include(ops, 'lineTo 20,120')
assert.lengthOf($.screen().filter((c) => c.op === 'stroke' && c.stroke === '#a8a29e'), 1, 'one grey line, painted with stroke()')
```

The line should be 4 pixels wide with round ends.
tr: Çizgi 4 piksel kalınlığında ve uçları yuvarlak olmalı.

```js
assert.strictEqual($.ctx.lineWidth, 4)
assert.strictEqual($.ctx.lineCap, 'round')
```

# --solution--

```js
// Pinball, step by step.
// The page already has <canvas id="game" width="400" height="600"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

ctx.fillStyle = '#0c0a09'
ctx.fillRect(0, 0, canvas.width, canvas.height)
ctx.strokeStyle = '#a8a29e'
ctx.lineWidth = 4
ctx.lineCap = 'round'
ctx.beginPath()
ctx.moveTo(20, 470)
ctx.lineTo(20, 120)
ctx.stroke()
```
