---
title: Your name as a heading
title_tr: Başlık olarak adın
skills: [fe.html]
---

# --goal--

We are making a business card web page. A web page is written in **HTML**: text wrapped in tags that say what
each part is. The first thing on a card is your name, as the page's main heading.

# --goal-tr--

Kendi **kartvizit** sayfanı yapacağız: adın, ne yaptığın ve bağlantıların olan küçük, şık bir kart. Sağdaki
**Bitmiş hâlini gör** düğmesine basarsan sonunda nasıl görüneceğini görebilirsin.

Web sayfaları **HTML** ile yazılır. HTML'de her parça **etiketler** arasına yazılır; etiket o parçanın ne olduğunu
söyler: "bu bir başlık", "bu bir paragraf"... İlk iş: adını sayfanın **ana başlığı** yapmak.

Editördeki kodun büyük kısmı her sayfada olan hazır iskelet; sen yalnız `<body>` (sayfanın görünen gövdesi) içine
yazacaksın.

# --code--

```html
<h1>Ada Lovelace</h1>
```

# --meaning--

- `<h1>` opens a level-1 heading, the most important title on the page; `</h1>` (with a slash) closes it.
- Whatever is between them is the heading's text: write **your own name**.
- Everything visible goes inside `<body>`.

# --meaning-tr--

- `<h1>` → **açılış etiketi**: "burada 1. düzey başlık başlıyor". `h1` sayfanın en büyük, en önemli başlığıdır
  (`h2`, `h3`... giderek küçülür).
- `Ada Lovelace` → başlığın yazısı. Ada Lovelace ilk bilgisayar programını yazan kişi; sen **kendi adını** yaz.
- `</h1>` → **kapanış etiketi**: başındaki `/` "burada bitti" demek. Açtığın her etiketi kapatırsın.
- Bu satır `<body>` ile `</body>` arasına yazılır: sayfada görünen her şey orada durur.

# --task--

Write the line with your own name on the empty line inside `<body>`. The page on the right updates as you type.

# --task-tr--

1. `<body>` ile `</body>` arasındaki boş satıra yaz: `<h1>` + **kendi adın** + `</h1>`.
2. Yazdıkça sağdaki sayfa kendiliğinden güncellenir. Sonra **Çalıştır**'a bas.

# --predict--

What will the name look like on the page?
- [x] Big and bold, like a title
  Browsers show `h1` big and bold by default.
- [ ] Small, like normal text
- [ ] The tags `<h1>` will show too
  Tags are instructions for the browser; only the text between them is shown.

# --predict-tr--

Ad sayfada nasıl görünecek?
- [x] Büyük ve kalın, başlık gibi
  Tarayıcılar `h1`'i kendiliğinden büyük ve kalın gösterir.
- [ ] Küçük, normal yazı gibi
- [ ] `<h1>` etiketleri de görünecek
  Etiketler tarayıcıya talimattır; yalnız aralarındaki yazı görünür.

# --hint--

Check that the closing tag has a slash: `</h1>`.

# --hint-tr--

Kapanış etiketinde eğik çizgi olduğundan emin ol: `</h1>`.

# --tests--

The page should have an `h1` heading with your name in it.
tr: Sayfada içinde adın yazan bir `h1` başlığı olmalı.

```js
const h1 = document.querySelector('h1')
assert.isNotNull(h1, 'no <h1> on the page')
assert.isAbove(h1.textContent.trim().length, 0, 'the heading is empty')
```

# --seed--

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>My card</title>
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
    <title>My card</title>
  </head>
  <body>
    <h1>Ada Lovelace</h1>
  </body>
</html>
```
