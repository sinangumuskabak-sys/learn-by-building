---
title: Lives and the end
title_tr: Canlar ve son
skills: [game.state]
---

# --explanation--

So far nothing bad happens when a word lands. Now each landed word costs a **life**, and after three the game is over.

In `update()` we first collect the words that crossed the ground, then keep the rest:

```js
const landed = words.filter((w) => w.y > GROUND)
words = words.filter((w) => w.y <= GROUND)
lives -= landed.length
```

Two words could land in the same frame, so we take away `landed.length`, not 1. If the target was among them, the lock goes
too.

When `state` is `'over'`, `update` returns at once, so the words freeze where they are, and `type` ignores keys. Enter starts
a new game with `reset()`.

Each finished word scores one point per letter. Long words are harder, so they are worth more.

The lives are shown as hearts: `'♥'.repeat(lives)` makes a string of that many hearts.

# --explanation-tr--

**Bu adımda:** oyuna can ve puan ekleyeceğiz. Sol üstte `Score 0`, sağ üstte üç kalp (`♥♥♥`) göreceksin. Yere düşen
her kelime bir kalp götürecek; üç kalp bitince ekranın ortasında `Game over` yazacak ve **Enter** yeni oyun başlatacak.

**Yere düşenleri ayırmak.** `update()` içinde önce çizgiyi geçen kelimeleri toplar, sonra geri kalanları tutarız:

```js
const landed = words.filter((w) => w.y > GROUND)  // düşenler
words = words.filter((w) => w.y <= GROUND)        // kalanlar
lives -= landed.length
```

Aynı karede iki kelime birden düşebilir; bu yüzden 1 değil, `landed.length` (düşenlerin sayısı) kadar can gider.
`landed.includes(target)` → "düşenlerin arasında hedef kelime var mı?" Varsa kilit de bırakılır (`target = null`).
Hiç düşen yoksa (`landed.length === 0`) `return` ile `update`'ten erkenden çıkarız; yapılacak başka iş yok.

**Oyunun durumu (`state`).** `state` değişkeni oyunun hangi hâlde olduğunu bir yazıyla tutar: `'playing'` (oynanıyor) ya
da `'over'` (bitti). Durum `'over'` iken:

- `update` en başta `if (state !== 'playing') return` ile hemen çıkar; kelimeler olduğu yerde donar.
- `type` da aynı satırla tuşları yok sayar.
- `keydown` dinleyicisinde Enter'a basılırsa `reset()` çağrılır ve oyun baştan başlar.
  `return reset()` → "`reset()`'i çalıştır ve dinleyiciden çık"; aşağıdaki harf kontrolüne hiç gelinmez.

`lives <= 0` olunca canı `0`'a sabitleriz (eksiye düşüp kalp çizimini bozmasın) ve durumu `'over'` yaparız.

**Puan.** Biten her kelime harf sayısı kadar puan getirir: `score += target.text.length`. Uzun kelime daha zor, daha
değerli.

**Kalpleri çizmek.** `'♥'.repeat(3)` → `'♥♥♥'`: bir yazıyı verilen sayı kadar tekrar eder. `+` iki yazıyı yan yana
ekler: `'Score ' + 12` → `'Score 12'`. `ctx.textAlign = 'right'` yazının **sağ ucunu** verilen `x`'e, `'center'` ise
**ortasını** koyar. `canvas.width / 2` canvas'ın tam ortasıdır (`/` bölme).

**Yarı saydam panel.** `'rgba(2, 6, 23, 0.85)'` bir renk yazımıdır: kırmızı, yeşil, mavi miktarları (0–255) ve sonda
**saydamlık** (0 görünmez, 1 tam dolu). 0.85 ile arkadaki kelimeler hafifçe görünür kalır.

# --task--

1. Add `lives`, `score` and `state` (`3`, `0` and `'playing'` in `reset()`).
2. `type` works only while `'playing'`, and a finished word adds its length to `score`.
3. `update` works only while `'playing'`. Words below `GROUND` are removed and each costs a life; release the target if it is
   one of them. At `0` lives, set `state = 'over'`.
