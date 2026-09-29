---
title: Lock on to a word
title_tr: Bir kelimeye kilitlen
skills: [game.state, prog.arrays]
---

# --goal--

Which word are you typing? You never say; the game works it out. The first letter you type **locks on** to a word
starting with it. If several match, the lowest one is the most urgent.

# --goal-tr--

Hangi kelimeyi yazıyorsun? Bunu hiç söylemezsin; oyun anlar. Yazdığın ilk harf, o harfle başlayan bir kelimeye
**kilitlenir**. O harfle başlayan birkaç kelime varsa **en alttaki** seçilir: yere en yakın olan, en acil olan.

Kilitlendiğimiz kelimeyi `target` (hedef), onun kaç harfini yazdığımızı `typed` değişkeninde tutacağız.

# --code--

```js
let target // the word being typed, or null
let typed // how many letters of the target are typed

  target = null
  typed = 0

function type(key) {
  if (!target) {
    // Lock on to the lowest word starting with this letter: it is the most urgent.
    const options = words.filter((w) => w.text[0] === key).sort((a, b) => b.y - a.y)
    if (options.length === 0) return
    target = options[0]
    typed = 0
  }
}
```

# --meaning--

- `target` is `null` (nothing) until a word is chosen; `typed` counts its letters done.
- `w.text[0]` is a word's first letter. `filter` keeps the words starting with `key`.
- `sort((a, b) => b.y - a.y)` orders them by `y`, largest first, so `options[0]` is the lowest.
- With no match, `return` leaves at once.

# --meaning-tr--

- `let target` → yazılan kelime; yoksa `null` ("**hiçbir şey**"). `let typed` → kaç harfi yazıldı.
- `function type(key)` → `key` basılan harf (`'c'` gibi). Buna **parametre** denir.
- `if (!target)` → `!` "**değil**": henüz bir hedef yoksa.
- `w.text[0]` → yazının ilk harfi (sayma 0'dan). `filter` bu harfle başlayan kelimeleri seçer.
- `.sort((a, b) => b.y - a.y)` → listeyi **sıralar**. Sıralama iki kelimeyi (`a`, `b`) karşılaştırır: sonuç
  pozitifse `b` öne geçer. `b.y - a.y` → `y`'si büyük olan (daha aşağıdaki) **başa**. Yani `options[0]` en alttaki.
- `if (options.length === 0) return` → bu harfle başlayan kelime yoksa dur. `return` fonksiyondan hemen çıkar.
- `target = options[0]` → hedef bu. `typed = 0` → henüz harfi sayılmadı.

# --task--

1. Under `let words` write `let target` and `let typed`.
2. In `reset`, under `words = []`, write `target = null` and `typed = 0`.
3. Under `reset`, after an empty line, write `type`.

# --task-tr--

1. `let words ...` satırının altına `let target ...` ve `let typed ...` satırlarını yaz.
2. `reset` içinde `words = []` satırının altına `target = null` ve `typed = 0` yaz.
3. `reset` fonksiyonunun kapanan `}`'sinin altında bir boş satır bırak ve `type` fonksiyonunu yaz.
4. **Çalıştır**: henüz hiçbir tuş `type`'ı çağırmıyor.

# --tests--

`type` should lock on to the lowest word starting with the letter.
tr: `type`, harfle başlayan en alttaki kelimeye kilitlenmeli.

```js
assert.isNull(target)
words = [{ text: 'code', x: 50, y: 100 }, { text: 'cat', x: 200, y: 200 }, { text: 'sun', x: 300, y: 250 }]
type('c')
assert.strictEqual(target.text, 'cat', 'the lowest word starting with c')
assert.strictEqual(typed, 0)
```

A letter no word starts with should lock on to nothing.
tr: Hiçbir kelimenin başlamadığı bir harf hiçbir şeye kilitlenmemeli.

```js
words = [{ text: 'sun', x: 50, y: 100 }]
type('q')
assert.isNull(target)
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
const GROUND = 330 // words that fall past this line are gone
const SPEED = 0.35
const SPAWN_EVERY = 138
const FONT = 'bold 20px monospace'

let words // { text, x, y }
let target // the word being typed, or null
let typed // how many letters of the target are typed
let spawnTimer

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
  spawnTimer = 0
}

function type(key) {
  if (!target) {
    // Lock on to the lowest word starting with this letter: it is the most urgent.
    const options = words.filter((w) => w.text[0] === key).sort((a, b) => b.y - a.y)
    if (options.length === 0) return
    target = options[0]
    typed = 0
  }
}

function update() {
  spawnTimer -= 1
  if (spawnTimer <= 0) {
    spawn()
    spawnTimer = SPAWN_EVERY
  }
  for (const w of words) w.y += SPEED
  words = words.filter((w) => w.y <= GROUND)
}

function draw() {
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#7f1d1d'
  ctx.fillRect(0, GROUND + 4, canvas.width, 3)

  ctx.font = FONT
  ctx.textAlign = 'left'
  ctx.fillStyle = '#cbd5e1'
  for (const w of words) ctx.fillText(w.text, w.x, w.y)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
