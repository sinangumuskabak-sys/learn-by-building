---
title: Words per minute
title_tr: Dakikada kelime
skills: [game.state, prog.functions]
---

# --explanation--

Typists measure themselves in **words per minute** (WPM). Words have different lengths, so the standard is to count every
**five letters** as one word. The time comes from the frames: at 60 frames a second, a minute is 3600 frames.

```js
const wpm = () => Math.round(letters / 5 / (frames / 3600))
```

Speed alone is not everything; **accuracy** matters too. Every key that did not help (a letter no word starts with, or the
wrong next letter) is a mistake, and accuracy is the share of keys that were right:

```js
Math.round((100 * letters) / (letters + mistakes))
```

Both functions have to be careful at the very start: before any key or frame they would divide by zero, and `0 / 0` in
JavaScript is `NaN`, which would show up on the screen as "NaN words per minute". So they return 0 WPM and 100% until there
is something to measure.

# --explanation-tr--

**Bu adımda:** hızını ve doğruluğunu ölçeceğiz. Oyun bittiğinde panelde `38 words per minute, 94% accurate` gibi bir satır
göreceksin: dakikada kaç kelime yazdığın ve basışlarının yüzde kaçının doğru olduğu.

**Dakikada kelime (WPM, words per minute).** Klavye kullananlar hızlarını böyle ölçer. Kelimelerin boyu farklı olduğu
için genel kural her **5 harfi** bir kelime saymaktır. Zamanı karelerden (frame) buluruz: saniyede 60 kare varsa bir dakika
60 × 60 = 3600 karedir.

```js
letters / 5 / (frames / 3600)
```

"Doğru harf sayısını 5'e böl (kaç kelime), sonra geçen dakikaya böl." `frames / 3600` kaç dakika geçtiğidir. Örnek:
1 dakikada 50 harf → 10 kelime → 10 WPM. `Math.round` sonucu en yakın tam sayıya yuvarlar (`9.6` → `10`).

**Doğruluk (accuracy).** Hız her şey değil. İşe yaramayan her tuş bir **hatadır** (`mistakes`): hiçbir kelimenin
başlamadığı bir harf ya da sıradaki harf olmayan bir harf. Doğruluk, basışların yüzde kaçının doğru olduğudur:

```js
Math.round((100 * letters) / (letters + mistakes))
```

3 doğru, 2 hata → `300 / 5` = 60, yani %60.

**Sıfıra bölme tuzağı.** Oyunun en başında `frames` ve `letters + mistakes` sıfırdır. JavaScript'te `0 / 0` sonucu
`NaN`'dır ("sayı değil"); ekranda "NaN words per minute" yazardı. Bu yüzden iki fonksiyon da önce sorar:

```js
frames === 0 ? 0 : hesap          // hiç zaman geçmediyse 0
letters + mistakes === 0 ? 100 : hesap  // hiç tuşa basılmadıysa %100
```

`koşul ? a : b` "koşul doğruysa `a`, değilse `b`" demektir.

**Hataları saymak.** `type` içinde şimdiye kadar yanlış tuşta sadece `return` ile çıkıyorduk. Artık çıkmadan önce hatayı
sayacağız; bu yüzden `if`'in arkasına tek komut yerine `{ }` içinde iki komut koyuyoruz: önce `mistakes += 1`, sonra `return`.
Doğru harfte ise `letters += 1`.

**Yazıyı birleştirmek.** `wpm() + ' words per minute, ' + accuracy() + '% accurate'` sayılarla yazıları sırayla yan yana
ekler: `'38 words per minute, 94% accurate'`.

# --task--

1. Add `frames`, `letters` and `mistakes` (all `0` in `reset()`). `update` counts `frames` while playing.
2. In `type`, a key with no matching word or a wrong next letter adds 1 to `mistakes`; a right letter adds 1 to `letters`.
3. Write `wpm()` and `accuracy()` as above, returning `0` and `100` when there is nothing to measure yet.
4. On the game over screen, draw `38 words per minute, 94% accurate` at `y = 175` and move `Press Enter to play again` to
   `y = 205`.

# --task-tr--

