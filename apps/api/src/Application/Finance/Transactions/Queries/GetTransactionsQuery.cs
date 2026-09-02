using MediatR;
using Microsoft.EntityFrameworkCore;
using PersonalOs.Application.Finance.Transactions.DTOs;
using PersonalOs.Application.Common.Interfaces;

using PersonalOs.Application.Common.Models;

namespace PersonalOs.Application.Finance.Transactions.Queries;

public record GetTransactionsQuery(
    Guid UserId, 
    Guid? AccountId, 
    DateTimeOffset? StartDate, 
    DateTimeOffset? EndDate,
    int PageNumber = 1,
    int PageSize = 10
) : IRequest<PaginatedDto<TransactionDto>>;

public class GetTransactionsQueryHandler : IRequestHandler<GetTransactionsQuery, PaginatedDto<TransactionDto>>
{
    private readonly IApplicationDbContext _context;

    public GetTransactionsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedDto<TransactionDto>> Handle(GetTransactionsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Transactions
            .Where(t => t.UserId == request.UserId && !t.IsDeleted);

        if (request.AccountId.HasValue)
        {
            query = query.Where(t => t.AccountId == request.AccountId.Value);
        }

        if (request.StartDate.HasValue)
        {
            query = query.Where(t => t.TransactionDate >= request.StartDate.Value);
        }

        if (request.EndDate.HasValue)
        {
            query = query.Where(t => t.TransactionDate <= request.EndDate.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var totalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize);

        var items = await query
            .OrderByDescending(t => t.TransactionDate)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(t => new TransactionDto(
                t.Id,
                t.AccountId,
                t.CategoryId,
                t.Type,
                t.Amount,
                t.Currency,
                t.Description,
                t.Notes,
                t.TransactionDate,
                t.TransferId
            ))
            .ToListAsync(cancellationToken);

        return new PaginatedDto<TransactionDto>(items, request.PageNumber, request.PageSize, totalCount, totalPages);
    }
}
