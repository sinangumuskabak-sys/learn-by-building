---
title: Put them in a box
title_tr: Bir kutuya koy
skills: [fe.html]
---

# --goal--

The name and the line belong together: they will be one card. A `<div>` groups them, and `class="card"` gives the
group a name we can style later.

# --goal-tr--

Ad ve cümle birlikte **tek bir kart** olacak. Birlikte duran parçaları bir kutuya koymak için `<div>` kullanılır:
kendi başına hiçbir şey göstermeyen, sadece **gruplayan** bir etiket.

Kutuya bir de **sınıf adı** (class) veriyoruz: `card`. Sonraki adımlarda CSS ile "card adlı kutuyu şöyle
boya" diyebilmek için. Bu adımda sayfa görünüşte değişmeyecek.

# --code--

```html
<div class="card">
  <h1>Ada Lovelace</h1>
  <p>Learning to build websites</p>
</div>
```

# --meaning--

- `<div>` ... `</div>` wraps the heading and the paragraph into one box.
- `class="card"` is an attribute: extra information inside the opening tag. It names the box.
- Moving the two lines two spaces to the right shows they are inside the box; it is only for reading.

# --meaning-tr--

- `<div class="card">` → bir kutu açar. Açılış etiketinin içindeki `class="card"` bir **özellik** (attribute):
  etikete ek bilgi. Burada kutunun adı `card` (kart).
- İçerideki `h1` ve `p` artık bu kutunun **içinde**. İki boşluk içeri kaydırmamız bunu okurken görmek için;
  tarayıcı boşluklara bakmaz.
- `</div>` → kutu kapanır.

# --task--

Put `<div class="card">` above the `h1` and `</div>` below the `p`, and indent the two lines inside.

# --task-tr--

1. `<h1>` satırının **üstüne** `<div class="card">` yaz.
2. `<p>` satırının **altına** `</div>` yaz.
3. `h1` ve `p` satırlarını iki boşluk içeri al.
4. **Çalıştır**: sayfa aynı görünür, kontroller yeşil olmalı.

# --hint--

The class name goes in quotes inside the opening tag: `<div class="card">`.

# --hint-tr--

Sınıf adı açılış etiketinin içinde, tırnaklar arasında yazılır: `<div class="card">`.

# --tests--

A `div` with the class `card` should hold the heading and the paragraph.
tr: `card` sınıflı bir `div`, başlığı ve paragrafı içine almalı.

```js
const card = document.querySelector('div.card')
assert.isNotNull(card, 'no <div class="card">')
assert.isNotNull(card.querySelector('h1'), 'the <h1> should be inside the card')
assert.isNotNull(card.querySelector('p'), 'the <p> should be inside the card')
```

# --solution--

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>My card</title>
  </head>
  <body>
    <div class="card">
      <h1>Ada Lovelace</h1>
      <p>Learning to build websites</p>
    </div>
  </body>
</html>
```
