namespace PersonalOs.Application.Common.Interfaces;

/// <summary>
/// Interface for unit of work pattern to manage atomic database transactions.
/// </summary>
public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
