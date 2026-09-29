---
title: The parts in a list
title_tr: Parçalar bir listede
skills: [prog.arrays, prog.functions]
---

# --goal--

Six `if`s that all say "the n-th part after n misses" can be one list and one loop. Functions are values, so the
parts can sit in an array, in order, and we call the first `wrong` of them.

# --goal-tr--

Altı `if` çalışıyor ama hepsi aynı şeyi söylüyor: "n. ıskada n. parçayı çiz". Tekrar eden kod, daha düzgün bir yol
olduğunun işaretidir.

Fikir: parçaları sırayla bir **listeye** koymak ve ilk `wrong` tanesini çizmek. Listenin elemanları sayı ya da yazı
değil, **fonksiyon** olacak: her eleman bir parçayı çizen küçük bir fonksiyon. JavaScript'te fonksiyonlar da birer
**değerdir**; sayılar gibi bir listede durabilirler. Ekran aynı kalacak; kod toparlanacak.

# --code--

```js
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

  for (let i = 0; i < wrong; i++) PARTS[i]()
```

# --meaning--

- `PARTS` is an array of six functions, in drawing order. The head needs three lines, so its function has a `{ }`
  body; the others are one `line` call each.
- `PARTS[0]` is the first function; `PARTS[0]()` calls it.
- `for (let i = 0; i < wrong; i++)` repeats with `i` = 0, 1, ... up to `wrong - 1`. With 2 misses it calls
  `PARTS[0]()` and `PARTS[1]()`: head and body.

# --meaning-tr--

- `const PARTS = [ ... ]` → altı elemanlı bir liste; her eleman bir **ok fonksiyonu**, çizim sırasıyla.
- `() => line(170, 130, 170, 200)` → parametresiz, tek satırlık fonksiyon: çağrılınca gövdeyi çizer.
- Başın fonksiyonu üç satır olduğu için `{ }` içinde yazıldı. Her elemandan sonra **virgül** var.
- `PARTS[0]` → listedeki ilk fonksiyon; sonuna `()` koyunca **çağrılır**: `PARTS[0]()` başı çizer.
- `for (let i = 0; i < wrong; i++) PARTS[i]()` → bir **döngü**:
  - `let i = 0` → sayaç 0'dan başlar.
  - `i < wrong` → sayaç `wrong`'dan küçük olduğu sürece tekrarla.
  - `i++` → her turdan sonra `i`'yi 1 artır.
  - `wrong` 2 ise `PARTS[0]()` ve `PARTS[1]()` çalışır: baş ve gövde.
- Yedinci bir parça (yüz, şapka) eklemek istersen listeye bir satır eklersin; başka hiçbir şey değişmez.

# --task--

1. Above `function draw() {`, write the `PARTS` list (with its comment) and leave an empty line.
2. In `draw`, delete the head `if` block and the five `if` lines, and write the `for` line in their place.

# --task-tr--

1. `function draw() {` satırının **üstüne** yorum satırıyla birlikte `PARTS` listesini yaz; arada bir boş satır kalsın.
   Başın üç satırını `if` bloğundan buraya taşıyabilirsin.
2. `draw` içinde başı çizen `if (wrong > 0) { ... }` bloğunu ve beş `if` satırını **sil**; yerlerine tek `for`
   satırını yaz (`ctx.lineWidth = 4` satırının altına).
3. **Çalıştır**: oyun aynı görünmeli ve aynı çalışmalı.

# --predict--

With `wrong` = 3, which parts does the loop draw?
- [ ] Only the right arm
- [x] Head, body and left arm
  `i` takes the values 0, 1 and 2, so `PARTS[0]`, `PARTS[1]` and `PARTS[2]` run.
- [ ] Head, body, both arms

# --predict-tr--

`wrong` 3 iken döngü hangi parçaları çizer?
- [ ] Sadece sağ kolu
- [x] Baş, gövde ve sol kol
  `i` sırayla 0, 1 ve 2 olur; `PARTS[0]`, `PARTS[1]` ve `PARTS[2]` çalışır.
- [ ] Baş, gövde ve iki kol

# --hint--

Check the commas: every item of `PARTS` ends with `,`, and the head's function ends with `},`.

# --hint-tr--

Virgüllere bak: `PARTS`'ın her elemanı `,` ile biter; başın fonksiyonu `},` ile kapanır. Liste `]` ile kapanır.

# --tests--

`PARTS` should be a list of six functions.
tr: `PARTS` altı fonksiyonluk bir liste olmalı.

```js
assert.isArray(PARTS)
assert.lengthOf(PARTS, 6)
for (const part of PARTS) assert.isFunction(part)
```

Each part should draw one piece, in order: head first, right leg last.
tr: Her parça bir şey çizmeli, sırayla: önce baş, en son sağ bacak.

```js
$.tick(1)
PARTS[0]()
assert.deepEqual($.arcs().map(({ x, y, r }) => ({ x, y, r })), [{ x: 170, y: 110, r: 20 }])
const start = $.screen().length
PARTS[5]()
const end = $.screen().slice(start).find((c) => c.op === 'lineTo')
assert.deepEqual(end.args, [195, 245])
```

Each miss should still add exactly one part.
tr: Her ıska yine tam olarak bir parça eklemeli.

```js
const strokes = () => $.screen().filter((c) => c.op === 'stroke').length
for (let w = 0; w <= 6; w++) {
  wrong = w
  $.tick(1)
  assert.strictEqual(strokes(), 4 + w, 'one part per miss')
}
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
