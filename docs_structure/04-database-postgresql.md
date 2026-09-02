# Database — PostgreSQL

## Mục tiêu
PostgreSQL là relational source of truth cho dữ liệu nghiệp vụ.

## ORM
Entity Framework Core.

## Nguyên tắc
- Mọi schema change dùng migration.
- Foreign key rõ ràng.
- Unique constraint cho business uniqueness.
- Index theo query thực tế.
- Không lạm dụng repository pattern.
- Không lưu file lớn trong database.
- Soft delete chỉ dùng khi nghiệp vụ cần audit/history.
- Timestamps phải nhất quán.

## Domain groups
### Identity
users, roles, permissions, refresh_tokens.

### Finance
financial_accounts, categories, transactions, budgets, goals, recurring_transactions.

### Personnel
soldiers, ranks, positions, assignments, documents.

### Training
training_programs, subjects, sessions, attendance, results, evaluations.

### Manual
manual_documents, manual_sections, categories, tags, bookmarks, attachments.

### Platform
notifications, audit_logs, jobs metadata nếu cần.

## IDs
Có thể dùng UUID/ULID cho entity public-facing để giảm khả năng đoán ID.
Không expose sequential internal identifiers nếu có rủi ro.

## Pagination
Ưu tiên cursor pagination cho dataset lớn; offset pagination chấp nhận được cho dataset nhỏ/admin.

## Search
Giai đoạn đầu:
- PostgreSQL full-text search.
- pg_trgm nếu cần fuzzy search.

Khi quy mô/search requirement tăng:
- OpenSearch/Elasticsearch có thể được bổ sung.

## Vector
pgvector dùng cho semantic search/RAG.
Embedding metadata phải gắn với document/chunk/version để tránh trả kết quả từ tài liệu cũ.
