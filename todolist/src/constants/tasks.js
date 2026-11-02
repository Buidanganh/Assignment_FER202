export const TASK_TYPES = [
  { value: 'assignment', label: 'Bài tập' },
  { value: 'project', label: 'Đồ án' },
  { value: 'exam_prep', label: 'Ôn thi' },
  { value: 'reading', label: 'Đọc tài liệu' },
  { value: 'group_work', label: 'Việc nhóm' },
  { value: 'other', label: 'Khác' },
];

export const taskTypeLabel = (type) => TASK_TYPES.find((item) => item.value === type)?.label || 'Khác';
