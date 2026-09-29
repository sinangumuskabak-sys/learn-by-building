---
title: Read the text
title_tr: Metni oku
skills: [fe.html, prog.functions]
---

# --goal--

Our detective looks at any text and reports on it. First, JavaScript reads what is in the box and writes it under it.

# --goal-tr--

Bir **metin dedektifi** yapıyoruz: kutuya yazılan her metni inceleyip rapor verecek: kaç harf, kaç kelime, en çok
hangi kelime geçiyor... Sonunda metni gizli bir şifreyle de yazacak.

Sayfa hazır: bir başlık, bir yazı kutusu (`textarea`) ve sonucun yazılacağı boş bir paragraf (`#result`). Bu sefer
**JavaScript** yazacağız: `<script>` etiketinin içine. İlk iş: kutudaki metni okuyup altına yazmak.

# --code--

```js
const box = document.querySelector('#text')
const result = document.querySelector('#result')
result.textContent = box.value
```

# --meaning--

- `document.querySelector('#text')` finds the element with the id `text` (the box); `#` means id.
- `box.value` is what is written in the box.
- Setting `result.textContent` puts text into the paragraph.

# --meaning-tr--

- `document.querySelector('#text')` → sayfada kimliği (`id`) `text` olan öğeyi bul: yazı kutusu. CSS'teki gibi `#`
  kimlik demek.
- `const box =` → onu `box` (kutu) adıyla tut. İkinci satır aynı şeyi sonuç paragrafı için yapıyor.
- `box.value` → kutunun **içinde yazanlar**.
- `result.textContent = ...` → paragrafın yazısını **değiştir**. Sağ taraftaki değer sol tarafa konur.

# --task--

Write the three lines on the empty line inside `<script>`.

# --task-tr--

Üç satırı `<script>` ile `</script>` arasındaki boş satıra yaz. **Çalıştır**: metin kutunun altında da görünmeli.

# --tests--

The result should show the text from the box.
tr: Sonuç, kutudaki metni göstermeli.

```js
const result = () => document.querySelector('#result').textContent
assert.strictEqual(result(), document.querySelector('#text').value)
```

# --seed--

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
    </script>
  </body>
</html>
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
      result.textContent = box.value
    </script>
  </body>
</html>
```
