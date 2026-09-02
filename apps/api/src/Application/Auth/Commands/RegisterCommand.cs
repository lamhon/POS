using MediatR;
using PersonalOs.Application.Common.Interfaces;

namespace PersonalOs.Application.Auth.Commands;

public record RegisterCommand(string Email, string Password, string DisplayName) : IRequest<AuthResult>;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, AuthResult>
{
    private readonly IIdentityService _identityService;

    public RegisterCommandHandler(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    public async Task<AuthResult> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        return await _identityService.RegisterAsync(request.Email, request.Password, request.DisplayName, cancellationToken);
    }
}
