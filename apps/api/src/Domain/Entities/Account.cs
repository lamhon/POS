using PersonalOs.Domain.Common;
using PersonalOs.Domain.Enums;

namespace PersonalOs.Domain.Entities;

public class Account : AuditableEntity<Guid>, ISoftDelete
{
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public AccountType Type { get; set; }
    public string Currency { get; set; } = "VND";
    
    // Monetary values will use decimal
    public decimal OpeningBalance { get; set; }
    public decimal CurrentBalance { get; set; }
    
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    public ICollection<Transfer> TransfersFrom { get; set; } = new List<Transfer>();
    public ICollection<Transfer> TransfersTo { get; set; } = new List<Transfer>();

    public bool CanGoNegative => Type != AccountType.Cash && Type != AccountType.Savings;

    public void VerifyBalance()
    {
        if (!CanGoNegative && CurrentBalance < 0)
        {
            throw new InvalidOperationException($"Account '{Name}' of type {Type} cannot have a negative balance.");
        }
    }
}
