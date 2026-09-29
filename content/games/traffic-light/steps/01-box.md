---
title: An empty box
title_tr: Boş bir kutu
skills: [fe.html]
---

# --goal--

We are building a traffic light that switches by itself, with only HTML and CSS. The first piece is its body: an
empty box.

# --goal-tr--

Kendi kendine yanıp sönen bir **trafik lambası** yapacağız; yalnız HTML ve CSS ile, tek satır JavaScript yazmadan.
Sonunda nasıl olacağını **Bitmiş hâlini gör** düğmesiyle görebilirsin.

İlk parça lambanın gövdesi: bir kutu. Sayfa `<style>` içinde zaten hazır bir kural taşıyor: sayfadaki her şeyi
ortalıyor ve arka planı gri yapıyor. Sen `<body>` içine kutuyu koyacaksın.

# --code--

```html
<div class="light"></div>
```

# --meaning--

- `<div>` is a box; `class="light"` names it so CSS can style it.
- There is nothing between `<div ...>` and `</div>`: the box is empty.

# --meaning-tr--

- `<div class="light">` → bir kutu açar ve ona `light` (ışık, lamba) sınıf adını verir. CSS ile bu adı kullanıp
  kutuyu biçimlendireceğiz.
- `</div>` → kutu hemen kapanıyor: içi **boş**.

# --task--

Write the line on the empty line inside `<body>`, then Run.

# --task-tr--

`<body>` ile `</body>` arasındaki boş satıra yaz ve **Çalıştır**.

# --predict--

What will you see on the page?
- [x] Nothing new
  An empty box with no size and no color is invisible.
- [ ] A black rectangle
- [ ] The word "light"

# --predict-tr--

Sayfada ne göreceksin?
- [x] Yeni bir şey görmeyeceğim
  Boyu ve rengi olmayan boş bir kutu görünmez.
- [ ] Siyah bir dikdörtgen
- [ ] "light" yazısı

# --tests--

There should be a `div` with the class `light`.
tr: `light` sınıflı bir `div` olmalı.

```js
assert.isNotNull(document.querySelector('body > div.light'), 'a <div class="light"> inside <body>')
```

# --seed--

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Traffic light</title>
    <style>
      body {
        display: grid;
        place-items: center;
        min-height: 90vh;
        background: #cbd5e1;
      }
    </style>
  </head>
  <body>
  </body>
</html>
```

# --solution--

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Traffic light</title>
    <style>
      body {
        display: grid;
        place-items: center;
        min-height: 90vh;
        background: #cbd5e1;
      }
    </style>
  </head>
  <body>
    <div class="light"></div>
  </body>
</html>
```
