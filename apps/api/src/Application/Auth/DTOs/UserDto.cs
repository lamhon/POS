using System;

namespace PersonalOs.Application.Auth.DTOs;

public record UserDto(
    Guid Id,
    string Email,
    string DisplayName,
    string Status,
    DateTimeOffset CreatedAt
);
