# Task Management Module — AI Implementation Specification

> **Document Type:** Implementation Specification  
> **Purpose:** Đây là tài liệu requirement + architecture contract để AI có thể đọc, phân tích, triển khai và review module Task Management của Personal OS.  
> **Target:** Module quản lý công việc theo hướng Notion-like, nhưng được thiết kế để tích hợp sâu với các module khác của Personal OS.

---

## 1. Mục tiêu

Task Management không được thiết kế như một Todo List CRUD đơn giản.

Mục tiêu là xây dựng một **Task Workspace / Task Database System** có khả năng:

- Quản lý task cá nhân.
- Quản lý task theo project.
- Quản lý task theo team/nhân sự.
- Hỗ trợ subtask, checklist, dependency.
- Cho phép custom properties.
- Cho phép nhiều view trên cùng một tập dữ liệu.
- Hỗ trợ filter, sort, group, search.
- Hỗ trợ recurring task.
- Hỗ trợ comment, mention, attachment, activity log.
- Hỗ trợ dashboard.
- Hỗ trợ template.
- Hỗ trợ automation.
- Có nền tảng cho AI task management.
- Có khả năng liên kết với các module khác của Personal OS.
- Không tạo dữ liệu riêng cho từng View.

### Nguyên tắc cốt lõi

```text
ONE DATA SOURCE
       ↓
TASK DATABASE
       ↓
MULTIPLE VIEWS
       ↓
TABLE / LIST / BOARD / CALENDAR / TIMELINE / GANTT
```

---

# 2. Phạm vi Module

Module bao gồm các domain chính:

```text
Task Management
│
├── Workspace
├── Folder
├── Project
├── Database
├── Task
├── Subtask
├── Checklist
├── Properties
├── Views
├── Filter
├── Sort
├── Group
├── Dependency
├── Relation
├── Comment
├── Attachment
├── Activity
├── Notification
├── Reminder
├── Recurrence
├── Template
├── Automation
├── Dashboard
├── Inbox
├── My Day
├── Archive / Trash
├── Time Tracking
└── AI Integration
```

---

# 3. Kiến trúc khái niệm

## 3.1 Hierarchy

```text
Workspace
│
├── Folder
│
├── Project
│      │
│      └── Database
│             │
│             ├── Task
│             │    ├── Subtask
│             │    ├── Checklist
│             │    ├── Comment
│             │    ├── Attachment
│             │    └── Activity
│             │
│             └── View
│
└── Template
```

## 3.2 Task là entity trung tâm

Task phải là một entity có khả năng mở rộng, không chỉ chứa `title` và `done`.

Task có thể:

- thuộc Project;
- thuộc Database;
- có Parent Task;
- có Subtasks;
- có Dependency;
- có Relation;
- có Assignee;
- có Properties;
- có Checklist;
- có Comments;
- có Attachments;
- có Activity;
- có Reminder;
- có Recurrence;
- có Time Tracking.

---

# 4. Workspace

Workspace là vùng quản lý cấp cao nhất.

## 4.1 Chức năng

- Create workspace.
- Rename workspace.
- Delete workspace.
- Archive workspace.
- Restore workspace.
- Favorite workspace.
- Pin workspace.
- Reorder workspace.
- Set icon.
- Set color.
- Workspace settings.
- Member management.
- Permission management.

## 4.2 Ví dụ

```text
Personal OS
│
├── Cá nhân
│   ├── Việc cá nhân
│   ├── Học tập
│   └── Tài chính
│
├── Công việc
│   ├── Project A
│   ├── Project B
│   └── Meeting
│
└── Quân sự
    ├── Huấn luyện
    ├── Nhân sự
    └── Công việc đơn vị
```

---

# 5. Folder

Folder dùng để tổ chức Project/Database.

## Chức năng

- Create.
- Rename.
- Delete.
- Archive.
- Reorder.
- Nest folder nếu cần.
- Move Project vào Folder.
- Move Database vào Folder.

Folder chỉ phục vụ tổ chức, không được làm thay đổi bản chất dữ liệu Task.

---

# 6. Project

Project là tập hợp các Task có chung mục tiêu.

## 6.1 Project properties

```text
id
name
description
icon
cover
owner
members
status
priority
startDate
dueDate
progress
tags
createdAt
updatedAt
archivedAt
```

## 6.2 Project dashboard

Phải hỗ trợ các metric cơ bản:

```text
Total Tasks
Completed Tasks
In Progress Tasks
Todo Tasks
Overdue Tasks
Today's Tasks
This Week Tasks
Completion Rate
Progress
```

Có thể mở rộng:

- Burndown.
- Workload.
- Task distribution.
- Timeline.
- Estimated vs Actual Time.

---

# 7. Database

Database là nền tảng để đạt hành vi giống Notion.

Một Database chứa:

```text
Database
├── Schema / Properties
├── Records / Tasks
└── Views
```

## 7.1 Nguyên tắc

Không tạo database riêng cho:

- Table View.
- Board View.
- Calendar View.
- List View.
- Gantt View.

Tất cả View phải sử dụng cùng một nguồn dữ liệu.

```text
Database
    ↓
Tasks
    ↓
Views
```

---

# 8. Task

## 8.1 Task core fields

Task tối thiểu phải hỗ trợ:

```text
id
title
description
status
priority
assignee
creator
projectId
databaseId
parentTaskId
startDate
dueDate
createdAt
updatedAt
completedAt
archivedAt
```

## 8.2 Task mở rộng

```text
tags
properties
relations
dependencies
checklists
attachments
comments
reminders
recurrence
timeEntries
activityLog
```

---

# 9. Task Status

Không hard-code chỉ:

```text
Todo
Doing
Done
```

Status phải configurable.

## 9.1 Ví dụ

```text
Not Started
Planning
In Progress
Blocked
Review
Testing
Completed
Cancelled
```

## 9.2 Status group

Status có thể thuộc group:

```text
TODO
├── Not Started
└── Planning

IN_PROGRESS
├── In Progress
└── Testing

DONE
├── Completed
└── Cancelled
```

Group dùng cho Board và reporting.

---

# 10. Priority

Hỗ trợ mặc định:

```text
Urgent
High
Medium
Low
None
```

Phải thiết kế để có thể custom.

---

# 11. Assignee

Task có thể giao cho:

- Một người.
- Nhiều người.
- Chính người dùng.
- Team.

Assignee phải có relation với Personnel/User module khi module nhân sự tồn tại.

---

# 12. Date Management

Task phải hỗ trợ:

```text
createdAt
startDate
dueDate
completedAt
```

Mở rộng:

```text
startDateTime
dueDateTime
duration
timezone
reminders
```

Task có thể có:

- Start date.
- Due date.
- Exact time.
- Reminder.
- Duration.

---

# 13. Subtask

Subtask phải được xem là Task.

Không tạo một model hoàn toàn khác cho Subtask.

```text
Task
└── Subtask
    └── Subtask
```

Có thể hỗ trợ nested depth, nhưng phải giới hạn hợp lý để tránh cấu trúc quá sâu.

Subtask phải có thể:

- Assign.
- Set status.
- Set priority.
- Set deadline.
- Comment.
- Attach file.
- Relation.
- Dependency.

---

# 14. Checklist

Checklist là lightweight item bên trong Task.

Ví dụ:

```text
Deploy API

[x] Build Docker
[x] Run migration
[x] Test API
[ ] Deploy production
[ ] Check logs
```

Checklist khác Subtask:

| Subtask | Checklist |
|---|---|
| Là Task entity | Không phải Task entity |
| Có ID riêng | Thuộc Task |
| Có Assignee | Không bắt buộc |
| Có Deadline | Không |
| Có Comment | Không |
| Có Relation | Không |
| Có thể xuất hiện trong View | Không |

---

# 15. Tags

Task hỗ trợ nhiều Tags.

Ví dụ:

```text
frontend
backend
bug
feature
urgent
personal
military
finance
```

Một Task có thể có nhiều tag.

---

# 16. Custom Properties

Đây là một requirement quan trọng.

Người dùng phải có thể định nghĩa Property cho Database.

## 16.1 Property types

Tối thiểu:

```text
Text
Number
Boolean
Date
DateTime
Select
Multi Select
Status
Person
Email
URL
Phone
File
Relation
Rollup
Formula
```

## 16.2 Ví dụ

```text
Task Database

Title          Text
Status         Status
Priority       Select
Assignee       Person
Due Date       Date
Budget         Number
Progress       Number
Department     Select
Tags           Multi Select
Project        Relation
```

## 16.3 Property architecture

Không hard-code từng field thành một database column nếu kiến trúc đã hỗ trợ dynamic properties.

Khuyến nghị:

```text
PropertyDefinition
    ↓
PropertyValue
    ↓
Task
```

Property Definition chứa:

```text
id
databaseId
name
type
configuration
required
defaultValue
position
createdAt
updatedAt
```

---

# 17. Views

Một Database có nhiều View.

## 17.1 View types

```text
List
Table
Board
Calendar
Timeline
Gantt
Gallery
```

## 17.2 View definition

