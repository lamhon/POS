# F0 — Repository Initialization

## 1. Mục tiêu

F0 là bước khởi tạo repository cho Personal OS.

Mục tiêu của F0:
- Tạo cấu trúc repository ổn định.
- Phân tách frontend, backend, infrastructure, documentation và AI context.
- Thiết lập Git.
- Thiết lập nguyên tắc environment.
- Chuẩn bị nền tảng để AI phát triển project theo từng task.
- Không implement business module ở F0.

F0 phải hoàn thành trước F1 và F2.

---

## 2. Context bắt buộc AI phải đọc

Trước khi thực hiện F0, AI phải đọc:

```text
00-README.md
01-system-overview.md
18-coding-rules.md
20-project-structure.md
22-ai-development-protocol.md
23-mapnode.md
```

Nếu các file trên chưa tồn tại trong repository, phải tạo/cập nhật chúng trước khi tiếp tục nếu task yêu cầu.

---

## 3. Repository Structure

Repository mục tiêu:

```text
personal-os/
├── apps/
│   ├── web/                    # Next.js frontend
│   └── api/                    # ASP.NET Core backend
│
├── docs/                       # Architecture / requirements
│   ├── architecture/
│   ├── modules/
│   └── tasks/
│
├── mapnode/                    # AI context index
│   ├── index.yaml
│   ├── architecture/
│   └── modules/
│
├── infrastructure/
│   ├── docker/
│   ├── scripts/
│   └── config/
│
├── tests/
│   └── e2e/
│
├── .github/
│   └── workflows/
│
├── .gitignore
├── .editorconfig
├── .env.example
├── docker-compose.yml
└── README.md
```

Không tạo các thư mục generic như:

```text
misc/
temp/
new/
helpers2/
test2/
```

Tên thư mục phải phản ánh responsibility.

---

## 4. Git

Khởi tạo Git repository.

Branch mặc định:

```text
main
```

Development branch:

```text
develop
```

Feature branch:

```text
feature/<scope>-<short-name>
```

Ví dụ:

```text
feature/foundation-nextjs-bootstrap
feature/auth-login
feature/finance-transactions
```

Không commit:
- `.env`
- secrets
- build artifacts
- IDE metadata không cần thiết
- node_modules
- bin/
- obj/
- coverage/

---

## 5. Root README

README root phải giải thích ngắn gọn:

- Personal OS là gì.
- Các module chính.
- Technology stack.
- Cách chạy local.
- Cấu trúc repository.
- Link tới `docs/`.
- Link tới `mapnode/`.
- Development workflow.

README không được chứa toàn bộ requirement. Requirement nằm trong docs.

---

## 6. Environment

Tạo:

```text
.env.example
```

Chỉ chứa tên biến và giá trị mẫu không nhạy cảm.

Ví dụ:

```env
APP_ENV=development

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DATABASE=personal_os
POSTGRES_USER=personal_os
POSTGRES_PASSWORD=change-me

API_BASE_URL=http://localhost:5000
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

Không commit secret thật.

Frontend public environment phải được phân biệt với backend secret.

---

## 7. EditorConfig

Tạo `.editorconfig` để thống nhất:
- UTF-8.
- LF.
- Indentation.
- Final newline.
- Trim trailing whitespace.

Frontend và backend có thể có rule riêng nhưng phải tương thích.

---

## 8. MapNode

Tạo:

```text
mapnode/
├── index.yaml
└── architecture/
```

`index.yaml` là entry point cho AI.

MapNode phải mô tả tối thiểu:

```yaml
project:
  id: personal-os
  name: Personal OS
  architecture: modular-monolith
  frontend: nextjs
  backend: aspnetcore
  database: postgresql

nodes:
  - id: foundation.repository
    path: .
    type: architecture
    status: active
```

MapNode không chứa source code và không thay thế documentation.

---

## 9. Docker

Ở F0 chỉ chuẩn bị Docker structure.

Có thể tạo:

```text
infrastructure/docker/
```

và:

```text
docker-compose.yml
```

Nhưng chỉ thêm service thực sự cần cho F0/F1/F2.

PostgreSQL sẽ được dùng từ F2.

Không đưa vào ngay:
- Kubernetes.
- OpenSearch.
- AI service.
- Production infrastructure.

---

## 10. Acceptance Criteria

F0 hoàn thành khi:

- [ ] Git repository hoạt động.
- [ ] Root structure đúng.
- [ ] `apps/web` là nơi dành cho Next.js.
- [ ] `apps/api` là nơi dành cho ASP.NET Core.
- [ ] `docs/` tồn tại.
- [ ] `mapnode/` tồn tại.
- [ ] `.gitignore` đúng.
- [ ] `.editorconfig` tồn tại.
- [ ] `.env.example` tồn tại.
- [ ] README root có hướng dẫn cơ bản.
- [ ] Không có secret trong repository.
- [ ] Không có business code.

---

## 11. AI Rules

AI KHÔNG được:
- Tạo Finance module.
- Tạo Authentication.
- Tạo database schema nghiệp vụ.
- Thêm Redis/MinIO/OpenSearch nếu chưa có requirement.
- Tự ý đổi architecture.
- Tạo microservices.

AI CHỈ được xây foundation repository trong phạm vi F0.

---

## 12. Output

Sau F0 phải có một repository sạch, có thể tiếp tục F1 và F2 mà không cần đổi cấu trúc root.
