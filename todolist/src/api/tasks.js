import { createResource, deleteResource, patchResource, request } from './client';

export const getTasks = () => request('tasks');
export const createTask = (task) => createResource('tasks', task);
export const patchTask = (id, updates) => patchResource('tasks', id, updates);
export const deleteTask = (id) => deleteResource('tasks', id);

export const getSubjects = () => request('subjects');
export const createSubject = (subject) => createResource('subjects', subject);
export const patchSubject = (id, updates) => patchResource('subjects', id, updates);

export const getSubtasks = () => request('subtasks');
export const createSubtask = (subtask) => createResource('subtasks', subtask);
export const patchSubtask = (id, updates) => patchResource('subtasks', id, updates);
export const deleteSubtask = (id) => deleteResource('subtasks', id);
