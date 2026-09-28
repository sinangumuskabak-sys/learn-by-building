---
title: The gallows
title_tr: Darağacı
skills: [game.canvas, prog.functions]
---

# --explanation--

Every miss adds one part to the figure: head, body, two arms, two legs. Six parts, six misses.

We could write six `if`s (`if (wrong >= 1) drawHead()`, `if (wrong >= 2) ...`), but there is a neater way: keep the parts in
an **array of functions**, in order, and call the first `wrong` of them:

```js
const PARTS = [
  () => { /* the head */ },
  () => line(170, 130, 170, 200), // the body
  ...
]
for (let i = 0; i < wrong; i++) PARTS[i]()
```

Functions are values in JavaScript, so they can sit in an array like numbers do. Adding a seventh part (a rope, a face...)
means adding one line to the array, and nothing else changes.

A straight line on a canvas is a **path**: `beginPath()`, `moveTo` the start, `lineTo` the end, then `stroke()` it with the
current `strokeStyle` and `lineWidth`. A small `line(x1, y1, x2, y2)` helper keeps the drawing code short. The head is a
path too: an `arc` that goes all the way round, `Math.PI * 2`.

# --explanation-tr--

**Bu adımda:** darağacını çizeceğiz ve her yanlış tahminde çöp adama bir parça ekleyeceğiz: baş, gövde, iki kol, iki
bacak. Altı parça, altı ıska. Sağda kahverengi bir darağacı, yanlış harf yazdıkça da beliren bir adam göreceksin.

**Düz çizgi çizmek: yol (path).** Canvas'ta düz bir çizgi bir **yoldur**: yolu başlat, kalemi başlangıç noktasına
götür, bitiş noktasına çiz, sonra çizgiyi boya.

```js
ctx.beginPath()       // yeni bir yol başlat
ctx.moveTo(80, 270)   // kalemi kaldırıp buraya götür
ctx.lineTo(80, 50)    // buraya kadar çiz
ctx.stroke()          // çizgiyi boya
```

Çizginin rengi `ctx.strokeStyle`, kalınlığı `ctx.lineWidth` ile seçilir. Bu dört satırı her çizgi için tekrar
yazmamak için küçük bir yardımcı fonksiyon yazarız: `line(x1, y1, x2, y2)`. `x1, y1` başlangıç, `x2, y2` bitiş;
fonksiyona verilen bu değerlere **parametre** denir.

**Baş: bir daire.** Daire de bir yoldur: `ctx.arc(x, y, yarıçap, 0, Math.PI * 2)` merkezi ve yarıçapı verilen bir yay
çizer; `Math.PI * 2` tam bir tur demektir. `stroke()` ile sadece kenarını çizeriz.

**Parçaları bir listede tutmak.** Altı ayrı `if` yazabilirdik (`if (wrong >= 1) baş`, `if (wrong >= 2) gövde`...).
Daha düzgün bir yol var: parçaları sırayla bir **fonksiyon dizisinde** tutup ilk `wrong` tanesini çağırmak.

```js
const PARTS = [
  () => { /* baş */ },
  () => line(170, 130, 170, 200), // gövde
  ...
]
for (let i = 0; i < wrong; i++) PARTS[i]()
```

JavaScript'te fonksiyonlar da birer **değerdir**; sayılar gibi bir listede durabilirler. `() => ...` parametresiz
kısa bir fonksiyondur; `PARTS[0]` listedeki ilk fonksiyon, sonuna `()` koyunca **çağrılır**: `PARTS[0]()`.
Birden fazla satırı olan fonksiyon `{ }` içine yazılır (başınki gibi).

`for (let i = 0; i < wrong; i++)` → bir **döngü**: `i` 0'dan başlar, `wrong`'dan küçük olduğu sürece tekrarlar, her
turda `i++` ile 1 artar. `wrong` 2 ise `PARTS[0]()` ve `PARTS[1]()` çalışır: baş ve gövde. Yedinci bir parça (ip, yüz)
eklemek istersen listeye bir satır eklersin, başka hiçbir şey değişmez.

# --task--

1. Write `line(x1, y1, x2, y2)`, which strokes one straight line.
2. Draw the gallows every frame with `strokeStyle = '#78350f'` and `lineWidth = 6`: `(40, 270)`–`(220, 270)`,
   `(80, 270)`–`(80, 50)`, `(80, 50)`–`(170, 50)` and `(170, 50)`–`(170, 90)`.
3. Add `PARTS`, six functions in this order: the head (a circle at `(170, 110)`, radius `20`), the body `(170, 130)`–`(170, 200)`,
   the arms from `(170, 150)` to `(140, 180)` and `(200, 180)`, the legs from `(170, 200)` to `(145, 245)` and `(195, 245)`.
4. Draw the first `wrong` parts with `strokeStyle = '#1f2937'` and `lineWidth = 4`.

# --task-tr--

1. `keydown` dinleyicisinin kapanış `})`'sinden sonra, `function draw()`'dan önce bir satır boşluk bırakıp çizgi
   yardımcısını ekle:

   ```js
   function line(x1, y1, x2, y2) {
     ctx.beginPath()
     ctx.moveTo(x1, y1)
     ctx.lineTo(x2, y2)
     ctx.stroke()
   }
   ```

2. Hemen altına parça listesini ekle:

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
   ```

   Her elemandan sonra virgül var; listenin sonu `]` ile kapanıyor.

3. `draw()` içinde, arka planı boyayan `ctx.fillRect(...)` satırından sonra ve `ctx.fillStyle = '#1f2937'` ile başlayan
   yazı bölümünden önce bir satır boşluk bırakıp darağacını ve parçaları çiz:

   ```js
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
   ```

   Dört çizgi sırayla: taban, direk, üst kiriş, ipin sarktığı kısa çizgi.

4. **Çalıştır**'a bas. Sağda darağacını görmelisin. Oynamak için önce oyuna tıkla ve yanlış harfler yaz: her ıskada
   adama bir parça eklenmeli (önce baş, sonra gövde, kollar, bacaklar). Alttaki kontrollerin hepsi yeşil olmalı.
   Sıra kontrolü kırmızıysa `PARTS` içindeki satırların sırasını kontrol et.

# --tests--

The gallows should be four lines, and the first miss should draw the head.
tr: Darağacı dört çizgi olmalı ve ilk ıska başı çizmeli.

```js
$.tick(1)
const strokes = () => $.screen().filter((c) => c.op === 'stroke').length
assert.strictEqual(strokes(), 4, 'the gallows is four lines')
assert.lengthOf($.arcs(), 0)
wrong = 1
$.tick(1)
assert.strictEqual(strokes(), 5)
assert.deepEqual($.arcs().map(({ x, y, r }) => ({ x, y, r })), [{ x: 170, y: 110, r: 20 }], 'the head first')
```

Each miss should add exactly one part.
tr: Her ıska tam olarak bir parça eklemeli.

```js
const strokes = () => $.screen().filter((c) => c.op === 'stroke').length
for (let w = 0; w <= 6; w++) {
  wrong = w
  $.tick(1)
  assert.strictEqual(strokes(), 4 + w, 'one part per miss')
}
```

The parts should come in order: five misses draw the left leg but not the right one.
tr: Parçalar sırayla gelmeli: beş ıska sol bacağı çizer ama sağı çizmez.

```js
word = 'ZEBRA'
for (const key of 'qwtyu') $.press(key)
$.tick(1)
const lines = $.screen().filter((c) => c.op === 'lineTo').map((c) => c.args.join())
assert.include(lines, '145,245', 'five misses: the left leg')
assert.notInclude(lines, '195,245', 'but not the right leg yet')
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
