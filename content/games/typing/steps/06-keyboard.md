---
title: A keyboard that helps
title_tr: Yardım eden bir klavye
skills: [game.input, game.canvas]
---

# --explanation--

On a phone there is no keyboard, so we draw one: the three **QWERTY** rows, `'qwertyuiop'`, `'asdfghjkl'` and `'zxcvbnm'`,
each centered under the one above. Keeping the rows as strings makes the layout data, not code: `ROWS[row][i]` is the letter,
and `keyRect(row, i)` works out where it goes.

A tap on a key calls the same `type(key)` as the real keyboard, so every rule (locking on, mistakes, scoring) works the same
way on both.

The keyboard also **teaches**: the key for the next letter of the target lights up in yellow. Beginners can follow the light
while their fingers learn where the letters are, and it helps you notice when you have locked on to the wrong word.

# --explanation-tr--

**Bu adımda:** ekranın altına bir klavye çizeceğiz. Telefonda gerçek klavye olmadığı için harflere dokunarak yazabileceksin.
Ayrıca hedef kelimenin **sıradaki harfinin tuşu sarı yanacak**; parmakların harflerin yerini böyle öğrenecek.

**Klavyeyi veri olarak tutmak.** Klavyenin üç sırası (QWERTY düzeni) üç yazıdan oluşan bir listedir:

```js
const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']
```

`ROWS[1]` ikinci sıradır (`'asdfghjkl'`), `ROWS[1][0]` onun ilk harfi (`'a'`). Düzeni değiştirmek istersen yalnızca bu
listeyi değiştirirsin, çizim kodu aynı kalır.

**Tuş nereye gelir? `keyRect(row, i)`.** `row` sıra numarası, `i` o sıradaki tuşun numarası. Fonksiyon tuşun sol üst
köşesini `{ x, y }` nesnesi olarak **geri verir** (`return`).

- Tuşlar `KEY_W` = 44 piksel geniş ve aralarında 3 piksel boşluk var; yani her tuş bir öncekinden `KEY_W + 3` = 47 piksel
  sağda: `x = left + i * 47`.
- Sıralar `KEY_H` = 34 piksel yüksek ve aralarında 7 piksel var: `y = KEYS_Y + row * (KEY_H + 7)`.
- `left` sırayı **ortalar**. Sıranın toplam genişliği `harf sayısı × 47 - 3`'tür (son tuştan sonra boşluk yok). Canvas
  genişliğinden bunu çıkarıp ikiye bölersek iki yanda eşit boşluk kalır. Kodda `(canvas.width - uzunluk * 47 + 3) / 2`.
  İlk sıra için: `(480 - 470 + 3) / 2` = 6.5.

**Dokunulan tuşu bulmak.** `pointerdown` olayı ekrana dokunulduğunda (ya da fareyle tıklandığında) gelir. Olay yeri
**sayfaya göre** verir (`event.clientX`); `canvas.getBoundingClientRect()` canvas'ın sayfadaki kutusunu verir. Farkı alıp
ölçekleyerek canvas içindeki `x` ve `y`'yi buluruz (canvas ekranda büyütülmüş ya da küçültülmüş olabilir).

Sonra her tuşa bakarız: nokta tuşun kutusunun içinde mi?

```js
x >= k.x && x < k.x + KEY_W && y >= k.y && y < k.y + KEY_H
```

Dördü birden doğruysa (`&&` "ve") o tuşun harfiyle `type` çağrılır. Gerçek klavye de aynı `type`'ı çağırdığı için kilitlenme,
hata ve puan kuralları ikisinde de aynı çalışır. Oyun bittiyse dokunuş `reset()` ile yeni oyun başlatır.

`ROWS.forEach((keys, row) => { ... })` listenin her elemanı için `{ }` içini çalıştırır: `keys` o sıranın harfleri,
`row` sıranın numarası. İçteki `for` döngüsü o sıradaki her harfi gezer.

