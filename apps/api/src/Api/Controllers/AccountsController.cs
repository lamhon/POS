using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PersonalOs.Application.Finance.Accounts.Commands;
using PersonalOs.Application.Finance.Accounts.Queries;
using PersonalOs.Application.Finance.Accounts.DTOs;
using PersonalOs.Domain.Enums;

namespace PersonalOs.Api.Controllers;

[Authorize]
public class AccountsController : ApiControllerBase
{
    private readonly IMediator _mediator;

    public AccountsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<List<AccountDto>>> GetAccounts()
    {
        var result = await _mediator.Send(new GetAccountsQuery(CurrentUserId));
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<AccountDto>> CreateAccount([FromBody] CreateAccountRequest request)
    {
        var command = new CreateAccountCommand(
            CurrentUserId,
            request.Name,
            request.Type,
            request.Currency,
            request.OpeningBalance
        );
        var result = await _mediator.Send(command);
        return Ok(result);
    }
}

public record CreateAccountRequest(
    string Name,
    AccountType Type,
    string Currency,
    decimal OpeningBalance
);
