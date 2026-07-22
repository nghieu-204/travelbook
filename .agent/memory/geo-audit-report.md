# 🤖 GEO Audit Report (AI Search Optimization)

## Tổng quan
- **Mục tiêu**: Tối ưu hóa để ChatGPT, Gemini, Perplexity thu thập dữ liệu và trích dẫn trang web.
- **Trạng thái**: Thiếu nhiều thành phần cốt lõi của GEO.

## Lỗi và Khuyến nghị

### 🔴 Critical Issues
- **Thiếu tệp `llms.txt`**: Trình thu thập thông tin AI không biết đọc cấu trúc trang và nội dung chính.
  - **Khuyến nghị**: Tạo file `llms.txt` ở thư mục gốc (public) chứa tổng quan về trang web, sitemap, và hướng dẫn cho AI bot.
- **Không có JSON-LD (Dữ liệu cấu trúc)**: AI Search engine như ChatGPT Search cần schema để hiểu nội dung. Hiện tại chưa có Schema.org cho các thực thể (Product, Article).
  - **Khuyến nghị**: Triển khai ngay Schema.org cho các entity quan trọng (Tour, Blog, FAQ).
- **Kết xuất phía máy khách (CSR)**: AI Bots thường không đợi JavaScript render xong hoặc gặp lỗi render. Vite SPA là một rào cản lớn cho GEO.
  - **Khuyến nghị**: Sử dụng Prerendering cho các trang public (Home, Tours, Blogs) để bot thu thập HTML tĩnh.

### 🟡 Warning
- **Định dạng nội dung cho LLM**: Các bài viết blog, chi tiết tour cần cấu trúc rõ ràng: đoạn văn ngắn (2-3 câu), danh sách (bullet points), và mật độ dữ kiện (Fact-density) cao.
  - **Khuyến nghị**: Audit lại nội dung trên frontend, đảm bảo văn bản rõ ràng, cung cấp thông tin hữu ích ngay đoạn đầu.
- **E-E-A-T (Kinh nghiệm, Chuyên môn, Thẩm quyền, Độ tin cậy)**: 
  - **Khuyến nghị**: Bổ sung thông tin tác giả, ngày đăng, đánh giá thật từ khách hàng, chứng chỉ doanh nghiệp du lịch.
- **FAQ / People Also Ask**:
  - **Khuyến nghị**: Thêm phần "Câu hỏi thường gặp" (FAQ Schema) vào trang chi tiết Tour để tăng cơ hội AI trích dẫn.
