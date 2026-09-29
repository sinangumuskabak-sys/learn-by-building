---
title: Add your links
title_tr: Bağlantılarını ekle
skills: [fe.html]
---

# --goal--

A card says how to reach you. We add a list of links: e-mail and a website.

# --goal-tr--

Kartvizit sana **nasıl ulaşılacağını** söyler. Kartın altına bir **bağlantı listesi** ekleyeceğiz: e-posta ve
bir web sitesi (GitHub, Instagram, ne istersen).

Bağlantılar `<a>` etiketiyle yapılır; liste ise `<ul>` ve `<li>` ile.

# --code--

```html
<ul>
  <li><a href="mailto:ada@example.com">E-mail</a></li>
  <li><a href="https://github.com/">GitHub</a></li>
</ul>
```

# --meaning--

- `<ul>` is a list; each `<li>` is one item.
- `<a href="...">text</a>` is a link: `href` is where it goes, the text is what you click.
- `mailto:` opens an e-mail to that address.

# --meaning-tr--

- `<ul>` → **madde işaretli liste** (unordered list). Her maddesi bir `<li>` (list item).
- `<a href="...">E-mail</a>` → **bağlantı**. `href` özelliği bağlantının **nereye** gittiğini söyler; `<a>` ile
  `</a>` arasındaki yazı tıklanan kısımdır.
- `mailto:ada@example.com` → tıklayınca bu adrese e-posta yazma penceresi açılır. Kendi adresini yazabilirsin.
- `https://github.com/` → bir web sitesi adresi. Kendi profilinin adresini yazabilirsin.
- Etiketler iç içe: liste → madde → bağlantı. Her biri kendi sırasıyla kapanır.

# --task--

Write the list inside the card, under the paragraph.

# --task-tr--

Listeyi kartın içine, `<p>` satırının altına yaz (`</div>`'in üstüne). Adresleri kendininkilerle
değiştirebilirsin. **Çalıştır**.

# --hint--

Each `<li>` holds one `<a>`, and the address goes in quotes after `href=`.

# --hint-tr--

Her `<li>` bir `<a>` taşır; adres `href=` sonrasında tırnak içine yazılır.

# --tests--

The card should have a list with at least two links.
tr: Kartta en az iki bağlantılı bir liste olmalı.

```js
const links = document.querySelectorAll('.card ul li a[href]')
assert.isAtLeast(links.length, 2, 'two <li><a href="...">…</a></li> items inside a <ul> in the card')
```

One link should be an e-mail link.
tr: Bağlantılardan biri e-posta bağlantısı olmalı.

```js
assert.isNotNull(document.querySelector('.card a[href^="mailto:"]'), 'an <a href="mailto:...">')
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
      <ul>
        <li><a href="mailto:ada@example.com">E-mail</a></li>
        <li><a href="https://github.com/">GitHub</a></li>
      </ul>
    </div>
  </body>
</html>
```
