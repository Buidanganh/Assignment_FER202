# StudyFlow — Student Task Manager

StudyFlow là ứng dụng React giúp sinh viên quản lý bài tập, deadline và tiến độ học tập. Dữ liệu được lưu qua REST API của `json-server`.

## Chức năng

- Sidebar gồm Dashboard, My Tasks, Smart Study Planner, Nhóm học, Subjects, Calendar, Focus và Reports.
- Thêm, sửa toàn bộ thông tin, cập nhật trạng thái, hoàn thành/mở lại và xóa công việc.
- Mỗi task có mô tả, ngày dự kiến, deadline, thời lượng ước lượng, mức ưu tiên, môn học và loại công việc.
- Phân loại task: Bài tập, Đồ án, Ôn thi, Đọc tài liệu, Việc nhóm và Khác.
- Quản lý môn học: tên, học kỳ, màu nhận diện; xem tiến độ theo môn.
- Lọc và tìm task theo trạng thái, môn học và từ khóa.
- Xem chi tiết task, tạo và đánh dấu hoàn thành subtask.
- Calendar hiển thị danh sách deadline theo ngày; có thể kéo task sang ngày khác để đổi deadline.
- Focus/Pomodoro tự chuyển giữa 25 phút học và 5 phút nghỉ, đồng thời ghi phiên học vào collection `focusSessions`.
- Smart Study Planner tự ưu tiên task theo deadline và mức ưu tiên, chia thành các phiên 25 phút trong 14 ngày tới, cảnh báo khi không đủ quỹ thời gian và lưu phiên đã chọn.
- Workspace Nhóm học: tạo nhóm theo môn, thêm thành viên, phân công task cho một người phụ trách và theo dõi tiến độ nhóm.
- Dashboard và Reports tính tiến độ, task ưu tiên, thời gian tập trung từ dữ liệu REST API.
- Hiển thị loading, lỗi API và thông báo thành công.
- Validate title, thời lượng, thứ tự ngày dự kiến/deadline và người phụ trách thuộc đúng nhóm trước khi gửi API; nút lưu bị khóa trong lúc xử lý.

## Công nghệ

- React 19 và Create React App
- json-server (REST API giả lập)
- HTML/CSS thuần
- React Testing Library và Jest

## Cài đặt và chạy

Yêu cầu: Node.js 18+ và npm.

```bash
cd todolist
npm install
```

Chạy API ở một terminal:

```bash
npm run server
```

Chạy ứng dụng ở terminal khác:

```bash
npm start
```

Mở [http://localhost:3000](http://localhost:3000). API mặc định chạy ở `http://localhost:3001`; có thể thay đổi bằng biến môi trường `REACT_APP_API_URL`.

## API

| Nghiệp vụ | Endpoint |
| --- | --- |
| Tải task | `GET /tasks` |
| Thêm task | `POST /tasks` |
| Sửa task / đổi trạng thái / đổi deadline | `PATCH /tasks/:id` |
| Xóa task | `DELETE /tasks/:id` |
| Tải môn học | `GET /subjects` |
| Thêm môn học | `POST /subjects` |
| Tải / thêm / cập nhật subtask | `GET`, `POST`, `PATCH /subtasks` |
| Tải / ghi phiên focus | `GET`, `POST /focusSessions` |
| Tải / lưu / cập nhật / bỏ phiên kế hoạch | `GET`, `POST`, `PATCH`, `DELETE /studyPlans` |
| Tải / tạo / cập nhật nhóm học | `GET`, `POST`, `PATCH /studyGroups` |

## Mô hình dữ liệu

`db.json` có sáu collection và quan hệ:

- `subjects.id` → `tasks.subjectId`
- `tasks.id` → `subtasks.taskId`
- `tasks.id` → `focusSessions.taskId`
- `tasks.id` → `studyPlans.taskId`
- `studyGroups.id` → `tasks.groupId`; `tasks.assigneeName` lưu người phụ trách trong nhóm

Task dùng các trường chính: `title`, `description`, `type`, `priority`, `status`, `plannedDate`, `dueDate`, `estimatedMinutes`, `completedAt`, `createdAt`, `updatedAt`, `groupId`, `assigneeName`.

## Giới hạn của bản prototype

StudyFlow chủ đích chỉ dùng React và json-server. Vì vậy dữ liệu chỉ phù hợp cho demo hoặc học tập: chưa có đăng nhập/phân quyền thực, bảo mật server, đồng bộ thời gian thực giữa nhiều thiết bị, email hay browser notification. Những tính năng này cần một backend production và dịch vụ xác thực riêng.

## Kiểm thử và build

```bash
npm test -- --watchAll=false
npm run build
```

## Cấu trúc chính

```text
src/
├── api/client.js            # HTTP client dùng chung
├── api/tasks.js             # API task, subject và subtask
├── api/focus.js             # API phiên Pomodoro
├── api/planner.js           # API kế hoạch học
├── api/groups.js            # API nhóm học
├── components/              # Sidebar và các màn hình StudyFlow
├── constants/tasks.js       # Danh sách loại công việc
├── utils/validation.js      # Quy tắc validate frontend
└── App.js                   # State và luồng nghiệp vụ
db.json                      # Dữ liệu json-server
```
