---
title: Draw again and again
title_tr: Tekrar tekrar çiz
skills: [game.loop]
---

# --goal--

The picture must follow every guess, so we redraw it all the time: a loop that draws and asks the browser to run it
again before the next screen refresh.

# --goal-tr--

Şu an `draw()` sadece **bir kez**, en başta çalışıyor. Ama birazdan harf tahmin edeceğiz ve resim her tahmini
göstermeli. En kolayı: resmi **sürekli** yeniden çizmek.

Tarayıcı ekranı saniyede yaklaşık **60 kez** yeniler. `requestAnimationFrame` ona "bir sonraki yenilemeden önce bu
fonksiyonu çalıştır" der. Fonksiyon kendini her seferinde yeniden istediği için döngü hiç durmaz. Buna **oyun
döngüsü** denir.

# --code--

```js
function loop() {
  draw()
  requestAnimationFrame(loop)
}

newWord()
requestAnimationFrame(loop)
```

# --meaning--

- `loop` draws once, then books itself for the next frame, so it keeps going.
- The last line starts the loop. It replaces the old single `draw()` call.

# --meaning-tr--

- `function loop() {` → döngünün **bir turu**.
- `draw()` → o anki durumu çiz.
- `requestAnimationFrame(loop)` → "ekran bir sonraki yenilenmeden önce **loop'u yine** çalıştır". Fonksiyon kendi
  devamını istiyor; böylece döngü hiç bitmez.
- En alttaki `requestAnimationFrame(loop)` → döngüyü **başlatır**. Eski tek seferlik `draw()` çağrısının yerini
  alır.

# --task--

Above `newWord()` at the bottom, write the `loop` function. Replace the last `draw()` with `requestAnimationFrame(loop)`.

# --task-tr--

1. En alttaki `newWord()` satırının **üstüne** `loop` fonksiyonunu yaz; arada bir boş satır kalsın.
2. En alttaki `draw()` satırını sil, yerine `requestAnimationFrame(loop)` yaz.
3. **Çalıştır**. Ekran aynı görünür; farkı bir sonraki adımda harf tahmin edince göreceksin.

# --predict--

After Run, will the screen look different from before?
- [x] No, it looks the same
  The same picture is now drawn 60 times a second. It only changes when the state changes.
- [ ] Yes, the word flickers
- [ ] Yes, a new word appears every frame

# --predict-tr--

Çalıştır'a basınca ekran öncekinden farklı görünecek mi?
- [x] Hayır, aynı görünecek
  Aynı resim artık saniyede 60 kez çiziliyor. Resim ancak durum (kelime, tahminler) değişince değişir.
- [ ] Evet, kelime titreyecek
- [ ] Evet, her karede yeni bir kelime çıkacak

# --hint--

`newWord()` stays; only the last `draw()` is replaced. Check `requestAnimationFrame` letter by letter.

# --hint-tr--

`newWord()` yerinde kalıyor; sadece en alttaki `draw()` değişiyor. `requestAnimationFrame`'i harf harf kontrol et.

# --tests--

The loop should keep running by requesting the next frame.
tr: Döngü bir sonraki kareyi isteyerek sürmeli.

```js
$.tick(3)
assert.strictEqual($.pendingFrames, 1, 'loop() should call requestAnimationFrame(loop) once per frame')
```

Each frame should draw the latest state.
tr: Her kare en son durumu çizmeli.

```js
word = 'TIGER'
guessed = new Set(['I'])
$.tick(1)
assert.include($.texts(), '_ I _ _ _')
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
let guessed // a Set of the letters tried so far

// The word with the letters not guessed yet hidden: 'C _ S T _ E'.
const masked = () => [...word].map((letter) => (guessed.has(letter) ? letter : '_')).join(' ')

function newWord() {
  word = WORDS[Math.floor(Math.random() * WORDS.length)]
  guessed = new Set()
}

function draw() {
  ctx.fillStyle = '#fefce8'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.textAlign = 'center'
  ctx.font = 'bold 32px monospace'
  ctx.fillStyle = '#1f2937'
  ctx.fillText(masked(), canvas.width / 2, 340)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

newWord()
requestAnimationFrame(loop)
```
