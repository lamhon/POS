# RBAC & Role Management — Implementation Specification

> **Document type:** Implementation Specification for AI  
> **Domain:** Human Resources / Workforce Management  
> **Purpose:** Define the complete Role, Permission, and Access Control system for a website used to manage personnel and work activities.

---

## 1. Objective

The Role system MUST implement a scalable RBAC (Role-Based Access Control) architecture.

The system MUST separate:

```text
User
  ↓
Role
  ↓
Permission
  ↓
Data Scope
  ↓
Access Decision
```

A Role is NOT a job title. A job title describes the employee's organizational position; a Role defines what the user can do inside the software.

Example:

```text
Employee
├── Position: Team Leader
├── Department: Development
└── Roles:
    └── Team Leader

Role: Team Leader
├── task.view
├── task.create
├── task.update
├── task.assign
└── employee.view

Scope:
└── Team
```

The same user MUST be able to have multiple Roles.

---

# 2. Core Concepts

## 2.1 User

Represents a person who can authenticate and use the system.

Suggested fields:

```text
id
name
email
avatar
status
created_at
updated_at
```

A User can have:

- zero or more Roles
- optional direct permissions
- access determined by effective permissions

---

## 2.2 Role

A Role is a reusable collection of permissions.

Suggested fields:

```text
id
name
description
icon
color
type              // SYSTEM | CUSTOM
status            // ACTIVE | ARCHIVED
created_at
updated_at
created_by
updated_by
```

Role types:

### SYSTEM

Built-in roles that cannot be freely deleted.

Examples:

```text
OWNER
ADMIN
MEMBER
```

### CUSTOM

Roles created by administrators.

Examples:

```text
MANAGER
HR_MANAGER
ACCOUNTANT
TEAM_LEADER
DEVELOPER
DESIGNER
```

---

## 2.3 Permission

A Permission represents one concrete action.

Permission format:

```text
<module>.<resource>.<action>
```

Examples:

```text
hr.employee.view
hr.employee.create
hr.employee.update
hr.employee.delete

task.task.view
task.task.create
task.task.update
task.task.delete
task.task.assign
task.task.complete

finance.transaction.view
finance.transaction.create
finance.transaction.update
finance.transaction.delete

workspace.workspace.view
workspace.workspace.create
workspace.workspace.update
workspace.workspace.delete

report.report.view
report.report.export
```

Permission names MUST be stable identifiers and MUST NOT depend on UI labels.

---

# 3. Permission Actions

The initial action set SHOULD include:

```text
view
create
update
delete
assign
complete
export
archive
restore
manage
```

Not every resource needs every action.

Example:

```text
Employee:
view
create
update
delete
export

Task:
view
create
update
delete
assign
complete
archive
restore
```

The system MUST allow adding new actions without changing the Role architecture.

---

# 4. Permission Matrix

The UI MUST provide a permission matrix.

Example:

```text
                         View   Create   Update   Delete   Export
Employees                 ✓       ✓        ✓        ✕        ✓
Tasks                     ✓       ✓        ✓        ✕        ✓
Workspaces                ✓       ✕        ✕        ✕        ✕
Finance                   ✓       ✓        ✕        ✕        ✓
Reports                   ✓       ✕        ✕        ✕        ✓
Documents                 ✓       ✓        ✓        ✕        ✓
```

Required UI actions:

```text
Select All
Clear All
Select Module
Clear Module
```

Permissions SHOULD be grouped by:

```text
Module
  └── Resource
      └── Action
```

---

# 5. Module Structure

The system SHOULD organize authorization using:

```text
Module
└── Resource
    └── Action
```

Example:

```text
Human Resources
├── Employee
│   ├── View
│   ├── Create
│   ├── Update
│   └── Delete
│
├── Attendance
│   ├── View
│   ├── Create
│   └── Update
│
└── Payroll
    ├── View
    ├── Create
    └── Update
```

This architecture MUST be reusable by future domains such as:

```text
HR
Tasks
Finance
Workspace
Documents
Reports
Military Personnel
Training
```

---

# 6. Data Scope

Permissions alone are insufficient.

The system MUST support data-level access scope.

Example:

```text
employee.view
```

does NOT automatically mean the user can view every employee.

Supported scopes:

```text
ALL
WORKSPACE
ORGANIZATION
DEPARTMENT
TEAM
ASSIGNED
OWN
CUSTOM
```

Examples:

```text
Manager:
employee.view → TEAM

Manager:
employee.update → TEAM

Manager:
task.view → TEAM

Staff:
task.view → ASSIGNED

Staff:
task.update → OWN
```

Scope MUST be evaluated by the backend, not only by the frontend.

---

# 7. Per-Permission Scope

A Role MUST be able to assign different scopes to different permissions.

Example:

```text
Role: Manager

employee.view
    scope = TEAM

employee.update
    scope = TEAM

employee.delete
    denied

task.view
    scope = TEAM

task.update
    scope = ASSIGNED

report.view
    scope = DEPARTMENT
```

Do NOT implement a single global scope for the entire Role.

---

# 8. Owner Role

The system MUST provide a special `OWNER` role.

Owner typically has:

```text
Manage users
Manage roles
Manage permissions
Manage workspaces
Manage organization
Manage billing
Delete workspace
Transfer ownership
```

The Owner MUST be protected from ordinary deletion or removal.

Ownership transfer SHOULD use a dedicated workflow:

```text
Transfer Ownership
    ↓
Select new owner
    ↓
Confirm
    ↓
Audit event
```

---

# 9. Admin Role

Admin is different from Owner.

Recommended Admin permissions:

```text
Manage users
Manage employees
Manage roles
Manage permissions
Manage tasks
View reports
Manage workspace settings
```

Admin SHOULD NOT automatically receive:

```text
Transfer ownership
Delete workspace permanently
Manage billing
```

unless explicitly configured.

---

# 10. Multiple Roles per User

A User MUST support multiple Roles.

Example:

```text
Nguyen Van A

Roles:
├── Manager
└── Accountant
```

Effective permissions are the union of all allowed permissions.

```text
Manager
├── employee.*
└── task.*

Accountant
└── finance.*

Effective permissions:
├── employee.*
├── task.*
└── finance.*
```

The system MUST avoid duplicated permission records in the effective permission result.

---

# 11. User Role Assignment

Employee/User detail MUST contain an access control section.

Example:

```text
Access Control

Roles
────────────────────────
☑ Manager
☑ Accountant

[Add Role]
[Remove Role]
```

Required actions:

```text
Assign Role
Remove Role
View Role
View Effective Permissions
```

Only users with the appropriate permission may modify role assignments.

---

# 12. Direct User Permissions

V1 SHOULD avoid direct user permissions unless there is a strong business requirement.

If implemented later:

```text
User
├── Roles
└── Direct Permissions
```

Example:

```text
Roles:
Staff

Direct permission:
task.delete
```

The UI MUST clearly distinguish:

```text
Inherited
Direct
```

Direct permissions SHOULD be audited.

---

# 13. Explicit Deny

V1 SHOULD use a simple model:

```text
Permission exists → ALLOW
Permission absent → DENY
```

Do NOT implement explicit `DENY` in V1 unless required.

Future versions MAY support:

```text
ALLOW
DENY
INHERITED
```

If explicit deny is introduced, precedence rules MUST be documented and consistently enforced by backend and frontend.

---

# 14. Role Management UI

Main navigation:

```text
Settings
└── Roles & Permissions
```

Role list MUST support:

```text
Create Role
View Role
Edit Role
Duplicate Role
Archive Role
Delete Role
Assign Role
```

Suggested columns:

```text
Role
Type
Users
Permissions
Scope
Status
Updated At
Actions
```

Filters:

```text
All
System
Custom
Active
Archived
```

Search:

```text
Search role...
```

---

# 15. Create Role

Create Role form:

