# F3 — Database Foundation

## 1. Mục tiêu

F3 xây dựng nền tảng Database/Persistence cho Personal OS.

Phạm vi:

- PostgreSQL
- Entity Framework Core
- Npgsql
- DbContext
- Entity configuration
- Migration
- Database health check
- Transaction strategy
- Naming convention
- UUID strategy
- UTC timestamp strategy
- Audit field strategy
- Index/constraint strategy
- Integration-test database
- Documentation + MapNode

F3 **không** triển khai toàn bộ schema của Finance, Personnel, Training hoặc Military Manual.

> Lưu ý: roadmap trước đó từng đặt Authentication ở F3. Theo yêu cầu mới, F3 được đổi thành Database; Authentication chuyển sang F4.

---

## 2. Context AI bắt buộc đọc

Trước khi code, AI phải đọc:

```text
00-README.md
01-system-overview.md
03-backend-aspnetcore.md
04-database-postgresql.md
18-coding-rules.md
19-api-conventions.md
20-project-structure.md
22-ai-development-protocol.md
23-mapnode.md

F0-REPOSITORY-INITIALIZATION.md
F1-FRONTEND-BOOTSTRAP.md
F2-BACKEND-BOOTSTRAP.md
```

Sau đó phải inspect source code hiện tại để tìm:

- DbContext hiện có.
- EF Core package.
- Npgsql package.
- Docker Compose.
- Connection string.
- Health check.
- Existing migrations.
- Persistence abstractions.
- Existing tests.

Không tạo duplicate implementation.

---

## 3. Architecture

Luồng persistence:

```text
Next.js
   ↓ HTTP
ASP.NET Core API
   ↓
Application
   ↓
Domain
   ↓
Infrastructure
   ↓
EF Core
   ↓
Npgsql
   ↓
PostgreSQL
```

Dependency rule:

```text
API → Application → Domain

Infrastructure → Application/Domain
```

Domain không được phụ thuộc:

```text
EF Core
Npgsql
PostgreSQL
ASP.NET Core
Infrastructure
```

Persistence code phải nằm trong `Infrastructure`.

---

## 4. Database

Database chính:

```text
PostgreSQL
```

Không thêm database khác trong F3.

Không thêm:

```text
MongoDB
Redis
OpenSearch
pgvector
Kafka
RabbitMQ
```

trừ khi một requirement hiện tại thực sự yêu cầu.

Mục tiêu là giữ architecture:

```text
Modular Monolith + PostgreSQL + EF Core
```

---

## 5. Backend Persistence Structure

Nếu chưa có structure tương đương, dùng:

```text
apps/api/
└── src/
    ├── Api/
    ├── Application/
    ├── Domain/
    ├── Infrastructure/
    │   └── Persistence/
    │       ├── Context/
    │       ├── Configurations/
    │       ├── Migrations/
    │       ├── Interceptors/
    │       ├── Seed/
    │       └── Extensions/
    └── Modules/
```

Không tạo thêm tầng chỉ vì muốn architecture "đẹp".

---

## 6. DbContext

Tạo `PersonalOsDbContext` nếu project chưa có DbContext phù hợp.

Responsibilities:

- DbSet.
- Apply entity configurations.
- Persistence conventions.
- Query filters khi thật sự cần.
- SaveChanges integration.

Không đặt business rule vào DbContext.

Entity mapping nên dùng:

```csharp
IEntityTypeConfiguration<TEntity>
```

thay vì một `OnModelCreating()` khổng lồ.

---

## 7. Database Naming Convention

Database dùng:

```text
snake_case
```

Ví dụ:

```text
users
financial_accounts
training_sessions
military_personnel
created_at
updated_at
deleted_at
```

C# vẫn dùng:

```csharp
CreatedAt
UpdatedAt
DeletedAt
```

Không trộn:

```text
CreatedAt
created_at
createdAt
```

trong database.

---

## 8. Primary Key

Business entities sử dụng UUID/GUID.

C#:

```csharp
Guid Id
```

Database:

```text
uuid
```

Không sử dụng integer auto-increment cho business entities mới nếu không có lý do được document.

