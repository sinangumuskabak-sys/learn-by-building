---
title: Green, yellow and gray
title_tr: Yeşil, sarı ve gri
skills: [prog.arrays, prog.loops]
---

# --explanation--

Scoring a guess sounds easy: green if the letter is in the right place, yellow if it is somewhere else in the word, gray
if it is not in the word at all. But what about **repeated letters**? If the answer is `crane` and you guess `eerie`, only
the last `e` is right. The other two must be gray, because the word has only one `e`, and it is already accounted for.

The rule is: each letter of the answer can only be "used" once. Two passes get it right:

1. Mark all the greens. Every letter of the answer that was **not** matched by a green goes into a count of letters that
   are still available: `{ r: 1, a: 1, n: 1 }`.
2. For every other letter of the guess, if it is still available, mark it yellow and take one from its count; otherwise
   it stays gray.

Greens must come first. Otherwise an early yellow could use up a letter that a later green needed. Counting with an object
(`left[letter] = (left[letter] || 0) + 1`) is a small **frequency table**, a tool you will use again and again.

The answer is picked at random from a word list, and Enter submits a full guess, which fills its row with colors.

# --explanation-tr--

**Bu adımda:** oyun gizli bir kelime seçecek. 5 harf yazıp **Enter**'a basınca tahminin o satıra yerleşir ve her
kutu renklenir: **yeşil** harf doğru yerde, **sarı** harf kelimede var ama başka yerde, **gri** harf kelimede yok.
Sonraki tahmin bir alt satıra yazılır.