**Yol gösteren ışık.** `const next = target && target.text[typed] === keys[i]` → "bir hedef var **ve** onun sıradaki
harfi bu tuş". Doğruysa tuş sarı (`'#facc15'`) ve harfi koyu, değilse tuş koyu mavi ve harfi açık renk çizilir.

# --task--

1. Add `ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']`, `KEY_W = 44`, `KEY_H = 34` and `KEYS_Y = 350`.
2. Write `keyRect(row, i)`: keys 3 pixels apart, rows 7 pixels apart from `KEYS_Y`, each row centered.
3. On `pointerdown`: when the game is over, `reset()`; otherwise `type` the letter of the key under the pointer.
4. Draw each key as a `KEY_W` by `KEY_H` rectangle, `'#1e293b'` with its letter in `'#e2e8f0'`, or `'#facc15'` with its letter
   in `'#020617'` when it is the target's next letter (`'bold 18px sans-serif'`, centered, `k.y + 23`). The game over line
   becomes `Press Enter or tap to play again`.

# --task-tr--

1. `const FONT = 'bold 20px monospace'` satırının altına klavye ayarlarını ekle:

   ```js
   const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']
   const KEY_W = 44
   const KEY_H = 34
   const KEYS_Y = 350
   ```

2. `keydown` dinleyicisinin kapanışı olan `})` satırının altına şunları yaz:

   ```js
   // The on-screen keyboard, one row under another, each row centered.
   function keyRect(row, i) {
     const left = (canvas.width - ROWS[row].length * (KEY_W + 3) + 3) / 2
     return { x: left + i * (KEY_W + 3), y: KEYS_Y + row * (KEY_H + 7) }
   }

   canvas.addEventListener('pointerdown', (event) => {
     const rect = canvas.getBoundingClientRect()
     const x = ((event.clientX - rect.left) * canvas.width) / rect.width
     const y = ((event.clientY - rect.top) * canvas.height) / rect.height
     if (state === 'over') return reset()
     ROWS.forEach((keys, row) => {
       for (let i = 0; i < keys.length; i++) {
         const k = keyRect(row, i)
         if (x >= k.x && x < k.x + KEY_W && y >= k.y && y < k.y + KEY_H) type(keys[i])
       }
     })
   })
   ```

   `for (let i = 0; i < keys.length; i++)` → "`i` 0'dan başlasın, harf sayısından küçük olduğu sürece tekrarla, her turda
   1 artsın".

3. `draw()`'da oyun bitti panelinin son yazısını değiştir:

   ```js
       ctx.fillText('Press Enter or tap to play again', canvas.width / 2, 205) // ← değişti
     }
   ```

4. Aynı yerde, panelin `if`'ini kapatan `}`'den sonra ve `draw()`'un son `}`'sinden önce klavyeyi çiz:

   ```js
     ctx.textAlign = 'center'
     ctx.font = 'bold 18px sans-serif'
     ROWS.forEach((keys, row) => {
       for (let i = 0; i < keys.length; i++) {
         const k = keyRect(row, i)
         const next = target && target.text[typed] === keys[i]
         ctx.fillStyle = next ? '#facc15' : '#1e293b'
         ctx.fillRect(k.x, k.y, KEY_W, KEY_H)
         ctx.fillStyle = next ? '#020617' : '#e2e8f0'
         ctx.fillText(keys[i], k.x + KEY_W / 2, k.y + 23)
       }
     })
   ```

5. **Çalıştır**'a bas. Altta üç sıralı bir klavye görmelisin. Düşen bir kelimenin ilk harfine dokun: kelimenin sıradaki
   harfinin tuşu sarı yanmalı. Alttaki kontrollerin hepsi yeşil olmalı. Sarı tuş kontrolü kırmızıysa `keyRect`'teki
   `+ 3` ve `+ 7` sayılarını kontrol et.

# --tests--

The three rows should be laid out centered, with every letter on a key.
tr: Üç satır ortalı dizilmeli ve her harf bir tuşta olmalı.

