# Task & Notification Module

## Task
Task dùng để quản lý công việc cá nhân hoặc công việc theo module.

Fields:
- title.
- description.
- status.
- priority.
- dueAt.
- assignee.
- tags.
- relatedEntity.

Status nên configurable nhưng có lifecycle rõ ràng:
```text
Todo -> In Progress -> Done
```

Task có thể liên kết tới:
- Finance goal.
- Training session.
- Manual document.
- Personnel action.

## Notification
Hỗ trợ:
- in-app notification.
- email/push trong tương lai.

Notification phải có:
- recipient.
- type.
- title.
- payload.
- readAt.
- createdAt.

## Background processing
Reminder/due notification dùng Hangfire.
Job phải idempotent.
