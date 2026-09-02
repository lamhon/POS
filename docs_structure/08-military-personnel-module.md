# Military Personnel Module

## Mục tiêu
Quản lý hồ sơ quân nhân phục vụ các chức năng huấn luyện và quản trị.

## Core profile
Có thể bao gồm:
- Họ tên.
- Ngày sinh.
- Giới tính.
- Quê quán.
- Nơi cư trú.
- Thông tin liên hệ.
- Cấp bậc.
- Chức vụ.
- Đơn vị.
- Số hiệu/identifier nghiệp vụ.
- Trạng thái phục vụ.

## Documents
Tài liệu hồ sơ phải lưu metadata trong PostgreSQL và file trong object storage.

## History
Thông tin quan trọng như:
- rank changes.
- position assignments.
- unit assignments.
nên có history thay vì overwrite nếu nghiệp vụ cần theo dõi quá trình.

## Access control
Thông tin hồ sơ là restricted data.
Permission phải kiểm tra theo action và có thể theo organizational scope.

## Audit
Ghi lại:
- create/update/delete.
- document upload/delete.
- assignment changes.
- rank/position changes.

## Integration
Training module tham chiếu Soldier/Personnel qua ID và application contract, không duplicate toàn bộ hồ sơ quân nhân.
