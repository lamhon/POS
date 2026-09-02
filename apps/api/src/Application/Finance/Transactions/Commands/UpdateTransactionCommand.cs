using MediatR;
using PersonalOs.Application.Finance.Transactions.DTOs;
using PersonalOs.Domain.Enums;
using PersonalOs.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace PersonalOs.Application.Finance.Transactions.Commands;

public record UpdateTransactionCommand(
    Guid Id,
    Guid UserId,
    Guid AccountId,
    Guid? CategoryId,
    TransactionType Type,
    decimal Amount,
    string Currency,
    string Description,
    string? Notes,
    DateTimeOffset TransactionDate
) : IRequest<TransactionDto?>;

public class UpdateTransactionCommandHandler : IRequestHandler<UpdateTransactionCommand, TransactionDto?>
{
    private readonly IApplicationDbContext _context;

    public UpdateTransactionCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<TransactionDto?> Handle(UpdateTransactionCommand request, CancellationToken cancellationToken)
    {
        if (request.Amount <= 0)
            throw new Exception("Transaction amount must be greater than zero.");

        var transaction = await _context.Transactions
            .Include(t => t.Account)
            .FirstOrDefaultAsync(t => t.Id == request.Id && t.UserId == request.UserId && !t.IsDeleted, cancellationToken);

        if (transaction == null)
            return null;

        if (transaction.TransferId.HasValue)
            throw new Exception("Transfers cannot be updated directly. Please delete the transfer and create a new one.");

        // 1. Revert original balance
        if (transaction.Account != null)
        {
            if (transaction.Type == TransactionType.Income)
                transaction.Account.CurrentBalance -= transaction.Amount;
            else if (transaction.Type == TransactionType.Expense)
                transaction.Account.CurrentBalance += transaction.Amount;

            transaction.Account.VerifyBalance();
        }

        // 2. Validate Category if provided
        if (request.CategoryId.HasValue)
        {
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == request.CategoryId.Value && (c.UserId == request.UserId || c.IsSystem) && !c.IsDeleted, cancellationToken);

            if (category == null)
                throw new Exception("Category not found.");

            // Enforce compatibility rules (Income transaction -> Income category, Expense transaction -> Expense category)
            if (request.Type == TransactionType.Income && category.Type != CategoryType.Income)
                throw new Exception("Category type mismatch: Income transaction must use an Income category.");

            if (request.Type == TransactionType.Expense && category.Type != CategoryType.Expense)
                throw new Exception("Category type mismatch: Expense transaction must use an Expense category.");

            if (request.Type == TransactionType.Transfer)
                throw new Exception("Transfers cannot have a category assigned.");
        }

        // 3. Apply new balance
        var newAccount = await _context.Accounts
            .FirstOrDefaultAsync(a => a.Id == request.AccountId && a.UserId == request.UserId && !a.IsDeleted, cancellationToken);

        if (newAccount == null)
            throw new Exception("New account not found.");

        if (request.Type == TransactionType.Income)
            newAccount.CurrentBalance += request.Amount;
        else if (request.Type == TransactionType.Expense)
            newAccount.CurrentBalance -= request.Amount;

        newAccount.VerifyBalance();

        // 3. Update transaction properties
        transaction.AccountId = request.AccountId;
        transaction.CategoryId = request.CategoryId;
        transaction.Type = request.Type;
        transaction.Amount = request.Amount;
        transaction.Currency = request.Currency;
        transaction.Description = request.Description;
        transaction.Notes = request.Notes;
        transaction.TransactionDate = request.TransactionDate;

        await _context.SaveChangesAsync(cancellationToken);

        return new TransactionDto(
            transaction.Id,
            transaction.AccountId,
            transaction.CategoryId,
            transaction.Type,
            transaction.Amount,
            transaction.Currency,
            transaction.Description,
            transaction.Notes,
            transaction.TransactionDate,
            transaction.TransferId
        );
    }
}
