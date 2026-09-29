---
title: Three lamps inside
title_tr: İçine üç lamba
skills: [fe.html]
---

# --goal--

A traffic light has three lamps. We put three boxes inside the body, each with the class `lamp`.

# --goal-tr--

Trafik lambasında üç ışık var: kırmızı, sarı, yeşil. Gövdenin **içine** üç küçük kutu koyuyoruz; hepsinin sınıf adı
aynı: `lamp`. Aynı sınıfı taşıyan her şeye tek bir CSS kuralı yetecek.

# --code--

```html
<div class="light">
  <div class="lamp"></div>
  <div class="lamp"></div>
  <div class="lamp"></div>
</div>
```

# --meaning--

- The three `lamp` boxes are between the body's opening and closing tags, so they are inside it.
- Many elements can share one class.

# --meaning-tr--

- Gövdenin açılış (`<div class="light">`) ve kapanış (`</div>`) etiketleri artık ayrı satırlarda; üç lamba **ikisinin
  arasında**, yani gövdenin içinde.
- Üçü de `class="lamp"`: bir sınıfı istediğin kadar öğe taşıyabilir. Kimlik (`id`) tektir, sınıf (`class`) değil.

# --task--

Open the body's `div` onto separate lines and write the three lamps inside it.

# --task-tr--

1. `<div class="light"></div>` satırını ikiye aç: `<div class="light">` bir satırda, `</div>` en altta.
2. Aralarına üç `lamp` satırını yaz (iki boşluk içeriden).
3. **Çalıştır**.

# --predict--

Will you see the three lamps?
- [ ] Yes, three circles
- [x] No: they have no size or color yet
- [ ] Only one of them

# --predict-tr--

Üç lambayı görecek misin?
- [ ] Evet, üç daire
- [x] Hayır: henüz boyları ve renkleri yok
- [ ] Yalnız birini

# --tests--

The body should hold three lamps.
tr: Gövdenin içinde üç lamba olmalı.

```js
assert.lengthOf(document.querySelectorAll('.light > .lamp'), 3)
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
