using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PersonalOs.Infrastructure.Persistence.Context;
using System.Linq;

namespace PersonalOs.Tests.Integration.Setup;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureAppConfiguration((context, configBuilder) =>
        {
            configBuilder.AddInMemoryCollection(new Dictionary<string, string?>
            {
                { "ConnectionStrings:DefaultConnection", "Host=localhost;Database=dummy" },
                { "Jwt:Secret", "this_is_a_dummy_secret_key_for_testing_purposes_only" },
                { "Jwt:Issuer", "Test" },
                { "Jwt:Audience", "Test" },
                { "Jwt:ExpiryMinutes", "60" }
            });
        });

        builder.ConfigureServices(services =>
        {
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<PersonalOsDbContext>));

            if (descriptor != null)
            {
                services.Remove(descriptor);
            }

            services.AddDbContext<PersonalOsDbContext>(options =>
            {
                options.UseInMemoryDatabase("IntegrationTestsDb");
            });

            var sp = services.BuildServiceProvider();

            using var scope = sp.CreateScope();
            var scopedServices = scope.ServiceProvider;
            var db = scopedServices.GetRequiredService<PersonalOsDbContext>();

            db.Database.EnsureCreated();
        });
    }
}
