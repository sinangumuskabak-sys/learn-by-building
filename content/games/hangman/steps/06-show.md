---
title: Write the word
title_tr: Kelimeyi yaz
skills: [game.canvas]
---

# --goal--

To check the pick works, we draw the word itself, centered near the bottom. The next step will hide it.

# --goal-tr--

Seçim çalışıyor mu, görelim: kelimeyi tuvale **yazacağız**. Evet, gizli kelimeyi açıkça göstereceğiz, ama sadece bu
adımda; bir sonraki adımda onu boşluklarla gizleyeceğiz.

Yazı yazmak da çizim gibidir: önce hizayı, yazı tipini ve rengi seç, sonra yaz.

# --code--

```js
function draw() {
  ctx.fillStyle = '#fefce8'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.textAlign = 'center'
  ctx.font = 'bold 32px monospace'
  ctx.fillStyle = '#1f2937'
  ctx.fillText(word, canvas.width / 2, 340)
}
```

# --meaning--

- `textAlign = 'center'` puts the middle of the text on the given point.
- `font = 'bold 32px monospace'`: bold, 32 pixels tall, a font where every character is the same width.
- `fillStyle = '#1f2937'` is a dark grey for the text.
- `fillText(word, canvas.width / 2, 340)` writes `word` at the middle (`480 / 2 = 240`), 340 pixels down.

# --meaning-tr--

- `ctx.textAlign = 'center'` → yazının **ortası** verilen noktaya gelir. Böylece kısa kelime de uzun kelime de
  ortalı durur.
- `ctx.font = 'bold 32px monospace'` → yazı tipi: kalın (`bold`), 32 piksel boyunda, `monospace`. **Monospace**
  yazı tipinde her karakter aynı eni kaplar; birazdan harfler ve çizgiler bu sayede hizalı duracak.
- `ctx.fillStyle = '#1f2937'` → koyu gri yazı rengi.
- `ctx.fillText(word, canvas.width / 2, 340)` → `word`'ün içindeki yazıyı yazar. `canvas.width / 2` → tuvalin
  yatay ortası (`/` bölme: 480 / 2 = 240). `340` → yukarıdan 340 piksel aşağı.

# --task--

Inside `draw`, under the `fillRect` line, leave an empty line and write the four text lines. Press **Run** a few times.

# --task-tr--

`draw` fonksiyonunun içinde, `ctx.fillRect(...)` satırının altına bir boş satır bırak ve dört yazı satırını yaz
(kapanan `}`'den önce). **Çalıştır**'a birkaç kez bas: her seferinde başka bir kelime görebilirsin.

# --try--

Change `340` to `100` and run: the word moves up. Put `340` back.

# --try-tr--

`340` yerine `100` yaz ve çalıştır: kelime yukarı çıkar. Sonra `340`'a geri al.

# --tests--

`draw()` should write the word, centered at (240, 340).
tr: `draw()` kelimeyi (240, 340)'a ortalı yazmalı.

```js
word = 'TIGER'
draw()
const t = $.screen().filter((c) => c.op === 'fillText')
assert.lengthOf(t, 1)
assert.deepEqual(t[0].args, ['TIGER', 240, 340])
```

The word should be bold 32px monospace, dark grey.
tr: Kelime kalın 32px monospace ve koyu gri olmalı.

```js
draw()
const t = $.screen().find((c) => c.op === 'fillText')
assert.strictEqual(t.font, 'bold 32px monospace')
assert.strictEqual(t.fill, '#1f2937')
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

let word

function newWord() {
  word = WORDS[Math.floor(Math.random() * WORDS.length)]
}

function draw() {
  ctx.fillStyle = '#fefce8'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.textAlign = 'center'
  ctx.font = 'bold 32px monospace'
  ctx.fillStyle = '#1f2937'
  ctx.fillText(word, canvas.width / 2, 340)
}

newWord()
draw()
```
