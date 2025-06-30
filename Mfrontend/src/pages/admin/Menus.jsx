import React, { useEffect, useState } from 'react';

const mockMenus = [
    { id: 1, name: 'Healthy Day', user: 'Nguyễn Văn A', status: 'approved' },
    { id: 2, name: 'Eat Clean 7 ngày', user: 'Trần Thị B', status: 'pending' },
];

const Menus = () => {
    const [menus, setMenus] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        // Gọi API lấy danh sách thực đơn (demo dùng mock)
        setMenus(mockMenus);
    }, []);

    const filteredMenus = menus.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.user.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(30,41,59,0.06)', padding: 24 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Quản lý thực đơn</h2>
            <input
                type="text"
                placeholder="Tìm kiếm thực đơn..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ padding: 8, borderRadius: 8, border: '1px solid #e5e7eb', marginBottom: 16, width: 300 }}
            />
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
                <thead>
                    <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                        <th style={{ padding: 10, borderRadius: 8 }}>Tên thực đơn</th>
                        <th>Người tạo</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredMenus.map(menu => (
                        <tr key={menu.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: 10 }}>{menu.name}</td>
                            <td>{menu.user}</td>
                            <td>
                                {menu.status === 'approved' && <span style={{ color: '#22c55e' }}>Đã duyệt</span>}
                                {menu.status === 'pending' && <span style={{ color: '#f59e42' }}>Chờ duyệt</span>}
                            </td>
                            <td>
                                <button style={{ marginRight: 8, color: '#0ea5e9', background: 'none', border: 'none', cursor: 'pointer' }}>Xem</button>
                                <button style={{ marginRight: 8, color: '#22c55e', background: 'none', border: 'none', cursor: 'pointer' }}>Duyệt</button>
                                <button style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Menus; 