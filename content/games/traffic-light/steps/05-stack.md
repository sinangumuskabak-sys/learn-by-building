---
title: Stack them in the middle
title_tr: Ortada alt alta diz
skills: [fe.css]
---

# --goal--

The lamps sit at the top left of the body, touching. With flexbox the body lays them out: one under the other,
spread evenly, centered.

# --goal-tr--

Lambalar gövdenin sol üstüne yığıldı. Onları **düzenli** dizmek için gövdeye **flexbox** diyoruz: "içindekileri
sen yerleştir". Alt alta dizilecekler, aralarındaki boşluk eşit olacak ve ortalanacaklar.

# --code--

```css
display: flex;
flex-direction: column;
justify-content: space-around;
align-items: center;
```

# --meaning--

- `display: flex` lets the body arrange its children.
- `flex-direction: column` puts them one under another.
- `justify-content: space-around` shares the free height evenly around them.
- `align-items: center` centers them left to right.

# --meaning-tr--

- `display: flex;` → gövde, içindeki kutuları (lambaları) **kendisi yerleştirir**.
- `flex-direction: column;` → **sütun** hâlinde, alt alta diz (varsayılan yan yanadır).
- `justify-content: space-around;` → dizildikleri yöndeki (burada dikey) boş yeri her lambanın etrafına **eşit**
  dağıt.
- `align-items: center;` → öbür yönde (yatay) **ortala**.

# --task--

Add the four lines inside `.light`, under `border-radius`.

# --task-tr--

Dört satırı `.light` kuralının içine, `border-radius` satırının altına ekle. **Çalıştır**.

# --try--

Try `justify-content: center`, then `space-between`, and compare.

# --try-tr--

`justify-content: center`, sonra `space-between` dene ve farkı karşılaştır. Sonra `space-around`'a geri al.

# --tests--

The body should stack its lamps in a column with flexbox.
tr: Gövde lambalarını flexbox ile sütun hâlinde dizmeli.

```js
assert.strictEqual(window.getComputedStyle(document.querySelector('.light')).display, 'flex')
assert.strictEqual(window.getComputedStyle(document.querySelector('.light')).flexDirection, 'column')
```

The lamps should be spread out and centered.
tr: Lambalar eşit aralıklı ve ortalı olmalı.

```js
assert.strictEqual(window.getComputedStyle(document.querySelector('.light')).justifyContent, 'space-around')
assert.strictEqual(window.getComputedStyle(document.querySelector('.light')).alignItems, 'center')
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
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
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
