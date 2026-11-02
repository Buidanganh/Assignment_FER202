import { createResource, deleteResource, patchResource, request } from './client';

export const getStudyPlans = () => request('studyPlans');
export const createStudyPlan = (plan) => createResource('studyPlans', plan);
export const patchStudyPlan = (id, updates) => patchResource('studyPlans', id, updates);
export const deleteStudyPlan = (id) => deleteResource('studyPlans', id);
