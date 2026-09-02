using PersonalOs.Domain.Enums;

namespace PersonalOs.Application.Finance.Transactions.DTOs;

public record TransactionDto(
    Guid Id,
    Guid AccountId,
    Guid? CategoryId,
    TransactionType Type,
    decimal Amount,
    string Currency,
    string Description,
    string? Notes,
    DateTimeOffset TransactionDate,
    Guid? TransferId
);