View nên chứa:

```text
id
databaseId
name
type
filters
sorts
groups
visibleProperties
propertyOrder
configuration
position
createdAt
updatedAt
```

View không chứa bản sao Task.

---

# 18. List View

Hiển thị Task dạng danh sách.

Ví dụ:

```text
Task                         Status       Priority     Due
------------------------------------------------------------
Build database               Done         High         Aug 15
Build transaction            Progress     High         Aug 18
Build budget                 Todo         Medium       Aug 20
Build report                 Todo         Low          Aug 25
```

Hỗ trợ:

- Search.
- Filter.
- Sort.
- Group.
- Hide Property.
- Reorder Property.
- Inline Edit.
- Drag & Drop nếu phù hợp.

---

# 19. Table View

Hiển thị database dạng bảng.

Ví dụ:

```text
| Task | Status | Priority | Assignee | Due |
|------|--------|----------|----------|-----|
| API  | Doing  | High     | Lam      | 18/8 |
| UI   | Todo   | Medium   | A        | 20/8 |
```

Hỗ trợ:

- Add column.
- Remove column.
- Reorder column.
- Resize column.
- Inline editing.
- Sort.
- Filter.
- Group.

---

# 20. Board View

Kanban board.

Ví dụ:

```text
TODO
├── Task A
└── Task B

IN PROGRESS
├── Task C
└── Task D

REVIEW
└── Task E

DONE
└── Task F
```

Hỗ trợ:

- Drag & Drop.
- Move status.
- Move group.
- Group by property.

Có thể Group by:

```text
Status
Assignee
Priority
Project
Custom Select
```

---

# 21. Calendar View

Task được hiển thị theo ngày.

Hỗ trợ:

- Month.
- Week.
- Day nếu cần.
- Drag Task.
- Change due date.
- Change start date.
- Create Task.
- Filter.

---

# 22. Timeline View

Timeline dựa trên:

```text
startDate
dueDate
```

Ví dụ:

```text
Database       ████████
API                    █████████
Frontend                      ███████████
Testing                                ███████
Deploy                                       ███
```

Hỗ trợ:

- Drag start.
- Drag end.
- Resize duration.
- Dependency visualization.

---

# 23. Gantt View

Gantt là project planning view.

Phải hỗ trợ:

- Task hierarchy.
- Start date.
- End date.
- Duration.
- Dependency.
- Progress.
- Milestone nếu cần.

---

# 24. Gallery View

Gallery phù hợp với Task có:

- Cover.
- Image.
- Attachment.
- Visual content.

Có thể hiển thị Task dạng card.

---

# 25. Filter Engine

Filter phải là generic engine.

## 25.1 Operators

```text
=
!=
>
<
>=
<=
contains
not contains
starts with
ends with
is empty
is not empty
before
after
between
```

## 25.2 Logical operators

```text
AND
OR
NOT
```

## 25.3 Ví dụ

```text
(
    Priority = High
    OR
    Priority = Urgent
)
AND
Status != Completed
```

Filter phải hoạt động trên cả built-in properties và custom properties.

---

# 26. Sort Engine

Hỗ trợ multi-level sort.

Ví dụ:

```text
1. Priority DESC
2. Due Date ASC
3. Created At DESC
```

Sort phải có:

```text
property
direction
position
```

---

# 27. Group Engine

Cho phép Group theo property.

Ví dụ:

```text
Group by Status
```

hoặc:

```text
Group by Assignee
```

Kết quả:

```text
Lam
├── Task A
├── Task B

Nguyen A
├── Task C
└── Task D
```

---

# 28. Search

Search phải hỗ trợ:

- Task title.
- Description.
- Tags.
- Comments nếu cần.
- Property values.
- Project.
- Assignee.

Nên hỗ trợ advanced syntax:

```text
priority:high
status:doing
assignee:lam
project:finance
```

Có thể mở rộng:

```text
due:today
due:overdue
tag:backend
```

---

# 29. Dependency

Task hỗ trợ:

```text
Blocks
Blocked By
Related To
```

Ví dụ:

```text
Database
    ↓
API
    ↓
Frontend
    ↓
Testing
    ↓
Deploy
```

Task phải biết:

```text
blockedBy[]
blocks[]
relatedTasks[]
```

Dependency dùng cho:

- Gantt.
- Timeline.
- Project planning.
- AI planning.
- Blocked task detection.

---

# 30. Relation

Relation là cơ chế kết nối Task với entity khác.

Task có thể relation tới:

```text
Project
Person
Meeting
Document
Transaction
Military Personnel
Training
Other Task
```

Ví dụ:

```text
Task:
Hoàn thành báo cáo tháng 8

Related:
├── Project: Finance
├── Person: Nguyễn Văn A
├── Meeting: Monthly Review
└── Document: Báo cáo tháng 8
```

Relation phải được thiết kế generic để các module khác có thể dùng lại.

---

# 31. Rollup

Nếu có Relation, cần chuẩn bị kiến trúc cho Rollup.

Ví dụ:

```text
Project
    ↓ relation
Tasks
    ↓
Rollup:
Completed Tasks = 15
Total Tasks = 20
Progress = 75%
```

Rollup có thể hỗ trợ:

```text
COUNT
SUM
AVERAGE
MIN
MAX
```

---

# 32. Formula

Formula là advanced feature.

Ví dụ:

```text
Progress = Completed Subtasks / Total Subtasks
```

Hoặc:

```text
Remaining Budget = Budget - Actual
```

Formula engine phải được sandboxed và không được phép thực thi arbitrary code.

---

# 33. Comments

Task hỗ trợ comment.

Comment:

```text
id
taskId
authorId
content
mentions
attachments
parentCommentId
createdAt
updatedAt
deletedAt
```

Hỗ trợ:

- Mention.
- Reply.
- Attachment.
- Edit.
- Delete.
- Emoji reaction nếu cần.

---

# 34. Activity Log

Mọi thay đổi quan trọng phải có Activity.

Ví dụ:

```text
10:20 Lam created task.

10:30 Lam changed priority:
Medium → High

11:05 Nguyễn A assigned.

13:20 Status changed:
Todo → In Progress

16:40 Due date changed:
18/08 → 20/08
```

Activity phải immutable hoặc hạn chế chỉnh sửa.

Dùng cho:

- Audit.
- Debug.
- History.
- User transparency.

---

# 35. Attachment

Task hỗ trợ file:

```text
Image
PDF
Word
Excel
Video
Other
```

Attachment nên có:

```text
id
taskId
fileName
mimeType
size
storageKey
uploadedBy
createdAt
```

Không lưu binary trực tiếp trong Task record.

---

# 36. Notification

Notification khi:

- Được assign.
- Được mention.
- Có comment.
- Có reply.
- Deadline sắp đến.
- Task overdue.
- Dependency thay đổi.
- Status thay đổi.
- Task được chuyển cho user.

---

# 37. Reminder

Task có thể có nhiều Reminder.

Ví dụ:

```text
Due:
18/08/2026 17:00

Reminders:
17/08 08:00
18/08 08:00
18/08 15:00
```

Reminder phải là entity độc lập để có thể reschedule/cancel.

---

# 38. Recurring Task

Hỗ trợ:

```text
Daily
Weekly
Monthly
Yearly
Custom
```

Ví dụ:

```text
Báo cáo hàng tuần
Every Monday 08:00
```

Khuyến nghị lưu recurrence rule thay vì chỉ copy task.

Có thể dùng chuẩn tương đương:

```text
FREQ=WEEKLY;BYDAY=MO
```

Recurring Task phải xử lý:

- Next occurrence.
- Skip occurrence.
- Complete occurrence.
- Pause recurrence.
- Stop recurrence.
- End date.
- Count limit.

---

# 39. Time Tracking

Task hỗ trợ:

```text
Estimated Time
Actual Time
Time Entries
```

Timer:

```text
Start
Pause
Resume
Stop
```

Time Entry:

```text
id
taskId
userId
startAt
endAt
duration
note
```

Dashboard:

```text
Estimated: 40h
Actual: 46h
Variance: +6h
```

---

# 40. Template

Task Template cho phép tạo Task/Project có cấu trúc sẵn.

Ví dụ:

```text
Software Feature

├── Requirement
├── UI
├── Backend
├── Frontend
├── Testing
├── Review
└── Deploy
```

Template có thể lưu:

- Task title pattern.
- Description.
- Properties.
- Status.
- Priority.
- Checklist.
- Subtasks.
- Dependencies.
- Tags.
- Relations nếu có thể resolve.

---

# 41. Inbox

Inbox là nơi chứa Task chưa được tổ chức.

Ví dụ:

```text
INBOX

+ Ý tưởng làm AI Assistant
+ Kiểm tra tài khoản ngân hàng
+ Gọi cho Nguyễn A
+ Chuẩn bị báo cáo
```

Workflow:

```text
Inbox
  ↓
Clarify
  ↓
Assign Project
  ↓
Set Priority
  ↓
Schedule
```

Inbox không phải Project.

---

# 42. My Day

My Day là danh sách công việc tập trung trong ngày.

