import { createResource, patchResource, request } from './client';

export const getStudyGroups = () => request('studyGroups');
export const createStudyGroup = (group) => createResource('studyGroups', group);
export const patchStudyGroup = (id, updates) => patchResource('studyGroups', id, updates);
