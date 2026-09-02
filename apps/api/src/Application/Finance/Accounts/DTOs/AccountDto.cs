using PersonalOs.Domain.Enums;

namespace PersonalOs.Application.Finance.Accounts.DTOs;

public record AccountDto(
    Guid Id,
    string Name,
    AccountType Type,
    string Currency,
    decimal OpeningBalance,
    decimal CurrentBalance,
    bool IsActive,
    DateTimeOffset CreatedAt,
    DateTimeOffset? UpdatedAt
);
