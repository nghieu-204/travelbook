# UI Typography Standardization - Technical Plan

## 1. Mục tiêu (Objective)
Triển khai CSS Variables vào `frontend/src/index.css` dựa trên đặc tả tại `spec.md` để đồng nhất font-size theo LearnUI Guidelines và tối ưu tiếng Việt.

## 2. Các thay đổi dự kiến
### 2.1 CSS Variables (Khai báo trong `:root`)
```css
:root {
  /* ...các biến màu sắc cũ... */
  
  /* Typography - LearnUI Guidelines + Tiếng Việt */
  --fs-h1: 2rem;       /* 32px */
  --fs-h2: 1.75rem;    /* 28px */
  --fs-h3: 1.5rem;     /* 24px */
  --fs-h4: 1.25rem;    /* 20px */
  --fs-h5: 1.125rem;   /* 18px */
  --fs-body: 1rem;     /* 16px - chống auto-zoom iOS */
  --fs-secondary: 0.875rem; /* 14px */
  --fs-tertiary: 0.75rem;   /* 12px */

  --lh-body: 1.65;     /* Tối ưu dấu tiếng Việt */
  --lh-heading: 1.35;  /* Tối ưu dấu tiếng Việt */
}

@media (min-width: 768px) {
  :root {
    --fs-h1: 2.5rem;   /* 40px */
    --fs-h2: 2rem;     /* 32px */
    --fs-h3: 1.75rem;  /* 28px */
    --fs-h4: 1.5rem;   /* 24px */
    --fs-h5: 1.25rem;  /* 20px */
    /* --fs-body, secondary, tertiary giữ nguyên tỷ lệ */
  }
}
```

### 2.2 Cập nhật Class
- **body**: Sửa `line-height: 1.6` thành `line-height: var(--lh-body)`
- **.logo**: Từ `26px` -> `var(--fs-h3)`
- **.nav-link**: Từ `15px` -> `var(--fs-body)`
- **.user-avatar**: Từ `14px` -> `var(--fs-secondary)`
- **.btn**: Từ `15px` -> `var(--fs-body)`
- **.btn-sm**: Từ `13px` -> `var(--fs-secondary)`
- **.hero-title**: Từ `48px` -> `var(--fs-h1)`
- **.hero-subtitle**: Từ `19px` -> `var(--fs-h4)`
- **.form-group label**: Từ `13px` -> `var(--fs-secondary)`
- **.form-control**: Từ `15px` -> `var(--fs-body)` (Quan trọng: `<input>` phải ≥16px)
- **.section-title**: Từ `34px` -> `var(--fs-h2)`
- **.section-desc**: Từ `16px` -> `var(--fs-body)`
- **.tab-item**: Từ `14px` -> `var(--fs-secondary)`
- **.tour-badge**: Từ `12px` -> `var(--fs-tertiary)`
- **.tour-location**: Từ `13px` -> `var(--fs-secondary)`
- **.tour-title**: Từ `18px` -> `var(--fs-h5)`
- **.tour-meta**: Từ `13px` -> `var(--fs-secondary)`
- **.price-label**: Từ `11px` -> `var(--fs-tertiary)`
- **.original-price**: Từ `13px` -> `var(--fs-secondary)`
- **.current-price**: Từ `20px` -> `var(--fs-h4)`
- **.auth-header h2**: Từ `26px` -> `var(--fs-h3)`
- **.footer-col h4**: Từ `18px` -> `var(--fs-h5)`
- **.footer-links li a**: Từ `14px` -> `var(--fs-secondary)`
- **.footer-bottom**: Từ `14px` -> `var(--fs-secondary)`

### 2.3 Xóa rules không còn cần thiết
- Xóa class `.hero-title` trong media query `@media (max-width: 768px)` do `--fs-h1` đã tự điều chỉnh theo media query.

## 3. Rủi ro và Giải pháp (Risks & Mitigation)
- **Rủi ro:** Header `.hero-title` trước đây là 48px trên desktop, giờ giảm còn 40px có thể làm nó nhỏ đi.
- **Giải pháp:** Theo LearnUI, Desktop H1 không nhất thiết phải khổng lồ nếu không cần thiết, 40-50px là phù hợp. Nếu 40px quá nhỏ, có thể tăng `--fs-h1` trên desktop lên `3rem` (48px). Tuy nhiên sẽ bám sát 40px (`2.5rem`) cho gọn gàng.
