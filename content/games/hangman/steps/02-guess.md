---
title: Guessing letters
title_tr: Harf tahmin etmek
skills: [game.input, game.state]
---

# --explanation--

Every key press is a guess, but not every key is a letter. `event.key` is `'a'` for the A key, but also `'Enter'`, `'1'` or
`'Shift'`. So we turn it to capitals and keep it only if it is **one character long** and one of the 26 letters:

```js
const letter = event.key.toUpperCase()
if (letter.length === 1 && LETTERS.includes(letter)) guess(letter)
```

A letter you already tried should cost nothing, so `guess` returns early when `guessed.has(letter)`. Otherwise it remembers
the letter, and if the word does not contain it, that is a miss.

After `MAX_WRONG` misses the game is over for now, so `guess` stops listening. We also show the misses, so you do not waste a
guess on a letter you already know is wrong. The wrong letters are the guessed ones **not** in the word:
`[...guessed].filter((l) => !word.includes(l))`.

# --explanation-tr--

**Bu adımda:** klavyeden harf tahmin edebileceksin. Doğru harfler boşluklara yerleşir; yanlışlar sağ üstte kırmızıyla
listelenir ve `Misses 2 / 6` gibi bir sayaç ıska sayısını gösterir.

**Klavye olayı.** Bir tuşa basılınca tarayıcı `keydown` **olayını** (event) gönderir. Onu dinleriz:

```js
document.addEventListener('keydown', (event) => {
  // her tuşa basılınca burası çalışır; basılan tuş: event.key
})
```

`(event) => { ... }` kısa yazılmış bir fonksiyondur (ok fonksiyonu). `event.key` A tuşu için `'a'`'dır ama `'Enter'`,
`'1'` ya da `'Shift'` de olabilir. Bu yüzden önce `toUpperCase()` ile büyük harfe çeviririz, sonra sadece **tek
karakterse** ve 26 harften biriyse kabul ederiz:

```js
const letter = event.key.toUpperCase()
if (letter.length === 1 && LETTERS.includes(letter)) guess(letter)
```

`===` "**eşit mi?**", `&&` "**ve**" demektir. `LETTERS.includes(letter)` → "harf listesinde bu var mı?" (`true` ya da
`false`). `if (koşul) komut` koşul doğruysa komutu çalıştırır.

**`guess(letter)`: bir tahmin.**

