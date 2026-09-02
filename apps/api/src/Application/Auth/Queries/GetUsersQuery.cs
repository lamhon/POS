using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using PersonalOs.Application.Auth.DTOs;
using PersonalOs.Application.Common.Interfaces;

namespace PersonalOs.Application.Auth.Queries;

public record GetUsersQuery() : IRequest<List<UserDto>>;

public class GetUsersQueryHandler : IRequestHandler<GetUsersQuery, List<UserDto>>
{
    private readonly IApplicationDbContext _context;

    public GetUsersQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<UserDto>> Handle(GetUsersQuery request, CancellationToken cancellationToken)
    {
        return await _context.Users
            .Where(u => !u.IsDeleted && u.Status == PersonalOs.Domain.Entities.UserStatus.Active)
            .OrderBy(u => u.DisplayName)
            .Select(u => new UserDto(u.Id, u.Email, u.DisplayName, u.Status.ToString(), u.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}