```text
Basic Information
────────────────────────
Name *
Description
Icon
Color
Status

Permissions
────────────────────────
[Permission Matrix]

Data Access
────────────────────────
Scope configuration
```

Required:

```text
name
```

Optional:

```text
description
icon
color
status
```

Validation:

- Role name MUST NOT be empty.
- Role name MUST be unique within the organization/workspace scope.
- System role names MUST NOT be reused by custom roles.
- Archived roles MUST NOT be assignable to new users.

---

# 16. Edit Role

Admin can edit:

```text
name
description
icon
color
permissions
scope
status
```

Changing permissions MUST NOT silently bypass audit logging.

Every permission change MUST produce an audit event.

---

# 17. Duplicate Role

The system SHOULD support:

```text
Manager
   ↓
Duplicate
   ↓
Senior Manager
```

The duplicated Role MUST copy:

```text
description
permissions
scope configuration
```

It MUST receive:

```text
new role id
new timestamps
new audit history
```

The duplicate MUST NOT inherit the original Role's user assignments.

---

# 18. Archive Role

Roles SHOULD be archived rather than immediately deleted.

Status:

```text
ACTIVE
ARCHIVED
```

Archived Role behavior:

- Cannot be assigned to new users.
- Existing assignments remain visible.
- Existing permissions SHOULD remain effective until users are migrated or the business policy explicitly revokes them.
- Admin can restore the Role.
- Archive action MUST be audited.

Recommended migration flow:

```text
Archive Role
    ↓
Find assigned users
    ↓
Migrate users
    ↓
Restore or permanently delete if allowed
```

---

# 19. Delete Role

A Role MUST NOT be deleted if it is still assigned to users.

Example error:

```text
Cannot delete Manager.

5 users are currently assigned to this role.

Please reassign these users before deleting the role.
```

Deletion SHOULD require:

```text
No active user assignments
```

System Roles MUST NOT be permanently deleted through normal UI.

---

# 20. Role Detail Page

Recommended layout:

```text
Role: Manager
Status: Active

Summary
────────────────────────
Users: 8
Permissions: 42
Default Scope: Team

Tabs:
├── Overview
├── Permissions
├── Users
├── Data Access
├── Security
└── Audit Log
```

---

# 21. Permission Preview

Role detail SHOULD provide:

```text
[Preview Access]
```

Example:

```text
Manager can:

✓ View employees
✓ Create employees
✓ Update employees
✕ Delete employees

✓ View tasks
✓ Create tasks
✓ Update tasks
✓ Assign tasks

✓ View reports
✕ Export reports

Data Scope:
Team
```

This is intended to help administrators understand the Role without manually inspecting every permission.

---

# 22. User Access Preview

The system SHOULD support:

```text
User → Access Preview
```

Example:

```text
User:
Nguyen Van A

Roles:
Manager
Accountant

Effective Permissions:
────────────────────────
hr.employee.view
hr.employee.update
task.task.view
task.task.create
task.task.assign
finance.transaction.view
finance.transaction.create
```

The preview SHOULD explain the source:

```text
hr.employee.view
Source: Manager

finance.transaction.view
Source: Accountant
```

---

# 23. Access Evaluation

Backend MUST provide a centralized authorization service.

Conceptually:

```text
can(user, permission, resource)
```

Example:

```text
can(
    user,
    "hr.employee.update",
    employee
)
```

Evaluation flow:

```text
1. Authenticate User
2. Load User Roles
3. Load Role Permissions
4. Check requested Permission
5. Resolve Data Scope
6. Check target Resource
7. Return ALLOW or DENY
```

Example denial:

```text
DENIED

Permission:
hr.employee.delete

Reason:
User does not have hr.employee.delete.
```

Or:

```text
DENIED

Permission:
hr.employee.update

Reason:
User has the permission,
but the employee is outside the user's Team scope.
```

---

# 24. Backend Authorization Rules

Authorization MUST be enforced on the backend.

Frontend permission checks are only for:

