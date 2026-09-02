using MediatR;
using PersonalOs.Application.Common.Interfaces;
using PersonalOs.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace PersonalOs.Application.Finance.Transactions.Commands;

public record DeleteTransactionCommand(Guid Id, Guid UserId) : IRequest;

public class DeleteTransactionCommandHandler : IRequestHandler<DeleteTransactionCommand>
{
    private readonly IApplicationDbContext _context;

    public DeleteTransactionCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(DeleteTransactionCommand request, CancellationToken cancellationToken)
    {
        var transaction = await _context.Transactions
            .Include(t => t.Account)
            .FirstOrDefaultAsync(t => t.Id == request.Id && t.UserId == request.UserId && !t.IsDeleted, cancellationToken);

        if (transaction == null)
            throw new Exception("Transaction not found.");

        if (transaction.TransferId.HasValue)
        {
            // Handle Transfer deletion
            var transfer = await _context.Transfers
                .FirstOrDefaultAsync(t => t.Id == transaction.TransferId.Value, cancellationToken);

            if (transfer != null)
            {
                _context.Transfers.Remove(transfer);

                var relatedTransactions = await _context.Transactions
                    .Include(t => t.Account)
                    .Where(t => t.TransferId == transfer.Id && !t.IsDeleted)
                    .ToListAsync(cancellationToken);

                foreach (var tx in relatedTransactions)
                {
                    tx.IsDeleted = true;
                    if (tx.Account != null)
                    {
                        // If it was the source account (deducted Amount + Fee)
                        if (tx.AccountId == transfer.SourceAccountId)
                        {
                            tx.Account.CurrentBalance += (transfer.Amount + transfer.Fee);
                        }
                        // If it was the destination account (received Amount)
                        else if (tx.AccountId == transfer.DestinationAccountId)
                        {
                            tx.Account.CurrentBalance -= transfer.Amount;
                        }
                        tx.Account.VerifyBalance();
                    }
                }
            }
        }
        else
        {
            // Regular Transaction deletion
            transaction.IsDeleted = true;
            if (transaction.Account != null)
            {
                if (transaction.Type == TransactionType.Income)
                {
                    transaction.Account.CurrentBalance -= transaction.Amount;
                }
                else if (transaction.Type == TransactionType.Expense)
                {
                    transaction.Account.CurrentBalance += transaction.Amount;
                }
                transaction.Account.VerifyBalance();
            }
        }

        await _context.SaveChangesAsync(cancellationToken);
    }
}
