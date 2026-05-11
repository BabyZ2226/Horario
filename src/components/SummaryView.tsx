import React from 'react';
import { useSchool } from '../context/SchoolContext';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  isWithinInterval, 
  parseISO,
  isAfter,
  addDays,
  startOfDay
} from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle2, Clock, Calendar, BarChart3, TrendingUp, AlertCircle } from 'lucide-react';
import { colorMap, cn } from '../lib/utils';
import { ClassSession, Task } from '../types';

interface SummaryViewProps {
  onEditSession: (session: ClassSession) => void;
  onEditTask: (task: Task) => void;
}

export function SummaryView({ onEditSession, onEditTask }: SummaryViewProps) {
  const { subjects, schedule, tasks } = useSchool();
  const today = startOfDay(new Date());
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  const getSubject = (id: string) => subjects.find(s => s.id === id);

  // Stats
  const tasksThisWeek = tasks.filter(t => {
    const dueDate = parseISO(t.dueDate);
    return isWithinInterval(dueDate, { start: weekStart, end: weekEnd });
  });

  // Upcoming tasks
  const pendingTasks = tasks
    .filter(t => !t.completed)
    .sort((a, b) => {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
    .slice(0, 5);

  const completedTasksThisWeek = tasksThisWeek.filter(t => t.completed);
  const completionRate = tasksThisWeek.length > 0 
    ? Math.round((completedTasksThisWeek.length / tasksThisWeek.length) * 100) 
    : 0;

  // Upcoming classes (Next school day)
  let nextSchoolDayDate = addDays(today, 1);
  let searchAttempts = 0;
  let upcomingClasses: any[] = [];
  
  while (searchAttempts < 7) {
    const dayOfWeek = nextSchoolDayDate.getDay();
    upcomingClasses = schedule
      .filter(s => s.dayOfWeek === dayOfWeek)
      .map(session => ({
        ...session,
        date: nextSchoolDayDate
      }))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
      
    if (upcomingClasses.length > 0) {
      break;
    }
    
    nextSchoolDayDate = addDays(nextSchoolDayDate, 1);
    searchAttempts++;
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-8">
      <div className="mb-2 hidden md:block">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-tight">Resumen Semanal</h1>
        <p className="mt-1 text-slate-500">Un vistazo a tu progreso y lo que viene.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-xl">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Tareas Completadas</p>
            <p className="text-2xl font-bold text-slate-800">{completedTasksThisWeek.length} / {tasksThisWeek.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-xl">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-500">Tasa de Entrega</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-slate-800">{completionRate}%</p>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${completionRate}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="hidden md:flex bg-white p-6 rounded-2xl border border-slate-200 shadow-sm items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-xl">
            <BarChart3 className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Materias Activas</p>
            <p className="text-2xl font-bold text-slate-800">{subjects.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Tasks */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <CheckCircle2 className="w-5 h-5 text-slate-400" />
            <h2 className="font-bold text-slate-800">Tareas Pendientes</h2>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden min-h-[300px]">
            {pendingTasks.length === 0 ? (
              <div className="h-[300px] flex flex-col items-center justify-center p-8 text-center">
                <div className="bg-slate-50 p-4 rounded-full mb-3">
                   <CheckCircle2 className="w-8 h-8 text-green-400" />
                </div>
                <p className="text-slate-500 text-sm">¡Estás al día! No tienes tareas pendientes.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingTasks.map(task => {
                  const subject = getSubject(task.subjectId);
                  return (
                    <div 
                      key={task.id} 
                      onClick={() => onEditTask(task)}
                      className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{task.title}</p>
                        <p className="text-xs text-slate-500 capitalize">
                          {subject?.name} • Vence {format(parseISO(task.dueDate), 'd MMM', { locale: es })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Upcoming Classes */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Clock className="w-5 h-5 text-slate-400" />
            <h2 className="font-bold text-slate-800">Próximas Clases</h2>
          </div>

          <div className="space-y-3">
            {upcomingClasses.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                <p className="text-slate-500 text-sm">No hay clases programadas para los próximos días.</p>
              </div>
            ) : (
              upcomingClasses.map((session, idx) => {
                const subject = getSubject(session.subjectId);
                return (
                  <div 
                    key={`${session.id}-${idx}`} 
                    onClick={() => onEditSession(session)}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 transition-transform hover:translate-x-1 cursor-pointer"
                  >
                    <div className={cn("w-1.5 h-12 rounded-full", subject ? colorMap[subject.color].split(' ')[0] : "bg-slate-200")} />
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800">{subject?.name || 'Materia desconocida'}</h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(session.date, 'EEEE d', { locale: es })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {session.startTime}
                        </span>
                      </div>
                    </div>
                    {subject?.room && (
                      <div className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-lg uppercase tracking-wide">
                        {subject.room}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