```text
UI visibility
UX
Navigation
Button visibility
```

Frontend MUST NOT be considered a security boundary.

Bad:

```text
if (!canDelete) hideDeleteButton();
```

as the only protection.

Correct:

```text
Frontend:
hide Delete button

Backend:
verify hr.employee.delete
verify scope
execute operation
```

Every protected API endpoint MUST perform authorization.

---

# 25. Sensitive HR Permissions

Because employee data may contain sensitive information, permissions SHOULD eventually be granular.

Instead of only:

```text
hr.employee.view
```

the system MAY support:

```text
hr.employee.view.basic
hr.employee.view.contact
hr.employee.view.personal
hr.employee.view.salary
hr.employee.view.documents
hr.employee.view.identity
```

Example:

### Staff

```text
hr.employee.view.basic
```

### HR Manager

```text
hr.employee.view.basic
hr.employee.view.contact
hr.employee.view.personal
hr.employee.view.documents
```

### Payroll

```text
hr.employee.view.basic
hr.employee.view.salary
```

This prevents unnecessary exposure of sensitive employee data.

---

# 26. Audit Log

Role-related changes MUST be audited.

Audit events include:

```text
ROLE_CREATED
ROLE_UPDATED
ROLE_ARCHIVED
ROLE_RESTORED
ROLE_DELETED

ROLE_ASSIGNED
ROLE_REMOVED

PERMISSION_GRANTED
PERMISSION_REVOKED

ROLE_SCOPE_CHANGED
DIRECT_PERMISSION_GRANTED
DIRECT_PERMISSION_REVOKED
```

Audit record SHOULD contain:

```text
id
actor_id
target_type
target_id
action
before
after
timestamp
ip_address
user_agent
metadata
```

Example:

```text
02/09/2026 10:30

Actor:
Owner

Action:
ROLE_ASSIGNED

Target:
Nguyen Van A

Before:
Staff

After:
Manager
```

Audit logs MUST be append-only from the normal application UI.

---

# 27. Role Versioning

Role versioning is recommended for future implementation.

Example:

```text
Manager v1
├── employee.view
└── task.view

Manager v2
├── employee.view
├── employee.update
├── task.view
└── task.assign
```

The system should be able to answer:

> What permissions did this Role have at a specific point in time?

This is important for security auditing.

---

# 28. Role Hierarchy

Role inheritance MAY be implemented in a future version.

Example:

```text
Admin
└── Manager
    └── Team Leader
        └── Staff
```

However, V1 SHOULD NOT implement inheritance.

Recommended V1 model:

```text
Role
└── Permissions
```

Add inheritance only after the basic RBAC system is stable.

---

# 29. Recommended Database Model

Minimum tables:

```text
users

roles

permissions

user_roles

role_permissions
```

For data scopes:

```text
role_permission_scopes
```

For auditing:

```text
role_audit_logs
```

Relationship:

```text
users
  │
  └── user_roles
          │
          └── roles
                │
                └── role_permissions
                        │
                        └── permissions
```

A User MUST NOT store a duplicated permanent list of effective permissions as the source of truth.

Effective permissions SHOULD be calculated from Roles and permission assignments, with caching allowed for performance.

---

# 30. Suggested Data Model

## roles

```text
id
organization_id
name
description
type
status
icon
color
created_by
updated_by
created_at
updated_at
```

## permissions

```text
id
module
resource
action
code
description
created_at
```

`code` example:

```text
hr.employee.view
```

## user_roles

```text
id
user_id
role_id
assigned_by
assigned_at
```

## role_permissions

```text
id
role_id
permission_id
created_at
```

## role_permission_scopes

```text
id
role_permission_id
scope_type
scope_value
```

## role_audit_logs

```text
id
organization_id
actor_id
target_type
target_id
action
before_data
after_data
metadata
created_at
```

---

# 31. API Requirements

Recommended endpoints:

