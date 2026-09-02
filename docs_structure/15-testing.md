# Testing Strategy

## Pyramid
```text
E2E
  Integration
    Unit
```

## Backend
xUnit + FluentAssertions.
Test:
- Domain rules.
- Application use cases.
- Authorization.
- Database integration.
- API contracts.

Testcontainers có thể dùng để chạy PostgreSQL/Redis thật cho integration test.

## Frontend
Vitest + Testing Library.
Test:
- form validation.
- components.
- hooks.
- state transitions.

## E2E
Playwright.
Critical flows:
- login.
- create transaction.
- create training session.
- record training result.
- search manual.
- upload document.

## Rule
Không test implementation detail nếu có thể test observable behavior.

## CI
Pull request phải chạy:
- lint.
- typecheck.
- unit tests.
- integration tests phù hợp.
- build.
