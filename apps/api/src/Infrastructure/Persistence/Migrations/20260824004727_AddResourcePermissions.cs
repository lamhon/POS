using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PersonalOs.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddResourcePermissions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "create_databases_permission",
                table: "workspaces",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "create_pages_permission",
                table: "workspaces",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "create_projects_permission",
                table: "workspaces",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "delete_content_permission",
                table: "workspaces",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "export_workspace_permission",
                table: "workspaces",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "invite_members_permission",
                table: "workspaces",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "manage_settings_permission",
                table: "workspaces",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "resource_permissions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    workspace_id = table.Column<Guid>(type: "uuid", nullable: false),
                    resource_type = table.Column<string>(type: "text", nullable: false),
                    resource_id = table.Column<Guid>(type: "uuid", nullable: true),
                    user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    role = table.Column<string>(type: "text", nullable: true),
                    access_level = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "text", nullable: true),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_resource_permissions", x => x.id);
                    table.ForeignKey(
                        name: "fk_resource_permissions_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "fk_resource_permissions_workspaces_workspace_id",
                        column: x => x.workspace_id,
                        principalTable: "workspaces",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_resource_permissions_user_id",
                table: "resource_permissions",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_resource_permissions_workspace_id",
                table: "resource_permissions",
                column: "workspace_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "resource_permissions");

            migrationBuilder.DropColumn(
                name: "create_databases_permission",
                table: "workspaces");

            migrationBuilder.DropColumn(
                name: "create_pages_permission",
                table: "workspaces");

            migrationBuilder.DropColumn(
                name: "create_projects_permission",
                table: "workspaces");

            migrationBuilder.DropColumn(
                name: "delete_content_permission",
                table: "workspaces");

            migrationBuilder.DropColumn(
                name: "export_workspace_permission",
                table: "workspaces");

            migrationBuilder.DropColumn(
                name: "invite_members_permission",
                table: "workspaces");

            migrationBuilder.DropColumn(
                name: "manage_settings_permission",
                table: "workspaces");
        }
    }
}
