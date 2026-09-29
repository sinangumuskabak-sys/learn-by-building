---
title: "The first miss: a head"
title_tr: "İlk ıska: baş"
skills: [game.canvas]
---

# --goal--

The first miss draws the head: a circle hanging from the rope. A circle is a path too, made with `arc`.

# --goal-tr--

Şimdi çöp adam geliyor. **İlk ıskada** ipin ucunda bir **baş** belirecek: bir daire.

Daire de bir yoldur; bu kez `lineTo` yerine `arc` (yay) kullanırız. Baş sadece en az bir ıska varsa çizilmeli; bunu
bir `if` ile soracağız.

# --code--

```js
function draw() {
  // ...
  line(170, 50, 170, 90)
  ctx.strokeStyle = '#1f2937'
  ctx.lineWidth = 4
  if (wrong > 0) {
    ctx.beginPath()
    ctx.arc(170, 110, 20, 0, Math.PI * 2) // head
    ctx.stroke()
  }
```

# --meaning--

- The figure is dark grey and a bit thinner (4 pixels).
- `if (wrong > 0) { ... }` runs the block only after at least one miss.
- `arc(x, y, radius, start, end)` draws part of a circle around (x, y). From angle `0` to `Math.PI * 2` is a whole
  turn, so it is a full circle. Its top is at 110 - 20 = 90, the end of the rope.

# --meaning-tr--

- `ctx.strokeStyle = '#1f2937'` ve `ctx.lineWidth = 4` → adam koyu gri ve biraz daha ince çizilecek.
- `if (wrong > 0) { ... }` → **en az bir ıska varsa** süslü parantez içini çalıştır. `>` "büyüktür".
- `ctx.arc(170, 110, 20, 0, Math.PI * 2)` → bir **yay** çizer:
  - `170, 110` → dairenin **merkezi**.
  - `20` → **yarıçap**: merkezden kenara 20 piksel. Dairenin tepesi 110 − 20 = 90, yani tam ipin ucu.
  - `0, Math.PI * 2` → yayın başlangıç ve bitiş **açısı**. Açılar derece değil **radyan** ile ölçülür: tam tur
    `Math.PI * 2` (yaklaşık 6.28). 0'dan tam tura kadar = **tam daire**.
- `ctx.stroke()` → sadece kenarını çiz (içi boş kalır).
- `// head` → satır sonundaki yorum: bu satırın ne olduğunu söyler.

# --task--

In `draw`, under `line(170, 50, 170, 90)`, write the new lines. Press **Run**, click the game and try a wrong letter.

# --task-tr--

`draw` içinde `line(170, 50, 170, 90)` satırının altına yeni satırları yaz. **Çalıştır**, oyuna tıkla ve yanlış bir
harf dene: ipin ucunda bir baş belirmeli.

# --hint--

`Math.PI` is written with a capital `M` and capital `PI`.

# --hint-tr--

`Math.PI` büyük `M` ve büyük `PI` ile yazılır.

# --tests--

With no misses there should be no head.
tr: Hiç ıska yokken baş olmamalı.

```js
wrong = 0
$.tick(1)
assert.lengthOf($.arcs(), 0)
```

The first miss should draw the head: a circle at (170, 110), radius 20.
tr: İlk ıska başı çizmeli: (170, 110)'da, yarıçapı 20 olan bir daire.

```js
word = 'CASTLE'
$.press('z')
$.tick(1)
assert.deepEqual($.arcs().map(({ x, y, r }) => ({ x, y, r })), [{ x: 170, y: 110, r: 20 }])
const arc = $.screen().find((c) => c.op === 'arc')
assert.closeTo(arc.args[4] - arc.args[3], Math.PI * 2, 0.001, 'a whole circle')
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
