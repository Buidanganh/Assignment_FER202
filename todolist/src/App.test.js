import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';

const subject = { id: 's1', name: 'FER202', description: 'ReactJS', semester: 'Fall 2026', status: 'active', color: '#635BFF' };
const task = { id: 't1', subjectId: 's1', title: 'Hoàn thành Assignment 1', description: 'Xây dựng Todo List', type: 'assignment', priority: 'high', status: 'in_progress', plannedDate: '2026-11-05', dueDate: '2026-11-10', estimatedMinutes: 180, completedAt: null };
const subtask = { id: 'st1', taskId: 't1', title: 'Thiết kế giao diện', completed: false };
const session = { id: 'fs1', taskId: 't1', durationMinutes: 25, completedAt: '2026-11-05T09:25:00+07:00' };

const response = (data, status = 200) => Promise.resolve({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(data) });

function installApiMock({ tasks = [], subjects = [], subtasks = [], focusSessions = [], studyPlans = [], studyGroups = [], failFocusSession = false } = {}) {
  const stores = { tasks: [...tasks], subjects: [...subjects], subtasks: [...subtasks], focusSessions: [...focusSessions], studyPlans: [...studyPlans], studyGroups: [...studyGroups] };
  global.fetch = jest.fn(async (url, options = {}) => {
    const [, resource, id] = new URL(url).pathname.split('/'); const method = options.method || 'GET'; const store = stores[resource];
    if (!store) return response({}, 404);
    if (method === 'GET') return response(store);
    const body = options.body ? JSON.parse(options.body) : null;
    if (method === 'POST' && resource === 'focusSessions' && failFocusSession) return response({}, 500);
    if (method === 'POST') { store.push(body); return response(body, 201); }
    const index = store.findIndex((item) => item.id === id);
    if (method === 'PATCH' && index >= 0) { store[index] = { ...store[index], ...body }; return response(store[index]); }
    if (method === 'DELETE' && index >= 0) { store.splice(index, 1); return response(null, 204); }
    return response({}, 404);
  });
}

beforeEach(() => installApiMock());
afterEach(() => jest.restoreAllMocks());

test('loads dashboard data from all four json-server collections', async () => {
  installApiMock({ tasks: [task], subjects: [subject], subtasks: [subtask], focusSessions: [session] });
  render(<App />);

  expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  expect(screen.getByText('FER202 — ReactJS')).toBeInTheDocument();
  expect(screen.getByText('0.4h')).toBeInTheDocument();
  expect(fetch).toHaveBeenCalledWith('http://localhost:3001/subtasks', expect.any(Object));
  expect(fetch).toHaveBeenCalledWith('http://localhost:3001/focusSessions', expect.any(Object));
});

test('creates a task with the redesigned schema', async () => {
  installApiMock({ subjects: [subject] });
  render(<App />);
  await screen.findByRole('heading', { name: 'Dashboard' });
  fireEvent.click(screen.getByRole('button', { name: 'My Tasks' }));
  fireEvent.click(screen.getByRole('button', { name: /new task/i }));
  fireEvent.change(screen.getByLabelText('Tên task'), { target: { value: 'Ôn React Hooks' } });
  fireEvent.change(screen.getByLabelText('Môn học'), { target: { value: 's1' } });
  fireEvent.change(screen.getByLabelText('Ước lượng (phút)'), { target: { value: '60' } });
  fireEvent.click(screen.getByRole('button', { name: 'Lưu task' }));

  expect(await screen.findByText('Ôn React Hooks')).toBeInTheDocument();
  expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/tasks', expect.objectContaining({ method: 'POST', body: expect.stringContaining('"estimatedMinutes":60') }));
});