```js
assert.deepEqual(keyRect(0, 0), { x: 6.5, y: 350 })
assert.deepEqual(keyRect(2, 6), { x: 77 + 6 * 47, y: 432 }, 'rows are centered')
$.tick(1)
for (const k of 'qwertyuiopasdfghjklzxcvbnm') assert.include($.texts(), k)
```

Tapping keys should type, and the next letter's key should light up.
tr: Tuşlara dokunmak yazmalı ve sıradaki harfin tuşu yanmalı.

```js
spawnTimer = 100000
words = [{ text: 'cat', x: 10, y: 50 }]
$.click(77 + 2 * 47 + 22, 432 + 17)
assert.strictEqual(target.text, 'cat', 'tapping c')
$.tick(1)
assert.deepEqual($.rects('#facc15').map(({ x, y }) => ({ x, y })), [{ x: 30, y: 391 }], 'the next letter, a, lights up')
$.click(30 + 22, 391 + 17)
assert.strictEqual(typed, 2)
```

A tap after the game is over should start again.
tr: Oyun bittikten sonra bir dokunuş yeniden başlatmalı.

```js
spawnTimer = 100000
words = [1, 2, 3].map((i) => ({ text: 'cat', x: i * 50, y: GROUND + 1 }))
$.tick(1)
assert.strictEqual(state, 'over')
$.click(240, 200)
assert.strictEqual(state, 'playing', 'a tap starts again')
$.tick(1)
assert.include($.texts(), 'Score 0 Level 1')
```

# --solution--

