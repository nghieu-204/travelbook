# 🔍 SEO Audit Report

## Tổng quan
- **Trạng thái**: Cần khắc phục nhiều lỗi (SPA Vite mặc định chưa tối ưu SEO).
- **Điểm**: 20/100

## Lỗi và Khuyến nghị

### 🔴 Critical Issues
- **Thiếu thẻ Meta (Title & Description)**: Các trang hiện tại không có `<title>` và `<meta description>` riêng biệt (Title mặc định là "frontend" ở index.html). 
  - **Khuyến nghị**: Sử dụng `react-helmet-async` để cập nhật meta tag động cho từng trang (Home, TourDetails, Blog).
- **Thiếu Canonical URL**: Trình thu thập dữ liệu có thể đánh dấu trùng lặp nội dung.
  - **Khuyến nghị**: Thêm thẻ `<link rel="canonical" href="..." />` cho các trang chính thông qua Helmet.
- **Thiếu Schema.org (JSON-LD)**: Không có dữ liệu cấu trúc cho bài viết, sản phẩm (Tours).
  - **Khuyến nghị**: Chèn JSON-LD vào `TourDetails.jsx` và `Blog.jsx`.
- **Client-Side Rendering (CSR)**: Dự án dùng Vite (SPA) khiến Bot khó thu thập nội dung ngay lập tức.
  - **Khuyến nghị**: Tích hợp pre-rendering (vd: Prerender.io, vite-plugin-ssr) nếu SEO là tối quan trọng, hoặc đảm bảo cấu trúc dễ index.

### 🟡 Warning
- **Heading Hierarchy (H1, H2)**: Có nhiều trang sử dụng `<h1>` nhưng có thể bị trùng lặp hoặc sai cấu trúc phân cấp (Mỗi trang chỉ nên có 1 thẻ H1).
  - **Khuyến nghị**: Kiểm duyệt lại các thẻ H1 trên trang `Tours.jsx`, `Home.jsx`, `Contact.jsx`, đảm bảo chuẩn SEO.
- **Sitemap & Robots.txt**: Chưa thấy `sitemap.xml` và `robots.txt` được cấu hình.
  - **Khuyến nghị**: Tạo tự động sitemap.xml và thêm robots.txt vào thư mục public của frontend.

### 🟢 Info
- **Tốc độ (Web Vitals)**: React + Vite khá nhanh, nhưng cần kiểm tra tối ưu hình ảnh (WebP) và Lazy Loading cho component và hình ảnh.
