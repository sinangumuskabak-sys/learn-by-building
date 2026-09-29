---
title: Shift a letter
title_tr: Bir harfi kaydır
skills: [prog.functions]
---

# --goal--

Now a secret code: the Caesar cipher replaces each letter with the one 3 places later in the alphabet. First, a
function that shifts one letter.

# --goal-tr--

Şimdi gizli yazı! **Sezar şifresi**, her harfi alfabede birkaç harf **ileridekiyle** değiştirir: 3 kaydırınca `a` →
`d`, `b` → `e` olur. Jül Sezar'ın ordusuna böyle mesaj yolladığı anlatılır.

Önce tek bir harfi kaydıran bir fonksiyon yazıyoruz. `z`'den sonra alfabe biter; oradan **başa döneceğiz**.

# --code--

```js
const alphabet = 'abcdefghijklmnopqrstuvwxyz'

function shiftLetter(letter, shift) {
  const i = alphabet.indexOf(letter)
  if (i === -1) return letter
  return alphabet[(i + shift) % 26]
}
```

# --meaning--

- `alphabet.indexOf(letter)` is the letter's position (a is 0, z is 25), or `-1` if it is not a letter.
- Anything that is not a letter (space, dot) comes back as it is.
- `% 26` is the remainder after dividing by 26: 25 + 3 = 28 becomes 2, so `z` turns into `c`.

# --meaning-tr--

- `const alphabet = '...'` → İngiliz alfabesinin 26 küçük harfi, sırayla.
- `function shiftLetter(letter, shift)` → iki **parametreli** fonksiyon: hangi harf, kaç kaydırma.
- `alphabet.indexOf(letter)` → harfin alfabedeki **sırası**: `a` 0, `b` 1, ..., `z` 25. Alfabede yoksa (boşluk,
  nokta) `-1`.
- `if (i === -1) return letter` → harf değilse **olduğu gibi** geri ver.
- `(i + shift) % 26` → `%` **bölümden kalan**. `z` (25) + 3 = 28; 28'in 26'ya bölümünden kalan 2 → `c`. Böylece
  alfabenin sonundan **başa sarar**.
- `alphabet[...]` → o sıradaki harf.

# --task--

Write the alphabet and `shiftLetter` at the top of the script, before `box`.

# --task-tr--

Alfabeyi ve `shiftLetter` fonksiyonunu betiğin **en üstüne**, `const box` satırının üstüne yaz. **Çalıştır**.

# --predict--

What is `shiftLetter('y', 3)`?
- [ ] Nothing: there are no letters after `z`
  `% 26` wraps around to the start of the alphabet.
- [x] `b`: after `z` it goes back to `a` (y, z, a, b)
- [ ] `undefined`

# --predict-tr--

`shiftLetter('y', 3)` ne verir?
- [ ] Hiçbir şey: `z`'den sonra harf yok
  `% 26` alfabenin başına sardırır.
- [x] `b`: `z`'den sonra `a`'ya döner (y, z, a, b)
- [ ] `undefined`

# --hint--

Use `% 26` so positions past `z` wrap back to the start.

# --hint-tr--

`z`'yi geçen sıraların başa dönmesi için `% 26` kullan.

# --tests--

`shiftLetter` should shift a letter forward in the alphabet.
tr: `shiftLetter` bir harfi alfabede ileri kaydırmalı.

```js
assert.strictEqual(window.shiftLetter('a', 3), 'd')
assert.strictEqual(window.shiftLetter('m', 1), 'n')
```

It should wrap around after `z`, and leave non-letters alone.
tr: `z`'den sonra başa sarmalı, harf olmayanlara dokunmamalı.

```js
assert.strictEqual(window.shiftLetter('z', 3), 'c')
assert.strictEqual(window.shiftLetter(' ', 3), ' ')
assert.strictEqual(window.shiftLetter('.', 3), '.')
```

# --solution--

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Text detective</title>
    <style>
      body { font-family: sans-serif; max-width: 520px; margin: 24px auto; padding: 0 12px; }
      textarea { width: 100%; font: inherit; }
      #result { font-size: 1.2rem; white-space: pre-line; }
    </style>
  </head>
  <body>
    <h1>Text detective</h1>
    <textarea id="text" rows="4">The cat sat on the mat. The cat was happy.</textarea>
    <p id="result"></p>
    <script>
      const alphabet = 'abcdefghijklmnopqrstuvwxyz'

      function shiftLetter(letter, shift) {
        const i = alphabet.indexOf(letter)
        if (i === -1) return letter
        return alphabet[(i + shift) % 26]
      }

      const box = document.querySelector('#text')
      const result = document.querySelector('#result')

      function update() {
        const text = box.value.trim()
        const words = text === '' ? [] : text.split(/\s+/)
        const counts = new Map()
        for (const word of words) {
          const key = word.toLowerCase().replace(/[.,!?;:]/g, '')
          counts.set(key, (counts.get(key) ?? 0) + 1)
        }
        const top = [...counts].sort((a, b) => b[1] - a[1])[0]
        result.textContent = 'Characters: ' + box.value.length + '\nWords: ' + words.length + '\nDifferent words: ' + counts.size +
          (top ? '\nMost common: ' + top[0] + ' (' + top[1] + ')' : '')
      }

      box.addEventListener('input', update)
      update()
    </script>
  </body>
</html>
```
