# Storage, Search & Cache

## Object Storage
Dùng MinIO local/self-hosted hoặc S3-compatible cloud.

Object naming:
```text
{module}/{entity}/{entityId}/{version}/{uuid}-{safe-name}
```

Không dùng filename người dùng làm unique key.

## File upload
Flow:
```text
Client
 -> API validates authorization
 -> Upload/storage service
 -> Virus/security validation nếu triển khai
 -> Object Storage
 -> DB metadata
```

## Redis
Redis dùng cho:
- cache.
- distributed lock.
- rate limiting.
- temporary state.

Không lưu dữ liệu nghiệp vụ duy nhất trong Redis.

## Cache strategy
Cache-aside:
```text
Read -> Cache
       miss -> DB -> Cache
Write -> DB -> invalidate/update cache
```

TTL phải có chủ đích.

## Search
Bắt đầu bằng PostgreSQL FTS.
Chỉ thêm OpenSearch khi:
- dữ liệu lớn.
- query phức tạp.
- cần ranking/search analytics nâng cao.

## pgvector
Dùng cho semantic search/RAG.
Không thay thế relational query.
