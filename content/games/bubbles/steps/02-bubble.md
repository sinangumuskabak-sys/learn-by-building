---
title: One bubble
title_tr: Bir balon
skills: [game.canvas, prog.functions]
---

# --goal--

A bubble is a colored circle. Colors are kept as a number, an index into `COLORS`, which makes comparing them easy later.
`drawBubble` draws one; we try it with a test bubble in the middle.

# --goal-tr--

Bir balon, renkli bir **daire**. Balonun rengini bir **sayı** olarak tutacağız: `COLORS` dizisindeki sırası (0–4).
İleride "bu iki balon aynı renk mi?" diye çok soracağız; iki sayıyı karşılaştırmak en kolayı.

`drawBubble` (balon çiz) tek bir balonu çizecek. Denemek için ortaya geçici bir test balonu koyuyoruz.

# --code--

```js
const R = 20 // bubble radius
const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7']

function drawBubble(x, y, color, r = R) {
  ctx.fillStyle = COLORS[color]
  ctx.beginPath()
  ctx.arc(x, y, r - 1, 0, Math.PI * 2)
  ctx.fill()
}

  drawBubble(200, 260, 3)
```

# --meaning--

- `r = R` is a default value: when `drawBubble` is called with three arguments, `r` is `R`.
- `COLORS[color]` turns the color number into a real color.
- `arc(x, y, radius, 0, Math.PI * 2)` is a full circle; `r - 1` leaves a thin gap between touching bubbles.

# --meaning-tr--

- `const R = 20` → balonun yarıçapı. `COLORS` → beş renk; balonda yalnız sırası (0–4) durur.
- `function drawBubble(x, y, color, r = R)` → `r = R` bir **varsayılan değer**: fonksiyon üç şeyle çağrılırsa `r`
  kendiliğinden `R` olur. Küçük balon çizmek istersek dördüncüyü veririz.
- `ctx.fillStyle = COLORS[color]` → renk numarasını gerçek renge çevir: 3 → mavi.
- `ctx.beginPath()` → yeni bir şekil. `ctx.arc(x, y, r - 1, 0, Math.PI * 2)` → merkezi `(x, y)` olan bir **yay**; açı
  0'dan `Math.PI * 2`'ye, yani tam tur: **daire**. `r - 1` → komşu balonlar arasında ince bir boşluk kalsın.
- `ctx.fill()` → içini boya.
- `drawBubble(200, 260, 3)` → `draw` içinde geçici test balonu.

# --task--

1. Under `const ctx = ...`, leave an empty line and write `R` and `COLORS`.
2. Above `function draw() {` write `drawBubble`, with an empty line after it.
3. In `draw`, under the background, leave an empty line and write the test call. Press **Run**.

# --task-tr--

1. `const ctx = ...` satırının altına bir boş satır bırak; `R` ve `COLORS` satırlarını yaz.
2. `function draw() {` satırının **üstüne** `drawBubble` fonksiyonunu yaz; altında bir boş satır kalsın.
3. `draw` içinde arka planın altına bir boş satır bırak ve test satırını yaz.
4. **Çalıştır**: ortada mavi bir balon görmelisin.

# --try--

Change the `3` in the test call to `0`, `1`, `2` and `4` to see all five colors. Put 3 back.

# --try-tr--

Test satırındaki `3`'ü `0`, `1`, `2` ve `4` yaparak beş rengi de gör. Sonra 3'e geri al.

# --tests--

A blue bubble should be drawn at (200, 260).
tr: (200, 260) noktasına mavi bir balon çizilmeli.

```js
$.tick(1)
assert.deepInclude($.arcs(), { x: 200, y: 260, r: 19, color: '#3b82f6' })
```

`drawBubble` should take an optional radius.
tr: `drawBubble` isteğe bağlı bir yarıçap almalı.

```js
drawBubble(50, 60, 0, 12)
assert.deepInclude($.arcs(), { x: 50, y: 60, r: 11, color: '#ef4444' })
```

# --solution--

```js
// Bubble shooter, step by step.
// The page already has <canvas id="game" width="400" height="520"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const R = 20 // bubble radius
const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7']

function drawBubble(x, y, color, r = R) {
  ctx.fillStyle = COLORS[color]
  ctx.beginPath()
  ctx.arc(x, y, r - 1, 0, Math.PI * 2)
  ctx.fill()
}

function draw() {
  ctx.fillStyle = '#1e1b4b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  drawBubble(200, 260, 3)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
