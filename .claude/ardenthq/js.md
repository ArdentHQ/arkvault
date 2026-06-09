<!-- airc v0.2.0 — managed file, do not edit -->

# JavaScript / TypeScript

Code-writing rules for JS/TS files. Apply when writing or editing JS/TS code.

## Types

- TypeScript in strict mode. Don't disable strict checks per file.
- Avoid `any` — use `unknown` and narrow, or a precise type.
- Add explicit return types to exported functions.
- Prefer `type` aliases; use `interface` only when you need declaration merging.
- Keep shared/exported types in a dedicated `*.types.ts` file, not scattered across unrelated modules.

## Syntax

- Named exports over default exports (except where a framework requires default, e.g. a Next.js page).
- Use curly braces for every control structure, even single-line bodies.

## Comments

- No comments unless explaining a non-obvious **why** (see `core.md`).
- Well-named identifiers over a comment explaining the "what".

## Package manager

- Prefer **pnpm** over `npm` or `yarn`.

## Scripts

Use the standard scripts; don't invoke the underlying tool directly:

- `pnpm format` — formatter (Prettier)
- `pnpm lint` — linter (ESLint)
- `pnpm test` / `pnpm test:coverage` — tests

## Avoid

- Mutating arguments or inputs — take them immutable, return new values.
