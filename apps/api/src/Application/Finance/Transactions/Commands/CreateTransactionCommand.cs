using MediatR;
using PersonalOs.Application.Finance.Transactions.DTOs;
using PersonalOs.Domain.Enums;
using PersonalOs.Domain.Entities;
using PersonalOs.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace PersonalOs.Application.Finance.Transactions.Commands;

public record CreateTransactionCommand(
    Guid UserId,
    Guid AccountId,
    Guid? CategoryId,
    TransactionType Type,
    decimal Amount,
    string Currency,
    string Description,
    string? Notes,
    DateTimeOffset TransactionDate
) : IRequest<TransactionDto>;

public class CreateTransactionCommandHandler : IRequestHandler<CreateTransactionCommand, TransactionDto>
{
    private readonly IApplicationDbContext _context;

    public CreateTransactionCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<TransactionDto> Handle(CreateTransactionCommand request, CancellationToken cancellationToken)
    {
        if (request.Amount <= 0)
            throw new Exception("Transaction amount must be greater than zero.");

        // 1. Validate Account
        var account = await _context.Accounts
            .FirstOrDefaultAsync(a => a.Id == request.AccountId && a.UserId == request.UserId && !a.IsDeleted, cancellationToken);
            
        if (account == null)
            throw new Exception("Account not found.");

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

        // 3. Create Transaction
        var transaction = new Transaction
        {
            UserId = request.UserId,
            AccountId = request.AccountId,
            CategoryId = request.CategoryId,
            Type = request.Type,
            Amount = request.Amount,
            Currency = request.Currency,
            Description = request.Description,
            Notes = request.Notes,
            TransactionDate = request.TransactionDate
        };

        // 4. Update Account Balance
        if (request.Type == TransactionType.Income)
        {
            account.CurrentBalance += request.Amount;
        }
        else if (request.Type == TransactionType.Expense)
        {
            account.CurrentBalance -= request.Amount;
        }

        account.VerifyBalance();

        _context.Transactions.Add(transaction);
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
