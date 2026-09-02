# System Overview

## Mục tiêu
Xây dựng một Personal OS có kiến trúc module hóa, cho phép phát triển độc lập từng domain nhưng vẫn dùng chung identity, design system, infrastructure và platform services.

## Kiến trúc tổng quát
```text
Browser
  |
  v
Next.js Frontend
  |
  | HTTPS / REST / JSON
  v
ASP.NET Core API
  |
  +-- Identity
  +-- Finance
  +-- Military Personnel
  +-- Training
  +-- Military Manual
  +-- Tasks
  +-- Notifications
  +-- AI
  |
  +-- PostgreSQL
  +-- Redis
  +-- Object Storage
  +-- Background Jobs
```

## Architectural style
- Modular Monolith ở backend.
- Clean Architecture cho dependency direction.
- Feature/Vertical Slice trong Application/API.
- PostgreSQL là source of truth.
- Redis chỉ là cache/temporary state, không phải source of truth.
- Object storage chứa file lớn, database chỉ lưu metadata.
- AI là platform/module, không được làm dependency bắt buộc của nghiệp vụ lõi.

## Nguyên tắc module
Mỗi module phải có:
- Domain model.
- Application use cases.
- Persistence.
- API endpoints.
- Validation.
- Authorization.
- Tests.
- Documentation.

Module không được truy cập trực tiếp database tables của module khác. Giao tiếp qua public application contract/service hoặc integration event phù hợp.

## Non-functional requirements
- Security by default.
- Auditability cho nghiệp vụ quan trọng.
- API versioning khi cần breaking change.
- Pagination cho collection lớn.
- Idempotency cho operation có thể retry.
- UTC trong backend; timezone hiển thị theo user.
