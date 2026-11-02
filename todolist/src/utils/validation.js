export function validateTask(task, groups = []) {
  if (!task.title?.trim()) return 'Tên task không được để trống.';
  if (Number(task.estimatedMinutes) < 0) return 'Thời lượng ước lượng không thể là số âm.';
  if (task.plannedDate && task.dueDate && task.dueDate < task.plannedDate) return 'Deadline phải sau hoặc bằng ngày dự kiến.';
  if (!task.groupId && task.assigneeName) return 'Chỉ có thể phân công khi task thuộc một nhóm học.';
  if (task.groupId && task.assigneeName) {
    const group = groups.find((item) => item.id === task.groupId);
    const belongsToGroup = group?.members?.some((member) => (member.name || member) === task.assigneeName);
    if (!belongsToGroup) return 'Người phụ trách phải là thành viên của nhóm đã chọn.';
  }
  return '';
}
