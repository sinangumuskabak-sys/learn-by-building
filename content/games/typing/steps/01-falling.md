---
title: Falling words
title_tr: Düşen kelimeler
skills: [game.loop, prog.arrays]
---

# --explanation--

In this game words fall from the sky, and you type them before they land. It is a fun way to practise typing, and a good
exercise in **text on a canvas**.

The words are objects in an array: `{ text, x, y }`. Two timers run the rain. A **spawn timer** counts down every frame, and
at zero a new word appears at the top and the timer starts again. Meanwhile every word moves down by `SPEED`. A word that
passes the red ground line is removed.

Where can a new word start? Not so far right that it hangs off the edge. We need to know how **wide** the word will be, and
the canvas can tell us: set the font, then `ctx.measureText(text).width` returns the width in pixels. The left edge can then
be anywhere from 10 to `canvas.width - 10 - width`.

With `textAlign = 'left'`, `fillText(text, x, y)` puts the start of the text at `x` and its **baseline** (the line the letters
sit on) at `y`.

# --explanation-tr--

**Bu adımda:** gökyüzünden kelimeler yağdıracağız. Sağda, koyu bir zeminde yukarıdan yavaşça aşağı süzülen İngilizce
kelimeler ve altta kırmızı bir yer çizgisi göreceksin. Çizgiyi geçen kelime kaybolacak. (Yazma işini sonraki adımda
ekleyeceğiz.)

**Kod nedir, nerede yazılır?** Soldaki kod panelindeki `game.js` dosyası, bilgisayara verdiğin talimatların listesidir.
Bilgisayar onları **yukarıdan aşağıya, satır satır** okur. `//` ile başlayan yazılar **yorumdur**: bilgisayar atlar,
sadece insanlar için not.

**Canvas ve fırça.** Sayfada 480×480 piksellik boş bir resim alanı (`<canvas id="game">`) var. Önce onu buluruz, sonra
çizim aracını (bağlam, **context**) alırız:

```js
const canvas = document.getElementById('game') // "game" kimlikli alanı bul
const ctx = canvas.getContext('2d')            // onun fırçasını al
```

- `const ad = ...` → "bundan sonra şuna `ad` diyeceğim". Buna **sabit** denir: bir kutuya etiket yapıştırmak gibi,
  değeri bir daha değişmez. Nokta (`.`) "bunun içindeki şu şey" demektir. Tırnak içindeki `'game'` bir **yazıdır**.
- `ctx.fillStyle = '#020617'` renk seçer; `ctx.fillRect(x, y, genişlik, yükseklik)` dikdörtgen boyar. Sol üst köşe
  `(0, 0)`'dır; `x` sağa, `y` **aşağı** gittikçe büyür.

**Değişken (`let`).** `let words` "adı `words` olan bir kutu aç, içini sonra koyacağım" demektir. `const`'tan farkı, içi
sonradan değiştirilebilir. `spawnTimer -= 1` "içindeki sayıdan 1 çıkar", `w.y += SPEED` "üstüne `SPEED` ekle" demektir.

**Dizi (array) ve nesne (object).** Dizi sıralı bir listedir: `['cat', 'sun']`. Sıra numarası (**index**) **0'dan başlar**:
`WORDS[0]` ilk kelimedir, `WORDS.length` kaç kelime olduğudur. Ekrandaki her kelime bir **nesnedir**, yani adlandırılmış
değerlerden oluşan küçük bir kart: `{ text: 'cat', x: 50, y: 30 }`. İçindeki değere nokta ile ulaşırsın: `w.y`. Bütün
kartlar `words` dizisinde durur; `words.push(kart)` listenin sonuna yeni bir kart ekler.

**Fonksiyon.** Bir işe ad verip paketlemektir, yemek tarifi gibi: `function spawn() { ... }` tarifi **yazar**,
`spawn()` ise **çalıştırır**.

**Rastgele kelime ve yer.** `Math.random()` 0 ile 1 arasında rastgele bir sayı verir. `Math.random() * WORDS.length` 0 ile
kelime sayısı arasında bir sayıdır; `Math.floor` onu aşağı yuvarlar (`3.7` → `3`) ve geçerli bir index olur.
Kelime ekrandan taşmasın diye önce **genişliğini** ölçeriz: yazı tipini seçip `ctx.measureText(text).width` ile.
Sonra sol kenarı 10 ile `canvas.width - 10 - genişlik` arasında rastgele seçeriz.

**İki sayaç yağmuru yönetir.** `spawnTimer` her karede 1 azalır; 0'a ya da altına düşünce (`<=` "küçük ya da eşit")
yeni kelime gelir ve sayaç `SPAWN_EVERY`'ye kurulur. Bu arada her kelime `SPEED` kadar aşağı iner.

- `if (koşul) { ... }` → "koşul doğruysa `{ }` içini yap".
- `for (const w of words) ...` → "listedeki her kelime için, ona `w` diyerek şunu yap". Buna **döngü** denir.
- `words.filter((w) => w.y <= GROUND)` → yalnızca yer çizgisinin üstünde kalanları tutan yeni bir liste. `(w) => ...`
  kısa bir fonksiyondur: "her `w` için şu soruyu sor".

