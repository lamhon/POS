using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PersonalOs.Domain.Entities;

namespace PersonalOs.Infrastructure.Persistence.Configurations;

public class TaskCommentReactionConfiguration : IEntityTypeConfiguration<TaskCommentReaction>
{
    public void Configure(EntityTypeBuilder<TaskCommentReaction> builder)
    {
        builder.HasKey(r => new { r.CommentId, r.UserId, r.Emoji });

        builder.HasOne(r => r.Comment)
            .WithMany(c => c.Reactions)
            .HasForeignKey(r => r.CommentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(r => r.User)
            .WithMany()
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
