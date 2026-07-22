import React, { createContext, useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children, user }) => {
    const [cart, setCart] = useState([]);
    const [toast, setToast] = useState(null);

    // 1. Quản lý trạng thái giỏ hàng khi người dùng thay đổi (Đăng nhập / Đăng xuất / Guest)
    useEffect(() => {
        if (user && (user.id || user.email)) {
            // Khi đã đăng nhập: giỏ hàng của ai thì hiển thị của người đó
            const userCartKey = `skytravel_cart_${user.id || user.email}`;
            try {
                const saved = localStorage.getItem(userCartKey);
                if (saved) {
                    setCart(JSON.parse(saved));
                } else {
                    setCart([]);
                }
            } catch (e) {
                console.error("Lỗi tải giỏ hàng user:", e);
                setCart([]);
            }
        } else {
            // Khi chưa đăng nhập (Guest) hoặc vừa ra ngoài (Đăng xuất): reset lại giỏ hàng
            // (Guest khi thêm vào giỏ chỉ lưu trong bộ nhớ tạm React State, ấn F5 hoặc reset sẽ tự động mất)
            setCart([]);
        }
    }, [user]);

    // 2. Lưu vào localStorage riêng của user mỗi khi giỏ hàng thay đổi (CHỈ khi đã đăng nhập)
    useEffect(() => {
        if (user && (user.id || user.email)) {
            const userCartKey = `skytravel_cart_${user.id || user.email}`;
            try {
                localStorage.setItem(userCartKey, JSON.stringify(cart));
            } catch (e) {
                console.error("Lỗi lưu giỏ hàng user:", e);
            }
        }
    }, [cart, user]);

    const showToast = (message, tourName) => {
        setToast({ message, tourName });
        setTimeout(() => {
            setToast(null);
        }, 4000);
    };

    const addToCart = (tour, adults = 1, children = 0) => {
        if (!tour || !tour.id) return;

        // Gọi showToast bên ngoài callback của setCart để tránh lỗi React state collision
        const existing = cart.find(item => item.tourId === tour.id);
        if (existing) {
            showToast("✅ Đã cập nhật số lượng trong giỏ hàng", tour.name);
        } else {
            showToast("🎉 Đã thêm tour mới vào giỏ hàng", tour.name);
        }

        setCart(prevCart => {
            const existingIndex = prevCart.findIndex(item => item.tourId === tour.id);
            if (existingIndex > -1) {
                const updated = [...prevCart];
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    adults: updated[existingIndex].adults + adults,
                    children: updated[existingIndex].children + children
                };
                return updated;
            } else {
                const newItem = {
                    tourId: tour.id,
                    name: tour.name,
                    image: tour.image || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
                    price: Number(tour.price || 0),
                    original_price: Number(tour.original_price || 0),
                    location: tour.location || 'Việt Nam',
                    region: tour.region || 'Miền Nam',
                    duration: tour.duration || '3 ngày 2 đêm',
                    departureDate: tour.departure_date || '2026-08-15',
                    adults: adults,
                    children: children,
                    selected: true
                };
                return [...prevCart, newItem];
            }
        });
    };

    const removeFromCart = (tourId) => {
        setCart(prev => prev.filter(item => item.tourId !== tourId));
    };

    const updateCartItem = (tourId, adults, children, departureDate) => {
        setCart(prev => prev.map(item => {
            if (item.tourId === tourId) {
                return {
                    ...item,
                    adults: Math.max(1, adults),
                    children: Math.max(0, children),
                    departureDate: departureDate || item.departureDate
                };
            }
            return item;
        }));
    };

    const toggleSelectItem = (tourId) => {
        setCart(prev => prev.map(item => {
            if (item.tourId === tourId) {
                return { ...item, selected: item.selected === false ? true : false };
            }
            return item;
        }));
    };

    const toggleSelectAll = (isSelected) => {
        setCart(prev => prev.map(item => ({ ...item, selected: isSelected })));
    };

    const clearCart = () => {
        setCart([]);
        if (user && (user.id || user.email)) {
            const userCartKey = `skytravel_cart_${user.id || user.email}`;
            localStorage.removeItem(userCartKey);
        }
    };

    // Tổng số lượng tour trong giỏ
    const cartCount = cart.length;

    // Danh sách tour được tích chọn
    const selectedCartItems = cart.filter(item => item.selected !== false);
    const selectedCount = selectedCartItems.length;

    // Tổng giá tiền của CHỈ các tour được tích chọn
    const cartTotal = selectedCartItems.reduce((sum, item) => {
        const itemTotal = (item.adults * item.price) + (item.children * Math.round(item.price * 0.7));
        return sum + itemTotal;
    }, 0);

    return (
        <CartContext.Provider value={{
            cart,
            selectedCartItems,
            addToCart,
            removeFromCart,
            updateCartItem,
            toggleSelectItem,
            toggleSelectAll,
            clearCart,
            cartCount,
            selectedCount,
            cartTotal
        }}>
            {children}

            {/* Global Toast Notification khi thêm vào giỏ hàng */}
            {toast && (
                <div style={{
                    position: 'fixed',
                    bottom: '30px',
                    right: '30px',
                    background: 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(16px)',
                    color: 'white',
                    padding: '16px 24px',
                    borderRadius: '16px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    zIndex: 999999,
                    animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}>
                    <div style={{ fontSize: '28px' }}>🛒</div>
                    <div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#10b981' }}>{toast.message}</div>
                        <div style={{ fontSize: '13px', color: '#cbd5e1', maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                            {toast.tourName}
                        </div>
                    </div>
                    <Link
                        to="/cart"
                        onClick={() => setToast(null)}
                        style={{
                            background: 'linear-gradient(135deg, #0a66c2, #00d4bd)',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '10px',
                            textDecoration: 'none',
                            fontSize: '13px',
                            fontWeight: 800,
                            whiteSpace: 'nowrap',
                            boxShadow: '0 4px 12px rgba(10, 102, 194, 0.3)'
                        }}
                    >
                        Xem giỏ hàng →
                    </Link>
                </div>
            )}
        </CartContext.Provider>
    );
};
