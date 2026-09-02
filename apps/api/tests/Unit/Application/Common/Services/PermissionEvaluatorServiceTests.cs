using Moq;
using Moq.EntityFrameworkCore;
using PersonalOs.Application.Common.Interfaces;
using PersonalOs.Application.Common.Services;
using PersonalOs.Domain.Entities;
using Xunit;

namespace PersonalOs.Tests.Unit.Application.Common.Services;

public class PermissionEvaluatorServiceTests
{
    private readonly Mock<IApplicationDbContext> _contextMock;
    private readonly PermissionEvaluatorService _service;

    public PermissionEvaluatorServiceTests()
    {
        _contextMock = new Mock<IApplicationDbContext>();
        _service = new PermissionEvaluatorService(_contextMock.Object);
    }

    [Fact]
    public async Task HasAccessAsync_ShouldReturnTrue_WhenUserIsAdmin()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var workspaceId = Guid.NewGuid();

        _contextMock.Setup(c => c.WorkspaceMembers).ReturnsDbSet(new List<WorkspaceMember>
        {
            new() { UserId = userId, WorkspaceId = workspaceId, Role = "Admin" }
        });

        // Act
        var result = await _service.HasAccessAsync(userId, workspaceId, "Task", Guid.NewGuid(), "Edit");

        // Assert
        Assert.True(result);
    }

    [Fact]
    public async Task HasAccessAsync_ShouldFollowFallback_WhenOverridesExist()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var workspaceId = Guid.NewGuid();
        var databaseId = Guid.NewGuid();
        var task = new TaskEntity { DatabaseId = databaseId };
        var taskId = task.Id;

        _contextMock.Setup(c => c.WorkspaceMembers).ReturnsDbSet(new List<WorkspaceMember>
        {
            new() { UserId = userId, WorkspaceId = workspaceId, Role = "Member" }
        });

        _contextMock.Setup(c => c.Tasks).ReturnsDbSet(new List<TaskEntity>
        {
            task
        });

        _contextMock.Setup(c => c.ResourcePermissions).ReturnsDbSet(new List<ResourcePermission>
        {
            // The task doesn't have a direct override, but its Database does
            new() { 
                WorkspaceId = workspaceId, 
                UserId = userId, 
                ResourceType = "Database", 
                ResourceId = databaseId, 
                AccessLevel = "Edit" 
            }
        });

        // Act
        var result = await _service.HasAccessAsync(userId, workspaceId, "Task", taskId, "Edit");

        // Assert
        Assert.True(result);
    }
    
    [Fact]
    public async Task HasAccessAsync_ShouldBlockAccess_WhenWorkspacePermissionIsAdminOnly()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var workspace = new Workspace { CreatePagesPermission = "Admin" };
        var workspaceId = workspace.Id;

        _contextMock.Setup(c => c.WorkspaceMembers).ReturnsDbSet(new List<WorkspaceMember>
        {
            new() { UserId = userId, WorkspaceId = workspaceId, Role = "Member" }
        });

        _contextMock.Setup(c => c.Workspaces).ReturnsDbSet(new List<Workspace>
        {
            workspace
        });
        
        _contextMock.Setup(c => c.ResourcePermissions).ReturnsDbSet(new List<ResourcePermission>());

        // Act
        var result = await _service.HasAccessAsync(userId, workspaceId, "Task", null, "Create");

        // Assert
        Assert.False(result); // User is Member, should be blocked
    }
}
