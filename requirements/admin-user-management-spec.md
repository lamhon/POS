# ADMIN USER MANAGEMENT SPECIFICATION

> Tài liệu đặc tả chức năng màn hình **Quản trị → Quản lý User**.
>
> Mục tiêu: giúp AI, Developer, BA, QA hoặc công cụ sinh code hiểu rõ yêu cầu nghiệp vụ, UI, API, dữ liệu, quyền hạn và tiêu chí nghiệm thu.
>
> Ngôn ngữ nghiệp vụ: Tiếng Việt  
> Tên kỹ thuật: English  
> Module: `admin-user-management`

---

# 1. Mục tiêu hệ thống

Module `admin-user-management` cho phép quản trị viên quản lý toàn bộ vòng đời tài khoản người dùng trên website.

Các nhóm chức năng chính:

1. Xem danh sách user.
2. Tìm kiếm, lọc, sắp xếp và phân trang.
3. Xem chi tiết một user.
4. Chỉnh sửa thông tin user.
5. Quản lý trạng thái tài khoản.
6. Quản lý role và permission.
7. Hỗ trợ reset mật khẩu.
8. Quản lý session đăng nhập.
9. Xem lịch sử hoạt động.
10. Quản lý report/vi phạm.
11. Gửi cảnh báo/thông báo.
12. Thực hiện thao tác hàng loạt.
13. Xem thống kê user.
14. Ghi nhận Audit Log cho mọi hành động quan trọng.

---

# 2. Phạm vi

## 2.1. Trong phạm vi

Module này bao gồm:

- Admin Dashboard liên quan đến user.
- User List.
- User Detail.
- Role & Permission.
- Account Status.
- Authentication Support.
- Session Management.
- User Activity.
- Reports & Violations.
- Notifications.
- Bulk Actions.
- Audit Logs.

## 2.2. Ngoài phạm vi

Không bao gồm:

- Quản lý nội dung chi tiết của website nếu không liên quan trực tiếp tới user.
- Quản lý payment đầy đủ.
- Quản lý sản phẩm.
- Quản lý đơn hàng.
- Quản lý CMS.
- Quản lý email marketing toàn hệ thống.

Các module bên ngoài có thể được liên kết từ User Detail nếu website có các nghiệp vụ tương ứng.

---

# 3. Actor

## 3.1. `SUPER_ADMIN`

Quyền cao nhất.

Có thể:

- Xem toàn bộ user.
- Tạo user.
- Chỉnh sửa user.
- Khóa/mở khóa user.
- Xóa/khôi phục user.
- Gán role.
- Gán quyền.
- Quản lý tài khoản Admin.
- Thực hiện thao tác hàng loạt.
- Xem audit log.
- Thu hồi session.
- Gửi reset password.
- Xem report.
- Gửi cảnh báo.

## 3.2. `ADMIN`

Có thể:

- Xem user.
- Chỉnh sửa user thông thường.
- Khóa/mở khóa user.
- Xem hoạt động.
- Xem report.
- Reset password.
- Thu hồi session.
- Gửi cảnh báo.

Không mặc định được:

- Tạo hoặc sửa `SUPER_ADMIN`.
- Nâng user thành `SUPER_ADMIN`.
- Xóa `SUPER_ADMIN`.
- Thay đổi quyền hệ thống cấp cao.

## 3.3. `MODERATOR`

Có thể được cho phép:

- Xem user cơ bản.
- Xem report.
- Cảnh báo user.
- Tạm khóa user.
- Xóa nội dung vi phạm.

Không được:

- Quản lý role hệ thống.
- Quản lý admin.
- Xóa vĩnh viễn user.
- Sửa dữ liệu nhạy cảm.

## 3.4. `USER`

Không được truy cập màn hình Admin.

---

# 4. Permission Model

Khuyến nghị sử dụng RBAC.

## 4.1. Permission codes

```text
users.view
users.create
users.update
users.delete
users.restore
users.lock
users.unlock
users.change_role
users.view_activity
users.view_sessions
users.revoke_session
users.reset_password
users.view_reports
users.resolve_reports
users.send_notification
users.bulk_update
users.export
audit_logs.view
roles.view
roles.manage
admins.manage
```

## 4.2. Ví dụ permission matrix

| Permission | User | Moderator | Admin | Super Admin |
|---|---:|---:|---:|---:|
| `users.view` | No | Yes | Yes | Yes |
| `users.update` | No | Limited | Yes | Yes |
| `users.lock` | No | Yes | Yes | Yes |
| `users.unlock` | No | Limited | Yes | Yes |
| `users.change_role` | No | No | Limited | Yes |
| `users.delete` | No | No | Limited | Yes |
| `users.view_activity` | No | Yes | Yes | Yes |
| `users.view_sessions` | No | No | Yes | Yes |
| `users.revoke_session` | No | No | Yes | Yes |
| `users.reset_password` | No | No | Yes | Yes |
| `users.view_reports` | No | Yes | Yes | Yes |
| `users.resolve_reports` | No | Yes | Yes | Yes |
| `users.send_notification` | No | Yes | Yes | Yes |
| `users.bulk_update` | No | No | Yes | Yes |
| `users.export` | No | No | Yes | Yes |
| `audit_logs.view` | No | No | Yes | Yes |
| `roles.manage` | No | No | No | Yes |
| `admins.manage` | No | No | No | Yes |

