import React, { useState } from 'react';
import { ClassSession, Subject } from '../types';
import { Trash2 } from 'lucide-react';

interface SessionFormProps {
  subjects: Subject[];
  initialData?: ClassSession;
  defaultDayOfWeek?: number;
  defaultStartTime?: string;
  defaultEndTime?: string;
  onSubmit: (data: Omit<ClassSession, 'id'>) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

export function SessionForm({ subjects, initialData, defaultDayOfWeek, defaultStartTime, defaultEndTime, onSubmit, onDelete, onCancel }: SessionFormProps) {
  const [subjectId, setSubjectId] = useState(initialData?.subjectId || (subjects.length > 0 ? subjects[0].id : ''));
  const [dayOfWeek, setDayOfWeek] = useState(initialData?.dayOfWeek ?? defaultDayOfWeek ?? 1);
  const [startTime, setStartTime] = useState(initialData?.startTime || defaultStartTime || '08:00');
  const [endTime, setEndTime] = useState(initialData?.endTime || defaultEndTime || '09:00');

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId) return;
    onSubmit({ subjectId, dayOfWeek, startTime, endTime });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Materia *</label>
        <select 
          required
          value={subjectId} 
          onChange={e => setSubjectId(e.target.value)} 
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value="" disabled>Selecciona una materia...</option>
          {subjects.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        {subjects.length === 0 && <p className="text-xs text-red-500 mt-1">Debes crear al menos una materia primero.</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Día de la semana</label>
        <select 
          value={dayOfWeek} 
          onChange={e => setDayOfWeek(Number(e.target.value))} 
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value={1}>Lunes</option>
          <option value={2}>Martes</option>
          <option value={3}>Miércoles</option>
          <option value={4}>Jueves</option>
          <option value={5}>Viernes</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Hora Inicio</label>
          <input 
            type="time" 
            required
            value={startTime} 
            onChange={e => setStartTime(e.target.value)} 
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Hora Fin</label>
          <input 
            type="time" 
            required
            value={endTime} 
            onChange={e => setEndTime(e.target.value)} 
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>
      
      <div className="pt-4 flex items-center justify-between">
        {onDelete ? (
          isConfirmingDelete ? (
            <button type="button" onClick={onDelete} className="text-white bg-red-500 hover:bg-red-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
              Confirmar
            </button>
          ) : (
            <button type="button" onClick={() => setIsConfirmingDelete(true)} className="text-red-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50">
              <Trash2 className="w-5 h-5" />
            </button>
          )
        ) : <div />}
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-medium rounded-lg transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={!subjectId} className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50">
            Guardar
          </button>
        </div>
      </div>
    </form>
  );
}
