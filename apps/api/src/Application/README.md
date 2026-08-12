# Application Layer

This layer orchestrates **use cases** and contains:

- **Commands** — Write operations (CQRS)
- **Queries** — Read operations (CQRS)
- **DTOs** — Data Transfer Objects for input/output
- **Validators** — Input validation (FluentValidation)
- **Interfaces / Ports** — Abstractions for Infrastructure services
- **Use Cases** — Application-level business logic

## Rules

- Depends on **Domain** only
- NO dependency on Infrastructure, EF Core, ASP.NET Core, or HTTP
- Infrastructure contracts defined here as interfaces, implemented in Infrastructure

## Future modules (F3+)

```
Application/
├── Identity/
│   ├── Commands/LoginCommand.cs
│   └── Queries/GetCurrentUserQuery.cs
├── Finance/
│   ├── Commands/CreateTransactionCommand.cs
│   └── Queries/GetTransactionsQuery.cs
...
```
