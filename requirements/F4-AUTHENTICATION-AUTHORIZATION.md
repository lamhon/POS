# F4 — Authentication & Authorization

## 1. Mục tiêu

F4 triển khai Identity/Security foundation cho Personal OS sau F0–F3.

Phạm vi:
- User registration
- Login/logout
- Password hashing
- Access token
- Refresh token
- Session management
- Role
- Permission
- Authorization policy
- Protected API
- Protected frontend routes
- Current-user endpoint
- Security logging/audit foundation

Không triển khai business logic của Finance, Personnel, Training hoặc Military Manual.

> Theo roadmap hiện tại, F3 là Database Foundation và F4 là Authentication & Authorization.

---

## 2. Context bắt buộc AI đọc

```text
00-README.md
01-system-overview.md
03-backend-aspnetcore.md
04-database-postgresql.md
05-auth-authorization.md
14-security.md
18-coding-rules.md
19-api-conventions.md
20-project-structure.md
22-ai-development-protocol.md
23-mapnode.md

F0-REPOSITORY-INITIALIZATION.md
F1-FRONTEND-BOOTSTRAP.md
F2-BACKEND-BOOTSTRAP.md
F3-DATABASE-FOUNDATION.md
```

AI phải inspect code hiện tại trước khi chỉnh sửa và không tạo duplicate auth system.

---

## 3. Authentication Flow

```text
Browser
  ↓
Next.js
  ↓
Login API
  ↓
ASP.NET Core Authentication
  ↓
PostgreSQL
```

Authenticated request:

```text
Browser
  ↓
Session/Credential
  ↓
ASP.NET Core
  ↓
Authentication
  ↓
Authorization
  ↓
Application
```

---

## 4. Identity Model

Tối thiểu:

```text
User
Role
Permission
UserRole
RolePermission
RefreshToken / Session
```

Tuân thủ F3:
- UUID.
- UTC timestamps.
- snake_case.
- FK/unique constraints.
- EF Core migration.
- Không plaintext password.

---

## 5. User

Tối thiểu:

```text
Id
Email
NormalizedEmail
PasswordHash
DisplayName
Status
CreatedAt
UpdatedAt
CreatedBy
UpdatedBy
```

Có thể có:

```text
EmailVerifiedAt
LastLoginAt
```

nếu requirement cần.

Không trả `PasswordHash` trong API.

---

## 6. User Status

Dùng state rõ ràng, ví dụ:

```text
ACTIVE
INACTIVE
LOCKED
PENDING
```

State chính thức phải được thống nhất trong codebase.

---

## 7. Password Security

Password phải được hash bằng framework/library chuẩn.

Không dùng:

```text
MD5
SHA1
SHA256(password)
```

Không tự phát minh hashing algorithm.

Không log password.

Không lưu plaintext password.

---

## 8. Login

Endpoint:

```text
POST /api/v1/auth/login
```

Request:

```json
{
  "email": "user@example.com",
  "password": "..."
}
```

Response không được chứa password/password hash.

Login failure không được leak thông tin cho phép user enumeration.

---

## 9. Token Strategy

Khuyến nghị:

```text
Short-lived Access Token
+
Longer-lived Refresh Token
```

Access token dùng cho API authorization.

Refresh token dùng để cấp access token mới.

Lifetime phải configurable.

Không hard-code secret/lifetime nhạy cảm.

---

## 10. Refresh Token

Refresh token cần:

```text
Id
UserId
TokenHash
ExpiresAt
CreatedAt
RevokedAt
ReplacedByTokenId
```

Nếu architecture cho phép, database chỉ lưu hash của refresh token.

Refresh token phải:
- Có entropy cao.
- Có expiry.
- Có revoke state.
- Có rotation.

---

## 11. Refresh Rotation

Flow:

```text
Old Refresh Token
      ↓
Validate
      ↓
Revoke old
      ↓
Create new refresh token
      ↓
Create new access token
```

Refresh token đã revoke mà tiếp tục được sử dụng phải được xử lý như potential token reuse/replay.

Không cho refresh token sử dụng vô hạn.

---

## 12. Logout

Endpoint concept:

```text
POST /api/v1/auth/logout
```

Logout phải revoke refresh session/token.

Không cần cố revoke mọi JWT access token nếu hệ thống dùng short-lived stateless access token; security design phải document rõ.

---

## 13. Current User

Endpoint:

```text
GET /api/v1/auth/me
```

Có thể trả:

```text
id
email
displayName
roles
permissions
```

Không trả:

```text
passwordHash
refreshToken
security secrets
```

---

## 14. JWT Claims

Nếu dùng JWT, chỉ đưa claims cần thiết:

```text
sub
email
roles
jti
iat
exp
```

Permissions chỉ đưa vào token nếu thực sự cần và có chiến lược refresh khi permission thay đổi.

Không đưa business data hoặc sensitive data vào JWT.

Signing key phải lấy từ secure configuration.

---

## 15. Authorization

Phân biệt:

```text
Authentication = Who are you?
Authorization  = What can you do?
```

Model:

