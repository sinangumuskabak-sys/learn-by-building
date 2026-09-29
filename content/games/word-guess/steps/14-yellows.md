---
title: Right letter, wrong place
title_tr: Doğru harf, yanlış yer
skills: [prog.arrays, prog.loops]
---

# --goal--

Yellow means "in the word, somewhere else". The catch is repeated letters: each letter of the word can be used only
once. So we count the word's letters not taken by a green, and hand out yellows from that count.

# --goal-tr--

Sarı: harf kelimede **var ama başka yerde**. Kolay gibi, ama **tekrarlanan harflere** dikkat! Cevap `crane`, tahmin
`eerie` olsun. Sadece sondaki `e` doğru; diğer iki `e` **gri** olmalı, çünkü kelimede tek bir `e` var ve o zaten
kullanıldı.

Kural: kelimenin her harfi **bir kez** kullanılabilir. İki turda doğru yaparız:
1. Önce bütün yeşilleri işaretle. Yeşille eşleşmeyen kelime harflerini **say**: `{ r: 1, a: 1, n: 1 }` gibi.
2. Sonra kalan her tahmin harfi için: sayısı hâlâ varsa **sarı** yap ve sayıdan bir düş; yoksa gri kalır.

Yeşiller önce gelmeli; yoksa öndeki bir sarı, arkadaki bir yeşilin ihtiyaç duyduğu harfi kullanıp bitirebilirdi.

# --code--

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

# --meaning--

- `left` is an object used as a counting table: `left['r']` is how many `r`s of the word are still free.
- `(left[x] || 0) + 1` adds one, starting from 0 the first time (when `left[x]` is `undefined`).
- The second loop gives a yellow only while that letter is still free, and takes one away each time.

# --meaning-tr--

- `const left = {}` → boş bir **nesne**; burada bir **sayma tablosu** gibi kullanılıyor: `left['r']` → kelimede yeşille
  eşleşmemiş kaç `r` kaldı.
- İlk döngüde `else` → harf yeşil değilse, **kelimedeki** harfi (`word[i]`) tabloya say:
  - `left[word[i]] || 0` → o harf daha önce sayılmadıysa `undefined` gelir; `|| 0` onu **0** yapar.
  - `+ 1` → bir ekle. Böylece `{ r: 1, a: 1, n: 1 }` gibi bir tablo oluşur.
- İkinci döngü: `marks[i] !== 'green' && left[guess[i]] > 0` → bu harf yeşil **değilse ve** kelimede hâlâ boşta
  varsa: `marks[i] = 'yellow'` ve `left[guess[i]] -= 1` (bir **eksilt**).
- Böyle bir sayma tablosuna **sıklık tablosu** denir; çok işe yarar.

# --task--

Write the comment above `score`, add the `left` line and the `else` line in the first loop, and write the second loop
above `return marks`.

# --task-tr--

1. `function score` satırının **üstüne** yorum satırını yaz.
2. `const marks = ...` satırının altına `const left = {} ...` satırını yaz.
3. İlk döngüde `if (guess[i] === word[i]) ...` satırının altına `else` satırını yaz.
4. `return marks` satırının **üstüne** ikinci döngüyü yaz.
5. **Çalıştır**.

# --predict--

The answer is `crane` and the guess is `eerie`. How many `e`s get a colour?
- [ ] Three: all of them are in the word
- [x] One: the last `e` is green, the others gray
  `crane` has one `e`, and the green takes it. `r` is yellow.
- [ ] Two

# --predict-tr--

Cevap `crane`, tahmin `eerie`. Kaç `e` renk alır?
- [ ] Üçü de: hepsi kelimede var
- [x] Bir tane: son `e` yeşil, diğerleri gri
  `crane`'de tek bir `e` var ve onu yeşil alıyor. `r` ise sarı.
- [ ] İki tane

# --hint--

Greens first, in their own loop; yellows only in the second loop.

# --hint-tr--

Önce yeşiller, kendi döngülerinde; sarılar sadece ikinci döngüde.

# --tests--

Letters in the right place should be green, elsewhere yellow, missing gray.
tr: Doğru yerdeki harfler yeşil, başka yerdekiler sarı, olmayanlar gri olmalı.

```js
assert.deepEqual(score('caper', 'crane'), ['green', 'yellow', 'gray', 'yellow', 'yellow'])
assert.deepEqual(score('crane', 'crane'), ['green', 'green', 'green', 'green', 'green'])
assert.deepEqual(score('stool', 'crane'), ['gray', 'gray', 'gray', 'gray', 'gray'])
```

Repeated letters should only count as often as they are in the word.
tr: Tekrarlanan harfler kelimede olduğu kadar sayılmalı.

```js
assert.deepEqual(score('eerie', 'crane'), ['gray', 'gray', 'yellow', 'gray', 'green'], 'one e in crane, and it is the green one')
assert.deepEqual(score('sheep', 'eagle'), ['gray', 'gray', 'yellow', 'yellow', 'gray'], 'two e in eagle: two yellows')
assert.deepEqual(score('lolly', 'hello'), ['gray', 'yellow', 'green', 'green', 'gray'], 'both l of hello are used by greens')
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

let answer
let current // the letters typed so far

function reset() {
  answer = WORDS[Math.floor(Math.random() * WORDS.length)]
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
}

document.addEventListener('keydown', (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
  if (key === 'Backspace' || /^[a-z]$/.test(key)) {
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
    const letters = row === 0 ? current : ''
    for (let i = 0; i < 5; i++) {
      const x = LEFT + i * (SIZE + GAP)
      const y = TOP + row * (SIZE + GAP)
      ctx.strokeStyle = letters[i] ? '#a1a1aa' : '#3f3f46'
      ctx.lineWidth = 2
      ctx.strokeRect(x + 1, y + 1, SIZE - 2, SIZE - 2)
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
