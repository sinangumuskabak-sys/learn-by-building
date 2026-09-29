---
title: The same letter twice is free
title_tr: Aynı harf iki kez bedava
skills: [game.state]
---

# --goal--

Pressing a wrong letter twice should not cost two misses. If the letter was already guessed, `guess` stops at once.

# --goal-tr--

Bir sorun var: yanlış bir harfe iki kez basarsan **iki** ıska sayılıyor. Oysa aynı harfi tekrar denemek oyuncuya
hiçbir şey kazandırmıyor; cezalandırmak da haksızlık.

Çözüm: harf zaten denendiyse `guess` hiçbir şey yapmadan **hemen çıksın**.

# --code--

```js
function guess(letter) {
  if (guessed.has(letter)) return
  guessed.add(letter)
  if (!word.includes(letter)) wrong += 1
}
```

# --meaning--

- `return` leaves the function right away; the lines under it do not run.
- So a letter already in `guessed` is not counted again.

# --meaning-tr--

- `if (guessed.has(letter)) return` → harf kümede **varsa** fonksiyondan çık.
- `return` → "fonksiyon burada **bitti**". Altındaki satırlar çalışmaz; ıska da eklenmez.
- Bu tür satıra **erken çıkış** denir: önce "yapılmayacak" durumları eleriz, sonra asıl işi yaparız.

# --task--

In `guess`, write the new line at the very top, above `guessed.add(letter)`. Press **Run**.

# --task-tr--

`guess` fonksiyonunun içinde **en üste**, `guessed.add(letter)` satırının üstüne yeni satırı yaz. **Çalıştır**.

# --predict--

Before this step, the word is CASTLE and you press Z three times. What is `wrong`?
- [ ] 1
- [x] 3
  Each press adds Z again (the Set does not mind) and counts a miss every time.
- [ ] 0

# --predict-tr--

Bu adımdan **önce** kelime CASTLE ve Z'ye üç kez basıyorsun. `wrong` kaç olur?
- [ ] 1
- [x] 3
  Her basışta Z yine eklenir (küme buna aldırmaz) ve her seferinde bir ıska sayılır.
- [ ] 0

# --tests--

Guessing the same wrong letter twice should cost only one miss.
tr: Aynı yanlış harfi iki kez tahmin etmek tek ıska olmalı.

```js
word = 'CASTLE'
$.press('z')
$.press('z')
$.press('Z')
assert.strictEqual(wrong, 1, 'the same letter twice costs nothing')
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
  if (guessed.has(letter)) return
  guessed.add(letter)
  if (!word.includes(letter)) wrong += 1
}

document.addEventListener('keydown', (event) => {
  const letter = event.key.toUpperCase()
  if (letter.length === 1 && LETTERS.includes(letter)) guess(letter)
})

function draw() {
  ctx.fillStyle = '#fefce8'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

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
