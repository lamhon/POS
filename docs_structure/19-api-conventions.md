# API Conventions

## Base
Ví dụ:
```text
/api/v1/finance/transactions
/api/v1/training/sessions
/api/v1/manual/documents
```

## HTTP
GET: read.
POST: create/action.
PUT/PATCH: update.
DELETE: delete/archive.

## Response
Success response phải nhất quán.
List response nên có:
```json
{
  "items": [],
  "page": 1,
  "pageSize": 20,
  "total": 100
}
```

## Errors
Dùng ProblemDetails hoặc cấu trúc tương thích RFC 7807.
Validation errors phải chỉ rõ field khi có thể.

## Idempotency
POST tạo resource hoặc operation tài chính quan trọng có thể hỗ trợ Idempotency-Key.

## Versioning
Breaking changes phải có API version strategy.
Không âm thầm thay đổi response contract đang được sử dụng.
