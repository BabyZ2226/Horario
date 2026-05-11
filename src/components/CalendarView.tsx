import React, { useState } from 'react';
import { Task } from '../types';
import { colorMap, cn } from '../lib/utils';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday, 
  isSameDay, 
  addMonths, 
  subMonths,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, PencilLine, Edit2, Plus } from 'lucide-react';
import { useSchool } from '../context/SchoolContext';

interface CalendarViewProps {
  onEditTask: (task: Task) => void;
  onAddTaskAt?: (date: string) => void;
}

export function CalendarView({ onEditTask, onAddTaskAt }: CalendarViewProps) {
  const { subjects, tasks, updateTask } = useSchool();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const getSubject = (id: string) => subjects.find(s => s.id === id);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const tasksForSelected = tasks.filter(t => t.dueDate === format(selectedDate, 'yyyy-MM-dd'));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {/* Calendar Section */}
      <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800 capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: es })}
          </h2>
          <div className="flex gap-2">
            <button 
              onClick={prevMonth}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={nextMonth}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px mb-2 text-center text-sm font-medium text-slate-500">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
            <div key={day} className="py-2">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day, idx) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayTasks = tasks.filter(t => t.dueDate === dateStr);
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, currentDate);
            
            return (
              <button
                key={day.toString()}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  "relative h-14 flex flex-col items-center p-1 rounded-xl transition-all border-2 border-transparent",
                  !isCurrentMonth && "opacity-40",
                  isSelected ? "bg-slate-800 text-white shadow-md border-slate-800" : "hover:bg-slate-100 text-slate-700",
                  isToday(day) && !isSelected && "text-blue-600 font-bold bg-blue-50"
                  
                )}
              >
                <span className="text-sm">{format(day, 'd')}</span>
                
                {/* Task Indicators */}
                <div className="flex gap-1 mt-1 flex-wrap justify-center px-1">
                  {dayTasks.slice(0, 3).map(task => {
                    const subj = getSubject(task.subjectId);
                    return (
                      <div 
                        key={task.id} 
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          subj ? colorMap[subj.color].split(' ')[1].replace('text-', 'bg-') : "bg-slate-400",
                          isSelected ? "bg-white/80" : ""
                        )} 
                      />
                    )
                  })}
                  {dayTasks.length > 3 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tasks Section for Selected Day */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-white rounded-xl shadow-sm">
            <PencilLine className="w-6 h-6 text-slate-700" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-800">Tareas del día</h3>
            <p className="text-sm text-slate-500 capitalize">
              {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
            </p>
          </div>
          <button 
            onClick={() => onAddTaskAt?.(format(selectedDate, 'yyyy-MM-dd'))}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 flex-1 overflow-y-auto pr-1">
          {tasksForSelected.length === 0 ? (
            <div className="text-center p-8 bg-white rounded-xl border border-dashed border-slate-300">
              <p className="text-slate-500 text-sm">No hay tareas para este día.</p>
            </div>
          ) : (
            tasksForSelected.map(task => {
              const subject = getSubject(task.subjectId);
              const colorClasses = subject ? colorMap[subject.color] : colorMap.slate;

              return (
                <div 
                  key={task.id}
                  className={cn(
                    "group p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex gap-3 transition-colors relative",
                    task.completed && "opacity-60 bg-slate-50"
                  )}
                >
                  <button 
                    onClick={() => updateTask(task.id, { completed: !task.completed })}
                    className="mt-0.5 flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>
                  <div 
                    className="flex-1 min-w-0 mr-8 cursor-pointer"
                    onClick={() => onEditTask(task)}
                  >
                    <div className="flex flex-col gap-1.5 justify-start mb-1">
                       <h4 className={cn(
                         "font-semibold text-slate-800 text-sm",
                         task.completed && "line-through text-slate-500"
                       )}>
                         {task.title}
                       </h4>
                       {subject && (
                         <span className={cn(
                           "text-[10px] w-fit font-bold px-2 py-0.5 rounded-full whitespace-nowrap",
                           colorClasses
                         )}>
                           {subject.name}
                         </span>
                       )}
                    </div>
                    {task.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => onEditTask(task)}
                    className="absolute top-3 right-3 p-1.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-slate-700 bg-slate-50 rounded-md"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
