# AI Assistant & RAG

## Mục tiêu
AI hỗ trợ phân tích dữ liệu và hỏi đáp trên tài liệu, nhưng không được trở thành source of truth.

## Use cases
### Finance
- phân tích chi tiêu.
- tóm tắt.
- phát hiện xu hướng.

### Training
- tổng hợp kết quả.
- gợi ý nội dung cần cải thiện dựa trên dữ liệu được phép truy cập.

### Manual
- hỏi đáp tài liệu.
- tóm tắt.
- tìm quy định liên quan.

## RAG pipeline
```text
Document
 -> Extract
 -> Clean
 -> Chunk
 -> Embedding
 -> PostgreSQL + pgvector

Question
 -> Query embedding
 -> Similarity search
 -> Authorization filter
 -> Context
 -> LLM
 -> Answer + citations
```

## Security
Authorization phải được áp dụng trước khi đưa document chunks vào AI context.
AI không được truy cập dữ liệu mà user không có permission.

## Hallucination control
- Ưu tiên trả lời dựa trên retrieved context.
- Khi không đủ context phải nói rõ không đủ dữ liệu.
- Câu trả lời về tài liệu nên có citation tới document/version/section.

## Provider abstraction
Không hard-code một AI vendor trong domain.
Tạo interface như:
- IEmbeddingService.
- IChatCompletionService.
- IRagRetriever.

Infrastructure implement provider cụ thể.

## Cost control
- Cache embeddings.
- Không embed lại version không đổi.
- Giới hạn context.
- Theo dõi token/cost nếu provider hỗ trợ.
