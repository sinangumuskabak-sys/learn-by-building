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

## Turkish

Every learner-facing text can have a Turkish version; missing ones fall back to English.

- `title_tr:` in the frontmatter.
- `# --description-tr--`, `# --instructions-tr--`: the same sections in Turkish.
- In `# --hints--`, a line starting with `tr:` right under the English requirement.
- `# --questions-tr--`: the same questions in the same order, with the same options and answers (validated).
- `# --rubric-tr--`: the same number of lines as `# --rubric--`.

## Required sections by type

| Type | Needs |
|---|---|
| `code-js`, `code-ts`, `sql`, `web` | description, hints (tests), seed, solutions |
| `quiz` | description, questions (each with ≥1 correct and ≥1 wrong option) |
| `read` | description, seed (code to read), questions |
| `design` | description, rubric |

Non-runnable types (`quiz`, `read`, `design`) must not have hints or solutions.

`npm run validate` runs every runnable challenge twice: the seed must fail at least one test and every reference
solution must pass all of them.

## What tests can use

Tests are JavaScript and always get Chai's `assert` and `code` (the learner's raw source).

| Type | Also available |
|---|---|
| `code-js`, `code-ts` | the learner's top-level variables and functions (TypeScript types are stripped, not checked) |
| `sql` | `rows` (objects from the last statement), `columns`, `await query(sql)` to inspect the database |
| `web` | `document` and `window` of the rendered page |

Learner code runs once per test in a fresh scope, so tests do not affect each other. In the browser, JS/TS runs in a
Web Worker with a 5 s timeout; SQL runs in PGlite (Postgres compiled to WebAssembly), loaded only when needed.
