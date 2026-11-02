import { useCallback, useEffect, useState } from 'react';
import './App.css';
import { createSubject, createSubtask, createTask, deleteSubtask, deleteTask, getSubjects, getSubtasks, getTasks, patchSubtask, patchTask } from './api/tasks';
import { createFocusSession, deleteFocusSession, getFocusSessions } from './api/focus';
import { createStudyPlan, deleteStudyPlan, getStudyPlans, patchStudyPlan } from './api/planner';
import { createStudyGroup, getStudyGroups, patchStudyGroup } from './api/groups';
import StudyWorkspace from './components/StudyWorkspace';

const normalizeTask = (task) => ({ ...task, subjectId: task.subjectId || '', description: task.description || '', type: task.type || 'other', priority: task.priority || 'medium', status: task.status || (task.completed ? 'completed' : 'planned'), plannedDate: task.plannedDate || '', dueDate: task.dueDate || '', estimatedMinutes: Number(task.estimatedMinutes) || 0, completedAt: task.completedAt || null });

function App() {
  const [view, setView] = useState('dashboard');
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [subtasks, setSubtasks] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [studyPlans, setStudyPlans] = useState([]);
  const [studyGroups, setStudyGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadData = useCallback(async () => {
    setIsLoading(true); setError('');
    try {
      const [taskData, subjectData, subtaskData, sessionData, planData, groupData] = await Promise.all([getTasks(), getSubjects(), getSubtasks(), getFocusSessions(), getStudyPlans(), getStudyGroups()]);
      setTasks(Array.isArray(taskData) ? taskData.map(normalizeTask) : []);
      setSubjects(Array.isArray(subjectData) ? subjectData : []);
      setSubtasks(Array.isArray(subtaskData) ? subtaskData : []);
      setSessions(Array.isArray(sessionData) ? sessionData : []);
      setStudyPlans(Array.isArray(planData) ? planData : []);
      setStudyGroups(Array.isArray(groupData) ? groupData : []);
    } catch { setError('Không thể tải dữ liệu từ json-server. Hãy chạy npm run server rồi thử lại.'); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { if (!notice) return undefined; const timer = window.setTimeout(() => setNotice(''), 3000); return () => window.clearTimeout(timer); }, [notice]);

  const runAction = async (work, onSuccess, successMessage) => {
    setError('');
    try { const saved = await work(); onSuccess(saved); if (successMessage) setNotice(successMessage); return true; }
    catch { setError('Thao tác chưa được lưu. Vui lòng kiểm tra json-server và thử lại.'); return false; }
  };
  const createTaskAction = (task) => runAction(() => createTask(task), (saved) => setTasks([normalizeTask(saved), ...tasks.filter((item) => item.id !== saved.id)]), 'Đã tạo task.');
  const patchTaskAction = (id, changes) => runAction(() => patchTask(id, { ...changes, updatedAt: new Date().toISOString() }), (saved) => setTasks((items) => items.map((item) => item.id === id ? normalizeTask(saved) : item)), 'Đã cập nhật task.');
  const deleteTaskAction = async (id) => {
    setError('');
    try {
      const relatedSubtasks = subtasks.filter((subtask) => subtask.taskId === id);
      const relatedSessions = sessions.filter((session) => session.taskId === id);
      const relatedPlans = studyPlans.filter((plan) => plan.taskId === id);
      await deleteTask(id);
      await Promise.all([...relatedSubtasks.map((subtask) => deleteSubtask(subtask.id)), ...relatedSessions.map((session) => deleteFocusSession(session.id)), ...relatedPlans.map((plan) => deleteStudyPlan(plan.id))]);
      setTasks((items) => items.filter((task) => task.id !== id)); setSubtasks((items) => items.filter((subtask) => subtask.taskId !== id)); setSessions((items) => items.filter((session) => session.taskId !== id)); setStudyPlans((items) => items.filter((plan) => plan.taskId !== id)); setNotice('Đã xóa task và dữ liệu liên quan.'); return true;
    } catch { setError('Không thể xóa task. Dữ liệu hiện tại vẫn được giữ lại.'); return false; }
  };
  const createSubjectAction = (subject) => runAction(() => createSubject(subject), (saved) => setSubjects([...subjects.filter((item) => item.id !== saved.id), saved]), 'Đã tạo môn học.');
  const createSubtaskAction = (subtask) => runAction(() => createSubtask(subtask), (saved) => setSubtasks([...subtasks.filter((item) => item.id !== saved.id), saved]), 'Đã thêm subtask.');
  const patchSubtaskAction = (id, changes) => runAction(() => patchSubtask(id, changes), (saved) => setSubtasks((items) => items.map((subtask) => subtask.id === id ? saved : subtask)), 'Đã cập nhật subtask.');
  const createFocusAction = (session) => runAction(() => createFocusSession(session), (saved) => setSessions([...sessions.filter((item) => item.id !== saved.id), saved]), 'Đã ghi nhận phiên focus 25 phút.');
  const createStudyGroupAction = (group) => runAction(() => createStudyGroup(group), (saved) => setStudyGroups((items) => [...items.filter((item) => item.id !== saved.id), saved]), 'Đã tạo nhóm học.');
  const patchStudyGroupAction = (id, changes) => runAction(() => patchStudyGroup(id, changes), (saved) => setStudyGroups((items) => items.map((group) => group.id === id ? saved : group)), 'Đã cập nhật nhóm học.');
  const createStudyPlanAction = (plan) => runAction(() => createStudyPlan(plan), (saved) => setStudyPlans((items) => [...items.filter((item) => item.id !== saved.id), saved]), 'Đã đưa phiên học vào kế hoạch.');
  const patchStudyPlanAction = (id, changes) => runAction(() => patchStudyPlan(id, changes), (saved) => setStudyPlans((items) => items.map((plan) => plan.id === id ? saved : plan)), 'Đã cập nhật phiên kế hoạch.');
  const deleteStudyPlanAction = (id) => runAction(() => deleteStudyPlan(id), () => setStudyPlans((items) => items.filter((plan) => plan.id !== id)), 'Đã bỏ phiên khỏi kế hoạch.');

  if (isLoading) return <div className="app-loading">StudyFlow đang tải dữ liệu…</div>;
  return <div className="app-shell"><StudyWorkspace view={view} onViewChange={setView} tasks={tasks} subjects={subjects} subtasks={subtasks} sessions={sessions} studyPlans={studyPlans} studyGroups={studyGroups} onCreateTask={createTaskAction} onPatchTask={patchTaskAction} onDeleteTask={deleteTaskAction} onCreateSubject={createSubjectAction} onCreateSubtask={createSubtaskAction} onPatchSubtask={patchSubtaskAction} onCreateFocus={createFocusAction} onCreateStudyPlan={createStudyPlanAction} onPatchStudyPlan={patchStudyPlanAction} onDeleteStudyPlan={deleteStudyPlanAction} onCreateStudyGroup={createStudyGroupAction} onPatchStudyGroup={patchStudyGroupAction} />{error && <div className="app-toast error" role="alert">{error}<button type="button" onClick={loadData}>Thử lại</button></div>}{notice && <div className="app-toast success" role="status">{notice}</div>}</div>;
}

export default App;