```text
MY DAY — 16 AUGUST

Top Priority
├── Finish Transaction
├── Review API
└── Deploy staging

Other Tasks
├── Meeting
├── Documentation
└── Email
```

My Day nên là một logical view/filter, không duplicate Task.

---

# 43. Dashboard

Dashboard hiển thị:

```text
Today
Overdue
This Week
Completed
High Priority
Blocked
Progress
```

Có thể mở rộng:

```text
Task Completion Rate
Workload
Estimated vs Actual
Project Progress
Productivity Trend
```

Dashboard không nên lưu dữ liệu aggregate nếu có thể tính từ source of truth hoặc cache có invalidation rõ ràng.

---

# 44. Archive / Trash

Task lifecycle:

```text
ACTIVE
  ↓
ARCHIVED
  ↓
TRASH
  ↓
PERMANENT DELETE
```

Hỗ trợ:

- Archive.
- Restore.
- Move to Trash.
- Restore from Trash.
- Permanent Delete.

Soft delete là mặc định.

---

# 45. Automation

Automation có cấu trúc:

```text
Trigger
   ↓
Condition
   ↓
Action
```

## Trigger

Ví dụ:

```text
Task Created
Status Changed
Priority Changed
Due Date Reached
Task Completed
Task Assigned
```

## Condition

```text
Status = Done
Priority = High
Assignee = Lam
Project = Finance
```

## Action

```text
Change Status
Change Priority
Assign User
Create Task
Add Tag
Send Notification
Create Reminder
Update Property
```

Ví dụ:

```text
WHEN
Task status = Done

THEN
Create next task
```

---

# 46. AI Integration

AI phải được coi là integration layer, không được hard-code AI logic vào Task entity.

AI có thể:

## 46.1 Task Breakdown

Input:

```text
Xây dựng Finance Module trong 2 tuần.
```

AI tạo:

```text
Finance Module
├── Database
│   ├── Account
│   ├── Transaction
│   ├── Category
│   └── Budget
├── Transaction
│   ├── Income
│   ├── Expense
│   └── Transfer
├── Budget
└── Report
```

## 46.2 AI Planning

AI có thể:

- Estimate duration.
- Detect dependencies.
- Suggest schedule.
- Suggest priority.
- Suggest assignee.
- Detect overloaded user.
- Detect blocked tasks.

## 46.3 AI Summary

AI có thể tạo:

```text
Project Summary
Completed:
29

In Progress:
8

Blocked:
2

Overdue:
3

Main Risks:
- API delayed
- Testing dependency unresolved
```

## 46.4 AI Reschedule

Nếu task quá hạn:

```text
Task A overdue
   ↓
AI evaluates dependencies
   ↓
Suggest new schedule
```

AI không được tự động thay đổi dữ liệu quan trọng nếu chưa có policy/permission phù hợp.

---

# 47. Personal OS Integration

Task Module phải thiết kế để trở thành trung tâm kết nối các module.

## 47.1 Task + Personnel

```text
Task
↓
Assignee
↓
Personnel
├── Name
├── Rank
├── Position
└── Unit
```

## 47.2 Task + Finance

```text
Task
↓
Related Transaction
↓
Finance
```

Ví dụ:

```text
Task:
Mua thiết bị

Budget:
5,000,000

Actual:
4,700,000
```

## 47.3 Task + Training

```text
Training
├── Task: Chuẩn bị thao trường
├── Task: Kiểm tra vũ khí
├── Task: Điểm danh
└── Task: Tổng hợp kết quả
```

## 47.4 Task + Document

```text
Task
↓
Document
```

## 47.5 Task + Meeting

```text
Meeting
↓
Tasks
├── Action A
├── Action B
└── Action C
```

---

# 48. Universal Relation Architecture

Personal OS nên chuẩn bị một Relation layer dùng chung.

```text
                 Universal Relation
                        │
       ┌────────────────┼────────────────┐
       │                │                │
      Task           Person          Transaction
       │                │                │
       ├───────────────┼────────────────┤
       │                │                │
    Project          Meeting         Training
       │
    Document
```

Mục tiêu:

- Không tạo relation riêng cho từng cặp module.
- Các entity có thể liên kết lẫn nhau.
- AI có thể truy vấn context xuyên module.
- MapNode có thể biểu diễn graph của hệ thống.

---

# 49. Task Entity — Recommended Conceptual Model

