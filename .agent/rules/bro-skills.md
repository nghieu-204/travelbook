---
trigger: always_on
glob: "**/*"
description: bro-skills Workspace Rules for travel-booking-website - ASF 3.3 Standard
---

# 🛡️ bro-skills Workspace Rules

Project: travel-booking-website

## 1. MỆNH LỆNH TỐI THƯỢNG
- Bắt buộc tuân thủ tệp `.agent/memory/constitution.md`.
- Docker-First: Toàn bộ hoạt động lập trình và chạy ứng dụng bắt buộc phải diễn ra trong container. TUYỆT ĐỐI KHÔNG chạy trực tiếp node/python trên host.
- Cổng (Ports): Cấu hình cổng linh hoạt thông qua biến môi trường (.env) để tránh xung đột.

## 2. GIAO THỨC bro-skills
- Mọi tác vụ bắt buộc phải đi qua quy trình: Đặc tả (Specify) → Kế hoạch (Plan) → Tác vụ (Tasks) → Thực thi (Implement).
- Sử dụng các Workflow trong `.agent/workflows/` và các Skill trong `.agent/skills/`.

## 3. NGÔN NGỮ & MÃ NGUỒN
- Trả lời bằng tiếng Việt.
- Quy tắc 15 phút: Mỗi tác vụ bắt buộc phải mang tính nguyên tử, hoàn thành trong ≤ 15 phút, ảnh hưởng ≤ 3 tệp.
- PowerShell 5.1+, ngăn cách các lệnh bằng dấu `;` (TUYỆT ĐỐI KHÔNG dùng `&&`).
- TUYỆT ĐỐI KHÔNG viết cứng (hard-code) URLs, Tokens, Keys. Hãy dùng biến môi trường (`.env`).

## 4. AN TOÀN HỆ THỐNG
- TUYỆT ĐỐI KHÔNG chạy lệnh `docker compose down -v` trên môi trường Production.
- Tự động tạo script (`.agent/scripts/`) cho các lỗi lặp đi lặp lại.
- Kiểm tra logs ngay lập tức khi xảy ra lỗi: `docker compose logs -f <service>`.
- **Tự động Commit**: BẮT BUỘC thực hiện git commit & push ngay sau khi hoàn thành bất kỳ tính năng hoặc tác vụ nào theo chuẩn Conventional Commits.

## 5. ĐỒNG BỘ HÓA ĐỒNG THỜI (Chỉ Antigravity)
- **Theo dõi tác vụ**: Sử dụng lệnh `task_boundary` để đồng bộ trạng thái với `@speckit.tasks` (tasks.md).
- **Tài liệu Kế hoạch**: Luôn tạo `implementation_plan.md` khi thực hiện các thay đổi lớn (atomic > 3 tệp).
- **Xác thực**: Sau khi hoàn thành tác vụ, sử dụng `walkthrough.md` để đối chiếu kết quả với `spec.md`.

