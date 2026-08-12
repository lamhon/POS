using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using PersonalOs.Api.Middleware;
using PersonalOs.Infrastructure.Extensions;
using Serilog;
using System.Text.Json;

// ──────────────────────────────────────────────
// Bootstrap Serilog before the host is built so
// startup errors are captured.
// ──────────────────────────────────────────────
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    Log.Information("Starting Personal OS API");

    var builder = WebApplication.CreateBuilder(args);

    // ── Serilog ────────────────────────────────
    builder.Host.UseSerilog((context, services, configuration) => configuration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext()
        .Enrich.WithProperty("Application", "PersonalOs.Api")
        .WriteTo.Console(outputTemplate:
            "[{Timestamp:HH:mm:ss} {Level:u3}] {SourceContext} {Message:lj}{NewLine}{Exception}"));

    // ── Services ───────────────────────────────
    builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
    builder.Services.AddProblemDetails();

    builder.Services.AddControllers();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new()
        {
            Title = "Personal OS API",
            Version = "v1",
            Description = "Personal OS backend API",
        });
    });

    builder.Services.AddInfrastructure(builder.Configuration);

    // ── CORS ───────────────────────────────────
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowFrontend", policy =>
        {
            var allowedOrigins = builder.Configuration
                .GetSection("Cors:AllowedOrigins")
                .Get<string[]>() ?? ["http://localhost:3000"];

            policy
                .WithOrigins(allowedOrigins)
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        });
    });

    // ──────────────────────────────────────────
    var app = builder.Build();
    // ──────────────────────────────────────────

    app.UseExceptionHandler();
    app.UseSerilogRequestLogging(opts =>
    {
        opts.EnrichDiagnosticContext = (diagnosticContext, httpContext) =>
        {
            diagnosticContext.Set("RequestId", httpContext.TraceIdentifier);
            diagnosticContext.Set("UserAgent", httpContext.Request.Headers.UserAgent);
        };
    });

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Personal OS API v1"));
    }

    app.UseCors("AllowFrontend");
    app.UseAuthorization();
    app.MapControllers();

    // ── Health Checks ──────────────────────────
    app.MapHealthChecks("/api/v1/health/live", new HealthCheckOptions
    {
        // Liveness: just checks if the process is running
        Predicate = _ => false,
        ResponseWriter = WriteHealthResponse
    });

    app.MapHealthChecks("/api/v1/health/ready", new HealthCheckOptions
    {
        // Readiness: includes database connectivity
        Predicate = check => check.Tags.Contains("readiness"),
        ResponseWriter = WriteHealthResponse
    });

    // Convenience alias for simple health status
    app.MapGet("/api/v1/health", () => Results.Ok(new { status = "healthy" }));

    await app.RunAsync();
}
catch (Exception ex) when (ex is not HostAbortedException)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    await Log.CloseAndFlushAsync();
}

// ── Helper ─────────────────────────────────────
static Task WriteHealthResponse(HttpContext context, HealthReport report)
{
    context.Response.ContentType = "application/json";

    var response = new
    {
        status = report.Status.ToString(),
        checks = report.Entries.Select(e => new
        {
            name = e.Key,
            status = e.Value.Status.ToString(),
            description = e.Value.Description,
        }),
        duration = report.TotalDuration
    };

    return context.Response.WriteAsync(JsonSerializer.Serialize(response));
}
