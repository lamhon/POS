using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PersonalOs.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddTaskEstimate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "estimate",
                table: "tasks",
                type: "double precision",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "estimate",
                table: "tasks");
        }
    }
}