**Yazı çizmek.** `ctx.font = FONT` yazı tipini, `ctx.textAlign = 'left'` hizayı seçer. `ctx.fillText(yazı, x, y)`
yazının başını `x`'e, harflerin oturduğu çizgiyi (**taban çizgisi**, baseline) `y`'ye koyar.

**Oyun döngüsü.** `requestAnimationFrame(loop)` tarayıcıya "bir sonraki ekran yenilemesinde `loop`'u çalıştır" der.
`loop` önce günceller, sonra çizer ve kendini yeniden sıraya koyar; böylece saniyede yaklaşık 60 kez (60 **kare**)
çalışır.

# --task--

1. Add a `WORDS` list (at least 30 words, small letters only), `GROUND = 330`, `SPEED = 0.35`, `SPAWN_EVERY = 138` and
   `FONT = 'bold 20px monospace'`.
2. Write `spawn()`: a random word at `y = 30` (just under the score) and a random `x` from 10 to `canvas.width - 10` minus its measured width.
3. `reset()` starts with no words and `spawnTimer = 0`. Write `update()`, called before `draw()`: count `spawnTimer` down and
   at `0` (or below) spawn and set it to `SPAWN_EVERY`; move every word down by `SPEED`; remove words below `GROUND`.
4. Draw: fill `'#020617'`, a `'#7f1d1d'` line 3 high at `GROUND + 4`, and every word in `'#cbd5e1'` with `FONT`, left-aligned.

# --task-tr--

1. Kod panelinde en alttaki `// Write your code below.` satırının **altına** canvas'ı ve fırçayı al:

   ```js
   const canvas = document.getElementById('game')
   const ctx = canvas.getContext('2d')
   ```

2. Bir satır boşluk bırakıp kelime listesini ve ayarları ekle. Liste en az 30 kelime olmalı ve yalnız küçük harf
   içermeli; bu listeyi olduğu gibi kopyalayabilirsin:

   ```js
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
   ```

3. Altına iki değişkeni ekle:

   ```js
   let words // { text, x, y }
   let spawnTimer
   ```

4. Altına yeni kelime çıkaran `spawn()`'u ve baştan kuran `reset()`'i yaz:

   ```js
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
   ```

   `{ text, x: ..., y: 30 }` içindeki tek başına `text`, `text: text` demenin kısa yoludur.

5. Altına her karede dünyayı ilerleten `update()`'i yaz:

   ```js
   function update() {
     spawnTimer -= 1
     if (spawnTimer <= 0) {
       spawn()
       spawnTimer = SPAWN_EVERY
     }
     for (const w of words) w.y += SPEED
     words = words.filter((w) => w.y <= GROUND)
   }
   ```

6. Altına çizim fonksiyonunu yaz: zemin, kırmızı yer çizgisi ve kelimeler:

   ```js
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
   ```

7. En alta oyun döngüsünü ve başlatan satırları ekle:

   ```js
   function loop() {
     update()
     draw()
     requestAnimationFrame(loop)
   }

   reset()
   requestAnimationFrame(loop)
   ```

8. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Üstte hemen bir kelime belirmeli ve yavaşça aşağı inmeli; birkaç saniyede
   bir yenisi gelmeli. Alttaki kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa parantez ve tırnakları kontrol et: her
   `(`, `{`, `[` kapanmalı, her kelime tırnak içinde ve aralarında virgül olmalı.

# --tests--

The first word should appear at once, and fit on the screen.
tr: İlk kelime hemen belirmeli ve ekrana sığmalı.

```js
assert.isAtLeast(WORDS.length, 30)
for (const w of WORDS) assert.match(w, /^[a-z]+$/, 'small letters only')
assert.lengthOf(words, 0)
$.tick(1)
assert.lengthOf(words, 1, 'the first word comes at once')
assert.include(WORDS, words[0].text)
assert.isAtLeast(words[0].x, 10)
ctx.font = FONT
assert.isAtMost(words[0].x + ctx.measureText(words[0].text).width, canvas.width - 10, 'the word fits on the screen')
```

Words should fall, keep coming, and disappear past the ground.
tr: Kelimeler düşmeli, gelmeye devam etmeli ve zemini geçince kaybolmalı.

```js
$.tick(1)
const y = words[0].y
$.tick(10)
assert.isAbove(words[0].y, y, 'words fall')
$.tick(200)
assert.isAtLeast(words.length, 2, 'more words keep coming')
words = [{ text: 'cat', x: 10, y: GROUND - 0.1 }]
spawnTimer = 1000
$.tick(1)
assert.lengthOf(words, 0, 'a word past the ground is gone')
```

Each word should be drawn where it is.
tr: Her kelime bulunduğu yerde çizilmeli.

```js
spawnTimer = 1000
words = [{ text: 'rocket', x: 40, y: 120 }]
$.tick(1)
const t = $.screen().filter((c) => c.op === 'fillText' && c.args[0] === 'rocket')
assert.lengthOf(t, 1)
assert.closeTo(t[0].args[1], 40, 1e-9)
assert.isAbove(t[0].args[2], 120)
```

# --seed--

```js
// Typing game, step by step.
// The page already has <canvas id="game" width="480" height="480"></canvas>.
// Write your code below.
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
