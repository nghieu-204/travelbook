const BOOKING_STATUS = {
    PENDING: 'Đang chờ xác nhận',
    CONFIRMED: 'Đã xác nhận',
    CANCELLED: 'Hủy',
    CANCELLATION_REQUESTED: 'Yêu cầu hủy',
    ONGOING: 'Đang diễn ra',
    COMPLETED: 'Đã hoàn thành',
    PENDING_PAYMENT: 'Đang chờ thanh toán'
};

const PAYMENT_STATUS = {
    UNPAID: 'Chưa thanh toán',
    PAID: 'Đã thanh toán',
    DEPOSITED: 'Đã cọc'
};

const USER_STATUS = {
    ACTIVE: 'Hoạt động',
    BANNED: 'Bị khóa'
};

const TOUR_STATUS = {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    HIDDEN: 'Hidden'
};

const USER_ROLE = {
    ADMIN: 'admin',
    USER: 'user'
};

module.exports = {
    BOOKING_STATUS,
    PAYMENT_STATUS,
    USER_STATUS,
    TOUR_STATUS,
    USER_ROLE
};
