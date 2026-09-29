---
title: Links that react
title_tr: Tepki veren bağlantılar
skills: [fe.css]
---

# --goal--

Last touch: links in the card's color without underline, and an underline when the mouse is over them.

# --goal-tr--

Son dokunuş: bağlantılar adınla **aynı renkte** ve altı çizgisiz olsun; **fare üstüne gelince** altı çizilsin.
Böylece "buraya tıklanır" hissi verir.

Fare üstündeyken ayrı kural yazmak için seçicinin sonuna `:hover` eklenir.

# --code--

```css
a {
  color: #4f46e5;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
```

# --meaning--

- `text-decoration: none` removes the default underline of links.
- `a:hover` applies only while the mouse is over a link: the underline comes back.

# --meaning-tr--

- `a {` → bütün bağlantılar için kural.
- `color: #4f46e5;` → bağlantı rengi: adınla aynı çivit mavisi (varsayılan mavi-mor yerine).
- `text-decoration: none;` → bağlantıların altındaki **çizgiyi kaldır**.
- `a:hover {` → `:hover` "fare üstündeyken" demek. Bu kural yalnız fare bir bağlantının üstündeyken geçerli.
- `text-decoration: underline;` → o anda **altını çiz**.

# --task--

Write the two rules under the `ul` rule. Then move the mouse over your links.

# --task-tr--

İki kuralı `ul` kuralının altına yaz. **Çalıştır**, sonra fareyi bağlantılarının üstüne getir. Kartın hazır!

# --try--

Give `a:hover` a different `color` too, and watch the link change color under the mouse.

# --try-tr--

`a:hover` kuralına farklı bir `color` da ekle; fareyle üstüne gelince bağlantının rengi değişsin.

# --tests--

Links should not be underlined normally.
tr: Bağlantıların altı normalde çizili olmamalı.

```js
const style = window.getComputedStyle(document.querySelector('a'))
assert.include(style.textDecorationLine || style.textDecoration, 'none')
```

Links should be underlined when the mouse is over them.
tr: Fare üstündeyken bağlantıların altı çizilmeli.

```js
const css = (selector, property) => [...document.styleSheets].flatMap((s) => [...s.cssRules]).filter((r) => r.selectorText === selector).map((r) => r.style.getPropertyValue(property)).filter(Boolean).pop() ?? ''
assert.include(css('a:hover', 'text-decoration') || css('a:hover', 'text-decoration-line'), 'underline')
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

      a {
        color: #4f46e5;
        text-decoration: none;
      }

      a:hover {
        text-decoration: underline;
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
