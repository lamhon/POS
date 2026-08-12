# Personal OS

Nền tảng web đa chức năng phục vụ quản lý cá nhân và nghiệp vụ theo module.

## Các module chính

| Module | Mô tả |
|---|---|
| Finance | Quản lý tài chính / chi tiêu cá nhân |
| Military Personnel | Quản lý quân nhân |
| Training | Quản lý huấn luyện chiến sĩ |
| Military Manual | Sổ tay quân sự điện tử |
| Tasks | Quản lý task / công việc |
| Notifications | Thông báo |
| AI Assistant | AI RAG Assistant |

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 · TypeScript · App Router |
| UI | Tailwind CSS · shadcn/ui |
| State | Zustand · TanStack Query |
| Forms | React Hook Form · Zod |
| Backend | ASP.NET Core · C# · .NET 8 |
| Architecture | Modular Monolith · Clean Architecture |
| Database | PostgreSQL · Entity Framework Core |
| Auth | ASP.NET Core Identity · JWT |
| Cache | Redis |
| Storage | MinIO (S3-compatible) |
| Jobs | Hangfire |
| Logging | Serilog |
| API | REST · OpenAPI |
| Testing | xUnit · Vitest · Playwright |
| Infrastructure | Docker · Docker Compose · GitHub Actions |
| AI | LLM API · RAG · pgvector |

## Cấu trúc Repository

```text
personal-os/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # ASP.NET Core backend
├── docs/             # Architecture & requirements
├── mapnode/          # AI context index
├── infrastructure/   # Docker, scripts, config
├── tests/            # E2E tests
└── .github/          # CI/CD workflows
```

## Cách chạy Local

### Yêu cầu
- Node.js >= 20
- .NET 8 SDK
- Docker & Docker Compose

### Khởi động

```bash
# 1. Clone và cài đặt
cp .env.example .env

# 2. Khởi động PostgreSQL
docker compose up -d postgres

# 3. Chạy backend
cd apps/api/src/Api
dotnet run

# 4. Chạy frontend
cd apps/web
npm install
npm run dev
```

Truy cập:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Swagger UI: http://localhost:5000/swagger

## Tài liệu

- [`docs/`](./docs/) — Kiến trúc và requirements chi tiết
- [`mapnode/`](./mapnode/) — AI context index

## Development Workflow

```text
Branch mặc định: main
Development:     develop
Feature:         feature/<scope>-<short-name>

Ví dụ:
  feature/auth-login
  feature/finance-transactions
```

Quy tắc commit: không commit `.env`, secrets, build artifacts, `node_modules`, `bin/`, `obj/`.