```text
Task
├── Identity
│   ├── id
│   ├── title
│   └── description
│
├── Organization
│   ├── workspaceId
│   ├── folderId
│   ├── projectId
│   ├── databaseId
│   └── parentTaskId
│
├── Workflow
│   ├── status
│   ├── priority
│   └── assignee
│
├── Schedule
│   ├── startDate
│   ├── dueDate
│   ├── duration
│   └── reminders
│
├── Metadata
│   ├── tags
│   └── customProperties
│
├── Relations
│   ├── dependencies
│   ├── relatedEntities
│   └── relations
│
├── Collaboration
│   ├── comments
│   ├── attachments
│   └── activity
│
├── Execution
│   ├── checklist
│   ├── subtasks
│   └── timeEntries
│
├── Automation
│   └── recurrence
│
└── Lifecycle
    ├── createdAt
    ├── updatedAt
    ├── completedAt
    ├── archivedAt
    └── deletedAt
```

---

# 50. Non-Functional Requirements

## 50.1 Performance

Phải đảm bảo:

- List View không load toàn bộ database nếu không cần.
- Pagination hoặc cursor pagination.
- Lazy loading.
- Virtualized list/table.
- Query filter ở data layer.
- Không filter hàng nghìn record bằng UI nếu backend/local database có thể filter.
- Cache hợp lý.
- Optimistic update cho thao tác nhẹ.

## 50.2 Offline

Nếu Personal OS hỗ trợ offline:

```text
UI
 ↓
Local Database
 ↓
Sync Engine
 ↓
Remote API
```

Task mutation cần có:

```text
local mutation
sync queue
retry
conflict handling
sync status
```

## 50.3 Reliability

Các thao tác quan trọng phải:

- Idempotent khi phù hợp.
- Có transaction.
- Có audit log.
- Không làm mất dữ liệu khi network failure.

---

# 51. Permission

Chuẩn bị permission theo:

```text
Workspace
Project
Database
Task
```

Permission cơ bản:

```text
Owner
Admin
Editor
Commenter
Viewer
```

Nếu là Personal OS single-user thì có thể đơn giản hóa ở MVP nhưng không nên khóa kiến trúc khiến sau này không thể mở rộng.

---

# 52. UX Requirements

## Task creation

Phải tạo Task nhanh.

Các cách:

```text
+ New Task
Quick Add
Keyboard Shortcut
Inbox
AI
From Template
```

## Quick Add

Ví dụ user nhập:

```text
Fix API Transaction tomorrow #backend @Lam !high
```

Parser có thể nhận:

```text
Title:
Fix API Transaction

Due:
Tomorrow

Tag:
backend

Assignee:
Lam

Priority:
High
```

Quick Add có thể triển khai sau MVP.

---

# 53. Keyboard Shortcut

Nên chuẩn bị:

```text
N
New Task

/
Search

Ctrl/Cmd + K
Command Palette

E
Edit

Space
Complete

Delete
Move to Trash

Ctrl/Cmd + Enter
Save
```

Shortcut phải configurable nếu cần.

---

# 54. Responsive

Module phải hoạt động tốt trên:

```text
Desktop
Tablet
Mobile
```

Desktop:

```text
Sidebar
+
Main View
+
Task Detail Panel
```

Mobile:

```text
Bottom Navigation
+
Task List
+
Task Detail
```

Không cố ép Table/Gantt desktop thành giao diện mobile nếu UX không phù hợp.

---

# 55. State Management

State nên chia:

```text
Server / Repository State
UI State
View State
Filter State
Editor State
```

Không để toàn bộ Task Module nằm trong một global state duy nhất.

---

# 56. API / Repository Requirements

Repository layer nên có các operation:

```text
createTask()
getTask()
updateTask()
deleteTask()
archiveTask()
restoreTask()

createSubtask()
moveTask()
duplicateTask()

createProperty()
updateProperty()
deleteProperty()

createView()
updateView()
deleteView()

addComment()
updateComment()
deleteComment()

addAttachment()
removeAttachment()

addDependency()
removeDependency()

createRelation()
removeRelation()

createReminder()
deleteReminder()

startTimeTracking()
stopTimeTracking()
```

Có thể mở rộng theo implementation stack.

---

# 57. Query Requirements

Query phải hỗ trợ:

```text
getTasks()
getTaskById()
getTasksByProject()
getTasksByAssignee()
getTasksByStatus()
getTasksByDateRange()
getOverdueTasks()
getTodayTasks()
getInboxTasks()
getMyDayTasks()
searchTasks()
```

Advanced query:

```text
filter
sort
group
pagination
search
includeRelations
```

---

# 58. Mutation Requirements

Mutation phải hỗ trợ optimistic update nếu UX cần.

Các mutation chính:

