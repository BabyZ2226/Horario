import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { Modal } from './ui/Modal';
import { SubjectForm } from './SubjectForm';
import { Subject } from '../types';
import { colorMap, cn } from '../lib/utils';
import { Plus, Edit2 } from 'lucide-react';

export function SubjectsManagerModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { subjects, addSubject, updateSubject, deleteSubject } = useSchool();
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gestionar Materias" className="max-w-xl">
      {isCreating || editingSubject ? (
        <SubjectForm
          initialData={editingSubject || undefined}
          onSubmit={(data) => {
            if (editingSubject) {
              updateSubject(editingSubject.id, data);
            } else {
              addSubject(data);
            }
            setIsCreating(false);
            setEditingSubject(null);
          }}
          onDelete={editingSubject ? () => {
            deleteSubject(editingSubject.id);
            setEditingSubject(null);
          } : undefined}
          onCancel={() => {
            setIsCreating(false);
            setEditingSubject(null);
          }}
        />
      ) : (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
          {subjects.length === 0 ? (
            <div className="text-center p-8 border border-dashed border-slate-300 rounded-xl">
              <p className="text-slate-500 mb-4">No has añadido ninguna materia aún.</p>
              <button 
                onClick={() => setIsCreating(true)}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nueva Materia
              </button>
            </div>
          ) : (
            <>
              <button 
                onClick={() => setIsCreating(true)}
                className="w-full py-3 border-2 border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50 rounded-xl flex items-center justify-center gap-2 text-slate-600 font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Añadir Materia
              </button>
              <div className="grid grid-cols-1 gap-3">
                {subjects.map(subject => (
                  <div key={subject.id} className={cn("p-4 rounded-xl border flex items-center justify-between", colorMap[subject.color])}>
                    <div>
                      <h4 className="font-bold">{subject.name}</h4>
                      <p className="text-xs opacity-80">{subject.teacher} {subject.teacher && subject.room && '•'} {subject.room}</p>
                    </div>
                    <button 
                      onClick={() => setEditingSubject(subject)}
                      className="p-2 rounded-lg hover:bg-black/5 transition-colors"
                    >
                      <Edit2 className="w-4 h-4 opacity-80" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  );
}
