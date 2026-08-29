// Trạng thái đặt tour
export const BOOKING_STATUS = {
  PENDING: 'Đang chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  CANCELLED: 'Hủy',
  CANCELLATION_REQUESTED: 'Yêu cầu hủy',
  ONGOING: 'Đang diễn ra',
  COMPLETED: 'Đã hoàn thành',
  PENDING_PAYMENT: 'Đang chờ thanh toán'
} as const;

export type BookingStatus = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];

// Trạng thái thanh toán
export const PAYMENT_STATUS = {
  UNPAID: 'Chưa thanh toán',
  PAID: 'Đã thanh toán',
  DEPOSITED: 'Đã cọc'
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

// Trạng thái người dùng
export const USER_STATUS = {
  ACTIVE: 'Hoạt động',
  BANNED: 'Bị khóa'
} as const;

export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS];

// Trạng thái Tour
export const TOUR_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  HIDDEN: 'Hidden'
} as const;

export type TourStatus = typeof TOUR_STATUS[keyof typeof TOUR_STATUS];

// Phân quyền
export const USER_ROLE = {
  ADMIN: 'admin',
  USER: 'user'
} as const;

export type UserRole = typeof USER_ROLE[keyof typeof USER_ROLE];
