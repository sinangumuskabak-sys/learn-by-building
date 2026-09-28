---
title: A hidden word
title_tr: Gizli bir kelime
skills: [prog.arrays, prog.functions]
---

# --explanation--

Hangman is a word game: the computer picks a secret word and shows only a row of blanks, one per letter. You guess letters;
right ones are filled in, wrong ones slowly draw a stick figure on the gallows.

The secret word comes from a list: `WORDS[Math.floor(Math.random() * WORDS.length)]` picks any index from `0` to
`WORDS.length - 1`.

The letters you have tried go into a **`Set`**. A `Set` is like an array that holds each value at most once, and asking
`guessed.has('E')` is instant. Both are exactly what guessing needs.

The blanks come from one line. Spread the word into letters, show each letter if it has been guessed and `_` if not, and join
them with spaces so `_ _` does not look like one long line:

```js
[...word].map((letter) => (guessed.has(letter) ? letter : '_')).join(' ')
```

A **monospace** font gives every character the same width, so the blanks and the letters line up whatever the word is.

# --explanation-tr--

**Bu adımda:** adam asmaca oyununun gizli kelimesini seçip ekrana boşluklar halinde yazacağız. Sağda açık sarı bir
zeminde `_ _ _ _ _ _` gibi, kelimenin her harfi için bir çizgi göreceksin.

**Oyun nasıl oynanır?** Bilgisayar gizli bir kelime seçer ve sadece harf sayısı kadar boşluk gösterir. Sen harf
tahmin edersin; doğrular yerine yerleşir, yanlışlar yavaş yavaş darağacında bir çöp adam çizer.

**Kod nedir, nerede yazılır?** Soldaki kod panelindeki `game.js` dosyası, bilgisayara verdiğin talimatların
listesidir. Bilgisayar onları **yukarıdan aşağıya, satır satır** okur. `//` ile başlayan yazılar **yorumdur**:
bilgisayar onları atlar, sadece insanlar için not.

**Canvas ve fırça.** Sayfada 480×480 piksellik bir çizim alanı (**canvas**, kimliği `game`) var. Önce onu buluruz,
sonra çizim aracını (**context**, bağlam) alırız:

```js
const canvas = document.getElementById('game')  // kâğıdı bul
const ctx = canvas.getContext('2d')             // fırçayı al
```

`const ad = ...` bir şeye ad verir (**sabit**); `let ad` ise değeri sonradan değişebilen bir kutu açar (**değişken**).
Nokta (`.`) "bunun içindeki şu komut" demektir; tırnak içindeki `'APPLE'` bir **yazıdır** (metin). Canvas'ın sol üst
köşesi `(0, 0)`'dır; `x` sağa, `y` aşağı doğru büyür. `ctx.fillStyle = 'renk'` rengi seçer,
`ctx.fillRect(x, y, en, boy)` dikdörtgen boyar, `ctx.fillText(yazı, x, y)` yazı yazar.

