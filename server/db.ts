import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { DatabaseSchema, User, Company, Employee, Task, TaskActivity, OutputHistoryItem } from './types.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function generateSeedData(): DatabaseSchema {
  const adminPasswordHash = hashPassword('Admin@12345');
  const leadPasswordHash = hashPassword('Lead@12345');
  const savadPasswordHash = hashPassword('Savad@12345');
  const rahulPasswordHash = hashPassword('Rahul@12345');
  const fadilPasswordHash = hashPassword('Fadil@12345');
  const anuPasswordHash = hashPassword('Anu@12345');

  const companies: Company[] = [
    {
      id: 'comp_asquare',
      name: 'Asquare Technologies',
      code: 'ASQ',
      email: 'info@asquare.tech',
      phone: '+1 (555) 234-5678',
      address: 'Suite 400, 100 Innovation Blvd, Tech Park, CA',
      website: 'https://asquare.tech',
      status: 'Active',
      created_at: '2026-01-10T09:00:00.000Z',
      updated_at: '2026-01-10T09:00:00.000Z',
    },
    {
      id: 'comp_nexacorp',
      name: 'NexaCorp Solutions',
      code: 'NEX',
      email: 'contact@nexacorp.io',
      phone: '+1 (555) 345-6789',
      address: 'Floor 12, Financial District, New York, NY',
      website: 'https://nexacorp.io',
      status: 'Active',
      created_at: '2026-01-15T09:00:00.000Z',
      updated_at: '2026-01-15T09:00:00.000Z',
    },
    {
      id: 'comp_vertex',
      name: 'Vertex Dynamics',
      code: 'VTX',
      email: 'hello@vertexdynamics.com',
      phone: '+1 (555) 456-7890',
      address: '742 Evergreen Terrace, Austin, TX',
      website: 'https://vertexdynamics.com',
      status: 'Active',
      created_at: '2026-02-01T09:00:00.000Z',
      updated_at: '2026-02-01T09:00:00.000Z',
    },
  ];

  const employees: Employee[] = [];

  const users: User[] = [
    {
      id: 'user_admin',
      email: 'admin@example.com',
      password_hash: adminPasswordHash,
      role: 'ADMIN',
      full_name: 'Administrator',
      phone: '+1 (555) 000-1122',
      job_title: 'Managing Director & Operations Head',
      department: 'Executive',
      profile_photo: '',
      status: 'Active',
      created_at: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'user_lead',
      email: 'teamlead@example.com',
      password_hash: leadPasswordHash,
      role: 'TEAM_LEAD',
      full_name: 'Team Lead',
      employee_id: 'emp_lead',
      company_id: 'comp_asquare',
      phone: '+1 (555) 000-3344',
      job_title: 'Engineering Team Lead',
      department: 'Engineering & Operations',
      profile_photo: '',
      status: 'Active',
      created_at: '2026-01-20T08:30:00.000Z',
    },
  ];

  // START WITH ZERO FAKE TASKS: Admin and Team Lead can manually enter tasks from scratch!
  const tasks: Task[] = [];
  const task_activities: TaskActivity[] = [];
  const output_history: OutputHistoryItem[] = [];

  return {
    users,
    companies,
    employees,
    tasks,
    task_activities,
    output_history,
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure team lead exists if missing in older db.json
        if (!parsed.users.some((u: User) => u.email === 'teamlead@example.com')) {
          const seed = generateSeedData();
          parsed.users = seed.users;
          parsed.employees = seed.employees;
        }
        return parsed;
      } catch (err) {
        console.error('Failed reading existing db.json, generating seed data:', err);
      }
    }
    const seed = generateSeedData();
    this.saveDataDirect(seed);
    return seed;
  }

  private saveDataDirect(data: DatabaseSchema): void {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }

  public save(): void {
    this.saveDataDirect(this.data);
  }

  public resetToSeed(): DatabaseSchema {
    this.data = generateSeedData();
    this.save();
    return this.data;
  }

  public clearAllTasks(): void {
    this.data.tasks = [];
    this.data.task_activities = [];
    this.data.output_history = [];
    this.save();
  }

  // Getters
  public getUsers(): User[] {
    return this.data.users;
  }

  public getCompanies(): Company[] {
    return this.data.companies;
  }

  public getEmployees(): Employee[] {
    return this.data.employees;
  }

  public getTasks(): Task[] {
    return this.data.tasks;
  }

  public getActivities(): TaskActivity[] {
    return this.data.task_activities;
  }

  public getOutputHistory(): OutputHistoryItem[] {
    return this.data.output_history;
  }

  // Mutations
  public addUser(user: User): void {
    this.data.users.push(user);
    this.save();
  }

  public updateUser(id: string, updates: Partial<User>): User | null {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.save();
    return this.data.users[idx];
  }

  public addCompany(company: Company): void {
    this.data.companies.push(company);
    this.save();
  }

  public updateCompany(id: string, updates: Partial<Company>): Company | null {
    const idx = this.data.companies.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.companies[idx] = { ...this.data.companies[idx], ...updates, updated_at: new Date().toISOString() };
    this.save();
    return this.data.companies[idx];
  }

  public addEmployee(employee: Employee): void {
    this.data.employees.push(employee);
    this.save();
  }

  public updateEmployee(id: string, updates: Partial<Employee>): Employee | null {
    const idx = this.data.employees.findIndex(e => e.id === id);
    if (idx === -1) return null;
    this.data.employees[idx] = { ...this.data.employees[idx], ...updates, updated_at: new Date().toISOString() };
    this.save();
    return this.data.employees[idx];
  }

  public deleteEmployee(id: string): boolean {
    const emp = this.data.employees.find(e => e.id === id);
    if (!emp) return false;
    this.data.employees = this.data.employees.filter(e => e.id !== id);
    if (emp.user_id) {
      this.data.users = this.data.users.filter(u => u.id !== emp.user_id);
    }
    this.save();
    return true;
  }

  public addTask(task: Omit<Task, 'id'>): Task {
    // Generate sequential ID starting from 101
    const maxId = this.data.tasks.reduce((max, t) => Math.max(max, t.id), 100);
    const newTask: Task = {
      ...task,
      id: maxId + 1,
    };
    this.data.tasks.unshift(newTask);
    this.save();
    return newTask;
  }

  public updateTask(id: number, updates: Partial<Task>): Task | null {
    const idx = this.data.tasks.findIndex(t => t.id === id);
    if (idx === -1) return null;
    this.data.tasks[idx] = {
      ...this.data.tasks[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.save();
    return this.data.tasks[idx];
  }

  public deleteTask(id: number): boolean {
    const initialLen = this.data.tasks.length;
    this.data.tasks = this.data.tasks.filter(t => t.id !== id);
    if (this.data.tasks.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  public addActivity(activity: Omit<TaskActivity, 'id'>): TaskActivity {
    const newActivity: TaskActivity = {
      ...activity,
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };
    this.data.task_activities.unshift(newActivity);
    this.save();
    return newActivity;
  }

  public addOutputHistory(task_id: number, output_text: string, updated_by_name: string): OutputHistoryItem {
    const item: OutputHistoryItem = {
      id: `outhist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      task_id,
      output_text,
      updated_at: new Date().toISOString(),
      updated_by_name,
    };
    this.data.output_history.unshift(item);
    this.save();
    return item;
  }
}

export const db = new Database();
