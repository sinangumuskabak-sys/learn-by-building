---
title: Letter by letter
title_tr: Harf harf
skills: [game.state]
---

# --goal--

After locking on, every letter must be the next one of the target. A wrong letter is ignored. When the whole word is
typed, it disappears and the lock is free again.

# --goal-tr--

Kilitlendikten sonra her harf hedefin **sıradaki** harfi olmalı. Yanlış harf sayılmaz, hiçbir şey olmaz. Bütün
kelime yazılınca kelime **kaybolur** ve kilit serbest kalır; sıradaki harf yeni bir kelimeye kilitlenir.

Dikkat: kilitlendiğimiz ilk harf de sayılır. `c` yazınca `cat`'e kilitleniriz **ve** `c` onun ilk harfidir.

# --code--

```js
if (target.text[typed] !== key) return
typed += 1
if (typed === target.text.length) {
  words = words.filter((w) => w !== target)
  target = null
}
```

# --meaning--

- `target.text[typed]` is the next letter to type; if the key is different (`!==`), stop.
- Otherwise one more letter is done. When `typed` equals the word's length, the word is removed from the list and
  `target` goes back to `null`.

# --meaning-tr--

- `target.text[typed]` → yazılacak **sıradaki** harf. `typed` 0 ise ilk harf, 1 ise ikinci...
- `if (... !== key) return` → basılan harf o değilse (`!==` "eşit **değil**") dur: yanlış harf sayılmaz.
- `typed += 1` → bir harf daha tamam.
- `if (typed === target.text.length)` → `length` yazının harf sayısı; hepsi yazıldıysa:
  - `words = words.filter((w) => w !== target)` → hedef **dışındaki** bütün kelimeleri tut: hedef listeden çıkar.
  - `target = null` → kilit serbest.

# --task--

In `type`, after the `if (!target) { ... }` block, write the new lines.

# --task-tr--

`type` içinde, `if (!target) { ... }` bloğunun kapanan `}`'sinin altına yeni satırları yaz; fonksiyonun son `}`'si
altta kalsın. **Çalıştır**, oyuna tıkla ve düşen bir kelimeyi yaz: kaybolmalı.

# --predict--

Two words, `cat` (low) and `code` (high). You type `c`, `o`. What happens?
- [ ] You switch to `code`
- [x] Nothing: you are locked on to `cat`, and `o` is not its next letter
  The lock stays until the word is finished (or falls away).

# --predict-tr--

İki kelime var: `cat` (aşağıda) ve `code` (yukarıda). `c`, `o` yazıyorsun. Ne olur?
- [ ] `code`'a geçersin
- [x] Hiçbir şey: `cat`'e kilitlisin ve `o` onun sıradaki harfi değil
  Kilit, kelime bitene (ya da düşüp gidene) kadar kalır.

# --tests--

Typing a word letter by letter should clear it.
tr: Bir kelimeyi harf harf yazmak onu temizlemeli.

```js
spawnTimer = 1000
words = [{ text: 'code', x: 50, y: 100 }, { text: 'cat', x: 200, y: 200 }]
$.press('c')
assert.strictEqual(typed, 1)
$.press('a')
$.press('T')
assert.isNull(target)
assert.deepEqual(words.map((w) => w.text), ['code'], 'a finished word disappears')
```

Wrong letters should not count.
tr: Yanlış harfler sayılmamalı.

```js
spawnTimer = 1000
words = [{ text: 'sun', x: 50, y: 100 }]
$.press('s')
$.press('x')
assert.strictEqual(typed, 1, 'a wrong letter does not count')
$.press('u')
assert.strictEqual(typed, 2)
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
  if (target.text[typed] !== key) return
  typed += 1
  if (typed === target.text.length) {
    words = words.filter((w) => w !== target)
    target = null
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

document.addEventListener('keydown', (event) => {
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
