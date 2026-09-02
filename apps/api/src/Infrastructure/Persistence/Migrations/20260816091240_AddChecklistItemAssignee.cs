using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PersonalOs.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddChecklistItemAssignee : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "content",
                table: "checklist_items",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500);

            migrationBuilder.AddColumn<Guid>(
                name: "assignee_id",
                table: "checklist_items",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_checklist_items_assignee_id",
                table: "checklist_items",
                column: "assignee_id");

            migrationBuilder.AddForeignKey(
                name: "fk_checklist_items_users_assignee_id",
                table: "checklist_items",
                column: "assignee_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_checklist_items_users_assignee_id",
                table: "checklist_items");

            migrationBuilder.DropIndex(
                name: "ix_checklist_items_assignee_id",
                table: "checklist_items");

            migrationBuilder.DropColumn(
                name: "assignee_id",
                table: "checklist_items");

            migrationBuilder.AlterColumn<string>(
                name: "content",
                table: "checklist_items",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(2000)",
                oldMaxLength: 2000);
        }
    }
}
