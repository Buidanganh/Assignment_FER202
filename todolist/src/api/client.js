export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export async function request(resource, path = '', options = {}) {
  const response = await fetch(`${API_BASE_URL}/${resource}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
  return response.status === 204 ? null : response.json();
}

export const createResource = (resource, data) => request(resource, '', { method: 'POST', body: JSON.stringify(data) });
export const patchResource = (resource, id, data) => request(resource, `/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteResource = (resource, id) => request(resource, `/${encodeURIComponent(id)}`, { method: 'DELETE' });
