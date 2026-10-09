import {
  AdminDashboardData,
  Company,
  Employee,
  EmployeeDashboardData,
  OutputHistoryItem,
  Role,
  Task,
  TaskActivity,
  TaskPriority,
  TaskStatus,
  User,
} from '../types';

const TOKEN_KEY = 'amnexus_auth_token';

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY) || localStorage.getItem('taskflow_auth_token'),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('taskflow_auth_token');
  },
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = authStorage.getToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Request failed (${response.status})`;
    try {
      const errorData = await response.json();
      if (errorData.error) errorMsg = errorData.error;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return response.json() as Promise<T>;
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    request<{ success: boolean }>('/api/auth/logout', {
      method: 'POST',
    }),

  getMe: () => request<{ user: User }>('/api/auth/me'),

  changePassword: (current_password: string, new_password: string) =>
    request<{ success: boolean; message: string }>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password, new_password }),
    }),

  // Companies
  getCompanies: () => request<Company[]>('/api/companies'),

  createCompany: (data: Partial<Company>) =>
    request<Company>('/api/companies', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCompany: (id: string, data: Partial<Company>) =>
    request<Company>(`/api/companies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Employees
  getEmployees: () => request<Employee[]>('/api/employees'),

  createEmployee: (data: {
    full_name: string;
    email: string;
    phone?: string;
    job_title: string;
    department: string;
    company_id: string;
    joining_date?: string;
    password: string;
    status?: 'Active' | 'Inactive';
    employee_code?: string;
    role?: Role;
  }) =>
    request<Employee>('/api/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getEmployee: (id: string) => request<Employee>(`/api/employees/${id}`),

  updateEmployee: (id: string, data: Partial<Employee>) =>
    request<Employee>(`/api/employees/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  resetEmployeePassword: (id: string, new_password: string) =>
    request<{ success: boolean; message: string }>(`/api/employees/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ new_password }),
    }),

  deleteEmployee: (id: string) =>
    request<{ success: boolean; message: string }>(`/api/employees/${id}`, {
      method: 'DELETE',
    }),

  // Tasks
  getTasks: (params: {
    employee_id?: string;
    company_id?: string;
    status?: string;
    priority?: string;
    output_filter?: string;
    date_filter?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
  } = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const qs = query.toString();
    return request<Task[]>(`/api/tasks${qs ? `?${qs}` : ''}`);
  },

  getTask: (id: number) => request<Task>(`/api/tasks/${id}`),

  createTask: (data: {
    company_id?: string;
    assigned_employee_id: string;
    title: string;
    description: string;
    priority?: TaskPriority;
    due_date?: string;
    status?: TaskStatus;
  }) =>
    request<Task>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateTask: (id: number, data: Partial<Task>) =>
    request<Task>(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteTask: (id: number) =>
    request<{ success: boolean }>(`/api/tasks/${id}`, {
      method: 'DELETE',
    }),

  clearAllTasks: () =>
    request<{ success: boolean; message: string }>('/api/admin/clear-all-tasks', {
      method: 'DELETE',
    }),

  // CORE OUTPUT & STATUS ENDPOINTS
  submitOutput: (id: number, employee_output: string) =>
    request<{ success: boolean; task: Task; message: string }>(`/api/tasks/${id}/output`, {
      method: 'POST',
      body: JSON.stringify({ employee_output }),
    }),

  updateTaskStatus: (id: number, status: TaskStatus, progress?: number) =>
    request<{ success: boolean; task: Task }>(`/api/tasks/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, progress }),
    }),

  getTaskActivity: (id: number) =>
    request<{ activities: TaskActivity[]; output_history: OutputHistoryItem[] }>(`/api/tasks/${id}/activity`),

  // Dashboards
  getAdminDashboard: () => request<AdminDashboardData>('/api/admin/dashboard'),

  getEmployeeDashboard: () => request<EmployeeDashboardData>('/api/employee/dashboard'),

  // Dev tools
  resetData: () => request<{ success: boolean; tasksCount: number }>('/api/dev/reset-data', { method: 'POST' }),
};
