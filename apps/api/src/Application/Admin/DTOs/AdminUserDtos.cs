namespace PersonalOs.Application.Admin.DTOs;

public record AdminUserListDto(
    Guid Id,
    string Email,
    string DisplayName,
    string? FullName,
    string? Username,
    string? Phone,
    string? AvatarUrl,
    string Status,
    string? Role,
    bool EmailVerified,
    DateTimeOffset? LastLoginAt,
    DateTimeOffset CreatedAt
);

public record AdminUserDetailDto(
    Guid Id,
    string Email,
    string DisplayName,
    string? FullName,
    string? Username,
    string? Phone,
    string? AvatarUrl,
    string? Gender,
    DateTimeOffset? DateOfBirth,
    string Status,
    string? Role,
    bool EmailVerified,
    bool PhoneVerified,
    bool MustChangePassword,
    DateTimeOffset? LastLoginAt,
    DateTimeOffset CreatedAt,
    DateTimeOffset? UpdatedAt
);

public record AdminSessionDto(
    Guid Id,
    string? Device,
    string? Browser,
    string? Os,
    string? IpAddress,
    DateTimeOffset LastActiveAt,
    DateTimeOffset ExpiresAt,
    bool IsActive,
    DateTimeOffset CreatedAt
);

public record AdminUserWarningDto(
    Guid Id,
    string Type,
    string Title,
    string Message,
    string? CreatedByName,
    DateTimeOffset CreatedAt
);

public record AdminUserReportDto(
    Guid Id,
    string ReporterEmail,
    string ReasonCode,
    string? Description,
    string Status,
    string? Resolution,
    DateTimeOffset CreatedAt,
    DateTimeOffset? ResolvedAt
);

public record AuditLogDto(
    Guid Id,
    string AdminEmail,
    string AdminRole,
    string Action,
    string TargetType,
    string TargetId,
    string? BeforeData,
    string? AfterData,
    string? Reason,
    string? IpAddress,
    DateTimeOffset CreatedAt
);

public record AdminDashboardMetricsDto(
    int TotalUsers,
    int ActiveUsers,
    int PendingUsers,
    int LockedUsers,
    int DeletedUsers,
    int NewUsersToday,
    int NewUsersThisMonth,
    int UnverifiedUsers
);
