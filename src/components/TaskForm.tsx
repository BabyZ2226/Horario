import React, { useState } from 'react';
import { Subject, Task } from '../types';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';

interface TaskFormProps {
  subjects: Subject[];
  initialData?: Task;
  defaultDate?: Date;
  onSubmit: (data: Omit<Task, 'id'>) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

export function TaskForm({ subjects, initialData, defaultDate, onSubmit, onDelete, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [subjectId, setSubjectId] = useState(initialData?.subjectId || (subjects.length > 0 ? subjects[0].id : ''));
  const [dueDate, setDueDate] = useState(initialData?.dueDate || (defaultDate ? format(defaultDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')));

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !subjectId) return;
    onSubmit({ title, description, subjectId, dueDate, completed: initialData?.completed || false });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Título de la Tarea *</label>
        <input 
          required
          type="text" 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder="Ej: Ensayo de Historia"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Descripción (Opcional)</label>
        <textarea 
          value={description} 
          onChange={e => setDescription(e.target.value)} 
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
          placeholder="Añade detalles..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Materia *</label>
          <select 
            required
            value={subjectId} 
            onChange={e => setSubjectId(e.target.value)} 
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="" disabled>Selecciona...</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Entrega *</label>
          <input 
            type="date" 
            required
            value={dueDate} 
            onChange={e => setDueDate(e.target.value)} 
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
