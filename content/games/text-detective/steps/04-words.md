---
title: Split into words
title_tr: Kelimelere böl
skills: [prog.arrays]
---

# --goal--

To count words we cut the text at every space. `split(' ')` gives an array of pieces; its length is the word count.

# --goal-tr--

Kelime saymak için metni **boşluklardan kesiyoruz**. `split(' ')` metni her boşlukta böler ve parçaları bir
**diziye** koyar. Dizinin uzunluğu = kelime sayısı.

# --code--

```js
const words = box.value.split(' ')
result.textContent = 'Characters: ' + box.value.length + '\nWords: ' + words.length
```

# --meaning--

- `split(' ')` returns an array: `'the cat sat'` becomes `['the', 'cat', 'sat']`.
- `'\n'` is a line break, so the word count goes on its own line.

# --meaning-tr--

- `box.value.split(' ')` → metni boşluk karakterinden böl: `'the cat sat'` → `['the', 'cat', 'sat']`.
- `const words =` → parçaları `words` (kelimeler) adıyla tut. `words.length` → kaç parça var.
- `'\nWords: '` → `\n` **satır sonu** demek: kelime sayısı alt satıra yazılır.

# --task--

Inside `update`, add the `words` line and extend the text as shown.

# --task-tr--

`update` içinde, `result.textContent` satırının üstüne `words` satırını yaz; `result.textContent` satırını koddaki gibi uzat. **Çalıştır**.

# --predict--

What will `'the  cat'` (two spaces) give as the word count?
- [ ] 2
- [x] 3: an empty piece between the two spaces counts too
- [ ] 1

# --predict-tr--

`'the  cat'` (iki boşluklu) için kelime sayısı kaç çıkar?
- [ ] 2
- [x] 3: iki boşluğun arasındaki boş parça da sayılır
- [ ] 1

# --tests--

The result should count the words.
tr: Sonuç kelimeleri saymalı.

```js
const type = (value) => { const box = document.querySelector('#text'); box.value = value; box.dispatchEvent(new window.Event('input')) }
const result = () => document.querySelector('#result').textContent
type('one two three')
assert.include(result(), 'Words: 3')
assert.include(result(), 'Characters: 13')
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

      function update() {
        const words = box.value.split(' ')
        result.textContent = 'Characters: ' + box.value.length + '\nWords: ' + words.length
      }

      box.addEventListener('input', update)
      update()
    </script>
  </body>
</html>
```
