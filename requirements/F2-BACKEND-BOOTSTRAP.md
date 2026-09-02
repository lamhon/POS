# F2 — Backend Bootstrap

## 1. Mục tiêu

F2 xây dựng nền tảng ASP.NET Core backend cho Personal OS.

F2 chưa implement Finance, Training, Personnel hoặc Military Manual.

Mục tiêu:
- ASP.NET Core chạy được.
- Clean Architecture foundation.
- Modular Monolith foundation.
- PostgreSQL connection foundation.
- EF Core.
- Health Check.
- OpenAPI.
- Global error handling.
- Dependency Injection.
- Configuration.
- Logging foundation.
- API versioning/convention foundation.

---

## 2. Context bắt buộc

AI phải đọc:

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
```

---

## 3. Backend Technology

Bắt buộc:

```text
ASP.NET Core
C#
Entity Framework Core
PostgreSQL
OpenAPI/Swagger
Serilog
```

Có thể chuẩn bị abstraction cho:
- Redis.
- Object storage.
- Background jobs.

Nhưng không triển khai service nếu chưa cần.

---

## 4. Backend Structure

Đề xuất:

```text
apps/api/
├── src/
│   ├── Api/
│   ├── Application/
│   ├── Domain/
│   ├── Infrastructure/
│   └── Modules/
│
└── tests/
    ├── Unit/
    ├── Integration/
    └── Architecture/
```

---

## 5. Layer Responsibilities

### Domain

Chứa:
- Entities.
- Value Objects.
- Domain rules.
- Domain events nếu cần.

Không phụ thuộc:
- EF Core.
- ASP.NET Core.
- PostgreSQL.
- Redis.
- HTTP.

### Application

Chứa:
- Commands.
- Queries.
- DTOs.
- Validators.
- Use cases.
- Interfaces/ports.

Không chứa implementation Infrastructure.

### Infrastructure

Chứa:
- EF Core.
- DbContext.
- PostgreSQL.
- External services.
- Logging sinks.
- Storage implementations.

### API

Chứa:
- HTTP endpoints.
- Middleware.
- Authentication integration.
- Request/response transport.
- OpenAPI.

API layer không chứa business logic.

---

## 6. Modular Monolith

Module structure tương lai:

```text
Modules/
├── Identity/
├── Finance/
├── MilitaryPersonnel/
├── Training/
├── MilitaryManual/
├── Tasks/
├── Notifications/
└── AI/
```

F2 chưa implement các module này.

Có thể tạo placeholder/architecture namespace nếu cần, nhưng không tạo business code giả.

---

## 7. Dependency Direction

Quy tắc:

```text
API
 ↓
Application
 ↓
Domain

Infrastructure
 ↓
Application / Domain
```

Domain không được phụ thuộc ngược Infrastructure.

Không được:

```text
Domain -> EF Core
Domain -> PostgreSQL
Domain -> Redis
Domain -> HttpClient
```

---

## 8. Minimal API Surface

F2 chỉ cần endpoint health:

```text
GET /api/v1/health
```

Response ví dụ:

```json
{
  "status": "healthy"
}
```

Có thể thêm readiness check riêng nếu cần.

Không tạo CRUD giả chỉ để chứng minh API hoạt động.

---

## 9. Database Foundation

EF Core phải kết nối PostgreSQL.

Tạo DbContext foundation.

Ở F2 chưa cần entity nghiệp vụ.

Migration đầu tiên chỉ được tạo nếu thực sự có schema cần thiết.

Không tạo hàng chục bảng placeholder.

---

## 10. Configuration

Tách configuration:
- Development.
- Test.
- Production.

Không hard-code:
- connection string.
- JWT secret.
- API keys.
- password.

Sử dụng configuration/options pattern.

Secrets production phải đến từ environment/secret manager.

---

## 11. Health Check

Health check phải kiểm tra tối thiểu:
- API process.
- PostgreSQL connectivity khi database đã được cấu hình.

Phân biệt:
```text
Liveness
Readiness
```

Liveness:
> process còn chạy.

Readiness:
> service sẵn sàng nhận traffic và dependency quan trọng hoạt động.

---

## 12. Error Handling

Tạo global exception handling.

Production không trả:
- stack trace.
- database exception detail.
- internal paths.
- secrets.

API error phải theo convention thống nhất, ưu tiên ProblemDetails/RFC 7807.

Ví dụ:

```json
{
  "type": "https://example.com/errors/validation",
  "title": "Validation failed",
  "status": 400,
  "detail": "The request is invalid"
}
```

Chi tiết field validation có thể bổ sung theo convention.

---

## 13. Logging

Serilog structured logging.

Log tối thiểu:
- Request ID/correlation ID.
- Method.
- Route.
- Status code.
- Duration.
- Error information.

Không log:
- Password.
- Access token.
- Refresh token.
- Sensitive personnel data.
- Financial secrets.

---

## 14. OpenAPI

Bật OpenAPI/Swagger trong Development.

API contract phải:
- mô tả endpoint.
- request.
- response.
- error.
- authentication khi auth được implement ở phase sau.

Không expose internal domain entities trực tiếp.

---

## 15. Dependency Injection

Đăng ký dependencies theo module/layer.

Không tạo một `ServiceCollectionExtensions.cs` khổng lồ chứa mọi thứ.

Khi module xuất hiện:

```text
Finance
  -> FinanceServiceRegistration
