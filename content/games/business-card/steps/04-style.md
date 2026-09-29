---
title: Your first CSS
title_tr: İlk CSS
skills: [fe.css]
---

# --goal--

HTML says **what** is on the page; **CSS** says **how it looks**. CSS goes in a `<style>` tag in the page's head.
We start with the whole page: a cleaner font and a soft background.

# --goal-tr--

HTML sayfada **ne** olduğunu söyler; **nasıl görüneceğini** ise **CSS** söyler: renkler, yazı tipleri, boşluklar,
kenarlar...

CSS, sayfanın görünmeyen baş kısmına (`<head>`) bir `<style>` etiketi içinde yazılır. İlk kuralımız bütün sayfa
için: daha sade bir yazı tipi ve yumuşak bir arka plan rengi.

# --code--

```html
<style>
  body {
    font-family: sans-serif;
    background: #f1f5f9;
  }
</style>
```

# --meaning--

- A CSS rule: a **selector** (`body`, the whole page), then `{ }` with `property: value;` lines.
- `font-family: sans-serif` switches to a plain font without little feet on the letters.
- `background: #f1f5f9` paints the page a very light grey-blue.

# --meaning-tr--

- `<style>` ... `</style>` → içine CSS yazılan etiket. `<head>` içinde durur, kendisi görünmez.
- `body {` → bir CSS **kuralı** başlıyor. `body` **seçici**: "bu kural sayfanın gövdesi için". Süslü parantez
  içinde kuralın ayarları var.
- `font-family: sans-serif;` → her ayar `özellik: değer;` biçimindedir. Yazı tipi: **sans-serif**, harflerin
  ucunda küçük çıkıntılar (tırnak) olmayan sade yazı.
- `background: #f1f5f9;` → arka plan rengi: çok açık gri-mavi. Satır sonundaki `;` ayarı bitirir.
- `}` → kural bitti.

# --task--

Write the `<style>` block under the `<title>` line.

# --task-tr--

`<style>` bloğunu `<head>` içinde, `<title>` satırının altına yaz. **Çalıştır**: yazı tipi ve arka plan değişmeli.

# --predict--

Which part of the page will change color?
- [x] The whole page behind everything
  `body` is the whole page.
- [ ] Only the name
- [ ] Only the paragraph

# --predict-tr--

Sayfanın hangi kısmının rengi değişecek?
- [x] Her şeyin arkasındaki bütün sayfa
  `body` sayfanın tamamı.
- [ ] Yalnız ad
- [ ] Yalnız paragraf

# --hint--

Every line inside the rule ends with `;`, and the rule ends with `}`.

# --hint-tr--

Kuralın içindeki her satır `;` ile biter, kural `}` ile kapanır.

# --try--

Try another background, like `#fef3c7` (cream) or `lavender`. Colors can be names or `#` codes.

# --try-tr--

Başka bir arka plan dene: `#fef3c7` (krem) ya da `lavender`. Renkler ad ya da `#` kodu olabilir.

# --tests--

The page should use a sans-serif font.
tr: Sayfa sans-serif yazı tipi kullanmalı.

```js
const css = (selector, property) => [...document.styleSheets].flatMap((s) => [...s.cssRules]).filter((r) => r.selectorText === selector).map((r) => r.style.getPropertyValue(property)).filter(Boolean).pop() ?? ''
assert.include(css('body', 'font-family'), 'sans-serif')
```

The page should have a background color.
tr: Sayfanın bir arka plan rengi olmalı.

```js
const css = (selector, property) => [...document.styleSheets].flatMap((s) => [...s.cssRules]).filter((r) => r.selectorText === selector).map((r) => r.style.getPropertyValue(property)).filter(Boolean).pop() ?? ''
assert.isNotEmpty(css('body', 'background') || css('body', 'background-color'), 'set background on body')
```

# --solution--

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>My card</title>
    <style>
      body {
        font-family: sans-serif;
        background: #f1f5f9;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Ada Lovelace</h1>
      <p>Learning to build websites</p>
    </div>
  </body>
</html>
```
