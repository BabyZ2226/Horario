import React, { useState } from 'react';
import { Subject } from '../types';
import { colorMap } from '../lib/utils';
import { Trash2 } from 'lucide-react';

interface SubjectFormProps {
  initialData?: Subject;
  onSubmit: (data: Omit<Subject, 'id'>) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

export function SubjectForm({ initialData, onSubmit, onDelete, onCancel }: SubjectFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [color, setColor] = useState<Subject['color']>(initialData?.color || 'blue');
  const [teacher, setTeacher] = useState(initialData?.teacher || '');
  const [room, setRoom] = useState(initialData?.room || '');

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onSubmit({ name, color, teacher, room });
  };

  const colors: Array<Subject['color']> = [
    'blue', 'green', 'red', 'purple', 'orange', 'yellow', 'pink', 'cyan', 'slate',
    'indigo', 'violet', 'rose', 'amber', 'emerald', 'teal', 'lime', 'fuchsia'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de la Materia *</label>
        <input 
          required
          type="text" 
          value={name} 
          onChange={e => setName(e.target.value)} 
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder="Ej: Matemáticas"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Color</label>
        <div className="flex flex-wrap gap-2">
          {colors.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${colorMap[c]} ${color === c ? 'ring-2 ring-offset-2 ring-slate-800 border-transparent' : 'border-transparent opacity-70 hover:opacity-100'}`}
            />
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Profesor (Opcional)</label>
        <input 
          type="text" 
          value={teacher} 
          onChange={e => setTeacher(e.target.value)} 
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder="Ej: Prof. García"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Aula / Salón (Opcional)</label>
        <input 
          type="text" 
          value={room} 
          onChange={e => setRoom(e.target.value)} 
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder="Ej: Lab 2"
        />
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
          <button type="submit" className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg transition-colors shadow-sm">
            Guardar
          </button>
        </div>
      </div>
    </form>
  );
}
