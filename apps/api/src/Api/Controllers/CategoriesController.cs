using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PersonalOs.Application.Finance.Categories.Commands;
using PersonalOs.Application.Finance.Categories.Queries;
using PersonalOs.Application.Finance.Categories.DTOs;

namespace PersonalOs.Api.Controllers;

[Authorize]
public class CategoriesController : ApiControllerBase
{
    private readonly IMediator _mediator;

    public CategoriesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<List<CategoryDto>>> GetCategories()
    {
        var result = await _mediator.Send(new GetCategoriesQuery(CurrentUserId));
        return Ok(result);
    }

    [HttpPost("seed-default")]
    public async Task<ActionResult<List<CategoryDto>>> SeedDefaultCategories()
    {
        var result = await _mediator.Send(new SeedDefaultCategoriesCommand(CurrentUserId));
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<CategoryDto>> CreateCategory(CreateCategoryCommand command)
    {
        var result = await _mediator.Send(command with { UserId = CurrentUserId });
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CategoryDto>> UpdateCategory(Guid id, UpdateCategoryCommand command)
    {
        if (id != command.Id)
        {
            return BadRequest();
        }

        var result = await _mediator.Send(command with { UserId = CurrentUserId });
        
        if (result == null)
        {
            return NotFound();
        }
        
        return Ok(result);
    }
}
