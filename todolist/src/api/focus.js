import { createResource, deleteResource, request } from './client';

export const getFocusSessions = () => request('focusSessions');
export const createFocusSession = (session) => createResource('focusSessions', session);
export const deleteFocusSession = (id) => deleteResource('focusSessions', id);
