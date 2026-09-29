---
title: The secret line
title_tr: Gizli satır
skills: [prog.functions]
---

# --goal--

Last line of the report: the text in Caesar code, updated as you type.

# --goal-tr--

Raporun son satırı: kutudaki metnin **Sezar şifreli** hâli; sen yazdıkça şifrelensin. Dedektifin hazır!

# --code--

```js
'\nSecret: ' + caesar(text, 3)
```

# --meaning--

- `caesar(text, 3)` encodes the trimmed text with a shift of 3; the result is added to the report.

# --meaning-tr--

- `caesar(text, 3)` → kırpılmış metni 3 kaydırmayla şifrele.
- Rapor satırının sonuna ` +` koyup alt satıra bu parçayı eklemek, şifreyi raporun son satırı yapar.

# --task--

Add the `Secret` part to the end of the report.

# --task-tr--

Rapor satırının sonuna (`: '')` kısmından sonra) ` +` koy ve alt satıra `'\nSecret: ' + caesar(text, 3)` yaz. **Çalıştır** ve kutuya adını yaz.

# --try--

Can you decode? Try `caesar(text, 23)`: shifting 23 more is the same as going back 3.

# --try-tr--

Şifreyi çözebilir misin? `caesar(text, 23)` dene: 23 ileri kaydırmak 3 geri gitmekle aynı şey (26'lık alfabede).

# --tests--

The report should end with the text in Caesar code.
tr: Rapor, metnin Sezar şifreli hâliyle bitmeli.

```js
const type = (value) => { const box = document.querySelector('#text'); box.value = value; box.dispatchEvent(new window.Event('input')) }
const result = () => document.querySelector('#result').textContent
type('Meet at noon')
assert.include(result(), 'Secret: phhw dw qrrq')
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
          (top ? '\nMost common: ' + top[0] + ' (' + top[1] + ')' : '') +
          '\nSecret: ' + caesar(text, 3)
      }

      box.addEventListener('input', update)
      update()
    </script>
  </body>
</html>
```
