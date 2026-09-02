# F1 — Frontend Bootstrap

## 1. Mục tiêu

F1 xây dựng nền tảng frontend cho Personal OS bằng Next.js.

F1 chưa implement business logic của Finance, Training hoặc Military Manual.

Mục tiêu:
- Next.js chạy được.
- TypeScript strict.
- App Router.
- Tailwind CSS.
- shadcn/ui foundation.
- ESLint/formatting.
- Base layout.
- Environment configuration.
- API client foundation.
- Error/loading conventions.
- Frontend structure phù hợp feature-first.

---

## 2. Context bắt buộc

AI phải đọc:

```text
00-README.md
01-system-overview.md
02-frontend-nextjs.md
18-coding-rules.md
20-project-structure.md
22-ai-development-protocol.md
23-mapnode.md
F0-REPOSITORY-INITIALIZATION.md
```

AI phải kiểm tra source code hiện tại trước khi tạo file.

---

## 3. Frontend Technology

Bắt buộc:

```text
Next.js
TypeScript
App Router
Tailwind CSS
shadcn/ui
```

Chuẩn bị abstraction cho:

```text
React Hook Form
Zod
TanStack Query
Zustand
```

Nhưng không cài package chỉ để "cho đủ stack" nếu chưa sử dụng.

---

## 4. Folder Structure

Frontend:

```text
apps/web/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── finance/
│   │   ├── personnel/
│   │   ├── training/
│   │   ├── manual/
│   │   ├── tasks/
│   │   └── settings/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── ui/
│   ├── layout/
│   └── shared/
│
├── features/
│   ├── finance/
│   ├── personnel/
│   ├── training/
│   ├── manual/
│   └── tasks/
│
├── hooks/
├── lib/
│   ├── api/
│   ├── env/
│   └── utils/
│
├── stores/
├── types/
└── config/
```

Feature directories có thể tồn tại nhưng chưa chứa business implementation.

---

## 5. App Router

Dùng App Router.

Không dùng Pages Router cho code mới.

Route groups:

```text
(auth)
(dashboard)
```

được dùng để chia layout mà không ảnh hưởng URL.

Ví dụ:

```text
app/(dashboard)/finance/page.tsx
```

URL:

```text
/finance
```

---

## 6. Server Components vs Client Components

Mặc định dùng Server Component.

Chỉ thêm:

```tsx
"use client";
```

khi thực sự cần:
- browser API.
- event handling.
- client state.
- Zustand.
- interactive form.
- TanStack Query.

Không biến toàn bộ layout thành Client Component.

---

## 7. TypeScript

Bắt buộc strict mode.

Không dùng:

```typescript
any
```

nếu có thể tạo type chính xác.

Không sử dụng:

```typescript
as any
```

để che lỗi type.

API DTO phải có type rõ ràng.

---

## 8. Environment

Frontend chỉ được truy cập biến public bằng:

```text
NEXT_PUBLIC_*
```

Không đưa:
- database password.
- JWT signing secret.
- private API key.
- cloud secret

vào client environment.

API base URL phải được cấu hình tập trung.

Không hard-code URL API trong component.

---

## 9. API Client Foundation

Tạo một API client duy nhất hoặc một abstraction có responsibility rõ ràng.

Ví dụ:

```text
lib/api/
├── client.ts
├── types.ts
└── errors.ts
```

Feature-specific API đặt trong:

```text
features/<feature>/api/
```

Không viết:

```text
fetch("http://localhost:5000/...")
```

rải rác trong UI.

---

## 10. UI Foundation

Thiết lập:
- Button.
- Input.
- Card.
- Dialog.
- Table.
- Badge.
- Form primitives.
- Toast/notification mechanism.
- Loading/skeleton.
- Empty state.
- Error state.

shadcn/ui là primitive layer.

Business-specific UI không đặt vào `components/ui`.

---

## 11. Base Layout

Tạo layout cơ bản:

```text
┌─────────────────────────────────────┐
│ Header                              │
├────────────┬────────────────────────┤
│ Sidebar    │ Main Content           │
│            │                        │
│ Dashboard  │                        │
│ Finance    │                        │
│ Personnel  │                        │
│ Training   │                        │
│ Manual     │                        │
│ Tasks      │                        │
└────────────┴────────────────────────┘
```

Ở F1 chưa cần hoàn thiện navigation permission.

Navigation chỉ là shell.

---

## 12. Loading / Error / Empty

Các route chính phải có convention cho:
- loading.
- error.
- empty.

Không để UI trắng khi API loading/fail.

Error message không được hiển thị stack trace cho người dùng.

---

## 13. State Management

Quy tắc:

```text
Server state
    -> TanStack Query

Client global state
    -> Zustand

Local component state
    -> React state
```

Không dùng Zustand để cache API data nếu TanStack Query phù hợp.

Không tạo global store cho mọi thứ.

---

## 14. Forms

Chuẩn:

```text
React Hook Form
        +
Zod
```

Nhưng validation server vẫn bắt buộc.

Frontend validation chỉ cải thiện UX, không phải security boundary.

---

## 15. Styling

Tailwind CSS là styling chính.

Không tạo một hệ thống CSS mới song song nếu không cần.

Theme/token nên tập trung.

Không hard-code màu sắc/spacing khác nhau cho từng feature nếu Design System đã có token.

---

## 16. Acceptance Criteria

- [ ] Next.js chạy được.
- [ ] TypeScript strict.
- [ ] App Router.
- [ ] Tailwind hoạt động.
- [ ] shadcn/ui foundation hoạt động.
- [ ] Root layout hoạt động.
- [ ] Dashboard shell hoạt động.
- [ ] Navigation shell có các module.
- [ ] API client abstraction tồn tại.
- [ ] Environment configuration tồn tại.
- [ ] Loading/error convention tồn tại.
- [ ] ESLint/typecheck/build pass.
- [ ] Không có business implementation.

---

## 17. AI Rules

AI không được:
- Implement Finance.
- Implement Authentication.
- Gọi database trực tiếp từ frontend.
- Hard-code API URL.
- Tạo business logic trong generic UI component.
- Biến tất cả component thành Client Component.
- Thêm state management global nếu local state đủ.
- Tạo duplicate Button/Input/Table ngoài Design System.

---

## 18. Output

F1 phải tạo được một frontend shell sạch, chạy độc lập và sẵn sàng kết nối ASP.NET Core API ở F2/F3.
