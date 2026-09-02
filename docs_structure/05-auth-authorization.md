# Authentication & Authorization

## Mục tiêu
Bảo vệ toàn bộ Personal OS bằng authentication và authorization ở backend.

## Authentication
Đề xuất:
- ASP.NET Core Identity.
- Short-lived access token.
- Refresh token rotation.
- HTTPS bắt buộc ở production.

## Authorization
RBAC + permission-based authorization.

Ví dụ:
```text
finance.read
finance.write
finance.delete
training.read
training.manage
personnel.read
personnel.manage
manual.read
manual.manage
```

Role chỉ là nhóm permission:
```text
Admin
Manager
Instructor
Member
```

Không hard-code role checks ở quá nhiều nơi nếu permission policy có thể biểu diễn tốt hơn.

## Frontend
Frontend chỉ dùng authorization để ẩn/hiện UX.
Backend luôn kiểm tra permission trước khi thực hiện use case.

## Token security
- Không log access/refresh token.
- Refresh token phải có revoke/rotation.
- Logout phải revoke refresh token.
- Secret nằm trong environment/secret manager.
- Không commit secrets.

## Password
Dùng password hashing của ASP.NET Core Identity.
Không tự viết hashing algorithm.

## Audit
Các action nhạy cảm nên ghi audit:
- Login/security changes.
- User permission changes.
- Personnel data changes.
- Training result changes.
- Manual document publication/deletion.
