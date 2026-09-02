using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PersonalOs.Application.Finance.Summary.Queries;

namespace PersonalOs.Api.Controllers;

[Authorize]
[Route("api/finance-summary")]
public class FinanceSummaryController : ApiControllerBase
{
    private readonly IMediator _mediator;

    public FinanceSummaryController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<FinanceSummaryDto>> GetSummary(
        [FromQuery] Guid? accountId,
        [FromQuery] DateTimeOffset? startDate,
        [FromQuery] DateTimeOffset? endDate)
    {
        var result = await _mediator.Send(new GetFinanceSummaryQuery(CurrentUserId, accountId, startDate, endDate));
        return Ok(result);
    }
}
