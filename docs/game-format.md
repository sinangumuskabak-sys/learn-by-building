# Game format

A game lives in `content/games/<id>/`:

```
content/games/snake/
  game.json
  steps/
    01-canvas.md
    02-grid.md
    ...
```

## game.json

```json
{
  "id": "snake",
  "order": 40,
  "title": { "en": "Snake", "tr": "Yılan" },
  "description": { "en": "...", "tr": "..." },
  "difficulty": "beginner",
  "canvas": { "width": 400, "height": 400 },
  "color": "#22c55e",
  "skills": ["game.loop", "prog.arrays"],
  "extend": [{ "en": "Idea for after the last step", "tr": "..." }]
}
```

`order` sorts the game list (easier games first). `difficulty` is `beginner`, `intermediate` or `advanced`.

## Steps

Steps run in file-name order. The learner edits one file, `game.js`, which runs on a page containing only
`<canvas id="game" width=… height=…>`. Each step carries the code forward: it opens with the learner's code from the
previous step (or the previous step's reference solution).

```md
---
title: The game loop
title_tr: Oyun döngüsü
skills: [game.loop]
---

# --explanation--
Why this step matters and the idea behind it.

# --explanation-tr--
Türkçesi.

# --task--
Exactly what to change, naming every variable and function the tests read.

# --task-tr--
Türkçesi.

# --tests--

The head should move right.
tr: Baş sağa gitmeli.

```js
$.run(1)
assert.isAbove(head.x, 5)
```

# --seed--      (first step only)

# --solution--  (the whole game.js after this step)
```

English and Turkish are both required.

### Four-part steps (preferred)

New steps teach in a fixed order, shown as four parts the learner opens one after another. Use these sections
instead of `explanation`:

```md
# --goal--            1. What we are doing in this step and why (short; one idea).
# --goal-tr--
# --code--            2. The code the learner will write, as one code block (the new or changed lines only).
# --meaning--         3. What it means, line by line or part by part.
# --meaning-tr--
# --task--            4. Your turn: exactly where to write it, then Run.
# --task-tr--

# --predict--         optional: a guess before running (question, then options; the right one is "- [x]")
# --predict-tr--
# --hint--            optional: shown in the hint box when a check fails
# --hint-tr--
# --try--             optional: a small change to try after the step passes (not checked)
# --try-tr--
```

A predict section looks like this; an indented line under an option says why it is right or wrong:

```md
What will the square do?
- [ ] Walk slowly to the right
- [x] Shoot off to the right in a blink
  The loop runs about 60 times a second.
```

The **last** step may be a "build it yourself" step: only `goal`, `task` and tests (no `code`, no `meaning`). The
learner sees what to build and writes it with what they learned; `hint` is where to put a nudge.

Keep steps small: one idea and a few lines of code each. The editor locks the lines the step's solution keeps from
the code it starts with (the finished parts), so the learner writes only between them; when a step only adds lines,
an empty line is opened there to type into. `npm run validate` checks that a step has either `explanation` or all of
`goal`, `code` and `meaning`, and that predict questions have exactly one right option.

## Build projects (web pages)

`"kind": "web"` in `game.json` makes a build project: the learner writes one `index.html` (styles in a `<style>` tag,
scripts in `<script>` tags), `seed` and `solution` are ```` ```html ```` blocks, and `canvas` is left out. The page
updates as the learner types. Its tests are like web challenge tests: they run inside the page (in `npm run validate`,
in jsdom) and see `document` and `window`. Read styles with `window.getComputedStyle(...)`, or from the page's own
rules through `document.styleSheets` when a value is written differently by browsers and jsdom (shorthands such as
`margin: 40px auto`, `list-style`).

## Tests

Tests run on a **simulated page**, never a real browser: the canvas records draw calls, the clock only moves when the
test says so, and `Math.random` is seeded, so results are the same every time. A test sees the learner's top-level
variables and functions, plus `assert` (Chai) and `$`:

| `$.` | What it does |
|---|---|
| `tick(n = 1)` | advance `n` frames (1/60 s each), firing due timers and `requestAnimationFrame` callbacks |
| `run(seconds)` | advance by seconds |
| `press(key)` / `release(key)` / `tap(key)` | keyboard events (`'ArrowUp'`, `' '`, `'a'`…) on `document`; `press(key, { repeat: true })` is an auto-repeat |
| `click(x, y)` / `move(x, y)` | pointer and mouse events on the canvas, in canvas pixels |
| `pointerDown(x, y)` / `pointerUp(x, y)` | press or release without the other half of a click |
| `rightClick(x, y)` | a right click, ending in a `contextmenu` event |
| `rects(color?)` | filled rectangles in the current picture: `{ x, y, w, h, color }` |
| `texts()` / `arcs()` | text (runs of spaces as one, trimmed) and circles in the current picture |
| `screen()` / `calls` | raw draw calls (current picture / since load) |
| `seed(n)` | restart the random sequence |
| `time`, `frames`, `pendingFrames`, `timers` | clock and loop state |

"Current picture" means everything drawn since the last full-canvas `clearRect` or `fillRect`.

Test behaviour, not wording: set up state directly (`food = { x: 6, y: 5 }`) instead of relying on random placement,
and accept reasonable ranges when timing can differ between correct solutions.

After adding a game, run `npm run readme:games` to update the list of games in the README.
