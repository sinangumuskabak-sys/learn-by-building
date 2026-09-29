---
title: Backspace
title_tr: Silme tuşu
skills: [game.input]
---

# --goal--

Backspace removes the last letter: `slice(0, -1)` is everything but the last character. Since `type` now gets keys that
are not letters, it checks for a letter itself too.

# --goal-tr--

Yanlış yazdın mı? **Backspace** son harfi silsin. Yazının son harfi hariç hepsini almanın kısa yolu: `slice(0, -1)`.

`type` artık harf olmayan bir tuş da alacak (`'Backspace'`); bu yüzden harf mi diye kendisi de sorsun. Birazdan ekran
klavyesi de `type`'ı çağıracak; kontrolün orada olması iyi.

# --code--

```js
function type(key) {
  if (key === 'Backspace') current = current.slice(0, -1)
  else if (/^[a-z]$/.test(key) && current.length < 5) current += key
}

  if (key === 'Backspace' || /^[a-z]$/.test(key)) {
```

# --meaning--

- `slice(0, -1)` takes the text from the start up to, but not including, the last character. Negative positions count
  from the end.
- `else if` is checked only when the first `if` was false.
- The listener now also passes Backspace on.

# --meaning-tr--

- `current.slice(0, -1)` → yazının bir **dilimi**: baştan (0) başlayıp sondan birinciye (−1) kadar, o hariç. `'cra'` →
  `'cr'`. Eksi sayılar sondan sayar. Boş yazıda da hata vermez.
- `else if (...)` → "**değilse**, şunu sor": Backspace değilse, harfse ve yer varsa ekle.
- `/^[a-z]$/.test(key) && current.length < 5` → `&&` "**ve**": ikisi de doğru olmalı.
- Dinleyicide `key === 'Backspace' ||` → `||` "**veya**": Backspace **veya** bir harfse `type`'a gönder.

# --task--

1. In `type`, replace the line with the two lines shown.
2. In the listener, add `key === 'Backspace' || ` to the `if`. Press **Run**.

# --task-tr--

1. `type` içindeki satırı kod bloğundaki iki satırla değiştir.
2. Dinleyicideki `if (/^[a-z]$/.test(key))` koşulunun başına `key === 'Backspace' || ` ekle.
3. **Çalıştır**, yaz ve Backspace'e bas.

# --tests--

Backspace should delete the last letter.
tr: Backspace son harfi silmeli.

```js
for (const k of 'cra') $.press(k)
$.press('Backspace')
assert.strictEqual(current, 'cr')
$.press('Backspace')
$.press('Backspace')
$.press('Backspace')
assert.strictEqual(current, '')
```

`type` should ignore anything that is not a letter or Backspace.
tr: `type` harf ya da Backspace olmayan her şeyi yok saymalı.

```js
type('a')
type('Shift')
type('7')
assert.strictEqual(current, 'a')
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
  if (key === 'Backspace') current = current.slice(0, -1)
  else if (/^[a-z]$/.test(key) && current.length < 5) current += key
}

document.addEventListener('keydown', (event) => {
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
