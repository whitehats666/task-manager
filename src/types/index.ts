export type Role = 'ADMIN' | 'TEAM_LEAD' | 'EMPLOYEE';

export type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface User {
  id: string;
  email: string;
  role: Role;
  full_name: string;
  employee_id?: string;
  company_id?: string;
  phone?: string;
  job_title?: string;
  department?: string;
  profile_photo?: string;
  status: 'Active' | 'Inactive';
  created_at: string;
}

export interface Company {
  id: string;
  name: string;
  code: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  status: 'Active' | 'Inactive';
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  employee_code: string;
  full_name: string;
  email: string;
  phone: string;
  job_title: string;
  department: string;
  company_id: string;
  joining_date: string;
  profile_photo: string;
  status: 'Active' | 'Inactive';
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  company_id: string;
  assigned_employee_id: string;
  title: string;
  description: string;
  employee_output: string;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number;
  due_date: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  submitted_at?: string | null;
  // Enriched fields from API:
  employee_name?: string;
  employee_email?: string;
  employee_avatar?: string;
  company_name?: string;
  company_code?: string;
}

export interface TaskActivity {
  id: string;
  task_id: number;
  action: 'CREATED' | 'STATUS_CHANGED' | 'OUTPUT_UPDATED' | 'PROGRESS_UPDATED' | 'UPDATED' | 'ASSIGNMENT_CHANGED';
  description: string;
  user_id: string;
  user_name: string;
  created_at: string;
}

export interface OutputHistoryItem {
  id: string;
  task_id: number;
  output_text: string;
  updated_at: string;
  updated_by_name: string;
}

export interface AdminDashboardData {
  counts: {
    totalEmployees: number;
    totalTasks: number;
    pending: number;
    inProgress: number;
    completed: number;
    onHold: number;
    cancelled: number;
    noOutput: number;
    overdue: number;
  };
  todayWork: Array<{
    id: number;
    employee_name: string;
    employee_avatar: string;
    task_title: string;
    output: string;
    status: TaskStatus;
    priority: TaskPriority;
    progress: number;
    submitted_at?: string | null;
    updated_at: string;
    company_name: string;
  }>;
}

export interface EmployeeDashboardData {
  counts: {
    totalTasks: number;
    pending: number;
    inProgress: number;
    completed: number;
    overdue: number;
    noOutput: number;
  };
  tasks: Task[];
}
