using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PersonalOs.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddTaskCommentReactionsAndReplies : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "parent_comment_id",
                table: "task_comments",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "task_comment_reactions",
                columns: table => new
                {
                    comment_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    emoji = table.Column<string>(type: "text", nullable: false),
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "text", nullable: true),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_task_comment_reactions", x => new { x.comment_id, x.user_id, x.emoji });
                    table.ForeignKey(
                        name: "fk_task_comment_reactions_task_comments_comment_id",
                        column: x => x.comment_id,
                        principalTable: "task_comments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_task_comment_reactions_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_task_comments_parent_comment_id",
                table: "task_comments",
                column: "parent_comment_id");

            migrationBuilder.CreateIndex(
                name: "ix_task_comment_reactions_user_id",
                table: "task_comment_reactions",
                column: "user_id");

            migrationBuilder.AddForeignKey(
                name: "fk_task_comments_task_comments_parent_comment_id",
                table: "task_comments",
                column: "parent_comment_id",
                principalTable: "task_comments",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_task_comments_task_comments_parent_comment_id",
                table: "task_comments");

            migrationBuilder.DropTable(
                name: "task_comment_reactions");

            migrationBuilder.DropIndex(
                name: "ix_task_comments_parent_comment_id",
                table: "task_comments");

            migrationBuilder.DropColumn(
                name: "parent_comment_id",
                table: "task_comments");
        }
    }
}
