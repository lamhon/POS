# F7 — Finance Domain

> **Document Type:** AI Implementation Specification  
> **Project:** Personal OS  
> **Phase:** F7  
> **Domain:** Personal Finance  
> **Frontend:** Next.js + TypeScript  
> **Prerequisites:** F3 Database, F4 Authentication & Authorization, F5 App Shell, F6 Design System

---

## 1. Purpose

F7 is the first real business-domain implementation of Personal OS.

The goal is to build a production-ready **Personal Finance MVP** using the architecture established in previous phases.

F7 must support:

```text
Accounts
Categories
Transactions
Income
Expenses
Transfers
Balances
Basic financial summaries
Filtering
Searching
Pagination
Validation
Authorization
Auditability
```

Future capabilities such as budgets, recurring transactions, goals, debts, investments, reports, import/export and AI financial assistance are **out of scope** unless explicitly requested.

---

## 2. Roadmap

```text
F0 Repository
   ↓
F1 Frontend Bootstrap
   ↓
F2 Backend Bootstrap
   ↓
F3 Database
   ↓
F4 Authentication & Authorization
   ↓
F5 App Shell
   ↓
F6 Design System
   ↓
F7 Finance Domain
   ↓
F8 Architecture Review
   ↓
F9 Military Personnel
   ↓
F10 Training
   ↓
F11 Military Manual
   ↓
F12 AI / RAG
```

F7 is the first phase where real user-owned business data is created and modified.

---

## 3. Mandatory AI Context

Before implementation, AI MUST inspect:

```text
00-README.md
01-system-overview.md
02-frontend-nextjs.md
03-backend-architecture.md
04-database-architecture.md
06-authentication.md
11-theme.md
12-design-system.md
13-responsive.md
18-coding-rules.md
20-project-structure.md
22-ai-development-protocol.md
23-mapnode.md

F3-DATABASE.md
F4-AUTHENTICATION-AUTHORIZATION.md
F5-APP-SHELL-DESIGN-SYSTEM.md
F6-DESIGN-SYSTEM.md
```

AI MUST inspect the actual source tree and database schema before coding.

Priority:

```text
Current verified source
>
Current database schema
>
Current architecture
>
Documentation
>
AI assumption
```

If documentation conflicts with implementation, do not silently redesign the project.

---

## 4. Finance Domain Boundary

Finance owns:

```text
accounts
categories
transactions
transfers
balances
financial summaries
finance filters
finance validation
finance permissions
finance-specific UI
```

Finance does NOT own:

```text
authentication
user identity
global theme
global navigation
global UI primitives
generic API client
generic notification system
generic date/currency utilities
```

Reuse shared infrastructure.

---

## 5. Core Domain Model

```text
User
  │
  ├── Account
  │
  ├── Category
  │
  └── Transaction
          │
          └── Transfer relationship
```

Examples:

```text
Accounts:
Cash
Bank
E-Wallet
Savings
Credit Card

Categories:
Food
Transport
Housing
Salary
Shopping

Transactions:
Income
Expense
Transfer
```

Every Finance record must be scoped to the authenticated user unless a future shared-account feature changes the model.

---

## 6. Ownership / Multi-Tenancy Rule

For MVP:

```text
1 authenticated user
    ↓
owns Finance data
```

The backend MUST derive ownership from the authenticated session.

Never trust:

```text
userId
```

sent by the client.

Bad:

```text
GET /api/accounts?userId=123
```

if the server trusts `123`.

Correct:

```text
Authenticated session
        ↓
current user ID
        ↓
query records owned by current user
```

---

## 7. Monetary Values

Financial values must never rely on unsafe floating-point arithmetic.

Use the monetary representation established in F3:

```text
integer minor units
```

or:

```text
DECIMAL/NUMERIC
+
safe decimal arithmetic
```

Do not introduce another representation inside Finance.

All monetary calculations must be deterministic.

---

## 8. Currency

Each financial account must have an explicit currency.

Use ISO-style currency codes:

```text
VND
USD
EUR
```

Do not infer currency from locale.

