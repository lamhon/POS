# F6 — Design System

> **Project:** Personal OS  
> **Phase:** F6  
> **Purpose:** Xây dựng Design System chính thức cho toàn bộ frontend Next.js để mọi module sử dụng chung UI, token, accessibility, responsive behavior và component API.

---

## 1. Mục tiêu

F6 tạo nền tảng UI dùng chung cho:

```text
Dashboard
Finance
Personnel
Training
Military Manual
Tasks
Settings
```

Sau F6, feature không được tự tạo lại:

- Button
- Input
- Select
- Dialog
- Table
- Card
- Badge
- Toast
- Loading
- Empty state
- Error state
- Color
- Typography
- Spacing
- Responsive rules

Nguyên tắc:

```text
Design Tokens
      ↓
UI Primitives
      ↓
Shared Components
      ↓
Feature Components
      ↓
Business Module
```

---

## 2. Vị trí trong roadmap

```text
F0 Repository
   ↓
F1 Frontend Bootstrap
   ↓
F2 Backend Bootstrap
   ↓
F3 Database
   ↓
F4 Authentication & Authorization
   ↓
F5 App Shell
   ↓
F6 Design System
   ↓
F7 Finance MVP
```

F6 phụ thuộc F1, F4 và F5.

F6 **không triển khai business logic** của Finance, Personnel, Training hoặc Military Manual.

---

## 3. AI Context bắt buộc

Trước khi code, AI phải đọc:

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
F4-AUTHENTICATION-AUTHORIZATION.md
F5-APP-SHELL-DESIGN-SYSTEM.md
```

Sau đó inspect source thực tế.

Không được mặc định documentation luôn đúng nếu implementation hiện tại khác.

Thứ tự ưu tiên:

```text
Verified current architecture
>
Current source code
>
Project documentation
>
AI assumption
```

Nếu có conflict lớn, phải báo cáo trước khi thay đổi architecture.

---

# 4. Technology Principles

Frontend:

```text
Next.js
React
TypeScript
Tailwind CSS hoặc styling system hiện tại
```

Có thể dùng component primitives/library trưởng thành nếu project đã có.

Không tự động thay toàn bộ UI library hiện tại.

Nguyên tắc:

```text
Mature primitives
+
Personal OS design tokens
+
Stable application component API
```

Không để business feature phụ thuộc trực tiếp quá sâu vào API nội bộ của third-party library.

---

# 5. Architecture

Cấu trúc khuyến nghị:

```text
src/
├── app/
│
├── components/
│   ├── ui/
│   │   ├── button/
│   │   ├── input/
│   │   ├── select/
│   │   ├── dialog/
│   │   ├── table/
│   │   └── ...
│   │
│   ├── layout/
│   │   ├── app-shell/
│   │   ├── sidebar/
│   │   ├── header/
│   │   └── breadcrumb/
│   │
│   └── shared/
│       ├── empty-state/
│       ├── error-state/
│       ├── loading-state/
│       └── page-header/
│
├── styles/
│   ├── globals.css
│   ├── tokens.css
│   └── utilities.css
│
├── lib/
│
└── features/
    ├── finance/
    ├── personnel/
    ├── training/
    └── manual/
