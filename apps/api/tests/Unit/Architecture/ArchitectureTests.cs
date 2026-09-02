using FluentAssertions;
using MediatR;
using NetArchTest.Rules;
using System.Reflection;

namespace PersonalOs.Tests.Unit.Architecture;

public class ArchitectureTests
{
    private const string DomainNamespace = "PersonalOs.Domain";
    private const string ApplicationNamespace = "PersonalOs.Application";
    private const string InfrastructureNamespace = "PersonalOs.Infrastructure";
    private const string ApiNamespace = "PersonalOs.Api";

    [Fact]
    public void Domain_Should_Not_HaveDependencyOnOtherProjects()
    {
        var assembly = Assembly.Load("PersonalOs.Domain");

        var otherProjects = new[]
        {
            ApplicationNamespace,
            InfrastructureNamespace,
            ApiNamespace
        };

        var result = Types
            .InAssembly(assembly)
            .ShouldNot()
            .HaveDependencyOnAny(otherProjects)
            .GetResult();

        result.IsSuccessful.Should().BeTrue();
    }

    [Fact]
    public void Application_Should_Not_HaveDependencyOnInfrastructureOrApi()
    {
        var assembly = Assembly.Load("PersonalOs.Application");

        var otherProjects = new[]
        {
            InfrastructureNamespace,
            ApiNamespace
        };

        var result = Types
            .InAssembly(assembly)
            .ShouldNot()
            .HaveDependencyOnAny(otherProjects)
            .GetResult();

        result.IsSuccessful.Should().BeTrue();
    }



    [Fact]
    public void CommandHandlers_Should_Have_NameEndingWith_CommandHandler()
    {
        var assembly = Assembly.Load("PersonalOs.Application");

        var result = Types
            .InAssembly(assembly)
            .That()
            .ImplementInterface(typeof(IRequestHandler<,>))
            .And()
            .HaveNameEndingWith("CommandHandler")
            .Should()
            .HaveNameEndingWith("CommandHandler")
            .GetResult();

        result.IsSuccessful.Should().BeTrue();
    }
}
