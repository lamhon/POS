# Security Requirements

## Principles
- Least privilege.
- Defense in depth.
- Server-side authorization.
- Secure defaults.
- Secrets never in source control.

## API
- HTTPS production.
- Authentication.
- Authorization.
- Input validation.
- Rate limiting cho endpoint nhạy cảm.
- Consistent error handling.
- Không leak stack trace production.

## Data
- Encrypt transport.
- Backup database.
- Secrets trong environment/secret manager.
- Không log sensitive data.

## File
- Validate MIME/type/size.
- Sanitize filename.
- Randomize object key.
- Authorization khi download.
- Không expose bucket public nếu không cần.

## Frontend
- Không lưu secret trong client bundle.
- Không coi hidden UI là authorization.
- Escape/render user content an toàn.

## Audit
Audit event gồm:
- actor.
- action.
- entity.
- entityId.
- timestamp.
- correlation/request ID.
- before/after summary khi phù hợp.

## Sensitive military data
Áp dụng access control chặt, audit và data minimization.
Không gửi dữ liệu restricted vào external AI provider nếu chưa có policy/authorization rõ ràng.