Example:

```text
Locale = vi-VN
Currency = USD
```

is valid.

---

## 9. Account

Conceptual fields:

```text
id
userId
name
type
currency
openingBalance
currentBalance
isActive
createdAt
updatedAt
```

The exact schema must follow F3.

Account examples:

```text
Cash
MB Bank
Vietcombank
MoMo
Savings
Credit Card
```

---

## 10. Account Types

Initial types:

```text
cash
bank
ewallet
credit_card
savings
other
```

Do not add investment/loan/asset types unless required.

---

## 11. Account Rules

An account:

- Belongs to one user.
- Has one currency.
- Can be active/inactive.
- Has transactions.
- Should normally be archived/deactivated rather than destructively deleted.

If deletion is supported, balance/history consistency must be preserved.

---

## 12. Balance Rule

Canonical conceptual rule:

```text
current balance
=
opening balance
+
income
-
expense
+
transfer in
-
transfer out
```

The implementation must clearly define the source of truth:

```text
calculated from transactions
```

or:

```text
cached balance
```

If cached:

```text
transaction mutation
→ atomic balance update
```

must be guaranteed.

Never allow a transaction to succeed while its balance update silently fails.

---

## 13. Category

Conceptual fields:

```text
id
userId
name
type
icon
color
parentId
isActive
createdAt
updatedAt
```

Category types:

```text
income
expense
```

Transfer should not require a normal category.

---

## 14. System vs User Categories

If default categories exist:

```text
system category
```

may be shared.

User categories:

```text
userId = current user
```

are private.

A user cannot modify another user's category.

---

## 15. Category Hierarchy

If `parentId` exists, simple hierarchy is allowed:

```text
Food
├── Breakfast
├── Lunch
├── Dinner
└── Coffee
```

Do not implement complex unlimited category-tree behavior without a requirement.

---

## 16. Transaction

Conceptual fields:

```text
id
userId
accountId
categoryId
type
amount
currency
description
transactionDate
notes
createdAt
updatedAt
```

Transfer-specific representation must follow F3.

---

## 17. Transaction Types

MVP:

```text
income
expense
transfer
```

Do not introduce additional transaction types prematurely.

---

## 18. Transaction Invariants

### Income

```text
amount > 0
account receives money
category.type = income
```

### Expense

```text
amount > 0
account loses money
category.type = expense
```

### Transfer

```text
amount > 0
sourceAccount != destinationAccount
same owner
same currency
```

unless multi-currency transfer is explicitly supported.

---

## 19. Amount Convention

Recommended:

```text
amount > 0
```

Transaction type determines balance effect.

Example:

```text
type = expense
amount = 100000
```

Do not mix signed amounts and type semantics without an explicit architecture decision.

---

## 20. Transaction Date

Business date is different from persistence timestamps:

```text
transactionDate
createdAt
updatedAt
```

Example:

```text
transactionDate = 2026-08-10
createdAt = 2026-08-13
```

Reports MUST use `transactionDate`.

---

## 21. Transfer

A transfer moves money between two accounts belonging to the same user.

Example:

```text
Cash
  ↓ 1,000,000 VND
Bank
```

A transfer is NOT:

```text
income + expense
```

otherwise financial reports become incorrect.

---

## 22. Transfer Atomicity

Transfer creation must be atomic:

```text
BEGIN
    validate source
    validate destination
    create transfer
    update source
    update destination
COMMIT
```

Any failure:

```text
ROLLBACK
```

No partial transfer is allowed.

---

## 23. Transfer Constraints

MVP:

```text
source != destination
amount > 0
same owner
same currency
```

Multi-currency transfers are out of scope.

---

## 24. CRUD Scope

### Accounts

```text
Create
Read
Update
Archive
List
```

### Categories

```text
Create
Read
Update
Archive
List
```

### Transactions

```text
Create
Read
Update
Delete/void according to project strategy
List
Filter
Search
Pagination
```

### Transfers

```text
Create
Read
List
```

Transfer edit/delete must not be implemented casually because it requires safe balance reversal.