ID không nên có public setter nếu domain không yêu cầu.

---

## 9. Timestamp

Canonical database timestamps phải là UTC.

Khuyến nghị:

```text
DateTimeOffset
```

hoặc type UTC-compatible đã được project thống nhất.

Không lưu local Vietnam time làm canonical timestamp.

Ví dụ:

```text
2026-08-12T03:49:00Z
```

UI mới chuyển sang timezone của người dùng.

---

## 10. Audit Fields

Khi entity cần audit:

```text
CreatedAt
UpdatedAt
CreatedBy
UpdatedBy
```

Trong database:

```text
created_at
updated_at
created_by
updated_by
```

F3 chưa có Authentication nên:

```text
CreatedBy
UpdatedBy
```

có thể nullable.

Không tạo fake user ID.

---

## 11. Soft Delete

Không tự động thêm soft delete vào mọi entity.

Soft delete chỉ dùng khi lifecycle của entity phù hợp.

Các record lịch sử như:

```text
Financial Transaction
Training Result
Personnel Assignment History
Document Version
```

thường không nên bị xóa vật lý.

Có thể dùng:

```text
status
archived_at
deleted_at
```

tùy domain.

Nếu dùng soft delete, phải kiểm soát query filter để tránh vô tình ẩn dữ liệu khỏi admin/report.

---

## 12. Money

Tuyệt đối không dùng:

```text
float
double
```

cho tiền.

Finance sẽ dùng:

```text
decimal
```

và PostgreSQL:

```text
numeric(precision, scale)
```

Precision/scale chính thức phải được module Finance xác định.

F3 chỉ đặt convention, không tạo toàn bộ Finance schema.

---

## 13. Nullability

Chỉ nullable khi `null` là một trạng thái hợp lệ.

Ví dụ:

```text
created_at NOT NULL
status NOT NULL
name NOT NULL
```

nếu domain yêu cầu.

Không làm mọi column nullable để code dễ hơn.

---

## 14. Foreign Keys

Quan hệ dữ liệu cần integrity phải dùng foreign key.

Ví dụ:

```text
Transaction
    ↓
FinancialAccount
```

Không để orphan reference.

Không dùng cascade delete mặc định cho mọi quan hệ.

Với dữ liệu lịch sử, ưu tiên chiến lược:

```text
Restrict
```

hoặc lifecycle/status.

---

## 15. Unique Constraints

Business uniqueness phải được enforce ở database.

Ví dụ tương lai:

```text
email
username
account_code
category_code
```

Frontend validation không thay thế database constraint.

---

## 16. Index

Không index mọi column.

Index dựa trên query pattern thực tế.

Các ứng viên thường gặp:

```text
foreign keys
created_at
updated_at
status
user_id
account_id
category_id
personnel_id
```

Index cụ thể được tạo khi module tương ứng được implement.

---

## 17. Transactions

Các use case thay đổi nhiều record phải atomic.

Ví dụ Finance:

```text
Transfer
├── Debit source account
└── Credit destination account
```

Nếu một bước fail thì toàn bộ transaction rollback.

Controller không được tự quản lý database transaction.

Transaction thuộc Application/Infrastructure boundary.

---

## 18. EF Core Migrations

Migration là source-controlled database schema evolution.

Flow:

```text
Modify model
   ↓
Create migration
   ↓
Review migration
   ↓
Apply migration
   ↓
Test
   ↓
Commit
```

Tên migration phải có ý nghĩa.

Tốt:

```text
InitialPersistenceFoundation
AddFinanceAccounts
AddTransactions
```

Không dùng:

```text
Migration1
Test
Update
NewMigration
```

AI không được xóa toàn bộ migration history để sửa lỗi nếu chưa có yêu cầu rõ ràng.

Không sửa migration đã được áp dụng chỉ để "làm cho đẹp".

---

## 19. Initial Schema

F3 phải giữ schema tối thiểu.

Không tạo speculative tables:

```text
transactions
training_sessions
military_personnel
manual_documents
```

chỉ vì chúng sẽ tồn tại trong tương lai.

Business tables được tạo ở phase/module tương ứng.

---

## 20. Seed Data

