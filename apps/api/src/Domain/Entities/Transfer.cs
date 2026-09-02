using PersonalOs.Domain.Common;

namespace PersonalOs.Domain.Entities;

public class Transfer : AuditableEntity<Guid>
{
    public Guid UserId { get; set; }
    public Guid SourceAccountId { get; set; }
    public Guid DestinationAccountId { get; set; }
    
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "VND";
    public decimal Fee { get; set; } // Usually 0
    
    public DateTimeOffset TransactionDate { get; set; }
    public string Description { get; set; } = string.Empty;
    
    // Transfers are immutable normally, but we can void them via deleting the related Transactions

    // Navigation properties
    public User User { get; set; } = null!;
    public Account SourceAccount { get; set; } = null!;
    public Account DestinationAccount { get; set; } = null!;
    
    // A transfer generates 2 transactions: an expense on source, an income on destination
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
