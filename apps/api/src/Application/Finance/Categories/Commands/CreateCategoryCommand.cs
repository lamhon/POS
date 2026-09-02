using MediatR;
using PersonalOs.Application.Common.Interfaces;
using PersonalOs.Application.Finance.Categories.DTOs;
using PersonalOs.Domain.Entities;
using PersonalOs.Domain.Enums;

namespace PersonalOs.Application.Finance.Categories.Commands;

public record CreateCategoryCommand : IRequest<CategoryDto>
{
    public Guid UserId { get; init; }
    public string Name { get; init; } = string.Empty;
    public CategoryType Type { get; init; }
    public string? Icon { get; init; }
    public string? Color { get; init; }
}

public class CreateCategoryCommandHandler : IRequestHandler<CreateCategoryCommand, CategoryDto>
{
    private readonly IApplicationDbContext _context;

    public CreateCategoryCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CategoryDto> Handle(CreateCategoryCommand request, CancellationToken cancellationToken)
    {
        var entity = new Category
        {
            UserId = request.UserId,
            Name = request.Name,
            Type = request.Type,
            Icon = request.Icon,
            Color = request.Color,
            IsSystem = false,
            IsActive = true
        };

        _context.Categories.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return new CategoryDto(
            entity.Id,
            entity.Name,
            entity.Type,
            entity.Icon,
            entity.Color,
            entity.ParentId,
            entity.IsSystem,
            entity.IsActive
        );
    }
}
