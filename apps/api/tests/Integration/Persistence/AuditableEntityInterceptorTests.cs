using Microsoft.EntityFrameworkCore;
using PersonalOs.Domain.Common;
using PersonalOs.Infrastructure.Persistence.Context;
using PersonalOs.Infrastructure.Persistence.Interceptors;

namespace PersonalOs.Tests.Integration.Persistence;

public class TestAuditableEntity : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
}

public class TestDbContext : DbContext
{
    private readonly AuditableEntityInterceptor _interceptor;

    public TestDbContext(DbContextOptions<TestDbContext> options, AuditableEntityInterceptor interceptor)
        : base(options)
    {
        _interceptor = interceptor;
    }

    public DbSet<TestAuditableEntity> TestEntities => Set<TestAuditableEntity>();

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.AddInterceptors(_interceptor);
        base.OnConfiguring(optionsBuilder);
    }
}

public class AuditableEntityInterceptorTests
{
    private TestDbContext CreateDbContext()
    {
        var interceptor = new AuditableEntityInterceptor();
        var options = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        var context = new TestDbContext(options, interceptor);
        return context;
    }

    [Fact]
    public async Task SaveChangesAsync_Should_SetCreatedAt_WhenEntityIsAdded()
    {
        // Arrange
        using var context = CreateDbContext();
        var entity = new TestAuditableEntity { Name = "Test" };

        // Act
        context.TestEntities.Add(entity);
        await context.SaveChangesAsync();

        // Assert
        Assert.NotEqual(default, entity.CreatedAt);
        Assert.NotEqual(default, entity.UpdatedAt);
        Assert.Equal(entity.CreatedAt, entity.UpdatedAt);
    }

    [Fact]
    public async Task SaveChangesAsync_Should_UpdateUpdatedAt_WhenEntityIsModified()
    {
        // Arrange
        using var context = CreateDbContext();
        var entity = new TestAuditableEntity { Name = "Test" };
        context.TestEntities.Add(entity);
        await context.SaveChangesAsync();
        
        var originalCreatedAt = entity.CreatedAt;
        var originalUpdatedAt = entity.UpdatedAt;

        // Simulate time passing
        await Task.Delay(10);

        // Act
        entity.Name = "Updated Test";
        await context.SaveChangesAsync();

        // Assert
        Assert.Equal(originalCreatedAt, entity.CreatedAt);
        Assert.True(entity.UpdatedAt > originalUpdatedAt);
    }
}
