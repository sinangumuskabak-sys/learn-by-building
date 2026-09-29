---
title: Where each key goes
title_tr: Her tuş nereye
skills: [game.canvas]
---

# --goal--

A phone opens no keyboard for a canvas, so the game will draw its own: 26 keys in rows of 9. First, `keyRect(i)`
works out where key number `i` goes.

# --goal-tr--

Telefonda canvas için klavye açılmaz; yani telefonda bu oyun oynanamaz. Çözüm: oyun **kendi klavyesini** çizsin.
Kelimenin altına 26 tuş, 9'arlı satırlar hâlinde.

Önce hesap: harfleri `LETTERS` sırasıyla numaralarız (A = 0, B = 1, ... Z = 25). `keyRect(i)` fonksiyonu `i`
numaralı tuşun **sol üst köşesini** bulacak. Bu adımda henüz çizmiyoruz.

# --code--

```js
const KEY_W = 48
const KEY_H = 34
const KEYS_Y = 360

function keyRect(i) {
  const row = Math.floor(i / 9)
  return { x: 8 + (i % 9) * (KEY_W + 4), y: KEYS_Y + row * (KEY_H + 6) }
}
```

# --meaning--

- A key is 48×34 pixels; the keyboard starts at y = 360.
- `Math.floor(i / 9)` is the row: keys 0–8 are row 0, 9–17 row 1, 18–25 row 2.
- `i % 9` is the remainder after dividing by 9: the place in the row.
- Each key is 4 pixels further than the width (a gap), each row 6 pixels further than the height.
- `return { x, y }` gives back an object: the key's top-left corner.

# --meaning-tr--

- `KEY_W = 48`, `KEY_H = 34` → bir tuşun eni ve boyu. `KEYS_Y = 360` → klavyenin başladığı yükseklik.
- `const row = Math.floor(i / 9)` → **satır**: 9'a böl, aşağı yuvarla. 0–8 arası 0. satır, 9–17 1. satır, 18–25 2.
  satır. (`i = 10` → 10 / 9 = 1.1 → **1**.)
- `i % 9` → `%` **bölümden kalan**: 9'a bölünce ne artıyor? `10 % 9` → **1**. Bu, tuşun satırdaki **yeri**.
- `(KEY_W + 4)` → tuşlar arası mesafe: 48 piksel tuş + 4 piksel boşluk. Satırdaki yer bununla çarpılır.
- `(KEY_H + 6)` → satırlar arası mesafe: 34 + 6.
- `8 +` → soldan 8 piksel pay. 9 tuş × 52 − 4 = 464 piksel; 480'den kalan 16 piksel iki yana 8'er bölünür.
- `return { x: ..., y: ... }` → fonksiyon **sonuç olarak** bir nesne verir: tuşun sol üst köşesi.

# --task--

1. Under `const MAX_WRONG = 6` write the three key sizes.
2. Above `canvas.addEventListener('pointerdown', ...)`, write `keyRect` and leave an empty line. Press **Run**.

# --task-tr--

1. `const MAX_WRONG = 6` satırının altına üç tuş ölçüsünü yaz.
2. `canvas.addEventListener('pointerdown', ...)` satırının **üstüne** `keyRect` fonksiyonunu yaz; arada bir boş satır
   kalsın.
3. **Çalıştır**. Ekran değişmez; kontroller hesabı deniyor.

# --predict--

Which row and place does key 20 (U) get?
- [ ] Row 1, place 11
- [x] Row 2, place 2
  `Math.floor(20 / 9)` is 2 and `20 % 9` is 2 (9 + 9 + 2).
- [ ] Row 2, place 0

# --predict-tr--

20 numaralı tuş (U) hangi satırda, kaçıncı yerde?
- [ ] 1. satır, 11. yer
- [x] 2. satır, 2. yer
  `Math.floor(20 / 9)` 2 eder, `20 % 9` de 2 (9 + 9 + 2).
- [ ] 2. satır, 0. yer

# --tests--

Key 0 (A) should be at (8, 360), and key 8 (I) at the end of the first row.
tr: 0. tuş (A) (8, 360)'ta, 8. tuş (I) ilk satırın sonunda olmalı.

```js
assert.deepEqual(keyRect(0), { x: 8, y: 360 })
assert.deepEqual(keyRect(8), { x: 8 + 8 * 52, y: 360 })
```

Key 10 (K) should be the second key of the second row.
tr: 10. tuş (K) ikinci satırın ikinci tuşu olmalı.

```js
assert.deepEqual(keyRect(10), { x: 60, y: 400 })
```

The last row should start 80 pixels below the first.
tr: Son satır ilkinin 80 piksel altında başlamalı.

```js
assert.strictEqual(keyRect(25).y, 440)
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
const KEY_W = 48
const KEY_H = 34
const KEYS_Y = 360

let word
let guessed // a Set of the letters tried so far
let wrong
let state // 'playing', 'won' or 'lost'
let streak = 0
let best = Number(localStorage.getItem('hangman-best')) || 0

// The word with the letters not guessed yet hidden: 'C _ S T _ E'.
const masked = () => [...word].map((letter) => (guessed.has(letter) ? letter : '_')).join(' ')

function newWord() {
  let next
  do next = WORDS[Math.floor(Math.random() * WORDS.length)]
  while (next === word) // never the same word twice in a row
  word = next
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
    streak += 1
    if (streak > best) {
      best = streak
      localStorage.setItem('hangman-best', best)
    }
  } else if (wrong === MAX_WRONG) {
    state = 'lost'
    streak = 0
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

function keyRect(i) {
  const row = Math.floor(i / 9)
  return { x: 8 + (i % 9) * (KEY_W + 4), y: KEYS_Y + row * (KEY_H + 6) }
}

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
  ctx.fillText('Streak ' + streak + '  Best ' + best, 260, 70)
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
