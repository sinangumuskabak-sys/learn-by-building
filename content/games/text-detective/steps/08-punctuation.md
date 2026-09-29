---
title: Drop the punctuation
title_tr: Noktalamayı at
skills: [prog.types]
---

# --goal--

`mat.` and `mat` should be the same word. We remove punctuation from each word before counting it.

# --goal-tr--

Tahminde gördük: `mat.` ile `mat` farklı sayılıyor, çünkü nokta kelimeye yapışık. Saymadan önce kelimedeki
**noktalama işaretlerini sileceğiz**.

# --code--

```js
const key = word.toLowerCase().replace(/[.,!?;:]/g, '')
```

# --meaning--

- `replace(pattern, '')` replaces what matches the pattern with nothing, deleting it.
- `[.,!?;:]` matches any one of those characters; `g` means every match, not just the first.

# --meaning-tr--

- `.replace(desen, '')` → desene uyan yerleri **hiçbir şeyle** değiştir, yani sil.
- `/[.,!?;:]/` → köşeli parantez "bunlardan **herhangi biri**" demek: nokta, virgül, ünlem, soru işareti, noktalı
  virgül, iki nokta.
- Sondaki `g` (global) → yalnız ilkini değil **hepsini** değiştir.
- Metotlar zincir gibi arka arkaya yazılabilir: önce küçük harf, sonra noktalama silme.

# --task--

Add `.replace(/[.,!?;:]/g, '')` to the `key` line.

# --task-tr--

`key` satırının sonuna `.replace(/[.,!?;:]/g, '')` ekle. **Çalıştır**.

# --tests--

Punctuation should not make a word different.
tr: Noktalama bir kelimeyi farklı yapmamalı.

```js
const type = (value) => { const box = document.querySelector('#text'); box.value = value; box.dispatchEvent(new window.Event('input')) }
const result = () => document.querySelector('#result').textContent
type('Stop. stop! STOP?')
assert.include(result(), 'Different words: 1')
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
          const key = word.toLowerCase().replace(/[.,!?;:]/g, '')
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
