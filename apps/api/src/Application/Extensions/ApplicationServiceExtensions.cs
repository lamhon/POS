using Microsoft.Extensions.DependencyInjection;

namespace PersonalOs.Application.Extensions;

public static class ApplicationServiceExtensions
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(ApplicationServiceExtensions).Assembly));
        
        services.AddScoped<PersonalOs.Application.Common.Services.IPermissionEvaluatorService, PersonalOs.Application.Common.Services.PermissionEvaluatorService>();

        return services;
    }
}
