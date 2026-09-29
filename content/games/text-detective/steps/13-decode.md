---
title: "Build it yourself: crack the code"
title_tr: "Kendin yap: şifreyi çöz"
skills: [prog.functions]
---

# --goal--

A secret is only useful if your friend can read it. Write `decode(secret, shift)`, which turns Caesar code back
into plain text.

# --goal-tr--

Şifreli mesaj, arkadaşın okuyabilirse işe yarar. `decode(secret, shift)` fonksiyonunu yaz: Sezar şifreli bir metni
**düz metne** geri çevirsin.

Bu adımda kod verilmiyor. Bir ipucu: alfabe 26 harf ve `caesar` zaten başa sarıyor. Geri gitmek, yeterince ileri
gitmekle aynı şey olabilir mi?

# --task--

Write `decode(secret, shift)` in the script, so that `decode(caesar(text, shift), shift)` gives back the text (in lower case).

# --task-tr--

- `decode('khoor', 3)` → `'hello'` olmalı.
- Harf olmayanlar (boşluk, noktalama) olduğu gibi kalmalı.
- Herhangi bir metni önce `caesar` ile şifreleyip sonra aynı kaydırmayla `decode` edince metnin küçük harfli hâli
  geri gelmeli.

Fonksiyonu betikte `caesar`'ın altına yaz.

# --hint--

Going back 3 letters in a 26-letter alphabet is the same as going forward 23: `caesar(secret, 26 - shift)`.

# --hint-tr--

26 harfli alfabede 3 geri gitmek 23 ileri gitmekle aynı: `caesar(secret, 26 - shift)`.

# --tests--

`decode` should turn Caesar code back into the text.
tr: `decode` Sezar şifresini metne geri çevirmeli.

```js
assert.strictEqual(window.decode('khoor', 3), 'hello')
assert.strictEqual(window.decode('abc', 3), 'xyz')
```

Encoding and then decoding with the same shift should give back the text.
tr: Aynı kaydırmayla şifreleyip çözmek metni geri vermeli.

```js
for (const shift of [1, 5, 13, 25]) {
  assert.strictEqual(window.decode(window.caesar('attack at dawn!', shift), shift), 'attack at dawn!')
}
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

      function decode(secret, shift) {
        return caesar(secret, 26 - shift)
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
