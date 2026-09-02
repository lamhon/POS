# F5 — App Shell & Design System

## 1. Mục tiêu

F5 xây dựng authenticated application shell và Design System chung của Personal OS.

Phạm vi:

- Authenticated layout.
- Sidebar.
- Header.
- Navigation.
- Breadcrumb.
- User menu.
- Responsive layout.
- Theme.
- Design tokens.
- Shared UI components.
- Loading/empty/error states.
- Toast/notification foundation.
- Permission-aware navigation.
- Placeholder routes.

F5 không triển khai business CRUD của Finance, Personnel, Training hoặc Military Manual.

---

## 2. Context bắt buộc AI đọc

```text
00-README.md
01-system-overview.md
02-frontend-nextjs.md
11-theme.md
12-design-system.md
13-responsive.md
18-coding-rules.md
20-project-structure.md
22-ai-development-protocol.md
23-mapnode.md

F1-FRONTEND-BOOTSTRAP.md
F3-DATABASE-FOUNDATION.md
F4-AUTHENTICATION-AUTHORIZATION.md
```

AI phải inspect frontend trước khi tạo component.

---

## 3. Shell

```text
┌─────────────────────────────────────────────┐
│ Header                                      │
├───────────────┬─────────────────────────────┤
│ Sidebar       │ Breadcrumb                  │
│               ├─────────────────────────────┤
│ Dashboard     │ Page Content                │
│ Finance       │                             │
│ Personnel     │                             │
│ Training      │                             │
│ Manual        │                             │
│ Tasks         │                             │
│ Settings      │                             │
└───────────────┴─────────────────────────────┘
```

Next.js route groups:

```text
app/
├── (auth)/
│   ├── login/
│   └── register/
└── (dashboard)/
    ├── layout.tsx
    ├── dashboard/
    ├── finance/
    ├── personnel/
    ├── training/
    ├── manual/
    ├── tasks/
    └── settings/
```

`(dashboard)` không xuất hiện trong URL.

---

## 4. Navigation

Một source of truth cho navigation.

Navigation item:

```text
id
label
href
icon
permission?
order
```

Ví dụ:

```text
Dashboard
Finance
Personnel
Training
Military Manual
Tasks
Settings
```

Không hard-code navigation ở nhiều component.

---

## 5. Permission-aware Navigation

Frontend có thể ẩn item nếu user không có permission.

Nhưng:

> Navigation hiding không phải authorization.

Backend F4 vẫn phải enforce permission và trả `403` khi cần.

---

## 6. Sidebar

Phải hỗ trợ:

```text
Desktop
Collapsed
Mobile drawer
Active route
Nested navigation nếu cần
Permission-aware visibility
```

Không tạo sidebar riêng cho từng module.

---

## 7. Header

Tối thiểu:

```text
Logo/App name
Page title hoặc breadcrumb
Notification placeholder
User menu
```

User menu:

```text
Profile
Settings
Logout
```

Logout phải dùng auth abstraction của F4.

---

## 8. User Menu

Chỉ hiển thị:

```text
Display name
Email
Avatar/initials
Role summary
```

Không hiển thị:

```text
access token
refresh token
password
security secrets
```

---

## 9. Breadcrumb

Ví dụ:

```text
Home / Finance / Transactions
```

Breadcrumb nên derive từ route/config thay vì hard-code từng page.

Dynamic routes phải có human-readable label.

---

## 10. Page Layout

Chuẩn:

```text
PageHeader
├── Title
├── Description
└── Actions

PageContent
```

Business-specific actions chỉ xuất hiện ở module tương ứng.

---

## 11. Design System

Shared UI:

```text
Button
Input
Textarea
Select
Checkbox
Radio
Switch
DatePicker
Dialog
Drawer
Dropdown
Popover
Tooltip
Tabs
Card
Badge
Table
Pagination
Form
Alert
Toast
Skeleton
Spinner
EmptyState
ErrorState
ConfirmDialog
```

Không tạo wrapper component vô nghĩa.

---

## 12. Component Layers

```text
components/ui/
```

Primitive/design-system.

```text
components/layout/
```

Shell/layout.

```text
components/shared/
```

Cross-feature reusable.

```text
features/<feature>/
```

Business-specific.

Ví dụ `TransactionTable` thuộc:

```text
features/finance/
```

không thuộc `components/ui/`.

---

## 13. Design Tokens

Thống nhất:

```text
Colors
Typography
Spacing
Radius
Shadows
Breakpoints
Z-index
Motion
```

Không hard-code random values khi token đã có.

---

## 14. Theme

Hỗ trợ:

```text
Light
Dark
System
```

Theme preference phải persist theo architecture đã chọn.

Component phải hỗ trợ cả light/dark.

Không tạo màu riêng cho từng module.

---

## 15. Responsive

Desktop:

```text
Sidebar visible
```

Tablet:

```text
Sidebar compact
```

Mobile:

```text
Sidebar → Drawer
```

Table lớn phải có strategy:

```text
Horizontal scroll
Responsive columns
Alternative card/list
```

Không chỉ giảm width để gọi là responsive.

---

## 16. Accessibility

Shared components phải có:

- Semantic HTML.
- Keyboard navigation.
- Focus state.
- ARIA khi cần.
- Contrast.
- Screen-reader labels.
- Dialog focus management.
- Escape behavior.

Không dùng `div` thay `button` cho action.

---

## 17. Loading

Chuẩn hóa:

```text
Skeleton
Spinner
Loading button
Page loading
Table loading
```

Tránh layout shift.

Không khóa toàn app chỉ vì một API loading.

---

## 18. Empty State

Chuẩn:

```text
Icon
Title
Description
Primary action
```

Ví dụ:

