import { Subject, ClassSession, Task } from './types';
import { addDays, format, subDays } from 'date-fns';

export const defaultSubjects: Subject[] = [
  { id: 'math', name: 'Matemáticas', color: 'blue', teacher: 'Prof. García', room: 'Aula 101' },
  { id: 'sci', name: 'Ciencias Naturales', color: 'green', teacher: 'Dra. Silva', room: 'Lab 2' },
  { id: 'hist', name: 'Historia Universal', color: 'orange', teacher: 'Lic. Fernández', room: 'Aula 105' },
  { id: 'lit', name: 'Literatura', color: 'purple', teacher: 'Prof. Ruiz', room: 'Aula 108' },
  { id: 'eng', name: 'Inglés Avanzado', color: 'red', teacher: 'Mr. Smith', room: 'Aula 201' },
  { id: 'pe', name: 'Educación Física', color: 'yellow', teacher: 'Ent. Gómez', room: 'Cancha 1' },
  { id: 'art', name: 'Arte y Diseño', color: 'pink', teacher: 'Prof. Dalí', room: 'Taller 3' },
  { id: 'recreo', name: 'Recreo', color: 'slate', teacher: '', room: 'Patio' },
  { id: 'almuerzo', name: 'Almuerzo', color: 'slate', teacher: '', room: 'Comedor' },
];

export const defaultSchedule: ClassSession[] = [
  // Lunes (1)
  { id: 's1', subjectId: 'math', dayOfWeek: 1, startTime: '07:30', endTime: '08:50' },
  { id: 's2', subjectId: 'sci', dayOfWeek: 1, startTime: '09:00', endTime: '10:20' },
  { id: 's3', subjectId: 'lit', dayOfWeek: 1, startTime: '11:10', endTime: '12:30' },
  // Martes (2)
  { id: 's4', subjectId: 'hist', dayOfWeek: 2, startTime: '07:30', endTime: '08:50' },
  { id: 's5', subjectId: 'eng', dayOfWeek: 2, startTime: '09:00', endTime: '10:20' },
  { id: 's6', subjectId: 'pe', dayOfWeek: 2, startTime: '11:10', endTime: '12:30' },
  // Miércoles (3)
  { id: 's7', subjectId: 'math', dayOfWeek: 3, startTime: '07:30', endTime: '08:50' },
  { id: 's8', subjectId: 'sci', dayOfWeek: 3, startTime: '09:00', endTime: '10:20' },
  { id: 's9', subjectId: 'art', dayOfWeek: 3, startTime: '11:10', endTime: '12:30' },
  // Jueves (4)
  { id: 's10', subjectId: 'hist', dayOfWeek: 4, startTime: '07:30', endTime: '08:50' },
  { id: 's11', subjectId: 'eng', dayOfWeek: 4, startTime: '09:00', endTime: '10:20' },
  { id: 's12', subjectId: 'lit', dayOfWeek: 4, startTime: '11:10', endTime: '12:30' },
  // Viernes (5)
  { id: 's13', subjectId: 'math', dayOfWeek: 5, startTime: '07:30', endTime: '08:50' },
  { id: 's14', subjectId: 'art', dayOfWeek: 5, startTime: '09:00', endTime: '10:20' },
  { id: 's15', subjectId: 'pe', dayOfWeek: 5, startTime: '11:40', endTime: '13:00' },
  
  // Recreo (L-J: 10:30-11:00, V: 11:00-11:30)
  { id: 'r1', subjectId: 'recreo', dayOfWeek: 1, startTime: '10:30', endTime: '11:00' },
  { id: 'r2', subjectId: 'recreo', dayOfWeek: 2, startTime: '10:30', endTime: '11:00' },
  { id: 'r3', subjectId: 'recreo', dayOfWeek: 3, startTime: '10:30', endTime: '11:00' },
  { id: 'r4', subjectId: 'recreo', dayOfWeek: 4, startTime: '10:30', endTime: '11:00' },
  { id: 'r5', subjectId: 'recreo', dayOfWeek: 5, startTime: '11:00', endTime: '11:30' },

  // Almuerzo (L-J: 12:40-13:15)
  { id: 'a1', subjectId: 'almuerzo', dayOfWeek: 1, startTime: '12:40', endTime: '13:15' },
  { id: 'a2', subjectId: 'almuerzo', dayOfWeek: 2, startTime: '12:40', endTime: '13:15' },
  { id: 'a3', subjectId: 'almuerzo', dayOfWeek: 3, startTime: '12:40', endTime: '13:15' },
  { id: 'a4', subjectId: 'almuerzo', dayOfWeek: 4, startTime: '12:40', endTime: '13:15' },
];

const today = new Date();

export const defaultTasks: Task[] = [
  {
    id: 't1',
    title: 'Ejercicios de Álgebra',
    description: 'Completar la página 45 y 46 del libro.',
    subjectId: 'math',
    dueDate: format(addDays(today, 1), 'yyyy-MM-dd'),
    completed: false,
  },
  {
    id: 't2',
    title: 'Ensayo sobre la Revolución Industrial',
    description: 'Mínimo 3 cuartillas, incluir fuentes bibliográficas.',
    subjectId: 'hist',
    dueDate: format(addDays(today, 3), 'yyyy-MM-dd'),
    completed: false,
  },
  {
    id: 't3',
    title: 'Reporte del Laboratorio',
    description: 'Práctica sobre fotosíntesis.',
    subjectId: 'sci',
    dueDate: format(subDays(today, 1), 'yyyy-MM-dd'),
    completed: true,
  },
  {
    id: 't4',
    title: 'Lista de vocabulario',
    description: 'Aprender los verbos irregulares de la unidad 4.',
    subjectId: 'eng',
    dueDate: format(today, 'yyyy-MM-dd'),
    completed: false,
  },
];
