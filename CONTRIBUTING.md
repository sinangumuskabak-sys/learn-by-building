# Contributing

Thanks for helping! Until the content engine lands (phase F1), contributions are limited to issues and UI fixes.

## Before opening a pull request

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

All four must pass; CI runs the same checks.

## Writing challenges

The challenge format (Markdown with description, instructions, test hints, seed code and solutions) is documented
here once phase F1 is complete. Every challenge must have a reference solution that passes its tests, and its seed
code must fail them.
