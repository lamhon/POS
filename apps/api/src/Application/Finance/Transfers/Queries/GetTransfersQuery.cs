using MediatR;
using Microsoft.EntityFrameworkCore;
using PersonalOs.Application.Finance.Transfers.DTOs;
using PersonalOs.Application.Common.Interfaces;

namespace PersonalOs.Application.Finance.Transfers.Queries;

public record GetTransfersQuery(Guid UserId) : IRequest<List<TransferDto>>;

public class GetTransfersQueryHandler : IRequestHandler<GetTransfersQuery, List<TransferDto>>
{
    private readonly IApplicationDbContext _context;

    public GetTransfersQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<TransferDto>> Handle(GetTransfersQuery request, CancellationToken cancellationToken)
    {
        return await _context.Transfers
            .Where(t => t.UserId == request.UserId)
            .OrderByDescending(t => t.TransactionDate)
            .Select(t => new TransferDto(
                t.Id,
                t.SourceAccountId,
                t.DestinationAccountId,
                t.Amount,
                t.Currency,
                t.Fee,
                t.TransactionDate,
                t.Description
            ))
            .ToListAsync(cancellationToken);
    }
}
