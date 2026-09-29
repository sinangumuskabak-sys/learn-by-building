---
title: Count each word
title_tr: Her kelimeyi say
skills: [prog.loops, prog.arrays]
---

# --goal--

Which words repeat? A `Map` keeps a count for each word: we go through the words and add one to that word's count.

# --goal-tr--

Detektiflik başlıyor: hangi kelimeler **tekrar ediyor**? Her kelime için bir sayaç tutacağız. Bunun için **Map**
(sözlük) kullanırız: her **anahtara** (kelime) bir **değer** (kaç kez geçtiği) bağlar. Kelimeleri tek tek dolaşıp
o kelimenin sayacını bir artıracağız.

"The" ile "the" aynı kelime sayılsın diye hepsini küçük harfe çeviriyoruz.

# --code--

```js
const counts = new Map()
for (const word of words) {
  const key = word.toLowerCase()
  counts.set(key, (counts.get(key) ?? 0) + 1)
}

+ '\nDifferent words: ' + counts.size
```

# --meaning--

- `new Map()` is an empty word → count table.
- The `for` loop runs once per word. `toLowerCase()` makes `The` and `the` the same key.
- `counts.get(key) ?? 0` is the count so far (0 if the word is new); `set` stores it plus one.
- `counts.size` is how many different words there are.

# --meaning-tr--

- `const counts = new Map()` → boş bir sözlük: kelime → sayı.
- `for (const word of words) {` → dizideki **her kelime için** bir kez dön; o anki kelimenin adı `word`.
- `word.toLowerCase()` → kelimeyi küçük harfe çevir: `The` ve `the` aynı anahtar olur.
  (Türkçe metinlerde `toLocaleLowerCase('tr')` gerekir; yoksa `İ` doğru `i`'ye dönmez.)
- `counts.get(key) ?? 0` → bu kelimenin şimdiye kadarki sayısı; kelime ilk kez geliyorsa sözlükte yoktur, `??` o
  zaman **0** kullanır.
- `counts.set(key, ... + 1)` → bir artırıp geri yaz.
- `counts.size` → sözlükte kaç **farklı** kelime var.

# --task--

1. Under the `words` line write the `counts` map and the `for` loop.
2. Add `+ '\nDifferent words: ' + counts.size` at the end of the report line.

# --task-tr--

1. `words` satırının altına `counts` sözlüğünü ve `for` döngüsünü yaz.
2. `result.textContent` satırının sonuna `+ '\nDifferent words: ' + counts.size` ekle.
3. **Çalıştır**.

# --predict--

For `The cat sat on the mat. The cat was happy.`, is `mat.` the same word as `mat`?
- [ ] Yes
- [x] No: the full stop is part of the piece, so `mat.` is a different key
- [ ] There is no `mat` in the text

# --predict-tr--

`The cat sat on the mat. The cat was happy.` metninde `mat.` ile `mat` aynı kelime mi sayılır?
- [ ] Evet
- [x] Hayır: nokta parçanın içinde kalıyor, `mat.` başka bir anahtar olur
- [ ] Metinde `mat` yok

# --tests--

The report should count the different words, ignoring upper and lower case.
tr: Rapor, büyük/küçük harfe bakmadan farklı kelimeleri saymalı.

```js
const type = (value) => { const box = document.querySelector('#text'); box.value = value; box.dispatchEvent(new window.Event('input')) }
const result = () => document.querySelector('#result').textContent
type('The cat and the dog')
assert.include(result(), 'Different words: 4')
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
        const text = box.value.trim()
        const words = text === '' ? [] : text.split(/\s+/)
        const counts = new Map()
        for (const word of words) {
          const key = word.toLowerCase()
          counts.set(key, (counts.get(key) ?? 0) + 1)
        }
        result.textContent = 'Characters: ' + box.value.length + '\nWords: ' + words.length + '\nDifferent words: ' + counts.size
      }

      box.addEventListener('input', update)
      update()
    </script>
  </body>
</html>
```
