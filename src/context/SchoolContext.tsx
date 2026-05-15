import React, { createContext, useContext, useState, useEffect } from 'react';
import { Subject, ClassSession, Task } from '../types';
import { defaultSubjects, defaultSchedule, defaultTasks } from '../data';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  getDocFromServer
} from 'firebase/firestore';

interface SchoolContextType {
  user: User | null;
  loading: boolean;
  subjects: Subject[];
  schedule: ClassSession[];
  tasks: Task[];
  
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
  
  addSubject: (subject: Omit<Subject, 'id'>, customId?: string) => Promise<void>;
  updateSubject: (id: string, subject: Omit<Subject, 'id'>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  
  addSession: (session: Omit<ClassSession, 'id'>) => Promise<void>;
  updateSession: (id: string, session: Omit<ClassSession, 'id'>) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  importData: (data: { subjects: Subject[], schedule: ClassSession[], tasks: Task[] }) => Promise<void>;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export function SchoolProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Local state as fallback or for guest
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [schedule, setSchedule] = useState<ClassSession[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Test connection
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();
  }, []);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Data Sync Listener
  useEffect(() => {
    if (!user) {
      // Guest mode or not logged in yet
      const savedSubjects = localStorage.getItem('school_subjects');
      setSubjects(savedSubjects ? JSON.parse(savedSubjects) : defaultSubjects);
      
      const savedSchedule = localStorage.getItem('school_schedule');
      setSchedule(savedSchedule ? JSON.parse(savedSchedule) : defaultSchedule);
      
      const savedTasks = localStorage.getItem('school_tasks');
      setTasks(savedTasks ? JSON.parse(savedTasks) : defaultTasks);
      return;
    }

    // Auth is ready and user is authenticated
    const subjectsPath = `users/${user.uid}/subjects`;
    const unsubSubjects = onSnapshot(collection(db, subjectsPath), (snapshot) => {
      setSubjects(snapshot.docs.map(d => ({ ...d.data(), id: d.id }) as Subject));
    }, (err) => handleFirestoreError(err, OperationType.LIST, subjectsPath));

    const sessionsPath = `users/${user.uid}/sessions`;
    const unsubSessions = onSnapshot(collection(db, sessionsPath), (snapshot) => {
      setSchedule(snapshot.docs.map(d => ({ ...d.data(), id: d.id }) as ClassSession));
    }, (err) => handleFirestoreError(err, OperationType.LIST, sessionsPath));

    const tasksPath = `users/${user.uid}/tasks`;
    const unsubTasks = onSnapshot(collection(db, tasksPath), (snapshot) => {
      setTasks(snapshot.docs.map(d => ({ ...d.data(), id: d.id }) as Task));
    }, (err) => handleFirestoreError(err, OperationType.LIST, tasksPath));

    return () => {
      unsubSubjects();
      unsubSessions();
      unsubTasks();
    };
  }, [user]);

  // Actions
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logOut = async () => {
    await signOut(auth);
  };

