---
title: A place for the board
title_tr: Tahtanın yeri
skills: [game.canvas]
---

# --goal--

The game is an 8 × 8 grid of gems, each cell 48 pixels. We work out where the grid goes on the 400 × 480 canvas,
centred left to right with room above for the score, and paint the background.

# --goal-tr--

Oyun, 8 × 8'lik bir **mücevher** ızgarası: yan yana iki mücevherin yerini değiştirip aynı renkten üçünü sıraya
dizersin, onlar yok olur.

İlk adımda ızgaranın **nereye** geleceğini hesaplıyoruz. Canvas (tuval) 400 piksel eninde, 480 piksel boyunda. Her
hücre 48 piksel; 8 hücre 384 piksel eder. Izgarayı soldan sağa **ortalayacağız**, üstte de skor için boşluk
bırakacağız. Sonra bütün sayfayı koyu mora boyuyoruz.

# --code--

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const N = 8 // 8 by 8 gems
const SIZE = 48
const LEFT = (canvas.width - N * SIZE) / 2
const TOP = 72 // room for the score and the moves left

ctx.fillStyle = '#1e1b4b'
ctx.fillRect(0, 0, canvas.width, canvas.height)
```

# --meaning--

- `canvas` is the page's canvas and `ctx` its 2D drawing context.
- `N` is the number of rows and columns, `SIZE` the cell size.
- `LEFT` is the empty space left of the grid: (400 − 384) / 2 = 8, so the grid is centred. `TOP` leaves 72 pixels for
  the score line.
- `fillStyle` + `fillRect(0, 0, width, height)` paint the whole canvas.

# --meaning-tr--

- `document.getElementById('game')` → sayfadaki canvas'ı bulur; `canvas.getContext('2d')` onun **2D çizim
  kalemini** verir. Adı `ctx`.
- `const N = 8` → satır ve sütun sayısı. `const SIZE = 48` → bir hücrenin eni ve boyu.
- `const LEFT = (canvas.width - N * SIZE) / 2` → ızgaranın solunda kalacak boşluk: (400 − 8 × 48) / 2 = (400 − 384) / 2
  = **8**. Sağda da 8 kalır: ızgara ortada. Hesabı koda yazmak, canvas'ın enini değiştirsen bile ızgarayı ortada
  tutar.
- `const TOP = 72` → ızgara yukarıdan 72 piksel aşağıda başlar; üstteki şerit skor için.
- `ctx.fillStyle = '#1e1b4b'` → dolgu rengi. `ctx.fillRect(0, 0, canvas.width, canvas.height)` → sol üst köşeden
  (`(0, 0)`) başlayıp bütün canvas'ı kaplayan dikdörtgen. Canvas'ta `x` sağa, `y` **aşağı** doğru büyür.

# --task--

Write the lines under the three comment lines, then press **Run**.

# --task-tr--

1. Editördeki üç yorum satırının **altına** kodu yaz; boş satırları da koddaki gibi bırak.
2. **Çalıştır**: bütün alan koyu mor olmalı.

# --tests--

The grid should be 8 × 8 cells of 48 pixels, centred, 72 pixels from the top.
tr: Izgara 48 piksellik 8 × 8 hücre olmalı; ortada ve yukarıdan 72 piksel aşağıda.

```js
assert.deepEqual([N, SIZE, LEFT, TOP], [8, 48, 8, 72])
```

The whole canvas should be painted `#1e1b4b`.
tr: Bütün canvas `#1e1b4b` ile boyanmalı.

```js
assert.deepEqual($.rects('#1e1b4b'), [{ x: 0, y: 0, w: 400, h: 480, color: '#1e1b4b' }])
```

# --seed--

```js
// Match three, step by step.
// The page already has <canvas id="game" width="400" height="480"></canvas>.
// Write your code below.
```

# --solution--

```js
// Match three, step by step.
// The page already has <canvas id="game" width="400" height="480"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const N = 8 // 8 by 8 gems
const SIZE = 48
const LEFT = (canvas.width - N * SIZE) / 2
const TOP = 72 // room for the score and the moves left

ctx.fillStyle = '#1e1b4b'
ctx.fillRect(0, 0, canvas.width, canvas.height)
```
