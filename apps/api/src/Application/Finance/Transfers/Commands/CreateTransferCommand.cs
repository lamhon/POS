using MediatR;
using PersonalOs.Application.Finance.Transfers.DTOs;
using PersonalOs.Domain.Enums;
using PersonalOs.Domain.Entities;
using PersonalOs.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace PersonalOs.Application.Finance.Transfers.Commands;

public record CreateTransferCommand(
    Guid UserId,
    Guid SourceAccountId,
    Guid DestinationAccountId,
    decimal Amount,
    string Currency,
    decimal Fee,
    DateTimeOffset TransactionDate,
    string Description
) : IRequest<TransferDto>;

public class CreateTransferCommandHandler : IRequestHandler<CreateTransferCommand, TransferDto>
{
    private readonly IApplicationDbContext _context;

    public CreateTransferCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<TransferDto> Handle(CreateTransferCommand request, CancellationToken cancellationToken)
    {
        if (request.SourceAccountId == request.DestinationAccountId)
            throw new Exception("Source and Destination accounts must be different.");

        if (request.Amount <= 0)
            throw new Exception("Transfer amount must be greater than zero.");

        // 1. Get Accounts
        var sourceAccount = await _context.Accounts
            .FirstOrDefaultAsync(a => a.Id == request.SourceAccountId && a.UserId == request.UserId && !a.IsDeleted, cancellationToken);
            
        var destAccount = await _context.Accounts
            .FirstOrDefaultAsync(a => a.Id == request.DestinationAccountId && a.UserId == request.UserId && !a.IsDeleted, cancellationToken);

        if (sourceAccount == null) throw new Exception("Source account not found.");
        if (destAccount == null) throw new Exception("Destination account not found.");

        if (sourceAccount.Currency != request.Currency || destAccount.Currency != request.Currency)
            throw new Exception("Cross-currency transfers are not supported in MVP.");

        // 2. Create Transfer Entity
        var transfer = new Transfer
        {
            UserId = request.UserId,
            SourceAccountId = request.SourceAccountId,
            DestinationAccountId = request.DestinationAccountId,
            Amount = request.Amount,
            Currency = request.Currency,
            Fee = request.Fee,
            TransactionDate = request.TransactionDate,
            Description = request.Description
        };

        _context.Transfers.Add(transfer);

        // 3. Create 2 Transactions (Expense for Source, Income for Destination)
        var sourceTx = new Transaction
        {
            UserId = request.UserId,
            AccountId = request.SourceAccountId,
            Type = TransactionType.Transfer,
            Amount = request.Amount + request.Fee,
            Currency = request.Currency,
            Description = $"Transfer to {destAccount.Name}",
            TransactionDate = request.TransactionDate,
            Transfer = transfer
        };

        var destTx = new Transaction
        {
            UserId = request.UserId,
            AccountId = request.DestinationAccountId,
            Type = TransactionType.Transfer,
            Amount = request.Amount,
            Currency = request.Currency,
            Description = $"Transfer from {sourceAccount.Name}",
            TransactionDate = request.TransactionDate,
            Transfer = transfer
        };

        _context.Transactions.Add(sourceTx);
        _context.Transactions.Add(destTx);

        // 4. Update Balances
        sourceAccount.CurrentBalance -= (request.Amount + request.Fee);
        destAccount.CurrentBalance += request.Amount;

        sourceAccount.VerifyBalance();
        destAccount.VerifyBalance();

        // Save everything in one transaction (EF Core does this automatically on SaveChangesAsync)
        await _context.SaveChangesAsync(cancellationToken);

        return new TransferDto(
            transfer.Id,
            transfer.SourceAccountId,
            transfer.DestinationAccountId,
            transfer.Amount,
            transfer.Currency,
            transfer.Fee,
            transfer.TransactionDate,
            transfer.Description
        );
    }
}
