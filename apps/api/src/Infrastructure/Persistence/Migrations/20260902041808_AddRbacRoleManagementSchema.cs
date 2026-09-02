using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PersonalOs.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddRbacRoleManagementSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "color",
                table: "roles",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "icon",
                table: "roles",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "status",
                table: "roles",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Active");

            migrationBuilder.AddColumn<string>(
                name: "type",
                table: "roles",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Custom");

            migrationBuilder.AddColumn<string>(
                name: "scope",
                table: "role_permissions",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "All");

            migrationBuilder.AddColumn<string>(
                name: "action",
                table: "permissions",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "resource",
                table: "permissions",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "color",
                table: "roles");

            migrationBuilder.DropColumn(
                name: "icon",
                table: "roles");

            migrationBuilder.DropColumn(
                name: "status",
                table: "roles");

            migrationBuilder.DropColumn(
                name: "type",
                table: "roles");

            migrationBuilder.DropColumn(
                name: "scope",
                table: "role_permissions");

            migrationBuilder.DropColumn(
                name: "action",
                table: "permissions");

            migrationBuilder.DropColumn(
                name: "resource",
                table: "permissions");
        }
    }
}
