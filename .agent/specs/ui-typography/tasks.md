# UI Typography Standardization - Tasks

1. `[x]` Tạo tài liệu đặc tả (`spec.md`) và kế hoạch (`plan.md`).
2. `[ ]` Cập nhật `:root` và `@media (min-width: 768px)` trong `frontend/src/index.css` để định nghĩa biến CSS Typography.
3. `[ ]` Chỉnh sửa phần `body` trong `frontend/src/index.css` (đổi `line-height` thành `var(--lh-body)`).
4. `[ ]` Cập nhật toàn bộ các selector trong `frontend/src/index.css` để thay giá trị pixel hardcode bằng các biến `var(--fs-*)`.
5. `[ ]` Xóa class `.hero-title` khỏi `@media (max-width: 768px)` vì không còn cần thiết.
6. `[ ]` Xác nhận mọi thay đổi trên trình duyệt, tạo tài liệu nghiệm thu (`walkthrough.md`).
