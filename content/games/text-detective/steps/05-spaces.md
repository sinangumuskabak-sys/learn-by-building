---
title: The extra-space trap
title_tr: Fazla boşluk tuzağı
skills: [prog.types]
---

# --goal--

Double spaces, spaces at the ends and line breaks give empty "words". We trim the ends and split at any run of spaces.

# --goal-tr--

Tahminde gördün: iki boşluk arka arkaya gelince aradaki **boş parça** da kelime sayılıyor. Baştaki, sondaki boşluklar
ve satır sonları da aynı sorunu yaratır. Çözüm iki parça:

- `trim()` baştaki ve sondaki boşlukları **kırpar**.
- `split(/\s+/)` metni "**bir ya da daha çok** boşluk" gördüğü yerden böler.

# --code--

```js
const words = box.value.trim().split(/\s+/)
```

# --meaning--

- `trim()` removes spaces at the start and the end.
- `/\s+/` is a regular expression: `\s` is any space-like character (space, tab, line break), `+` means "one or more".

# --meaning-tr--

- `.trim()` → metnin **başındaki ve sonundaki** boşlukları siler.
- `/\s+/` → bir **düzenli ifade** (regex): metinde aranan bir desen. İki eğik çizgi arasına yazılır.
  - `\s` → herhangi bir boşluk karakteri: boşluk, sekme (Tab), satır sonu.
  - `+` → "bir ya da daha fazla". Yani yan yana kaç boşluk olursa olsun, tek bir ayraç sayılır.

# --task--

Change the `words` line as shown.

# --task-tr--

`words` satırını koddaki gibi değiştir. **Çalıştır** ve kutuya çift boşluklu bir metin yazıp dene.

# --tests--

Extra spaces and line breaks should not count as words.
tr: Fazla boşluklar ve satır sonları kelime sayılmamalı.

```js
const type = (value) => { const box = document.querySelector('#text'); box.value = value; box.dispatchEvent(new window.Event('input')) }
const result = () => document.querySelector('#result').textContent
type('  the   cat\nsat  ')
assert.include(result(), 'Words: 3')
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
        const words = box.value.trim().split(/\s+/)
        result.textContent = 'Characters: ' + box.value.length + '\nWords: ' + words.length
      }

      box.addEventListener('input', update)
      update()
    </script>
  </body>
</html>
```
