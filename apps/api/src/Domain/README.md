# Domain Layer

This layer is the **core** of the application and contains:

- **Entities** — Business objects with identity
- **Value Objects** — Immutable objects defined by their attributes
- **Domain Events** — Events raised by the domain
- **Domain Rules / Exceptions** — Business invariants

## Rules

- NO dependency on EF Core, ASP.NET Core, Infrastructure, or HTTP
- NO dependency on Application layer
- Pure C# / .NET BCL only

## Future modules (F3+)

```
Domain/
├── Identity/          # User, Role
├── Finance/           # Transaction, Account, Category
├── MilitaryPersonnel/ # Soldier, Unit
├── Training/          # TrainingPlan, Exercise
├── MilitaryManual/    # Manual, Section
└── Tasks/             # Task, Assignment
```
