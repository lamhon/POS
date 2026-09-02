# Backend — ASP.NET Core

## Mục tiêu
ASP.NET Core là backend chính, chịu trách nhiệm business logic, authorization, persistence và integration.

## Stack
- ASP.NET Core.
- C#.
- Entity Framework Core.
- PostgreSQL provider.
- FluentValidation.
- MediatR nếu cần cho command/query pipeline.
- Serilog.
- OpenAPI/Swagger.
- ASP.NET Core Identity.
- JWT + Refresh Token.
- Hangfire.
- OpenTelemetry.

## Dependency direction
```text
API
 |
Application
 |
Domain

Infrastructure --> Application/Domain
```

Domain không phụ thuộc Infrastructure.
Application không phụ thuộc HTTP framework.
API chỉ orchestration/transport concerns.

## Layer responsibilities

### Domain
- Entities.
- Value Objects.
- Domain rules.
- Domain events.
- Enums/domain constants.

Không truy cập database, HTTP, Redis hoặc framework infrastructure.

### Application
- Commands.
- Queries.
- DTOs.
- Validators.
- Authorization requirements.
- Interfaces/ports.
- Use cases.

### Infrastructure
- EF Core.
- DbContext.
- Repository implementations nếu thực sự cần.
- Redis.
- Object storage.
- External services.
- Email/notification.
- AI provider implementations.

### API
- Endpoints/controllers.
- Authentication middleware.
- Request/response mapping.
- OpenAPI.
- HTTP status codes.

## API convention
- JSON.
- RESTful resource naming.
- Pagination cho list.
- Consistent error envelope.
- Validation lỗi trả về cấu trúc machine-readable.
- Không expose EF entities trực tiếp.

## Business logic
Business rules phải nằm ở Domain/Application, không nằm trong controller hoặc frontend.

## Transactions
Một use case thay đổi nhiều entity phải có transaction boundary rõ ràng.
Không giữ transaction trong thời gian gọi external service lâu.
