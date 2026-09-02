namespace PersonalOs.Domain.Common;

/// <summary>
/// Base class for entities that require auditing (creation and modification tracking).
/// </summary>
/// <typeparam name="TId">The type of the entity's identifier.</typeparam>
public abstract class AuditableEntity<TId> : Entity<TId>, IAuditableEntity
{
    public DateTimeOffset CreatedAt { get; set; }
    
    public string? CreatedBy { get; set; }
    
    public DateTimeOffset? UpdatedAt { get; set; }
    
    public string? UpdatedBy { get; set; }
}

/// <summary>
/// Default auditable entity base class using Guid (UUID) as the primary key.
/// </summary>
public abstract class AuditableEntity : AuditableEntity<Guid>
{
    protected AuditableEntity()
    {
        Id = Guid.NewGuid();
    }
}
