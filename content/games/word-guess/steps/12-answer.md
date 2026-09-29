---
title: A secret word
title_tr: Gizli bir kelime
skills: [prog.arrays]
---

# --goal--

The answer is picked at random from a list of five-letter words each time a game starts.

# --goal-tr--

Oyunun kalbi: **gizli kelime**. Beş harfli kelimelerden bir liste yazıp her oyunda içinden **rastgele** birini
seçeceğiz: `answer` (cevap). Torbadan göz kapalı bir kâğıt çekmek gibi.

# --code--

```js
const WORDS = ['apple', 'beach', 'brain', 'bread', 'brick', 'chair', 'chess', 'clock', 'cloud', 'crane', 'dance', 'dream',
  'drink', 'eagle', 'earth', 'flame', 'fruit', 'ghost', 'glass', 'grape', 'green', 'heart', 'horse', 'house', 'juice',
  'knife', 'laugh', 'lemon', 'light', 'magic', 'money', 'mouse', 'music', 'night', 'ocean', 'paint', 'party', 'piano',
  'pilot', 'plane', 'plant', 'pride', 'queen', 'radio', 'river', 'robot', 'sheep', 'shirt', 'smile', 'snake', 'space',
  'spoon', 'storm', 'sugar', 'table', 'tiger', 'toast', 'train', 'water', 'whale', 'world', 'zebra']

let answer

function reset() {
  answer = WORDS[Math.floor(Math.random() * WORDS.length)]
```

# --meaning--

- `WORDS` is an array: an ordered list of words in lower case, like the typed letters.
- `WORDS.length` is how many there are; `Math.random()` gives a number from 0 up to 1; times the length, rounded down
  with `Math.floor`, it is a random index.
- `reset` picks a new answer for every game.

# --meaning-tr--

- `const WORDS = [ ... ]` → bir **dizi** (array): köşeli parantez içinde, virgülle ayrılmış **sıralı bir liste**.
  Kelimeler küçük harf, çünkü yazdıklarımızı da küçük harfe çeviriyoruz.
- `WORDS[...]` → köşeli parantez içine bir **sıra numarası** yazınca o elemanı verir. Sayma 0'dan başlar.
- `Math.random()` → 0 ile 1 arasında (1 hariç) rastgele bir ondalık sayı. `* WORDS.length` → 0 ile kelime sayısı
  arası. `Math.floor(...)` → **aşağı yuvarlar**: rastgele bir tam sıra numarası.
- `answer = ...` → `reset` içinde: her yeni oyun yeni bir kelime.

# --task--

1. Under `const ctx = ...` and its empty line, write the `WORDS` list (you may copy it).
2. Above `let current`, write `let answer`.
3. In `reset`, write the `answer = ...` line at the top. Press **Run**.

# --task-tr--

1. `const ctx = ...` satırından sonraki boş satırın altına `WORDS` listesini yaz (bu listeyi kopyalayıp
   yapıştırabilirsin); `const TRIES` satırı hemen altında kalsın.
2. `let current` satırının **üstüne** `let answer` yaz.
3. `reset` içinde **en üste** `answer = ...` satırını yaz.
4. **Çalıştır**. Kelime gizli; kontroller onu okuyor.

# --tests--

The answer should be a random word from the list.
tr: Cevap listeden rastgele bir kelime olmalı.

```js
assert.include(WORDS, answer)
const seen = new Set()
for (let i = 0; i < 100; i++) {
  reset()
  seen.add(answer)
}
assert.isAbove(seen.size, 20, 'the words are picked at random')
```

Every word should be five lower-case letters.
tr: Her kelime beş küçük harf olmalı.

```js
for (const w of WORDS) assert.match(w, /^[a-z]{5}$/, w)
```

# --solution--

```js
// Word guessing game, step by step.
// The page already has <canvas id="game" width="360" height="560"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const WORDS = ['apple', 'beach', 'brain', 'bread', 'brick', 'chair', 'chess', 'clock', 'cloud', 'crane', 'dance', 'dream',
  'drink', 'eagle', 'earth', 'flame', 'fruit', 'ghost', 'glass', 'grape', 'green', 'heart', 'horse', 'house', 'juice',
  'knife', 'laugh', 'lemon', 'light', 'magic', 'money', 'mouse', 'music', 'night', 'ocean', 'paint', 'party', 'piano',
  'pilot', 'plane', 'plant', 'pride', 'queen', 'radio', 'river', 'robot', 'sheep', 'shirt', 'smile', 'snake', 'space',
  'spoon', 'storm', 'sugar', 'table', 'tiger', 'toast', 'train', 'water', 'whale', 'world', 'zebra']
const TRIES = 6
const SIZE = 56 // one letter tile
const GAP = 6
const LEFT = (canvas.width - 5 * SIZE - 4 * GAP) / 2
const TOP = 12

let answer
let current // the letters typed so far

function reset() {
  answer = WORDS[Math.floor(Math.random() * WORDS.length)]
  current = ''
}

function type(key) {
  if (key === 'Backspace') current = current.slice(0, -1)
  else if (/^[a-z]$/.test(key) && current.length < 5) current += key
}

document.addEventListener('keydown', (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
  if (key === 'Backspace' || /^[a-z]$/.test(key)) {
    event.preventDefault()
    type(key)
  }
})

function draw() {
  ctx.fillStyle = '#18181b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  for (let row = 0; row < TRIES; row++) {
    const letters = row === 0 ? current : ''
    for (let i = 0; i < 5; i++) {
      const x = LEFT + i * (SIZE + GAP)
      const y = TOP + row * (SIZE + GAP)
      ctx.strokeStyle = letters[i] ? '#a1a1aa' : '#3f3f46'
      ctx.lineWidth = 2
      ctx.strokeRect(x + 1, y + 1, SIZE - 2, SIZE - 2)
      if (letters[i]) {
        ctx.fillStyle = 'white'
        ctx.font = 'bold 28px sans-serif'
        ctx.fillText(letters[i].toUpperCase(), x + SIZE / 2, y + SIZE / 2 + 1)
      }
    }
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
