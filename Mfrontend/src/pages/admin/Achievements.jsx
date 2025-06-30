import React, { useEffect, useState } from 'react';

const mockAchievements = [
    { id: 1, name: 'week_streak', description: 'Duy trì streak 7 ngày liên tiếp' },
    { id: 2, name: 'high_compliance', description: 'Đạt compliance trên 90%' },
];

const Achievements = () => {
    const [achievements, setAchievements] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        // Gọi API lấy danh sách thành tích (demo dùng mock)
        setAchievements(mockAchievements);
    }, []);

    const filteredAchievements = achievements.filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.description.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(30,41,59,0.06)', padding: 24 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Quản lý thành tích</h2>
            <input
                type="text"
                placeholder="Tìm kiếm thành tích..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ padding: 8, borderRadius: 8, border: '1px solid #e5e7eb', marginBottom: 16, width: 300 }}
            />
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
                <thead>
                    <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                        <th style={{ padding: 10, borderRadius: 8 }}>Tên thành tích</th>
                        <th>Mô tả</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredAchievements.map(a => (
                        <tr key={a.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: 10 }}>{a.name}</td>
                            <td>{a.description}</td>
                            <td>
                                <button style={{ marginRight: 8, color: '#f59e42', background: 'none', border: 'none', cursor: 'pointer' }}>Sửa</button>
                                <button style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Achievements; 