```text
GET    /roles
POST   /roles
GET    /roles/:id
PATCH  /roles/:id
DELETE /roles/:id

POST   /roles/:id/archive
POST   /roles/:id/restore

GET    /roles/:id/permissions
PUT    /roles/:id/permissions

GET    /roles/:id/users

POST   /users/:id/roles
DELETE /users/:id/roles/:roleId

GET    /users/:id/permissions

GET    /users/:id/access-preview

GET    /roles/:id/audit-logs
```

Permission endpoint:

```text
GET /permissions
```

Authorization service:

```text
can(user, permission, resource)
```

or API equivalent:

```text
POST /authorization/check
```

The authorization check SHOULD normally remain internal to the backend rather than being exposed publicly unless there is a concrete product requirement.

---

# 32. API Security Requirements

Every Role API MUST verify:

```text
Authentication
+
Authorization
+
Organization/Workspace ownership
+
Resource scope
```

The backend MUST prevent:

```text
Cross-organization role access
Cross-workspace role access
Unauthorized permission escalation
Unauthorized Owner modification
```

A user MUST NOT be able to modify their own Role to gain additional permissions unless they already possess the permission required to manage Role assignments.

---

# 33. Permission Escalation Protection

The system MUST prevent privilege escalation.

Examples:

```text
Staff cannot grant themselves Admin.

Manager cannot assign Owner to themselves.

Admin cannot transfer ownership unless explicitly allowed.

User cannot modify permissions they are not authorized to manage.
```

Before modifying Role permissions, backend MUST check:

```text
actor.can("role.permission.update")
```

and appropriate organization/workspace scope.

---

# 34. UI/UX Requirements

The Role management interface SHOULD be simple enough for a non-technical administrator.

Avoid exposing only raw permission codes such as:

```text
hr.employee.update
```

Display:

```text
Employees → Update employee information
```

The raw code MAY appear in an advanced/details section.

Use:

```text
Module
Resource
Action
Description
Scope
```

rather than a large unstructured list.

---

# 35. Default Roles

Initial installation SHOULD create:

### Owner

Full system access.

### Admin

Administrative access excluding ownership/billing-sensitive actions.

### Manager

Team-level employee/task management.

### Staff

Access to assigned/own work.

### Optional Accountant

Finance-related permissions.

These defaults MUST be configurable after installation.

---

# 36. Example Role Definitions

## Owner

```text
Permissions:
*
Scope:
ALL
```

## Admin

```text
hr.*
task.*
workspace.*
report.*

Scope:
ALL
```

## Manager

```text
hr.employee.view
hr.employee.update

task.task.view
task.task.create
task.task.update
task.task.assign
task.task.complete

report.report.view

Scope:
TEAM
```

## Staff

```text
task.task.view
task.task.update
task.task.complete

Scope:
ASSIGNED
```

## Accountant

```text
finance.transaction.view
finance.transaction.create
finance.transaction.update
finance.transaction.export

Scope:
ORGANIZATION
```

The `*` wildcard SHOULD be treated as a logical policy only if the authorization implementation explicitly supports it. Do not rely on uncontrolled string matching.

---

# 37. Access Decision Model

The authorization engine SHOULD return structured information internally:

```text
{
  allowed: true,
  permission: "task.task.update",
  scope: "ASSIGNED",
  source: "Manager",
  reason: "User is assigned to the task"
}
```

For denied access:

```text
{
  allowed: false,
  permission: "hr.employee.delete",
  reason: "Permission not granted"
}
```

This is useful for:

- debugging
- audit
- admin preview
- automated tests

Do not expose sensitive internal authorization details to untrusted users in production error messages.

---

# 38. Testing Requirements

The RBAC system MUST have automated tests.

## Role tests

```text
Create Role
Update Role
Archive Role
Restore Role
Delete Role
Duplicate Role
```

## Permission tests

```text
Grant permission
Revoke permission
Multiple permissions
Multiple roles
```

## Scope tests

```text
ALL
TEAM
DEPARTMENT
WORKSPACE
ASSIGNED
OWN
```

