# AI Development Protocol

## Mục tiêu
Giúp AI code đúng kiến trúc mà không cần quét toàn bộ repository ở mỗi prompt.

## Context loading order
1. `00-README.md`
2. `01-system-overview.md`
3. File module liên quan.
4. `18-coding-rules.md`
5. `19-api-conventions.md`
6. Relevant mapnode.
7. Code files trực tiếp liên quan.

Không cần đọc toàn bộ docs nếu task chỉ liên quan một module.

## Before coding
AI phải xác định:
- Task scope.
- Affected module.
- Existing implementation.
- Existing reusable components/services.
- Database impact.
- API impact.
- Security impact.
- Test impact.

## During coding
- Follow existing patterns.
- Không duplicate abstraction.
- Không thay đổi unrelated code.
- Migration nếu schema đổi.
- Tests cho behavior mới.
- Update docs nếu architecture/contract đổi.

## After coding
AI phải kiểm tra:
- Typecheck/build.
- Lint.
- Tests.
- Migration.
- Authorization.
- Error handling.
- Documentation.
- Mapnode impact.

## Change classification
### Local
Một file/feature nhỏ, không đổi contract.

### Module
Ảnh hưởng nhiều file trong một module.

### Cross-module
Ảnh hưởng từ hai module trở lên.

### Architecture
Đổi dependency, infrastructure, data strategy hoặc public contract.

Cross-module và architecture change phải được review kỹ hơn.

## Không được tự suy đoán
Nếu requirement mơ hồ về business rule, AI phải giữ behavior hiện tại hoặc yêu cầu clarification thay vì tự tạo rule nguy hiểm.
