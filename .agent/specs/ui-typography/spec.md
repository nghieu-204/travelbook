# UI Typography Standardization (LearnUI + Vietnamese)

## 1. Goal
Chuẩn hóa toàn bộ hệ thống kích thước chữ (font-size) và khoảng cách dòng (line-height) cho dự án theo chuẩn thiết kế quốc tế (LearnUI Design Guidelines) và tối ưu riêng cho hiển thị tiếng Việt.

## 2. Rationale
- **Chống Auto-Zoom trên iOS:** Các thẻ `<input>` có font-size dưới `16px` sẽ khiến trình duyệt Safari tự động zoom-in gây khó chịu cho người dùng.
- **Tính khả đọc (Readability):** Tiếng Việt có các dấu (diacritics) phức tạp (như ơ, ư, ê, ế, ễ). Việc có kích thước chữ nhỏ và khoảng cách dòng thấp (line-height) gây khó khăn khi đọc, đặc biệt trên thiết bị di động.
- **Nhất quán giao diện:** Giao diện sử dụng quá nhiều kích cỡ font tĩnh (11px, 13px, 15px, 18px, 19px, 20px, 26px, 34px, 48px) gây rối rắm. Cần thu gọn lại thành hệ thống phân cấp rõ ràng (variables).

## 3. Specifications
### Hệ thống cấp bậc (Variables)
- **H1:** Mobile 32px (`2rem`) / Desktop 40px (`2.5rem`)
- **H2:** Mobile 28px (`1.75rem`) / Desktop 32px (`2rem`)
- **H3:** Mobile 24px (`1.5rem`) / Desktop 28px (`1.75rem`)
- **H4:** Mobile 20px (`1.25rem`) / Desktop 24px (`1.5rem`)
- **H5:** Mobile 18px (`1.125rem`) / Desktop 20px (`1.25rem`)
- **Body / Default / Input:** 16px (`1rem`) trên cả Mobile và Desktop.
- **Secondary:** 14px (`0.875rem`)
- **Tertiary:** 12px (`0.75rem`)

### Khoảng cách dòng (Line-height)
- **Body:** `1.65` (thay vì 1.5/1.6 chuẩn tiếng Anh).
- **Heading:** `1.35` (thay vì 1.1/1.2).

## 4. Scope
- Chỉ sửa file CSS toàn cục (`frontend/src/index.css`).
- Áp dụng thay thế các font-size hardcode thành CSS Variables.
