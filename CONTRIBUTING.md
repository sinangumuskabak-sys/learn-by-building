# Contributing

Thanks for helping!

## Before opening a pull request

```bash
npm run typecheck && npm run lint && npm run validate && npm test && npm run build && npm run e2e
```

All five must pass; CI runs the same checks.

## Writing challenges

See [docs/challenge-format.md](docs/challenge-format.md). Every challenge must have a reference solution that passes its tests, and its seed
code must fail them.

## Writing games

The Game Workshop builds a whole game in small steps. See [docs/game-format.md](docs/game-format.md). Every step's
solution must pass its tests, and the code the step starts from (the previous step's solution) must fail them.
