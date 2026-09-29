---
title: Round lamps
title_tr: Yuvarlak lambalar
skills: [fe.css]
---

# --goal--

Each lamp becomes a grey circle: a square with `border-radius: 50%`.

# --goal-tr--

Her lamba gri bir **daire** olsun. CSS'te daire çizmenin yolu: kare bir kutu yap ve köşelerini **yüzde 50**
yuvarlat. Köşeler o kadar yuvarlanır ki kare daireye döner.

# --code--

```css
.lamp {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #555;
}
```

# --meaning--

- The same width and height make a square; `border-radius: 50%` turns a square into a circle.
- `#555` is mid grey: a lamp that is off.

# --meaning-tr--

- `width: 60px; height: 60px;` → eni boyu eşit: kare.
- `border-radius: 50%;` → her köşeyi kenarın **yarısı** kadar yuvarlat: kare daire olur. (`px` yerine `%` kutunun
  boyuna göre ölçer.)
- `background: #555;` → orta gri: **sönük** bir lamba.

# --task--

Write the `.lamp` rule under the `.light` rule.

# --task-tr--

`.light` kuralının altına bir boş satır bırakıp `.lamp` kuralını yaz. **Çalıştır**: üç gri daire görmelisin.

# --try--

Change `50%` to `20%`: rounded squares. Put 50% back.

# --try-tr--

`50%` yerine `20%` yaz: yuvarlak köşeli kareler olur. Sonra 50%'ye geri al.

# --tests--

Each lamp should be a 60×60 circle.
tr: Her lamba 60×60'lık bir daire olmalı.

```js
assert.strictEqual(window.getComputedStyle(document.querySelector('.lamp')).width, '60px')
assert.strictEqual(window.getComputedStyle(document.querySelector('.lamp')).height, '60px')
const css = (selector, property) => [...document.styleSheets].flatMap((s) => [...s.cssRules]).filter((r) => r.selectorText === selector).map((r) => r.style.getPropertyValue(property)).filter(Boolean).pop() ?? ''
assert.strictEqual(css('.lamp', 'border-radius'), '50%')
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

      .light {
        width: 90px;
        height: 250px;
        background: #222;
        border-radius: 16px;
      }

      .lamp {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: #555;
      }
    </style>
  </head>
  <body>
    <div class="light">
      <div class="lamp"></div>
      <div class="lamp"></div>
      <div class="lamp"></div>
    </div>
  </body>
</html>
```
