using PersonalOs.Domain.Entities;

namespace PersonalOs.Application.Common.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateAccessToken(User user, IList<string> roles, IList<string> permissions);
}
