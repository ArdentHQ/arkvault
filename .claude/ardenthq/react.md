# React

React/TSX conventions. Pairs with `js.md`. Tiers run from **Essential** (non-negotiable) to **Use with caution** (judgment calls).

## Essential

- One exported component per file; small private sub-components can share it.
- Component files are PascalCase, matching the export (`VotesFilter.tsx`); other files — hooks, utils — are kebab-case (`use-validators.ts`).
- Components use named exports — except where a framework requires a default (Inertia / Next.js pages).
- Name the props type after the component with a `Properties` suffix (`ButtonProperties`), not an inline anonymous shape.
- When a component wraps a host element, extend that element's props so callers can pass native attributes through: `type ButtonProperties = React.ComponentPropsWithoutRef<'button'> & { … }` (use `Omit<…>` to replace one).
- Callback props are named `onX` (`onChange`, `onConfirm`); a component's own internal handlers are named `handleX` (`handleSelectPage`).
- Rendering is pure: compute the JSX from props and state without side effects or mutating them. Side effects belong in event handlers or effects.

## Strongly recommended

- Render list items as named subcomponents (`UsersTable` → `UsersTableRow`), not inline markup inside a `.map()`. Passing the item down or wiring a handler per row is the signal to extract.
- Group code by feature/domain (`domains/vote/{components,hooks,utils}`), not by technical type spread across the app.
- Cross-domain code lives in one dedicated shared area (`shared/`, `app/`), not inside a feature folder. Shared primitives keep plain names (`Button`, `Modal`) — their location, not a prefix, marks them as shared.
- Co-locate tests with the code they cover as `*.test.tsx`.
- One source of truth per piece of state — don't copy props into state.
- Name from general to specific so siblings group together (`SearchInput`, `SearchButton` — not `InputSearch`).

## Recommended

- Order a component file: imports, types, then the component — inside it, hooks → derived values → handlers → `return`.
- For shared context, pair an `XProvider` with a `useXContext` hook that throws when used outside the provider, instead of exporting the raw context.

## Use with caution

- Prefer typing the props parameter over `React.FC` — it mainly adds an implicit `children` you usually don't want.
- Reach for context only for genuinely cross-cutting state — passing a couple of props is not prop-drilling.
