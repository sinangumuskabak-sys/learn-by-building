---
title: Listen to the keyboard
title_tr: Klavyeyi dinle
skills: [game.input]
---

# --goal--

Every key from `a` to `z`, small or capital, goes to `type`. Other keys (Shift, arrows, numbers) are ignored.

# --goal-tr--

Şimdi klavyeyi `type`'a bağlıyoruz. Tarayıcıya "bir tuşa basılınca bana haber ver" deriz; buna **olay dinlemek**
(event listener) denir: kapı zili gibi, çalınca ne yapılacağını önceden söylersin.

Yalnız **harfler** bizi ilgilendirir: `a`'dan `z`'ye. Shift, oklar, rakamlar görmezden gelinir. Caps Lock açıkken
büyük harf gelir; onu küçüğe çeviririz.

# --code--

```js
document.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase()
  if (key.length === 1 && key >= 'a' && key <= 'z') {
    event.preventDefault()
    type(key)
  }
})
```

# --meaning--

- `keydown` runs the arrow function every time a key goes down; `event.key` is its name (`'c'`, `'Shift'`,
  `'ArrowUp'`).
- `.toLowerCase()` makes capitals small. A letter is one character long and between `'a'` and `'z'`.
- `preventDefault()` stops the browser's own action for that key.

# --meaning-tr--

- `document.addEventListener('keydown', (event) => { ... })` → "sayfada bir tuşa **basıldığında** içini çalıştır".
  `event` basılan tuşun bilgilerini taşır.
- `event.key` → tuşun adı: `'c'`, `'C'`, `'Shift'`, `'ArrowUp'`...
- `.toLowerCase()` → küçük harfe çevirir: `'C'` → `'c'`.
- `key.length === 1` → tek harfli mi? (`'Shift'` 5 harf.) `&&` "**ve**".
- `key >= 'a' && key <= 'z'` → harfler de alfabe sırasıyla karşılaştırılabilir: `'a'` ile `'z'` arasında mı? Böylece
  `'1'` ya da `'-'` elenir.
- `event.preventDefault()` → tarayıcının o tuşla kendi yaptığı işi engeller (bazı tarayıcılarda harf tuşu sayfada
  arama başlatır).
- `type(key)` → harfi oyuna ver.

# --task--

Write the listener above `function draw() {` (under `update`), with an empty line after it.

# --task-tr--

`update`'in altına, `function draw() {` satırının **üstüne** dinleyiciyi yaz; altında bir boş satır kalsın.
**Çalıştır**, oyuna bir kez tıkla (klavye oyuna gitsin). Ekranda henüz bir şey değişmez; hedef kilitlenir ama bunu
göstermiyoruz.

# --hint--

`'keydown'` is all lowercase; `toLowerCase` has a capital `L` and `C`.

# --hint-tr--

`'keydown'` tamamen küçük harf; `toLowerCase` içinde büyük `L` ve `C` var.

# --tests--

Pressing a letter should lock on to a word, small or capital.
tr: Bir harfe basmak, küçük ya da büyük, bir kelimeye kilitlenmeli.

```js
spawnTimer = 1000
words = [{ text: 'sun', x: 50, y: 100 }, { text: 'cat', x: 200, y: 200 }]
$.press('C')
assert.strictEqual(target.text, 'cat')
```

Keys that are not letters should be ignored.
tr: Harf olmayan tuşlar görmezden gelinmeli.

```js
spawnTimer = 1000
words = [{ text: 'sun', x: 50, y: 100 }]
$.press('Shift')
$.press('1')
$.press('ArrowUp')
assert.isNull(target)
$.press('s')
assert.strictEqual(target.text, 'sun')
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