Seed schema và seed data phải tách biệt.

F3 chỉ chuẩn bị strategy.

Seed phù hợp:

```text
system reference data
development-only reference data
```

Không seed fake:

```text
transactions
soldiers
training results
military documents
```

vào production.

Identity seed sẽ được xử lý ở F4.

---

## 21. PostgreSQL Docker

Local development phải chạy PostgreSQL bằng Docker Compose.

Yêu cầu:

- Named volume.
- Configurable port.
- Environment-based credentials.
- Health check.
- Local-only exposure.

Ví dụ conceptual:

```yaml
postgres:
  image: postgres
  environment:
    POSTGRES_DB: personal_os
    POSTGRES_USER: personal_os
    POSTGRES_PASSWORD: change-me
  ports:
    - "5432:5432"
```

Password trên chỉ là development example.

Không dùng production password trong repository.

---

## 22. Configuration

Connection string không được hard-code.

Ví dụ:

```text
ConnectionStrings__Default
```

hoặc convention tương ứng của project.

Không log:

```text
connection string
password
database credentials
```

Production secret phải đến từ environment/secret manager.

---

## 23. Health Check

ASP.NET Core phải kiểm tra PostgreSQL connectivity.

Phân biệt:

```text
Liveness
Readiness
```

Liveness:

```text
process đang chạy
```

Readiness:

```text
service sẵn sàng xử lý request
+
database dependency hoạt động
```

Khi PostgreSQL down:

```text
Readiness = unhealthy
```

---

## 24. Connection Resilience

Có thể cấu hình retry có giới hạn cho transient database failures.

Không tạo retry vô hạn.

Không dùng retry để che lỗi cấu hình database.

Connection failure phải observable qua logs/health check.

---

## 25. Query Rules

AI phải tránh:

```text
Load entire table
↓
Filter in memory
```

Thay vào đó:

```text
Filter
↓
Sort
↓
Project
↓
Paginate
↓
Execute
```

Quy tắc:

- Không N+1 query.
- Pagination cho collection lớn.
- `AsNoTracking()` cho read-only query phù hợp.
- Không lazy loading nếu chưa được phê duyệt.
- Không `ToList()` quá sớm.
- Chỉ select columns cần thiết khi có lợi ích rõ ràng.

---

## 26. Repository Pattern

Không tự động tạo:

```text
IRepository<T>
GenericRepository<T>
```

cho mọi entity.

EF Core đã cung cấp nhiều capability của repository/unit-of-work.

Repository chỉ được tạo khi nó thể hiện một abstraction có ý nghĩa.

Ưu tiên:

```text
Application Use Case
        ↓
Persistence abstraction phù hợp
        ↓
EF Core
```

thay vì tạo generic abstraction chỉ để "có Clean Architecture".

---

## 27. Test Database

Integration tests không được phụ thuộc vào database tùy ý của developer.

Chọn một strategy:

```text
Dedicated PostgreSQL test database
```

hoặc:

```text
Disposable PostgreSQL container
```

Test phải có known state.

Không test dựa vào dữ liệu thủ công trên máy.

---

## 28. Tests F3

Tối thiểu:

```text
Database connection test
Migration test
DbContext configuration test
Health check test
```

Khi module xuất hiện, bổ sung:

```text
Constraint tests
Foreign key tests
Transaction tests
Query tests
Index/query behavior tests
```

---

## 29. Architecture Tests

Nếu có architecture tests, phải bảo vệ:

```text
Domain
  X Infrastructure

Domain
  X EF Core

Domain
  X PostgreSQL

Application
  X Api
```

Mục tiêu là ngăn AI làm sai dependency direction.

---

## 30. Security

F3 phải đảm bảo:

- Không commit database password.
- Không log credentials.
- Không expose PostgreSQL public trong production.
- Database user theo least privilege.
- Production database chỉ accessible từ trusted network.
- Backup/restore strategy được document.

F3 không cần triển khai production backup infrastructure nếu chưa thuộc DevOps phase.

---

## 31. AI Execution Workflow

AI phải làm theo thứ tự:

