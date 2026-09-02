using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PersonalOs.Application.Finance.Transfers.Commands;
using PersonalOs.Application.Finance.Transfers.Queries;
using PersonalOs.Application.Finance.Transfers.DTOs;

namespace PersonalOs.Api.Controllers;

[Authorize]
public class TransfersController : ApiControllerBase
{
    private readonly IMediator _mediator;

    public TransfersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<List<TransferDto>>> GetTransfers()
    {
        var result = await _mediator.Send(new GetTransfersQuery(CurrentUserId));
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<TransferDto>> CreateTransfer([FromBody] CreateTransferRequest request)
    {
        var command = new CreateTransferCommand(
            CurrentUserId,
            request.SourceAccountId,
            request.DestinationAccountId,
            request.Amount,
            request.Currency,
            request.Fee,
            request.TransactionDate,
            request.Description
        );
        var result = await _mediator.Send(command);
        return Ok(result);
    }
}

public record CreateTransferRequest(
    Guid SourceAccountId,
    Guid DestinationAccountId,
    decimal Amount,
    string Currency,
    decimal Fee,
    DateTimeOffset TransactionDate,
    string Description
);
