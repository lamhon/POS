using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PersonalOs.Application.Finance.Transactions.Commands;
using PersonalOs.Application.Finance.Transactions.Queries;
using PersonalOs.Application.Finance.Transactions.DTOs;
using PersonalOs.Domain.Enums;

using PersonalOs.Application.Common.Models;

namespace PersonalOs.Api.Controllers;

[Authorize]
public class TransactionsController : ApiControllerBase
{
    private readonly IMediator _mediator;

    public TransactionsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<PaginatedDto<TransactionDto>>> GetTransactions(
        [FromQuery] Guid? accountId,
        [FromQuery] DateTimeOffset? startDate,
        [FromQuery] DateTimeOffset? endDate,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = await _mediator.Send(new GetTransactionsQuery(CurrentUserId, accountId, startDate, endDate, pageNumber, pageSize));
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<TransactionDto>> CreateTransaction([FromBody] CreateTransactionRequest request)
    {
        var command = new CreateTransactionCommand(
            CurrentUserId,
            request.AccountId,
            request.CategoryId,
            request.Type,
            request.Amount,
            request.Currency,
            request.Description,
            request.Notes,
            request.TransactionDate
        );
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TransactionDto>> UpdateTransaction(Guid id, [FromBody] UpdateTransactionRequest request)
    {
        var command = new UpdateTransactionCommand(
            id,
            CurrentUserId,
            request.AccountId,
            request.CategoryId,
            request.Type,
            request.Amount,
            request.Currency,
            request.Description,
            request.Notes,
            request.TransactionDate
        );
        
        var result = await _mediator.Send(command);
        if (result == null)
        {
            return NotFound();
        }
        
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteTransaction(Guid id)
    {
        await _mediator.Send(new DeleteTransactionCommand(id, CurrentUserId));
        return NoContent();
    }
}

public record CreateTransactionRequest(
    Guid AccountId,
    Guid? CategoryId,
    TransactionType Type,
    decimal Amount,
    string Currency,
    string Description,
    string? Notes,
    DateTimeOffset TransactionDate
);

public record UpdateTransactionRequest(
    Guid AccountId,
    Guid? CategoryId,
    TransactionType Type,
    decimal Amount,
    string Currency,
    string Description,
    string? Notes,
    DateTimeOffset TransactionDate
);


