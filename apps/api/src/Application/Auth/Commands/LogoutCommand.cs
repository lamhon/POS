using MediatR;
using PersonalOs.Application.Common.Interfaces;

namespace PersonalOs.Application.Auth.Commands;

public record LogoutCommand(string RefreshToken) : IRequest;

public class LogoutCommandHandler : IRequestHandler<LogoutCommand>
{
    private readonly IIdentityService _identityService;

    public LogoutCommandHandler(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    public async Task Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
        await _identityService.RevokeTokenAsync(request.RefreshToken, cancellationToken);
    }
}