```text
1. Đọc context
2. Inspect repository
3. Inspect existing persistence code
4. Xác định phần đã có
5. Không tạo duplicate
6. Configure PostgreSQL
7. Configure Npgsql/EF Core
8. Configure DbContext
9. Configure entity conventions
10. Configure migrations
11. Configure health check
12. Configure test database
13. Apply migration vào clean DB
14. Run tests
15. Run build/lint/typecheck
16. Review migration
17. Update docs
18. Update MapNode
19. Report changes
```

---

## 32. AI Không Được Làm

Không được trong F3:

```text
Implement Finance
Implement Personnel
Implement Training
Implement Military Manual
Implement Authentication
Implement RAG
Add Redis
Add OpenSearch
Add pgvector
Add Kafka
Add RabbitMQ
Add Kubernetes
Create microservices
Create speculative tables
Create generic repository framework
```

F3 chỉ xây persistence foundation.

---

## 33. Acceptance Criteria

### PostgreSQL

- [ ] PostgreSQL chạy bằng Docker.
- [ ] Persistent volume hoạt động.
- [ ] Credentials lấy từ environment.
- [ ] Database health check hoạt động.

### EF Core

- [ ] EF Core configured.
- [ ] Npgsql configured.
- [ ] `PersonalOsDbContext` tồn tại hoặc abstraction tương đương.
- [ ] Entity configuration strategy tồn tại.
- [ ] Naming convention nhất quán.

### Data rules

- [ ] UUID strategy được document.
- [ ] UTC timestamp được document.
- [ ] Nullability strategy được document.
- [ ] Foreign key strategy được document.
- [ ] Index strategy được document.
- [ ] Transaction strategy được document.

### Migration

- [ ] Migration system hoạt động.
- [ ] Migration source-controlled.
- [ ] Clean database có thể apply migration.
- [ ] Không phá migration history.

### Testing

- [ ] Database connection test pass.
- [ ] Migration test pass.
- [ ] Health check test pass.
- [ ] Architecture tests pass nếu project đã cấu hình.

### Documentation

- [ ] Database documentation updated.
- [ ] MapNode updated.
- [ ] Chỉ document những gì thực sự đã implement.

---

## 34. Definition of Done

F3 hoàn thành khi:

```text
Docker PostgreSQL
      ↓
EF Core / Npgsql
      ↓
PersonalOsDbContext
      ↓
ASP.NET Core
```

hoạt động ổn định.

Có thể:

1. Khởi động PostgreSQL.
2. Khởi động API.
3. API kết nối database.
4. Health check xác nhận database ready.
5. Apply migration vào database sạch.
6. Chạy integration tests.
7. Build project thành công.

Trạng thái cuối:

```text
Database Foundation = READY

Finance Schema       = NOT IMPLEMENTED
Personnel Schema     = NOT IMPLEMENTED
Training Schema      = NOT IMPLEMENTED
Manual Schema        = NOT IMPLEMENTED
Authentication       = NEXT PHASE
```

---

## 35. MapNode Update

Sau khi hoàn thành, cập nhật:

```text
mapnode/index.yaml
mapnode/architecture/database.yaml
```

Ví dụ:

```yaml
database:
  engine: postgresql
  orm: entity-framework-core
  provider: npgsql
  naming: snake_case
  id_strategy: uuid
  timestamp: utc
  migrations: ef-core
  status: active
```

MapNode phải phản ánh implementation thực tế, không đánh dấu feature chưa làm là active.

---

## 36. Final AI Instruction

Bạn đang xây **database foundation**, không phải toàn bộ Personal OS.

Ưu tiên:

```text
Correctness
>
Data Integrity
>
Architecture Consistency
>
Security
>
Testability
>
Maintainability
>
Performance
>
Convenience
```

Khi không chắc chắn:

1. Inspect code hiện tại.
2. Đọc tài liệu liên quan.
3. Chọn implementation nhỏ nhất đáp ứng requirement.
4. Không tự phát minh infrastructure.
5. Không tạo speculative schema.
6. Không phá code đang hoạt động.
7. Viết test.
8. Update documentation.
9. Update MapNode.
10. Báo cáo chính xác phần đã làm và phần cố ý chưa làm.
