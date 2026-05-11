import React, { useState } from 'react';
import { CalendarDays, BookOpen, Clock, Settings, Plus, Menu, X, LayoutGrid } from 'lucide-react';
import { ScheduleView } from './components/ScheduleView';
import { CalendarView } from './components/CalendarView';
import { SubjectsView } from './components/SubjectsView';
import { SummaryView } from './components/SummaryView';
import { Modal } from './components/ui/Modal';
import { SessionForm } from './components/SessionForm';
import { TaskForm } from './components/TaskForm';
import { useSchool } from './context/SchoolContext';
import { ClassSession, Task } from './types';
import { cn } from './lib/utils';

export default function App() {
  const [activeTab, setActiveTab] = useState<'schedule' | 'tasks' | 'subjects' | 'summary'>('schedule');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const { user, loading: authLoading, signInWithGoogle, logOut, subjects, addSubject, addSession, updateSession, deleteSession, addTask, updateTask, deleteTask, schedule } = useSchool();
  
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<ClassSession | null>(null);

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleEditSession = (session: ClassSession) => {
    setEditingSession(session);
    setSessionModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskModalOpen(true);
  };

  const handleAddSessionAt = (day: number, time: string) => {
    // Find sessions on the same day and sort them by end time
    const daySessions = schedule
      .filter(s => s.dayOfWeek === day)
      .sort((a, b) => b.endTime.localeCompare(a.endTime));

    // Find the last session that ends before or at the clicked time
    const previousSession = daySessions.find(s => s.endTime <= time);
    
    let startTime = time;
    if (previousSession) {
      startTime = previousSession.endTime;
    }

    // Default duration: 50 minutes
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + 50;
    const endHours = String(Math.floor(totalMinutes / 60) % 24).padStart(2, '0');
    const endMinutes = String(totalMinutes % 60).padStart(2, '0');
    const endTime = `${endHours}:${endMinutes}`;
    
    setEditingSession({
      id: '', // No ID means new session
      dayOfWeek: day,
      startTime: startTime,
      endTime: endTime,
      subjectId: subjects[0]?.id || ''
    } as any);
    setSessionModalOpen(true);
  };

  const handleAddTaskAt = (date: string) => {
    setEditingTask({
      id: '',
      title: '',
      dueDate: date,
      completed: false,
      subjectId: subjects[0]?.id || ''
    } as any);
    setTaskModalOpen(true);
  };

  const navItems = [
    { id: 'schedule', label: 'Horario', icon: Clock },
    { id: 'tasks', label: 'Tareas', icon: CalendarDays },
    { id: 'subjects', label: 'Materias', icon: BookOpen },
    { id: 'summary', label: 'Resumen', icon: LayoutGrid },
  ] as const;

  const closeSidebar = () => setIsSidebarOpen(false);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="bg-blue-600 p-4 rounded-2xl animate-bounce mb-4">
          <BookOpen className="h-8 w-8 text-white" />
        </div>
        <p className="text-slate-400 font-medium animate-pulse">Cargando tu horario...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row pb-16 md:pb-0">
      {/* Mobile Top Bar */}
      <header className="md:hidden bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="bg-slate-800 p-2 rounded-lg">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg text-slate-800">Horario Escolar</span>
        </div>
        {user ? (
          <div className="flex items-center gap-2">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || ''} className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
              </div>
            )}
          </div>
        ) : (
          <button onClick={signInWithGoogle} className="text-sm font-semibold text-blue-600">Entrar</button>
        )}
      </header>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar (Desktop only now because of translation) */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 hidden md:flex flex-col"
      )}>
        <div className="h-full flex flex-col p-4">
          <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-xl">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">Escolar</span>
            </div>
            <button onClick={closeSidebar} className="md:hidden p-2 hover:bg-slate-800 rounded-lg">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  closeSidebar();
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group",
                  activeTab === item.id 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                    : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5",
                  activeTab === item.id ? "text-white" : "group-hover:text-slate-200"
                )} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-800 px-2">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-xl">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || ''} className="w-8 h-8 rounded-lg outline outline-2 outline-slate-700" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                      {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{user.displayName || 'Estudiante'}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                </div>
                <button 
                  onClick={logOut}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl transition-colors border border-slate-700"
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <div className="p-4 bg-slate-800/30 rounded-2xl border border-slate-800/50 text-center">
                <p className="text-xs text-slate-400 mb-3">Inicia sesión para guardar tu horario en la nube.</p>
                <button 
                  onClick={signInWithGoogle}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white text-slate-900 text-sm font-bold rounded-xl hover:bg-slate-100 transition-colors shadow-sm"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />
                  Google Login
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-50 md:h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'schedule' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-tight">Horario Semanal</h1>
                  <p className="mt-1 text-slate-500">Tus clases organizadas por día.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={async () => {
                      const recreoSubject = subjects.find(s => s.name.toLowerCase() === 'recreo' || s.id === 'recreo');
                      const almuerzoSubject = subjects.find(s => s.name.toLowerCase() === 'almuerzo' || s.id === 'almuerzo');
                      
                      const setupBreaks = async () => {
                        const rId = recreoSubject?.id || 'recreo';
                        const aId = almuerzoSubject?.id || 'almuerzo';

                        if (!recreoSubject) {
                          await addSubject({ name: 'Recreo', color: 'slate' as const, teacher: '', room: 'Patio' }, 'recreo');
                        }
                        if (!almuerzoSubject) {
                          await addSubject({ name: 'Almuerzo', color: 'slate' as const, teacher: '', room: 'Comedor' }, 'almuerzo');
                        }

                        // We rely on the IDs remaining consistent ('recreo' and 'almuerzo')
                        const hasRecreoSessions = schedule.some(s => s.subjectId === rId);
                        const hasAlmuerzoSessions = schedule.some(s => s.subjectId === aId);

                        if (!hasRecreoSessions) {
                          for (let day = 1; day <= 4; day++) {
                            await addSession({ subjectId: rId, dayOfWeek: day, startTime: '10:30', endTime: '11:00' });
                          }
                          await addSession({ subjectId: rId, dayOfWeek: 5, startTime: '11:00', endTime: '11:30' });
                        }

                        if (!hasAlmuerzoSessions) {
                          for (let day = 1; day <= 4; day++) {
                            await addSession({ subjectId: aId, dayOfWeek: day, startTime: '12:40', endTime: '13:15' });
                          }
                        }
                      };
                      
                      await setupBreaks();
                    }}
                    className="px-4 py-2.5 bg-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-300 transition-all flex items-center gap-2"
                  >
                    <Clock className="w-4 h-4" />
                    Descansos
                  </button>
                  <button 
                    onClick={() => { setEditingSession(null); setSessionModalOpen(true); }}
                    className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-md flex items-center gap-2 w-fit"
                  >
                    <Plus className="w-5 h-5 border-2 border-white/30 rounded-full" />
                    Añadir Clase
                  </button>
                </div>
              </div>
              <ScheduleView 
                onEditSession={handleEditSession} 
                onAddAt={handleAddSessionAt}
              />
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
               <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                   <div>
                     <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-tight">Gestión de Tareas</h1>
                     <p className="mt-1 text-slate-500">Seguimiento de entregas y pendientes.</p>
                   </div>
                   <button 
                       onClick={() => { setEditingTask(null); setTaskModalOpen(true); }}
                       className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-md flex items-center gap-2 w-fit"
                     >
                       <Plus className="w-5 h-5 border-2 border-white/30 rounded-full" />
                       Nueva Tarea
                     </button>
              </div>
              <CalendarView 
                onEditTask={handleEditTask} 
                onAddTaskAt={handleAddTaskAt}
              />
            </div>
          )}

          {activeTab === 'subjects' && (
            <SubjectsView />
          )}

          {activeTab === 'summary' && (
            <SummaryView 
              onEditSession={handleEditSession}
              onEditTask={handleEditTask}
            />
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center h-16 z-50 pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
              activeTab === item.id ? "text-blue-600" : "text-slate-500 hover:text-slate-900"
            )}
          >
            <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-blue-600" : "text-slate-500")} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Modals */}
      <Modal 
        isOpen={sessionModalOpen} 
        onClose={() => setSessionModalOpen(false)} 
        title={editingSession?.id ? "Editar Clase" : "Añadir Clase"}
      >
        <SessionForm
          subjects={subjects}
          initialData={editingSession || undefined}
          onSubmit={(data) => {
            if (editingSession?.id) {
              updateSession(editingSession.id, data);
            } else {
              addSession(data);
            }
            setSessionModalOpen(false);
          }}
          onDelete={editingSession?.id ? () => {
            deleteSession(editingSession.id);
            setSessionModalOpen(false);
          } : undefined}
          onCancel={() => setSessionModalOpen(false)}
        />
      </Modal>

      <Modal 
        isOpen={taskModalOpen} 
        onClose={() => setTaskModalOpen(false)} 
        title={editingTask?.id ? "Editar Tarea" : "Nueva Tarea"}
      >
        <TaskForm
          subjects={subjects}
          initialData={editingTask || undefined}
          onSubmit={(data) => {
            if (editingTask?.id) {
              updateTask(editingTask.id, data);
            } else {
              addTask(data);
            }
            setTaskModalOpen(false);
          }}
          onDelete={editingTask?.id ? () => {
            deleteTask(editingTask.id);
            setTaskModalOpen(false);
          } : undefined}
          onCancel={() => setTaskModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
