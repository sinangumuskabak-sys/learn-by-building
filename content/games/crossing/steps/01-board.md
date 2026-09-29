---
title: Road and river
title_tr: Yol ve nehir
skills: [game.canvas]
---

# --goal--

We are building a Frogger-style game: a frog crosses a busy road, then a river on floating logs, to reach its homes. The
board is 13 rows of 40 pixels: the far bank, five river rows, a safe strip, five road rows and the start.

# --goal-tr--

**Frogger tarzı** bir oyun yapıyoruz: bir kurbağa önce trafiği olan bir **yolu**, sonra yüzen kütükler üzerinden bir
**nehri** geçip evlerine ulaşıyor. Sonunda nasıl olacağını **Bitmiş hâlini gör** ile görebilirsin.

Tahta 40 piksellik **13 satır**: en üstte karşı kıyı (evler), 5 satır nehir, güvenli bir şerit, 5 satır yol ve başlangıç.
Her satırın rengini satır numarasından seçen bir fonksiyon yazıyoruz.

# --code--

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TILE = 40
const COLS = 12
const TOP = 40 // room for the score and the lives
const START_ROW = 12
// Rows from the top: 0 the far bank with the homes, 1-5 the river, 6 a safe strip, 7-11 the road, 12 the start.

function rowColor(row) {
  if (row === 0) return '#166534'
  if (row <= 5) return '#1e3a8a'
  if (row === 6 || row === START_ROW) return '#4d7c0f'
  return '#1f2937'
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let row = 0; row <= START_ROW; row++) {
    ctx.fillStyle = rowColor(row)
    ctx.fillRect(0, TOP + row * TILE, canvas.width, TILE)
  }
}

draw()
```

# --meaning--

- `TILE` is a square's size; the board is 12 squares wide and 13 rows tall, under a 40-pixel bar.
- `rowColor` answers with the color of a row: the first `return` that matches ends the function.
- The loop paints each row as a full-width strip.

# --meaning-tr--

- `TILE = 40` → bir karenin kenarı; tahta 12 kare genişliğinde (`COLS`), satır 0'dan `START_ROW`'a (12) kadar 13 satır.
- `TOP = 40` → üstte skor ve can için boşluk.
- `function rowColor(row)` → satırın rengini döndürür. İlk tutan `return` fonksiyonu bitirir, gerisine bakılmaz:
  - 0 → koyu yeşil (karşı kıyı), 1–5 → mavi (nehir), 6 ve 12 → çimen yeşili (güvenli), geri kalanı (7–11) → asfalt.
- `for (let row = 0; row <= START_ROW; row++)` → her satırı boydan boya bir şerit olarak boya.

# --task--

Write the lines under the comments, then press **Run**.

# --task-tr--

Satırları yorum satırlarının altına yaz ve **Çalıştır**'a bas: renkli şeritler görmelisin.

# --tests--

13 rows should be drawn with the right colors.
tr: 13 satır doğru renklerle çizilmeli.

```js
assert.strictEqual(rowColor(0), '#166534')
assert.strictEqual(rowColor(3), '#1e3a8a')
assert.strictEqual(rowColor(6), '#4d7c0f')
assert.strictEqual(rowColor(9), '#1f2937')
assert.strictEqual(rowColor(12), '#4d7c0f')
assert.lengthOf($.rects('#1e3a8a'), 5)
assert.deepEqual($.rects('#1f2937')[0], { x: 0, y: 40 + 7 * 40, w: 480, h: 40, color: '#1f2937' })
```

# --seed--

```js
// Road and river crossing, step by step.
// The page already has <canvas id="game" width="480" height="560"></canvas>.
// Write your code below.
```

# --solution--

```js
// Road and river crossing, step by step.
// The page already has <canvas id="game" width="480" height="560"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TILE = 40
const COLS = 12
const TOP = 40 // room for the score and the lives
const START_ROW = 12
// Rows from the top: 0 the far bank with the homes, 1-5 the river, 6 a safe strip, 7-11 the road, 12 the start.

function rowColor(row) {
  if (row === 0) return '#166534'
  if (row <= 5) return '#1e3a8a'
  if (row === 6 || row === START_ROW) return '#4d7c0f'
  return '#1f2937'
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let row = 0; row <= START_ROW; row++) {
    ctx.fillStyle = rowColor(row)
    ctx.fillRect(0, TOP + row * TILE, canvas.width, TILE)
  }
}

draw()
```
