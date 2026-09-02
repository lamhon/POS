using MediatR;
using PersonalOs.Application.Finance.Categories.DTOs;
using PersonalOs.Domain.Enums;
using PersonalOs.Domain.Entities;
using PersonalOs.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace PersonalOs.Application.Finance.Categories.Commands;

public record SeedDefaultCategoriesCommand(Guid UserId) : IRequest<List<CategoryDto>>;

public class SeedDefaultCategoriesCommandHandler : IRequestHandler<SeedDefaultCategoriesCommand, List<CategoryDto>>
{
    private readonly IApplicationDbContext _context;

    public SeedDefaultCategoriesCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<CategoryDto>> Handle(SeedDefaultCategoriesCommand request, CancellationToken cancellationToken)
    {
        // Check if user already has categories
        var existingCategoriesCount = await _context.Categories
            .Where(c => c.UserId == request.UserId && !c.IsDeleted)
            .CountAsync(cancellationToken);

        if (existingCategoriesCount > 0)
        {
            // Already seeded or has custom categories, maybe we shouldn't seed again.
            // Or we just return the existing ones.
            return await GetUserCategories(request.UserId, cancellationToken);
        }

        var defaultCategories = new List<Category>
        {
            // Income
            new Category { UserId = request.UserId, Name = "Salary", Type = CategoryType.Income, Icon = "banknote", Color = "#10b981", IsSystem = true },
            new Category { UserId = request.UserId, Name = "Investments", Type = CategoryType.Income, Icon = "trending-up", Color = "#3b82f6", IsSystem = true },
            
            // Expense
            new Category { UserId = request.UserId, Name = "Food & Dining", Type = CategoryType.Expense, Icon = "utensils", Color = "#f59e0b", IsSystem = true },
            new Category { UserId = request.UserId, Name = "Housing", Type = CategoryType.Expense, Icon = "home", Color = "#6366f1", IsSystem = true },
            new Category { UserId = request.UserId, Name = "Transportation", Type = CategoryType.Expense, Icon = "car", Color = "#8b5cf6", IsSystem = true },
            new Category { UserId = request.UserId, Name = "Utilities", Type = CategoryType.Expense, Icon = "zap", Color = "#06b6d4", IsSystem = true },
            new Category { UserId = request.UserId, Name = "Entertainment", Type = CategoryType.Expense, Icon = "film", Color = "#ec4899", IsSystem = true },
            new Category { UserId = request.UserId, Name = "Shopping", Type = CategoryType.Expense, Icon = "shopping-bag", Color = "#f43f5e", IsSystem = true },
            new Category { UserId = request.UserId, Name = "Health & Fitness", Type = CategoryType.Expense, Icon = "heart-pulse", Color = "#14b8a6", IsSystem = true }
        };

        _context.Categories.AddRange(defaultCategories);
        await _context.SaveChangesAsync(cancellationToken);

        return defaultCategories.Select(c => new CategoryDto(
            c.Id, c.Name, c.Type, c.Icon, c.Color, c.ParentId, c.IsSystem, c.IsActive
        )).ToList();
    }

    private async Task<List<CategoryDto>> GetUserCategories(Guid userId, CancellationToken cancellationToken)
    {
        return await _context.Categories
            .Where(c => c.UserId == userId && !c.IsDeleted)
            .Select(c => new CategoryDto(
                c.Id, c.Name, c.Type, c.Icon, c.Color, c.ParentId, c.IsSystem, c.IsActive
            ))
            .ToListAsync(cancellationToken);
    }
}
