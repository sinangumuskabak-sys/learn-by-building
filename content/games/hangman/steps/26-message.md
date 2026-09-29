---
title: The end message
title_tr: Bitiş mesajı
skills: [game.state]
---

# --goal--

When the game is over, a message says so: green for a win, red for a loss, just above the word.

# --goal-tr--

Oyun bitince oyuncuya bunu **söylemeliyiz**. Kelimenin hemen üstüne bir mesaj yazacağız: kazandıysan yeşil
`You got it! Click for the next word` (bildin, sonraki kelime için tıkla), kaybettiysen kırmızı
`Hanged! Click to try another` (asıldın, başkasını dene).

# --code--

```js
function draw() {
  // ...
  if (state !== 'playing') {
    ctx.font = 'bold 20px sans-serif'
    ctx.fillStyle = state === 'won' ? '#15803d' : '#b91c1c'
    ctx.fillText(state === 'won' ? 'You got it! Click for the next word' : 'Hanged! Click to try another', canvas.width / 2, 298)
  }
```

# --meaning--

- The block runs only when the game is over.
- `state === 'won' ? a : b` picks the color and the text: green and "You got it!" for a win, red and "Hanged!" for a loss.

# --meaning-tr--

- `if (state !== 'playing')` → oyun **bittiyse** (kazanıldı ya da kaybedildi).
- `ctx.font = 'bold 20px sans-serif'` → orta boy yazı.
- `state === 'won' ? '#15803d' : '#b91c1c'` → kısa `if` yine: kazandıysan **yeşil**, değilse **kırmızı**.
- Aynı soru mesajı da seçer. Satır uzun ama tek bir `fillText`: yazı, x (orta), y (298).
- Mesajlar "tıkla" diyor; tıklamayı bir sonraki adımda yazacağız.

# --task--

In `draw`, under the `if ... else` block you wrote in the last step, write this block. Press **Run** and finish a word.

# --task-tr--

`draw` içinde, bir önceki adımda yazdığın `if ... else` bloğunun kapanan `}`'sinin altına bu bloğu yaz. **Çalıştır**
ve bir kelimeyi bitir (bul ya da kaybet): mesaj görünmeli.

# --try--

Write your own messages (in the quotes) and win once to see them. Put the originals back.

# --try-tr--

Tırnak içindeki mesajları kendi cümlelerinle değiştir ve bir kez kazanıp gör. Sonra asıllarına geri al.

# --tests--

A win should show the green message.
tr: Kazanınca yeşil mesaj görünmeli.

```js
word = 'TIGER'
for (const key of 'tiger') $.press(key)
$.tick(1)
const t = $.screen().find((c) => c.op === 'fillText' && c.args[0] === 'You got it! Click for the next word')
assert.exists(t)
assert.strictEqual(t.fill, '#15803d')
assert.deepEqual(t.args.slice(1), [240, 298])
```

A loss should show the red message.
tr: Kaybedince kırmızı mesaj görünmeli.

```js
word = 'TIGER'
for (const key of 'abcdfh') $.press(key)
$.tick(1)
const t = $.screen().find((c) => c.op === 'fillText' && c.args[0] === 'Hanged! Click to try another')
assert.exists(t)
assert.strictEqual(t.fill, '#b91c1c')
```

While playing there should be no message.
tr: Oyun sürerken mesaj olmamalı.

```js
$.tick(1)
assert.notInclude($.texts(), 'You got it! Click for the next word')
assert.notInclude($.texts(), 'Hanged! Click to try another')
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
let state // 'playing', 'won' or 'lost'

// The word with the letters not guessed yet hidden: 'C _ S T _ E'.
const masked = () => [...word].map((letter) => (guessed.has(letter) ? letter : '_')).join(' ')

function newWord() {
  word = WORDS[Math.floor(Math.random() * WORDS.length)]
  guessed = new Set()
  wrong = 0
  state = 'playing'
}

function guess(letter) {
  if (state !== 'playing' || guessed.has(letter)) return
  guessed.add(letter)
  if (!word.includes(letter)) wrong += 1
  if ([...word].every((l) => guessed.has(l))) {
    state = 'won'
  } else if (wrong === MAX_WRONG) {
    state = 'lost'
  }
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

// One drawing per wrong guess.
const PARTS = [
  () => {
    ctx.beginPath()
    ctx.arc(170, 110, 20, 0, Math.PI * 2) // head
    ctx.stroke()
  },
  () => line(170, 130, 170, 200), // body
  () => line(170, 150, 140, 180), // left arm
  () => line(170, 150, 200, 180), // right arm
  () => line(170, 200, 145, 245), // left leg
  () => line(170, 200, 195, 245), // right leg
]

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
  for (let i = 0; i < wrong; i++) PARTS[i]()

  ctx.fillStyle = '#1f2937'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Misses ' + wrong + ' / ' + MAX_WRONG, 260, 100)
  ctx.fillStyle = '#b91c1c'
  ctx.fillText([...guessed].filter((l) => !word.includes(l)).join(' '), 260, 130)

  ctx.textAlign = 'center'
  ctx.font = 'bold 32px monospace'
  if (state === 'lost') {
    ctx.fillStyle = '#b91c1c'
    ctx.fillText([...word].join(' '), canvas.width / 2, 340)
  } else {
    ctx.fillStyle = '#1f2937'
    ctx.fillText(masked(), canvas.width / 2, 340)
  }
  if (state !== 'playing') {
    ctx.font = 'bold 20px sans-serif'
    ctx.fillStyle = state === 'won' ? '#15803d' : '#b91c1c'
    ctx.fillText(state === 'won' ? 'You got it! Click for the next word' : 'Hanged! Click to try another', canvas.width / 2, 298)
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

newWord()
requestAnimationFrame(loop)
```
