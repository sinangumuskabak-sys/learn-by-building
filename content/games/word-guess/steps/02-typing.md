---
title: Typing letters
title_tr: Harf yazmak
skills: [game.input]
---

# --explanation--

Typing is a string that grows and shrinks. A letter key adds to the end (while there is room for it), Backspace removes
the last letter:

```js
current += key                 // 'cr' + 'a' -> 'cra'
current = current.slice(0, -1) // 'cra' -> 'cr'
```

`slice(0, -1)` means "from the start up to, but not including, the last character". Negative positions count from the
end, which is handy for strings and arrays alike.

The keyboard sends all kinds of keys, so be strict about what counts as a letter: exactly one character from `a` to
`z`, tested with a **regular expression**, `/^[a-z]$/`. `^` and `$` mean "the whole string", so `'Shift'` or `'F5'` do
not sneak in. Pressing `A` with Shift or Caps Lock gives `'A'`, so single characters are turned into lower case first.
Shortcuts like Ctrl+R should still work, so keys held with Ctrl, Cmd or Alt are left alone.

The letters are drawn big and upper case in the first row, and tiles that have a letter get a brighter outline.

# --explanation-tr--

Yazmak büyüyüp küçülen bir metindir. Bir harf tuşu (yer oldukça) sona ekler, Backspace son harfi siler:

```js
current += key                 // 'cr' + 'a' -> 'cra'
current = current.slice(0, -1) // 'cra' -> 'cr'
```

`slice(0, -1)` "baştan son karaktere kadar, sonuncusu hariç" demektir. Negatif konumlar sondan sayar; bu hem metinler hem
diziler için işe yarar.

Klavye her türden tuş gönderir; bu yüzden neyin harf sayıldığı konusunda katı ol: `a` ile `z` arasında tam olarak bir karakter,
bir **düzenli ifadeyle** sınanır: `/^[a-z]$/`. `^` ve `$` "metnin tamamı" demektir; böylece `'Shift'` ya da `'F5'` araya
sızmaz. Shift ya da Caps Lock ile `A`'ya basmak `'A'` verir; bu yüzden tek karakterler önce küçük harfe çevrilir. Ctrl+R gibi
kısayollar yine çalışsın diye Ctrl, Cmd ya da Alt ile basılan tuşlara dokunulmaz.

Harfler ilk satıra büyük ve büyük harfle çizilir ve harfi olan döşemeler daha parlak bir çerçeve alır.

# --task--

1. Add `current` (`''` in `reset()`) and write `type(key)`: `'Backspace'` removes the last letter; a single letter `a`–`z`
   is added if fewer than 5 are typed.
2. On `keydown`, ignore keys held with Ctrl, Cmd (`metaKey`) or Alt. Turn one-character keys into lower case. For
   `Backspace` or a letter, `preventDefault()` and `type()` it.
3. Draw the typed letters in the first row: white, `'bold 28px sans-serif'`, upper case, centered in their tile
   (`textAlign` `'center'`, `textBaseline` `'middle'`, at `y + SIZE / 2 + 1`). Tiles with a letter get a `'#a1a1aa'` outline.

# --task-tr--

1. `current` ekle (`reset()`'te `''`) ve `type(key)` yaz: `'Backspace'` son harfi siler; `a`–`z` arası tek bir harf, 5'ten az
   yazıldıysa eklenir.
2. `keydown`'da Ctrl, Cmd (`metaKey`) ya da Alt ile basılan tuşları yok say. Tek karakterli tuşları küçük harfe çevir.
   `Backspace` ya da bir harf için `preventDefault()` yap ve onu `type()` et.
3. Yazılan harfleri ilk satıra çiz: beyaz, `'bold 28px sans-serif'`, büyük harf, döşemelerinde ortalı (`textAlign` `'center'`,
   `textBaseline` `'middle'`, `y + SIZE / 2 + 1`'de). Harfi olan döşemeler `'#a1a1aa'` bir çerçeve alır.

# --tests--

Letter keys should type and Backspace should delete.
tr: Harf tuşları yazmalı, Backspace silmeli.

```js
$.press('c')
$.press('R')
$.press('a')
assert.strictEqual(current, 'cra')
$.press('Backspace')
assert.strictEqual(current, 'cr')
```

Only five letters should fit, and other keys should be ignored.
tr: Yalnızca beş harf sığmalı ve diğer tuşlar yok sayılmalı.

```js
for (const k of ['q', '1', 'Shift', 'w', 'e', 'F5', 'r', 't', 'y']) $.press(k)
assert.strictEqual(current, 'qwert')
```

The typed letters should be drawn in the first row.
tr: Yazılan harfler ilk satıra çizilmeli.

```js
$.press('h')
$.press('i')
$.tick(1)
const texts = $.screen().filter((c) => c.op === 'fillText')
assert.deepEqual(texts.map((c) => c.args[0]), ['H', 'I'])
assert.deepEqual(texts.map((c) => [c.args[1], c.args[2]]), [[56, 41], [118, 41]])
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
    // For now every letter goes in the first row.
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
