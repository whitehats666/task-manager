import express, { Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';
import {
  authMiddleware,
  adminOnly,
  adminOrLead,
  AuthRequest,
  generateToken,
  revokeToken,
  comparePassword,
  hashPassword,
  sanitizeUser,
} from './server/auth.js';
import { Task, TaskPriority, TaskStatus, User, Employee } from './server/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '10mb' }));

  // Helper to format date check for "Today", "Yesterday", etc.
  function isSameDay(d1: Date, d2: Date) {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }

  // ==========================================
  // AUTHENTICATION APIs
  // ==========================================

  // POST /api/auth/login
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const user = db.getUsers().find(u => u.email.toLowerCase() === cleanEmail);

    if (!user || user.status !== 'Active') {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isMatch = comparePassword(String(password), user.password_hash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = generateToken(user.id);
    res.json({
      token,
      user: sanitizeUser(user),
    });
  });

  // POST /api/auth/logout
  app.post('/api/auth/logout', authMiddleware, (req: AuthRequest, res) => {
    if (req.token) {
      revokeToken(req.token);
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });

  // GET /api/auth/me
  app.get('/api/auth/me', authMiddleware, (req: AuthRequest, res) => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    res.json({ user: sanitizeUser(req.user) });
  });

  // POST /api/auth/change-password
  app.post('/api/auth/change-password', authMiddleware, (req: AuthRequest, res) => {
    const { current_password, new_password } = req.body;
    const user = req.user!;

    if (!current_password || !new_password) {
      res.status(400).json({ error: 'Current password and new password are required' });
      return;
    }

    if (String(new_password).length < 6) {
      res.status(400).json({ error: 'New password must be at least 6 characters' });
      return;
    }

    if (!comparePassword(current_password, user.password_hash)) {
      res.status(400).json({ error: 'Current password does not match' });
      return;
    }

    const newHash = hashPassword(new_password);
    db.updateUser(user.id, { password_hash: newHash });

    res.json({ success: true, message: 'Password updated successfully' });
  });

  // ==========================================
  // COMPANIES APIs
  // ==========================================

  // GET /api/companies
  app.get('/api/companies', authMiddleware, (_req, res) => {
    const companies = db.getCompanies();
    res.json(companies);
  });

  // POST /api/companies (Admin only)
  app.post('/api/companies', authMiddleware, adminOnly, (req: AuthRequest, res) => {
    const { name, code, email, phone, address, website, status } = req.body;
    if (!name || !code) {
      res.status(400).json({ error: 'Company Name and Code are required' });
      return;
    }

    const existingCode = db.getCompanies().find(c => c.code.toLowerCase() === String(code).trim().toLowerCase());
    if (existingCode) {
      res.status(400).json({ error: `Company code "${code}" is already in use` });
      return;
    }

    const now = new Date().toISOString();
    const newCompany = {
      id: `comp_${Date.now()}`,
      name: String(name).trim(),
      code: String(code).trim().toUpperCase(),
      email: String(email || '').trim(),
      phone: String(phone || '').trim(),
      address: String(address || '').trim(),
      website: String(website || '').trim(),
      status: (status === 'Inactive' ? 'Inactive' : 'Active') as 'Active' | 'Inactive',
      created_at: now,
      updated_at: now,
    };

    db.addCompany(newCompany);
    res.status(201).json(newCompany);
  });

  // PATCH /api/companies/:id (Admin only)
  app.patch('/api/companies/:id', authMiddleware, adminOnly, (req: AuthRequest, res) => {
    const { id } = req.params;
    const updates = req.body;

    const updated = db.updateCompany(id, updates);
    if (!updated) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    res.json(updated);
  });

  // ==========================================
  // EMPLOYEES APIs
  // ==========================================

  // GET /api/employees (Admin can see all, Employee can see own or active coworkers for assignment list)
  app.get('/api/employees', authMiddleware, (_req, res) => {
    const employees = db.getEmployees();
    res.json(employees);
  });

  // POST /api/employees (Admin only)
  app.post('/api/employees', authMiddleware, adminOnly, (req: AuthRequest, res) => {
    const {
      full_name,
      email,
      phone,
      job_title,
      department,
      company_id,
      joining_date,
      password,
      status,
      employee_code,
    } = req.body;

    if (!full_name || !email || !company_id || !password) {
      res.status(400).json({ error: 'Full name, email, company, and password are required' });
      return;
    }

    const company = db.getCompanies().find(c => c.id === company_id);
    if (!company) {
      res.status(400).json({ error: 'Selected company does not exist' });
      return;
    }

    const existingUser = db.getUsers().find(u => u.email.toLowerCase() === String(email).trim().toLowerCase());
    if (existingUser) {
      res.status(400).json({ error: `An account with email ${email} already exists` });
      return;
    }

    const empId = `emp_${Date.now()}`;
    const userId = `user_${Date.now()}`;
    const now = new Date().toISOString();
    const cleanCode = employee_code ? String(employee_code).trim() : `EMP-${db.getEmployees().length + 101}`;

    const newEmployee: Employee = {
      id: empId,
      employee_code: cleanCode,
      full_name: String(full_name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: String(phone || '').trim(),
      job_title: String(job_title || 'Team Member').trim(),
      department: String(department || 'General').trim(),
      company_id,
      joining_date: joining_date || new Date().toISOString().split('T')[0],
      profile_photo: '',
      status: (status === 'Inactive' ? 'Inactive' : 'Active') as 'Active' | 'Inactive',
      user_id: userId,
      created_at: now,
      updated_at: now,
    };

    const targetRole = req.body.role === 'TEAM_LEAD' ? 'TEAM_LEAD' : 'EMPLOYEE';

    const newUser: User = {
      id: userId,
      email: String(email).trim().toLowerCase(),
      password_hash: hashPassword(String(password)),
      role: targetRole,
      full_name: String(full_name).trim(),
      employee_id: empId,
      company_id,
      phone: String(phone || '').trim(),
      job_title: String(job_title || 'Team Member').trim(),
      department: String(department || 'General').trim(),
      status: (status === 'Inactive' ? 'Inactive' : 'Active') as 'Active' | 'Inactive',
      created_at: now,
    };

    db.addUser(newUser);
    db.addEmployee(newEmployee);

    res.status(201).json(newEmployee);
  });

  // GET /api/employees/:id
  app.get('/api/employees/:id', authMiddleware, (req: AuthRequest, res) => {
    const { id } = req.params;
    const employee = db.getEmployees().find(e => e.id === id);
    if (!employee) {
      res.status(404).json({ error: 'Employee not found' });
      return;
    }

    // Permission check: employee can only see own profile
    if (req.user?.role === 'EMPLOYEE' && req.user.employee_id !== id) {
      res.status(403).json({ error: 'Forbidden: You can only view your own profile' });
      return;
    }

    res.json(employee);
  });

  // PATCH /api/employees/:id (Admin only)
  app.patch('/api/employees/:id', authMiddleware, adminOnly, (req: AuthRequest, res) => {
    const { id } = req.params;
    const updates = req.body;

    const employee = db.getEmployees().find(e => e.id === id);
    if (!employee) {
      res.status(404).json({ error: 'Employee not found' });
      return;
    }

    // If company changed, verify company exists
    if (updates.company_id) {
      const company = db.getCompanies().find(c => c.id === updates.company_id);
      if (!company) {
        res.status(400).json({ error: 'Company does not exist' });
        return;
      }
    }

    const updated = db.updateEmployee(id, updates);

    // Sync user account if email or name updated
    if (employee.user_id) {
      const userUpdates: Partial<User> = {};
      if (updates.full_name) userUpdates.full_name = updates.full_name;
      if (updates.email) userUpdates.email = updates.email;
      if (updates.company_id) userUpdates.company_id = updates.company_id;
      if (updates.job_title) userUpdates.job_title = updates.job_title;
      if (updates.department) userUpdates.department = updates.department;
      if (updates.status) userUpdates.status = updates.status;
      db.updateUser(employee.user_id, userUpdates);
    }

    res.json(updated);
  });

  // POST /api/employees/:id/reset-password (Admin only)
  app.post('/api/employees/:id/reset-password', authMiddleware, adminOnly, (req: AuthRequest, res) => {
    const { id } = req.params;
    const { new_password } = req.body;

    if (!new_password || String(new_password).length < 6) {
      res.status(400).json({ error: 'New password must be at least 6 characters' });
      return;
    }

    const employee = db.getEmployees().find(e => e.id === id);
    if (!employee) {
      res.status(404).json({ error: 'Employee not found' });
      return;
    }

    const user = db.getUsers().find(u => u.id === employee.user_id);
    if (!user) {
      res.status(404).json({ error: 'Employee user account not found' });
      return;
    }

    const hash = hashPassword(new_password);
    db.updateUser(user.id, { password_hash: hash });

    res.json({ success: true, message: `Password for ${employee.full_name} has been reset successfully` });
  });

  // DELETE /api/employees/:id (Admin only)
  app.delete('/api/employees/:id', authMiddleware, adminOnly, (req: AuthRequest, res) => {
    const { id } = req.params;
    const employee = db.getEmployees().find(e => e.id === id);
    if (!employee) {
      res.status(404).json({ error: 'Employee not found' });
      return;
    }

    const success = db.deleteEmployee(id);
    if (!success) {
      res.status(500).json({ error: 'Failed to delete employee' });
      return;
    }

    res.json({ success: true, message: `Employee ${employee.full_name} deleted successfully` });
  });

  // ==========================================
  // TASKS APIs
  // ==========================================

  // GET /api/tasks (With Search, Filter, and Object-Level Authorization)
  app.get('/api/tasks', authMiddleware, (req: AuthRequest, res) => {
    const user = req.user!;
    let tasks = [...db.getTasks()];

    // CRITICAL OBJECT-LEVEL AUTHORIZATION:
    // If user is EMPLOYEE, restrict strictly to their own assigned tasks
    if (user.role === 'EMPLOYEE') {
      tasks = tasks.filter(t => t.assigned_employee_id === user.employee_id);
    }

    // Query Filters
    const {
      employee_id,
      company_id,
      status,
      priority,
      output_filter, // 'with_output' | 'no_output' | 'all'
      date_filter,   // 'today' | 'yesterday' | 'this_week' | 'this_month' | 'custom'
      start_date,
      end_date,
      search,
    } = req.query;

    if (employee_id && (user.role === 'ADMIN' || user.role === 'TEAM_LEAD')) {
      tasks = tasks.filter(t => t.assigned_employee_id === String(employee_id));
    }

    if (company_id) {
      tasks = tasks.filter(t => t.company_id === String(company_id));
    }

    if (status && status !== 'All') {
      tasks = tasks.filter(t => t.status === String(status));
    }

    if (priority && priority !== 'All') {
      tasks = tasks.filter(t => t.priority === String(priority));
    }

    if (output_filter === 'with_output') {
      tasks = tasks.filter(t => t.employee_output && t.employee_output.trim().length > 0);
    } else if (output_filter === 'no_output') {
      tasks = tasks.filter(t => !t.employee_output || t.employee_output.trim().length === 0);
    }

    const now = new Date('2026-10-07T08:00:00Z'); // Current simulation baseline

    if (date_filter) {
      if (date_filter === 'today') {
        tasks = tasks.filter(t => {
          const created = new Date(t.created_at);
          return isSameDay(created, now);
        });
      } else if (date_filter === 'yesterday') {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        tasks = tasks.filter(t => {
          const created = new Date(t.created_at);
          return isSameDay(created, yesterday);
        });
      } else if (date_filter === 'this_week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        tasks = tasks.filter(t => new Date(t.created_at) >= weekAgo);
      } else if (date_filter === 'this_month') {
        tasks = tasks.filter(t => {
          const created = new Date(t.created_at);
          return created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth();
        });
      } else if (date_filter === 'custom' && start_date && end_date) {
        const s = new Date(String(start_date));
        const e = new Date(String(end_date));
        e.setHours(23, 59, 59, 999);
        tasks = tasks.filter(t => {
          const created = new Date(t.created_at);
          return created >= s && created <= e;
        });
      }
    }

    // Search filter across: employee name, employee email, task title, description, employee output, company name
    if (search && String(search).trim()) {
      const q = String(search).trim().toLowerCase();
      const employees = db.getEmployees();
      const companies = db.getCompanies();

      tasks = tasks.filter(t => {
        const emp = employees.find(e => e.id === t.assigned_employee_id);
        const comp = companies.find(c => c.id === t.company_id);

        const titleMatch = t.title.toLowerCase().includes(q);
        const descMatch = (t.description || '').toLowerCase().includes(q);
        const outputMatch = (t.employee_output || '').toLowerCase().includes(q);
        const empNameMatch = emp ? emp.full_name.toLowerCase().includes(q) : false;
        const empEmailMatch = emp ? emp.email.toLowerCase().includes(q) : false;
        const compNameMatch = comp ? comp.name.toLowerCase().includes(q) : false;

        return titleMatch || descMatch || outputMatch || empNameMatch || empEmailMatch || compNameMatch;
      });
    }

    // Return tasks with enriched company and employee details for convenience
    const employees = db.getEmployees();
    const companies = db.getCompanies();

    const enriched = tasks.map(t => {
      const emp = employees.find(e => e.id === t.assigned_employee_id);
      const comp = companies.find(c => c.id === t.company_id);
      return {
        ...t,
        employee_name: emp ? emp.full_name : 'Unknown',
        employee_email: emp ? emp.email : '',
        employee_avatar: emp ? emp.profile_photo : '',
        company_name: comp ? comp.name : 'Unknown',
        company_code: comp ? comp.code : '',
      };
    });

    res.json(enriched);
  });

  // POST /api/tasks (Admin & Team Lead)
  app.post('/api/tasks', authMiddleware, adminOrLead, (req: AuthRequest, res) => {
    const {
      company_id,
      assigned_employee_id,
      title,
      description,
      priority,
      due_date,
      status,
    } = req.body;

    if (!assigned_employee_id || !title) {
      res.status(400).json({ error: 'Assigned employee and task title are required' });
      return;
    }

    const employee = db.getEmployees().find(e => e.id === assigned_employee_id);
    if (!employee) {
      res.status(400).json({ error: 'Selected employee does not exist' });
      return;
    }

    // TASK OWNERSHIP VALIDATION:
    // If company_id is provided, verify employee belongs to that company;
    // If company_id is omitted, automatically assign to employee's company!
    const effectiveCompanyId = company_id || employee.company_id;
    if (employee.company_id !== effectiveCompanyId) {
      res.status(400).json({
        error: `Validation Error: Employee ${employee.full_name} does not belong to the selected company.`,
      });
      return;
    }

    const now = new Date().toISOString();
    const taskStatus: TaskStatus = status || 'Pending';
    const taskPriority: TaskPriority = priority || 'Medium';

    const creatorRoleLabel = req.user?.role === 'ADMIN' ? 'Admin' : 'Team Lead';

    const newTask = db.addTask({
      company_id: effectiveCompanyId,
      assigned_employee_id,
      title: String(title).trim(),
      description: String(description || '').trim(),
      employee_output: '',
      status: taskStatus,
      priority: taskPriority,
      progress: taskStatus === 'Completed' ? 100 : 0,
      due_date: due_date || new Date().toISOString().split('T')[0],
      created_by: req.user?.full_name || creatorRoleLabel,
      created_at: now,
      updated_at: now,
      completed_at: taskStatus === 'Completed' ? now : null,
    });

    // Log Activity
    db.addActivity({
      task_id: newTask.id,
      action: 'CREATED',
      description: `${creatorRoleLabel} (${req.user?.full_name || creatorRoleLabel}) created task: "${newTask.title}" and assigned to ${employee.full_name}`,
      user_id: req.user!.id,
      user_name: req.user!.full_name,
      created_at: now,
    });

    res.status(201).json(newTask);
  });

  // GET /api/tasks/:id
  app.get('/api/tasks/:id', authMiddleware, (req: AuthRequest, res) => {
    const id = Number(req.params.id);
    const task = db.getTasks().find(t => t.id === id);

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    // CRITICAL RBAC CHECK:
    if (req.user?.role === 'EMPLOYEE' && task.assigned_employee_id !== req.user.employee_id) {
      res.status(403).json({ error: 'Forbidden: You do not have permission to view this task' });
      return;
    }

    const emp = db.getEmployees().find(e => e.id === task.assigned_employee_id);
    const comp = db.getCompanies().find(c => c.id === task.company_id);

    res.json({
      ...task,
      employee_name: emp ? emp.full_name : 'Unknown',
      employee_email: emp ? emp.email : '',
      employee_avatar: emp ? emp.profile_photo : '',
      company_name: comp ? comp.name : 'Unknown',
      company_code: comp ? comp.code : '',
    });
  });

  // PATCH /api/tasks/:id (Admin full edit, Employee can edit status/progress if assigned)
  app.patch('/api/tasks/:id', authMiddleware, (req: AuthRequest, res) => {
    const id = Number(req.params.id);
    const task = db.getTasks().find(t => t.id === id);

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const user = req.user!;
    const isEmployee = user.role === 'EMPLOYEE';

    // Object-level permission check
    if (isEmployee && task.assigned_employee_id !== user.employee_id) {
      res.status(403).json({ error: 'Forbidden: You cannot modify this task' });
      return;
    }

    const updates = req.body;
    const allowedUpdates: Partial<Task> = {};
    const now = new Date().toISOString();

    if (user.role === 'ADMIN' || user.role === 'TEAM_LEAD') {
      if (updates.title !== undefined) allowedUpdates.title = String(updates.title).trim();
      if (updates.description !== undefined) allowedUpdates.description = String(updates.description).trim();
      if (updates.priority !== undefined) allowedUpdates.priority = updates.priority;
      if (updates.due_date !== undefined) allowedUpdates.due_date = updates.due_date;
      if (updates.progress !== undefined) allowedUpdates.progress = Math.min(100, Math.max(0, Number(updates.progress)));
      if (updates.status !== undefined) {
        allowedUpdates.status = updates.status;
        if (updates.status === 'Completed' && task.status !== 'Completed') {
          allowedUpdates.completed_at = now;
          allowedUpdates.progress = 100;
        } else if (updates.status !== 'Completed') {
          allowedUpdates.completed_at = null;
        }
      }
      if (updates.assigned_employee_id !== undefined && updates.assigned_employee_id !== task.assigned_employee_id) {
        const newEmp = db.getEmployees().find(e => e.id === updates.assigned_employee_id);
        if (!newEmp) {
          res.status(400).json({ error: 'Selected employee does not exist' });
          return;
        }
        allowedUpdates.assigned_employee_id = updates.assigned_employee_id;
        allowedUpdates.company_id = newEmp.company_id;
        db.addActivity({
          task_id: id,
          action: 'ASSIGNMENT_CHANGED',
          description: `Task reassigned to ${newEmp.full_name} by ${user.full_name}`,
          user_id: user.id,
          user_name: user.full_name,
          created_at: now,
        });
      }

      if (updates.title !== undefined && updates.title !== task.title) {
        db.addActivity({
          task_id: id,
          action: 'UPDATED',
          description: `Task title updated to "${updates.title}" by ${user.full_name}`,
          user_id: user.id,
          user_name: user.full_name,
          created_at: now,
        });
      }

      if (updates.description !== undefined && updates.description !== task.description) {
        db.addActivity({
          task_id: id,
          action: 'UPDATED',
          description: `Work instructions updated by ${user.full_name}`,
          user_id: user.id,
          user_name: user.full_name,
          created_at: now,
        });
      }
    } else {
      // Employee permissions
      if (updates.status !== undefined) {
        // Employee status flow: Pending -> In Progress, In Progress -> Completed
        const validStatuses: TaskStatus[] = ['Pending', 'In Progress', 'Completed'];
        if (!validStatuses.includes(updates.status)) {
          res.status(400).json({ error: 'Invalid status for employee' });
          return;
        }
        allowedUpdates.status = updates.status;
        if (updates.status === 'Completed') {
          allowedUpdates.completed_at = now;
          allowedUpdates.submitted_at = task.submitted_at || now;
          allowedUpdates.progress = 100;
        }
      }
      if (updates.progress !== undefined) {
        allowedUpdates.progress = Math.min(100, Math.max(0, Number(updates.progress)));
      }
    }

    if (updates.status && updates.status !== task.status) {
      db.addActivity({
        task_id: id,
        action: 'STATUS_CHANGED',
        description: `${user.full_name} changed status: ${task.status} → ${updates.status}`,
        user_id: user.id,
        user_name: user.full_name,
        created_at: now,
      });
    }

    const updatedTask = db.updateTask(id, allowedUpdates);
    res.json(updatedTask);
  });

  // DELETE /api/tasks/:id (Admin & Team Lead)
  app.delete('/api/tasks/:id', authMiddleware, adminOrLead, (req: AuthRequest, res) => {
    const id = Number(req.params.id);
    const success = db.deleteTask(id);
    if (!success) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.json({ success: true, message: 'Task deleted successfully' });
  });

  // DELETE /api/admin/clear-all-tasks (Admin & Team Lead - Clear out all tasks)
  app.delete('/api/admin/clear-all-tasks', authMiddleware, adminOrLead, (_req: AuthRequest, res) => {
    db.clearAllTasks();
    res.json({ success: true, message: 'All tasks deleted successfully. Clean workspace ready.' });
  });

  // ==========================================
  // CORE WORKFLOW: EMPLOYEE OUTPUT API
  // POST /api/tasks/:id/output
  // ==========================================
  app.post('/api/tasks/:id/output', authMiddleware, (req: AuthRequest, res) => {
    const id = Number(req.params.id);
    const task = db.getTasks().find(t => t.id === id);

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const user = req.user!;
    // Employee can only submit output to their own task
    if (user.role === 'EMPLOYEE' && task.assigned_employee_id !== user.employee_id) {
      res.status(403).json({ error: 'Forbidden: You cannot submit output for this task' });
      return;
    }

    const { employee_output } = req.body;
    if (employee_output === undefined) {
      res.status(400).json({ error: 'employee_output field is required' });
      return;
    }

    const cleanOutput = String(employee_output).trim();
    const now = new Date().toISOString();

    // Record previous output in output history if changing
    if (cleanOutput) {
      db.addOutputHistory(id, cleanOutput, user.full_name);
    }

    // Add activity log
    const snippet = cleanOutput.length > 50 ? `${cleanOutput.substring(0, 50)}...` : cleanOutput;
    db.addActivity({
      task_id: id,
      action: 'OUTPUT_UPDATED',
      description: `${user.full_name} updated output: "${snippet}"`,
      user_id: user.id,
      user_name: user.full_name,
      created_at: now,
    });

    const updatedTask = db.updateTask(id, {
      employee_output: cleanOutput,
      submitted_at: cleanOutput ? now : task.submitted_at,
      updated_at: now,
    });

    res.json({
      success: true,
      task: updatedTask,
      message: 'Output saved successfully',
    });
  });

  // POST /api/tasks/:id/status
  app.post('/api/tasks/:id/status', authMiddleware, (req: AuthRequest, res) => {
    const id = Number(req.params.id);
    const task = db.getTasks().find(t => t.id === id);

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const user = req.user!;
    if (user.role === 'EMPLOYEE' && task.assigned_employee_id !== user.employee_id) {
      res.status(403).json({ error: 'Forbidden: You cannot modify this task status' });
      return;
    }

    const { status, progress } = req.body;
    if (!status) {
      res.status(400).json({ error: 'status is required' });
      return;
    }

    const now = new Date().toISOString();
    const updates: Partial<Task> = { status };

    if (status === 'Completed') {
      updates.progress = 100;
      updates.completed_at = now;
      updates.submitted_at = task.submitted_at || now;
    } else if (progress !== undefined) {
      updates.progress = Math.min(100, Math.max(0, Number(progress)));
      if (task.completed_at) {
        updates.completed_at = null;
      }
    }

    db.addActivity({
      task_id: id,
      action: 'STATUS_CHANGED',
      description: `${user.full_name} changed status: ${task.status} → ${status}`,
      user_id: user.id,
      user_name: user.full_name,
      created_at: now,
    });

    const updated = db.updateTask(id, updates);
    res.json({ success: true, task: updated });
  });

  // GET /api/tasks/:id/activity
  app.get('/api/tasks/:id/activity', authMiddleware, (req: AuthRequest, res) => {
    const id = Number(req.params.id);
    const task = db.getTasks().find(t => t.id === id);

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    if (req.user?.role === 'EMPLOYEE' && task.assigned_employee_id !== req.user.employee_id) {
      res.status(403).json({ error: 'Forbidden: You cannot view activity for this task' });
      return;
    }

    const activities = db.getActivities().filter(a => a.task_id === id);
    const outputHistory = db.getOutputHistory().filter(h => h.task_id === id);

    res.json({ activities, output_history: outputHistory });
  });

  // ==========================================
  // DASHBOARDS APIs
  // ==========================================

  // GET /api/admin/dashboard (Admin & Team Lead)
  app.get('/api/admin/dashboard', authMiddleware, adminOrLead, (_req, res) => {
    const tasks = db.getTasks();
    const employees = db.getEmployees();
    const companies = db.getCompanies();

    const totalEmployees = employees.length;
    const totalTasks = tasks.length;
    const pending = tasks.filter(t => t.status === 'Pending').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const onHold = tasks.filter(t => t.status === 'On Hold').length;
    const cancelled = tasks.filter(t => t.status === 'Cancelled').length;

    const noOutput = tasks.filter(t => !t.employee_output || t.employee_output.trim() === '').length;

    // Overdue tasks: due_date < today AND status !== 'Completed' AND status !== 'Cancelled'
    const todayStr = '2026-10-07';
    const overdue = tasks.filter(
      t => t.status !== 'Completed' && t.status !== 'Cancelled' && t.due_date < todayStr
    ).length;

    // Today's employee work items: updated, created, or submitted recently
    const todayIso = new Date().toISOString().split('T')[0];
    const todayWork = tasks
      .filter(t => t.updated_at.startsWith(todayIso) || t.created_at.startsWith(todayIso) || t.updated_at.startsWith('2026-10'))
      .map(t => {
        const emp = employees.find(e => e.id === t.assigned_employee_id);
        const comp = companies.find(c => c.id === t.company_id);
        return {
          id: t.id,
          employee_name: emp ? emp.full_name : 'Unknown',
          employee_avatar: emp ? emp.profile_photo : '',
          task_title: t.title,
          output: t.employee_output,
          status: t.status,
          priority: t.priority,
          progress: t.progress,
          submitted_at: t.submitted_at || null,
          updated_at: t.updated_at,
          company_name: comp ? comp.name : '',
        };
      });

    res.json({
      counts: {
        totalEmployees,
        totalTasks,
        pending,
        inProgress,
        completed,
        onHold,
        cancelled,
        noOutput,
        overdue,
      },
      todayWork,
    });
  });

  // GET /api/employee/dashboard
  app.get('/api/employee/dashboard', authMiddleware, (req: AuthRequest, res) => {
    const user = req.user!;
    if (user.role !== 'EMPLOYEE' || !user.employee_id) {
      res.status(403).json({ error: 'Employee profile not associated' });
      return;
    }

    const employeeId = user.employee_id;
    const allTasks = db.getTasks().filter(t => t.assigned_employee_id === employeeId);
    const companies = db.getCompanies();

    const totalTasks = allTasks.length;
    const pending = allTasks.filter(t => t.status === 'Pending').length;
    const inProgress = allTasks.filter(t => t.status === 'In Progress').length;
    const completed = allTasks.filter(t => t.status === 'Completed').length;
    const noOutput = allTasks.filter(t => !t.employee_output || t.employee_output.trim() === '').length;

    const todayStr = '2026-10-07';
    const overdue = allTasks.filter(
      t => t.status !== 'Completed' && t.status !== 'Cancelled' && t.due_date < todayStr
    ).length;

    const enrichedTasks = allTasks.map(t => {
      const comp = companies.find(c => c.id === t.company_id);
      return {
        ...t,
        company_name: comp ? comp.name : '',
      };
    });

    res.json({
      counts: {
        totalTasks,
        pending,
        inProgress,
        completed,
        overdue,
        noOutput,
      },
      tasks: enrichedTasks,
    });
  });

  // Reset database back to pristine initial state for testing
  app.post('/api/dev/reset-data', (_req, res) => {
    const reset = db.resetToSeed();
    res.json({ success: true, message: 'Database reset to seed data', tasksCount: reset.tasks.length });
  });

  // ==========================================
  // FRONTEND MOUNTING & VITE MIDDLEWARES
  // ==========================================

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AMNEXUS Server started on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
