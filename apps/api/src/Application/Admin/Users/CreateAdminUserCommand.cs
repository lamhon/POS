using MediatR;
using Microsoft.EntityFrameworkCore;
using PersonalOs.Application.Admin.DTOs;
using PersonalOs.Application.Common.Interfaces;
using PersonalOs.Domain.Entities;

namespace PersonalOs.Application.Admin.Users;

public record CreateAdminUserCommand(
    Guid AdminUserId,
    string Email,
    string DisplayName,
    string Password,
    string? FullName = null,
    string? Username = null,
    string? Phone = null,
    string Role = "User",
    string Status = "Active",
    string? IpAddress = null
) : IRequest<AdminUserDetailDto>;

public class CreateAdminUserCommandHandler : IRequestHandler<CreateAdminUserCommand, AdminUserDetailDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;

    public CreateAdminUserCommandHandler(IApplicationDbContext context, IIdentityService identityService)
    {
        _context = context;
        _identityService = identityService;
    }

    public async Task<AdminUserDetailDto> Handle(CreateAdminUserCommand request, CancellationToken cancellationToken)
    {
        // 1. Validate Email uniqueness
        var normalizedEmail = request.Email.ToUpperInvariant();
        var emailExists = await _context.Users.AnyAsync(u => u.NormalizedEmail == normalizedEmail && !u.IsDeleted, cancellationToken);
        if (emailExists)
        {
            throw new InvalidOperationException("Email is already registered.");
        }

        // 2. Validate Username uniqueness
        if (!string.IsNullOrWhiteSpace(request.Username))
        {
            var usernameExists = await _context.Users.AnyAsync(u => u.Username != null && u.Username.ToLower() == request.Username.ToLower() && !u.IsDeleted, cancellationToken);
            if (usernameExists)
            {
                throw new InvalidOperationException("Username is already taken.");
            }
        }

        // 2.2 Validate Phone uniqueness
        if (!string.IsNullOrWhiteSpace(request.Phone))
        {
            var phoneExists = await _context.Users.AnyAsync(u => u.Phone != null && u.Phone == request.Phone && !u.IsDeleted, cancellationToken);
            if (phoneExists)
            {
                throw new InvalidOperationException("Phone number is already registered.");
            }
        }

        // 3. Find the assigned role
        var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == request.Role, cancellationToken);
        if (role == null)
        {
            throw new InvalidOperationException($"Role '{request.Role}' not found.");
        }

        // 4. Role Level Check (Admin cannot create Super Admin)
        var admin = await _context.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == request.AdminUserId, cancellationToken);

        var adminRoleName = admin?.UserRoles.FirstOrDefault()?.Role.Name ?? "Admin";

        if (adminRoleName != "Super Admin" && request.Role == "Super Admin")
        {
             throw new UnauthorizedAccessException("You do not have permission to create a Super Admin account.");
        }
        
        if (adminRoleName == "Moderator" && (request.Role == "Admin" || request.Role == "Super Admin"))
        {
             throw new UnauthorizedAccessException("You do not have permission to create an Admin or Super Admin account.");
        }

        // 5. Create new User object
        if (!Enum.TryParse<UserStatus>(request.Status, true, out var parsedStatus))
        {
            parsedStatus = UserStatus.Active;
        }

        var newUser = new User
        {
            Email = request.Email,
            NormalizedEmail = normalizedEmail,
            DisplayName = request.DisplayName,
            FullName = request.FullName,
            Username = request.Username,
            Phone = request.Phone,
            Status = parsedStatus,
            MustChangePassword = true // Force password change on first login
        };

        newUser.PasswordHash = _identityService.HashPassword(newUser, request.Password);

        _context.Users.Add(newUser);

        // 6. Map role
        _context.UserRoles.Add(new UserRole
        {
            UserId = newUser.Id,
            RoleId = role.Id
        });

        // 7. Log audit action
        _context.AuditLogs.Add(new AuditLog
        {
            AdminUserId = request.AdminUserId,
            AdminRole = adminRoleName,
            Action = "USER_CREATED",
            TargetId = newUser.Id.ToString(),
            AfterData = System.Text.Json.JsonSerializer.Serialize(new { 
                newUser.Email, 
                newUser.DisplayName, 
                newUser.Username, 
                Role = role.Name,
                newUser.Status 
            }),
            Reason = "User created by administrator",
            IpAddress = request.IpAddress
        });

        await _context.SaveChangesAsync(cancellationToken);
        
        // Return mapped DTO
        return AdminUserMapper.ToDetailDto(newUser);
    }
}
