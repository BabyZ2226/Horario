import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { SubjectForm } from './SubjectForm';
import { Subject } from '../types';
import { colorMap, cn } from '../lib/utils';
import { Plus, Edit2, BookOpen, User, MapPin, Palette } from 'lucide-react';
import { Modal } from './ui/Modal';

const colors: Array<Subject['color']> = [
  'blue', 'green', 'red', 'purple', 'orange', 'yellow', 'pink', 'cyan',
  'indigo', 'violet', 'rose', 'amber', 'emerald', 'teal', 'lime', 'fuchsia'
];

export function SubjectsView() {
  const { subjects, addSubject, updateSubject, deleteSubject, schedule, tasks } = useSchool();
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isColoring, setIsColoring] = useState(false);

  const getSubjectStats = (id: string) => {
    const classCount = schedule.filter(s => s.subjectId === id).length;
    const taskCount = tasks.filter(t => t.subjectId === id && !t.completed).length;
    return { classCount, taskCount };
  };

  const autoAssignColors = async () => {
    setIsColoring(true);
    let colorIndex = 0;
    
    const promises = subjects.map(async (subject) => {
      // Keep breaks as slate
      if (subject.id === 'recreo' || subject.name.toLowerCase() === 'recreo' ||
          subject.id === 'almuerzo' || subject.name.toLowerCase() === 'almuerzo') {
        return;
      }
      const newColor = colors[colorIndex % colors.length];
      colorIndex++;
      
      const { id, ...subjectData } = subject;
      try {
        await updateSubject(id, { ...subjectData, color: newColor });
      } catch (err: any) {
        console.error("Failed to update color for", subject.name, err);
        alert(`Error coloring ${subject.name}: ${err.message || err}`);
      }
    });

    await Promise.all(promises);
    setIsColoring(false);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Mis Asignaturas</h1>
          <p className="mt-2 text-slate-500 text-lg">Gestiona todas tus materias y sus detalles.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={autoAssignColors}
            disabled={isColoring}
            className="px-4 py-2 bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            <Palette className={cn("w-4 h-4", isColoring && "animate-spin")} />
            {isColoring ? "Coloreando..." : "Auto Colorear"}
          </button>
          <button 
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-900 transition-colors shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nueva Materia
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No hay materias</h3>
            <p className="text-slate-500 mb-6">Empieza por añadir tu primera asignatura.</p>
            <button 
              onClick={() => setIsCreating(true)}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-md"
            >
              Añadir mi primera materia
            </button>
          </div>
        ) : (
          subjects.map(subject => {
            const { classCount, taskCount } = getSubjectStats(subject.id);
            return (
              <div 
                key={subject.id} 
                onClick={() => setEditingSubject(subject)}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-all cursor-pointer"
              >
                <div className={cn("h-3", colorMap[subject.color].split(' ')[0])} />
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-slate-800 leading-tight">{subject.name}</h3>
                    <div className="p-2 text-slate-400 group-hover:text-slate-600 group-hover:bg-slate-50 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    {subject.teacher && (
                      <div className="flex items-center text-sm text-slate-500">
                        <User className="w-4 h-4 mr-2" />
                        {subject.teacher}
                      </div>
                    )}
                    {subject.room && (
                      <div className="flex items-center text-sm text-slate-500">
                        <MapPin className="w-4 h-4 mr-2" />
                        {subject.room}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-auto">
                    <div className="bg-slate-50 rounded-xl p-3 text-center">
                      <span className="block text-2xl font-bold text-slate-800">{classCount}</span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Clases</span>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 text-center">
                      <span className="block text-2xl font-bold text-slate-800">{taskCount}</span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pendientes</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Modal 
        isOpen={isCreating || !!editingSubject} 
        onClose={() => { setIsCreating(false); setEditingSubject(null); }}
        title={editingSubject ? "Editar Materia" : "Nueva Materia"}
      >
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
          onCancel={() => { setIsCreating(false); setEditingSubject(null); }}
        />
      </Modal>
    </div>
  );
}
