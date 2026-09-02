using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PersonalOs.Domain.Entities;

namespace PersonalOs.Infrastructure.Persistence.Configurations;

public class RolePermissionConfiguration : IEntityTypeConfiguration<RolePermission>
{
    public void Configure(EntityTypeBuilder<RolePermission> builder)
    {
        builder.ToTable("role_permissions");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Scope)
            .HasConversion<string>()
            .HasMaxLength(30)
            .HasDefaultValue(PermissionScope.All);

        builder.HasIndex(x => new { x.RoleId, x.PermissionId }).IsUnique();
    }
}