- Zaten denediğin bir harf hiçbir şeye mal olmamalı; oyun bittiyse de (ıskalar `MAX_WRONG`'a ulaştıysa) tahmin
  sayılmamalı. İkisini birden sorarız: `guessed.has(letter) || wrong === MAX_WRONG` (`||` "**veya**"). Doğruysa
  `return` ile fonksiyondan hemen çıkarız, aşağısı çalışmaz.
- Değilse harfi hatırla: `guessed.add(letter)` kümeye ekler.
- `if (!word.includes(letter)) wrong += 1` → kelime bu harfi **içermiyorsa** (`!` "değil") ıskayı 1 artır
  (`+= 1`, `wrong = wrong + 1`'in kısası).

**Yanlış harfleri göstermek.** Yanlış harfler, denenen ama kelimede **olmayan** harflerdir:

```js
[...guessed].filter((l) => !word.includes(l)).join(' ')
```

`[...guessed]` kümeyi listeye çevirir, `.filter(...)` sadece kelimede olmayanları tutar, `.join(' ')` aralarına boşluk
koyup yazıya çevirir: `'Q X'`. Böylece zaten yanlış olduğunu bildiğin bir harfe tahmin harcamazsın.

`'Misses ' + wrong + ' / ' + MAX_WRONG` yazı ile sayıları `+` ile birleştirir: `'Misses 2 / 6'`. `ctx.textAlign =
'left'` yazının sol ucunu verilen noktaya koyar.

# --task--

1. Add `LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'`, `MAX_WRONG = 6` and `wrong` (`0` in `newWord()`).
2. Write `guess(letter)`: do nothing if it was already guessed or `wrong` has reached `MAX_WRONG`; otherwise add it to
   `guessed`, and add 1 to `wrong` if the word does not contain it.
3. On `keydown`, guess the key if it is a single letter (in either case).
4. Draw `Misses 2 / 6` at `(260, 100)` (`'bold 16px sans-serif'`, `'#1f2937'`, left-aligned) and the wrong letters, joined
   with spaces, at `(260, 130)` in `'#b91c1c'`.

# --task-tr--

1. `WORDS` listesini kapatan `]` satırının hemen altına ekle:

   ```js
   const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
   const MAX_WRONG = 6
   ```

2. `let guessed ...` satırının hemen altına ekle:

   ```js
   let wrong
   ```

3. `newWord()` fonksiyonunda `guessed = new Set()` satırının altına ekle:

   ```js
     wrong = 0
   ```

4. `newWord()`'ün kapanış `}`'sinden sonra, `function draw()`'dan önce bir satır boşluk bırakıp şunları ekle:

   ```js
   function guess(letter) {
     if (guessed.has(letter) || wrong === MAX_WRONG) return
     guessed.add(letter)
     if (!word.includes(letter)) wrong += 1
   }

   document.addEventListener('keydown', (event) => {
     const letter = event.key.toUpperCase()
     if (letter.length === 1 && LETTERS.includes(letter)) guess(letter)
   })
   ```

5. `draw()` içinde, arka planı boyayan `ctx.fillRect(...)` satırından sonra ve `ctx.textAlign = 'center'` satırından
   önce bir satır boşluk bırakıp şunu ekle:

   ```js
     ctx.fillStyle = '#1f2937'
     ctx.font = 'bold 16px sans-serif'
     ctx.textAlign = 'left'
     ctx.fillText('Misses ' + wrong + ' / ' + MAX_WRONG, 260, 100)
     ctx.fillStyle = '#b91c1c'
     ctx.fillText([...guessed].filter((l) => !word.includes(l)).join(' '), 260, 130)
   ```

6. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla, sonra harf tuşlarına bas: doğru harfler kelimede görünmeli,
   yanlışlar sağ üstte kırmızıyla listelenmeli ve `Misses` sayısı artmalı. Aynı harfe ikinci kez basmak bir şey
   değiştirmemeli. Alttaki kontrollerin hepsi yeşil olmalı. Yazı kontrolü kırmızıysa `' / '` içindeki boşlukları
   kontrol et.

# --tests--

Letters should be guessed in either case; a repeated letter and other keys should cost nothing.
tr: Harfler büyük ya da küçük tahmin edilebilmeli; tekrarlanan bir harf ve diğer tuşlar hiçbir şeye mal olmamalı.

```js
word = 'CASTLE'
$.press('a')
assert.isTrue(guessed.has('A'))
assert.strictEqual(wrong, 0)
$.press('Z')
assert.strictEqual(wrong, 1)
$.press('z')
assert.strictEqual(wrong, 1, 'the same letter twice costs nothing')
$.press('1')
$.press('Enter')
assert.strictEqual(guessed.size, 2, 'only letters count')
```

After six misses no more guesses should count.
tr: Altı ıskadan sonra başka tahmin sayılmamalı.

```js
word = 'CASTLE'
for (const key of 'bdfghijk') $.press(key)
assert.strictEqual(wrong, MAX_WRONG)
assert.strictEqual(guessed.size, 6, 'no more guesses after the last miss')
```

The misses should be counted and listed.
tr: Iskalar sayılmalı ve listelenmeli.

```js
word = 'CASTLE'
$.press('c')
$.press('q')
$.press('x')
$.tick(1)
assert.include($.texts(), 'C _ _ _ _ _')
assert.include($.texts(), 'Misses 2 / 6')
assert.include($.texts(), 'Q X')
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
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const MAX_WRONG = 6

let word
let guessed // a Set of the letters tried so far
let wrong

// The word with the letters not guessed yet hidden: 'C _ S T _ E'.
const masked = () => [...word].map((letter) => (guessed.has(letter) ? letter : '_')).join(' ')

function newWord() {
  word = WORDS[Math.floor(Math.random() * WORDS.length)]
  guessed = new Set()
  wrong = 0
}

function guess(letter) {
  if (guessed.has(letter) || wrong === MAX_WRONG) return
  guessed.add(letter)
  if (!word.includes(letter)) wrong += 1
}

document.addEventListener('keydown', (event) => {
  const letter = event.key.toUpperCase()
  if (letter.length === 1 && LETTERS.includes(letter)) guess(letter)
})

function draw() {
  ctx.fillStyle = '#fefce8'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#1f2937'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Misses ' + wrong + ' / ' + MAX_WRONG, 260, 100)
  ctx.fillStyle = '#b91c1c'
  ctx.fillText([...guessed].filter((l) => !word.includes(l)).join(' '), 260, 130)

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
