# DevOps, Docker & CI/CD

## Local development
Docker Compose cung cấp:
- PostgreSQL.
- Redis.
- MinIO.
- Backend dependencies.

Frontend có thể chạy local để có hot reload.

## Environment
Tách:
- development.
- test.
- staging.
- production.

Không commit `.env` chứa secret.
Commit `.env.example`.

## Docker
Mỗi service có Dockerfile production-ready.
Dùng multi-stage build để giảm image size.

## CI
GitHub Actions pipeline:
```text
Checkout
 -> Restore dependencies
 -> Lint
 -> Typecheck
 -> Unit tests
 -> Integration tests
 -> Build
 -> Docker build
 -> Security checks
```

## Deployment
Có thể deploy:
- VPS + Docker Compose.
- Cloud container service.
- Kubernetes chỉ khi quy mô thực sự cần.

Không đưa Kubernetes vào MVP nếu chưa có requirement.
