namespace PersonalOs.Application.Common.Models;

public record PaginatedDto<T>(
    List<T> Items,
    int PageNumber,
    int PageSize,
    int TotalCount,
    int TotalPages
);