```text
Create
Update
Delete
Archive
Restore
Move
Assign
Complete
Reopen
Duplicate
Bulk Update
Bulk Delete
Bulk Archive
```

Bulk operations là requirement quan trọng cho Table/List.

---

# 59. Bulk Operations

User có thể chọn nhiều Task:

```text
[x] Task A
[x] Task B
[x] Task C
```

Sau đó:

```text
Change Status
Change Priority
Assign
Move Project
Add Tag
Remove Tag
Archive
Delete
```

---

# 60. Undo

Các thao tác destructive nên có Undo.

Ví dụ:

```text
Task moved to trash.

[Undo]
```

Undo nên hỗ trợ ít nhất các thao tác UI quan trọng.

---

# 61. Empty States

Mỗi View phải có Empty State.

Ví dụ:

```text
No tasks yet.

Create your first task
```

Filter không có kết quả:

```text
No tasks match your filters.

Clear filters
```

---

# 62. Error Handling

Không được để UI crash khi:

- Task không tồn tại.
- Permission denied.
- Network failure.
- Invalid property.
- Invalid relation.
- Dependency cycle.
- File upload failed.
- Sync conflict.

Error phải có:

```text
user-friendly message
technical error code
logging context
retry option nếu phù hợp
```

---

# 63. Dependency Cycle Protection

Không cho phép tạo:

```text
A blocks B
B blocks C
C blocks A
```

Hệ thống phải detect cycle trước khi lưu dependency.

---

# 64. Data Integrity

Các invariant quan trọng:

1. Task phải thuộc Workspace/Database hợp lệ theo domain model.
2. Parent Task không được là chính nó.
3. Không tạo circular parent-child.
4. Dependency không được tạo cycle.
5. Deleted entity không được tiếp tục được relation nếu policy không cho phép.
6. View phải trỏ tới Database tồn tại.
7. Property phải thuộc Database hợp lệ.
8. Relation phải kiểm tra quyền truy cập entity.
9. Activity không được làm thay đổi source data.
10. Soft deleted Task không xuất hiện trong View mặc định.

---

# 65. MVP Scope

Không triển khai toàn bộ ngay từ đầu.

## Phase 1 — Core Task

Bắt buộc:

```text
Task
Subtask
Checklist
Status
Priority
Assignee
Due Date
Tags
Project
Search
Create
Edit
Delete
Complete
Archive
```

## Phase 2 — Database

```text
Custom Properties
Table
List
Board
Filter
Sort
Group
Saved View
```

## Phase 3 — Project Management

```text
Calendar
Timeline
Gantt
Dependency
Recurring Task
Time Tracking
Dashboard
Template
```

## Phase 4 — Intelligence

```text
Relation
Rollup
Formula
Automation
AI Breakdown
AI Planning
AI Summary
Cross-module Relation
Global Search
Command Palette
```

---

# 66. MVP Acceptance Criteria

MVP chỉ được xem là hoàn thành khi:

- User có thể tạo Task.
- User có thể sửa Task.
- User có thể hoàn thành Task.
- User có thể tạo Subtask.
- User có thể tạo Checklist.
- User có thể assign Task.
- User có thể set Status.
- User có thể set Priority.
- User có thể set Due Date.
- User có thể tag Task.
- User có thể đưa Task vào Project.
- User có thể tìm Task.
- User có thể archive Task.
- User có thể restore Task.
- User có thể xem Task dạng List.
- User có thể xem Task dạng Table.
- User có thể xem Task dạng Board.
- Filter hoạt động.
- Sort hoạt động.
- Group hoạt động.
- Các View cùng sử dụng một nguồn dữ liệu.
- Không có duplicate Task record chỉ vì khác View.
- Activity Log ghi lại các thay đổi quan trọng.
- Không tạo dependency cycle.
- Không crash khi Task/Project không tồn tại.
- Permission được kiểm tra ở data layer.

---

# 67. AI Implementation Rules

Đây là phần quan trọng nhất khi sử dụng tài liệu này cho AI coding agent.

## Rule 1 — Không tự ý thay đổi architecture

AI phải đọc:

```text
Project Architecture
Task Management Specification
Shared Core Rules
Database Rules
State Management Rules
UI Rules
```

trước khi triển khai.

## Rule 2 — Không tạo duplicate domain model

Không tạo:

```text
TodoTask
ProjectTask
BoardTask
CalendarTask
```

Sai.

Phải dùng:

```text
Task
```

và:

```text
View
```

để thay đổi cách hiển thị.

## Rule 3 — View không sở hữu dữ liệu Task

Sai:

```text
BoardTask
CalendarTask
ListTask
```

Đúng:

```text
Task
  ↓
View
```

