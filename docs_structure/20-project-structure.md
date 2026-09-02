# Project Structure

## Repository
```text
personal-os/
├── apps/
│   ├── web/                  # Next.js
│   └── api/                  # ASP.NET Core
├── infrastructure/
│   ├── docker/
│   └── scripts/
├── docs/
├── mapnode/
├── tests/
└── README.md
```

## Frontend
```text
apps/web/
├── app/
├── components/
├── features/
├── hooks/
├── lib/
├── stores/
├── types/
└── config/
```

## Backend
```text
apps/api/
├── src/
│   ├── Api/
│   ├── Application/
│   ├── Domain/
│   ├── Infrastructure/
│   └── Modules/
└── tests/
```

## Documentation
`docs/` là kiến thức kiến trúc/requirement.
`mapnode/` là context index tối ưu cho AI, mô tả quan hệ giữa file/module và điểm thay đổi.

## Rule
Không tạo folder generic kiểu `misc`, `helpers2`, `new`, `temp`.
Tên folder phải phản ánh responsibility.
