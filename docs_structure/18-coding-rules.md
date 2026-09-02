# Coding Rules for AI

## General
- TypeScript strict mode.
- Nullable reference types trong C#.
- Không dùng `any` nếu có type chính xác.
- Không suppress compiler warning nếu chưa hiểu nguyên nhân.
- Small focused functions.
- Single responsibility.
- Explicit naming.

## Frontend
- Component PascalCase.
- Hooks bắt đầu bằng `use`.
- Feature-specific code nằm trong feature.
- Không đặt business rule trong JSX.
- Không fetch API trực tiếp từ reusable UI component.

## Backend
- PascalCase cho public C# members.
- camelCase JSON contract.
- DTO không expose domain entity.
- Controller/endpoint mỏng.
- Use case chứa orchestration.
- Domain chứa invariant.

## Error handling
Không dùng exception như control flow bình thường.
Domain/application errors phải map về consistent API error response.

## Database
Mọi schema change có migration.
Không sửa production schema thủ công nếu migration là source of truth.

## Dependencies
Không thêm package chỉ vì convenience.
Trước khi thêm package:
1. Xác định requirement.
2. Kiểm tra package đang có.
3. Đánh giá maintenance/security.
4. Cập nhật package documentation.

## AI-specific rule
AI phải giải thích impact trước thay đổi cross-module.
Nếu thiếu context, đọc documentation/code liên quan trước khi tự suy đoán.
