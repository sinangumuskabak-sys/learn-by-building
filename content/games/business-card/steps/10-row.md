---
title: Links in a row
title_tr: Bağlantılar yan yana
skills: [fe.css]
---

# --goal--

The list shows bullets and one link per line. We remove the bullets and put the links side by side with flexbox.

# --goal-tr--

Liste şu an alt alta, başında **madde işaretleri** (•) ile duruyor. Kartvizitte bağlantılar genelde **yan yana**
durur. Madde işaretlerini kaldırıp bağlantıları yan yana dizeceğiz.

Bunun için CSS'in en kullanışlı araçlarından biri: **flexbox** (esnek kutu).

# --code--

```html
ul {
  list-style: none;
  padding: 0;
  display: flex;
  gap: 16px;
}
```

# --meaning--

- `list-style: none` removes the bullets; `padding: 0` removes the indent lists get.
- `display: flex` lays the items out in a row.
- `gap: 16px` leaves 16 pixels between them.

# --meaning-tr--

- `list-style: none;` → madde işaretlerini kaldır.
- `padding: 0;` → listelerin soldaki iç boşluğunu kaldır (madde işareti için ayrılmıştı).
- `display: flex;` → **flexbox**: kutunun içindekileri (burada `li`'leri) **yan yana** diz. Sayfa düzeni
  kurmanın en yaygın yolu.
- `gap: 16px;` → yan yana dizilen parçaların arasında 16 piksel boşluk.

# --task--

Write the `ul` rule under the `h1` rule.

# --task-tr--

`h1` kuralının altına bir boş satır bırak ve `ul` kuralını yaz. **Çalıştır**.

# --predict--

What does `display: flex` do to the list items?
- [x] Puts them side by side
- [ ] Hides them
- [ ] Makes each one full width

# --predict-tr--

`display: flex` liste maddelerine ne yapar?
- [x] Onları yan yana dizer
- [ ] Gizler
- [ ] Her birini tam genişlik yapar

# --tests--

The list should have no bullets.
tr: Listede madde işareti olmamalı.

```js
const css = (selector, property) => [...document.styleSheets].flatMap((s) => [...s.cssRules]).filter((r) => r.selectorText === selector).map((r) => r.style.getPropertyValue(property)).filter(Boolean).pop() ?? ''
assert.include(css('ul', 'list-style') || css('ul', 'list-style-type'), 'none')
```

The links should be laid out in a row with flexbox.
tr: Bağlantılar flexbox ile yan yana dizilmeli.

```js
assert.strictEqual(window.getComputedStyle(document.querySelector('ul')).display, 'flex')
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

      ul {
        list-style: none;
        padding: 0;
        display: flex;
        gap: 16px;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Ada Lovelace</h1>
      <p>Learning to build websites</p>
      <ul>
        <li><a href="mailto:ada@example.com">E-mail</a></li>
        <li><a href="https://github.com/">GitHub</a></li>
      </ul>
    </div>
  </body>
</html>
```
