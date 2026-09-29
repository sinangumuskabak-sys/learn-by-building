---
title: An empty box has no words
title_tr: Boş kutuda kelime yok
skills: [prog.types]
---

# --goal--

Clear the box and the detective still says "Words: 1": splitting an empty text gives one empty piece. We handle that
case on its own.

# --goal-tr--

Kutuyu tamamen silersen dedektif yine "**Words: 1**" diyor! Çünkü boş bir metni bölünce içinde **bir boş parça**
olan bir dizi çıkar. Programcılar buna **uç durum** der: kural çoğu zaman çalışır ama kenarda bozulur. Boş metni ayrıca
ele alıyoruz.

# --code--

```js
const text = box.value.trim()
const words = text === '' ? [] : text.split(/\s+/)
```

# --meaning--

- `text` is the trimmed text, kept in a variable because we use it twice.
- `condition ? a : b` picks `a` when the condition is true, otherwise `b`: an empty array for an empty text.

# --meaning-tr--

- `const text = box.value.trim()` → kırpılmış metni bir kez hesaplayıp tutuyoruz (iki yerde kullanacağız).
- `text === '' ? [] : text.split(/\s+/)` → **koşul ? evetse : hayırsa**. Metin boşsa (`''`) boş bir dizi (`[]`), değilse
  bölünmüş kelimeler. Buna üçlü (ternary) işleç denir: kısa bir `if`.

# --task--

Replace the `words` line with the two lines.

# --task-tr--

`words` satırını sil, yerine iki satırı yaz. **Çalıştır**, sonra sağda kutuyu tamamen sil: `Words: 0` görmelisin.

# --tests--

An empty box should have no words.
tr: Boş kutuda kelime olmamalı.

```js
const type = (value) => { const box = document.querySelector('#text'); box.value = value; box.dispatchEvent(new window.Event('input')) }
const result = () => document.querySelector('#result').textContent
type('   ')
assert.include(result(), 'Words: 0')
type('hi there')
assert.include(result(), 'Words: 2')
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
        result.textContent = 'Characters: ' + box.value.length + '\nWords: ' + words.length
      }

      box.addEventListener('input', update)
      update()
    </script>
  </body>
</html>
```