---

# 5. Navigation

```text
Admin
├── Dashboard
├── User Management
│   ├── User List
│   ├── User Detail
│   ├── Reports
│   └── Audit Logs
├── Roles & Permissions
└── Settings
```

URL gợi ý:

```text
/admin/users
/admin/users/:userId
/admin/users/:userId/activity
/admin/users/:userId/sessions
/admin/users/:userId/reports
/admin/audit-logs
/admin/roles
```

---

# 6. User List Screen

## 6.1. Screen ID

```text
ADMIN_USER_LIST
```

## 6.2. Mục tiêu

Cho phép Admin:

- Xem danh sách user.
- Tìm nhanh user.
- Lọc dữ liệu.
- Sắp xếp.
- Chọn nhiều user.
- Thực hiện action.

---

# 7. User List Columns

Các cột mặc định:

| Field | Type | Required | Description |
|---|---|---:|---|
| `id` | UUID/String | Yes | ID user |
| `avatarUrl` | URL | No | Avatar |
| `fullName` | String | Yes | Họ tên |
| `username` | String | No | Username |
| `email` | String | Yes | Email |
| `role` | Enum | Yes | Role |
| `status` | Enum | Yes | Trạng thái |
| `emailVerified` | Boolean | Yes | Email đã xác minh |
| `createdAt` | Datetime | Yes | Ngày đăng ký |
| `lastLoginAt` | Datetime | No | Đăng nhập gần nhất |
| `actions` | UI | Yes | Các thao tác |

---

# 8. Search

## 8.1. Search field

Placeholder:

```text
Tìm theo tên, username, email, số điện thoại hoặc User ID
```

Có thể search theo:

- `id`
- `fullName`
- `username`
- `email`
- `phone`

## 8.2. Search behavior

- Debounce: `300-500ms`.
- Không phân biệt hoa thường.
- Trim whitespace.
- Có nút Clear.
- Khi search thay đổi, reset về page 1.

---

# 9. Filters

## 9.1. Filter theo role

```text
ALL
USER
MODERATOR
ADMIN
SUPER_ADMIN
```

## 9.2. Filter theo status

```text
ALL
ACTIVE
PENDING
SUSPENDED
LOCKED
DELETED
```

## 9.3. Filter verification

```text
ALL
VERIFIED
UNVERIFIED
```

## 9.4. Filter thời gian đăng ký

Hỗ trợ:

- Today.
- Last 7 days.
- Last 30 days.
- This month.
- Custom date range.

Fields:

```text
createdFrom
createdTo
```

## 9.5. Filter hoạt động

Có thể hỗ trợ:

```text
ACTIVE_LAST_24_HOURS
ACTIVE_LAST_7_DAYS
ACTIVE_LAST_30_DAYS
INACTIVE_30_DAYS
INACTIVE_90_DAYS
```

---

# 10. Sorting

Các field có thể sort:

```text
createdAt
updatedAt
fullName
email
lastLoginAt
status
role
```

Sort direction:

```text
asc
desc
```

Mặc định:

```text
sortBy=createdAt
sortDirection=desc
```

---

# 11. Pagination

Query parameters:

```text
page=1
pageSize=20
```

Page size options:

```text
20
50
100
```

Response cần có:

```json
{
  "page": 1,
  "pageSize": 20,
  "totalItems": 10240,
  "totalPages": 512
}
```

---

# 12. User Row Actions

Mỗi user có menu:

```text
Xem chi tiết
Chỉnh sửa
Khóa tài khoản
Mở khóa tài khoản
Đổi role
Gửi reset password
Đăng xuất khỏi tất cả thiết bị
Gửi cảnh báo
Xóa tài khoản
```

Action hiển thị theo:

- Permission của Admin hiện tại.
- Role của target user.
- Status hiện tại của target user.

Ví dụ:

- User đang `LOCKED` thì không hiển thị action `LOCK`.
- User đang `ACTIVE` thì không hiển thị action `UNLOCK`.
- Admin thường không được sửa `SUPER_ADMIN`.

---

# 13. User Detail Screen

## 13.1. Screen ID

```text
ADMIN_USER_DETAIL
```

## 13.2. Tabs

```text
Overview
Profile
Role & Permission
Activity
Sessions
Reports
Admin Logs
```

---

# 14. User Overview

Hiển thị:

```text
avatar
id
fullName
username
email
phone
role
status
emailVerified
phoneVerified
createdAt
updatedAt
lastLoginAt
```

Quick actions:

```text
Edit User
Lock / Unlock
Change Role
Reset Password
Revoke Sessions
Send Notification
Delete
```

---

# 15. User Profile Data Model

```json
{
  "id": "usr_123456",
  "fullName": "Nguyen Van A",
  "username": "nguyenvana",
  "email": "user@example.com",
  "phone": "+84901234567",
  "avatarUrl": "https://example.com/avatar.jpg",
  "dateOfBirth": "2000-01-01",
  "gender": "MALE",
  "role": "USER",
  "status": "ACTIVE",
  "emailVerified": true,
  "phoneVerified": false,
  "createdAt": "2026-08-01T10:00:00+07:00",
  "updatedAt": "2026-08-20T10:00:00+07:00",
  "lastLoginAt": "2026-08-20T09:30:00+07:00"
}
```

