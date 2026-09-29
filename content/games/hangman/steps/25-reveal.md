---
title: Show the word you missed
title_tr: Kaçırdığın kelimeyi göster
skills: [game.state]
---

# --goal--

After a loss it is only fair to show the word. When `state` is `'lost'`, the whole word is drawn in red.

# --goal-tr--

Kaybedince kelimeyi merak edersin; göstermek adil olur. `state` `'lost'` ise kelimenin **tamamını kırmızıyla**
yazacağız; değilse eskisi gibi boşluklu hâlini.

# --code--

```js
function draw() {
  // ...
  ctx.textAlign = 'center'
  ctx.font = 'bold 32px monospace'
  if (state === 'lost') {
    ctx.fillStyle = '#b91c1c'
    ctx.fillText([...word].join(' '), canvas.width / 2, 340)
  } else {
    ctx.fillStyle = '#1f2937'
    ctx.fillText(masked(), canvas.width / 2, 340)
  }
```

# --meaning--

- `if ... else` chooses one of two blocks.
- `[...word].join(' ')` writes all the letters with spaces, lined up like the blanks.

# --meaning-tr--

- `if (state === 'lost') { ... } else { ... }` → kaybettiysen ilk blok, **değilse** ikinci blok çalışır. İkisi
  birden asla.
- `[...word].join(' ')` → bütün harfler aralarında boşlukla: `'T I G E R'`. Boşluklu hâliyle aynı hizada durur.
- `else` bloğu eski iki satırın aynısı.

# --task--

In `draw`, replace the last two lines (`fillStyle` and `fillText(masked(), ...)`) with the `if ... else` block.

# --task-tr--

`draw`'un sonunda, `ctx.font = 'bold 32px monospace'` satırının altındaki iki satırı (`ctx.fillStyle = '#1f2937'` ve
`ctx.fillText(masked(), ...)`) `if ... else` bloğuyla değiştir. Eski iki satır `else` bloğunun içine girer.
**Çalıştır** ve bilerek kaybet: kelime kırmızıyla açılmalı.

# --tests--

After a loss the whole word should be shown in red.
tr: Kaybedince kelimenin tamamı kırmızıyla gösterilmeli.

```js
word = 'TIGER'
for (const key of 'abcdfh') $.press(key)
$.tick(1)
const shown = $.screen().filter((c) => c.op === 'fillText' && c.args[0] === 'T I G E R')
assert.lengthOf(shown, 1, 'the word is revealed')
assert.strictEqual(shown[0].fill, '#b91c1c')
```

While playing the word should stay hidden.
tr: Oyun sürerken kelime gizli kalmalı.

```js
word = 'TIGER'
$.press('i')
$.tick(1)
assert.include($.texts(), '_ I _ _ _')
assert.notInclude($.texts(), 'T I G E R')
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
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

newWord()
requestAnimationFrame(loop)
```
