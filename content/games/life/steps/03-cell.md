---
title: One living cell
title_tr: Tek bir canlı hücre
skills: [game.canvas]
---

# --goal--

A live cell is a small green square. We draw one at column 3, row 2, one pixel smaller than the cell so a thin gap
separates neighbours.

# --goal-tr--

Canlı bir hücre, ızgarada **küçük yeşil bir kare**. Bu adımda tek bir tane çizeceğiz: **3. sütun, 2. satır**.
(Sayma 0'dan başlar: en soldaki sütun 0. sütundur.)

Kareyi hücreden 1 piksel küçük çizeceğiz. Böylece yan yana iki canlı hücrenin arasında ince bir çizgi kalır ve ızgara
okunur olur; kareli defterin çizgileri gibi.

# --code--

```js
ctx.fillStyle = '#4ade80'
ctx.fillRect(3 * CELL, TOP + 2 * CELL, CELL - 1, CELL - 1)
```

# --meaning--

- `3 * CELL` is 24: column 3 starts 24 pixels from the left.
- `TOP + 2 * CELL` is 52: row 2 starts 2 cells below the top of the grid, which itself starts at `TOP`.
- `CELL - 1` (7) is the size of the square, leaving a 1-pixel gap.

# --meaning-tr--

- `ctx.fillStyle = '#4ade80'` → açık yeşil.
- `3 * CELL` → 3 × 8 = **24**: 3. sütun soldan 24. pikselden başlar.
- `TOP + 2 * CELL` → 36 + 2 × 8 = **52**. Izgara zaten `TOP`'tan başlıyor; 2. satır ondan iki hücre aşağıda.
  (Çarpma toplamadan önce yapılır, matematikteki gibi.)
- `CELL - 1, CELL - 1` → karenin eni ve boyu: 8 − 1 = **7** piksel. Kalan 1 piksel, komşu kareyle arasındaki boşluk.

# --task--

At the very end, leave an empty line and write the two green lines. Press **Run**.

# --task-tr--

Dosyanın **en sonuna**, bir boş satırdan sonra iki yeşil satırı yaz. **Çalıştır**: ızgaranın sol üst köşesine yakın
minik yeşil bir kare görmelisin.

# --predict--

How big will the green square be on screen?
- [x] Tiny: 7 pixels, like a dot
  A cell is only 8 pixels; the whole grid has 60 × 48 of them.
- [ ] As big as the grid area
- [ ] It will not show, it is under the grid area

# --predict-tr--

Yeşil kare ekranda ne kadar büyük olacak?
- [x] Minicik: 7 piksel, bir nokta gibi
  Bir hücre yalnız 8 piksel; ızgaraya bunlardan 60 × 48 tane sığıyor.
- [ ] Izgara alanı kadar büyük
- [ ] Görünmez, ızgara alanının altında kalır

# --try--

Change `3 * CELL` to `59 * CELL`: the square jumps to the last column on the right. Put `3` back.

# --try-tr--

`3 * CELL` yerine `59 * CELL` yaz: kare en sağdaki sütuna zıplar. Sonra `3`'e geri al.

# --tests--

A single 7×7 `#4ade80` square should be drawn at (24, 52).
tr: (24, 52) noktasına tek bir 7×7 `#4ade80` kare çizilmeli.

```js
assert.deepEqual($.rects('#4ade80'), [{ x: 24, y: 52, w: 7, h: 7, color: '#4ade80' }])
```

# --solution--

```js
// Game of Life, step by step.
// The page already has <canvas id="game" width="480" height="480"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const CELL = 8
const COLS = 60
const ROWS = 48
const TOP = 36

ctx.fillStyle = '#0f172a'
ctx.fillRect(0, 0, canvas.width, canvas.height)
ctx.fillStyle = '#1e293b'
ctx.fillRect(0, TOP, COLS * CELL, ROWS * CELL)

ctx.fillStyle = '#4ade80'
ctx.fillRect(3 * CELL, TOP + 2 * CELL, CELL - 1, CELL - 1)
```
