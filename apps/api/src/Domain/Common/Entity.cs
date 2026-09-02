namespace PersonalOs.Domain.Common;

/// <summary>
/// Base class for all domain entities.
/// </summary>
/// <typeparam name="TId">The type of the entity's identifier.</typeparam>
public abstract class Entity<TId>
{
    public TId Id { get; protected set; } = default!;
}

/// <summary>
/// Default entity base class using Guid (UUID) as the primary key.
/// </summary>
public abstract class Entity : Entity<Guid>
{
    protected Entity()
    {
        Id = Guid.NewGuid();
    }
}
