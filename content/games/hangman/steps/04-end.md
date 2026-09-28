---
title: Winning, losing, again
title_tr: Kazanmak, kaybetmek, yeniden
skills: [game.state]
---

# --explanation--

You **win** when every letter of the word has been guessed. That is a question about all of them, and arrays have a method
that asks exactly that: `every` is true when the test is true for every item.

```js
[...word].every((l) => guessed.has(l))
```

You **lose** on the sixth miss, and then the game should show the word you missed, in red. It is only fair.

A `state` of `'playing'`, `'won'` or `'lost'` keeps it clear. `guess` only works while playing, and after the end, Enter,
Space or a click starts a new word.

One detail players notice: the same word twice in a row feels broken, even though a random pick allows it. A `do ... while`
loop picks again until the word is different from the last one.

A **streak** counts words solved in a row and goes back to 0 on a loss; the best streak is saved in `localStorage`.

# --explanation-tr--

**Bu adımda:** oyunun sonu gelecek. Bütün harfleri bulursan yeşil `You got it! Click for the next word` yazar;
altıncı ıskada kaybedersin, kelime kırmızıyla açılır ve `Hanged! Click to try another` yazar. Tıklama, Enter ya da
boşluk tuşu yeni kelime başlatır. Sağ üstte art arda kaç kelime bildiğin (**seri**, streak) ve rekorun görünür.

**Kazandın mı?** Kelimenin **her** harfi tahmin edildiyse kazandın. Dizilerin tam bunu soran bir komutu var:

```js
[...word].every((l) => guessed.has(l))
```

`every` ("her biri") her harf için ok fonksiyonunu çalıştırır; **hepsi** `true` derse sonuç `true` olur.

**Kaybettin mi?** Altıncı ıskada (`wrong === MAX_WRONG`). O zaman kaçırdığın kelimeyi kırmızıyla göstermek adil olur:
`[...word].join(' ')` harfleri aralarında boşlukla yazar.

**Durum.** Oyunun aşamasını `state` değişkeninde bir yazı olarak tutarız: `'playing'`, `'won'` ya da `'lost'`.
`guess` sadece `'playing'` iken çalışır (`!==` "eşit değil"); bu, eski `wrong === MAX_WRONG` kontrolünün de yerini
alır. Oyun bitince Enter, boşluk (`' '`) ya da canvas'a tıklama `newWord()` çağırır. `event.preventDefault()`, boşluk
tuşunun sayfayı kaydırmasını engeller.

**Aynı kelime iki kez gelmesin.** Rastgele seçim aynı kelimeyi art arda verebilir ve bu oyuncuya bozuk gibi gelir.
`do ... while` döngüsü **önce yapar, sonra kontrol eder**:

```js
let next
do next = WORDS[Math.floor(Math.random() * WORDS.length)]
while (next === word)   // eskisiyle aynıysa yeniden seç
word = next
```

**Seri ve rekor.** `streak` kazanınca 1 artar, kaybedince 0'a döner. Seri rekoru (`best`) geçerse (`>` "büyük")
rekor güncellenir ve `localStorage`'a yazılır. `localStorage` tarayıcının küçük bir defteridir; sayfayı yenilesen de
içindekiler durur, ama sadece yazı saklar:

- `localStorage.setItem('hangman-best', best)` → `'hangman-best'` başlığıyla yaz.
- `localStorage.getItem('hangman-best')` → oku; hiç yazılmamışsa `null` (boş) verir.
- `Number(...)` yazıyı sayıya çevirir; `|| 0` "boş ya da geçersizse 0 kullan" demektir.

`if ... else if ...` → "kazandıysan şunu yap; **değilse**, ıskalar doldu mu diye bak".

# --task--

1. Add `state` (`'playing'` in `newWord()`), `streak = 0` and `best`, kept in `localStorage` under `'hangman-best'`.
2. `newWord()` picks again while the new word equals the current one.
3. `guess` only works while `'playing'`. When every letter is guessed, set `'won'`, add 1 to `streak` and save a new best;
   at `MAX_WRONG` misses set `'lost'` and `streak = 0`.
4. When the game is not `'playing'`, Enter, Space (`preventDefault()`) or a click calls `newWord()`.
5. Draw `Streak 1  Best 3` at `(260, 70)`. When `'lost'`, draw the whole word in `'#b91c1c'` instead of `masked()`. When the game
   is over, draw `You got it! Click for the next word` (in `'#15803d'`) or `Hanged! Click to try another` (in `'#b91c1c'`),
   `'bold 20px sans-serif'`, centered at `y = 298`.

# --task-tr--

1. `let wrong` satırının hemen altına ekle:

   ```js
   let state // 'playing', 'won' or 'lost'
   let streak = 0
   let best = Number(localStorage.getItem('hangman-best')) || 0
   ```