---

# 16. User Status

Enum:

```text
PENDING
ACTIVE
SUSPENDED
LOCKED
DELETED
```

## 16.1. `PENDING`

Tài khoản đã tạo nhưng chưa hoàn tất xác minh.

## 16.2. `ACTIVE`

Tài khoản hoạt động bình thường.

## 16.3. `SUSPENDED`

Tài khoản bị tạm đình chỉ.

Có thể có:

```text
suspendedUntil
suspensionReason
```

## 16.4. `LOCKED`

Tài khoản bị khóa.

Có thể:

- khóa có thời hạn;
- khóa vô thời hạn.

## 16.5. `DELETED`

Tài khoản đã bị soft delete.

---

# 17. Edit User

Admin có thể sửa:

```text
fullName
username
email
phone
avatar
dateOfBirth
gender
```

Các field tùy website có thể được bổ sung.

## 17.1. Validation

### Email

- Đúng định dạng email.
- Không trùng user khác.
- Trim whitespace.
- Lowercase trước khi compare.

### Username

- Unique.
- Min length đề xuất: 3.
- Max length đề xuất: 30.
- Chỉ cho phép ký tự hợp lệ theo rule hệ thống.

### Phone

- Đúng định dạng.
- Có thể unique nếu business yêu cầu.

## 17.2. Audit requirement

Phải ghi Audit Log nếu thay đổi:

```text
email
phone
role
status
```

---

# 18. Change Role

## 18.1. Action

```text
CHANGE_USER_ROLE
```

Form:

```text
Current role: USER
New role: [MODERATOR ▼]
Reason: [textarea]
```

## 18.2. Rules

- Không cho phép user tự nâng quyền chính mình nếu policy cấm.
- `ADMIN` không được tạo `SUPER_ADMIN`.
- Chỉ `SUPER_ADMIN` có quyền thay đổi role của Admin nếu hệ thống áp dụng policy nghiêm ngặt.
- Reason bắt buộc khi nâng role lên quyền cao.

## 18.3. Audit Log

Lưu:

```json
{
  "action": "USER_ROLE_CHANGED",
  "targetUserId": "usr_123",
  "before": {
    "role": "USER"
  },
  "after": {
    "role": "MODERATOR"
  },
  "reason": "Assigned as content moderator"
}
```

---

# 19. Lock User

## 19.1. Action

```text
LOCK_USER
```

Modal:

```text
Lý do:
- Spam
- Vi phạm điều khoản
- Gian lận
- Hành vi bất thường
- Theo yêu cầu user
- Khác

Thời gian:
- 24 giờ
- 7 ngày
- 30 ngày
- Vĩnh viễn

Thông báo cho user:
[x] Notification
[x] Email
```

Payload:

```json
{
  "reasonCode": "SPAM",
  "reasonText": "Spam repeated comments",
  "durationType": "DAYS",
  "durationValue": 7,
  "notifyUser": true
}
```

---

# 20. Unlock User

Action:

```text
UNLOCK_USER
```

Fields:

```text
reason
notifyUser
```

Sau khi unlock:

```text
status = ACTIVE
lockedUntil = null
lockReason = null
```

Tùy policy, có thể giữ lịch sử reason trong bảng riêng.

---

# 21. Suspend User

Action:

```text
SUSPEND_USER
```

Dùng khi cần tạm đình chỉ khác với lock bảo mật.

Fields:

```text
reason
suspendedUntil
notifyUser
```

---

# 22. Delete User

Khuyến nghị mặc định dùng Soft Delete.

## 22.1. Soft Delete

```text
status = DELETED
deletedAt = current_timestamp
deletedBy = adminId
```

Không xóa ngay record DB.

## 22.2. Confirmation

Modal phải hiển thị:

```text
Bạn có chắc chắn muốn xóa tài khoản này?

User: Nguyen Van A
Email: user@example.com

Nhập DELETE để xác nhận.
```

Các tài khoản quyền cao có thể yêu cầu confirmation mạnh hơn.

---

# 23. Restore User

Chỉ hiển thị nếu:

```text
status = DELETED
```

Action:

```text
RESTORE_USER
```

Kết quả mặc định:

```text
status = ACTIVE
deletedAt = null
deletedBy = null
```

---

# 24. Password Support

Admin không bao giờ được xem password của user.

Không lưu password plaintext.

Password phải được hash bằng thuật toán an toàn.

Các action hỗ trợ:

```text
SEND_PASSWORD_RESET
FORCE_PASSWORD_CHANGE
```

## 24.1. Send Password Reset

Flow:

1. Admin click `Gửi link đặt lại mật khẩu`.
2. System tạo reset token.
3. Token có expiration.
4. Email được gửi tới user.
5. Audit Log được tạo.

## 24.2. Force Password Change

Field:

```text
mustChangePassword = true
```

User được yêu cầu đổi mật khẩu sau lần đăng nhập tiếp theo.

---

# 25. Session Management

Tab:

```text
Sessions
```

Session data:

```json
{
  "id": "session_123",
  "device": "Chrome / Windows",
  "browser": "Chrome",
  "os": "Windows 11",
  "ipAddress": "203.0.113.10",
  "location": "Ho Chi Minh City",
  "createdAt": "2026-08-19T10:00:00+07:00",
  "lastActiveAt": "2026-08-20T14:00:00+07:00",
  "isCurrent": false
}
```