```

Identity:

```text
Identity
  -> IdentityServiceRegistration
```

Có thể dùng module registration pattern.

---

## 16. CORS

F2 phải chuẩn bị CORS cho Next.js development origin.

Ví dụ:

```text
http://localhost:3000
```

Không dùng:

```text
AllowAnyOrigin
```

kèm credentials trong production.

Allowed origins phải cấu hình theo environment.

---

## 17. Database Development Environment

Docker Compose phải cung cấp PostgreSQL.

Ví dụ service:

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

Password này chỉ dành cho local development và không được dùng production.

---

## 18. Testing Foundation

Tạo cấu trúc:

```text
tests/
├── Unit/
├── Integration/
└── Architecture/
```

F2 cần ít nhất:
- API boot test.
- Health check test.
- Database connectivity/integration test nếu environment CI hỗ trợ.

Không cần test business rule vì business module chưa tồn tại.

---

## 19. Architecture Tests

Nếu sử dụng architecture test, kiểm tra các rule quan trọng:

```text
Domain không phụ thuộc Infrastructure
Domain không phụ thuộc Api
Application không phụ thuộc Api
```

Mục đích là ngăn architecture drift khi AI bắt đầu code nhiều module.

---

## 20. Acceptance Criteria

- [ ] ASP.NET Core chạy được.
- [ ] Clean Architecture foundation tồn tại.
- [ ] Modular Monolith structure tồn tại.
- [ ] PostgreSQL chạy bằng Docker.
- [ ] EF Core kết nối được PostgreSQL.
- [ ] Health endpoint hoạt động.
- [ ] Liveness/readiness strategy rõ ràng.
- [ ] Global error handling hoạt động.
- [ ] OpenAPI hoạt động.
- [ ] Structured logging hoạt động.
- [ ] Configuration tách khỏi source code.
- [ ] CORS development được cấu hình.
- [ ] Tests cơ bản pass.
- [ ] Architecture dependency rules được bảo vệ.
- [ ] Không có Finance/Training/Manual business code.

---

## 21. AI Rules

AI KHÔNG được:
- Tạo Finance entity.
- Tạo Training entity.
- Tạo Military Personnel entity.
- Tạo Manual entity.
- Tạo JWT implementation nếu task chỉ là backend bootstrap.
- Tự thêm Redis/MinIO/OpenSearch.
- Tạo repository abstraction không có requirement.
- Đưa business logic vào Controller.
- Cho Domain phụ thuộc Infrastructure.
- Tạo migration chứa bảng business placeholder.

AI phải ưu tiên foundation nhỏ, rõ ràng và có thể mở rộng.

---

## 22. Output

F2 phải tạo một ASP.NET Core backend tối thiểu nhưng production-oriented về architecture:

```text
Next.js
   |
   | HTTP
   v
ASP.NET Core
   |
   +-- Health
   +-- Error handling
   +-- Logging
   +-- OpenAPI
   |
   v
PostgreSQL
```

Sau F2, hệ thống sẵn sàng bước sang:

```text
F3 — Authentication & Authorization
```

và sau đó:

```text
F4 — App Shell / Design System
F5 — Finance MVP
```
