using MediatR;
using Microsoft.EntityFrameworkCore;
using PersonalOs.Application.Finance.Categories.DTOs;
using PersonalOs.Application.Common.Interfaces;

namespace PersonalOs.Application.Finance.Categories.Queries;

public record GetCategoriesQuery(Guid UserId) : IRequest<List<CategoryDto>>;

public class GetCategoriesQueryHandler : IRequestHandler<GetCategoriesQuery, List<CategoryDto>>
{
    private readonly IApplicationDbContext _context;

    public GetCategoriesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<CategoryDto>> Handle(GetCategoriesQuery request, CancellationToken cancellationToken)
    {
        return await _context.Categories
            .Where(c => c.UserId == request.UserId && !c.IsDeleted)
            .Select(c => new CategoryDto(
                c.Id,
                c.Name,
                c.Type,
                c.Icon,
                c.Color,
                c.ParentId,
                c.IsSystem,
                c.IsActive
            ))
            .ToListAsync(cancellationToken);
    }
}
