---
title: Encode a whole text
title_tr: Bütün metni şifrele
skills: [prog.loops, prog.functions]
---

# --goal--

`caesar` goes through a text letter by letter, shifts each one and glues them together.

# --goal-tr--

Tek harfi kaydırabiliyoruz; şimdi **bütün metni**. `caesar` fonksiyonu metni harf harf dolaşacak, her harfi
`shiftLetter` ile kaydırıp yeni bir metinde birleştirecek.

# --code--

```js
function caesar(text, shift) {
  let secret = ''
  for (const letter of text.toLowerCase()) {
    secret += shiftLetter(letter, shift)
  }
  return secret
}
```

# --meaning--

- `secret` starts empty and grows by one letter each turn (`+=` adds to the end).
- A `for...of` over a text visits it one character at a time.
- The function uses `shiftLetter`: small functions build bigger ones.

# --meaning-tr--

- `let secret = ''` → boş bir metinle başla; her turda büyüyecek, bu yüzden `let`.
- `for (const letter of text.toLowerCase())` → metni küçük harfe çevirip **karakter karakter** dolaş.
- `secret += shiftLetter(letter, shift)` → kaydırılmış harfi metnin **sonuna ekle**.
- `return secret` → biten şifreli metni geri ver.
- Küçük fonksiyonlar büyüklerini kurar: `caesar`, işin zor kısmını `shiftLetter`'a bırakıyor.

# --task--

Write `caesar` under `shiftLetter`.

# --task-tr--

`caesar` fonksiyonunu `shiftLetter`'ın altına, bir boş satırdan sonra yaz. **Çalıştır**.

# --tests--

`caesar` should shift every letter of a text.
tr: `caesar` bir metnin her harfini kaydırmalı.

```js
assert.strictEqual(window.caesar('abc', 1), 'bcd')
assert.strictEqual(window.caesar('Hello, zoo!', 3), 'khoor, crr!')
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

      function caesar(text, shift) {
        let secret = ''
        for (const letter of text.toLowerCase()) {
          secret += shiftLetter(letter, shift)
        }
        return secret
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
