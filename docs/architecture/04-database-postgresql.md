# 04. Database (PostgreSQL)

## Technology Choices
- **Engine**: PostgreSQL 16
- **ORM**: Entity Framework Core 8
- **Provider**: Npgsql
- **Conventions**: Snake Case (`EFCore.NamingConventions`)

## Architecture Principles
1. **No Business Logic in DbContext**: The `PersonalOsDbContext` does not contain business logic. It inherits from `DbContext` and implements `IUnitOfWork`.
2. **Modular Configurations**: Entities are configured using `IEntityTypeConfiguration<T>`. Configurations are dynamically loaded using `ApplyConfigurationsFromAssembly`.
3. **Auditable Interceptors**: Fields like `CreatedAt` and `UpdatedAt` are populated automatically by the `AuditableEntityInterceptor`.
4. **Isolated Infrastructure**: The database context is strictly part of the Infrastructure layer. The Application layer only references `IUnitOfWork`.

## Migrations
Migrations are stored in `src/Infrastructure/Persistence/Migrations`. 

To generate a new migration, use:
```powershell
dotnet ef migrations add <MigrationName> -p src\Infrastructure\PersonalOs.Infrastructure.csproj -s src\Api\PersonalOs.Api.csproj -o Persistence\Migrations
```

## Infrastructure Extensions
The database and related services (like health checks) are registered in `InfrastructureServiceExtensions.cs`. Connection strings are read from the `IConfiguration` via `appsettings.json` and environment variables.