4. Enter in `'over'` calls `reset()`.
5. Draw `Score 12` at `(10, 22)` (white, `'bold 16px sans-serif'`), the hearts right-aligned at `(canvas.width - 10, 22)`, and
   when over, on a dark panel (`'rgba(2, 6, 23, 0.85)'`, from `(40, 105)`, `canvas.width - 80` by `120`), `Game over` (`'bold 26px sans-serif'`) at `y = 140` and `Press Enter to play again` (`'18px sans-serif'`) at
   `y = 175`, centered.

# --task-tr--

1. `const GROUND = 330 ...` satırının yorumunu güncelle:

   ```js
   const GROUND = 330 // a word that falls past this line costs a life
   ```

2. Üç değişken ekle: `let typed ...` satırının altına `let lives` ve `let score`, `let spawnTimer` satırının altına
   `let state ...`. O bölüm şöyle olmalı:

   ```js
   let words // { text, x, y }
   let target // the word being typed, or null
   let typed // how many letters of the target are typed
   let lives
   let score
   let spawnTimer
   let state // 'playing' or 'over'
   ```

3. `reset()` şöyle olmalı:

   ```js
   function reset() {
     words = []
     target = null
     typed = 0
     lives = 3          // ← yeni
     score = 0          // ← yeni
     spawnTimer = 0
     state = 'playing'  // ← yeni
   }
   ```

4. `type(key)` fonksiyonunun **ilk satırı** olarak şunu ekle:

   ```js
     if (state !== 'playing') return
   ```

   Aynı fonksiyonda kelime bitince puan ver; sondaki `if` şöyle olmalı:

   ```js
     if (typed === target.text.length) {
       words = words.filter((w) => w !== target)
       score += target.text.length // ← yeni
       target = null
     }
   ```

5. `update()`'i şöyle değiştir (baştaki satır yeni; `if (target && ...)` satırı silindi, yerine can hesabı geldi):

   ```js
   function update() {
     if (state !== 'playing') return // ← yeni
     spawnTimer -= 1
     if (spawnTimer <= 0) {
       spawn()
       spawnTimer = SPAWN_EVERY
     }
     for (const w of words) w.y += SPEED
     const landed = words.filter((w) => w.y > GROUND) // ← yeni
     if (landed.length === 0) return                  // ← yeni
     words = words.filter((w) => w.y <= GROUND)
     if (landed.includes(target)) target = null       // ← yeni
     lives -= landed.length                           // ← yeni
     if (lives <= 0) {                                // ← yeni
       lives = 0
       state = 'over'
     }
   }
   ```

6. `keydown` dinleyicisinin **ilk satırı** olarak Enter'ı ekle:

   ```js
   document.addEventListener('keydown', (event) => {
     if (state === 'over' && event.key === 'Enter') return reset() // ← yeni
     const key = event.key.toLowerCase()
   ```

7. `draw()`'da kelimeleri çizen `for` döngüsünün kapanış `}`'sinden sonra, fonksiyonun son `}`'sinden önce şunu ekle
   (kalp işaretini buradan kopyala):

   ```js
     ctx.fillStyle = 'white'
     ctx.font = 'bold 16px sans-serif'
     ctx.fillText('Score ' + score, 10, 22)
     ctx.textAlign = 'right'
     ctx.fillText('♥'.repeat(lives), canvas.width - 10, 22)

     if (state === 'over') {
       ctx.fillStyle = 'rgba(2, 6, 23, 0.85)'
       ctx.fillRect(40, 105, canvas.width - 80, 120)
       ctx.fillStyle = 'white'
       ctx.textAlign = 'center'
       ctx.font = 'bold 26px sans-serif'
       ctx.fillText('Game over', canvas.width / 2, 140)
       ctx.font = '18px sans-serif'
       ctx.fillText('Press Enter to play again', canvas.width / 2, 175)
     }
   ```

8. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. Birkaç kelimeyi düşmeye bırak: kalpler azalmalı, üçüncüde
   `Game over` çıkmalı; **Enter** yeniden başlatmalı. Alttaki kontrollerin hepsi yeşil olmalı. Kalp kontrolü kırmızıysa
   `♥` işaretini kopyalayarak yapıştırdığından emin ol.

# --tests--

A word that lands should cost a life.
tr: İnen bir kelime bir cana mal olmalı.

```js
spawnTimer = 1000
assert.strictEqual(lives, 3)
words = [{ text: 'cat', x: 10, y: GROUND }, { text: 'sun', x: 100, y: 50 }]
$.press('c')
$.tick(1)
assert.strictEqual(lives, 2, 'a word that lands costs a life')
assert.isNull(target)
assert.lengthOf(words, 1)
```

Words should score a point per letter; losing the last life should end and freeze the game, and Enter should restart it.
tr: Kelimeler harf başına puan getirmeli; son canı kaybetmek oyunu bitirip dondurmalı, Enter yeniden başlatmalı.

```js
spawnTimer = 1000
words = [{ text: 'sun', x: 10, y: 50 }]
$.press('s')
$.press('u')
$.press('n')
assert.strictEqual(score, 3, 'one point per letter')
words = [1, 2, 3].map((i) => ({ text: 'cat', x: i * 50, y: GROUND }))
$.tick(1)
assert.strictEqual(lives, 0)
assert.strictEqual(state, 'over')
const count = words.length
$.tick(500)
assert.lengthOf(words, count, 'nothing moves after the game is over')
$.tick(1)
assert.include($.texts(), 'Game over')
$.press('Enter')
assert.strictEqual(state, 'playing')
assert.strictEqual(lives, 3)
assert.strictEqual(score, 0)
```

The score and the hearts should be drawn.
tr: Puan ve kalpler çizilmeli.

```js
$.tick(1)
assert.include($.texts(), 'Score 0')
assert.include($.texts(), '♥♥♥')
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
const SPEED = 0.35
const SPAWN_EVERY = 138
const FONT = 'bold 20px monospace'

let words // { text, x, y }
let target // the word being typed, or null
let typed // how many letters of the target are typed
let lives
let score
let spawnTimer
let state // 'playing' or 'over'

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
  spawnTimer = 0
  state = 'playing'
}

function type(key) {
  if (state !== 'playing') return
  if (!target) {
    // Lock on to the lowest word starting with this letter: it is the most urgent.
    const options = words.filter((w) => w.text[0] === key).sort((a, b) => b.y - a.y)
    if (options.length === 0) return
    target = options[0]
    typed = 0
  }
  if (target.text[typed] !== key) return
  typed += 1
  if (typed === target.text.length) {
    words = words.filter((w) => w !== target)
    score += target.text.length
    target = null
  }
}

function update() {
  if (state !== 'playing') return
  spawnTimer -= 1
  if (spawnTimer <= 0) {
    spawn()
    spawnTimer = SPAWN_EVERY
  }
  for (const w of words) w.y += SPEED
  const landed = words.filter((w) => w.y > GROUND)
  if (landed.length === 0) return
  words = words.filter((w) => w.y <= GROUND)
  if (landed.includes(target)) target = null
  lives -= landed.length
  if (lives <= 0) {
    lives = 0
    state = 'over'
  }
}

document.addEventListener('keydown', (event) => {
  if (state === 'over' && event.key === 'Enter') return reset()
  const key = event.key.toLowerCase()
  if (key.length === 1 && key >= 'a' && key <= 'z') {
    event.preventDefault()
    type(key)
  }
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
  ctx.fillText('Score ' + score, 10, 22)
  ctx.textAlign = 'right'
  ctx.fillText('♥'.repeat(lives), canvas.width - 10, 22)

  if (state === 'over') {
    ctx.fillStyle = 'rgba(2, 6, 23, 0.85)'
    ctx.fillRect(40, 105, canvas.width - 80, 120)
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.font = 'bold 26px sans-serif'
    ctx.fillText('Game over', canvas.width / 2, 140)
    ctx.font = '18px sans-serif'
    ctx.fillText('Press Enter to play again', canvas.width / 2, 175)
  }
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
