using PersonalOs.Domain.Enums;

namespace PersonalOs.Application.Finance.Transfers.DTOs;

public record TransferDto(
    Guid Id,
    Guid SourceAccountId,
    Guid DestinationAccountId,
    decimal Amount,
    string Currency,
    decimal Fee,
    DateTimeOffset TransactionDate,
    string Description
);