Actions:

```text
REVOKE_SESSION
REVOKE_ALL_SESSIONS
```

---

# 26. Revoke Session

Admin có thể revoke một session.

Confirmation:

```text
Thu hồi phiên đăng nhập này?
User sẽ bị đăng xuất khỏi thiết bị tương ứng.
```

---

# 27. Revoke All Sessions

Action:

```text
REVOKE_ALL_USER_SESSIONS
```

Use cases:

- Tài khoản bị nghi hack.
- User yêu cầu đăng xuất mọi thiết bị.
- Admin reset bảo mật.
- User bị khóa.

Policy đề xuất:

Khi lock user:

```text
revokeAllSessions = true
```

---

# 28. Login Security Information

Có thể hiển thị:

```text
lastLoginAt
lastLoginIp
lastLoginDevice
failedLoginCount
lastFailedLoginAt
```

Nếu hệ thống có risk detection:

```text
riskLevel
suspiciousLoginDetected
```

Không nên hiển thị dữ liệu vượt quá nhu cầu nghiệp vụ.

---

# 29. Activity Log

Tab:

```text
Activity
```

Mục đích:

Xem lịch sử hành vi của user.

Ví dụ event:

```text
USER_LOGIN
USER_LOGOUT
PROFILE_UPDATED
POST_CREATED
POST_UPDATED
POST_DELETED
COMMENT_CREATED
COMMENT_DELETED
ORDER_CREATED
BOOKING_CREATED
REPORT_RECEIVED
PASSWORD_CHANGED
```

Data example:

```json
{
  "id": "activity_123",
  "userId": "usr_123",
  "type": "POST_CREATED",
  "entityType": "POST",
  "entityId": "post_456",
  "createdAt": "2026-08-20T13:25:00+07:00",
  "metadata": {}
}
```

---

# 30. Reports & Violations

Tab:

```text
Reports
```

Report fields:

```text
id
targetUserId
reporterUserId
reasonCode
description
status
createdAt
resolvedAt
resolvedBy
resolution
```

Status:

```text
OPEN
UNDER_REVIEW
RESOLVED
REJECTED
```

Reason:

```text
SPAM
HARASSMENT
ABUSE
FRAUD
IMPERSONATION
INAPPROPRIATE_CONTENT
OTHER
```

---

# 31. Report Actions

Admin/Moderator có thể:

```text
VIEW_REPORT
MARK_UNDER_REVIEW
REJECT_REPORT
WARN_USER
DELETE_RELATED_CONTENT
SUSPEND_USER
LOCK_USER
RESOLVE_REPORT
```

Resolution example:

```json
{
  "status": "RESOLVED",
  "resolution": "USER_WARNED",
  "note": "First violation"
}
```

---

# 32. Warning User

Action:

```text
WARN_USER
```

Form:

```text
Warning Type
Title
Message
Related Report ID
Send via Notification
Send via Email
```

Payload:

```json
{
  "type": "COMMUNITY_GUIDELINE_WARNING",
  "title": "Vi phạm quy định cộng đồng",
  "message": "Bình luận của bạn đã vi phạm quy định.",
  "channels": [
    "IN_APP",
    "EMAIL"
  ]
}
```

---

# 33. Notifications

Admin có thể gửi notification tới một user.

Fields:

```text
title
message
channel
type
```

Channels:

```text
IN_APP
EMAIL
SMS
```

Chỉ bật channel mà hệ thống hỗ trợ.

---

# 34. Bulk Actions

Admin có thể select nhiều user.

Supported actions:

```text
BULK_LOCK
BULK_UNLOCK
BULK_CHANGE_ROLE
BULK_SEND_NOTIFICATION
BULK_EXPORT
```

Không khuyến nghị bật `BULK_DELETE` mặc định.

Nếu có:

- Yêu cầu quyền đặc biệt.
- Confirmation mạnh.
- Giới hạn số lượng mỗi lần.

---

# 35. Bulk Action Limits

Đề xuất:

```text
maxSelectedUsers = 100
```

Nếu lớn hơn:

- Dùng asynchronous job ở backend.
- UI nhận `jobId`.
- Có trang xem trạng thái export/bulk process.

---

# 36. User Dashboard Metrics

Các KPI đề xuất:

```text
totalUsers
newUsersToday
newUsersThisMonth
activeUsers
lockedUsers
suspendedUsers
unverifiedUsers
deletedUsers
```

Nếu có analytics:

```text
DAU
WAU
MAU
retentionRate
activationRate
```

---

# 37. Dashboard Cards

Ví dụ:

```text
Tổng User
User mới hôm nay
Active
Bị khóa
Chưa xác minh
```

Chart có thể có:

```text
New users by day
Active users by day
User status distribution
Role distribution
```

---

# 38. Audit Log

Mọi hành động quản trị quan trọng phải được log.

## 38.1. Audit fields

```text
id
adminUserId
adminRole
action
targetType
targetId
before
after
reason
ipAddress
userAgent
createdAt
```

---

# 39. Audit Actions

Ví dụ:

