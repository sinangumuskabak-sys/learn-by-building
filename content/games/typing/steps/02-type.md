---
title: Typing a word
title_tr: Bir kelime yazmak
skills: [game.input, game.state]
---

# --explanation--

Which word are you typing? You never say; the game works it out. The first letter you type **locks on** to a word starting
with it, and from then on every letter must be the next one of that word.

If several words start with the same letter, the lowest one is the most urgent, so the game picks the word with the largest
`y`. Sorting a copy of the matching words by `y`, largest first, puts it at index 0:

```js
const options = words.filter((w) => w.text[0] === key).sort((a, b) => b.y - a.y)
```

`target` is the word being typed and `typed` how many of its letters are done. A wrong letter is ignored. When `typed` reaches
the word's length, the word is removed and `target` goes back to `null`. If the target falls off the screen, the lock is
released too.

The typed part is drawn in yellow. There is no "color half a word" command, so we draw two pieces: the typed part at `x`, and
the rest in white starting **exactly where the first piece ends**, at `x + measureText(done).width`. With a monospace font the
two pieces join seamlessly.

# --explanation-tr--

Hangi kelimeyi yazıyorsun? Hiç söylemezsin; oyun bunu bulur. Yazdığın ilk harf onunla başlayan bir kelimeye **kilitlenir** ve
ondan sonra her harf o kelimenin sıradaki harfi olmalıdır.

Aynı harfle başlayan birkaç kelime varsa en alttaki en acil olandır; bu yüzden oyun `y`'si en büyük kelimeyi seçer. Eşleşen
kelimeleri büyükten küçüğe `y`'ye göre sıralamak onu 0. sıraya koyar:

```js
const options = words.filter((w) => w.text[0] === key).sort((a, b) => b.y - a.y)
```

`target` yazılan kelime, `typed` de harflerinden kaçının bittiğidir. Yanlış bir harf yok sayılır. `typed` kelimenin uzunluğuna
ulaştığında kelime silinir ve `target` yeniden `null` olur. Hedef ekrandan düşerse kilit de bırakılır.

Yazılan kısım sarı çizilir. "Bir kelimenin yarısını boya" diye bir komut yoktur; bu yüzden iki parça çizeriz: yazılan kısmı
`x`'e, geri kalanı da beyazla, **tam olarak ilk parçanın bittiği yerden**, `x + measureText(done).width`'ten başlayarak.
Eş aralıklı bir yazı tipiyle iki parça kusursuzca birleşir.

# --task--

1. Add `target` and `typed` (`null` and `0` in `reset()`).
2. Write `type(key)`: with no target, lock on to the lowest word starting with `key` (or do nothing if there is none) with
   `typed = 0`. Then, if `key` is the next letter of the target, add 1 to `typed`; when the whole word is typed, remove it and
   set `target = null`.
3. On `keydown`, call `type` for the keys `a` to `z` (small or capital), with `preventDefault()`.
4. In `update()`, clear `target` if it falls below `GROUND`.
5. Draw the target's typed part in `'#facc15'` and the rest right after it in `'#ffffff'`; other words stay `'#cbd5e1'`.

# --task-tr--

1. `target` ve `typed` ekle (`reset()`'te `null` ve `0`).
2. `type(key)` yaz: hedef yokken `key` ile başlayan en alttaki kelimeye `typed = 0` ile kilitlen (yoksa hiçbir şey yapma).
   Sonra `key` hedefin sıradaki harfiyse `typed`'a 1 ekle; bütün kelime yazılınca onu sil ve `target = null` yap.
3. `keydown`'da `a`'dan `z`'ye tuşlar (küçük ya da büyük) için `preventDefault()` ile `type`'ı çağır.
4. `update()`'te `target` `GROUND`'un altına düşerse temizle.
5. Hedefin yazılan kısmını `'#facc15'` ile, gerisini hemen ardından `'#ffffff'` ile çiz; diğer kelimeler `'#cbd5e1'` kalır.

# --tests--

Typing should lock on to the lowest matching word and clear it letter by letter.
tr: Yazmak eşleşen en alttaki kelimeye kilitlenmeli ve onu harf harf temizlemeli.

```js
spawnTimer = 1000
words = [{ text: 'code', x: 50, y: 100 }, { text: 'cat', x: 200, y: 200 }]
$.press('c')
assert.strictEqual(target.text, 'cat', 'the lowest word starting with c')
assert.strictEqual(typed, 1)
$.press('a')
$.press('T')
assert.isNull(target)
assert.deepEqual(words.map((w) => w.text), ['code'], 'a finished word disappears')
```

Wrong letters should not count, and a target that falls away should be released.
tr: Yanlış harfler sayılmamalı ve düşüp giden bir hedef bırakılmalı.

```js
spawnTimer = 1000
words = [{ text: 'sun', x: 50, y: 100 }]
$.press('q')
assert.isNull(target, 'no word starts with q')
$.press('s')
$.press('x')
assert.strictEqual(typed, 1, 'a wrong letter does not count')
$.press('u')
assert.strictEqual(typed, 2)
words[0].y = GROUND
$.tick(1)
assert.isNull(target, 'a word that falls away is no longer the target')
```

The typed part should be yellow, with the rest drawn right after it.
tr: Yazılan kısım sarı olmalı, geri kalanı hemen ardından çizilmeli.

```js
spawnTimer = 1000
words = [{ text: 'cat', x: 200, y: 200 }]
$.press('c')
$.press('a')
$.tick(1)
const texts = $.screen().filter((c) => c.op === 'fillText')
const done = texts.find((c) => c.args[0] === 'ca')
assert.strictEqual(done.fill, '#facc15', 'the typed part is yellow')
const rest = texts.find((c) => c.args[0] === 't')
ctx.font = FONT
assert.closeTo(rest.args[1], 200 + ctx.measureText('ca').width, 1e-9, 'the rest starts right after it')
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
  if (target && target.y > GROUND) target = null
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
  for (const w of words) {
    // The typed part in yellow, the rest in white right after it.
    const done = w === target ? w.text.slice(0, typed) : ''
    ctx.fillStyle = '#facc15'
    ctx.fillText(done, w.x, w.y)
    ctx.fillStyle = w === target ? '#ffffff' : '#cbd5e1'
    ctx.fillText(w.text.slice(done.length), w.x + ctx.measureText(done).width, w.y)
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
