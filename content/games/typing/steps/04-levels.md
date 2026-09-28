---
title: Faster and faster
title_tr: Gittikçe hızlanarak
skills: [game.state, prog.functions]
---

# --explanation--

A game that never gets harder gets boring. Every 10 words you go up a **level**, and two things change: words fall faster and
come more often.

Instead of the constants `SPEED` and `SPAWN_EVERY`, we use two tiny functions of the level:

```js
const speed = () => 0.25 + level * 0.1
const spawnEvery = () => Math.max(40, 150 - level * 12)
```

`Math.max(40, ...)` puts a floor under the gap between words. Without it, by level 13 the gap would be negative and words would
pour out every frame. Tuning these numbers is real game design: with them, a player typing 18 words per minute lasts about
40 seconds, one at 36 about two minutes, and one at 60 more than three.

Letters are also worth `level` points each, so surviving longer pays. The best score is saved in `localStorage` when the game
ends.

# --explanation-tr--

**Bu adımda:** oyun gittikçe zorlaşacak. Her 10 kelimede bir **seviye** (level) atlayacaksın; kelimeler daha hızlı düşüp
daha sık gelecek. Sol üstte `Score 36  Level 2`, sağ üstte `♥♥♥  Best 42` gibi yazılar göreceksin. En iyi puanın sayfayı
kapatsan da hatırlanacak.

**Sabit yerine fonksiyon.** Şimdiye kadar hız (`SPEED`) ve kelime aralığı (`SPAWN_EVERY`) hiç değişmeyen sabitlerdi.
Artık seviyeye bağlılar, bu yüzden onları her sorulduğunda hesaplayan iki küçük fonksiyona çeviriyoruz:

```js
const speed = () => 0.25 + level * 0.1
const spawnEvery = () => Math.max(40, 150 - level * 12)
```

- `() => ...` parametresi olmayan kısa bir fonksiyondur; `=>`'nin sağındaki hesabı **geri verir**. Çağırırken parantez
  unutulmaz: `speed()`.
- Seviye 1'de hız `0.25 + 0.1` = 0.35, aralık `150 - 12` = 138: eski sabitlerle aynı. Seviye 5'te hız 0.75, aralık 90.
- `Math.max(a, b)` ikisinden **büyük** olanı verir. Böylece aralık hiçbir zaman 40'ın altına inmez. Olmasaydı seviye 13'te
  aralık eksiye düşer, her karede kelime yağardı.

Bu sayıları ayarlamak gerçek bir oyun tasarımı işidir: bu hâliyle dakikada 18 kelime yazan biri yaklaşık 40 saniye,
36 yazan iki dakika, 60 yazan üç dakikadan fazla dayanır.

**Seviye atlamak.** `cleared` bu oyunda kaç kelime bitirdiğini sayar. `cleared % 10 === 0` → "10'a bölümünden kalan 0 mı?"
(`%` kalan işaretidir: `20 % 10` = 0, `13 % 10` = 3). Yani 10., 20., 30. kelimelerde doğrudur ve `level` 1 artar. Puan da
artık `harf sayısı × seviye`: uzun dayanan daha çok kazanır.

**En iyi puanı saklamak (`localStorage`).** Tarayıcının küçük bir defteri vardır; sayfa kapansa da içindekiler kalır.

- `localStorage.setItem('typing-best', best)` → `'typing-best'` adıyla kaydet.
- `localStorage.getItem('typing-best')` → okuyup geri ver. Defter hep **yazı** saklar; `Number(...)` onu sayıya çevirir.
- İlk kez oynarken kayıt yoktur ve sonuç sayı olmaz. `|| 0` → "işe yarar bir değer yoksa 0 kullan".

Oyun bitince yapılacak işleri `gameOver()` adlı bir fonksiyonda toplarız: durumu `'over'` yapar, puan rekoru geçtiyse
(`score > best`) kaydeder.

# --task--

1. Replace `SPEED` and `SPAWN_EVERY` with `speed()` and `spawnEvery()` as above.
2. Add `level` and `cleared` (`1` and `0` in `reset()`). A finished word scores `length * level`, adds 1 to `cleared`, and
   every 10th word adds 1 to `level`.
3. Write `gameOver()`: set `'over'` and save `score` in `localStorage` under `'typing-best'` if it beats `best`.
4. Draw `Score 36  Level 2` on the left and `♥♥♥  Best 42` on the right.

