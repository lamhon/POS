# F0 → F2 Development Tasks

## Execution Order

```text
F0 Repository Initialization
        ↓
F1 Frontend Bootstrap
        ↓
F2 Backend Bootstrap
        ↓
F3 Authentication & Authorization
        ↓
F4 App Shell / Design System
        ↓
F5 Finance MVP
```

## Files

1. `F0-REPOSITORY-INITIALIZATION.md`
   - Repository structure
   - Git
   - Environment
   - Documentation
   - MapNode
   - Foundation only

2. `F1-FRONTEND-BOOTSTRAP.md`
   - Next.js
   - TypeScript
   - App Router
   - Tailwind
   - shadcn/ui
   - Frontend architecture
   - API client foundation

3. `F2-BACKEND-BOOTSTRAP.md`
   - ASP.NET Core
   - Clean Architecture
   - Modular Monolith
   - EF Core
   - PostgreSQL
   - Health Check
   - OpenAPI
   - Logging
   - Error handling

## AI execution rule

AI must execute these tasks sequentially.

Do not start F1 if F0 acceptance criteria are not satisfied.

Do not start F2 if F0/F1 foundation is not stable enough.

Business modules must not be implemented during F0-F2.

## Expected state after F2

```text
personal-os/
├── apps/
│   ├── web/     # Next.js shell
│   └── api/     # ASP.NET Core foundation
├── docs/
├── mapnode/
├── infrastructure/
└── README.md
```

System flow:

```text
Browser
   ↓
Next.js
   ↓
ASP.NET Core
   ↓
PostgreSQL
```

The next task is `F3 — Authentication & Authorization`.
