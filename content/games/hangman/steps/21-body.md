---
title: Body, arms and legs
title_tr: Gövde, kollar ve bacaklar
skills: [game.canvas]
---

# --goal--

Five more parts, one per miss: the body, two arms and two legs. Each is one line, drawn only when there are enough
misses.

# --goal-tr--

Beş parça daha, her ıskaya bir tane: **gövde**, iki **kol**, iki **bacak**. Hepsi birer düz çizgi; `line`
yardımcımız burada işe yarıyor.

Her parça yeterince ıska varsa çizilir: gövde ikinci ıskada, sol kol üçüncüde...

# --code--

```js
function draw() {
  // ...
  if (wrong > 1) line(170, 130, 170, 200) // body
  if (wrong > 2) line(170, 150, 140, 180) // left arm
  if (wrong > 3) line(170, 150, 200, 180) // right arm
  if (wrong > 4) line(170, 200, 145, 245) // left leg
  if (wrong > 5) line(170, 200, 195, 245) // right leg
```

# --meaning--

- The body goes down from under the head (y 130) to y 200.
- Both arms start on the body at y 150 and go down-left and down-right.
- Both legs start at the bottom of the body and go down-left and down-right.

# --meaning-tr--

- `line(170, 130, 170, 200)` → **gövde**: başın altından (130) aşağı, 200'e.
- Kollar gövdenin üst kısmından (170, 150) başlar: biri sola aşağı (140, 180), biri sağa aşağı (200, 180).
- Bacaklar gövdenin ucundan (170, 200) başlar: sola aşağı (145, 245) ve sağa aşağı (195, 245).
- `wrong > 1`, `> 2`... → her parça bir sonraki ıskada gelir. Altıncı ıskada adam tamamlanır.

# --task--

In `draw`, under the `if (wrong > 0) { ... }` block (after its `}`), write the five lines. Press **Run** and make
some misses.

# --task-tr--

`draw` içinde, başı çizen `if (wrong > 0) { ... }` bloğunun kapanan `}`'sinin altına beş satırı yaz. **Çalıştır**,
oyuna tıkla ve yanlış harfler dene: her ıskada bir parça eklenmeli.

# --tests--

Each miss should add exactly one part.
tr: Her ıska tam olarak bir parça eklemeli.

```js
const strokes = () => $.screen().filter((c) => c.op === 'stroke').length
for (let w = 0; w <= 6; w++) {
  wrong = w
  $.tick(1)
  assert.strictEqual(strokes(), 4 + w, 'one part per miss')
}
```

The parts should come in order: five misses draw the left leg but not the right one.
tr: Parçalar sırayla gelmeli: beş ıska sol bacağı çizer ama sağı çizmez.

```js
word = 'ZEBRA'
for (const key of 'qwtyu') $.press(key)
$.tick(1)
const ends = $.screen().filter((c) => c.op === 'lineTo').map((c) => c.args.join())
assert.include(ends, '145,245', 'five misses: the left leg')
assert.notInclude(ends, '195,245', 'but not the right leg yet')
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
  line(80, 270, 80, 50)
  line(80, 50, 170, 50)
  line(170, 50, 170, 90)
  ctx.strokeStyle = '#1f2937'
  ctx.lineWidth = 4
  if (wrong > 0) {
    ctx.beginPath()
    ctx.arc(170, 110, 20, 0, Math.PI * 2) // head
    ctx.stroke()
  }
  if (wrong > 1) line(170, 130, 170, 200) // body
  if (wrong > 2) line(170, 150, 140, 180) // left arm
  if (wrong > 3) line(170, 150, 200, 180) // right arm
  if (wrong > 4) line(170, 200, 145, 245) // left leg
  if (wrong > 5) line(170, 200, 195, 245) // right leg

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
