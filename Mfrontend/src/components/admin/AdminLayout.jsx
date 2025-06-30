import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
    Users,
    Utensils,
    ClipboardList,
    BarChart2,
    Award,
    Settings,
    Menu as MenuIcon,
    X,
    LogOut
} from 'lucide-react';
import styles from './AdminLayout.module.css';

const menuItems = [
    { label: 'Dashboard', icon: <BarChart2 size={20} />, path: '/admin/dashboard' },
    { label: 'Quản lý người dùng', icon: <Users size={20} />, path: '/admin/users' },
    { label: 'Quản lý món ăn', icon: <Utensils size={20} />, path: '/admin/foods' },
    // { label: 'Quản lý thực đơn', icon: <ClipboardList size={20} />, path: '/admin/menus' },
    // { label: 'Quản lý thành tích', icon: <Award size={20} />, path: '/admin/achievements' },
    { label: 'Cài đặt', icon: <Settings size={20} />, path: '/admin/settings' },
];

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <div className={styles.adminContainer}>
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    <span className={styles.logoMain}>Admin</span>
                    <span className={styles.logoSub}>Panel</span>
                </div>
                <nav className={styles.menu}>
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={
                                location.pathname.startsWith(item.path)
                                    ? `${styles.menuItem} ${styles.active}`
                                    : styles.menuItem
                            }
                        >
                            {item.icon}
                            {item.label}
                        </Link>
                    ))}
                </nav>
                <button className={styles.logoutBtn} onClick={handleLogout}>
                    <LogOut size={18} style={{ marginRight: 8 }} /> Đăng xuất
                </button>
            </aside>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <header className={styles.header}>
                    <BarChart2 size={28} color="#0ea5e9" style={{ marginRight: 16 }} />
                    <span className={styles.headerText}>Chào mừng đến trang quản trị</span>
                </header>
                <main className={styles.mainContent}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout; 