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

**Bu adımda:** kelimenin altına 26 harflik bir ekran klavyesi çizeceğiz (9, 9 ve 8 tuşluk üç satır). Telefonda da
oynanabilecek: tuşa dokununca o harf tahmin edilir. Tuşlar bildiklerini de gösterecek: kelimede olan harf **yeşil**,
ıska olan harf **gri**, henüz denenmeyenler açık renk.

**Neden kendi klavyemiz?** Telefon, canvas için klavye açmaz. Bu yüzden tuşları kendimiz çizer, dokunuşları kendimiz
yakalarız.

**`keyRect(i)`: `i`. tuşun yeri.** Tuşları `LETTERS` yazısındaki sırayla numaralarız (A = 0, B = 1, ... Z = 25).

- Satırı: `Math.floor(i / 9)` → 9'a bölüp aşağı yuvarla (`i = 10` → satır 1).
- Satırdaki yeri: `i % 9` → 9'a bölümden kalan (`10 % 9` → 1).
- Son satırda sadece 8 tuş var ve **ortalanmış** daha güzel durur. Bu yüzden her satır kendi sol kenarını kaç tuşu
  olduğuna göre hesaplar: `const inRow = row === 2 ? 8 : 9` ("üçüncü satırsa 8, değilse 9"; `? :` kısa bir `if`).
  Tuşların ve aralarındaki 4 piksellik boşlukların toplam genişliğini canvas'ın eninden çıkarıp ikiye böleriz.

Fonksiyon sonuç olarak `{ x, y }` **nesnesi** verir (`return`): tuşun sol üst köşesi. Hem çizim hem tıklama aynı
`keyRect`'i kullanır; böylece gördüğün tuş ile bastığın tuş asla birbirini tutmazlık etmez.

**Tıklama bir tuşun içinde mi?** Nokta tuşun sol ve sağ kenarı arasındaysa **ve** (`&&`) üst ve alt kenarı
arasındaysa içindedir:

```js
x >= k.x && x < k.x + KEY_W && y >= k.y && y < k.y + KEY_H
```

`>=` "büyük ya da eşit", `<` "küçük" demektir. Tuşların arasındaki küçük boşluk hiçbir tuşa ait değildir; kalın parmakla
kenara basınca yanlış harfe gitmez. Tıklamada 26 tuşu bir `for` döngüsüyle tek tek sorarız. `LETTERS[i]` yazının
`i`. harfidir.

Dokunulan nokta önce canvas piksellerine çevrilir: canvas ekranda farklı boyda görünebildiği için
`getBoundingClientRect()` ile ekrandaki yerini ve boyunu alıp oranlarız. Oyun bittiyse tıklama eskisi gibi yeni kelime
başlatır.

**Tuş rengi.** Önce varsayılan açık renk: `let color = '#e7e5e4'`. Harf denendiyse, kelimede varsa yeşil, yoksa gri:

```js
if (guessed.has(letter)) color = word.includes(letter) ? '#86efac' : '#a8a29e'
```

# --task--

1. Add `KEY_W = 48`, `KEY_H = 34` and `KEYS_Y = 360`.
2. Write `keyRect(i)`: `{ x, y }` of key `i`, in rows of 9 (the last row has 8), 4 pixels apart horizontally and 6
   vertically, each row centered.
3. On `pointerdown` while playing, guess the letter of the key under the pointer (after the game, a click still starts a new
   word).
4. Draw each key: `'#86efac'` if guessed and in the word, `'#a8a29e'` if guessed and not, otherwise `'#e7e5e4'`, with its
   letter centered in `'#1f2937'`, `'bold 18px sans-serif'`, at `k.y + 24`.

# --task-tr--

1. `const MAX_WRONG = 6` satırının hemen altına klavye ölçülerini ekle:

   ```js
   const KEY_W = 48
   const KEY_H = 34
   const KEYS_Y = 360
   ```

2. Önceki adımdaki tıklama dinleyicisini **sil**:

   ```js
   canvas.addEventListener('pointerdown', () => {
     if (state !== 'playing') newWord()
   })
   ```

   ve aynı yere şunları yaz:

   ```js
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
   ```

3. `draw()` fonksiyonunun en sonunda, `if (state !== 'playing') { ... }` bloğunu kapatan `}`'den sonra ve
   fonksiyonun kapanış `}`'sinden önce bir satır boşluk bırakıp tuşları çiz:

   ```js
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
   ```

   `ctx.textAlign` daha önce `'center'` yapıldığı için harf tuşun ortasına gelir.

4. **Çalıştır**'a bas. Kelimenin altında A'dan Z'ye üç satırlık bir klavye görmelisin, son satır ortalı. Oynamak için
   önce oyuna tıkla, sonra tuşlara tıkla: kelimede olan harfler yeşile, olmayanlar griye dönmeli. Alttaki
   kontrollerin hepsi yeşil olmalı. Konum kontrolü kırmızıysa `left` formülündeki `+ 4`'ü kontrol et.

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