---

## 25. Delete Strategy

Preferred:

```text
void
soft-delete
archive
```

according to the project's existing architecture.

Avoid destructive deletion of financial history.

If hard delete is required, it must preserve:

```text
balance consistency
ownership
auditability
```

---

## 26. Finance Dashboard

Minimum dashboard:

```text
Total balance
Total income
Total expense
Net cash flow
Recent transactions
Account summary
```

Default period:

```text
current month
```

---

## 27. Summary Definitions

```text
Total Income = SUM(income transactions)

Total Expense = SUM(expense transactions)

Net Cash Flow = income - expense
```

Transfers are excluded from income/expense totals.

Do not silently combine different currencies.

For multiple currencies:

```text
group by currency
```

unless exchange-rate conversion exists.

---

## 28. Transaction List

Display:

```text
Date
Description
Category
Account
Type
Amount
```

Optional:

```text
Notes
Status
```

Income/expense cannot rely only on red/green color.

---

## 29. Transaction Filters

MVP:

```text
date range
account
category
type
currency
```

Optional:

```text
amount range
search
```

Filters must combine with AND semantics.

Example:

```text
type = expense
AND category = food
AND date >= 2026-08-01
AND date <= 2026-08-31
```

---

## 30. Search

Initial search:

```text
description
notes
```

Do not introduce full-text infrastructure prematurely.

---

## 31. Pagination

Transaction lists must use server-side pagination when data can become large.

Do not:

```text
fetch everything
→ paginate in React
```

Use the project's existing pagination convention:

```text
page + pageSize
```

or:

```text
cursor + limit
```

---

## 32. Sorting

Default:

```text
transactionDate DESC
createdAt DESC
```

If dynamic sorting exists, backend must whitelist allowed fields.

Never pass arbitrary SQL/order expressions from client input.

---

## 33. API

Follow existing backend API conventions.

Conceptual endpoints:

```text
GET    /api/finance/accounts
POST   /api/finance/accounts
GET    /api/finance/accounts/:id
PATCH  /api/finance/accounts/:id
POST   /api/finance/accounts/:id/archive

GET    /api/finance/categories
POST   /api/finance/categories
PATCH  /api/finance/categories/:id
POST   /api/finance/categories/:id/archive

GET    /api/finance/transactions
POST   /api/finance/transactions
GET    /api/finance/transactions/:id
PATCH  /api/finance/transactions/:id
DELETE /api/finance/transactions/:id

POST   /api/finance/transfers
GET    /api/finance/transfers/:id

GET    /api/finance/summary
```

These are conceptual only. Existing project conventions take priority.

---

## 34. Backend Layering

Do not put all logic in route handlers.

Recommended:

```text
Route / Controller
       ↓
Application Service
       ↓
Domain Logic
       ↓
Repository
       ↓
Database
```

Example:

```text
POST /transactions
        ↓
CreateTransactionService
        ↓
Validation
        ↓
Ownership
        ↓
Business rules
        ↓
Repository
        ↓
Database
```

---

## 35. Repository

Repository owns:

```text
database queries
persistence
filters
pagination
transactions
```

Repository does NOT own:

```text
HTTP response
React state
Toast
UI behavior
```

---

## 36. Application Service

Service owns:

```text
business rules
authorization checks
transaction orchestration
balance consistency
transfer atomicity
domain validation
```

---

## 37. Validation

Recommended:

```text
Zod
```

Schemas:

```text
CreateAccountSchema
UpdateAccountSchema
CreateCategorySchema
UpdateCategorySchema
CreateTransactionSchema
UpdateTransactionSchema
CreateTransferSchema
TransactionFilterSchema
```

Frontend validation improves UX.

Backend validation is mandatory.

---

## 38. Account Validation

Validate:

```text
name
type
currency
openingBalance
```

Reject:

```text
invalid currency
invalid type
malformed ID
unauthorized account
```

---

## 39. Category Validation

Validate:

```text
name
type
parentId
```

Parent category must belong to the current user or be a valid system category.

---

