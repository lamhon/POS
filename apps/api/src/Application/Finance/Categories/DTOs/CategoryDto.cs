using PersonalOs.Domain.Enums;

namespace PersonalOs.Application.Finance.Categories.DTOs;

public record CategoryDto(
    Guid Id,
    string Name,
    CategoryType Type,
    string? Icon,
    string? Color,
    Guid? ParentId,
    bool IsSystem,
    bool IsActive
);
