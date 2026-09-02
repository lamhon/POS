# Finance Module — Quản lý chi tiêu cá nhân

## Mục tiêu
Quản lý tài khoản tiền, giao dịch, ngân sách và báo cáo tài chính cá nhân.

## Core entities
- FinancialAccount.
- Transaction.
- Category.
- Budget.
- FinancialGoal.
- RecurringTransaction.

## Transaction
Một transaction nên hỗ trợ:
- amount.
- currency.
- type: income/expense/transfer.
- account.
- category.
- occurredAt.
- note.
- attachments.
- tags.

Transfer giữa hai tài khoản phải được biểu diễn nhất quán, tránh tính hai lần vào income/expense.

## Categories
Có thể có:
```text
Food
Transport
Housing
Health
Education
Entertainment
Salary
Other
```
Nhưng category phải configurable.

## Budget
Budget có:
- period.
- category hoặc scope.
- limit.
- spent.
- remaining.

Spent nên được tính từ transaction hợp lệ, không tin giá trị client gửi lên.

## Reports
- Income vs expense.
- Expense by category.
- Cash flow.
- Budget progress.
- Monthly comparison.

## Recurring transactions
Không tự động tạo transaction bằng request frontend.
Dùng background job/Hangfire và idempotency.

## Security
Tài chính là dữ liệu riêng tư:
- authorization nghiêm ngặt.
- audit các thay đổi quan trọng.
- không log amount/account details không cần thiết.