## 40. Transaction Validation

Validate:

```text
account exists
account belongs to current user
type valid
amount > 0
currency valid
category valid when required
category belongs to current user/system
transactionDate valid
```

Reject:

```text
expense + income category
income + expense category
```

---

## 41. Authorization

Reuse F4.

Conceptual permissions:

```text
finance.account.read
finance.account.create
finance.account.update
finance.account.archive

finance.category.read
finance.category.create
finance.category.update
finance.category.archive

finance.transaction.read
finance.transaction.create
finance.transaction.update
finance.transaction.delete

finance.transfer.create
finance.summary.read
```

Do not create a second Finance authorization system.

Backend must enforce authorization even when frontend hides actions.

---

## 42. Frontend Routes

Conceptual:

```text
/app/finance
/app/finance/accounts
/app/finance/accounts/[id]
/app/finance/categories
/app/finance/transactions
/app/finance/transactions/[id]
```

Follow F5 naming conventions if different.

---

## 43. Navigation

Finance section:

```text
Finance
├── Overview
├── Transactions
├── Accounts
└── Categories
```

Do not show unimplemented future modules.

---

## 44. Finance Overview UI

Recommended:

```text
PageHeader
   ↓
Period Filter
   ↓
Summary Cards
   ├── Total Balance
   ├── Income
   ├── Expense
   └── Net Cash Flow
   ↓
Accounts Summary
   ↓
Recent Transactions
```

All UI must use F6 Design System.

---

## 45. Transaction Form

Fields:

```text
type
amount
account
category
date
description
notes
```

Behavior:

```text
income
→ income categories

expense
→ expense categories

transfer
→ transfer-specific fields
```

Do not force a normal category on transfers.

---

## 46. Form UX

Must provide:

```text
loading
field validation
server error
success feedback
disabled submit during mutation
duplicate-submit prevention
```

After success:

```text
invalidate affected queries
show success feedback
navigate according to UX
```

---

## 47. Optimistic Updates

Do NOT use optimistic updates for financial mutations unless rollback is fully reliable.

MVP preference:

```text
submit
→ server mutation
→ success
→ invalidate/refetch
→ update UI
```

Correctness > perceived speed.

---

## 48. Query / Cache

Reuse the project's existing data-fetching strategy.

If TanStack Query is used, conceptual keys:

```text
["finance", "accounts"]
["finance", "categories"]
["finance", "transactions", filters]
["finance", "summary", period]
```

Mutations must invalidate related data.

---

## 49. Loading / Empty / Error

Use F6 components.

Examples:

```text
Dashboard → skeleton cards/table
Transactions → table skeleton
Form mutation → loading button
No accounts → EmptyState
API failure → ErrorState
```

Never show raw backend exceptions.

---

## 50. Security

Finance data is private.

Protect against:

```text
IDOR
cross-user access
mass assignment
unauthorized mutation
unsafe filtering
unsafe sorting
```

Never trust:

```text
userId
accountId ownership
category ownership
```

provided by the client.

---

## 51. Concurrency

Financial mutations must account for:

```text
double submit
simultaneous transfers
simultaneous updates
```

Database transactions/locking must follow F3.

Frontend button disabling is not a concurrency/security mechanism.

---

## 52. Idempotency

For retry-sensitive operations, especially:

```text
transaction creation
transfer creation
```

use the project's existing idempotency mechanism if available.

Do not introduce a separate incompatible mechanism.

---

## 53. Auditability

If F3/F4 audit infrastructure exists, record important mutations:

```text
created
updated
archived
deleted/voided
transfer
```

Do not log sensitive financial payloads unnecessarily.

---

## 54. Frontend Feature Structure

Recommended:

```text
features/
└── finance/
    ├── components/
    │   ├── finance-overview/
    │   ├── transaction-form/
    │   ├── transaction-table/
    │   ├── account-form/
    │   └── category-form/
    ├── hooks/
    ├── schemas/
    ├── services/
    ├── types/
    └── utils/
```

Follow existing project conventions if different.

---

## 55. Backend Feature Structure

