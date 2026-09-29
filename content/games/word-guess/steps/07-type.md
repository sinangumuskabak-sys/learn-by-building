---
title: The typed letters
title_tr: Yazılan harfler
skills: [game.state, prog.functions]
---

# --goal--

What the player types is a string that grows: `current`. `type(key)` adds a letter at the end, but only while there are
fewer than five. `reset()` prepares a new game.

# --goal-tr--

Oyuncunun yazdıkları bir **yazı** (metin) olarak tutulacak: `current` (şu anki). Başta boş (`''`); her harfle sonuna
bir harf eklenir: `''` → `'c'` → `'cr'`...

İki fonksiyon yazıyoruz: `reset` (sıfırla) yeni oyunu hazırlar; `type` (yaz) bir harf ekler, ama beş harf dolduysa
eklemez. Klavyeyi bir sonraki adımda bağlayacağız.

# --code--

```js
let current // the letters typed so far

function reset() {
  current = ''
}

function type(key) {
  if (current.length < 5) current += key
}

reset()
```

# --meaning--

- `current` holds the letters typed so far; `''` is an empty string.
- `current.length` is how many letters it has; `+=` adds `key` at the end.
- `reset()` is called once at the start.

# --meaning-tr--

- `let current` → bir **değişken**: değeri sonradan değişebilen bir ad. Yorum ne tuttuğunu söylüyor.
- `current = ''` → `''` **boş yazı**: hiç harf yok.
- `function type(key)` → `key` bir **parametre**: `type('c')` diye çağırınca içeride `key` `'c'` olur.
- `current.length < 5` → yazıların da uzunluğu vardır: `'cra'.length` 3. Beşten azsa...
- `current += key` → ... harfi **sonuna ekle**: `'cr' + 'a'` = `'cra'`. Yazılarda `+` yan yana ekler.
- En alttaki `reset()` → oyun başlarken bir kez çağır (`requestAnimationFrame(loop)`'tan önce).

# --task--

1. Under `const TOP = 12`, leave an empty line and write `let current`, then `reset` and `type`.
2. At the bottom, write `reset()` above `requestAnimationFrame(loop)`. Press **Run**.

# --task-tr--

1. `const TOP = 12` satırının altına bir boş satır bırakıp `let current` satırını, sonra (aralarında birer boş satırla)
   `reset` ve `type` fonksiyonlarını yaz.
2. En alttaki `requestAnimationFrame(loop)` satırının **üstüne** `reset()` yaz.
3. **Çalıştır**. Ekran değişmez; kontroller fonksiyonları deniyor.

# --tests--

`current` should start empty and grow with `type()`.
tr: `current` boş başlamalı ve `type()` ile büyümeli.

```js
assert.strictEqual(current, '')
type('c')
type('r')
assert.strictEqual(current, 'cr')
```

Only five letters should fit.
tr: Sadece beş harf sığmalı.

```js
for (const k of 'qwertyu') type(k)
assert.strictEqual(current, 'qwert')
reset()
assert.strictEqual(current, '')
```

# --solution--

```js
// Word guessing game, step by step.
// The page already has <canvas id="game" width="360" height="560"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TRIES = 6
const SIZE = 56 // one letter tile
const GAP = 6
const LEFT = (canvas.width - 5 * SIZE - 4 * GAP) / 2
const TOP = 12

let current // the letters typed so far

function reset() {
  current = ''
}

function type(key) {
  if (current.length < 5) current += key
}

function draw() {
  ctx.fillStyle = '#18181b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let row = 0; row < TRIES; row++) {
    for (let i = 0; i < 5; i++) {
      const x = LEFT + i * (SIZE + GAP)
      const y = TOP + row * (SIZE + GAP)
      ctx.strokeStyle = '#3f3f46'
      ctx.lineWidth = 2
      ctx.strokeRect(x + 1, y + 1, SIZE - 2, SIZE - 2)
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
