import React, { useState } from 'react';
import { ClassSession } from '../types';
import { colorMap, cn } from '../lib/utils';
import { Clock, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSchool } from '../context/SchoolContext';

interface ScheduleViewProps {
  onEditSession: (session: ClassSession) => void;
  onAddAt: (day: number, time: string) => void;
}

const DAYS = [
  { value: 1, label: 'Lunes', short: 'Lun' },
  { value: 2, label: 'Martes', short: 'Mar' },
  { value: 3, label: 'Miércoles', short: 'Mié' },
  { value: 4, label: 'Jueves', short: 'Jue' },
  { value: 5, label: 'Viernes', short: 'Vie' },
];

const TIME_SLOTS = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'
];

export function ScheduleView({ onEditSession, onAddAt }: ScheduleViewProps) {
  const { subjects, schedule } = useSchool();
  const getSubject = (id: string) => subjects.find((s) => s.id === id);
  
  const today = new Date().getDay();
  const defaultDay = today >= 1 && today <= 5 ? today : 1;
  const [activeDay, setActiveDay] = useState(defaultDay);

  const renderDayColumn = (day: typeof DAYS[0], isMobile: boolean = false) => (
    <div key={day.value} className={cn("relative border-r last:border-r-0 border-slate-200", isMobile ? "col-span-3" : "col-span-1")}>
      {TIME_SLOTS.map((time) => (
        <div 
          key={`${day.value}-${time}`} 
          className="h-24 border-b border-slate-100 hover:bg-slate-100/50 cursor-pointer transition-colors"
          onClick={() => onAddAt(day.value, time)}
        />
      ))}
      
      {/* Render Sessions for this day */}
      {schedule
        .filter((s) => s.dayOfWeek === day.value)
        .map((session) => {
          const subject = getSubject(session.subjectId);
          if (!subject) return null;

          const startHour = parseInt(session.startTime.split(':')[0]);
          const startMin = parseInt(session.startTime.split(':')[1]);
          
          const endHour = parseInt(session.endTime.split(':')[0]);
          const endMin = parseInt(session.endTime.split(':')[1]);

          const offsetStart = startHour - 7 + (startMin / 60);
          const duration = (endHour - startHour) + ((endMin - startMin) / 60);

          const slotHeight = 96;

          const isBreak = subject.id === 'recreo' || subject.name.toLowerCase() === 'recreo' || subject.id === 'almuerzo' || subject.name.toLowerCase() === 'almuerzo';

          return (
            <div
              key={session.id}
              onClick={(e) => {
                e.stopPropagation();
                onEditSession(session);
              }}
              className={cn(
                "absolute cursor-pointer flex transition-all overflow-hidden",
                isBreak 
                  ? "left-0 right-[-1px] z-10 flex-col justify-center items-center border-y border-slate-200/80 bg-[repeating-linear-gradient(45deg,theme(colors.slate.50),theme(colors.slate.50)_10px,theme(colors.slate.100/50)_10px,theme(colors.slate.100/50)_20px)] text-slate-500 hover:brightness-95"
                  : cn("left-1 right-1 flex-col rounded-xl border p-2 gap-1 shadow-sm hover:-translate-y-0.5 z-20", colorMap[subject.color])
              )}
              style={isBreak ? {
                top: `${offsetStart * slotHeight}px`,
                height: `${duration * slotHeight}px`,
              } : {
                top: `${offsetStart * slotHeight + 4}px`,
                height: `${duration * slotHeight - 8}px`,
              }}
            >
              <h4 className={cn("font-bold leading-tight break-words text-center text-inherit", isBreak ? "text-xs uppercase tracking-widest opacity-70" : "text-sm")}>
                {subject.name}
              </h4>
              {!isBreak && duration >= 0.75 && (
                <div className="flex flex-col gap-0.5 mt-auto">
                  <div className="flex items-center text-xs opacity-80 font-medium">
                    <Clock className="w-3 h-3 mr-1 shrink-0" />
                    <span className="truncate">{session.startTime} - {session.endTime}</span>
                  </div>
                  {subject.room && (
                    <div className="flex items-center text-xs opacity-80">
                      <MapPin className="w-3 h-3 mr-1 shrink-0" />
                      <span className="truncate">{subject.room}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto overflow-x-hidden md:overflow-x-auto pb-8">
      {/* Mobile Day Selector */}
      <div className="md:hidden flex items-center justify-between bg-white p-2 mb-4 rounded-xl shadow-sm border border-slate-200">
        <button 
          onClick={() => setActiveDay(prev => Math.max(1, prev - 1))}
          disabled={activeDay === 1}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg disabled:opacity-50"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-1 justify-center flex-1">
          {DAYS.map(day => (
            <button
              key={day.value}
              onClick={() => setActiveDay(day.value)}
              className={cn(
                "px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors",
                activeDay === day.value ? "bg-slate-800 text-white" : "text-slate-500 hover:bg-slate-100"
              )}
            >
              {day.short}
            </button>
          ))}
        </div>
        <button 
          onClick={() => setActiveDay(prev => Math.min(5, prev + 1))}
          disabled={activeDay === 5}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg disabled:opacity-50"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Desktop View container */}
      <div className="hidden md:block min-w-[768px] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-6 border-b border-slate-200 bg-slate-50">
          <div className="p-4 text-center font-semibold text-slate-500 border-r border-slate-200">
            Hora
          </div>
          {DAYS.map((day) => (
            <div key={day.value} className="p-4 text-center font-semibold text-slate-700 border-r last:border-r-0 border-slate-200">
              {day.label}
            </div>
          ))}
        </div>

        {/* Grid Body */}
        <div className="relative grid grid-cols-6 bg-slate-50/50">
           <div className="col-span-1 border-r border-slate-200 bg-white">
             {TIME_SLOTS.map((time) => (
               <div key={time} className="h-24 border-b border-slate-100 flex items-start justify-center p-2">
                 <span className="text-xs font-medium text-slate-400 bg-white px-2 py-1 rounded-md shadow-sm border border-slate-100">{time}</span>
               </div>
             ))}
           </div>
           
           {DAYS.map((day) => renderDayColumn(day, false))}
        </div>
      </div>

      {/* Mobile View container */}
      <div className="md:hidden bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-4 border-b border-slate-200 bg-slate-50">
          <div className="p-3 text-center font-semibold text-slate-500 border-r border-slate-200 col-span-1">
            Hora
          </div>
          <div className="p-3 text-center font-semibold text-slate-700 col-span-3">
            {DAYS.find(d => d.value === activeDay)?.label}
          </div>
        </div>
        <div className="relative grid grid-cols-4 bg-slate-50/50">
          <div className="col-span-1 border-r border-slate-200 bg-white">
            {TIME_SLOTS.map((time) => (
              <div key={time} className="h-24 border-b border-slate-100 flex items-start justify-center p-2">
                <span className="text-xs font-medium text-slate-400 bg-white px-1.5 py-1 rounded-md shadow-sm border border-slate-100">{time}</span>
              </div>
            ))}
          </div>
          {renderDayColumn(DAYS.find(d => d.value === activeDay)!, true)}
        </div>
      </div>
    </div>
  );
}
