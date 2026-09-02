# Training Module — Quản lý huấn luyện chiến sĩ

## Mục tiêu
Quản lý chương trình, nội dung, lịch, điểm danh, kết quả và đánh giá huấn luyện.

## Entities
- Soldier.
- TrainingProgram.
- TrainingSubject.
- TrainingSession.
- Attendance.
- TrainingResult.
- Evaluation.

## Workflow
```text
Program
  -> Subjects
  -> Sessions
  -> Assigned Soldiers
  -> Attendance
  -> Results
  -> Evaluation
```

## Training session
Một session có:
- subject.
- date/time.
- location.
- instructor.
- objectives.
- participants.
- status.

## Result
Kết quả phải có:
- soldier.
- subject/session.
- score hoặc grading scheme.
- evaluator.
- evaluatedAt.
- note.

Không hard-code một grading scale duy nhất. Thiết kế grading strategy/configuration để mở rộng.

## Reports
- Tỷ lệ tham gia.
- Kết quả theo chiến sĩ.
- Kết quả theo nội dung.
- Tiến bộ theo thời gian.
- Danh sách cần cải thiện.

## Integrity
Không cho phép sửa/xóa kết quả đã khóa nếu user không có permission đặc biệt.
Nên có audit log.

## Privacy
Dữ liệu quân nhân/huấn luyện phải giới hạn theo role/scope.
Không trả về dữ liệu ngoài phạm vi authorization.