## Rule 4 — Subtask là Task

Không tạo một architecture riêng cho Subtask nếu không có lý do rõ ràng.

## Rule 5 — Custom Property phải extensible

Không hard-code toàn bộ custom property vào model.

## Rule 6 — Relation phải generic

Không thiết kế:

```text
TaskToPersonRelation
TaskToTransactionRelation
TaskToDocumentRelation
```

thành nhiều hệ thống hoàn toàn riêng biệt.

Ưu tiên Universal Relation.

## Rule 7 — Source of Truth

Task Database là source of truth.

Dashboard/View/Cache chỉ là derived state.

## Rule 8 — Business logic không nằm trong UI

UI chỉ:

```text
Display
Input
Interaction
```

Business logic nằm ở:

```text
Domain / Application / Repository / Service
```

tùy architecture của project.

## Rule 9 — Destructive action phải safe

Delete mặc định là soft delete hoặc Trash.

## Rule 10 — Mọi implementation phải test được

Mỗi feature quan trọng phải có:

```text
Unit Test
Repository Test
State/Application Test nếu phù hợp
Widget/UI Test nếu phù hợp
Integration Test cho critical flow
```

---

# 68. Recommended Development Order

AI nên triển khai theo thứ tự:

```text
1. Domain entities
        ↓
2. Database schema
        ↓
3. Repository interfaces
        ↓
4. Repository implementation
        ↓
5. Use cases / application services
        ↓
6. State management
        ↓
7. Basic Task UI
        ↓
8. List View
        ↓
9. Table View
        ↓
10. Board View
        ↓
11. Filter / Sort / Group
        ↓
12. Project
        ↓
13. Calendar
        ↓
14. Dependency
        ↓
15. Recurrence
        ↓
16. Comments / Attachment / Activity
        ↓
17. Template
        ↓
18. Dashboard
        ↓
19. Relation
        ↓
20. Automation
        ↓
21. AI
```

Không nên bắt đầu từ UI trước khi domain model và data model ổn định.

---

# 69. Definition of Done

Một feature chỉ được xem là Done khi:

```text
[ ] Requirement được hiểu rõ
[ ] Domain model hoàn chỉnh
[ ] Data model hoàn chỉnh
[ ] Repository hoàn chỉnh
[ ] Business logic hoàn chỉnh
[ ] UI hoàn chỉnh
[ ] Loading state
[ ] Empty state
[ ] Error state
[ ] Permission check
[ ] Validation
[ ] Unit test
[ ] Integration test nếu cần
[ ] Activity log nếu là mutation quan trọng
[ ] Documentation cập nhật
[ ] MapNode cập nhật
```

---

# 70. MapNode Integration

Task Module phải cập nhật MapNode khi có thay đổi architecture hoặc domain.

MapNode nên ghi:

```text
Task Management
│
├── Task
├── Project
├── Database
├── Property
├── View
├── Dependency
├── Relation
├── Automation
└── AI
```

MapNode phải phản ánh:

- Entity.
- Relationship.
- Dependency.
- Important business rule.
- Feature boundary.
- Data flow.
- Integration point.

Mục tiêu là để AI coding agent không cần quét toàn bộ project mỗi lần xử lý Task Module.

---

# 71. Future Extensions

Kiến trúc nên để mở cho:

```text
OKR
Habit
Goal
Milestone
Calendar Event
Meeting Action
Knowledge Base
Document
CRM
Personal Finance
Personnel
Training
AI Agent
Workflow Engine
```

Nhưng không triển khai những phần này trong MVP nếu chưa có requirement cụ thể.

---

# 72. Core Design Principle

Toàn bộ module phải tuân thủ mô hình:

```text
                PERSONAL OS
                     │
             ┌───────┴───────┐
             │               │
          Entities        Relations
             │               │
     ┌───────┼───────────────┼───────┐
     │       │               │       │
    Task   Person        Transaction Project
     │
     ├── Properties
     ├── Relations
     ├── Dependencies
     └── Activities
             │
             ↓
          Database
             │
             ↓
            Views
             │
      ┌──────┼──────┬────────┬────────┐
      │      │      │        │        │
     List   Table  Board   Calendar  Gantt
```

**Nguyên tắc quan trọng nhất:**

> Task là dữ liệu. View chỉ là cách nhìn dữ liệu. Relation kết nối dữ liệu. Property mô tả dữ liệu. Automation tác động lên dữ liệu. AI hiểu và hỗ trợ dữ liệu.

Đây là nền tảng để Task Management không chỉ là Todo List mà trở thành **Work Management Engine của Personal OS**.
