---
title: A soft shadow
title_tr: Yumuşak bir gölge
skills: [fe.css]
---

# --goal--

A light shadow makes the card look like it floats above the page.

# --goal-tr--

Kartın sayfanın üstünde **havada duruyormuş** gibi görünmesi için altına hafif bir gölge ekleyeceğiz.

# --code--

```css
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
```

# --meaning--

- The numbers are: sideways offset `0`, downward offset `4px`, blur `12px`.
- `rgba(0, 0, 0, 0.15)` is black at 15% strength: a see-through shadow.

# --meaning-tr--

- `box-shadow:` → kutunun gölgesi. Değerler sırayla:
  - `0` → gölge sağa-sola kaymasın.
  - `4px` → gölge 4 piksel **aşağı** kaysın (ışık yukarıdan geliyormuş gibi).
  - `12px` → gölgenin kenarı 12 piksel boyunca **bulanıklaşsın** (sert değil, yumuşak gölge).
  - `rgba(0, 0, 0, 0.15)` → renk: kırmızı 0, yeşil 0, mavi 0 = siyah; son sayı **saydamlık**: 0.15 = %15
    koyuluk. Gölge hafif ve yarı saydam olur.

# --task--

Add the line inside `.card`, under `margin`.

# --task-tr--

Satırı `.card` kuralının içine, `margin` satırının altına ekle. **Çalıştır**.

# --try--

Make the shadow stronger: change `0.15` to `0.4` and `12px` to `30px`.

# --try-tr--

Gölgeyi güçlendir: `0.15`'i `0.4`, `12px`'i `30px` yap. Sonra beğendiğin değerde bırak.

# --tests--

The card should have a shadow.
tr: Kartın bir gölgesi olmalı.

```js
assert.notInclude(['', 'none'], window.getComputedStyle(document.querySelector('.card')).boxShadow)
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