```text
No transactions yet

Start tracking your first expense.

[Add transaction]
```

Không dùng `"No data"` cho mọi trường hợp.

---

## 19. Error State

Có:

```text
What happened
What user can do
Retry
```

Không hiển thị stack trace.

API errors phải đi qua frontend error abstraction.

---

## 20. Toast

Shared notification mechanism:

```text
Success
Info
Warning
Error
```

Không tạo toast riêng trong từng feature.

Toast không thay inline validation.

---

## 21. Confirm Dialog

Destructive actions sau này dùng:

```text
ConfirmDialog
```

Ví dụ:

```text
Delete
Archive
Revoke
Remove
```

Không dùng `window.confirm()` nếu Design System đã có dialog.

---

## 22. Placeholder Routes

Tạo:

```text
/dashboard
/finance
/personnel
/training
/manual
/tasks
/settings
```

Mỗi route phải có:

- Title.
- Description.
- Shell.
- Placeholder/empty state phù hợp.

Không tạo fake CRUD.

---

## 23. Dashboard

F5 chỉ tạo dashboard shell.

Có thể:

```text
Welcome
Quick navigation
Module cards
Recent activity placeholder
```

Không implement Finance analytics ở F5.

---

## 24. Auth Integration

```text
Unauthenticated
   ↓
/login

Authenticated
   ↓
/dashboard
```

Session expiration:

```text
API 401
   ↓
Refresh
   ↓
Success → continue
Failure → logout + /login
```

Không duplicate auth logic trong App Shell.

---

## 25. User Loading

Shell phải xử lý:

```text
Loading user
Authenticated
Unauthenticated
Error
```

Không render protected content trước khi auth state được xác định nếu route architecture yêu cầu guard.

---

## 26. State Rules

```text
Server state
→ TanStack Query

Global client state
→ Zustand khi thật sự cần

Local UI state
→ React state
```

Sidebar open/closed thường chỉ cần local/layout state.

Auth/session state dùng abstraction của F4.

---

## 27. Performance

- Server Components mặc định.
- Client Components chỉ khi cần.
- Không biến toàn bộ shell thành Client Component.
- Lazy-load heavy UI.
- Không import chart/editor vào mọi route.
- Tránh unnecessary re-render.
- Import icons hợp lý.

---

## 28. Testing

Component tests:

```text
Sidebar
Header
Navigation
UserMenu
Theme
Dialog
Toast
EmptyState
ErrorState
```

E2E:

```text
Login
→ Dashboard
→ Navigate Finance
→ Navigate Personnel
→ Logout
```

Kiểm tra:

```text
Desktop
Tablet
Mobile
```

và accessibility cho shared components.

---

## 29. Acceptance Criteria

### Shell

- [ ] Authenticated layout hoạt động.
- [ ] Sidebar hoạt động.
- [ ] Header hoạt động.
- [ ] Breadcrumb hoạt động.
- [ ] User menu hoạt động.
- [ ] Logout hoạt động.
- [ ] Protected routes hoạt động.

### Navigation

- [ ] Navigation có source of truth.
- [ ] Active route đúng.
- [ ] Permission-aware visibility.
- [ ] Mobile navigation hoạt động.

### Design System

- [ ] Shared primitives tồn tại.
- [ ] Theme tokens thống nhất.
- [ ] Light/Dark/System hoạt động.
- [ ] Loading/Empty/Error thống nhất.
- [ ] Dialog/Toast thống nhất.

### Responsive

- [ ] Desktop.
- [ ] Tablet.
- [ ] Mobile.

### Quality

- [ ] Typecheck pass.
- [ ] Lint pass.
- [ ] Build pass.
- [ ] Component tests pass.
- [ ] E2E auth/navigation pass.
- [ ] Không có accessibility lỗi nghiêm trọng.

---

## 30. AI Rules

AI không được:

- Tạo sidebar riêng cho module.
- Duplicate Button/Input/Table.
- Hard-code permission logic ở nhiều nơi.
- Coi frontend hiding là authorization.
- Biến toàn bộ shell thành Client Component.
- Tạo mock business data không cần thiết.
- Implement Finance/Personnel/Training/Manual business logic.
- Tạo design system riêng cho từng module.

Mọi shared component phải có responsibility rõ ràng.

---

## 31. Definition of Done

Sau F5:

```text
Login
  ↓
Authenticated App Shell
  ├── Dashboard
  ├── Finance
  ├── Personnel
  ├── Training
  ├── Manual
  ├── Tasks
  └── Settings
```

hoạt động như một ứng dụng thống nhất.

Module chưa triển khai chỉ hiển thị placeholder.

F5 phải đủ ổn định để F6 bắt đầu Finance MVP mà không thiết kế lại shell.

---

## 32. MapNode Update

Cập nhật:

```text
mapnode/index.yaml
mapnode/architecture/frontend.yaml
mapnode/architecture/design-system.yaml
```

Ví dụ:

```yaml
frontend:
  framework: nextjs
  router: app-router
  shell: authenticated-dashboard
  design_system: shared
  theme: light-dark-system
  responsive: desktop-tablet-mobile
  status: active
```

Chỉ ghi implementation thực tế.

---

## 33. Final AI Instruction

F5 là UX foundation, không phải business feature.

Ưu tiên:

```text
Consistency
>
Accessibility
>
Responsive UX
>
Reusability
>
Performance
>
Visual polish
```

Khi không chắc:
1. Inspect existing components.
2. Reuse trước khi tạo mới.
3. Đặt component đúng layer.
4. Không duplicate logic.
5. Không đưa business logic vào shell.
6. Test desktop/mobile.
7. Update docs.
8. Update MapNode.
9. Báo cáo chính xác phần đã làm/chưa làm.
