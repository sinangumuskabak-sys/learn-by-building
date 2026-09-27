---
title: A keyboard on the screen
title_tr: Ekranda bir klavye
skills: [game.input, game.canvas]
---

# --explanation--

A phone opens no keyboard for a canvas, so the game draws its own: 26 keys in rows of 9, 9 and 8.

`keyRect(i)` works out where key `i` is: its row is `Math.floor(i / 9)` and its place in the row `i % 9`. The last row has
only 8 keys, and it looks much better **centered**, so each row computes its own left edge from how many keys it has.
Both drawing and clicking use `keyRect`, so the keys you see and the keys you hit can never disagree.

A click is inside a key when it is between the key's left and right edges **and** between its top and bottom. The small gap
between keys belongs to no key, which avoids hitting the wrong letter with a fat finger on the edge.

The keys also show what you know: a **green** key was in the word, a **grey** one was a miss, and the rest are still
possible. Most players look at this more than at the list of misses.

# --explanation-tr--

Telefon bir canvas için klavye açmaz, bu yüzden oyun kendininkini çizer: 9, 9 ve 8'lik satırlarda 26 tuş.

`keyRect(i)`, `i` tuşunun nerede olduğunu hesaplar: satırı `Math.floor(i / 9)`, satırdaki yeri `i % 9`'dur. Son satırda
yalnızca 8 tuş vardır ve **ortalanmış** hâli çok daha iyi görünür; bu yüzden her satır kendi sol kenarını kaç tuşu olduğundan
hesaplar. Hem çizim hem tıklama `keyRect`'i kullanır; böylece gördüğün tuşlarla bastığın tuşlar asla çelişmez.

Bir tıklama, tuşun sol ve sağ kenarları arasında **ve** üstü ile altı arasındaysa tuşun içindedir. Tuşlar arasındaki küçük
boşluk hiçbir tuşa ait değildir; bu da kenara dokunan kalın bir parmakla yanlış harfe basmayı önler.

Tuşlar bildiklerini de gösterir: **yeşil** bir tuş kelimedeydi, **gri** bir tuş ıskaydı, geri kalanlar hâlâ mümkün.
Çoğu oyuncu buna ıska listesinden daha çok bakar.

# --task--

1. Add `KEY_W = 48`, `KEY_H = 34` and `KEYS_Y = 360`.
2. Write `keyRect(i)`: `{ x, y }` of key `i`, in rows of 9 (the last row has 8), 4 pixels apart horizontally and 6
   vertically, each row centered.
3. On `pointerdown` while playing, guess the letter of the key under the pointer (after the game, a click still starts a new
   word).
4. Draw each key: `'#86efac'` if guessed and in the word, `'#a8a29e'` if guessed and not, otherwise `'#e7e5e4'`, with its
   letter centered in `'#1f2937'`, `'bold 18px sans-serif'`, at `k.y + 24`.

# --task-tr--

1. `KEY_W = 48`, `KEY_H = 34` ve `KEYS_Y = 360` ekle.
2. `keyRect(i)` yaz: `i` tuşunun `{ x, y }`'si; 9'luk satırlarda (son satırda 8), yatayda 4, dikeyde 6 piksel aralıklı, her satır
   ortalı.
3. Oynarken `pointerdown`'da işaretçinin altındaki tuşun harfini tahmin et (oyundan sonra bir tıklama hâlâ yeni bir kelime
   başlatır).
4. Her tuşu çiz: tahmin edildiyse ve kelimedeyse `'#86efac'`, tahmin edildiyse ve değilse `'#a8a29e'`, değilse `'#e7e5e4'`;
   harfi `'#1f2937'` ile, `'bold 18px sans-serif'`, `k.y + 24`'te ortalı.

# --tests--

The 26 keys should be laid out in rows, with the last row centered.
tr: 26 tuş satırlara dizilmeli ve son satır ortalanmalı.

```js
$.tick(1)
for (const letter of LETTERS) assert.include($.texts(), letter)
const k = keyRect(0)
assert.deepEqual(k, { x: 8, y: 360 })
assert.deepEqual(keyRect(25), { x: 34 + 7 * 52, y: 440 }, 'the last row of 8 is centered')
```

Clicking a key should guess its letter, and the gaps should not.
tr: Bir tuşa tıklamak harfini tahmin etmeli, boşluklar etmemeli.

```js
word = 'ZEBRA'
guessed = new Set()
wrong = 0
state = 'playing'
$.click(34 + 7 * 52 + 24, 440 + 17)
assert.isTrue(guessed.has('Z'))
$.click(8 + 3 * 52 + 24, 360 + 17)
assert.isTrue(guessed.has('D'))
assert.strictEqual(wrong, 1)
$.click(8 + 3 * 52 + 50, 360 + 17)
assert.strictEqual(guessed.size, 2, 'the gap between keys is not a key')
```

Keys should turn green for a hit and grey for a miss.
tr: Tuşlar isabette yeşil, ıskada gri olmalı.

```js
word = 'ZEBRA'
guessed = new Set()
wrong = 0
state = 'playing'
$.press('z')
$.press('q')
$.tick(1)
assert.deepInclude($.rects('#86efac'), { x: 34 + 7 * 52, y: 440, w: 48, h: 34, color: '#86efac' }, 'a hit is green')
assert.deepInclude($.rects('#a8a29e'), { x: 8 + 7 * 52, y: 400, w: 48, h: 34, color: '#a8a29e' }, 'a miss is grey')
assert.lengthOf($.rects('#e7e5e4'), 24)
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

// The on-screen keyboard: rows of 9 keys, centered.
function keyRect(i) {
  const row = Math.floor(i / 9)
  const inRow = row === 2 ? 8 : 9
  const left = (canvas.width - inRow * (KEY_W + 4) + 4) / 2
  return { x: left + (i % 9) * (KEY_W + 4), y: KEYS_Y + row * (KEY_H + 6) }
}

canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height
  if (state !== 'playing') {
    newWord()
    return
  }
  for (let i = 0; i < LETTERS.length; i++) {
    const k = keyRect(i)
    if (x >= k.x && x < k.x + KEY_W && y >= k.y && y < k.y + KEY_H) guess(LETTERS[i])
  }
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

  for (let i = 0; i < LETTERS.length; i++) {
    const letter = LETTERS[i]
    const k = keyRect(i)
    let color = '#e7e5e4'
    if (guessed.has(letter)) color = word.includes(letter) ? '#86efac' : '#a8a29e'
    ctx.fillStyle = color
    ctx.fillRect(k.x, k.y, KEY_W, KEY_H)
    ctx.fillStyle = '#1f2937'
    ctx.font = 'bold 18px sans-serif'
    ctx.fillText(letter, k.x + KEY_W / 2, k.y + 24)
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

newWord()
requestAnimationFrame(loop)
```