```text
User
 ↓
Role
 ↓
Permission
```

Role là tập permissions, không phải authorization logic rải rác.

---

## 16. Permission Convention

Format:

```text
<module>.<resource>.<action>
```

Ví dụ:

```text
finance.account.read
finance.account.create
finance.transaction.read
finance.transaction.create

personnel.read
personnel.update

training.session.read
training.session.create

manual.document.read
manual.document.create
```

Không dùng permission mơ hồ như:

```text
ACCESS
CAN_DO_THING
ADMIN
```

---

## 17. Role

Có thể bắt đầu:

```text
ADMIN
USER
```

Nhưng endpoint nên authorization bằng policy/permission thay vì:

```text
if role == ADMIN
```

rải rác trong code.

---

## 18. API Authorization

Ví dụ:

```text
GET  /finance/accounts
→ finance.account.read

POST /finance/accounts
→ finance.account.create
```

Authorization phải được enforce ở backend trước business operation.

Ẩn button ở frontend không phải security.

---

## 19. Frontend Auth

Frontend cần trạng thái:

```text
loading
authenticated
unauthenticated
```

Không lưu password trong state.

Không lưu sensitive token vào localStorage/sessionStorage nếu architecture có thể sử dụng HttpOnly cookie/session an toàn hơn.

Nếu dùng client-side access token, phải document threat model.

---

## 20. Protected Routes

Protected:

```text
/dashboard
/finance
/personnel
/training
/manual
/tasks
/settings
```

Public:

```text
/login
/register
/forgot-password
```

Exact route guard phải phù hợp Next.js App Router architecture.

---

## 21. API Client 401 Flow

```text
Request
  ↓
401
  ↓
Attempt refresh
  ↓
Success → retry original request
  ↓
Failure → clear session → /login
```

Không tạo infinite refresh loop.

Không retry login vô hạn.

---

## 22. Cookie / CSRF

Nếu dùng cookie:

```text
HttpOnly
Secure
SameSite
```

phải được cấu hình phù hợp production.

Nếu cookie authentication có CSRF risk, phải có CSRF protection.

CORS không thay thế CSRF protection.

---

## 23. Brute Force

Login phải có protection strategy:

- Rate limiting.
- Failed-login monitoring.
- Lockout nếu requirement phù hợp.

Không tạo lockout dễ bị abuse để attacker khóa tài khoản người khác.

Parameters phải configurable.

---

## 24. Password Reset

Có thể tạo foundation cho:

```text
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
```

Chỉ triển khai email delivery khi email infrastructure đã được định nghĩa.

Reset token phải:
- One-time.
- Expiring.
- High entropy.
- Không log raw token.

Không tạo fake email service.

---

## 25. Error Handling

Không leak:

```text
password
password hash
token
secret
stack trace
database internals
```

Convention:

```text
401 = unauthenticated
403 = authenticated but forbidden
400/422 = invalid request
```

theo API convention của project.

---

## 26. Audit / Logging

Có thể log/audit:

```text
login success
login failure
logout
refresh
refresh reuse detection
password change
password reset
role change
```

Không log:
- Password.
- Access token.
- Refresh token.
- Secret.

---

## 27. Testing

Backend:

```text
Register
Login success
Login failure
/me
Refresh success
Refresh expired
Refresh revoked
Logout
Unauthorized request
Forbidden request
Role/permission policy
Password hashing
```

Frontend:

```text
Unauthenticated redirect
Authenticated access
Login validation
401 refresh
Session expiration
Logout
```

Integration tests dùng test PostgreSQL.

---

## 28. Acceptance Criteria

- [ ] Registration hoạt động nếu được bật.
- [ ] Password hashing an toàn.
- [ ] Login hoạt động.
- [ ] Access token/session hoạt động.
- [ ] Refresh token hoạt động.
- [ ] Refresh rotation/revocation hoạt động.
- [ ] Logout hoạt động.
- [ ] `/auth/me` hoạt động.
- [ ] Protected API hoạt động.
- [ ] Role/permission hoạt động.
- [ ] Protected frontend routes hoạt động.
- [ ] 401/403 đúng.
- [ ] Không plaintext password.
- [ ] Không log token/password.
- [ ] Tests pass.
- [ ] Migrations pass.
- [ ] Docs + MapNode updated.

---

## 29. AI Rules

AI không được:
- Tự phát minh authentication protocol.
- Lưu plaintext password.
- Commit secret.
- Đưa sensitive data vào JWT.
- Chỉ bảo vệ frontend route.
- Hard-code ADMIN checks khắp code.
- Đưa auth logic vào Controller.
- Bỏ qua 401/403.
- Tạo fake email service.
- Implement business modules trong F4.

---

## 30. Definition of Done

```text
User
 ↓
Login
 ↓
Authenticated Session
 ↓
Protected API
 ↓
Permission
 ↓
Application
```

hoạt động end-to-end.

Identity schema được quản lý bằng EF Core migrations.

Sau F4, Finance/Personnel/Training/Manual có thể sử dụng security boundary thống nhất.
