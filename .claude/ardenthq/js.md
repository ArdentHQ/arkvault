<!-- airc v0.3.0 — managed file, do not edit -->

# JavaScript / TypeScript

Code-writing rules for JS/TS files. Apply when writing or editing JS/TS code.

## Types

- TypeScript in strict mode. Don't disable strict checks per file.
- Avoid `any` — use `unknown` and narrow, or a precise type.
- Add explicit return types to exported functions.

## Syntax

- Named exports over default exports (except where a framework requires default, e.g. a Next.js page).
- Use curly braces for every control structure, even single-line bodies.

## Package manager

- Prefer **pnpm** over `npm` or `yarn`.

## Scripts

- Prefer the repo's `package.json` scripts over invoking the underlying tool directly.

## Avoid

- Mutating arguments or inputs — take them immutable, return new values.
