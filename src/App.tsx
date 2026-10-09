import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminAllTasksPage } from './pages/admin/AdminAllTasksPage';
import { AdminCompaniesPage } from './pages/admin/AdminCompaniesPage';
import { AdminEmployeesPage } from './pages/admin/AdminEmployeesPage';
import { EmployeeTasksPage } from './pages/employee/EmployeeTasksPage';
import { EmployeeDashboardPage } from './pages/employee/EmployeeDashboardPage';
import { EmployeeProfilePage } from './pages/employee/EmployeeProfilePage';
import { CreateTaskModal } from './components/CreateTaskModal';
import { EditTaskModal } from './components/EditTaskModal';
import { TaskDetailModal } from './components/TaskDetailModal';
import { ViewOutputModal } from './components/ViewOutputModal';
import { CreateCompanyModal } from './components/CreateCompanyModal';
import { CreateEmployeeModal } from './components/CreateEmployeeModal';
import { ResetPasswordModal } from './components/ResetPasswordModal';
import { Employee, Task } from './types';

function MainApp() {
  const { user, loading } = useAuth();

  // Navigation tab state
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Modals state
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [createTaskEmployeeId, setCreateTaskEmployeeId] = useState<string | undefined>(undefined);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [selectedDetailTaskId, setSelectedDetailTaskId] = useState<number | null>(null);
  const [outputModalTask, setOutputModalTask] = useState<Task | null>(null);

  const [isCreateCompanyOpen, setIsCreateCompanyOpen] = useState(false);
  const [isCreateEmployeeOpen, setIsCreateEmployeeOpen] = useState(false);
  const [resetPasswordEmployee, setResetPasswordEmployee] = useState<Employee | null>(null);

  // Filters forwarded to AllTasksPage from Dashboard clicks
  const [tasksFilter, setTasksFilter] = useState<{ status?: string; output_filter?: string } | undefined>(undefined);

  // Sync tab with role
  useEffect(() => {
    if (user) {
      const isManager = user.role === 'ADMIN' || user.role === 'TEAM_LEAD';
      if (isManager) {
        if (!['dashboard', 'all-tasks', 'companies', 'employees'].includes(currentTab)) {
          setCurrentTab('dashboard');
        }
      } else {
        if (!['employee-tasks', 'employee-dashboard', 'employee-profile'].includes(currentTab)) {
          setCurrentTab('employee-tasks');
        }
      }
    }
  }, [user?.role]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin shadow-sm shadow-amber-500/20" />
          <span className="text-xs text-zinc-900 font-bold tracking-widest uppercase font-display">
            Loading AmNexus...
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const handleOpenCreateTask = (employeeId?: string) => {
    setCreateTaskEmployeeId(employeeId);
    setIsCreateTaskOpen(true);
  };

  const handleNavigateToTasksWithFilter = (filter?: { status?: string; output_filter?: string }) => {
    setTasksFilter(filter);
    setCurrentTab('all-tasks');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col text-zinc-900 font-sans selection:bg-amber-400 selection:text-black">
      {/* Top Bar Contract Navbar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={tab => {
          setTasksFilter(undefined);
          setCurrentTab(tab);
        }}
        onOpenCreateTask={() => handleOpenCreateTask()}
      />

      {/* Content Area */}
      <main className="flex-1 pb-16">
        {user.role === 'ADMIN' || user.role === 'TEAM_LEAD' ? (
          <>
            {currentTab === 'dashboard' && (
              <AdminDashboardPage
                onOpenCreateTask={() => handleOpenCreateTask()}
                onNavigateToTasks={handleNavigateToTasksWithFilter}
                onViewTask={id => setSelectedDetailTaskId(id)}
                onViewOutput={task => setOutputModalTask(task)}
              />
            )}

            {currentTab === 'all-tasks' && (
              <AdminAllTasksPage
                onOpenCreateTask={empId => handleOpenCreateTask(empId)}
                onViewTask={id => setSelectedDetailTaskId(id)}
                onViewOutput={task => setOutputModalTask(task)}
                onEditTask={task => setEditingTask(task)}
                initialFilters={tasksFilter}
              />
            )}

            {currentTab === 'companies' && (
              <AdminCompaniesPage
                onOpenCreateCompany={() => setIsCreateCompanyOpen(true)}
              />
            )}

            {currentTab === 'employees' && (
              <AdminEmployeesPage
                onOpenCreateEmployee={() => setIsCreateEmployeeOpen(true)}
                onOpenResetPassword={emp => setResetPasswordEmployee(emp)}
                onAssignTask={empId => handleOpenCreateTask(empId)}
              />
            )}
          </>
        ) : (
          /* Employee Views */
          <>
            {currentTab === 'employee-tasks' && (
              <EmployeeTasksPage
                onViewTaskDetails={id => setSelectedDetailTaskId(id)}
              />
            )}

            {currentTab === 'employee-dashboard' && (
              <EmployeeDashboardPage
                onGoToTasks={() => setCurrentTab('employee-tasks')}
                onViewTask={id => setSelectedDetailTaskId(id)}
              />
            )}

            {currentTab === 'employee-profile' && (
              <EmployeeProfilePage />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => {
          setIsCreateTaskOpen(false);
          setCreateTaskEmployeeId(undefined);
        }}
        onTaskCreated={() => {
          // Trigger refresh by staying on tab or switching to all-tasks
          if (currentTab === 'all-tasks') {
            window.dispatchEvent(new Event('task-created'));
          }
        }}
        initialEmployeeId={createTaskEmployeeId}
      />

      <EditTaskModal
        task={editingTask}
        isOpen={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
        onTaskUpdated={() => {
          window.dispatchEvent(new Event('task-updated'));
        }}
      />

      <TaskDetailModal
        taskId={selectedDetailTaskId}
        onClose={() => setSelectedDetailTaskId(null)}
        onTaskUpdated={() => {
          window.dispatchEvent(new Event('task-updated'));
        }}
        onOpenEditTask={task => {
          setSelectedDetailTaskId(null);
          setEditingTask(task);
        }}
      />

      <ViewOutputModal
        task={outputModalTask}
        onClose={() => setOutputModalTask(null)}
      />

      <CreateCompanyModal
        isOpen={isCreateCompanyOpen}
        onClose={() => setIsCreateCompanyOpen(false)}
        onCompanyCreated={() => {
          window.location.reload();
        }}
      />

      <CreateEmployeeModal
        isOpen={isCreateEmployeeOpen}
        onClose={() => setIsCreateEmployeeOpen(false)}
        onEmployeeCreated={() => {
          window.location.reload();
        }}
      />

      <ResetPasswordModal
        employee={resetPasswordEmployee}
        onClose={() => setResetPasswordEmployee(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