Recommended:

```text
modules/
└── finance/
    ├── domain/
    │   ├── account/
    │   ├── category/
    │   ├── transaction/
    │   └── transfer/
    ├── application/
    ├── infrastructure/
    └── presentation/
```

Do not force this structure if F2 established another modular architecture.

---

## 56. Domain Utilities

Centralize:

```text
calculateBalance()
calculateNetCashFlow()
isIncome()
isExpense()
isTransfer()
```

Do not duplicate financial formulas across pages.

There must be one canonical definition of balance and cash flow.

---

## 57. URL Filters

Page-level transaction filters should preferably be URL-serializable:

```text
?type=expense
&accountId=...
&categoryId=...
&from=2026-08-01
&to=2026-08-31
&page=1
```

Benefits:

```text
refresh persistence
browser back/forward
shareable state
```

Validate all query parameters on the backend.

---

## 58. Authorization-Aware UI

Frontend may hide actions based on permission:

```text
Create
Edit
Archive
Delete
```

But:

```text
UI hiding ≠ authorization
```

Backend remains authoritative.

---

## 59. Testing Strategy

### Unit

Test:

```text
balance calculations
net cash flow
transaction rules
category/type compatibility
filter parsing
currency handling
```

### Integration

Test:

```text
create account
create category
create transaction
create transfer
update transaction
archive account
authorization
ownership
```

### E2E

Minimum:

```text
Login
→ Finance Overview
→ Create Account
→ Create Category
→ Create Expense
→ Create Income
→ Verify Balance
→ Verify Summary
→ Create Transfer
→ Verify source/destination
→ Logout
```

---

## 60. Mandatory Finance Test Cases

```text
income increases balance
expense decreases balance
transfer moves money between accounts
transfer does not affect income total
transfer does not affect expense total
foreign account cannot be read
foreign account cannot be updated
foreign category cannot be used
invalid category type rejected
zero amount rejected
negative amount rejected
same-account transfer rejected
wrong-currency transfer rejected
pagination works
combined filters work
```

---

## 61. Security Tests

Must verify:

```text
User A cannot read User B account
User A cannot update User B account
User A cannot delete User B transaction
User A cannot use User B category
User A cannot manipulate userId to access another user's data
```

These are mandatory because Finance contains private financial data.

---

## 62. Performance

Verify:

```text
transaction list does not fetch all records
summary queries are reasonable
no N+1 queries
indexes support actual query patterns
```

Potential index candidates:

```text
(userId, transactionDate)
(userId, accountId)
(userId, categoryId)
(userId, type)
```

Only add indexes after verifying actual query patterns and F3 database behavior.

---

## 63. Seed

If default categories are required:

```text
seed/configuration
```

Development seed may contain deterministic demo data.

Do not seed fake financial data into production.

Seed should be idempotent where practical.

---

## 64. Observability

Log important server events:

```text
transaction mutation failures
transfer failures
authorization failures
unexpected database errors
```

Never log:

```text
password
auth token
unnecessary sensitive financial payload
```

---

## 65. AI Implementation Order

Implement incrementally:

```text
1. Verify F3 Finance schema
        ↓
2. Verify F4 permissions
        ↓
3. Define domain types
        ↓
4. Implement repositories
        ↓
5. Implement application/domain services
        ↓
6. Implement validation
        ↓
7. Implement APIs
        ↓
8. Implement frontend queries/hooks
        ↓
9. Accounts
        ↓
10. Categories
        ↓
11. Transactions
        ↓
12. Transfers
        ↓
13. Finance Overview
        ↓
14. Filters/Search/Pagination
        ↓
15. Authorization-aware UI
        ↓
16. Tests
        ↓
17. Security/Performance review
        ↓
18. MapNode update
```

Do not implement the entire Finance domain as one giant change.

---

## 66. AI Task Granularity

Prefer one business capability per task:

```text
Implement Account repository
Implement Account API
Implement Account form
Implement Category repository
Implement Category API
Implement Transaction creation
Implement Transaction list
Implement Transfer service
Implement Finance summary
```