```js
// Typing game, step by step.
// The page already has <canvas id="game" width="480" height="480"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const WORDS = [
  'cat', 'sun', 'code', 'game', 'jump', 'fast', 'loop', 'byte', 'star', 'tree', 'rain', 'blue', 'fire', 'wind', 'moon',
  'array', 'pixel', 'mouse', 'score', 'level', 'robot', 'light', 'music', 'space', 'river', 'green', 'cloud', 'train',
  'planet', 'rocket', 'string', 'number', 'button', 'screen', 'window', 'random', 'object', 'player', 'dragon', 'puzzle',
  'keyboard', 'function', 'variable', 'computer', 'triangle', 'elephant', 'mountain', 'sandwich',
]
const GROUND = 330 // a word that falls past this line costs a life
const FONT = 'bold 20px monospace'
const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']
const KEY_W = 44
const KEY_H = 34
const KEYS_Y = 350

let words // { text, x, y }
let target // the word being typed, or null
let typed // how many letters of the target are typed
let lives
let score
let level
let cleared // words typed this game
let spawnTimer
let state // 'playing' or 'over'
let frames
let letters // correct letters typed
let mistakes
let best = Number(localStorage.getItem('typing-best')) || 0

// Faster and more often as the level goes up.
const speed = () => 0.25 + level * 0.1
const spawnEvery = () => Math.max(40, 150 - level * 12)

function spawn() {
  const text = WORDS[Math.floor(Math.random() * WORDS.length)]
  ctx.font = FONT
  const width = ctx.measureText(text).width
  words.push({ text, x: 10 + Math.random() * (canvas.width - 20 - width), y: 30 })
}

function reset() {
  words = []
  target = null
  typed = 0
  lives = 3
  score = 0
  level = 1
  cleared = 0
  spawnTimer = 0
  state = 'playing'
  frames = 0
  letters = 0
  mistakes = 0
}

function type(key) {
  if (state !== 'playing') return
  if (!target) {
    // Lock on to the lowest word starting with this letter: it is the most urgent.
    const options = words.filter((w) => w.text[0] === key).sort((a, b) => b.y - a.y)
    if (options.length === 0) {
      mistakes += 1
      return
    }
    target = options[0]
    typed = 0
  }
  if (target.text[typed] !== key) {
    mistakes += 1
    return
  }
  typed += 1
  letters += 1
  if (typed === target.text.length) {
    words = words.filter((w) => w !== target)
    score += target.text.length * level
    cleared += 1
    if (cleared % 10 === 0) level += 1
    target = null
  }
}

function gameOver() {
  state = 'over'
  if (score > best) {
    best = score
    localStorage.setItem('typing-best', best)
  }
}

function update() {
  if (state !== 'playing') return
  frames += 1
  spawnTimer -= 1
  if (spawnTimer <= 0) {
    spawn()
    spawnTimer = spawnEvery()
  }
  for (const w of words) w.y += speed()
  const landed = words.filter((w) => w.y > GROUND)
  if (landed.length === 0) return
  words = words.filter((w) => w.y <= GROUND)
  if (landed.includes(target)) target = null
  lives -= landed.length
  if (lives <= 0) {
    lives = 0
    gameOver()
  }
}

// Words per minute counts five letters as one word, the usual way.
const wpm = () => (frames === 0 ? 0 : Math.round(letters / 5 / (frames / 3600)))
const accuracy = () => (letters + mistakes === 0 ? 100 : Math.round((100 * letters) / (letters + mistakes)))

document.addEventListener('keydown', (event) => {
  if (state === 'over' && event.key === 'Enter') return reset()
  const key = event.key.toLowerCase()
  if (key.length === 1 && key >= 'a' && key <= 'z') {
    event.preventDefault()
    type(key)
  }
})

// The on-screen keyboard, one row under another, each row centered.
function keyRect(row, i) {
  const left = (canvas.width - ROWS[row].length * (KEY_W + 3) + 3) / 2
  return { x: left + i * (KEY_W + 3), y: KEYS_Y + row * (KEY_H + 7) }
}

canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height
  if (state === 'over') return reset()
  ROWS.forEach((keys, row) => {
    for (let i = 0; i < keys.length; i++) {
      const k = keyRect(row, i)
      if (x >= k.x && x < k.x + KEY_W && y >= k.y && y < k.y + KEY_H) type(keys[i])
    }
  })
})

function draw() {
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#7f1d1d'
  ctx.fillRect(0, GROUND + 4, canvas.width, 3)

  ctx.font = FONT
  ctx.textAlign = 'left'
  for (const w of words) {
    // The typed part in yellow, the rest in white right after it.
    const done = w === target ? w.text.slice(0, typed) : ''
    ctx.fillStyle = '#facc15'
    ctx.fillText(done, w.x, w.y)
    ctx.fillStyle = w === target ? '#ffffff' : '#cbd5e1'
    ctx.fillText(w.text.slice(done.length), w.x + ctx.measureText(done).width, w.y)
  }

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.fillText('Score ' + score + '  Level ' + level, 10, 22)
  ctx.textAlign = 'right'
  ctx.fillText('♥'.repeat(lives) + '  Best ' + best, canvas.width - 10, 22)

  if (state === 'over') {
    ctx.fillStyle = 'rgba(2, 6, 23, 0.85)'
    ctx.fillRect(40, 105, canvas.width - 80, 120)
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.font = 'bold 26px sans-serif'
    ctx.fillText('Game over', canvas.width / 2, 140)
    ctx.font = '18px sans-serif'
    ctx.fillText(wpm() + ' words per minute, ' + accuracy() + '% accurate', canvas.width / 2, 175)
    ctx.fillText('Press Enter or tap to play again', canvas.width / 2, 205)
  }

  ctx.textAlign = 'center'
  ctx.font = 'bold 18px sans-serif'
  ROWS.forEach((keys, row) => {
    for (let i = 0; i < keys.length; i++) {
      const k = keyRect(row, i)
      const next = target && target.text[typed] === keys[i]
      ctx.fillStyle = next ? '#facc15' : '#1e293b'
      ctx.fillRect(k.x, k.y, KEY_W, KEY_H)
      ctx.fillStyle = next ? '#020617' : '#e2e8f0'
      ctx.fillText(keys[i], k.x + KEY_W / 2, k.y + 23)
    }
  })
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
