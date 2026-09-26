# Challenge format

Content lives in `content/`:

| Path | Purpose |
|---|---|
| `content/curriculum.json` | Categories → modules → ordered challenge ids |
| `content/skills.json` | Shared skill ids (`prog.loops`, `db.rls`, …), each tied to a category |
| `content/challenges/<module>/<id>.md` | One challenge per file; the file name must equal its `id` |

Run `npm run validate` after every change. CI runs it too.

## File layout

````md
---
id: iterate-odd-numbers        # lowercase, digits, "-" or "."
title: Iterate odd numbers
type: code-js                  # code-js | code-ts | web | sql | quiz | read | design
skills: [prog.loops]           # ids from skills.json
level: 3                       # 0 Awareness … 8 Teach
lang: en                       # optional, en (default) or tr
---

# --description--
Markdown shown above the editor. Code blocks here are examples, not tests.

# --instructions--
What exactly to do.

# --hints--
Each requirement is a paragraph followed by one test code block.

```js
assert.deepEqual(odds, [1, 3, 5, 7, 9])
```

# --setup--
Hidden code that runs before the tests (SQL schema and rows, helpers).

# --seed--
Starter code, one block per file. Default names: index.js, index.ts, index.html, styles.css, query.sql.
Use `file=<name>` in the fence info to override: ```` ```css file=theme.css ````.

# --solutions--
Reference solution with the same files as the seed. Separate alternative solutions with a `---` line.

# --questions--
## Question text
- [ ] wrong option
- [x] correct option

# --rubric--
- One review criterion per line (design / critique challenges).
````

## Required sections by type

| Type | Needs |
|---|---|
| `code-js`, `code-ts`, `sql`, `web` | description, hints (tests), seed, solutions |
| `quiz` | description, questions (each with ≥1 correct and ≥1 wrong option) |
| `read` | description, seed (code to read), questions |
| `design` | description, rubric |

Non-runnable types (`quiz`, `read`, `design`) must not have hints or solutions. Test code sees the learner's variables, the raw source as `code`, and a Chai-style `assert`
(provided by the runners in phase F2).
