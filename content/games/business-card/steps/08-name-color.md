---
title: Color your name
title_tr: Adını renklendir
skills: [fe.css]
---

# --goal--

The name gets a color, and we remove the extra space browsers put above headings.

# --goal-tr--

Adın kartın yıldızı: ona bir **renk** vereceğiz. Bir de tarayıcının başlıkların üstüne kendiliğinden koyduğu
fazladan boşluğu kaldıracağız; kart daha derli toplu görünsün.

Bu sefer seçici bir etiket adı: `h1`. Kural sayfadaki bütün `h1`'lere uygulanır.

# --code--

```css
h1 {
  margin: 0;
  color: #4f46e5;
}
```

# --meaning--

- `h1` selects every level-1 heading.
- `margin: 0` removes the default space around the heading.
- `color` is the text color: `#4f46e5` is indigo.

# --meaning-tr--

- `h1 {` → seçici bir **etiket adı**: kural bütün `h1` başlıklarına uygulanır (başında nokta yok, çünkü sınıf
  değil).
- `margin: 0;` → tarayıcının başlık etrafına koyduğu dış boşluğu **sıfırla**. Tek değer dört yana birden uygulanır.
- `color: #4f46e5;` → **yazı rengi** (background zemin rengiydi, color yazının kendisi). `#4f46e5` çivit mavisi.

# --task--

Write the `h1` rule under the `.card` rule, after an empty line.

# --task-tr--

`.card` kuralının altına bir boş satır bırak ve `h1` kuralını yaz. **Çalıştır**.

# --try--

Pick your own color: `crimson`, `teal`, `#e11d48`…

# --try-tr--

Kendi rengini seç: `crimson`, `teal`, `#e11d48`...

# --tests--

The heading should have its own text color.
tr: Başlığın kendi yazı rengi olmalı.

```js
const css = (selector, property) => [...document.styleSheets].flatMap((s) => [...s.cssRules]).filter((r) => r.selectorText === selector).map((r) => r.style.getPropertyValue(property)).filter(Boolean).pop() ?? ''
assert.isNotEmpty(css('h1', 'color'), 'set color on h1')
```

The space above the heading should be removed.
tr: Başlığın üstündeki boşluk kaldırılmalı.

```js
assert.strictEqual(window.getComputedStyle(document.querySelector('h1')).marginTop, '0px')
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
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      h1 {
        margin: 0;
        color: #4f46e5;
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
