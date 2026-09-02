using MediatR;
using PersonalOs.Application.Common.Interfaces;
using PersonalOs.Domain.Entities;

namespace PersonalOs.Application.Auth.Queries;

public record GetCurrentUserQuery(Guid UserId) : IRequest<User?>;

public class GetCurrentUserQueryHandler : IRequestHandler<GetCurrentUserQuery, User?>
{
    private readonly IIdentityService _identityService;

    public GetCurrentUserQueryHandler(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    public async Task<User?> Handle(GetCurrentUserQuery request, CancellationToken cancellationToken)
    {
        return await _identityService.GetUserByIdAsync(request.UserId, cancellationToken);
    }
}