**Kelime listesi: dizi.** `WORDS = ['APPLE', 'BANANA', ...]` bir **dizidir** (array): köşeli parantez içinde,
virgülle ayrılmış sıralı liste. `WORDS[0]` ilk eleman (sayma 0'dan başlar), `WORDS.length` eleman sayısıdır.

**Rastgele seçmek.** `Math.random()` 0 ile 1 arasında (1 hariç) rastgele bir ondalık sayı verir. Onu kelime sayısıyla
çarpıp `Math.floor` ile aşağı yuvarlarız: `WORDS[Math.floor(Math.random() * WORDS.length)]` → 0 ile son sıra arasında
rastgele bir kelime.

**Tahmin edilen harfler: `Set`.** Denediğin harfleri bir **`Set`** (küme) içinde tutarız. `Set` her değeri **en fazla
bir kez** tutan bir listedir; `guessed.has('E')` "E denendi mi?" sorusunu anında cevaplar. `new Set()` boş bir küme
oluşturur.

**Boşlukları üretmek.** Tek satırda:

```js
[...word].map((letter) => (guessed.has(letter) ? letter : '_')).join(' ')
```

Parça parça:

- `[...word]` → kelimeyi harflerine ayırır: `'ZEBRA'` → `['Z', 'E', 'B', 'R', 'A']`.
- `.map((letter) => ...)` → her harf için küçük fonksiyonu çalıştırıp yeni bir liste yapar. `(letter) => ...` kısa
  yazılmış bir **fonksiyondur** (ok fonksiyonu): `letter` verilir, oktan sonrası sonuçtur.
- `guessed.has(letter) ? letter : '_'` → kısa bir `if`: "harf denendiyse harfin kendisi, değilse `_`".
- `.join(' ')` → listeyi aralarına boşluk koyarak tek yazıya çevirir. Böylece `__` tek uzun çizgi gibi görünmez.

**Fonksiyon.** `function newWord() { ... }` içindeki kodlara ad verir; `newWord()` diye **çağırınca** çalışır.
`const masked = () => ...` da bir fonksiyondur; `masked()` diye çağrılınca yazıyı geri verir.

**Eşit genişlikte yazı.** `monospace` yazı tipinde her karakter aynı genişliktedir; harfler ve çizgiler hep hizalı
durur.

**Oyun döngüsü.** `requestAnimationFrame(loop)` tarayıcıya "bir sonraki karede `loop`'u çağır" der; `loop` sonunda
kendini yine istediği için ekran saniyede ~60 kez yeniden çizilir.

# --task--

1. Add a `WORDS` list of at least 40 words in capital letters (A to Z only).
2. Write `newWord()`: pick a random `word` and start `guessed` as an empty `Set`. Call it at the start.
3. Write `masked()`: the word with every letter not in `guessed` shown as `_`, separated by spaces.
4. Each frame fill the canvas with `'#fefce8'` and draw `masked()` centered at `y = 340`, `'bold 32px monospace'`,
   `'#1f2937'`.

# --task-tr--

1. Kod panelinde en alttaki `// Write your code below.` satırının **altına** tıkla ve şunu yaz:

   ```js
   const canvas = document.getElementById('game')
   const ctx = canvas.getContext('2d')
   ```

2. Bir satır boşluk bırak ve kelime listesini ekle (kopyalayıp yapıştırabilirsin; en az 40 kelime olmalı, hepsi
   A–Z arası büyük harf):

   ```js
   const WORDS = [
     'APPLE', 'BANANA', 'CASTLE', 'DRAGON', 'ELEPHANT', 'FOREST', 'GARDEN', 'HAMMER', 'ISLAND', 'JACKET',
     'KITCHEN', 'LEMON', 'MONKEY', 'NOTEBOOK', 'ORANGE', 'PENGUIN', 'QUEEN', 'ROCKET', 'SPIDER', 'TIGER',
     'UMBRELLA', 'VIOLIN', 'WINDOW', 'YELLOW', 'ZEBRA', 'BRIDGE', 'CANDLE', 'DOLPHIN', 'ENGINE', 'FLOWER',
     'GUITAR', 'HONEY', 'IGLOO', 'JUNGLE', 'KANGAROO', 'LADDER', 'MARKET', 'NEEDLE', 'OCEAN', 'PIRATE',
     'RABBIT', 'SILVER', 'TURTLE', 'VALLEY', 'WIZARD', 'PLANET', 'COOKIE', 'PUZZLE', 'KEYBOARD', 'CAMERA',
   ]
   ```

3. Bir satır boşluk bırak ve değişkenleri, `masked`'ı ve `newWord`'ü ekle:

   ```js
   let word
   let guessed // a Set of the letters tried so far

   // The word with the letters not guessed yet hidden: 'C _ S T _ E'.
   const masked = () => [...word].map((letter) => (guessed.has(letter) ? letter : '_')).join(' ')

   function newWord() {
     word = WORDS[Math.floor(Math.random() * WORDS.length)]
     guessed = new Set()
   }
   ```

4. Bir satır boşluk bırak ve çizim fonksiyonunu yaz:

   ```js
   function draw() {
     ctx.fillStyle = '#fefce8'
     ctx.fillRect(0, 0, canvas.width, canvas.height)

     ctx.textAlign = 'center'
     ctx.font = 'bold 32px monospace'
     ctx.fillStyle = '#1f2937'
     ctx.fillText(masked(), canvas.width / 2, 340)
   }
   ```

   `ctx.textAlign = 'center'` yazının ortasını verilen noktaya koyar; `canvas.width / 2` canvas'ın ortasıdır (`/`
   bölme).

5. Altına oyun döngüsünü yaz ve en sonda ikisini başlat:

   ```js
   function loop() {
     draw()
     requestAnimationFrame(loop)
   }

   newWord()
   requestAnimationFrame(loop)
   ```

6. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Sağda açık sarı zeminde, kelimenin harf sayısı kadar `_` görmelisin;
   her çalıştırmada kelime değişebilir. Alttaki kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa tırnakları, virgülleri
   ve parantezleri harf harf karşılaştır.

# --tests--

The words should be capital letters, and a random one should be picked.
tr: Kelimeler büyük harf olmalı ve rastgele biri seçilmeli.

```js
assert.isAtLeast(WORDS.length, 40)
for (const w of WORDS) assert.match(w, /^[A-Z]+$/, 'capital letters only')
assert.include(WORDS, word)
assert.strictEqual(guessed.size, 0)
const seen = new Set()
for (let i = 0; i < 200; i++) {
  newWord()
  seen.add(word)
}
assert.isAbove(seen.size, 20, 'the words are picked at random')
```

`masked` should show guessed letters and hide the others.
tr: `masked` tahmin edilen harfleri göstermeli, diğerlerini gizlemeli.

```js
word = 'CASTLE'
guessed = new Set()
assert.strictEqual(masked(), '_ _ _ _ _ _')
guessed = new Set(['A', 'E', 'Z'])
assert.strictEqual(masked(), '_ A _ _ _ E')
guessed = new Set([...'CASTLE'])
assert.strictEqual(masked(), 'C A S T L E')
```

The masked word should be drawn.
tr: Gizlenmiş kelime çizilmeli.

```js
word = 'TIGER'
guessed = new Set(['I'])
$.tick(1)
assert.include($.texts(), '_ I _ _ _')
```

# --seed--

```js
// Hangman, step by step.
// The page already has <canvas id="game" width="480" height="480"></canvas>.
// Write your code below.
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
