---
id: accessible-button
title: Make an icon button accessible
type: web
skills: [fe.accessibility]
level: 3
---

# --description--

Screen readers announce a button by its accessible name. A button that only contains an icon has no name
unless you give it one with `aria-label`.

# --instructions--

Give the button the accessible name `Close dialog`, and make the script set the text of `#status` to `ready`.

# --hints--

The button should have `aria-label="Close dialog"`.

```js
assert.strictEqual(document.querySelector('button')?.getAttribute('aria-label'), 'Close dialog')
```

The script should set `#status` to `ready`.

```js
assert.strictEqual(document.querySelector('#status')?.textContent, 'ready')
```

# --seed--

```html
<!doctype html>
<html>
  <head></head>
  <body>
    <button type="button">✕</button>
    <p id="status"></p>
  </body>
</html>
```

```css
button { font-size: 1.5rem; }
```

```js
// Set the status text here
```

# --solutions--

```html
<!doctype html>
<html>
  <head></head>
  <body>
    <button type="button" aria-label="Close dialog">✕</button>
    <p id="status"></p>
  </body>
</html>
```

```css
button { font-size: 1.5rem; }
```

```js
document.querySelector('#status').textContent = 'ready'
```
