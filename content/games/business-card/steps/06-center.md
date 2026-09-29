---
title: Center the card
title_tr: Kartı ortala
skills: [fe.css]
---

# --goal--

The card stretches across the whole page. We limit its width and center it.

# --goal-tr--

Kart şu an sayfanın **bütün genişliği** boyunca uzanıyor; kartvizit gibi durmuyor. Genişliğini sınırlayıp
sayfanın **ortasına** alacağız.

# --code--

```css
max-width: 320px;
margin: 40px auto;
```

# --meaning--

- `max-width: 320px` stops the card from getting wider than 320 pixels.
- `margin: 40px auto` is space outside the card: 40px above and below, and `auto` shares the left and right space
  equally, which centers it.

# --meaning-tr--

- `max-width: 320px;` → kart en fazla 320 piksel genişlikte olsun (telefonda daha dar olabilir, ama daha geniş
  olamaz).
- `margin: 40px auto;` → **dış boşluk** (padding içerideydi, margin dışarıda). İki değer verince ilki üst-alt,
  ikincisi sağ-sol için:
  - `40px` → kartın üstünde ve altında 40 piksel boşluk.
  - `auto` → sağdaki ve soldaki boşluğu tarayıcı **eşit paylaştırır**: kart ortaya gelir.

# --task--

Add the two lines inside the `.card` rule, under `border-radius`.

# --task-tr--

İki satırı `.card` kuralının içine, `border-radius` satırının altına ekle. **Çalıştır**.

# --predict--

What will `auto` on the left and right do?
- [ ] Push the card to the left
- [x] Put the card in the middle
  The free space is split equally between both sides.
- [ ] Make the card full width

# --predict-tr--

Sağda ve solda `auto` ne yapacak?
- [ ] Kartı sola iter
- [x] Kartı ortaya koyar
  Boş kalan yer iki yana eşit bölünür.
- [ ] Kartı tam genişlik yapar

# --tests--

The card should be at most 320px wide.
tr: Kart en fazla 320px genişlikte olmalı.

```js
const css = (selector, property) => [...document.styleSheets].flatMap((s) => [...s.cssRules]).filter((r) => r.selectorText === selector).map((r) => r.style.getPropertyValue(property)).filter(Boolean).pop() ?? ''
assert.strictEqual(css('.card', 'max-width'), '320px')
```

The card should be centered with `auto` side margins.
tr: Kart yanlarda `auto` boşlukla ortalanmalı.

```js
const css = (selector, property) => [...document.styleSheets].flatMap((s) => [...s.cssRules]).filter((r) => r.selectorText === selector).map((r) => r.style.getPropertyValue(property)).filter(Boolean).pop() ?? ''
assert.match(css('.card', 'margin') || css('.card', 'margin-left'), /auto/)
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

      .card {
        background: white;
        padding: 24px;
        border-radius: 12px;
        max-width: 320px;
        margin: 40px auto;
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