## Security tests

```text
Unauthorized role modification
Privilege escalation
Cross-organization access
Cross-workspace access
Owner protection
Archived role assignment
```

Example:

```text
Given:
User A has Staff role.

When:
User A requests hr.employee.delete.

Then:
Access MUST be denied.
```

Another:

```text
Given:
User A has Manager role.
Manager scope = TEAM.

When:
User A updates Employee B.

If:
Employee B belongs to another team.

Then:
Access MUST be denied.
```

---

# 39. V1 Scope

The first implementation SHOULD include:

```text
[Required]

✓ Role CRUD
✓ System Roles
✓ Custom Roles
✓ Role assignment
✓ Multiple Roles per User
✓ Permission matrix
✓ CRUD permissions
✓ Basic data scope
✓ Owner protection
✓ Archive Role
✓ Delete protection
✓ Audit logs
✓ Backend authorization
✓ Permission preview
```

Do NOT implement initially:

```text
✕ Role inheritance
✕ Complex conditional permissions
✕ Explicit deny
✕ Advanced policy engine
✕ Complex permission versioning
```

These can be added later without changing the fundamental architecture.

---

# 40. V2 Scope

V2 MAY add:

```text
Direct User Permissions
Advanced Data Scope
Sensitive Field Permissions
Permission Preview
User Access Preview
Role Duplication
Role Versioning
Advanced Audit
```

---

# 41. V3 Scope

V3 MAY add:

```text
Role Hierarchy
Conditional Permissions
Attribute-Based Access Control (ABAC)
Dynamic Policies
Time-based Access
IP restrictions
Device restrictions
Temporary Role Assignment
Approval workflow for permission changes
```

---

# 42. Implementation Rules for AI

When implementing this module, AI MUST follow these rules:

1. Do not hard-code permissions inside UI widgets.
2. Do not rely on frontend checks for security.
3. All protected backend operations MUST perform authorization.
4. Permission codes MUST be centralized.
5. Role and Job Position MUST remain separate concepts.
6. User MUST support multiple Roles.
7. Scope MUST be evaluated at data-access level.
8. System Roles MUST be protected.
9. Owner MUST have special protection.
10. Role changes MUST be auditable.
11. Deleting a Role with active assignments MUST be prevented.
12. Archived Roles MUST NOT be assignable to new users.
13. Authorization logic MUST be centralized.
14. Avoid duplicating authorization logic across modules.
15. Future modules MUST be able to register new permissions without redesigning RBAC.
16. Sensitive HR fields SHOULD use more granular permissions.
17. Database MUST remain the source of truth.
18. Cached effective permissions MUST be invalidated when Role/Permission assignments change.
19. Permission changes MUST invalidate relevant authorization caches.
20. All authorization behavior MUST be covered by automated tests.

---

# 43. Final Architecture

The target architecture is:

```text
                         ┌──────────────┐
                         │     USER     │
                         └──────┬───────┘
                                │
                         user_roles
                                │
                         ┌──────▼───────┐
                         │     ROLE     │
                         └──────┬───────┘
                                │
                     role_permissions
                                │
                     ┌──────────▼──────────┐
                     │    PERMISSION       │
                     │ module.resource.act │
                     └──────────┬──────────┘
                                │
                         permission_scope
                                │
                     ┌──────────▼──────────┐
                     │     DATA SCOPE      │
                     │ Team / Own / etc.   │
                     └──────────┬──────────┘
                                │
                         ┌──────▼───────┐
                         │ AUTH ENGINE  │
                         └──────┬───────┘
                                │
                         ┌──────▼───────┐
                         │ ALLOW / DENY │
                         └──────────────┘
```

The final design principle is:

```text
Job Position ≠ Role

Role = Permission Set

Permission = Action

Scope = Data Boundary

Authorization = Permission + Scope
```

This RBAC module MUST be designed as a reusable platform-level service so that HR, Task, Finance, Workspace, Documents, Reports, and future modules can use the same authorization engine.
