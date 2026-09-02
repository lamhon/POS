using MediatR;
using Microsoft.EntityFrameworkCore;
using PersonalOs.Application.Common.Interfaces;
using PersonalOs.Domain.Enums;

namespace PersonalOs.Application.Finance.Summary.Queries;

public record GetFinanceSummaryQuery(Guid UserId, Guid? AccountId, DateTimeOffset? StartDate, DateTimeOffset? EndDate) : IRequest<FinanceSummaryDto>;

public record FinanceSummaryDto(
    decimal TotalBalance,
    decimal MonthlyIncome,
    decimal MonthlyExpense,
    List<CategoryBreakdownDto> CategoryBreakdowns,
    List<DailySummaryDto> DailySummaries
);

public record CategoryBreakdownDto(
    Guid CategoryId,
    string CategoryName,
    string Color,
    string Icon,
    decimal Amount,
    double Percentage
);

public record DailySummaryDto(
    DateTime Date,
    decimal Income,
    decimal Expense
);

public class GetFinanceSummaryQueryHandler : IRequestHandler<GetFinanceSummaryQuery, FinanceSummaryDto>
{
    private readonly IApplicationDbContext _context;

    public GetFinanceSummaryQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<FinanceSummaryDto> Handle(GetFinanceSummaryQuery request, CancellationToken cancellationToken)
    {
        var accountsQuery = _context.Accounts
            .Where(a => a.UserId == request.UserId && !a.IsDeleted && a.IsActive);

        if (request.AccountId.HasValue)
        {
            accountsQuery = accountsQuery.Where(a => a.Id == request.AccountId.Value);
        }

        var accounts = await accountsQuery.ToListAsync(cancellationToken);
        var totalBalance = accounts.Sum(a => a.CurrentBalance);

        var transactionsQuery = _context.Transactions
            .Include(t => t.Category)
            .Where(t => t.UserId == request.UserId && !t.IsDeleted && t.Type != TransactionType.Transfer);

        if (request.AccountId.HasValue)
        {
            transactionsQuery = transactionsQuery.Where(t => t.AccountId == request.AccountId.Value);
        }

        if (request.StartDate.HasValue)
        {
            transactionsQuery = transactionsQuery.Where(t => t.TransactionDate >= request.StartDate.Value);
        }
        else
        {
            var now = DateTimeOffset.UtcNow;
            var startOfMonth = new DateTimeOffset(now.Year, now.Month, 1, 0, 0, 0, now.Offset);
            transactionsQuery = transactionsQuery.Where(t => t.TransactionDate >= startOfMonth);
        }

        if (request.EndDate.HasValue)
        {
            transactionsQuery = transactionsQuery.Where(t => t.TransactionDate <= request.EndDate.Value);
        }

        var thisMonthTransactions = await transactionsQuery.ToListAsync(cancellationToken);

        var monthlyIncome = thisMonthTransactions
            .Where(t => t.Type == TransactionType.Income)
            .Sum(t => t.Amount);

        var monthlyExpense = thisMonthTransactions
            .Where(t => t.Type == TransactionType.Expense)
            .Sum(t => t.Amount);

        var categoryBreakdowns = new List<CategoryBreakdownDto>();
        if (monthlyExpense > 0)
        {
            categoryBreakdowns = thisMonthTransactions
                .Where(t => t.Type == TransactionType.Expense && t.CategoryId.HasValue)
                .GroupBy(t => t.CategoryId!.Value)
                .Select(g => {
                    var first = g.First();
                    var amount = g.Sum(t => t.Amount);
                    var percentage = (double)(amount / monthlyExpense) * 100;
                    return new CategoryBreakdownDto(
                        g.Key,
                        first.Category?.Name ?? "Unknown",
                        first.Category?.Color ?? "#cbd5e1",
                        first.Category?.Icon ?? "help-circle",
                        amount,
                        percentage
                    );
                })
                .OrderByDescending(c => c.Amount)
                .ToList();
        }

        var dailySummaries = thisMonthTransactions
            .GroupBy(t => t.TransactionDate.Date)
            .Select(g => new DailySummaryDto(
                g.Key,
                g.Where(t => t.Type == TransactionType.Income).Sum(t => t.Amount),
                g.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Amount)
            ))
            .OrderBy(d => d.Date)
            .ToList();

        return new FinanceSummaryDto(totalBalance, monthlyIncome, monthlyExpense, categoryBreakdowns, dailySummaries);
    }
}
