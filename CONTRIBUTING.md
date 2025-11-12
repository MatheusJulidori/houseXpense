# Contributing

Thank you for your interest in improving **houseXpense**!  
This project follows a modular clean architecture (modular monolith + clean + hexagonal edges). Every change must respect layer boundaries and reflect production-ready standards.

## Workflow

1. **Fork** `houseXpense` into your own GitHub account.  
2. **Clone** your fork and create a feature branch:

   ```bash
   git checkout -b feat/short-purpose
   ```

3. **Install dependencies**

   ```bash
   npm install --prefix server
   npm install --prefix frontend
   ```

4. **Run quality checks before pushing**

   ```bash
   npm run lint --prefix server
   npm run build --prefix server
   npm run lint --prefix frontend
   npm run build --prefix frontend
   ```

   > Add or run tests (`npm run test` / `npm run test:e2e`) whenever you touch logic that is or should be covered.
5. **Push** your branch to your fork and open a Pull Request against `main`.

For bugs, feel free to open an **Issue** instead of a PR if you do not intend to supply a fix.

## Code Quality Checklist

Pull Requests are reviewed against the rules documented in [`docs/code-quality-guidelines.md`](docs/code-quality-guidelines.md). Highlights:

- Controllers must rely on DTOs for all request and response payloads.
- Presentation layer (controllers/presenters) can only depend on application use cases. Do not import persistence entities, TypeORM repositories, or infrastructure providers directly.
- Use cases encapsulate business rules—keep transport, logging, and formatting elsewhere.
- Prefer reusable hooks/utilities on the frontend; avoid duplicating filtering or statistics logic.
- All TypeScript must compile under the enforced strict settings (no implicit `any`, no unsafe member access).
- Sensitive data must never reach logs or the UI.

## PR Expectations

- Provide a clear summary describing the motivation, the changes, and any follow-up work.
- Reference related issues when applicable.
- Include screenshots or recording for UX changes.
- Ensure build and lint commands pass for both `server/` and `frontend/`.
- Update documentation (`README.md`, `docs/`, API docs) when behaviour or setup steps change.

Following this workflow keeps the project coherent and demonstrates production-quality standards. Happy contributing!