Avoid:

```text
Build entire Finance module
```

as one uncontrolled task.

---

## 67. AI Decision Rule

```text
Can existing infrastructure solve this?
        ↓
Yes → reuse
No
        ↓
Is it generic?
   ↙       ↘
 Yes       No
 ↓          ↓
Shared    Finance feature
```

Do not create generic abstractions prematurely.

---

## 68. Anti-Patterns

Do NOT:

```text
put business logic inside React components
query database directly from UI
trust userId from request body
use floating point for money
calculate reports from createdAt
treat transfer as income + expense
hard-delete financial history casually
fetch all transactions for client pagination
duplicate F6 Design System components
create a Finance-specific authorization system
```

---

## 69. Definition of Done

### Architecture

- [ ] Finance follows project architecture.
- [ ] Domain boundaries are clear.
- [ ] Shared infrastructure is reused.
- [ ] Business logic is not buried in UI.

### Accounts

- [ ] Create
- [ ] List
- [ ] View
- [ ] Update
- [ ] Archive
- [ ] Ownership enforcement
- [ ] Balance consistency

### Categories

- [ ] Create
- [ ] List
- [ ] Update
- [ ] Archive
- [ ] Type validation
- [ ] Ownership enforcement

### Transactions

- [ ] Income
- [ ] Expense
- [ ] Create
- [ ] Read
- [ ] Update
- [ ] Delete/void strategy
- [ ] Search
- [ ] Filter
- [ ] Pagination
- [ ] Ownership

### Transfers

- [ ] Create
- [ ] Atomic
- [ ] Source balance correct
- [ ] Destination balance correct
- [ ] Excluded from income/expense
- [ ] Ownership enforced

### Dashboard

- [ ] Total balance
- [ ] Income
- [ ] Expense
- [ ] Net cash flow
- [ ] Recent transactions
- [ ] Account summary

### Security

- [ ] Authentication
- [ ] Authorization
- [ ] Ownership
- [ ] IDOR protection
- [ ] Input validation
- [ ] No sensitive logging

### UX

- [ ] Loading
- [ ] Empty
- [ ] Error
- [ ] Success feedback
- [ ] Responsive
- [ ] Accessible
- [ ] F6 Design System used

### Quality

- [ ] Lint
- [ ] Typecheck
- [ ] Unit tests
- [ ] Integration tests
- [ ] Critical E2E
- [ ] Production build

### Documentation

- [ ] API documentation updated
- [ ] Finance domain documentation updated
- [ ] MapNode updated

---

## 70. MapNode Update

After implementation, update the Finance nodes.

Suggested:

```yaml
finance:
  status: active
  phase: F7

  entities:
    account:
      status: complete

    category:
      status: complete

    transaction:
      status: complete

    transfer:
      status: complete

  capabilities:
    accounts: true
    categories: true
    transactions: true
    transfers: true
    summary: true
    filters: true
    search: true
    pagination: true

  future:
    budgets: planned
    recurring_transactions: planned
    goals: planned
    investments: planned
    debts: planned
    reports: planned
    ai_assistant: planned
```

Only mark a capability `true` after implementation and tests actually pass.

---

## 71. Final AI Instruction

F7 is the first production business domain.

Priority:

```text
Correctness
>
Data Integrity
>
Security
>
Authorization
>
Testability
>
Maintainability
>
UX
>
Performance
>
Visual Polish
```

When choosing between faster implementation and stronger financial consistency:

```text
Choose financial consistency.
```

Target architecture:

```text
                    Personal OS
                         │
                ┌────────┴────────┐
                │                 │
           Shared Core        Finance Domain
                │                 │
       ┌────────┼────────┐        │
       │        │        │        │
     Auth    Design    App Shell  │
     Core    System              │
                                  │
                 ┌────────────────┼────────────────┐
                 │                │                │
              Account          Category       Transaction
                                                   │
                                                Transfer
```

After F7 is stable, perform:

```text
F8 — Architecture Review
```

before rapidly adding the next large domain.
