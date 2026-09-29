---
title: Draw a line
title_tr: Çizgi çiz
skills: [game.canvas, prog.functions]
---

# --goal--

The gallows and the figure are made of straight lines. A small `line(x1, y1, x2, y2)` helper draws one; the first
use is the ground of the gallows.

# --goal-tr--

Darağacı da çöp adam da **düz çizgilerden** oluşuyor. Canvas'ta çizgi çizmek dört satır sürüyor; her çizgi için
bunları tekrar yazmamak için küçük bir **yardımcı fonksiyon** yazacağız: `line` (çizgi).

Sonra onu ilk kez kullanıp darağacının **tabanını** çizeceğiz: kahverengi, kalın, yatay bir çizgi.

# --code--

```js
function line(x1, y1, x2, y2) {
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
}

function draw() {
  ctx.fillStyle = '#fefce8'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // The gallows
  ctx.strokeStyle = '#78350f'
  ctx.lineWidth = 6
  line(40, 270, 220, 270)
```

# --meaning--

- A line on a canvas is a **path**: `beginPath()` starts one, `moveTo` puts the pen down at the start, `lineTo`
  draws to the end, and `stroke()` paints it.
- `x1, y1, x2, y2` are four parameters: the start and end points.
- `strokeStyle` is the line color (like `fillStyle` for fills), `lineWidth` its thickness in pixels.
- `line(40, 270, 220, 270)` draws the ground: from (40, 270) to (220, 270).

# --meaning-tr--

- Canvas'ta çizgi bir **yoldur** (path):
  - `ctx.beginPath()` → yeni bir yol başlat (öncekiyle karışmasın).
  - `ctx.moveTo(x1, y1)` → kalemi kaldırıp **başlangıç** noktasına götür.
  - `ctx.lineTo(x2, y2)` → oradan **bitiş** noktasına kadar çiz.
  - `ctx.stroke()` → çizgiyi **boya**. Bu satır olmadan hiçbir şey görünmez.
- `function line(x1, y1, x2, y2)` → dört **parametre**: başlangıç (`x1, y1`) ve bitiş (`x2, y2`).
- `ctx.strokeStyle = '#78350f'` → **çizgi** rengi (dolgu için `fillStyle`, çizgi için `strokeStyle`). Koyu kahverengi.
- `ctx.lineWidth = 6` → çizgi kalınlığı: 6 piksel.
- `line(40, 270, 220, 270)` → (40, 270)'ten (220, 270)'e: y ikisinde de 270, yani **yatay** bir taban.

# --task--

1. Above `function draw() {`, write the `line` function and leave an empty line.
2. In `draw`, under the `fillRect` line, leave an empty line and write the four gallows lines. Press **Run**.

# --task-tr--

1. `function draw() {` satırının **üstüne** `line` fonksiyonunu yaz; arada bir boş satır kalsın.
2. `draw` içinde `ctx.fillRect(...)` satırının altına bir boş satır bırakıp yorum satırıyla birlikte dört satırı yaz.
3. **Çalıştır**: kelimenin üstünde kahverengi, yatay bir çizgi görmelisin.

# --predict--

What if you forget `ctx.stroke()` in `line`?
- [ ] The line is drawn thinner
- [x] Nothing shows
  The path is planned but never painted.
- [ ] An error stops the game

# --predict-tr--

`line` içinde `ctx.stroke()` satırını unutursan ne olur?
- [ ] Çizgi daha ince çizilir
- [x] Hiçbir şey görünmez
  Yol planlanır ama hiç boyanmaz.
- [ ] Bir hata oyunu durdurur

# --tests--

`line(x1, y1, x2, y2)` should draw one straight line from the first point to the second.
tr: `line(x1, y1, x2, y2)` ilk noktadan ikinciye düz bir çizgi çizmeli.

```js
const start = $.screen().length
line(10, 20, 30, 40)
const calls = $.screen().slice(start)
assert.deepEqual(calls.map((c) => c.op), ['beginPath', 'moveTo', 'lineTo', 'stroke'])
assert.deepEqual(calls[1].args, [10, 20])
assert.deepEqual(calls[2].args, [30, 40])
```

The ground of the gallows should be drawn in brown.
tr: Darağacının tabanı kahverengiyle çizilmeli.

```js
$.tick(1)
const ends = $.screen().filter((c) => c.op === 'lineTo').map((c) => c.args.join())
assert.include(ends, '220,270')
const strokes = $.screen().filter((c) => c.op === 'stroke')
assert.strictEqual(strokes[0].stroke, '#78350f')
```

# --solution--

```js
// Hangman, step by step.
// The page already has <canvas id="game" width="480" height="480"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const WORDS = [
  'APPLE', 'BANANA', 'CASTLE', 'DRAGON', 'ELEPHANT', 'FOREST', 'GARDEN', 'HAMMER', 'ISLAND', 'JACKET',
  'KITCHEN', 'LEMON', 'MONKEY', 'NOTEBOOK', 'ORANGE', 'PENGUIN', 'QUEEN', 'ROCKET', 'SPIDER', 'TIGER',
  'UMBRELLA', 'VIOLIN', 'WINDOW', 'YELLOW', 'ZEBRA', 'BRIDGE', 'CANDLE', 'DOLPHIN', 'ENGINE', 'FLOWER',
  'GUITAR', 'HONEY', 'IGLOO', 'JUNGLE', 'KANGAROO', 'LADDER', 'MARKET', 'NEEDLE', 'OCEAN', 'PIRATE',
  'RABBIT', 'SILVER', 'TURTLE', 'VALLEY', 'WIZARD', 'PLANET', 'COOKIE', 'PUZZLE', 'KEYBOARD', 'CAMERA',
]
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const MAX_WRONG = 6

let word
let guessed // a Set of the letters tried so far
let wrong

// The word with the letters not guessed yet hidden: 'C _ S T _ E'.
const masked = () => [...word].map((letter) => (guessed.has(letter) ? letter : '_')).join(' ')

function newWord() {
  word = WORDS[Math.floor(Math.random() * WORDS.length)]
  guessed = new Set()
  wrong = 0
}

function guess(letter) {
  if (guessed.has(letter) || wrong === MAX_WRONG) return
  guessed.add(letter)
  if (!word.includes(letter)) wrong += 1
}

document.addEventListener('keydown', (event) => {
  const letter = event.key.toUpperCase()
  if (letter.length === 1 && LETTERS.includes(letter)) guess(letter)
})

function line(x1, y1, x2, y2) {
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
}

function draw() {
  ctx.fillStyle = '#fefce8'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // The gallows
  ctx.strokeStyle = '#78350f'
  ctx.lineWidth = 6
  line(40, 270, 220, 270)

  ctx.fillStyle = '#1f2937'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Misses ' + wrong + ' / ' + MAX_WRONG, 260, 100)
  ctx.fillStyle = '#b91c1c'
  ctx.fillText([...guessed].filter((l) => !word.includes(l)).join(' '), 260, 130)

  ctx.textAlign = 'center'
  ctx.font = 'bold 32px monospace'
  ctx.fillStyle = '#1f2937'
  ctx.fillText(masked(), canvas.width / 2, 340)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

newWord()
requestAnimationFrame(loop)
```
