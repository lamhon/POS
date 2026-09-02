# F4 → F5 Implementation Order

```text
F0 Repository
   ↓
F1 Frontend Bootstrap
   ↓
F2 Backend Bootstrap
   ↓
F3 Database Foundation
   ↓
F4 Authentication & Authorization
   ↓
F5 App Shell & Design System
   ↓
F6 Finance MVP
```

## F4

Xây security boundary:
- User
- Password hashing
- Login/logout
- Access token
- Refresh token
- Role
- Permission
- Protected API
- Protected frontend routes

Không xây business module.

## F5

Xây authenticated application shell:
- Sidebar
- Header
- Navigation
- Breadcrumb
- User menu
- Responsive layout
- Theme
- Shared UI
- Loading/error/empty states
- Permission-aware navigation

Không xây business CRUD.

## Expected state

```text
User
 ↓
Login
 ↓
Authenticated Session
 ↓
Personal OS App Shell
 ├── Dashboard
 ├── Finance (placeholder)
 ├── Personnel (placeholder)
 ├── Training (placeholder)
 ├── Manual (placeholder)
 ├── Tasks (placeholder)
 └── Settings
```

Next phase: Finance MVP.