```text
USER_CREATED
USER_UPDATED
USER_LOCKED
USER_UNLOCKED
USER_SUSPENDED
USER_DELETED
USER_RESTORED
USER_ROLE_CHANGED
PASSWORD_RESET_SENT
PASSWORD_CHANGE_FORCED
SESSION_REVOKED
ALL_SESSIONS_REVOKED
USER_WARNED
REPORT_RESOLVED
BULK_ACTION_EXECUTED
```

---

# 40. Audit Example

```json
{
  "id": "audit_001",
  "adminUserId": "admin_01",
  "adminRole": "ADMIN",
  "action": "USER_ROLE_CHANGED",
  "targetType": "USER",
  "targetId": "usr_123",
  "before": {
    "role": "USER"
  },
  "after": {
    "role": "MODERATOR"
  },
  "reason": "Assigned moderation responsibility",
  "ipAddress": "203.0.113.100",
  "createdAt": "2026-08-20T14:10:00+07:00"
}
```

---

# 41. Suggested Database Tables

## 41.1. `users`

```text
id
email
username
password_hash
full_name
phone
avatar_url
date_of_birth
gender
role_id
status
email_verified_at
phone_verified_at
must_change_password
last_login_at
created_at
updated_at
deleted_at
```

## 41.2. `roles`

```text
id
code
name
description
created_at
updated_at
```

## 41.3. `permissions`

```text
id
code
name
description
```

## 41.4. `role_permissions`

```text
role_id
permission_id
```

## 41.5. `user_sessions`

```text
id
user_id
token_hash
device
browser
os
ip_address
last_active_at
expires_at
revoked_at
created_at
```

## 41.6. `user_status_history`

```text
id
user_id
old_status
new_status
reason
changed_by
expires_at
created_at
```

## 41.7. `user_reports`

```text
id
reporter_user_id
target_user_id
reason_code
description
status
resolution
resolved_by
resolved_at
created_at
```

## 41.8. `user_warnings`

```text
id
user_id
type
title
message
created_by
created_at
```

## 41.9. `audit_logs`

```text
id
admin_user_id
action
target_type
target_id
before_data
after_data
reason
ip_address
user_agent
created_at
```

---

# 42. Suggested API Endpoints

Base:

```text
/api/admin
```

---

# 43. Get Users

```http
GET /api/admin/users
```

Query:

```text
search
role
status
verified
createdFrom
createdTo
sortBy
sortDirection
page
pageSize
```

Example:

```http
GET /api/admin/users?search=nguyen&status=ACTIVE&page=1&pageSize=20
```

---

# 44. Get User Detail

```http
GET /api/admin/users/:userId
```

---

# 45. Update User

```http
PATCH /api/admin/users/:userId
```

Body example:

```json
{
  "fullName": "Nguyen Van B",
  "phone": "+84909999999"
}
```

---

# 46. Change Role API

```http
PATCH /api/admin/users/:userId/role
```

```json
{
  "role": "MODERATOR",
  "reason": "Assigned moderation role"
}
```

---

# 47. Lock User API

```http
POST /api/admin/users/:userId/lock
```

```json
{
  "reasonCode": "SPAM",
  "reasonText": "Repeated spam",
  "lockedUntil": "2026-08-27T14:00:00+07:00",
  "notifyUser": true
}
```

---

# 48. Unlock User API

```http
POST /api/admin/users/:userId/unlock
```

```json
{
  "reason": "Issue resolved",
  "notifyUser": true
}
```

---

# 49. Delete User API

```http
DELETE /api/admin/users/:userId
```

Có thể yêu cầu:

```json
{
  "reason": "User deletion requested"
}
```

---

# 50. Restore User API

```http
POST /api/admin/users/:userId/restore
```

---

# 51. Password Reset API

```http
POST /api/admin/users/:userId/password-reset
```

---

# 52. Force Password Change API

```http
POST /api/admin/users/:userId/force-password-change
```

---

# 53. Session API

Get sessions:

```http
GET /api/admin/users/:userId/sessions
```

Revoke one:

```http
DELETE /api/admin/users/:userId/sessions/:sessionId
```

Revoke all:

```http
DELETE /api/admin/users/:userId/sessions
```

---

# 54. Activity API

```http
GET /api/admin/users/:userId/activity
```

Query:

```text
type
from
to
page
pageSize
```

---

# 55. Reports API

```http
GET /api/admin/users/:userId/reports
```

Resolve:

```http
PATCH /api/admin/reports/:reportId
```

---

# 56. Send Notification API

```http
POST /api/admin/users/:userId/notifications
```

```json
{
  "title": "Account notice",
  "message": "Please verify your account information.",
  "channels": ["IN_APP", "EMAIL"]
}
```

---

# 57. Bulk API

```http
POST /api/admin/users/bulk-actions
```

Example:

```json
{
  "userIds": [
    "usr_1",
    "usr_2",
    "usr_3"
  ],
  "action": "LOCK",
  "payload": {
    "reasonCode": "SPAM",
    "reasonText": "Mass spam accounts"
  }
}
```

---

# 58. Audit Log API

```http
GET /api/admin/audit-logs
```

Query:

```text
adminUserId
action
targetId
from
to
page
pageSize
```

---

# 59. API Response Format

Success:

```json
{
  "success": true,
  "data": {},
  "message": null
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found",
    "details": {}
  }
}
```

---

# 60. Common Error Codes