1. `let state // 'playing' or 'over'` satırının altına üç değişken ekle:

   ```js
   let frames
   let letters // correct letters typed
   let mistakes
   ```

2. `reset()`'in sonuna, `state = 'playing'` satırının altına ekle:

   ```js
     frames = 0
     letters = 0
     mistakes = 0
   ```

3. `type(key)`'de iki `return`'ü hata sayacak şekilde değiştir ve doğru harfi say. Fonksiyonun baş kısmı şöyle olmalı:

   ```js
   function type(key) {
     if (state !== 'playing') return
     if (!target) {
       // Lock on to the lowest word starting with this letter: it is the most urgent.
       const options = words.filter((w) => w.text[0] === key).sort((a, b) => b.y - a.y)
       if (options.length === 0) {  // ← değişti
         mistakes += 1              // ← yeni
         return                     // ← yeni
       }                            // ← yeni
       target = options[0]
       typed = 0
     }
     if (target.text[typed] !== key) { // ← değişti
       mistakes += 1                   // ← yeni
       return                          // ← yeni
     }                                 // ← yeni
     typed += 1
     letters += 1                      // ← yeni
   ```

   (Altındaki `if (typed === target.text.length) { ... }` kısmı aynı kalır.)

4. `update()`'te `if (state !== 'playing') return` satırının hemen altına kare sayacını ekle:

   ```js
     frames += 1
   ```

5. `update()`'in kapanış `}`'sinin altına iki ölçüm fonksiyonunu yaz:

   ```js
   // Words per minute counts five letters as one word, the usual way.
   const wpm = () => (frames === 0 ? 0 : Math.round(letters / 5 / (frames / 3600)))
   const accuracy = () => (letters + mistakes === 0 ? 100 : Math.round((100 * letters) / (letters + mistakes)))
   ```

6. `draw()`'daki oyun bitti panelinin son satırlarını şöyle değiştir:

   ```js
       ctx.font = '18px sans-serif'
       ctx.fillText(wpm() + ' words per minute, ' + accuracy() + '% accurate', canvas.width / 2, 175) // ← yeni
       ctx.fillText('Press Enter to play again', canvas.width / 2, 205)                             // ← değişti (175 → 205)
     }
   ```

7. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. Birkaç kelime yaz, sonra üç kelimeyi düşmeye bırak: `Game over`
   panelinde hızın ve doğruluğun yazmalı. Alttaki kontrollerin hepsi yeşil olmalı.

# --tests--

Right letters and mistakes should be counted, and accuracy computed from them.
tr: Doğru harfler ve hatalar sayılmalı, doğruluk onlardan hesaplanmalı.

```js
spawnTimer = 100000
words = [{ text: 'sun', x: 10, y: 50 }]
$.press('q')
$.press('s')
$.press('x')
$.press('u')
$.press('n')
assert.strictEqual(letters, 3)
assert.strictEqual(mistakes, 2)
assert.strictEqual(accuracy(), 60)
```

WPM should count five letters as a word, and nothing should divide by zero at the start.
tr: WPM beş harfi bir kelime saymalı ve başta hiçbir şey sıfıra bölünmemeli.

```js
letters = 50
frames = 3600
assert.strictEqual(wpm(), 10, '50 letters in a minute is 10 words')
frames = 1800
assert.strictEqual(wpm(), 20)
frames = 0
letters = 0
mistakes = 0
assert.strictEqual(wpm(), 0)
assert.strictEqual(accuracy(), 100)
```

The game over screen should show the speed and the accuracy.
tr: Oyun bitti ekranı hızı ve doğruluğu göstermeli.

```js
spawnTimer = 100000
words = [{ text: 'sun', x: 10, y: 50 }]
for (const k of 'sxun') $.press(k)
$.tick(3600 - 1)
words = [1, 2, 3].map((i) => ({ text: 'cat', x: i * 50, y: GROUND + 1 }))
$.tick(1)
assert.strictEqual(state, 'over')
$.tick(1)
assert.include($.texts(), '1 words per minute, 75% accurate')
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
    ctx.fillText('Press Enter to play again', canvas.width / 2, 205)
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
