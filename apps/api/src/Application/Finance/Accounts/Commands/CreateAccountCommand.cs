using MediatR;
using PersonalOs.Domain.Enums;
using PersonalOs.Application.Finance.Accounts.DTOs;
using PersonalOs.Application.Common.Interfaces;
using PersonalOs.Domain.Entities;

namespace PersonalOs.Application.Finance.Accounts.Commands;

public record CreateAccountCommand(
    Guid UserId,
    string Name,
    AccountType Type,
    string Currency,
    decimal OpeningBalance
) : IRequest<AccountDto>;

public class CreateAccountCommandHandler : IRequestHandler<CreateAccountCommand, AccountDto>
{
    private readonly IApplicationDbContext _context;

    public CreateAccountCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AccountDto> Handle(CreateAccountCommand request, CancellationToken cancellationToken)
    {
        var account = new Account
        {
            UserId = request.UserId,
            Name = request.Name,
            Type = request.Type,
            Currency = request.Currency,
            OpeningBalance = request.OpeningBalance,
            CurrentBalance = request.OpeningBalance,
            IsActive = true
        };

        _context.Accounts.Add(account);
        await _context.SaveChangesAsync(cancellationToken);

        return new AccountDto(
            account.Id,
            account.Name,
            account.Type,
            account.Currency,
            account.OpeningBalance,
            account.CurrentBalance,
            account.IsActive,
            account.CreatedAt,
            account.UpdatedAt
        );
    }
}