```text
UNAUTHORIZED
FORBIDDEN
USER_NOT_FOUND
EMAIL_ALREADY_EXISTS
USERNAME_ALREADY_EXISTS
INVALID_STATUS_TRANSITION
CANNOT_MODIFY_SUPER_ADMIN
CANNOT_MODIFY_SELF
INVALID_ROLE
INVALID_PERMISSION
SESSION_NOT_FOUND
REPORT_NOT_FOUND
VALIDATION_ERROR
RATE_LIMITED
INTERNAL_SERVER_ERROR
```

---

# 61. Status Transition Rules

Allowed examples:

```text
PENDING -> ACTIVE
PENDING -> LOCKED
ACTIVE -> SUSPENDED
ACTIVE -> LOCKED
ACTIVE -> DELETED
SUSPENDED -> ACTIVE
SUSPENDED -> LOCKED
LOCKED -> ACTIVE
LOCKED -> DELETED
DELETED -> ACTIVE
```

Không cho phép transition bất hợp lệ nếu không có nghiệp vụ cụ thể.

---

# 62. Confirmation Rules

Phải yêu cầu confirmation cho:

```text
LOCK_USER
DELETE_USER
CHANGE_ROLE_TO_ADMIN
CHANGE_ROLE_TO_SUPER_ADMIN
REVOKE_ALL_SESSIONS
BULK_LOCK
BULK_DELETE
```

Với action nguy hiểm, có thể yêu cầu nhập:

```text
LOCK
DELETE
CONFIRM
```

---

# 63. Security Requirements

## 63.1. Authentication

Admin phải đăng nhập.

## 63.2. Authorization

Mọi API phải kiểm tra permission ở backend.

Không chỉ ẩn button trên frontend.

## 63.3. Password

- Không trả `password_hash` qua API.
- Không log password.
- Không lưu password plaintext.

## 63.4. Sensitive data

Ẩn hoặc mask dữ liệu nếu role không đủ quyền.

Ví dụ:

```text
090****567
u***@example.com
```

nếu business yêu cầu.

## 63.5. Audit

Không cho phép Admin bình thường sửa/xóa Audit Log.

## 63.6. CSRF / XSS / Injection

Backend và frontend phải có protection phù hợp với framework.

---

# 64. Rate Limiting

Nên rate limit các action nhạy cảm:

```text
password reset
send notification
bulk actions
lock/unlock
export
```

---

# 65. Export User Data

Nếu có chức năng export:

Formats:

```text
CSV
XLSX
```

Có thể export:

```text
Current filtered result
Selected users
All eligible users
```

Không export:

```text
password_hash
security tokens
session tokens
sensitive secrets
```

---

# 66. Empty States

## User List Empty

```text
Không tìm thấy người dùng phù hợp.
```

Action:

```text
Xóa bộ lọc
```

## Reports Empty

```text
Người dùng này chưa có báo cáo vi phạm.
```

## Sessions Empty

```text
Không có phiên đăng nhập đang hoạt động.
```

---

# 67. Loading States

Các screen/API call phải có:

```text
loading
success
empty
error
```

UI không được hiển thị dữ liệu cũ như dữ liệu mới trong quá trình refresh nếu có nguy cơ gây nhầm.

---

# 68. Error States

Ví dụ:

```text
Không thể tải danh sách người dùng.
[Vui lòng thử lại]
```

Action thất bại:

```text
Không thể khóa tài khoản.
Lý do: Bạn không có quyền thực hiện thao tác này.
```

---

# 69. Toast Messages

Success examples:

```text
Cập nhật người dùng thành công.
Đã khóa tài khoản.
Đã mở khóa tài khoản.
Đã gửi email đặt lại mật khẩu.
Đã thu hồi phiên đăng nhập.
Đã thay đổi vai trò.
```

Error examples:

```text
Không thể cập nhật người dùng.
Email đã được sử dụng.
Bạn không có quyền thực hiện thao tác này.
```

---

# 70. UI Layout Proposal

```text
┌──────────────────────────────────────────────────────────────────┐
│ User Management                                      + Add User  │
├──────────────────────────────────────────────────────────────────┤
│ KPI Cards                                                        │
│ Total | New | Active | Locked | Unverified                       │
├──────────────────────────────────────────────────────────────────┤
│ Search                                                           │
│ Filters: Role | Status | Verification | Date                    │
├──────────────────────────────────────────────────────────────────┤
│ [ ] User     Email      Role      Status    Created     Action   │
│ [ ] ...                                                        ⋮ │
│ [ ] ...                                                        ⋮ │
├──────────────────────────────────────────────────────────────────┤
│ Pagination                                                       │
└──────────────────────────────────────────────────────────────────┘
```

---

# 71. User Detail Layout Proposal

```text
┌──────────────────────────────────────────────────────────────────┐
│ Avatar  Nguyen Van A                         ACTIVE              │
│         user@example.com                                         │
│                                                                  │
│ [Edit] [Lock] [Role] [Reset Password] [More]                    │
├──────────────────────────────────────────────────────────────────┤
│ Overview | Profile | Role | Activity | Sessions | Reports | Log │
├──────────────────────────────────────────────────────────────────┤
│ Tab Content                                                      │
└──────────────────────────────────────────────────────────────────┘
```

---

# 72. Accessibility

UI nên:

