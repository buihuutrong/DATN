import React, { useEffect, useState } from 'react';
import { Users, Utensils, ClipboardList, Award, TrendingUp } from 'lucide-react';
import { getTotalUsers, getAllFoods } from '../../services/api';

// Dùng mockUsers nếu chưa có API thật
const mockUsers = [
    { id: 1, name: 'Nguyễn Văn A', email: 'a@gmail.com', role: 'user', isVerified: true },
    { id: 2, name: 'Trần Thị B', email: 'b@gmail.com', role: 'admin', isVerified: true },
    { id: 3, name: 'Lê Văn C', email: 'c@gmail.com', role: 'user', isVerified: false },
];

const StatCard = ({ title, value, icon, trend, color }) => (
    <div style={{
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 2px 12px rgba(30,41,59,0.06)',
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        minWidth: 180,
        minHeight: 120,
        flex: 1
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ background: color, borderRadius: 12, padding: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: 18, fontWeight: 600, color: '#1e293b' }}>{title}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#0ea5e9' }}>{value}</div>
            </div>
        </div>
        {trend && (
            <div style={{ color: '#22c55e', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                <TrendingUp size={16} />
                {trend}
            </div>
        )}
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0, // Số user không phải admin
        totalFoods: 0,
        totalMenus: 0,
        totalAchievements: 0,
        lastWeekStats: {
            newUsers: 0,
            newFoods: 0,
            newMenus: 0
        }
    });

    useEffect(() => {
        const fetchStats = async () => {
            console.log('[Dashboard] Bắt đầu lấy dữ liệu thống kê');
            try {
                // Sử dụng Promise.all để gọi các API song song
                const [totalUsers, allFoods] = await Promise.all([
                    getTotalUsers(),
                    getAllFoods()
                ]);

                console.log('[Dashboard] Kết quả trả về từ API getTotalUsers:', totalUsers);
                console.log('[Dashboard] Kết quả trả về từ API getAllFoods:', allFoods);

                const statsObj = {
                    totalUsers: totalUsers || 0,
                    totalFoods: allFoods?.length || 0, // Lấy độ dài của mảng món ăn
                    totalMenus: 0, // Giữ lại giá trị mock0
                    totalAchievements: 0, // Giữ lại giá trị mock
                    lastWeekStats: {
                        newUsers: 25, // Giữ lại giá trị mock
                        newFoods: 10, // Giữ lại giá trị mock
                        newMenus: 8    // Giữ lại giá trị mock
                    }
                };

                console.log('[Dashboard] setStats với object:', statsObj);
                setStats(statsObj);

            } catch (err) {
                console.error('[Dashboard] Lỗi khi gọi API lấy dữ liệu thống kê:', err);
                // Cập nhật trạng thái lỗi nếu cần
                setStats(prevStats => ({
                    ...prevStats,
                    totalUsers: 0,
                    totalFoods: 0,
                }));
            }
        };

        fetchStats();
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Dashboard tổng quan</h1>
            {/* Statistics Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
                {console.log('[Dashboard] Render StatCard tổng số người dùng:', stats.totalUsers)}
                <StatCard
                    title="Tổng số người dùng"
                    value={stats.totalUsers}
                    icon={<Users size={28} color="#0ea5e9" />}
                    color="#e0f2fe"
                />
                <StatCard
                    title="Tổng số món ăn"
                    value={stats.totalFoods}
                    icon={<Utensils size={28} color="#22c55e" />}
                    color="#dcfce7"
                />
                <StatCard
                    title="Tổng số thực đơn"
                    value={stats.totalMenus}
                    icon={<ClipboardList size={28} color="#a21caf" />}
                    color="#f3e8ff"
                />
                <StatCard
                    title="Thành tích hệ thống"
                    value={stats.totalAchievements}
                    icon={<Award size={28} color="#f59e42" />}
                    color="#fef9c3"
                />
            </div>

            {/* Charts Section (placeholder) */}
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 320, background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(30,41,59,0.06)', padding: 24 }}>
                    <div style={{ fontWeight: 600, marginBottom: 12 }}>Biểu đồ hoạt động (demo)</div>
                    <div style={{ height: 180, background: 'linear-gradient(90deg, #bae6fd 0%, #f0fdfa 100%)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', fontWeight: 700, fontSize: 20 }}>
                        [Biểu đồ sẽ hiển thị ở đây]
                    </div>
                </div>
                <div style={{ flex: 1, minWidth: 320, background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(30,41,59,0.06)', padding: 24 }}>
                    <div style={{ fontWeight: 600, marginBottom: 12 }}>Biểu đồ compliance (demo)</div>
                    <div style={{ height: 180, background: 'linear-gradient(90deg, #fef9c3 0%, #f0fdfa 100%)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e42', fontWeight: 700, fontSize: 20 }}>
                        [Biểu đồ sẽ hiển thị ở đây]
                    </div>
                </div>
            </div>

            {/* Recent Activity & Pending Approvals */}
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 320, background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(30,41,59,0.06)', padding: 24 }}>
                    <div style={{ fontWeight: 600, marginBottom: 12 }}>Hoạt động gần đây</div>
                    <ul style={{ color: '#64748b', fontSize: 15, lineHeight: 1.7 }}>
                        <li>• User <b>nguyenvanA</b> vừa đăng ký tài khoản</li>
                        <li>• Món ăn <b>Salad cá hồi</b> vừa được phê duyệt</li>
                        <li>• Thực đơn <b>Healthy Day</b> vừa được tạo mới</li>
                    </ul>
                </div>
                <div style={{ flex: 1, minWidth: 320, background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(30,41,59,0.06)', padding: 24 }}>
                    <div style={{ fontWeight: 600, marginBottom: 12 }}>Đang chờ phê duyệt</div>
                    <ul style={{ color: '#64748b', fontSize: 15, lineHeight: 1.7 }}>
                        <li>• Món ăn <b>Bánh mì yến mạch</b> đang chờ phê duyệt</li>
                        <li>• Thực đơn <b>Eat Clean 7 ngày</b> đang chờ phê duyệt</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 