using MediatR;
using PersonalOs.Application.Common.Interfaces;
using PersonalOs.Application.Finance.Categories.DTOs;
using PersonalOs.Domain.Entities;
using PersonalOs.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace PersonalOs.Application.Finance.Categories.Commands;

public record UpdateCategoryCommand : IRequest<CategoryDto?>
{
    public Guid Id { get; init; }
    public Guid UserId { get; init; }
    public string Name { get; init; } = string.Empty;
    public CategoryType Type { get; init; }
    public string? Icon { get; init; }
    public string? Color { get; init; }
}

public class UpdateCategoryCommandHandler : IRequestHandler<UpdateCategoryCommand, CategoryDto?>
{
    private readonly IApplicationDbContext _context;

    public UpdateCategoryCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CategoryDto?> Handle(UpdateCategoryCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == request.Id && c.UserId == request.UserId && !c.IsDeleted, cancellationToken);

        if (entity == null)
        {
            return null;
        }

        if (entity.IsSystem)
        {
            throw new Exception("Cannot modify system default categories.");
        }

        entity.Name = request.Name;
        entity.Type = request.Type;
        entity.Icon = request.Icon;
        entity.Color = request.Color;

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