- Có label cho input.
- Không chỉ dùng màu để phân biệt trạng thái.
- Button có accessible name.
- Modal có focus trap.
- Keyboard navigation hoạt động.
- Table có header rõ ràng.
- Contrast đạt chuẩn phù hợp.

---

# 73. Responsive

Desktop là ưu tiên chính.

Tablet:

- Cho phép horizontal scroll table.
- Có thể collapse filter.

Mobile Admin nếu hỗ trợ:

- Chuyển table thành card list hoặc scroll.
- Sticky action bar.
- Không nhồi quá nhiều cột.

---

# 74. MVP Scope

Nếu cần triển khai nhanh, MVP gồm:

1. User List.
2. Search.
3. Filters.
4. Pagination.
5. User Detail.
6. Edit User.
7. Lock/Unlock.
8. Change Role.
9. Send Password Reset.
10. Soft Delete.
11. Audit Log.

---

# 75. Phase 2

Có thể bổ sung:

1. Login Sessions.
2. Report History.
3. User Activity.
4. Bulk Actions.
5. Export.
6. Dashboard charts.
7. Advanced security/risk detection.
8. User impersonation nếu policy cho phép.
9. Custom roles.
10. Fine-grained permission management.

---

# 76. Acceptance Criteria - User List

## AC-UL-001

Given Admin có `users.view`  
When truy cập `/admin/users`  
Then hệ thống hiển thị danh sách user.

## AC-UL-002

Given danh sách có hơn 20 user  
When page size = 20  
Then mỗi page hiển thị tối đa 20 user.

## AC-UL-003

Given Admin nhập email vào search  
When search hoàn tất  
Then hệ thống trả về các user phù hợp.

## AC-UL-004

Given filter `status=LOCKED`  
When áp dụng filter  
Then chỉ user có status `LOCKED` được hiển thị.

---

# 77. Acceptance Criteria - Edit User

## AC-EU-001

Given Admin có `users.update`  
When sửa `fullName` hợp lệ  
Then dữ liệu được cập nhật.

## AC-EU-002

Given Admin nhập email đã tồn tại  
When submit  
Then API trả `EMAIL_ALREADY_EXISTS`.

## AC-EU-003

Given Admin sửa email  
When update thành công  
Then Audit Log được tạo.

---

# 78. Acceptance Criteria - Lock User

## AC-LU-001

Given user đang `ACTIVE`  
And Admin có `users.lock`  
When Admin lock user  
Then status chuyển thành `LOCKED`.

## AC-LU-002

When user bị lock  
Then các session hiện tại được revoke nếu policy bật.

## AC-LU-003

When lock user thành công  
Then Audit Log phải chứa admin, target user, reason và thời gian.

---

# 79. Acceptance Criteria - Role

## AC-ROLE-001

Given Admin không có `roles.manage`  
When cố nâng user thành `SUPER_ADMIN`  
Then request bị từ chối với `FORBIDDEN`.

## AC-ROLE-002

Given Super Admin thay đổi role  
When thành công  
Then Audit Log chứa role trước và sau.

---

# 80. Acceptance Criteria - Password Reset

## AC-PR-001

When Admin gửi reset password  
Then hệ thống tạo reset token có expiry.

## AC-PR-002

Then email reset password được gửi.

## AC-PR-003

Then không có password plaintext trong response hoặc log.

---

# 81. Acceptance Criteria - Sessions

## AC-SESS-001

Given Admin có `users.view_sessions`  
When mở tab Sessions  
Then danh sách session được hiển thị.

## AC-SESS-002

When revoke một session  
Then session đó không thể tiếp tục authenticated request.

## AC-SESS-003

When revoke all sessions  
Then toàn bộ session đang hoạt động của user bị vô hiệu hóa.

---

# 82. Acceptance Criteria - Delete

## AC-DEL-001

When Admin soft delete user  
Then record user vẫn tồn tại trong DB.

## AC-DEL-002

Then:

```text
status = DELETED
deletedAt != null
```

## AC-DEL-003

Then user không thể đăng nhập.

---

# 83. Acceptance Criteria - Audit Log

## AC-AUD-001

Các action sau bắt buộc có audit:

```text
Update critical user data
Change role
Lock
Unlock
Suspend
Delete
Restore
Reset password
Revoke session
Resolve report
```

## AC-AUD-002

Audit record phải có tối thiểu:

```text
adminUserId
action
targetId
createdAt
```

---

# 84. AI Implementation Instructions

Khi AI sinh code dựa trên tài liệu này:

1. Không bỏ qua authorization backend.
2. Không hard-code quyền bằng frontend.
3. Không expose password hash.
4. Dùng pagination cho danh sách user.
5. Dùng soft delete mặc định.
6. Log mọi action quan trọng.
7. Các destructive action phải confirmation.
8. Chỉ render action user hiện tại có quyền dùng.
9. API error phải có error code ổn định.
10. Validation phải được làm ở backend dù frontend đã validate.
11. Status transition phải được kiểm tra.
12. Không cho Admin cấp thấp sửa user cấp cao hơn nếu policy không cho phép.
13. Tất cả timestamp phải có timezone hoặc dùng UTC nhất quán.
14. Không lưu raw session token nếu có thể dùng token hash.
15. Không log thông tin bí mật.

---

# 85. Suggested Frontend Component Tree

