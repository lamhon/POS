using PersonalOs.Domain.Common;
using PersonalOs.Domain.Enums;

namespace PersonalOs.Domain.Entities;

public class Category : AuditableEntity<Guid>, ISoftDelete
{
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public CategoryType Type { get; set; }
    
    public string? Icon { get; set; }
    public string? Color { get; set; }
    public Guid? ParentId { get; set; }
    
    public bool IsSystem { get; set; } // If true, UserId might be Guid.Empty or a system admin ID, meaning available to everyone as default seed
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public Category? Parent { get; set; }
    public ICollection<Category> SubCategories { get; set; } = new List<Category>();
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
