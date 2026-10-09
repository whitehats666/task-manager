# AMNEXUS - Employee Task & Output Management System

A production-grade, fast, full-stack application with an executive **Black, White & Golden Theme** designed specifically around the core workflow:

> **ADMIN TYPES TASK → ASSIGNS EMPLOYEE → EMPLOYEE TYPES OUTPUT → ADMIN SEES OUTPUT**

---

## 🚀 Core Features

### 1. Admin Features
- **Dashboard Overview**: Instant metrics for Total Employees, Total Tasks, Pending, In Progress, Completed, No Output, and Overdue tasks, plus "Today's Employee Work" real-time ledger.
- **Spreadsheet-Style All Tasks Table**: High-density business spreadsheet with:
  - Inline editing of Status, Priority, Progress slider, and Due Date.
  - Direct display of employee output text with single-click "View Output" modal.
- **Multi-Dimensional Filters**:
  - Filter by Employee (Savad, Rahul, Fadil, Anu, or any newly created employee).
  - Filter by Company / Division.
  - Filter by Status (Pending, In Progress, Completed, On Hold, Cancelled).
  - Filter by Priority (Low, Medium, High, Urgent).
  - Filter by Output Presence (**"No Output"** filter to immediately identify employees who haven't entered their work).
  - Filter by Date (Today, Yesterday, This Week, This Month).
- **Universal Search**: Real-time search across Employee Name, Employee Email, Task Title, Task Description, Employee Output, and Company Name.
- **Task Assignment & Ownership Enforcement**:
  - Validates that the assigned employee belongs to the selected company.
  - Prevents cross-company assignment errors.
- **Activity & Output History Audit**:
  - Full chronological timeline recording every status change, progress increment, and output revision with timestamps and user names.
- **Company & Employee Management**:
  - Create companies with custom codes and contact details.
  - Register employees with encrypted bcrypt passwords and role management.
  - Reset employee login passwords securely.

### 2. Employee Features
- **My Tasks Workspace**:
  - See only tasks assigned to the logged-in employee (strict object-level authorization).
  - Clean view of manager instructions, priority, due date, and current progress.
- **Direct Output Submission**:
  - Large dedicated textarea (`My Output`) to type completed work directly without confusing file uploads.
  - Immediate `Save Output` and `Mark Completed` actions.
- **Status Progression**:
  - Transition tasks from `Pending` → `In Progress` → `Completed`.
  - Adjust progress percentage.
- **Output History & Timeline**:
  - View full audit history of output updates and changes.
- **Profile & Password Management**:
  - Update personal account password securely.

---

## 🔒 Security & Architecture

- **Role-Based Access Control (RBAC)**: Enforced both on the Express backend and React frontend.
- **Object-Level Authorization**: An employee attempting to access or edit another employee's task (e.g., via `/api/tasks/:id`) receives a `403 Forbidden` response.
- **Secure Password Hashing**: Utilizes `bcryptjs` with salt rounds. Passwords are never stored in plain text or returned in API responses.
- **Persistent Storage**: Robust file-backed database (`data/db.json`) that persists changes across sessions, with automatic seed initialization and reset capability.

---

## 👥 Seed Test Accounts

The system comes preloaded with 3 companies, 4 employees, and 20 realistic tasks:

| Role | Name | Email | Password | Company |
|------|------|-------|----------|---------|
| **Admin** | System Administrator | `admin@example.com` | `Admin@12345` | Operations |
| **Employee** | Savad | `savad@example.com` | `Savad@12345` | Asquare Technologies |
| **Employee** | Rahul | `rahul@example.com` | `Rahul@12345` | Asquare Technologies |
| **Employee** | Fadil | `fadil@example.com` | `Fadil@12345` | NexaCorp Solutions |
| **Employee** | Anu | `anu@example.com` | `Anu@12345` | Vertex Dynamics |

> **Tip:** You can switch between accounts instantly using the top banner "Switch Account" bar, or log in via standard email and password.

---

## 📋 Canonical Verification Workflow

1. **Admin logs in**:
   - Navigate to `+ Create Task`.
   - Select Employee: **Savad**.
   - Type Task Title: `Create today's Instagram poster for the Python Full Stack course`.
   - Click **Create Task**.
2. **Savad logs in**:
   - Opens **My Tasks**.
   - Sees the new task from Admin.
   - Types in **My Output**:
     `Instagram poster completed and uploaded to the marketing folder.`
   - Clicks **Save Output** and **Mark Completed**.
3. **Admin logs in**:
   - Opens **All Tasks** spreadsheet.
   - Immediately sees:
     - Employee: Savad
     - Task: Create today's Instagram poster
     - Output: `Instagram poster completed and uploaded to the marketing folder.`
     - Status: Completed (100%)
   - Filters by Employee: **Savad** → only Savad's tasks appear.
   - Searches for `Instagram` → matching poster tasks appear.
