---
title: The gallows
title_tr: Darağacı
skills: [game.canvas]
---

# --goal--

Three more lines finish the gallows: the post, the beam and the short rope.

# --goal-tr--

Tabana üç çizgi daha ekleyince darağacı tamam: yukarı doğru **direk**, üstte **kiriş** ve kirişten sarkan kısa **ip**.

# --code--

```js
function draw() {
  // ...
  line(40, 270, 220, 270)
  line(80, 270, 80, 50)
  line(80, 50, 170, 50)
  line(170, 50, 170, 90)
```

# --meaning--

- The post goes up from the ground at x = 80 (y shrinks going up).
- The beam goes right from the top of the post.
- The rope hangs down from the end of the beam to y = 90, where the head will be.

# --meaning-tr--

- `line(80, 270, 80, 50)` → **direk**: x hep 80; y 270'ten 50'ye iner. y küçüldükçe **yukarı** çıkarız (canvas'ta
  y aşağı doğru büyür).
- `line(80, 50, 170, 50)` → **kiriş**: direğin tepesinden sağa, x = 170'e.
- `line(170, 50, 170, 90)` → **ip**: kirişin ucundan aşağı, y = 90'a. Başın üst kenarı tam orada olacak.
- Her çizgi bir öncekinin bittiği yerden başlıyor; böylece birleşik görünüyorlar.

# --task--

In `draw`, under `line(40, 270, 220, 270)`, write the three lines. Press **Run**.

# --task-tr--

`draw` içinde `line(40, 270, 220, 270)` satırının altına üç satırı yaz. **Çalıştır**: darağacının tamamını
görmelisin.

# --try--

Make the beam longer: change both `170`s in the last two lines to `190`. Put them back after looking.

# --try-tr--

Kirişi uzat: son iki satırdaki `170`'leri `190` yap. Baktıktan sonra geri al.

# --tests--

The gallows should be four lines: ground, post, beam and rope.
tr: Darağacı dört çizgi olmalı: taban, direk, kiriş ve ip.

```js
$.tick(1)
assert.strictEqual($.screen().filter((c) => c.op === 'stroke').length, 4, 'the gallows is four lines')
const ends = $.screen().filter((c) => c.op === 'lineTo').map((c) => c.args.join())
assert.includeMembers(ends, ['220,270', '80,50', '170,50', '170,90'])
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
