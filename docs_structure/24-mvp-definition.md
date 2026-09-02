# MVP Definition

## Mục tiêu MVP
Có một hệ thống chạy end-to-end với authentication và một module nghiệp vụ hoàn chỉnh.

## MVP recommended
### Platform
- Login/logout.
- User profile.
- Role/permission.
- Dashboard shell.
- Error/loading UI.
- Audit foundation.

### Finance
- Accounts.
- Categories.
- Transactions.
- Basic monthly dashboard.

## Không đưa vào MVP
- Microservices.
- Kubernetes.
- OpenSearch nếu PostgreSQL đủ.
- AI/RAG.
- Complex notification infrastructure.
- Distributed architecture.

## Acceptance criteria
- User đăng nhập được.
- Authorization hoạt động server-side.
- Tạo/sửa/xóa transaction theo permission.
- Dashboard hiển thị dữ liệu thật từ PostgreSQL.
- Validation frontend + backend.
- Tests cho critical flow.
- Docker setup chạy được.
- CI build/test pass.
