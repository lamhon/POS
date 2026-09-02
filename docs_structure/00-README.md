# Personal OS — AI Development Documentation

## 1. Mục đích
Personal OS là nền tảng web đa chức năng, phục vụ quản lý cá nhân và nghiệp vụ theo module.

Các module định hướng:
- Quản lý tài chính/chi tiêu cá nhân.
- Quản lý quân nhân.
- Quản lý huấn luyện chiến sĩ.
- Sổ tay quân sự điện tử.
- Quản lý task/công việc.
- Thông báo.
- AI Assistant/RAG.

## 2. Công nghệ chuẩn
Frontend: Next.js + TypeScript + App Router.
UI: Tailwind CSS + shadcn/ui.
Client state: Zustand.
Server state/API cache: TanStack Query.
Forms: React Hook Form + Zod.
Backend: ASP.NET Core + C#.
Architecture: Modular Monolith + Clean Architecture + Feature/Vertical Slice.
Database: PostgreSQL + Entity Framework Core.
Authentication: ASP.NET Core Identity + JWT/Refresh Token.
Cache: Redis.
Object storage: MinIO/S3-compatible.
Background jobs: Hangfire.
Logging: Serilog.
API contract: REST + OpenAPI.
Testing: xUnit, Vitest/Testing Library, Playwright.
Infrastructure: Docker + Docker Compose + GitHub Actions.
AI: LLM API + RAG + pgvector.

## 3. Quy tắc cho AI
AI phải:
1. Đọc README và SUMMARY trước khi thay đổi code.
2. Đọc các tài liệu liên quan trực tiếp tới module đang sửa.
3. Không tự ý thay đổi architecture, database strategy hoặc coding convention.
4. Ưu tiên tái sử dụng abstraction/component/service hiện có.
5. Không tạo duplicate logic.
6. Không đưa business logic vào UI component.
7. Backend phải kiểm tra authorization ở server, không tin frontend.
8. Mọi thay đổi schema phải có migration.
9. Mọi API public phải có validation, error handling và OpenAPI documentation.
10. Khi thay đổi kiến trúc phải cập nhật tài liệu tương ứng.

## 4. Nguyên tắc ưu tiên
Correctness > Security > Maintainability > Performance > Convenience.

## 5. Trạng thái tài liệu
Các file trong thư mục này là source of truth cho AI khi phát triển Personal OS.
