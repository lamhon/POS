using PersonalOs.Domain.Entities;

namespace PersonalOs.Application.Common.Interfaces;

public record AuthResult(string AccessToken, string RefreshToken, User User);

public interface IIdentityService
{
    Task<AuthResult> LoginAsync(string email, string password, CancellationToken cancellationToken = default);
    Task<AuthResult> RegisterAsync(string email, string password, string displayName, CancellationToken cancellationToken = default);
    Task<AuthResult> RefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default);
    Task RevokeTokenAsync(string refreshToken, CancellationToken cancellationToken = default);
    Task<User?> GetUserByIdAsync(Guid userId, CancellationToken cancellationToken = default);
    string HashPassword(User user, string password);
}
