# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ARK Vault is a React-based cryptocurrency wallet application for ARK Core blockchains. It features real-time updates, Ledger hardware wallet support, multi-signature capabilities, and comprehensive transaction management.

## Development Setup

### Commands

**Development:**

- `pnpm dev` - Start development server with hot reloading
- `pnpm build` - Build for production (runs TypeScript compilation + Vite build)
- `pnpm serve` - Preview production build locally on port 5001

**Code Quality:**

- `pnpm lint` - Run ESLint and fix issues automatically
- `pnpm prettier` - Format code with Prettier
- `pnpm format` - Run both linting and formatting

**Testing:**

- `pnpm test` - Run unit tests with Vitest in watch mode (also updates snapshots via `--update`)
- `pnpm test:coverage` - Generate test coverage report (100% threshold enforced by default)
- `pnpm test:e2e` - Run end-to-end tests with TestCafe against `http://localhost:5001`

**Single Test Execution:**

- `vitest run path/to/test.test.tsx` - Run a specific test file once (no watch)
- `vitest run --reporter=verbose path/to/test.test.tsx` - Run with detailed output

## Architecture Overview

### Domain-Driven Structure

The codebase follows a domain-driven architecture:

- **`src/app/`** - Core framework: shared components, contexts, hooks, services, i18n, and the two library layers below
- **`src/app/lib/mainsail/`** - Blockchain SDK layer: address/transaction/fee/ledger/signatory services, network config, DTOs, and collections
- **`src/app/lib/profiles/`** - Profile persistence layer: environment, profile, wallet, contact, exchange-transaction, and notification repositories with their aggregates and services
- **`src/domains/`** - Feature domains: `contact`, `dashboard`, `exchange`, `message`, `portfolio`, `profile`, `setting`, `transaction`, `vote`, `wallet`
- **`src/router/`** - React Router v7 setup with path enums, middleware (URL validation, preloading), and route aggregation

### Data Hierarchy

`Environment` (singleton, from `src/app/lib/profiles/`) → `Profile` (one per user) → `Wallet` (one per address). The global `env` object is provided via `EnvironmentProvider` context and is the entry point for all profile and wallet access.

### Context Providers

Pages are wrapped (in order) by: `EnvironmentProvider` → `LedgerProvider` → `ConfigurationProvider` → `NavigationProvider` → `PanelsProvider`. All are exported from `src/app/contexts/`. Component tests get these automatically via the `render` helper — you never wrap them manually.

### URL Structure

All authenticated routes follow `/profiles/:profileId/...` (e.g. `/profiles/:profileId/dashboard`). Path constants live in `src/router/paths.ts` as the `ProfilePaths` enum.

### Component Organization

- Each domain contains `components/`, `pages/`, `hooks/`, `validations/`, `routing.ts`, and `i18n.ts`
- Components are co-located with their tests, contracts (TypeScript interfaces), and styles
- Child components used only within a parent are nested inside the parent's folder
- Shared UI components live in `src/app/components/`

## Testing Conventions

Tests import from `@/utils/testing-library` (not directly from `@testing-library/react`), which re-exports everything from RTL plus project-specific helpers:

- `render` — wraps the component in all required providers with a memory router
- `renderWithoutRouter` — wraps in providers but no router
- `env` — pre-booted `Environment` instance loaded with fixture data from `src/tests/fixtures/`
- `getMainsailProfileId()`, `getDefaultWalletId()` — accessors for fixture IDs
- `renderResponsive(component, breakpoint)` — renders at a specific breakpoint

**Mocking pattern:** Use `vi.mock(...)` at the top of test files. Domain routing modules are commonly mocked to isolate to a single page. The global `env` from the setup file is reset between tests via `vitest.setup.ts`.

## Development Standards

### Import Alias

`@` maps to `src/`. Always use `@/` imports instead of relative paths when crossing directory boundaries.

### File Naming

| Type                 | Convention                   | Example               |
| :------------------- | :--------------------------- | :-------------------- |
| React component      | `ComponentName.tsx`          | `Button.tsx`          |
| Test                 | `ComponentName.test.tsx`     | `Button.test.tsx`     |
| TypeScript contracts | `ComponentName.contracts.ts` | `Button.contracts.ts` |
| Styles (CSS-in-JS)   | `ComponentName.styles.ts`    | `Button.styles.ts`    |

### TypeScript Naming

| Construct                       | Convention           |
| :------------------------------ | :------------------- |
| interface / type / class / enum | `PascalCase`         |
| Component props interface       | `ComponentNameProps` |
| variables / functions           | `camelCase`          |
| constants                       | `CONSTANT_CASE`      |
| data attributes / URL paths     | `kebab-case`         |

### Naming Philosophy (from `NAMING_CONVENTIONS.md`)

- Use full descriptive names: `NavigationBar` not `NavBar`, `ContactSupport` not `ContactSupportModal`
- No abbreviations except established UI units (`sm`, `md`, `lg`)
- No technical suffixes that don't add meaning (avoid `Modal`, `Component` in names)
- Avoid `any` types; use strict TypeScript throughout
- Avoid `* imports`; explicitly name every import

## Key Technologies

- **Frontend:** React 19, TypeScript, Vite, TailwindCSS
- **State Management:** React Context + custom hooks
- **Testing:** Vitest, React Testing Library, TestCafe (E2E with Gherkin)
- **Blockchain SDK:** `@ardenthq/arkvault-crypto`, `@ardenthq/arkvault-url`
- **Hardware Wallets:** Ledger via `@ledgerhq/hw-transport-webhid` / `webusb`
- **Forms:** `react-hook-form` with domain-specific validation files