2. `newWord()` fonksiyonunu şöyle değiştir:

   ```js
   function newWord() {
     let next                                                    // ← yeni
     do next = WORDS[Math.floor(Math.random() * WORDS.length)]   // ← değişti
     while (next === word) // never the same word twice in a row
     word = next                                                 // ← yeni
     guessed = new Set()
     wrong = 0
     state = 'playing'                                           // ← yeni
   }
   ```

   `while (next === word)` satırı da yeni.

3. `guess(letter)` fonksiyonunu şöyle değiştir:

   ```js
   function guess(letter) {
     if (state !== 'playing' || guessed.has(letter)) return   // ← değişti
     guessed.add(letter)
     if (!word.includes(letter)) wrong += 1
     if ([...word].every((l) => guessed.has(l))) {             // ← yeni
       state = 'won'                                           // ← yeni
       streak += 1                                             // ← yeni
       if (streak > best) {                                    // ← yeni
         best = streak                                         // ← yeni
         localStorage.setItem('hangman-best', best)            // ← yeni
       }                                                       // ← yeni
     } else if (wrong === MAX_WRONG) {                         // ← yeni
       state = 'lost'                                          // ← yeni
       streak = 0                                              // ← yeni
     }                                                         // ← yeni
   }
   ```

4. `keydown` dinleyicisinin **en başına**, `(event) => {` satırının hemen altına ekle:

   ```js
     if (state !== 'playing' && (event.key === 'Enter' || event.key === ' ')) {
       event.preventDefault()
       newWord()
       return
     }
   ```

5. `keydown` dinleyicisinin kapanış `})`'sinden sonra bir satır boşluk bırakıp tıklama dinleyicisini ekle:

   ```js
   canvas.addEventListener('pointerdown', () => {
     if (state !== 'playing') newWord()
   })
   ```

6. `draw()` içinde `ctx.fillText('Misses ' + ...` satırının **üstüne** seri satırını ekle:

   ```js
     ctx.fillText('Streak ' + streak + '  Best ' + best, 260, 70)
   ```

   `'  Best '` içinde **iki** boşluk var.

7. `draw()`'un sonunda, `ctx.font = 'bold 32px monospace'` satırının altındaki iki satırı (`ctx.fillStyle = '#1f2937'`
   ve `ctx.fillText(masked(), ...)`) şununla değiştir:

   ```js
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
   ```

   Bunlardan sonra `draw()`'un kapanış `}`'si gelir.

8. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. Kelimeyi bulunca yeşil mesaj, altı ıskada kırmızı kelime ve
   mesaj çıkmalı; tıklama ya da Enter yeni kelime başlatmalı. Sağ üstte `Streak` ve `Best` görünmeli. Alttaki
   kontrollerin hepsi yeşil olmalı.

# --tests--

Guessing every letter should win, grow the streak and save the best.
tr: Her harfi tahmin etmek kazandırmalı, seriyi büyütmeli ve en iyiyi kaydetmeli.

```js
word = 'TIGER'
guessed = new Set()
wrong = 0
state = 'playing'
for (const key of 'tigxe') $.press(key)
assert.strictEqual(state, 'playing')
$.press('r')
assert.strictEqual(state, 'won')
assert.strictEqual(streak, 1)
assert.strictEqual(best, 1)
assert.strictEqual(localStorage.getItem('hangman-best'), '1')
$.press('b')
assert.isFalse(guessed.has('B'), 'no guessing after the end')
$.tick(1)
assert.include($.texts(), 'You got it! Click for the next word')
```

The sixth miss should lose, end the streak and reveal the word in red.
tr: Altıncı ıska kaybettirmeli, seriyi bitirmeli ve kelimeyi kırmızıyla göstermeli.

```js
word = 'TIGER'
guessed = new Set()
wrong = 0
state = 'playing'
streak = 3
for (const key of 'abcdf') $.press(key)
assert.strictEqual(state, 'playing')
$.press('h')
assert.strictEqual(state, 'lost')
assert.strictEqual(streak, 0, 'a loss ends the streak')
$.tick(1)
const shown = $.screen().filter((c) => c.op === 'fillText' && c.args[0] === 'T I G E R')
assert.lengthOf(shown, 1, 'the word is revealed')
assert.strictEqual(shown[0].fill, '#b91c1c')
```

Enter or a click should start a new word, never the same one twice in a row.
tr: Enter ya da bir tıklama yeni bir kelime başlatmalı; art arda asla aynı kelime olmamalı.

```js
state = 'won'
const before = word
$.press('Enter')
assert.strictEqual(state, 'playing')
assert.notStrictEqual(word, before)
state = 'lost'
$.click(240, 200)
assert.strictEqual(state, 'playing', 'a click starts the next word')
for (let i = 0; i < 100; i++) {
  const last = word
  newWord()
  assert.notStrictEqual(word, last, 'never the same word twice in a row')
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
