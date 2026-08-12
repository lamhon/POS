# Infrastructure Layer

This layer contains **external concerns** and infrastructure implementations:

- **Persistence** — EF Core DbContext, entity configurations, migrations
- **Repositories** — Concrete implementations of Domain repository interfaces
- **External Services** — HTTP clients, email, storage adapters
- **Logging Sinks** — Serilog configuration
- **Extensions** — DI registration helpers per module

## Rules

- Depends on **Application** and **Domain**
- Implements interfaces defined in Application
- NO business logic here — only technical plumbing

## Current (F2 Foundation)

```
Infrastructure/
├── Persistence/
│   └── ApplicationDbContext.cs   # EF Core foundation
└── Extensions/
    └── InfrastructureServiceExtensions.cs   # DI registration
```

## Future modules (F3+)

```
Infrastructure/
├── Persistence/
│   ├── Configurations/           # IEntityTypeConfiguration<T>
│   └── Migrations/
├── Identity/                     # ASP.NET Core Identity stores
├── Storage/                      # MinIO / S3
├── Cache/                        # Redis
└── BackgroundJobs/               # Hangfire
```