test('prevents a task deadline before its planned date', async () => {
  installApiMock({ subjects: [subject] });
  render(<App />);
  await screen.findByRole('heading', { name: 'Dashboard' });
  fireEvent.click(screen.getByRole('button', { name: 'My Tasks' }));
  fireEvent.click(screen.getByRole('button', { name: /new task/i }));
  fireEvent.change(screen.getByLabelText('Tên task'), { target: { value: 'Deadline không hợp lệ' } });
  fireEvent.change(screen.getByLabelText('Ngày dự kiến'), { target: { value: '2026-11-12' } });
  fireEvent.change(screen.getByLabelText('Deadline'), { target: { value: '2026-11-10' } });
  fireEvent.click(screen.getByRole('button', { name: 'Lưu task' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('Deadline phải sau hoặc bằng ngày dự kiến.');
  expect(fetch.mock.calls.some(([url, options]) => url === 'http://localhost:3001/tasks' && options?.method === 'POST')).toBe(false);
});

test('shows task details and creates a related subtask', async () => {
  installApiMock({ tasks: [task], subjects: [subject], subtasks: [subtask] });
  render(<App />);
  await screen.findByRole('heading', { name: 'Dashboard' });
  fireEvent.click(screen.getByRole('button', { name: 'My Tasks' }));
  fireEvent.click(screen.getByRole('button', { name: /^Hoàn thành Assignment 1/ }));

  expect(screen.getByText('Thiết kế giao diện')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Tên subtask'), { target: { value: 'Viết component' } });
  fireEvent.click(screen.getByRole('button', { name: 'Thêm' }));
  expect(await screen.findByText('Viết component')).toBeInTheDocument();
  expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/subtasks', expect.objectContaining({ method: 'POST' }));
});

test('edits every primary task field through a PATCH request', async () => {
  installApiMock({ tasks: [task], subjects: [subject] });
  render(<App />);
  await screen.findByRole('heading', { name: 'Dashboard' });
  fireEvent.click(screen.getByRole('button', { name: 'My Tasks' }));
  fireEvent.click(screen.getByRole('button', { name: /^Hoàn thành Assignment 1/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Sửa task' }));
  fireEvent.change(screen.getByLabelText('Sửa tên task'), { target: { value: 'Assignment 1 đã sửa' } });
  fireEvent.change(screen.getByLabelText('Sửa deadline'), { target: { value: '2026-11-12' } });
  fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));

  await waitFor(() => expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/tasks/t1', expect.objectContaining({ method: 'PATCH', body: expect.stringContaining('"dueDate":"2026-11-12"') })));
  await waitFor(() => expect(screen.getAllByText('Assignment 1 đã sửa')).toHaveLength(2));
});

test('reschedules a task by dropping it on a calendar date', async () => {
  installApiMock({ tasks: [task], subjects: [subject] });
  const { container } = render(<App />);
  await screen.findByRole('heading', { name: 'Dashboard' });
  fireEvent.click(screen.getByRole('button', { name: 'Calendar' }));
  const dataTransfer = { setData: jest.fn(), getData: jest.fn(() => 't1') };
  fireEvent.dragStart(screen.getByText('Hoàn thành Assignment 1'), { dataTransfer });
  fireEvent.drop(container.querySelector('[data-date="2026-11-12"]'), { dataTransfer });

  await waitFor(() => expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/tasks/t1', expect.objectContaining({ method: 'PATCH', body: expect.stringContaining('"dueDate":"2026-11-12"') })));
});

test('creates a persisted study plan from a smart planner suggestion', async () => {
  installApiMock({ tasks: [{ ...task, dueDate: '2099-11-10' }], subjects: [subject] });
  render(<App />);
  await screen.findByRole('heading', { name: 'Dashboard' });
  fireEvent.click(screen.getByRole('button', { name: 'Planner' }));
  expect(await screen.findByRole('heading', { name: 'Smart Study Planner' })).toBeInTheDocument();
  fireEvent.click(screen.getAllByRole('button', { name: 'Đưa vào lịch' })[0]);

  await waitFor(() => expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/studyPlans', expect.objectContaining({ method: 'POST', body: expect.stringContaining('"taskId":"t1"') })));
});

test('creates a study group through the collaboration workspace', async () => {
  installApiMock({ subjects: [subject] });
  render(<App />);
  await screen.findByRole('heading', { name: 'Dashboard' });
  fireEvent.click(screen.getByRole('button', { name: 'Nhóm học' }));
  fireEvent.click(screen.getByRole('button', { name: '+ Tạo nhóm' }));
  fireEvent.change(screen.getByLabelText('Tên nhóm học'), { target: { value: 'Nhóm đồ án React' } });
  fireEvent.change(screen.getByLabelText('Môn học của nhóm'), { target: { value: 's1' } });
  fireEvent.click(screen.getByRole('button', { name: 'Tạo nhóm' }));

  await waitFor(() => expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/studyGroups', expect.objectContaining({ method: 'POST', body: expect.stringContaining('"name":"Nhóm đồ án React"') })));
});

test('records a focus session through focusSessions API', async () => {
  installApiMock({ tasks: [task], subjects: [subject] });
  render(<App />);
  await screen.findByRole('heading', { name: 'Dashboard' });
  fireEvent.click(screen.getByRole('button', { name: 'Focus' }));
  fireEvent.click(screen.getByRole('button', { name: /hoàn thành 25 phút/i }));

  await waitFor(() => expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/focusSessions', expect.objectContaining({ method: 'POST', body: expect.stringContaining('"durationMinutes":25') })));
});

test('keeps the focus session active when saving to the API fails', async () => {
  installApiMock({ tasks: [task], subjects: [subject], failFocusSession: true });
  render(<App />);
  await screen.findByRole('heading', { name: 'Dashboard' });
  fireEvent.click(screen.getByRole('button', { name: 'Focus' }));
  fireEvent.click(screen.getByRole('button', { name: /hoàn thành 25 phút/i }));

  expect(await screen.findByText(/Chưa thể lưu phiên học/)).toBeInTheDocument();
  expect(screen.getByText('POMODORO TẬP TRUNG')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Thử lưu lại' })).toBeInTheDocument();
});

test('marks a task complete using a PATCH request', async () => {
  installApiMock({ tasks: [task], subjects: [subject] });
  render(<App />);
  await screen.findByRole('heading', { name: 'Dashboard' });
  fireEvent.click(screen.getByRole('button', { name: 'My Tasks' }));
  fireEvent.click(screen.getByRole('button', { name: /hoàn thành hoàn thành assignment 1/i }));

  await waitFor(() => expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/tasks/t1', expect.objectContaining({ method: 'PATCH', body: expect.stringContaining('"status":"completed"') })));
});
