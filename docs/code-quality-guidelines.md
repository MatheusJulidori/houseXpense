# Code Quality Guidelines

This project targets a portfolio-grade standard. The following rules are mandatory when modifying or adding code.

## General Principles

- **DRY & Reuse:** Shared logic must live in reusable services, hooks, or utilities. Do not copy/paste formatting, filtering, or logging logic across modules.
- **KISS:** Keep functions small and focused. A function should have a single reason to change (SRP).
- **SOLID:** Respect clear layering—controllers handle transport concerns, use cases encapsulate business rules, repositories handle persistence.
- **Testing mindset:** Whenever a code path is non-trivial, plan for unit or integration coverage before merging.

## Backend (NestJS)

- **Layered modular monolith:** Each feature module owns `presentation/`, `application/`, `domain/`, and `infrastructure/` folders. Presentation talks only to application use cases; application depends on domain abstractions; infrastructure provides adapters via tokens.
- **DTOs everywhere:** All request payloads and responses must be mediated by DTO classes with `class-validator` decorators. Query parameters should use DTOs plus pipes instead of raw strings.
- **Service boundaries:** Use cases (application layer) contain orchestration logic and must return domain models or DTO-ready snapshots. Presentation never touches persistence entities or TypeORM repositories directly.
- **Logging & sanitization:** Use shared helpers to sanitize logs. Avoid untyped `any` and unsafe JSON stringification.
- **Transactions & repositories:** Multi-entity writes must be wrapped in transactions. Inject repositories or domain services via interfaces to decouple modules.

## Frontend (React + Vite)

- **Typed API layer:** All service methods must reference TypeScript interfaces that mirror backend DTOs. Keep API calls centralized.
- **Hooks & components:** Hooks should handle data orchestration; components should remain presentational where possible. Move derived data (statistics, filtering) into memoized helpers.
- **Error handling:** Provide consistent UX for failures (toast/snackbar) through shared utilities, not ad-hoc handling in components.
- **Directory hygiene:** Shared utilities go in `src/lib` or `src/utils`; avoid duplicating filter/date helpers inside hooks and services.

Refer to `CONTRIBUTING.md` for the contribution workflow and review expectations.
