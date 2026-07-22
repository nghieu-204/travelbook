import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';

// Layouts
import ClientLayout from './layouts/ClientLayout';
import AdminLayout from './layouts/AdminLayout';

// Client Pages
import Home from './pages/Client/Home';
import Tours from './pages/Client/Tours';
import TourDetails from './pages/Client/TourDetails';
import MyBookings from './pages/Client/MyBookings';
import Contact from './pages/Client/Contact';
import Login from './pages/Client/Login';
import Register from './pages/Client/Register';
import Cart from './pages/Client/Cart';
import Profile from './pages/Client/Profile';
import Blog from './pages/Client/Blog';
import Checkout from './pages/Client/Checkout';

// Admin Pages
import Dashboard from './pages/Admin/Dashboard';
import ManageTours from './pages/Admin/ManageTours';
import AddTour from './pages/Admin/AddTour';
import ManageBookings from './pages/Admin/ManageBookings';
import ManageContacts from './pages/Admin/ManageContacts';
import ManageUsers from './pages/Admin/ManageUsers';
import ManageAdminProfile from './pages/Admin/ManageAdminProfile';

// Route bảo vệ Admin
function AdminRoute({ user, children }) {
    if (!user || user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }
    return children;
}

function App() {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (savedUser && token) {
            try {
                return JSON.parse(savedUser);
            } catch (e) {
                console.error("Lỗi parse user data:", e);
                return null;
            }
        }
        return null;
    });

    useEffect(() => {
        // Có thể giữ trống hoặc loại bỏ
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <Router>
            <CartProvider user={user}>
                <Routes>
                    {/* Client Routes (Sử dụng ClientLayout với Navbar & Footer Khách Hàng) */}
                    <Route element={<ClientLayout user={user} onLogout={handleLogout} />}>
                        <Route path="/" element={<Home user={user} />} />
                        <Route path="/tours" element={<Tours />} />
                        <Route path="/tours/:id" element={<TourDetails user={user} />} />
                        <Route path="/my-bookings" element={<MyBookings user={user} />} />
                        <Route path="/cart" element={<Cart user={user} />} />
                        <Route path="/checkout/:id" element={<Checkout user={user} />} />
                        <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/login" element={<Login setUser={setUser} user={user} />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/blog" element={<Blog />} />
                    </Route>

                    {/* Admin Routes */}
                    <Route path="/admin/*" element={
                        <AdminRoute user={user}>
                            <AdminLayout user={user} onLogout={handleLogout}>
                                <Routes>
                                    <Route path="" element={<Dashboard user={user} />} />
                                    <Route path="dashboard" element={<Dashboard user={user} />} />
                                    <Route path="tours" element={<ManageTours />} />
                                    <Route path="tours/add" element={<AddTour />} />
                                    <Route path="bookings" element={<ManageBookings />} />
                                    <Route path="contacts" element={<ManageContacts />} />
                                    <Route path="users" element={<ManageUsers />} />
                                    <Route path="profile" element={<ManageAdminProfile user={user} setUser={setUser} />} />
                                </Routes>
                            </AdminLayout>
                        </AdminRoute>
                    } />
                </Routes>
            </CartProvider>
        </Router>
    );
}

export default App;