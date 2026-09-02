using MediatR;
using Microsoft.EntityFrameworkCore;
using PersonalOs.Application.Finance.Accounts.DTOs;
using PersonalOs.Application.Common.Interfaces;

namespace PersonalOs.Application.Finance.Accounts.Queries;

public record GetAccountsQuery(Guid UserId) : IRequest<List<AccountDto>>;

public class GetAccountsQueryHandler : IRequestHandler<GetAccountsQuery, List<AccountDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAccountsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<AccountDto>> Handle(GetAccountsQuery request, CancellationToken cancellationToken)
    {
        return await _context.Accounts
            .Where(a => a.UserId == request.UserId && !a.IsDeleted)
            .Select(a => new AccountDto(
                a.Id,
                a.Name,
                a.Type,
                a.Currency,
                a.OpeningBalance,
                a.CurrentBalance,
                a.IsActive,
                a.CreatedAt,
                a.UpdatedAt
            ))
            .ToListAsync(cancellationToken);
    }
}