**Gizli kelimeyi seçmek.** Kelimeler bir **dizide** (array) durur: köşeli parantez içinde, virgülle ayrılmış liste.
`WORDS[0]` ilk kelime (sayma 0'dan başlar), `WORDS.length` kelime sayısıdır. Rastgele seçmek için:

```js
WORDS[Math.floor(Math.random() * WORDS.length)]
```

`Math.random()` 0 ile 1 arasında (1 hariç) rastgele bir ondalık sayı verir; kelime sayısıyla çarpıp
`Math.floor` ile aşağı yuvarlayınca 0 ile son sıra arasında rastgele bir **tam sayı** çıkar.

**Nesne (object).** Birkaç bilgiyi adlarıyla bir arada tutar: `{ word: 'caper', marks: [...] }`. İçindeki bilgiye
**alan** denir, nokta ile okunur: `guess.word`. `COLORS = { green: '#16a34a', ... }` da bir nesne; `COLORS['green']`
ya da `COLORS[ad]` diye köşeli parantezle de okunabilir. Her tahmini böyle bir nesne olarak `guesses` dizisine
`push` ile ekleriz (`push` = sona ekle).

**Puanlamanın zor yanı: tekrar eden harfler.** Cevap `crane`, tahmin `eerie` olsun. Sadece sondaki `e` doğru; öteki
iki `e` **gri** olmalı, çünkü kelimede tek `e` var ve o zaten kullanıldı. Kural: cevaptaki her harf **bir kez**
kullanılabilir. İki turla doğru sonuç çıkar:

1. Önce bütün yeşilleri işaretle. Yeşille eşleşmeyen cevap harflerini say: `{ r: 1, a: 1, n: 1 }` gibi. Buna
   **sıklık tablosu** denir.
2. Sonra yeşil olmayan her tahmin harfine bak: tabloda hâlâ varsa sarı yap ve sayısından 1 düş; yoksa gri kalsın.

Yeşiller önce gelmeli; yoksa öndeki bir sarı, arkadaki yeşilin ihtiyaç duyduğu harfi harcayabilir.

**Yeni parçalar:**

- `Array(5).fill('gray')` → 5 elemanlı, hepsi `'gray'` olan bir dizi.
- `left[word[i]] = (left[word[i]] || 0) + 1` → bu harfin sayısını 1 artır. Harf tabloda henüz yoksa değeri
  `undefined`'dır; `|| 0` "yoksa 0 kabul et" demektir.
- `!==` "**eşit değil mi?**", `-= 1` "1 azalt" demektir.
- `guess ? guess.word : row === guesses.length ? current : ''` → iç içe kısa `if`: "bu satırda bitmiş tahmin varsa
  onun kelimesi; yoksa bu satır sıradaki satırsa yazılmakta olan kelime; o da değilse boş".

# --task--

1. Add the `WORDS` list below, `COLORS = { green: '#16a34a', yellow: '#ca8a04', gray: '#3f3f46' }`, `answer`
   (a random word in `reset()`) and `guesses` (`[]`), each guess being `{ word, marks }`.

   ```js
   const WORDS = ['apple', 'beach', 'brain', 'bread', 'brick', 'chair', 'chess', 'clock', 'cloud', 'crane', 'dance', 'dream',
     'drink', 'eagle', 'earth', 'flame', 'fruit', 'ghost', 'glass', 'grape', 'green', 'heart', 'horse', 'house', 'juice',
     'knife', 'laugh', 'lemon', 'light', 'magic', 'money', 'mouse', 'music', 'night', 'ocean', 'paint', 'party', 'piano',
     'pilot', 'plane', 'plant', 'pride', 'queen', 'radio', 'river', 'robot', 'sheep', 'shirt', 'smile', 'snake', 'space',
     'spoon', 'storm', 'sugar', 'table', 'tiger', 'toast', 'train', 'water', 'whale', 'world', 'zebra']
   ```

2. Write `score(guess, word)` returning 5 marks with the two passes above.
3. Enter with 5 letters typed (and fewer than 6 guesses so far) adds the scored guess and clears `current`. Enter is now
   one of the keys `keydown` handles.
4. Draw each finished guess as full tiles in its marks' colors with white letters; typing goes into the row after the last
   guess.

# --task-tr--

1. `const ctx = canvas.getContext('2d')` satırından sonraki boş satırın altına, `const TRIES = 6`'nın **üstüne**
   kelime listesini ekle (kopyalayıp yapıştırabilirsin):

   ```js
   const WORDS = ['apple', 'beach', 'brain', 'bread', 'brick', 'chair', 'chess', 'clock', 'cloud', 'crane', 'dance', 'dream',
     'drink', 'eagle', 'earth', 'flame', 'fruit', 'ghost', 'glass', 'grape', 'green', 'heart', 'horse', 'house', 'juice',
     'knife', 'laugh', 'lemon', 'light', 'magic', 'money', 'mouse', 'music', 'night', 'ocean', 'paint', 'party', 'piano',
     'pilot', 'plane', 'plant', 'pride', 'queen', 'radio', 'river', 'robot', 'sheep', 'shirt', 'smile', 'snake', 'space',
     'spoon', 'storm', 'sugar', 'table', 'tiger', 'toast', 'train', 'water', 'whale', 'world', 'zebra']
   ```

2. `const TOP = 12` satırının hemen altına renkleri ekle:

   ```js
   const COLORS = { green: '#16a34a', yellow: '#ca8a04', gray: '#3f3f46' }
   ```

3. `let current` satırının **üstüne** iki değişken ekle:

   ```js
   let answer
   let guesses // the finished guesses, each { word, marks }
   ```

4. `reset()` fonksiyonunu şöyle değiştir:

   ```js
   function reset() {
     answer = WORDS[Math.floor(Math.random() * WORDS.length)]  // ← yeni
     guesses = []                                              // ← yeni
     current = ''
   }
   ```

5. `reset()`'in kapanış `}`'sinden sonra, `function type(key)`'den önce puanlama fonksiyonunu ekle:

   ```js
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
   ```

6. `type(key)` fonksiyonuna Enter kuralını ekle:

   ```js
   function type(key) {
     if (key === 'Backspace') current = current.slice(0, -1)
     else if (/^[a-z]$/.test(key) && current.length < 5) current += key
     else if (key === 'Enter' && current.length === 5 && guesses.length < TRIES) {  // ← yeni
       guesses.push({ word: current, marks: score(current, answer) })               // ← yeni
       current = ''                                                                 // ← yeni
     }                                                                              // ← yeni
   }
   ```

7. `keydown` dinleyicisinde `if (key === 'Backspace' || ...` satırının başına Enter'ı ekle:

   ```js
     if (key === 'Enter' || key === 'Backspace' || /^[a-z]$/.test(key)) {  // ← değişti
   ```

8. `draw()` içinde, `for (let row = 0; ...` döngüsünün içini şöyle değiştir (yorum satırı ve eski `letters` satırı
   gidiyor, çerçeve çizimi `else` içine giriyor):

   ```js
     for (let row = 0; row < TRIES; row++) {
       const guess = guesses[row]                                            // ← yeni
       const letters = guess ? guess.word : row === guesses.length ? current : ''  // ← değişti
       for (let i = 0; i < 5; i++) {
         const x = LEFT + i * (SIZE + GAP)
         const y = TOP + row * (SIZE + GAP)
         if (guess) {                                   // ← yeni
           ctx.fillStyle = COLORS[guess.marks[i]]       // ← yeni
           ctx.fillRect(x, y, SIZE, SIZE)               // ← yeni
         } else {                                       // ← yeni
           ctx.strokeStyle = letters[i] ? '#a1a1aa' : '#3f3f46'
           ctx.lineWidth = 2
           ctx.strokeRect(x + 1, y + 1, SIZE - 2, SIZE - 2)
         }                                              // ← yeni
         if (letters[i]) {
   ```

   `if (letters[i]) {` ile başlayan harf çizme bloğu ve altı aynı kalıyor.

9. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla, 5 harfli bir kelime yaz ve **Enter**'a bas: satır renklenmeli,
   yazmaya alt satırda devam etmelisin. Alttaki kontrollerin hepsi yeşil olmalı. Tekrar eden harf kontrolü kırmızıysa
   `score` içinde yeşillerin **ilk** döngüde işaretlendiğinden emin ol.

# --tests--

Letters in the right place should be green, elsewhere yellow, missing gray.
tr: Doğru yerdeki harfler yeşil, başka yerdekiler sarı, olmayanlar gri olmalı.

```js
assert.deepEqual(score('caper', 'crane'), ['green', 'yellow', 'gray', 'yellow', 'yellow'])
assert.deepEqual(score('crane', 'crane'), ['green', 'green', 'green', 'green', 'green'])
assert.deepEqual(score('stool', 'crane'), ['gray', 'gray', 'gray', 'gray', 'gray'])
```

Repeated letters should only count as often as they are in the word.
tr: Tekrarlanan harfler yalnızca kelimede olduğu kadar sayılmalı.

```js
assert.deepEqual(score('eerie', 'crane'), ['gray', 'gray', 'yellow', 'gray', 'green'], 'one e in crane, and it is the green one')
assert.deepEqual(score('sheep', 'eagle'), ['gray', 'gray', 'yellow', 'yellow', 'gray'], 'two e in eagle: two yellows')
assert.deepEqual(score('lolly', 'hello'), ['gray', 'yellow', 'green', 'green', 'gray'], 'both l of hello are used by greens')
```

Enter should submit a full guess and color its row.
tr: Enter dolu bir tahmini göndermeli ve satırını renklendirmeli.

```js
assert.include(WORDS, answer)
answer = 'crane'
for (const k of 'cap') $.press(k)
$.press('Enter')
assert.lengthOf(guesses, 0, 'not five letters yet')
for (const k of 'er') $.press(k)
$.press('Enter')
assert.lengthOf(guesses, 1)
assert.deepEqual(guesses[0], { word: 'caper', marks: ['green', 'yellow', 'gray', 'yellow', 'yellow'] })
assert.strictEqual(current, '')
$.tick(1)
assert.deepEqual($.rects('#16a34a').map((r) => [r.x, r.y, r.w]), [[28, 12, 56]])
assert.lengthOf($.rects('#ca8a04'), 3)
$.press('t')
$.tick(1)
const t = $.screen().filter((c) => c.op === 'fillText').pop()
assert.deepEqual([t.args[0], t.args[2]], ['T', 12 + 62 + 29], 'typing goes on in the second row')
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

function reset() {
  answer = WORDS[Math.floor(Math.random() * WORDS.length)]
  guesses = []
  current = ''
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
  if (key === 'Backspace') current = current.slice(0, -1)
  else if (/^[a-z]$/.test(key) && current.length < 5) current += key
  else if (key === 'Enter' && current.length === 5 && guesses.length < TRIES) {
    guesses.push({ word: current, marks: score(current, answer) })
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
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