```text
AdminUsersPage
├── UserMetrics
├── UserSearchBar
├── UserFilters
├── BulkActionBar
├── UserTable
│   ├── UserRow
│   ├── UserStatusBadge
│   ├── UserRoleBadge
│   └── UserActionsMenu
└── Pagination
```

Detail:

```text
AdminUserDetailPage
├── UserHeader
├── UserQuickActions
├── UserTabs
│   ├── UserOverviewTab
│   ├── UserProfileTab
│   ├── UserRoleTab
│   ├── UserActivityTab
│   ├── UserSessionsTab
│   ├── UserReportsTab
│   └── UserAdminLogsTab
└── ConfirmationModals
```

---

# 86. Suggested Backend Service Structure

```text
UserAdminController
UserAdminService
UserRepository
RoleService
PermissionService
SessionService
ReportService
NotificationService
AuditLogService
```

Rule:

```text
Controller
    -> validate request
    -> check permission
    -> call service

Service
    -> enforce business rules
    -> update data
    -> create audit log
    -> trigger notification if needed
```

---

# 87. Non-functional Requirements

## Performance

- User list response mục tiêu: dưới 1 giây trong điều kiện bình thường.
- DB fields dùng cho search/filter cần index phù hợp.

Index gợi ý:

```text
users.email
users.username
users.status
users.role_id
users.created_at
users.last_login_at
```

## Reliability

Các action quan trọng phải đảm bảo transaction consistency.

Ví dụ lock user:

```text
update status
revoke sessions
write audit
```

Nếu nghiệp vụ yêu cầu atomic thì phải chạy transaction phù hợp.

## Observability

Backend cần:

```text
structured logs
error tracking
metrics
request id
```

---

# 88. Suggested Events

Nếu hệ thống dùng event-driven architecture:

```text
user.created
user.updated
user.locked
user.unlocked
user.deleted
user.restored
user.role_changed
user.password_reset_requested
user.sessions_revoked
user.warning_created
report.resolved
```

---

# 89. Example User Lock Event

```json
{
  "event": "user.locked",
  "version": 1,
  "data": {
    "userId": "usr_123",
    "reasonCode": "SPAM",
    "lockedBy": "admin_01",
    "lockedUntil": "2026-08-27T14:00:00+07:00"
  }
}
```

---

# 90. Definition of Done

Module được coi là hoàn thành khi:

- User list hoạt động.
- Search/filter/sort/pagination hoạt động.
- Admin xem được user detail.
- Admin sửa được thông tin theo permission.
- Lock/unlock hoạt động.
- Role update tuân thủ permission.
- Reset password hoạt động.
- Delete dùng soft delete.
- Sessions có thể revoke nếu nằm trong scope.
- Audit Log ghi đúng action.
- API có validation.
- API có authorization backend.
- Error handling rõ ràng.
- Destructive action có confirmation.
- Test permission đầy đủ.
- Không có password/token nhạy cảm trong response.
- Có test cho status transition.
- QA pass các acceptance criteria.

---

# 91. Priority Summary

## P0 - Bắt buộc

```text
User List
Search
Filter
Pagination
User Detail
Edit User
Lock / Unlock
Role Management
Reset Password
Soft Delete
Authorization
Audit Log
```

## P1 - Quan trọng

```text
Sessions
Activity
Reports
Warnings
Bulk Actions
Export
User Dashboard
```

## P2 - Nâng cao

```text
Advanced risk detection
Custom roles
Fine-grained permission editor
Security analytics
Advanced audit analytics
```

---

# 92. AI Context Summary

```yaml
module: admin-user-management

primary_actor:
  - SUPER_ADMIN
  - ADMIN

secondary_actor:
  - MODERATOR

core_entities:
  - User
  - Role
  - Permission
  - Session
  - Report
  - Warning
  - AuditLog

core_user_status:
  - PENDING
  - ACTIVE
  - SUSPENDED
  - LOCKED
  - DELETED

core_features:
  - list_users
  - search_users
  - filter_users
  - sort_users
  - paginate_users
  - view_user_detail
  - edit_user
  - change_role
  - lock_user
  - unlock_user
  - suspend_user
  - soft_delete_user
  - restore_user
  - send_password_reset
  - force_password_change
  - revoke_session
  - revoke_all_sessions
  - view_activity
  - manage_reports
  - warn_user
  - send_notification
  - bulk_actions
  - export_users
  - audit_logging

security_rules:
  - backend_authorization_required
  - never_expose_password_hash
  - never_store_plaintext_password
  - audit_sensitive_admin_actions
  - confirmation_for_destructive_actions
  - use_soft_delete_by_default
  - prevent_privilege_escalation
  - validate_status_transitions
```

---

# 93. Ghi chú cuối

Tài liệu này là baseline specification.

Khi triển khai thực tế cần điều chỉnh theo loại website, ví dụ:

- E-commerce: thêm Orders, Refunds, Addresses.
- Social network: thêm Posts, Comments, Followers, Reports.
- Booking: thêm Bookings, Payments.
- LMS: thêm Courses, Enrollments.
- SaaS: thêm Workspace, Subscription, Billing.
- Marketplace: thêm Seller status, Listings, Disputes.

Nguyên tắc chính của module quản trị User vẫn giữ nguyên:

```text
Identify
→ Search
→ Inspect
→ Modify
→ Control Access
→ Secure Account
→ Moderate
→ Audit
```
