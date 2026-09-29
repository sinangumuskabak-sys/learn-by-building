---
title: The most common word
title_tr: En sık kelime
skills: [prog.arrays, prog.functions]
---

# --goal--

The detective's finding: the word used most. We turn the map into a list, sort it by count and take the first.

# --goal-tr--

Dedektifin asıl bulgusu: metinde **en çok geçen kelime**. Sözlüğü bir listeye çevirip sayılara göre büyükten
küçüğe **sıralayacağız**; ilk eleman en sık kelime olur.

# --code--

```js
const top = [...counts].sort((a, b) => b[1] - a[1])[0]

(top ? '\nMost common: ' + top[0] + ' (' + top[1] + ')' : '')
```

# --meaning--

- `[...counts]` is a list of `[word, count]` pairs.
- `sort((a, b) => b[1] - a[1])` sorts by count, biggest first. `[0]` takes the first pair.
- An empty text has no pairs, so `top` is `undefined` and nothing is added.

# --meaning-tr--

- `[...counts]` → sözlüğü `[kelime, sayı]` çiftlerinden oluşan bir **listeye** açar: `[['the', 3], ['cat', 2], ...]`.
- `.sort((a, b) => b[1] - a[1])` → iki çifti karşılaştıran bir kuralla sırala: `b[1] - a[1]` sayısı büyük olanı
  **öne** alır (büyükten küçüğe).
- `[0]` → sıralı listenin **ilk** çifti: en sık kelime.
- `top ? ... : ''` → metin boşsa `top` yoktur (`undefined`); o zaman rapora hiçbir şey ekleme.
- `top[0]` kelime, `top[1]` kaç kez geçtiği: `Most common: the (3)`.

# --task--

1. After the loop, write the `top` line.
2. Add the `Most common` part to the end of the report, as shown.

# --task-tr--

1. `for` döngüsünün kapanan `}` işaretinin altına `top` satırını yaz.
2. Rapor satırının sonundaki `counts.size`'dan sonra ` +` koy ve alt satıra `(top ? ... : '')` parçasını yaz.
3. **Çalıştır**: `Most common: the (3)` görmelisin.

# --hint--

Sort with `b[1] - a[1]` (biggest first); `a[1] - b[1]` would put the rarest word first.

# --hint-tr--

`b[1] - a[1]` ile sırala (büyükten küçüğe); `a[1] - b[1]` en seyrek kelimeyi başa koyar.

# --tests--

The report should name the most common word and how often it appears.
tr: Rapor en sık kelimeyi ve kaç kez geçtiğini söylemeli.

```js
const type = (value) => { const box = document.querySelector('#text'); box.value = value; box.dispatchEvent(new window.Event('input')) }
const result = () => document.querySelector('#result').textContent
type('a b b c b a')
assert.include(result(), 'Most common: b (3)')
type('')
assert.notInclude(result(), 'Most common')
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
