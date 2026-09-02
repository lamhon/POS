using PersonalOs.Domain.Common;
using PersonalOs.Domain.Enums;

namespace PersonalOs.Domain.Entities;

public class Transaction : AuditableEntity<Guid>, ISoftDelete
{
    public Guid UserId { get; set; }
    public Guid AccountId { get; set; }
    public Guid? CategoryId { get; set; }
    
    public TransactionType Type { get; set; }
    
    public decimal Amount { get; set; } // Always positive in DB, Type determines effect on balance
    public string Currency { get; set; } = "VND";
    
    public string Description { get; set; } = string.Empty;
    public string? Notes { get; set; }
    
    public DateTimeOffset TransactionDate { get; set; }
    
    public Guid? TransferId { get; set; }
    
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public Account Account { get; set; } = null!;
    public Category? Category { get; set; }
    public Transfer? Transfer { get; set; }
}
