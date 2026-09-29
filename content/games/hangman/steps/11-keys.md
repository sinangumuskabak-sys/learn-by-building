---
title: Guess with the keyboard
title_tr: Klavyeyle tahmin et
skills: [game.input]
---

# --goal--

Now the player guesses: when a key goes down, we turn its name into a capital letter and guess it.

# --goal-tr--

Şimdi sıra oyuncuda: bir **tuşa basılınca** o harfi tahmin edeceğiz.

Tarayıcıya "bir tuşa basılınca bana haber ver" deriz. Buna **olay dinlemek** (event listener) denir: kapı zili
gibi, çalınca ne yapılacağını önceden söylersin.

# --code--

```js
document.addEventListener('keydown', (event) => {
  const letter = event.key.toUpperCase()
  guess(letter)
})
```

# --meaning--

- `addEventListener('keydown', ...)` runs the function each time a key goes down.
- `event.key` is the key's name: `'a'` for the A key.
- `.toUpperCase()` makes it a capital, `'A'`, like the words.

# --meaning-tr--

- `document.addEventListener('keydown', (event) => { ... })` → "sayfada bir tuşa **basıldığında** (keydown) süslü
  parantez içini çalıştır". `(event) => { }` adı olmayan bir ok fonksiyonu; `event` basılan tuşun bilgilerini taşır.
  Birden fazla satırı olan ok fonksiyonu `{ }` içine yazılır.
- `event.key` → basılan tuşun adı: A tuşu için `'a'`.
- `.toUpperCase()` → yazıyı **büyük harfe** çevirir: `'a'` → `'A'`. Kelimelerimiz büyük harf olduğu için şart.
- `guess(letter)` → o harfi tahmin et.

# --task--

Write the listener under the `guess` function, with an empty line between. Press **Run**, click the game once and
type some letters.

# --task-tr--

1. Dinleyiciyi `guess` fonksiyonunun altına, bir boş satır bırakarak yaz.
2. **Çalıştır**, sonra oyuna bir kez **tıkla** (klavye oyuna gitsin) ve harf tuşlarına bas: kelimede olan harfler
   yerine oturmalı.

# --predict--

After this step, what happens when you press **Shift**?
- [ ] A letter S is guessed
- [x] Nothing visible, but `'SHIFT'` goes into `guessed`
  `event.key` is `'Shift'`, which becomes `'SHIFT'`. It is not a letter of any word, so nothing shows. We fix this next.
- [ ] The game stops

# --predict-tr--

Bu adımdan sonra **Shift** tuşuna basarsan ne olur?
- [ ] S harfi tahmin edilir
- [x] Görünen bir şey olmaz, ama `'SHIFT'` kümeye girer
  `event.key` `'Shift'`tir, büyütülünce `'SHIFT'` olur. Hiçbir kelimenin harfi olmadığı için görünmez. Bunu bir sonraki adımda düzelteceğiz.
- [ ] Oyun durur

# --hint--

Letters do not show? Click the game first so it gets the keyboard, then type.

# --hint-tr--

Harfler görünmüyor mu? Önce oyuna tıkla ki klavye oyuna gitsin, sonra yaz.

# --tests--

Pressing a letter key should guess it as a capital letter.
tr: Bir harf tuşuna basmak onu büyük harf olarak tahmin etmeli.

```js
$.press('a')
assert.isTrue(guessed.has('A'))
$.press('E')
assert.isTrue(guessed.has('E'))
```

The guessed letters should show in the word.
tr: Tahmin edilen harfler kelimede görünmeli.

```js
word = 'ZEBRA'
$.press('z')
$.press('a')
$.tick(1)
assert.include($.texts(), 'Z _ _ _ A')
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

let word
let guessed // a Set of the letters tried so far

// The word with the letters not guessed yet hidden: 'C _ S T _ E'.
const masked = () => [...word].map((letter) => (guessed.has(letter) ? letter : '_')).join(' ')

function newWord() {
  word = WORDS[Math.floor(Math.random() * WORDS.length)]
  guessed = new Set()
}

function guess(letter) {
  guessed.add(letter)
}

document.addEventListener('keydown', (event) => {
  const letter = event.key.toUpperCase()
  guess(letter)
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