# --task-tr--

1. `const SPEED = 0.35` ve `const SPAWN_EVERY = 138` satırlarını **sil**.

2. `let score` satırının altına iki değişken ekle:

   ```js
   let level
   let cleared // words typed this game
   ```

3. `let state // 'playing' or 'over'` satırının altına en iyi puanı ve iki fonksiyonu ekle:

   ```js
   let best = Number(localStorage.getItem('typing-best')) || 0

   // Faster and more often as the level goes up.
   const speed = () => 0.25 + level * 0.1
   const spawnEvery = () => Math.max(40, 150 - level * 12)
   ```

4. `reset()`'te `score = 0` satırının altına ekle:

   ```js
     level = 1
     cleared = 0
   ```

5. `type(key)`'in sonundaki `if` şöyle olmalı:

   ```js
     if (typed === target.text.length) {
       words = words.filter((w) => w !== target)
       score += target.text.length * level  // ← değişti
       cleared += 1                         // ← yeni
       if (cleared % 10 === 0) level += 1   // ← yeni
       target = null
     }
   }
   ```

6. `type` fonksiyonunun kapanış `}`'sinin altına `gameOver()`'ı yaz:

   ```js
   function gameOver() {
     state = 'over'
     if (score > best) {
       best = score
       localStorage.setItem('typing-best', best)
     }
   }
   ```

7. `update()`'te üç satırı değiştir:

   ```js
       spawnTimer = spawnEvery()           // ← değişti (eskiden SPAWN_EVERY)
   ```

   ```js
     for (const w of words) w.y += speed() // ← değişti (eskiden SPEED)
   ```

   ve en sondaki `if` içinde `state = 'over'` yerine:

   ```js
     if (lives <= 0) {
       lives = 0
       gameOver() // ← değişti
     }
   ```

8. `draw()`'daki puan ve kalp satırlarını şöyle değiştir (iki boşluklara dikkat):

   ```js
     ctx.fillText('Score ' + score + '  Level ' + level, 10, 22)          // ← değişti
     ctx.textAlign = 'right'
     ctx.fillText('♥'.repeat(lives) + '  Best ' + best, canvas.width - 10, 22) // ← değişti
   ```

9. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. Üstte `Level 1` ve `Best 0` görmelisin; 10 kelime yazınca
   `Level 2` olmalı. Alttaki kontrollerin hepsi yeşil olmalı. Yazı kontrolü kırmızıysa `'  Level '` ve `'  Best '`
   içindeki **iki boşluğu** kontrol et.

# --tests--

Words should fall faster and come more often at higher levels, but never more than every 40 frames.
tr: Kelimeler yüksek seviyelerde daha hızlı düşmeli ve daha sık gelmeli, ama asla 40 kareden daha sık değil.

```js
assert.closeTo(speed(), 0.35, 1e-9)
assert.strictEqual(spawnEvery(), 138)
level = 5
assert.closeTo(speed(), 0.75, 1e-9)
assert.strictEqual(spawnEvery(), 90)
level = 20
assert.strictEqual(spawnEvery(), 40, 'never more often than every 40 frames')
```

Ten words should raise the level, and letters should be worth the level.
tr: On kelime seviyeyi yükseltmeli ve harfler seviye kadar değerli olmalı.

```js
spawnTimer = 100000
for (let i = 0; i < 10; i++) {
  words = [{ text: 'sun', x: 10, y: 50 }]
  for (const k of 'sun') $.press(k)
}
assert.strictEqual(level, 2, 'ten words: next level')
assert.strictEqual(score, 30)
words = [{ text: 'sun', x: 10, y: 50 }]
for (const k of 'sun') $.press(k)
assert.strictEqual(score, 36, 'letters count double at level 2')
```

The best score should be saved when the game ends.
tr: Oyun bittiğinde en iyi puan kaydedilmeli.

```js
spawnTimer = 100000
assert.strictEqual(best, 0)
score = 42
words = [1, 2, 3].map((i) => ({ text: 'cat', x: i * 50, y: GROUND }))
$.tick(1)
assert.strictEqual(best, 42)
assert.strictEqual(localStorage.getItem('typing-best'), '42')
$.tick(1)
assert.include($.texts(), '  Best 42')
assert.include($.texts(), 'Score 42  Level 1')
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
