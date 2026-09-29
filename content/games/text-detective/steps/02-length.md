---
title: Count the characters
title_tr: Karakterleri say
skills: [prog.types]
---

# --goal--

Every piece of text knows its length. We report how many characters the text has.

# --goal-tr--

İlk bulgu: metin kaç **karakterden** oluşuyor? Harfler, boşluklar, noktalar... hepsi karakterdir. Her metin kendi
uzunluğunu bilir: `.length`.

# --code--

```js
result.textContent = 'Characters: ' + box.value.length
```

# --meaning--

- `.length` of a text is how many characters it has, spaces and punctuation included.
- `'Characters: ' + ...` joins a label and the number into one text.

# --meaning-tr--

- `box.value.length` → kutudaki metnin **uzunluğu**: kaç karakter. Boşluklar ve noktalar da sayılır.
- `'Characters: ' + ...` → tırnak içindeki etiketle sayıyı **yapıştırır**: `Characters: 42` gibi.
- Satırın tamamı, bir önceki adımdaki son satırın yerini alıyor.

# --task--

Change the last line of the script as shown.

# --task-tr--

Betiğin son satırını (`result.textContent = box.value`) koddaki gibi değiştir. **Çalıştır**.

# --predict--

The box holds `The cat sat on the mat. The cat was happy.` How many characters?
- [ ] 32: only the letters
  Spaces and full stops count too.
- [x] 42
- [ ] 10: the words

# --predict-tr--

Kutuda `The cat sat on the mat. The cat was happy.` yazıyor. Kaç karakter?
- [ ] 32: yalnız harfler
  Boşluklar ve noktalar da sayılır.
- [x] 42
- [ ] 10: kelimeler

# --tests--

The result should say how many characters the text has.
tr: Sonuç, metnin kaç karakter olduğunu söylemeli.

```js
const result = () => document.querySelector('#result').textContent
assert.strictEqual(result(), 'Characters: ' + document.querySelector('#text').value.length)
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
      const box = document.querySelector('#text')
      const result = document.querySelector('#result')
      result.textContent = 'Characters: ' + box.value.length
    </script>
  </body>
</html>
```
