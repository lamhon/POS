# Background Jobs

## Công nghệ
Hangfire trên ASP.NET Core.

## Use cases
- recurring transactions.
- notification/reminder.
- document processing.
- thumbnail generation.
- text extraction.
- embedding generation.
- report generation.
- cleanup jobs.

## Job rules
Mỗi job phải:
- idempotent.
- retry-safe.
- observable.
- có timeout phù hợp.
- không phụ thuộc request HTTP đang mở.

## Retry
Retry cho lỗi transient.
Không retry vô hạn.
Các lỗi permanent phải chuyển failed state để xử lý.

## Scheduling
Recurring jobs phải dùng stable identifier.
Không tạo duplicate schedule mỗi lần application startup.
