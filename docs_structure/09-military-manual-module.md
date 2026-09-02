# Military Manual Module — Sổ tay quân sự điện tử

## Mục tiêu
Quản lý tài liệu/sổ tay quân sự dạng có cấu trúc, searchable và có thể mở rộng AI.

## Content model
```text
Manual
  -> Category
  -> Document
      -> Version
          -> Sections
          -> Attachments
          -> Tags
```

## Document
Metadata:
- title.
- description.
- category.
- tags.
- status: draft/published/archived.
- version.
- author.
- publishedAt.

## Content
Không chỉ lưu một blob text nếu cần search theo chương/mục.
Nên lưu section/chapter có hierarchy.

## Files
File gốc lưu Object Storage.
Database lưu:
- object key.
- mime type.
- size.
- checksum.
- document version.
- createdAt.

## Search
Giai đoạn 1:
- PostgreSQL FTS + trigram.

Search fields:
- title.
- section title.
- content.
- tags.

## Bookmark
User có thể bookmark document/section.

## Versioning
Không overwrite nội dung published.
Tạo version mới khi chỉnh sửa tài liệu đã phát hành.

## AI readiness
Document phải có pipeline:
```text
File
 -> Extract text
 -> Normalize
 -> Chunk
 -> Embed
 -> pgvector
```
Embedding phải gắn document version.