  const addSubject = async (subject: Omit<Subject, 'id'>, customId?: string) => {
    const id = customId || crypto.randomUUID();
    if (user) {
      const path = `users/${user.uid}/subjects/${id}`;
      try {
        const { id: _removedId, ownerId: _removedOwner, ...cleanSubject } = subject as any;
        const finalData = { ...cleanSubject, ownerId: user.uid };
        Object.keys(finalData).forEach(k => finalData[k] === undefined && delete finalData[k]);
        await setDoc(doc(db, path), finalData);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }
    } else {
      const newSubject = { ...subject, id };
      setSubjects(prev => {
        const updated = [...prev, newSubject];
        localStorage.setItem('school_subjects', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const updateSubject = async (id: string, subject: Omit<Subject, 'id'>) => {
    if (user) {
      const path = `users/${user.uid}/subjects/${id}`;
      try {
        const { id: _removedId, ownerId: _removedOwner, ...cleanSubject } = subject as any;
        const finalData = { ...cleanSubject, ownerId: user.uid };
        Object.keys(finalData).forEach(k => finalData[k] === undefined && delete finalData[k]);
        await updateDoc(doc(db, path), finalData);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    } else {
      setSubjects(prev => {
        const updated = prev.map(s => s.id === id ? { ...subject, id } : s);
        localStorage.setItem('school_subjects', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const deleteSubject = async (id: string) => {
    if (user) {
      const path = `users/${user.uid}/subjects/${id}`;
      try {
        // We delete subject, but also need to cleanup its sessions and tasks.
        // For simplicity in rules and this client logic, we just delete subject here.
        // A more robust app would use a Batch or Cloud Function for cleanup.
        await deleteDoc(doc(db, path));
        
        // Manual cleanup on client for responsiveness
        for (const s of schedule.filter(s => s.subjectId === id)) deleteSession(s.id);
        for (const t of tasks.filter(t => t.subjectId === id)) deleteTask(t.id);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    } else {
      setSubjects(prev => {
        const updated = prev.filter(s => s.id !== id);
        localStorage.setItem('school_subjects', JSON.stringify(updated));
        return updated;
      });
      setSchedule(prev => {
        const updated = prev.filter(s => s.subjectId !== id);
        localStorage.setItem('school_schedule', JSON.stringify(updated));
        return updated;
      });
      setTasks(prev => {
        const updated = prev.filter(t => t.subjectId !== id);
        localStorage.setItem('school_tasks', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const addSession = async (session: Omit<ClassSession, 'id'>) => {
    if (user) {
      const id = crypto.randomUUID();
      const path = `users/${user.uid}/sessions/${id}`;
      try {
        const { id: _removedId, ownerId: _removedOwner, ...cleanSession } = session as any;
        const finalData = { ...cleanSession, ownerId: user.uid };
        Object.keys(finalData).forEach(k => finalData[k] === undefined && delete finalData[k]);
        await setDoc(doc(db, path), finalData);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }
    } else {
      const newSession = { ...session, id: crypto.randomUUID() };
      setSchedule(prev => {
        const updated = [...prev, newSession];
        localStorage.setItem('school_schedule', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const updateSession = async (id: string, session: Omit<ClassSession, 'id'>) => {
    if (user) {
      const path = `users/${user.uid}/sessions/${id}`;
      try {
        const { id: _removedId, ownerId: _removedOwner, ...cleanSession } = session as any;
        const finalData = { ...cleanSession, ownerId: user.uid };
        Object.keys(finalData).forEach(k => finalData[k] === undefined && delete finalData[k]);
        await updateDoc(doc(db, path), finalData);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    } else {
      setSchedule(prev => {
        const updated = prev.map(s => s.id === id ? { ...session, id } : s);
        localStorage.setItem('school_schedule', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const deleteSession = async (id: string) => {
    if (user) {
      const path = `users/${user.uid}/sessions/${id}`;
      try {
        await deleteDoc(doc(db, path));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    } else {
      setSchedule(prev => {
        const updated = prev.filter(s => s.id !== id);
        localStorage.setItem('school_schedule', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const addTask = async (task: Omit<Task, 'id'>) => {
    if (user) {
      const id = crypto.randomUUID();
      const path = `users/${user.uid}/tasks/${id}`;
      try {
        const { id: _removedId, ownerId: _removedOwner, ...cleanTask } = task as any;
        const finalData = { ...cleanTask, ownerId: user.uid };
        Object.keys(finalData).forEach(k => finalData[k] === undefined && delete finalData[k]);
        await setDoc(doc(db, path), finalData);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }
    } else {
      const newTask = { ...task, id: crypto.randomUUID() };
      setTasks(prev => {
        const updated = [...prev, newTask];
        localStorage.setItem('school_tasks', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (user) {
      const path = `users/${user.uid}/tasks/${id}`;
      try {
        const { id: _removedId, ownerId: _removedOwner, ...cleanUpdates } = updates as any;
        Object.keys(cleanUpdates).forEach(k => cleanUpdates[k] === undefined && delete cleanUpdates[k]);
        await updateDoc(doc(db, path), cleanUpdates);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    } else {
      setTasks(prev => {
        const updated = prev.map(t => t.id === id ? { ...t, ...updates } : t);
        localStorage.setItem('school_tasks', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const deleteTask = async (id: string) => {
    if (user) {
      const path = `users/${user.uid}/tasks/${id}`;
      try {
        await deleteDoc(doc(db, path));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    } else {
      setTasks(prev => {
        const updated = prev.filter(t => t.id !== id);
        localStorage.setItem('school_tasks', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const importData = async (data: { subjects: Subject[], schedule: ClassSession[], tasks: Task[] }) => {
    // Clear old data first if user wishes, or just merge. 
    // Usually import means "Restore", so let's overwrite or add.
    // If user is logged in, we upload to Firestore.
    if (user) {
      // For Firestore, we add everything one by one (or batch). 
      // To keep it simple and consistent with existing patterns:
      for (const s of data.subjects) {
        const { id, ...rest } = s;
        await addSubject(rest, id);
      }
      for (const s of data.schedule) {
        // We use setDoc here to preserve IDs if possible, or just use addSession
        const path = `users/${user.uid}/sessions/${s.id}`;
        const { id: _removedId, ownerId: _removedOwner, ...cleanSession } = s as any;
        await setDoc(doc(db, path), { ...cleanSession, ownerId: user.uid });
      }
      for (const t of data.tasks) {
        const path = `users/${user.uid}/tasks/${t.id}`;
        const { id: _removedId, ownerId: _removedOwner, ...cleanTask } = t as any;
        await setDoc(doc(db, path), { ...cleanTask, ownerId: user.uid });
      }
    } else {
      setSubjects(data.subjects);
      setSchedule(data.schedule);
      setTasks(data.tasks);
      localStorage.setItem('school_subjects', JSON.stringify(data.subjects));
      localStorage.setItem('school_schedule', JSON.stringify(data.schedule));
      localStorage.setItem('school_tasks', JSON.stringify(data.tasks));
    }
  };


  return (
    <SchoolContext.Provider value={{
      user, loading,
      subjects, schedule, tasks,
      signInWithGoogle, logOut,
      addSubject, updateSubject, deleteSubject,
      addSession, updateSession, deleteSession,
      addTask, updateTask, deleteTask,
      importData
    }}>
      {children}
    </SchoolContext.Provider>
  );
}

export function useSchool() {
  const context = useContext(SchoolContext);
  if (context === undefined) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
}
