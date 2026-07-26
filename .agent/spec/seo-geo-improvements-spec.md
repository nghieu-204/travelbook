# 📝 Feature Specification: Tối ưu hoá SEO & GEO

## 1. Overview
Dự án (travel-booking-website) là một ứng dụng Full-stack (React + Node.js) SPA, dẫn đến các vấn đề nghiêm trọng về SEO (Search Engine Optimization) và GEO (Generative Engine Optimization). Tính năng này tập trung vào việc khắc phục các vấn đề phát hiện trong `seo-audit-report.md` và `geo-audit-report.md`.

## 2. User Scenarios
- **Actor:** Trình thu thập dữ liệu (Google Bot, Bing Bot)
  - **Action:** Truy cập các trang Public (Home, Tour Details, Blog).
  - **Value:** Lấy được thông tin `<title>`, `<meta description>` động cho từng trang, đọc được sơ đồ trang web (`sitemap.xml`) và `robots.txt` cho phép crawl, qua đó hiển thị trên kết quả tìm kiếm tốt hơn.
- **Actor:** AI Bot (ChatGPT Search, Gemini, Perplexity)
  - **Action:** Đọc trang chủ để tóm tắt website, lấy nội dung chi tiết Tour.
  - **Value:** Đọc được `llms.txt` ở root domain, đọc được JSON-LD schema (Article, Product) để trích dẫn nguồn uy tín và hiểu cấu trúc nội dung.

## 3. Requirements
- Thêm `react-helmet-async` để quản lý meta tags động (Title, Meta Description, Canonical URL) cho mỗi component/page.
- Thêm dữ liệu Schema.org (JSON-LD) cho trang chi tiết Tour (Product schema) và Blog (Article schema).
- Tạo file `llms.txt` tại thư mục `public` của frontend với định dạng chuẩn cho AI.
- Tạo file `robots.txt` tại thư mục `public` mở quyền truy cập cho mọi bots.
- Tạo file `sitemap.xml` tĩnh liệt kê các route chính.

## 4. Success Criteria
- ✅ Check HTML DOM: Trang `Home`, `Tours`, `TourDetails` phải có thẻ `<title>` và `<meta name="description">` thay đổi.
- ✅ Check JSON-LD: Trang `TourDetails` sinh ra đoạn `<script type="application/ld+json">` chứa dữ liệu `Product` hợp lệ.
- ✅ Truy cập `http://localhost:8900/llms.txt` trả về nội dung file.
- ✅ Truy cập `http://localhost:8900/robots.txt` trả về nội dung file.
