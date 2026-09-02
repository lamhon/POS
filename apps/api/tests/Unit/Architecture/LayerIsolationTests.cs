using NetArchTest.Rules;
using PersonalOs.Domain.Common;
using PersonalOs.Application.Common.Interfaces;
using PersonalOs.Infrastructure.Extensions;

namespace PersonalOs.Tests.Unit.Architecture;

public class LayerIsolationTests
{
    private const string DomainNamespace = "PersonalOs.Domain";
    private const string ApplicationNamespace = "PersonalOs.Application";
    private const string InfrastructureNamespace = "PersonalOs.Infrastructure";
    private const string ApiNamespace = "PersonalOs.Api";

    [Fact]
    public void Domain_Should_Not_HaveDependencyOnOtherProjects()
    {
        // Arrange
        var assembly = typeof(Entity).Assembly;
        
        var otherProjects = new[]
        {
            ApplicationNamespace,
            InfrastructureNamespace,
            ApiNamespace
        };

        // Act
        var result = Types
            .InAssembly(assembly)
            .ShouldNot()
            .HaveDependencyOnAny(otherProjects)
            .GetResult();

        // Assert
        Assert.True(result.IsSuccessful);
    }

    [Fact]
    public void Application_Should_Not_HaveDependencyOnInfrastructureOrApi()
    {
        // Arrange
        var assembly = typeof(IUnitOfWork).Assembly;
        
        var otherProjects = new[]
        {
            InfrastructureNamespace,
            ApiNamespace
        };

        // Act
        var result = Types
            .InAssembly(assembly)
            .ShouldNot()
            .HaveDependencyOnAny(otherProjects)
            .GetResult();

        // Assert
        Assert.True(result.IsSuccessful);
    }

    [Fact]
    public void Infrastructure_Should_Not_HaveDependencyOnApi()
    {
        // Arrange
        var assembly = typeof(InfrastructureServiceExtensions).Assembly;

        // Act
        var result = Types
            .InAssembly(assembly)
            .ShouldNot()
            .HaveDependencyOn(ApiNamespace)
            .GetResult();

        // Assert
        Assert.True(result.IsSuccessful);
    }
}
