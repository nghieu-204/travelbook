# 📜 Constitution (Source of Law)

## 1. 🏗️ Tech Stack
- **Frontend**: React 19, Vite, React Router DOM, ChartJS
- **Backend**: Node.js, Express, MySQL2, JWT Auth
- **Database**: MySQL
- **Infrastructure**: Docker (Docker-First policy)

## 2. 🔌 Docker Port Configuration
- **Public (FE)**: 8900
- **Admin**: 8901
- **API**: 8902

## 3. 👨‍💻 Coding Principles
- **No Hardcode**: Sử dụng biến môi trường (Environment Variables) từ `.env` cho tất cả URL, port, keys (vd: `VITE_API_URL`, `API_PORT`).
- **Docker-First**: Toàn bộ hoạt động lập trình và chạy ứng dụng bắt buộc phải diễn ra trong container. Tuyệt đối không chạy trực tiếp host.
- **bro-skills**: Mọi tác vụ phải tuân thủ luồng: Đặc tả -> Kế hoạch -> Tác vụ -> Thực thi.
- **Quy tắc 15 phút**: Các tác vụ phải mang tính nguyên tử, ảnh hưởng ≤ 3 tệp.

## 4. 🔒 Security Requirements
- Môi trường production không chạy `docker compose down -v`.
- Tất cả API cần xác thực JWT cho các tác vụ nhạy cảm.
- Bảo mật thông tin: Không commit file `.env` chứa secret thật. Lỗi xuất hiện phải kiểm tra log docker ngay lập tức.
