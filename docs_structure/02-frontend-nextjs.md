# Frontend — Next.js

## Mục tiêu
Frontend là ứng dụng web chính của Personal OS, dùng Next.js và TypeScript.

## Stack
- Next.js.
- TypeScript.
- App Router.
- Tailwind CSS.
- shadcn/ui.
- React Hook Form.
- Zod.
- TanStack Query.
- Zustand.
- TanStack Table.
- Recharts.
- Lucide React.

## Rendering
Ưu tiên Server Components khi component không cần browser state/event.
Dùng Client Components khi cần:
- Form interaction.
- Browser API.
- Local state.
- Zustand.
- TanStack Query interaction.
- Rich UI interaction.

Không biến toàn bộ page thành Client Component nếu không cần.

## Route organization
```text
app/
  (auth)/
  (dashboard)/
    dashboard/
    finance/
    training/
    military-personnel/
    military-manual/
    tasks/
    settings/
```

## Feature organization
```text
features/
  finance/
    api/
    components/
    hooks/
    schemas/
    types/
    utils/
  training/
  military-personnel/
  military-manual/
  tasks/
```

## Data fetching
- Server-rendered initial data: server-side fetching khi phù hợp.
- Interactive client data: TanStack Query.
- Không gọi API trực tiếp trong mọi component.
- API access phải đi qua typed client/service layer.

## State
Dùng Zustand cho client state thực sự cần global/local persistence.
Không dùng Zustand để thay thế server cache.
Server state dùng TanStack Query.

## Forms
Mọi form nghiệp vụ:
- React Hook Form.
- Zod schema.
- Hiển thị validation gần field.
- Server vẫn phải validate lại.

## UI
Dùng shadcn/ui làm primitive.
Không tạo component mới nếu primitive hiện có đáp ứng yêu cầu.
Reusable business component đặt trong feature; generic component đặt trong shared/ui.

## Error/loading
Mỗi route quan trọng phải có:
- loading state.
- error state.
- empty state.
- success feedback.

## Accessibility
- Keyboard navigation.
- Semantic HTML.
- Label cho form.
- Focus state.
- Không chỉ dùng màu để biểu diễn trạng thái.
