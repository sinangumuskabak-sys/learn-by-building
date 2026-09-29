---
title: Let it rain
title_tr: Yağmur başlasın
skills: [game.loop, game.state]
---

# --goal--

A **spawn timer** counts down every frame; at zero a new word appears and the timer starts again from `SPAWN_EVERY`
(138 frames, a bit over two seconds). The game starts with no words and the timer at 0, so the first word comes at
once.

# --goal-tr--

Şimdi yağmur. Bir **geri sayım** tutacağız: `spawnTimer`. Her karede bir azalır; sıfıra gelince yeni bir kelime doğar
ve sayaç yeniden `SPAWN_EVERY`'den (138 kare, iki saniyeden biraz fazla) başlar. Mutfaktaki zamanlayıcı gibi: çalınca
kurarsın, yine çalar.

Oyun artık elle yazılmış kelimelerle değil, **boş** bir listeyle başlıyor. Sayaç 0'dan başladığı için ilk kelime
hemen gelir.

# --code--

```js
const SPAWN_EVERY = 138

let spawnTimer

  words = []
  spawnTimer = 0

function update() {
  spawnTimer -= 1
  if (spawnTimer <= 0) {
    spawn()
    spawnTimer = SPAWN_EVERY
  }
```

# --meaning--

- `spawnTimer` counts down by 1 each frame (`-=`).
- `if (spawnTimer <= 0)` is true when it runs out: spawn a word and wind the timer up again.
- `reset` starts with an empty list and the timer at 0.

# --meaning-tr--

- `const SPAWN_EVERY = 138` → iki kelime arası 138 kare.
- `let spawnTimer` → geri sayım. `reset` içinde `0` → ilk kelime hemen.
- `words = []` → oyun **boş** bir listeyle başlar; elle yazdığımız iki kelime gitti.
- `spawnTimer -= 1` → "sayaçtan 1 çıkar".
- `if (spawnTimer <= 0) {` → **eğer** sayaç 0'a ya da altına indiyse (`<=` "küçük ya da eşit"):
  - `spawn()` → yeni kelime.
  - `spawnTimer = SPAWN_EVERY` → sayacı yeniden kur.

# --task--

1. Under `SPEED` write `SPAWN_EVERY`; under `let words` write `let spawnTimer`.
2. In `reset`, replace the hand-written list with `words = []` and `spawnTimer = 0`.
3. At the top of `update`, write the timer lines.

# --task-tr--

1. `const SPEED = ...` satırının altına `SPAWN_EVERY` yaz; `let words ...` satırının altına `let spawnTimer` yaz.
2. `reset` içindeki elle yazılmış listeyi (dört satır) sil; yerine `words = []` ve `spawnTimer = 0` yaz.
3. `update`'in **en üstüne**, `for` satırından önce zamanlayıcı satırlarını yaz.
4. **Çalıştır**: rastgele kelimeler iki saniyede bir tepeden gelmeli.

# --try--

Set `SPAWN_EVERY` to `30` and run: a downpour. Put `138` back.

# --try-tr--

`SPAWN_EVERY`'yi `30` yap ve çalıştır: sağanak! Sonra `138`'e geri al.

# --tests--

The first word should appear at once.
tr: İlk kelime hemen belirmeli.

```js
assert.lengthOf(words, 0)
$.tick(1)
assert.lengthOf(words, 1, 'the first word comes at once')
assert.include(WORDS, words[0].text)
```

Words should fall and keep coming, one every `SPAWN_EVERY` frames.
tr: Kelimeler düşmeli ve her `SPAWN_EVERY` karede bir gelmeye devam etmeli.

```js
$.tick(1)
const y = words[0].y
$.tick(10)
assert.isAbove(words[0].y, y, 'words fall')
$.tick(SPAWN_EVERY)
assert.lengthOf(words, 2, 'a second word')
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
let spawnTimer

function spawn() {
  const text = WORDS[Math.floor(Math.random() * WORDS.length)]
  ctx.font = FONT
  const width = ctx.measureText(text).width
  words.push({ text, x: 10 + Math.random() * (canvas.width - 20 - width), y: 30 })
}

function reset() {
  words = []
  spawnTimer = 0
}

function update() {
  spawnTimer -= 1
  if (spawnTimer <= 0) {
    spawn()
    spawnTimer = SPAWN_EVERY
  }
  for (const w of words) w.y += SPEED
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
