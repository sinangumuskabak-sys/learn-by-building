---
title: Winning and losing
title_tr: Kazanmak ve kaybetmek
skills: [game.state]
---

# --explanation--

A guess that matches the answer wins. Six guesses that do not, lose, and the answer is revealed: it would be frustrating
never to find out.

Once the game is over, letters should not be typed any more, but one key still means something: Enter starts a new word.
Putting that check at the start of `type()` keeps every key's meaning in one place:

```js
if (state !== 'playing') {
  if (key === 'Enter') reset()
  return
}
```

A message line under the grid tells the player what is happening: an invitation while playing, the result when it is
over.

# --explanation-tr--

**Bu adımda:** oyunun bir sonu olacak. Kelimeyi bilirsen kazanırsın; altı tahminde bilemezsen kaybedersin ve gizli
kelime gösterilir (hiç öğrenememek sinir bozucu olurdu). Izgaranın altında bir mesaj satırı durumu anlatacak ve
oyun bitince **Enter** yeni kelime başlatacak.

**Durumu bir yazıyla tutmak.** Oyunun hangi aşamada olduğunu `state` (durum) adlı bir değişkende tutarız. Üç değeri
olabilir: `'playing'` (oynanıyor), `'won'` (kazandın), `'lost'` (kaybettin). `reset()` her yeni oyunda onu
`'playing'` yapar.

**Kazandın mı, kaybettin mi?** Tahmin eklendikten hemen sonra bakarız:

```js
if (current === answer) state = 'won'
else if (guesses.length === TRIES) state = 'lost'
```

Tahmin cevapla aynıysa kazandın; değilse ve bu altıncı tahminse kaybettin. Artık `state` altı tahminden sonra
yazmayı zaten durdurduğu için, Enter kuralındaki `guesses.length < TRIES` şartına gerek kalmıyor; onu siliyoruz.

**Oyun bitince tuşlar.** Harfler artık yazılmamalı, ama Enter bir anlam taşımaya devam etmeli: yeni kelime. Bu
kontrolü `type()`'ın **en başına** koyarız; böylece her tuşun anlamı tek bir yerde durur:

```js
if (state !== 'playing') {
  if (key === 'Enter') reset()
  return
}
```

`!==` "eşit değil" demektir: "oyun sürmüyorsa: Enter'sa yeniden başlat; hangi tuş olursa olsun `return` ile çık,
aşağıdaki harf yazma kodlarına hiç inme".

**Mesajı seçmek.** Önce varsayılan mesajı bir **değişkene** koyarız (`let`, çünkü değişebilir), sonra duruma göre
üstüne yazarız:

```js
let message = 'Guess the five-letter word'
if (state === 'won') message = 'You got it! Enter for a new word'
```

Kaybedince mesaj parçalardan `+` ile birleştirilir: `'It was ' + answer.toUpperCase() + '. Enter for a new word'`.
`toUpperCase()` kelimeyi büyük harfe çevirir: `'crane'` → `'CRANE'`. Tırnak içindeki boşluklara dikkat.

# --task--

1. Add `state` (`'playing'` in `reset()`). After adding a guess: if it is the answer, the state becomes `'won'`; else, after
   the sixth guess, `'lost'`. Remove `&& guesses.length < TRIES` from the Enter rule: once six guesses are in, the
   state is no longer `'playing'`, so the check below already stops a seventh.
2. At the start of `type()`, when the game is over, Enter calls `reset()` and every key is otherwise ignored.
3. Draw a message centered at `y = 393` (white, `'bold 16px sans-serif'`): `Guess the five-letter word` while playing,
   `You got it! Enter for a new word` when won, and `It was CRANE. Enter for a new word` (the answer in capitals) when lost.

# --task-tr--

1. `let current` satırının hemen altına ekle:

   ```js
   let state // 'playing', 'won' or 'lost'
   ```

2. `reset()` fonksiyonunda `current = ''` satırının altına ekle:

   ```js
     state = 'playing'
   ```

3. `type(key)` fonksiyonunu şöyle değiştir:

   ```js
   function type(key) {
     if (state !== 'playing') {        // ← yeni
       if (key === 'Enter') reset()    // ← yeni
       return                          // ← yeni
     }                                 // ← yeni
     if (key === 'Backspace') current = current.slice(0, -1)
     else if (/^[a-z]$/.test(key) && current.length < 5) current += key
     else if (key === 'Enter' && current.length === 5) {  // ← değişti (&& guesses.length < TRIES silindi)
       guesses.push({ word: current, marks: score(current, answer) })
       if (current === answer) state = 'won'                // ← yeni
       else if (guesses.length === TRIES) state = 'lost'    // ← yeni
       current = ''
     }
   }
   ```

   `current = ''` satırı durum kontrollerinden **sonra** kalmalı; yoksa `current === answer` hiç doğru olmaz.

4. `draw()` fonksiyonunun sonunda, dış `for` döngüsünü kapatan `}`'den sonra ve fonksiyonun kapanış `}`'sinden önce
   bir satır boşluk bırakıp mesajı ekle:

   ```js
     ctx.font = 'bold 16px sans-serif'
     ctx.fillStyle = 'white'
     let message = 'Guess the five-letter word'
     if (state === 'won') message = 'You got it! Enter for a new word'
     if (state === 'lost') message = 'It was ' + answer.toUpperCase() + '. Enter for a new word'
     ctx.fillText(message, canvas.width / 2, 393)
   ```

   `ctx.textAlign` zaten `'center'` olduğu için mesaj canvas'ın ortasına gelir.

5. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. Izgaranın altında `Guess the five-letter word` yazmalı.
   Kazanınca ya da altı tahmini bitirince mesaj değişmeli, Enter yeni oyun başlatmalı. Alttaki kontrollerin hepsi
   yeşil olmalı. Mesaj kontrolü kırmızıysa yazıları nokta, ünlem ve boşluklarıyla birlikte harf harf karşılaştır.

# --tests--

Guessing the word should win and stop the typing.
tr: Kelimeyi bilmek kazandırmalı ve yazmayı durdurmalı.

```js
answer = 'crane'
for (const k of 'crane') $.press(k)
$.press('Enter')
assert.strictEqual(state, 'won')
$.press('x')
assert.strictEqual(current, '')
$.tick(1)
assert.include($.texts(), 'You got it! Enter for a new word')
```

Six wrong guesses should lose and show the answer.
tr: Altı yanlış tahmin kaybettirmeli ve cevabı göstermeli.

```js
answer = 'crane'
for (let i = 0; i < 6; i++) {
  assert.strictEqual(state, 'playing')
  for (const k of 'stool') $.press(k)
  $.press('Enter')
}
assert.strictEqual(state, 'lost')
$.tick(1)
assert.include($.texts(), 'It was CRANE. Enter for a new word')
```

Enter should start a new word when the game is over.
tr: Oyun bittiğinde Enter yeni bir kelime başlatmalı.

```js
$.tick(1)
assert.include($.texts(), 'Guess the five-letter word')
answer = 'crane'
for (const k of 'crane') $.press(k)
$.press('Enter')
$.press('Enter')
assert.deepEqual([state, guesses.length, current], ['playing', 0, ''])
assert.include(WORDS, answer)
```

# --solution--

```js
// Word guessing game, step by step.
// The page already has <canvas id="game" width="360" height="560"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const WORDS = ['apple', 'beach', 'brain', 'bread', 'brick', 'chair', 'chess', 'clock', 'cloud', 'crane', 'dance', 'dream',
  'drink', 'eagle', 'earth', 'flame', 'fruit', 'ghost', 'glass', 'grape', 'green', 'heart', 'horse', 'house', 'juice',
  'knife', 'laugh', 'lemon', 'light', 'magic', 'money', 'mouse', 'music', 'night', 'ocean', 'paint', 'party', 'piano',
  'pilot', 'plane', 'plant', 'pride', 'queen', 'radio', 'river', 'robot', 'sheep', 'shirt', 'smile', 'snake', 'space',
  'spoon', 'storm', 'sugar', 'table', 'tiger', 'toast', 'train', 'water', 'whale', 'world', 'zebra']
const TRIES = 6
const SIZE = 56 // one letter tile
const GAP = 6
const LEFT = (canvas.width - 5 * SIZE - 4 * GAP) / 2
const TOP = 12
const COLORS = { green: '#16a34a', yellow: '#ca8a04', gray: '#3f3f46' }

let answer
let guesses // the finished guesses, each { word, marks }
let current // the letters typed so far
let state // 'playing', 'won' or 'lost'

function reset() {
  answer = WORDS[Math.floor(Math.random() * WORDS.length)]
  guesses = []
  current = ''
  state = 'playing'
}

// Mark each letter: green in the right place, yellow somewhere else in the word, gray not (or not that many times).
function score(guess, word) {
  const marks = Array(5).fill('gray')
  const left = {} // letters of the word not matched by a green
  for (let i = 0; i < 5; i++) {
    if (guess[i] === word[i]) marks[i] = 'green'
    else left[word[i]] = (left[word[i]] || 0) + 1
  }
  for (let i = 0; i < 5; i++) {
    if (marks[i] !== 'green' && left[guess[i]] > 0) {
      marks[i] = 'yellow'
      left[guess[i]] -= 1
    }
  }
  return marks
}

function type(key) {
  if (state !== 'playing') {
    if (key === 'Enter') reset()
    return
  }
  if (key === 'Backspace') current = current.slice(0, -1)
  else if (/^[a-z]$/.test(key) && current.length < 5) current += key
  else if (key === 'Enter' && current.length === 5) {
    guesses.push({ word: current, marks: score(current, answer) })
    if (current === answer) state = 'won'
    else if (guesses.length === TRIES) state = 'lost'
    current = ''
  }
}

document.addEventListener('keydown', (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
  if (key === 'Enter' || key === 'Backspace' || /^[a-z]$/.test(key)) {
    event.preventDefault()
    type(key)
  }
})

function draw() {
  ctx.fillStyle = '#18181b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  for (let row = 0; row < TRIES; row++) {
    const guess = guesses[row]
    const letters = guess ? guess.word : row === guesses.length ? current : ''
    for (let i = 0; i < 5; i++) {
      const x = LEFT + i * (SIZE + GAP)
      const y = TOP + row * (SIZE + GAP)
      if (guess) {
        ctx.fillStyle = COLORS[guess.marks[i]]
        ctx.fillRect(x, y, SIZE, SIZE)
      } else {
        ctx.strokeStyle = letters[i] ? '#a1a1aa' : '#3f3f46'
        ctx.lineWidth = 2
        ctx.strokeRect(x + 1, y + 1, SIZE - 2, SIZE - 2)
      }
      if (letters[i]) {
        ctx.fillStyle = 'white'
        ctx.font = 'bold 28px sans-serif'
        ctx.fillText(letters[i].toUpperCase(), x + SIZE / 2, y + SIZE / 2 + 1)
      }
    }
  }

  ctx.font = 'bold 16px sans-serif'
  ctx.fillStyle = 'white'
  let message = 'Guess the five-letter word'
  if (state === 'won') message = 'You got it! Enter for a new word'
  if (state === 'lost') message = 'It was ' + answer.toUpperCase() + '. Enter for a new word'
  ctx.fillText(message, canvas.width / 2, 393)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
