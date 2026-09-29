---
title: One hole
title_tr: Bir delik
skills: [game.canvas, prog.functions]
---

# --goal--

Holes and discs are both circles, only in different colors. One small function, `disc(x, y, color)`, will draw them all.
We try it on the top-left hole.

# --goal-tr--

Tahtadaki delikler de diskler de **daire**; sadece renkleri farklı. Boş delik koyu, kırmızı disk kırmızı, sarı disk
sarı. O yüzden tek bir küçük fonksiyon, `disc(x, y, color)` (disk), hepsini çizecek.

Bu sefer fonksiyonun parantez içinde **bilgi** alıyor: nereye (`x`, `y`) ve hangi renkle (`color`). Denemek için sol üst
köşedeki deliği çizeceğiz.

# --code--

```js
function disc(x, y, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, CELL / 2 - 6, 0, Math.PI * 2)
  ctx.fill()
}

  disc(CELL / 2, TOP + CELL / 2, '#0f172a')
```

# --meaning--

- `x`, `y` and `color` are parameters: the values given in the call.
- `beginPath` starts a shape, `arc(x, y, radius, start, end)` adds a circle around `(x, y)`, from angle 0 to a full turn
  (`Math.PI * 2`), and `fill` paints it. The radius is 26, leaving a gap between holes.
- The call draws the hole in the middle of the top-left cell: (32, 128).

# --meaning-tr--

- `function disc(x, y, color)` → parantez içindeki `x`, `y`, `color` **parametre**: fonksiyonu çağırırken verilen
  bilgilerin adları. `disc(32, 128, 'red')` dersen içeride `x` 32, `y` 128, `color` `'red'` olur.
- `ctx.beginPath()` → yeni bir şekle başla.
- `ctx.arc(x, y, CELL / 2 - 6, 0, Math.PI * 2)` → merkezi `(x, y)` olan bir daire. Üçüncü sayı **yarıçap**:
  64 / 2 - 6 = 26 (delikler arasında boşluk kalsın diye hücrenin yarısından biraz küçük). Son iki sayı başlangıç ve
  bitiş açısı: `0`'dan `Math.PI * 2`'ye, yani **tam bir tur** (360 derece). `Math.PI` π sayısı (3.14...).
- `ctx.fill()` → şekli boya.
- Deneme çağrısı: `CELL / 2` = 32 (ilk sütunun ortası), `TOP + CELL / 2` = 128 (ilk satırın ortası).

# --task--

1. Above `function draw() {` write `disc`, followed by an empty line.
2. In `draw`, under the blue rectangle, write the `disc(...)` call.

# --task-tr--

1. `function draw() {` satırının **üstüne** `disc` fonksiyonunu yaz; altında bir boş satır kalsın.
2. `draw` içinde mavi dikdörtgenin altına `disc(...)` satırını yaz.
3. **Çalıştır**: tahtanın sol üst köşesinde koyu yuvarlak bir delik görmelisin.

# --try--

Change `'#0f172a'` in the call to `'white'` to see the hole clearly. Put it back.

# --try-tr--

Çağrıdaki `'#0f172a'`'yı `'white'` yap, deliği net gör. Sonra geri al.

# --tests--

`disc` should draw a filled circle of radius 26.
tr: `disc` 26 yarıçaplı dolu bir daire çizmeli.

```js
disc(100, 50, 'red')
assert.deepEqual($.arcs().pop(), { x: 100, y: 50, r: 26, color: 'red' })
```

The top-left hole should be drawn.
tr: Sol üstteki delik çizilmeli.

```js
draw()
assert.deepEqual($.arcs(), [{ x: 32, y: 128, r: 26, color: '#0f172a' }])
```

# --solution--

```js
// Connect four, step by step.
// The page already has <canvas id="game" width="448" height="520"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const COLS = 7
const ROWS = 6
const CELL = 64
const TOP = 96 // room above the board for the messages and the next disc

function disc(x, y, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, CELL / 2 - 6, 0, Math.PI * 2)
  ctx.fill()
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#1d4ed8'
  ctx.fillRect(0, TOP, COLS * CELL, ROWS * CELL)
  disc(CELL / 2, TOP + CELL / 2, '#0f172a')
}

draw()
```
