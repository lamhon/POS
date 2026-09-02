# MapNode — AI Context Index

## Mục tiêu
MapNode là lớp metadata giúp AI tìm đúng context thay vì đọc toàn repository.

## Mỗi node nên mô tả
- id.
- path.
- type.
- purpose.
- module.
- dependencies.
- dependents.
- public APIs.
- entities.
- related docs.
- risk level.
- last updated.

## Ví dụ
```yaml
id: finance.transactions
path: apps/api/src/Modules/Finance/Transactions
type: feature
module: Finance
depends_on:
  - identity.authorization
  - finance.accounts
related_docs:
  - docs/06-finance-module.md
risk: medium
```

## MapNode update
Khi thay đổi:
- file.
- API.
- entity.
- dependency.
- module relationship.

AI/tooling phải cập nhật node tương ứng.

## Quy tắc
MapNode không thay thế source code.
MapNode chỉ là index/context summary.
Nếu MapNode mâu thuẫn code, code + tests là source of truth; sau đó phải sửa MapNode.

## Future automation
Có thể tự động generate:
- dependency graph.
- changed nodes từ git diff.
- AI context bundle.
- architecture impact report.
