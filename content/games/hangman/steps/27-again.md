---
title: Play again
title_tr: Yeniden oyna
skills: [game.input, game.state]
---

# --goal--

After the end, Enter, Space or a click on the game starts a new word.

# --goal-tr--

Mesaj "tıkla" diyor; şimdi bunu gerçek yapıyoruz. Oyun bitince **Enter**, **boşluk** tuşu ya da oyuna **tıklamak**
yeni bir kelime başlatacak. `newWord` zaten her şeyi sıfırlıyor: yeni kelime, boş küme, sıfır ıska, `'playing'`.

# --code--

```js
document.addEventListener('keydown', (event) => {
  if (state !== 'playing' && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault()
    newWord()
    return
  }
  // ...
})

canvas.addEventListener('pointerdown', () => {
  if (state !== 'playing') newWord()
})
```

# --meaning--

- The key listener first checks: game over **and** (Enter **or** Space)? Then it starts a new word and returns.
- `event.preventDefault()` stops Space from scrolling the page.
- `pointerdown` fires when the mouse button or a finger goes down on the canvas.

# --meaning-tr--

- `state !== 'playing' && (event.key === 'Enter' || event.key === ' ')` → "oyun bittiyse **ve** (Enter **veya**
  boşluk) basıldıysa". Parantez, `||`'nin önce hesaplanmasını sağlar. Boşluk tuşunun adı `' '` (tırnak içinde bir
  boşluk).
- `event.preventDefault()` → tarayıcının bu tuşla yapacağı **varsayılan işi engeller**: boşluk normalde sayfayı
  aşağı kaydırır.
- `newWord()` ve `return` → yeni kelime başlat ve dinleyiciden çık (Enter harf değil zaten, ama açık olsun).
- `canvas.addEventListener('pointerdown', () => { ... })` → tuvale fare ile basıldığında ya da **parmakla
  dokunulduğunda** çalışır.
- `if (state !== 'playing') newWord()` → sadece oyun bittiyse. Oyun sürerken tıklamak bir şey yapmaz.

# --task--

1. In the `keydown` listener, at the very top (under its first line), write the `if` block.
2. Under the whole listener's `})`, leave an empty line and write the `pointerdown` listener. Press **Run**.

# --task-tr--

1. `keydown` dinleyicisinin **en üstüne**, `(event) => {` satırının hemen altına `if (...) { ... }` bloğunu yaz.
   (`// ...` satırı "dinleyicinin geri kalanı aynı" demek; onu yazma.)
2. Dinleyiciyi kapatan `})` satırının altına bir boş satır bırakıp `pointerdown` dinleyicisini yaz.
3. **Çalıştır**, bir kelimeyi bitir ve tıkla ya da Enter'a bas: yeni kelime gelmeli.

# --tests--

After the end, Enter or Space should start a new word.
tr: Oyun bitince Enter ya da boşluk yeni kelime başlatmalı.

```js
word = 'TIGER'
for (const key of 'tiger') $.press(key)
assert.strictEqual(state, 'won')
$.press('Enter')
assert.strictEqual(state, 'playing')
assert.strictEqual(guessed.size, 0)
state = 'lost'
$.press(' ')
assert.strictEqual(state, 'playing')
assert.strictEqual(wrong, 0)
```

After the end, a click should start a new word.
tr: Oyun bitince bir tıklama yeni kelime başlatmalı.

```js
state = 'lost'
wrong = 6
$.click(240, 200)
assert.strictEqual(state, 'playing')
assert.strictEqual(wrong, 0)
```

While playing, a click or Enter should change nothing.
tr: Oyun sürerken tıklama ya da Enter hiçbir şeyi değiştirmemeli.

```js
word = 'CASTLE'
$.press('a')
$.click(240, 200)
$.press('Enter')
assert.strictEqual(word, 'CASTLE')
assert.isTrue(guessed.has('A'))
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
  if (state !== 'playing' && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault()
    newWord()
    return
  }
  const letter = event.key.toUpperCase()
  if (letter.length === 1 && LETTERS.includes(letter)) guess(letter)
})

canvas.addEventListener('pointerdown', () => {
  if (state !== 'playing') newWord()
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
