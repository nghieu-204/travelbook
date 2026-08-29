import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function generateSlug(str: string): string {
  if (!str) return '';
  str = String(str).toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');
  // Some system encode vietnamese combining accent as individual utf-8 characters
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ''); 
  str = str.replace(/\u02C6|\u0306|\u031B/g, ''); 
  str = str.replace(/[^a-z0-9\s-]/g, '');
  str = str.replace(/\s+/g, '-');
  str = str.replace(/-+/g, '-');
  return str.replace(/^-+|-+$/g, '');
}

/**
 * Returns a fully qualified URL for an image.
 * If the provided src is already an absolute URL (http/https) or base64 (data:), it returns it as is.
 * Otherwise, it prepends the backend base URL (extracted from NEXT_PUBLIC_API_URL).
 */
export function getImageUrl(src?: string | null): string {
  if (!src) return '';
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
    return src;
  }
  
  // Lấy baseUrl từ API_URL (ví dụ http://localhost:8902/api -> http://localhost:8902)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8902/api';
  const baseUrl = apiUrl.replace(/\/api\/?$/, '');
  
  const path = src.startsWith('/') ? src : `/${src}`;
  return `${baseUrl}${path}`;
}
