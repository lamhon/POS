using Microsoft.EntityFrameworkCore;

namespace PersonalOs.Infrastructure.Persistence;

/// <summary>
/// Application database context.
/// Business entity configurations will be added via IEntityTypeConfiguration&lt;T&gt; in future modules.
/// </summary>
public sealed class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all entity type configurations discovered from this assembly.
        // Module-specific configurations are registered via IEntityTypeConfiguration<T>.
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}