```

Nếu F1/F5 đã có structure khác nhưng hợp lý, ưu tiên reuse thay vì refactor toàn bộ chỉ vì tên folder.

---

# 6. Design Token Foundation

Token là source of truth.

Các nhóm bắt buộc:

```text
Color
Typography
Spacing
Sizing
Radius
Border
Shadow
Opacity
Z-index
Motion
Breakpoint
```

Token phải mang tính semantic.

Đúng:

```text
background
foreground
primary
secondary
muted
accent
destructive
success
warning
info
border
input
ring
```

Sai:

```text
finance-green
training-blue
manual-red
button-blue-1
```

---

# 7. Color System

Tối thiểu:

```text
background
foreground
card
card-foreground
popover
popover-foreground
primary
primary-foreground
secondary
secondary-foreground
muted
muted-foreground
accent
accent-foreground
destructive
destructive-foreground
border
input
ring
success
warning
info
```

Không hard-code màu trong feature.

Không:

```tsx
bg-[#123456]
```

nếu token tương ứng đã tồn tại.

Ưu tiên:

```tsx
bg-primary
text-foreground
border-border
```

hoặc API tương đương của styling system.

---

# 8. Theme

Bắt buộc hỗ trợ:

```text
Light
Dark
System
```

Theme phải áp dụng thống nhất cho:

```text
App Shell
Sidebar
Header
Button
Input
Dialog
Dropdown
Table
Card
Badge
Alert
Toast
```

Không xử lý Dark Mode bằng cách sửa màu thủ công trong từng component.

Theme phải đi qua semantic tokens.

---

# 9. Typography

Chuẩn hóa:

```text
Display
H1
H2
H3
H4
Body
Body Small
Caption
Label
Button
Code
```

Mỗi cấp phải xác định:

```text
font family
font size
font weight
line height
letter spacing
```

Ví dụ:

```text
Page title → H1
Section → H2
Card title → H3
Form label → Label
Supporting text → Caption
```

Không dùng font-size ngẫu nhiên trên từng page.

Font phải hỗ trợ tốt tiếng Việt.

---

# 10. Spacing

Dùng spacing scale thống nhất:

```text
xs
sm
md
lg
xl
2xl
3xl
4xl
```

Giá trị thực tế phải nằm trong token.

Tránh:

```text
13px
17px
19px
7px
```

nếu không có lý do thiết kế.

---

# 11. Radius

Chuẩn hóa:

```text
none
sm
md
lg
xl
full
```

Ví dụ:

```text
Input → md
Button → md
Card → lg
Dialog → lg
Avatar → full
Badge → full
```

---

# 12. Shadow

Chỉ dùng một tập nhỏ:

```text
none
sm
md
lg
xl
```

Không tạo shadow tùy ý trong feature.

---

# 13. Motion

Chuẩn hóa:

```text
duration-fast
duration-normal
duration-slow
ease-standard
ease-in
ease-out
```

Animation phải phục vụ UX.

Phải tôn trọng:

```text
prefers-reduced-motion
```

Không lạm dụng animation trong bảng, form và navigation.

---

# 14. Z-index

Centralize layering:

```text
base
dropdown
sticky
overlay
modal
popover
toast
tooltip
```

Không dùng:

```text
z-[99999]
```

rải rác.

---

# 15. Component API

Shared component phải có:

```text
Clear responsibility
Typed props
Predictable variants
Accessible behavior
Consistent states
Documentation
```

Không tạo component có hàng chục props không liên quan.

Ưu tiên composition khi phù hợp.

---

# 16. Button

Variants:

```text
primary
secondary
outline
ghost
destructive
link
```

Sizes:

```text
sm
md
lg
icon
```

States:

```text
default
hover
focus
active
disabled
loading
```

Ví dụ:

```tsx
<Button variant="primary" size="md">
  Save
</Button>
```

Loading phải ngăn double submit.

---

# 17. Icon Button

Icon-only button bắt buộc có accessible label.

Đúng:

```tsx
<Button aria-label="Delete transaction">
  <TrashIcon />
</Button>
```

Tooltip chỉ bổ sung UX, không thay thế accessible label.

---

# 18. Input

States:

```text
default
focus
disabled
readonly
error
success
```

Hỗ trợ:

```text
label
description
error
required
placeholder
prefix
suffix
```

Phải liên kết đúng:

```text
label
input
description
error
```

bằng accessible IDs.

---

# 19. Textarea

Giống Input và hỗ trợ:

```text
label
description
error
disabled
readonly
required
character count nếu cần
```

Không tạo validation logic riêng trong Textarea.

---

# 20. Select

Hỗ trợ:

```text
label
placeholder
disabled
error
loading
empty
keyboard navigation
```

Nếu danh sách lớn, dùng searchable select/combobox.

---

# 21. Checkbox / Radio / Switch

Mỗi control cần:

```text
label
description
error
disabled
checked/selected state
keyboard support
```

Không dùng visual-only toggle.

---

# 22. Form System

Form phức tạp nên dùng:

```text
React Hook Form
+
Zod
```

Layer:

```text
Form
 ↓
FormField
 ↓
Input / Select / Checkbox...
 ↓
Validation
 ↓
Submit
```

Design System sở hữu form infrastructure.

Feature sở hữu business validation.

Ví dụ:

```text
components/ui/form
→ generic

features/finance/validation
→ Finance-specific
```

---

# 23. Dialog

Dialog phải hỗ trợ:

```text
open
close
title
description
content
footer/actions
```

Accessibility:

```text
focus trap
initial focus
return focus
Escape
ARIA
keyboard navigation
```

Chỉ có một implementation chuẩn.

---

# 24. Drawer

Dùng cho:

```text
Mobile navigation
Mobile filters
Secondary panels
```

Không dùng Drawer thay mọi Dialog.

---

# 25. Dropdown Menu

Phải hỗ trợ:

```text
keyboard navigation
focus management
disabled item
destructive item
```

Ví dụ User Menu:

```text
Profile
Settings
---------
Logout
```

---

# 26. Tooltip

Dùng để giải thích control không rõ nghĩa.

Không dùng tooltip cho thông tin bắt buộc phải nhìn thấy.

Phải cân nhắc mobile/touch.

---

# 27. Tabs

Tabs dùng để chuyển giữa các view liên quan.

Không dùng Tabs thay primary navigation.

Phải hỗ trợ:

```text
active
disabled
keyboard
responsive
```

---

# 28. Card

Variants có thể:

```text
default
outlined
interactive
compact
```

Card dùng để grouping nội dung, không phải bắt buộc bọc mọi section.

---

# 29. Badge

Variants:

```text
default
success
warning
destructive
info
neutral
```

Ví dụ:

```text
ACTIVE
PENDING
LOCKED
COMPLETED
OVERDUE
```

Không dùng màu làm tín hiệu duy nhất.

---

# 30. Alert

Variants:

```text
info
success
warning
error
```

Cấu trúc:

```text
title
description
optional action
```

---

# 31. Toast

Dùng cho feedback ngắn:

```text
Save successful
Update successful
Delete successful
Network error
```

Không dùng Toast cho thông tin quan trọng người dùng phải đọc.

---

# 32. Table

Table phải generic để sau này dùng cho:

```text
Finance
Personnel
Training
Tasks
```

Hỗ trợ:

```text
header
body
row
cell
loading
empty
error
pagination
sorting nếu cần
selection nếu cần
```

Responsive strategy:

```text
horizontal scroll
hoặc
card/list representation
```

tùy dữ liệu.

Không tạo `FinanceTable` trong Design System.

---

# 33. Pagination

Hỗ trợ:

```text
current page
page size
total
next
previous
first/last nếu cần
```

Không biết business domain.

---

# 34. Loading

Chuẩn hóa:

```text
Skeleton
Spinner
LoadingButton
TableSkeleton
CardSkeleton
```

Quy tắc:

```text
Known content layout → Skeleton
Local operation → Spinner
Submit action → LoadingButton
```

---

# 35. Empty State

Cấu trúc:

```text
icon
title
description
action
```

Ví dụ:

```text
No transactions yet

Start tracking your expenses.

[Add transaction]
```

Design System định nghĩa layout.

Feature định nghĩa nội dung.

---

# 36. Error State

Cấu trúc:

```text
icon
title
description
retry
secondary action nếu cần
```

Không hiển thị:

```text
stack trace
database error
internal exception
```

---

# 37. Confirm Dialog

Dùng cho:

```text
Delete
Archive
Remove
Revoke
Reset
```

Phải nói rõ:

```text
Action
Consequence
Reversible/irreversible
Confirm
Cancel
```

---

# 38. Page Header

Shared component:

```text
title
description
breadcrumbs
actions
```

Ví dụ:

```text
Transactions
Manage your personal income and expenses.

[Filter] [Add transaction]
```

Feature quyết định actions.

---

# 39. Shared Data Patterns

Có thể chuẩn hóa:

```text
KeyValue
StatCard
StatusBadge
Timeline
List
Table
EmptyState
```

Tất cả phải domain-neutral.

---

# 40. Date / Time

Không format date/time riêng trong từng feature.

Dùng utility tập trung:

```text
formatDate()
formatDateTime()
formatRelativeTime()
```

Backend timestamps là UTC.

UI chuyển sang timezone theo policy của project.

---

# 41. Currency

Dùng formatter tập trung:

```text
formatCurrency()
```

Không viết:

```tsx
`${amount} đ`
```

ở nhiều feature.

Finance quyết định semantics.

Design System quyết định display consistency.

---

# 42. Number Formatting

Centralize:

```text
formatNumber()
formatPercent()
formatCurrency()
formatCompactNumber()
```

Locale phải configurable.

---

# 43. Responsive

Mọi component phải được kiểm tra:

```text
Mobile
Tablet
Desktop
```

Ví dụ:

```text
Sidebar → Drawer trên mobile
Toolbar → wrap/stack
Page actions → stack trên mobile
Dialog → near/full screen khi cần
Table → scroll/card strategy
```

Không coi "giảm width" là responsive hoàn chỉnh.

---

# 44. Accessibility

Target:

```text
WCAG 2.2 AA
```

Yêu cầu:

- Semantic HTML.
- Keyboard navigation.
- Visible focus.
- Correct labels.
- ARIA khi cần.
- Contrast.
- Screen reader support.
- Reduced motion.
- Không truyền tải status chỉ bằng màu.

---

# 45. Internationalization

Không hard-code user-facing text trong generic components.

Component nhận content qua props.

Feature/page cung cấp translated content.

Design System phải không phụ thuộc một ngôn ngữ.

---

# 46. RTL / Localization

Dù ban đầu có thể chỉ dùng:

```text
Vietnamese
English
```

không nên hard-code hướng trái/phải.

Ưu tiên CSS logical properties:

```text
margin-inline
padding-inline
inset-inline
border-inline
```

---

# 47. Naming

Components:

```text
Button
Input
FormField
ConfirmDialog
EmptyState
ErrorState
PageHeader
DataTable
```

Variants semantic:

```text
primary
outline
ghost
destructive
```

Không dùng:

```text
red
blue
type3
```

---

# 48. TypeScript

Shared components phải strongly typed.

Tránh:

```ts
any
```

trừ trường hợp có lý do rõ ràng.

Public component API phải có type rõ ràng.

---

# 49. Server / Client Components

Mặc định:

```text
Server Component
```

Chỉ dùng Client Component khi cần:

```text
state
event handlers
browser API
interactive library
```

Không biến toàn bộ Design System thành Client Component.

---

# 50. Styling

Nếu Tailwind là chuẩn project:

```text
Tailwind
+
CSS variables/tokens
```

Global CSS chỉ chứa:

```text
tokens
base styles
fonts
global accessibility
```

Không tạo nhiều styling system song song nếu không có lý do.

---

# 51. Class Variants

Khi component có nhiều variants:

```text
base
+
variant
+
size
+
state
```

nên dùng abstraction chung thay vì conditional class string lặp lại.

---

# 52. Component Documentation

Mỗi component quan trọng phải có:

```text
Purpose
When to use
When not to use
Props
Variants
States
Accessibility
Examples
```

Storybook được khuyến nghị nếu project sử dụng component documentation system.

---

# 53. Storybook

Nếu dùng Storybook, ưu tiên story cho:

```text
Button
Input
Select
Dialog
Dropdown
Card
Badge
Alert
Table
Pagination
EmptyState
ErrorState
Skeleton
PageHeader
```

Mỗi story cần thể hiện các state quan trọng.

---

# 54. Testing

Component tests phải kiểm tra:

```text
rendering
variants
states
events
keyboard behavior
accessibility
disabled
loading
error
```

Visual checks:

```text
Light
Dark
Mobile
Desktop
```

E2E shell:

```text
Login
→ Dashboard
→ Navigation
→ Theme
→ Logout
```

---

# 55. Quality Gates

Trước khi hoàn thành F6:

```text
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

hoặc command tương đương của project.

Không được bỏ qua TypeScript errors.

Không thêm lint suppression nếu không có lý do.

---

# 56. Performance

Design System không được làm tăng bundle không cần thiết.

Quy tắc:

- Tree-shake icons.
- Không import toàn bộ icon library nếu không cần.
- Lazy-load component nặng.
- Không dùng Client Component không cần thiết.
- Không dùng global state cho local UI.
- Không đặt computation nặng trong primitive components.

---

# 57. Security

Design System không được:

- Render HTML không sanitize.
- Expose auth token.
- Log sensitive form data.
- Hiển thị backend exception.
- Tạo XSS vector.

Nếu bắt buộc dùng `dangerouslySetInnerHTML`, phải có sanitization strategy.

---

# 58. Form Security

Password input:

```text
type=password
```

Không:

```text
log password
persist password không cần thiết
đưa password vào debug output
```

Generic form components không tự động persist sensitive input.

---

# 59. UX Consistency

Chuẩn semantic action:

```text
Create/Save → primary
Cancel → secondary/outline
Delete → destructive
Secondary action → ghost
```

Không cho feature tự định nghĩa semantic color khác Design System.

---

# 60. Boundary

Design System sở hữu:

```text
visual behavior
interaction behavior
accessibility
responsive behavior
component API
tokens
```

Feature sở hữu:

```text
business meaning
domain validation
API integration
permissions
business state
business copy
```

Ví dụ:

```text
Button
→ Design System

"Add Transaction"
→ Finance

finance.transaction.create
→ Authorization

Transaction creation
→ Finance application layer
```

---

# 61. Không build trong F6

Không implement:

```text
Finance CRUD
Personnel CRUD
Training CRUD
Military Manual CRUD
Finance analytics
Training analytics
RAG
AI assistant
Complex business dashboard
```

Có thể dùng static examples/stories để test component.

---

# 62. Migration Existing UI

Nếu F5 đã có component:

```text
1. Inventory
2. Detect duplicate
3. Chọn canonical implementation
4. Generalize nếu phù hợp
5. Migrate imports
6. Remove obsolete component
7. Test
8. Build
9. Update MapNode
```

Không tạo:

```text
ButtonV2
ButtonNew
BetterButton
```

nếu không có migration strategy thật sự.

---

# 63. Component Inventory

Trước implementation phải kiểm kê:

```text
Component
Location
Purpose
Consumers
Duplicate?
Keep/Merge/Delete
Migration required?
```

Mục tiêu:

```text
1 canonical implementation / primitive
```

---

# 64. Component Priority

## P0 — bắt buộc

```text
Button
IconButton
Input
Textarea
Label
FormField
Select
Checkbox
Switch
Dialog
DropdownMenu
Card
Badge
Alert
Toast
Skeleton
Spinner
EmptyState
ErrorState
PageHeader
```

## P1 — cần theo nhu cầu

```text
Tabs
Drawer
Tooltip
Popover
Table
Pagination
DatePicker
Combobox
Command/Search
Avatar
Breadcrumb
Separator
```

## P2 — chỉ xây khi feature yêu cầu

```text
Timeline
StatCard
Calendar
AdvancedDataTable
FileUpload
RichTextEditor
```

Không xây P2 chỉ để "đủ Design System".

---

# 65. Implementation Order

AI triển khai theo thứ tự:

```text
1. Token foundation
        ↓
2. Theme
        ↓
3. Typography
        ↓
4. Accessibility base
        ↓
5. Button
        ↓
6. Form primitives
        ↓
7. Feedback
        ↓
8. Overlay
        ↓
9. Data display
        ↓
10. Shared layout patterns
        ↓
11. Documentation
        ↓
12. Tests
        ↓
13. Migration
        ↓
14. MapNode
```

Không triển khai toàn bộ component đồng thời.

---

# 66. AI Workflow

Mỗi component:

```text
1. Read requirement
2. Inspect existing implementation
3. Check duplicate
4. Define API
5. Implement semantic structure
6. Add variants
7. Add states
8. Add accessibility
9. Add responsive behavior
10. Add tests
11. Add documentation/story
12. Run lint/typecheck/test
13. Integrate
```

Sau đó mới chuyển component tiếp theo.

---

# 67. AI Decision Rule

```text
Existing component
       ↓
Can generalize?
   ↙       ↘
 Yes       No
  ↓         ↓
Promote   Keep in feature
```

Chỉ đưa component vào Design System khi:

```text
Reusable
+
Domain-neutral
+
Stable API
```

---

# 68. Acceptance Criteria

## Tokens

- [ ] Color tokens centralized.
- [ ] Typography centralized.
- [ ] Spacing centralized.
- [ ] Radius centralized.
- [ ] Shadow centralized.
- [ ] Motion centralized.
- [ ] Z-index centralized.

## Theme

- [ ] Light.
- [ ] Dark.
- [ ] System.

## Components

- [ ] P0 components implemented.
- [ ] Required P1 implemented.
- [ ] Consistent variants.
- [ ] Consistent states.
- [ ] Typed API.

## Accessibility

- [ ] Keyboard.
- [ ] Focus.
- [ ] Labels.
- [ ] ARIA.
- [ ] Contrast.
- [ ] Reduced motion.

## Responsive

- [ ] Mobile.
- [ ] Tablet.
- [ ] Desktop.

## Quality

- [ ] Lint pass.
- [ ] Typecheck pass.
- [ ] Tests pass.
- [ ] Build pass.
- [ ] App Shell migrated.
- [ ] Duplicate components removed.
- [ ] MapNode updated.
- [ ] Documentation updated.

---

# 69. MapNode

Sau khi triển khai, cập nhật:

```text
mapnode/index.yaml
mapnode/architecture/frontend.yaml
mapnode/architecture/design-system.yaml
```

Ví dụ:

```yaml
design_system:
  status: active

  tokens:
    colors: semantic
    typography: centralized
    spacing: centralized
    radius: centralized
    shadows: centralized
    motion: centralized

  themes:
    - light
    - dark
    - system

  components:
    p0: complete
    p1: partial
    p2: planned

  accessibility:
    target: WCAG-2.2-AA

  responsive:
    mobile: supported
    tablet: supported
    desktop: supported
```

Chỉ đánh dấu `complete` nếu implementation và tests thực sự hoàn thành.

---

# 70. Definition of Done

F6 hoàn thành khi:

- [ ] Design tokens là source of truth.
- [ ] Light/Dark/System hoạt động.
- [ ] Typography thống nhất.
- [ ] Spacing thống nhất.
- [ ] P0 components hoàn thành.
- [ ] P1 cần thiết hoàn thành.
- [ ] Components có typed API.
- [ ] Accessibility đạt yêu cầu.
- [ ] Responsive được kiểm tra.
- [ ] App Shell sử dụng Design System.
- [ ] Duplicate UI components được migrate/remove.
- [ ] Không có business logic trong primitive components.
- [ ] Lint pass.
- [ ] Typecheck pass.
- [ ] Tests pass.
- [ ] Production build pass.
- [ ] Documentation cập nhật.
- [ ] MapNode cập nhật.

---

# 71. Final AI Instruction

F6 là **frontend infrastructure**, không phải business feature.

Ưu tiên:

```text
Consistency
>
Accessibility
>
Maintainability
>
Reusability
>
Responsive UX
>
Performance
>
Visual polish
```

Mục tiêu cuối:

```text
Design Tokens
      ↓
Shared Components
      ↓
App Shell
      ↓
Finance
Personnel
Training
Military Manual
Tasks
Settings
```

Mọi feature tương lai phải sử dụng Design System.

Không giải quyết một vấn đề UI của feature bằng cách duplicate hoặc phá vỡ shared system.

Sau F6, chuyển sang:

```text
F7 — Finance MVP
```
