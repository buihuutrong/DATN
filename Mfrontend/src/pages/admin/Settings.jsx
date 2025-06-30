import React, { useState } from 'react';

const Settings = () => {
    const [settings, setSettings] = useState({
        notificationEmail: 'buihuutrong369@gmail.com',
        systemName: 'Hệ thống Quản lý Dinh dưỡng',
        allowRegister: true
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        // Gọi API lưu cài đặt (demo)
        alert('Đã lưu cài đặt!');
    };

    return (
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(30,41,59,0.06)', padding: 24, maxWidth: 500 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Cài đặt hệ thống</h2>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <label>
                    Tên hệ thống:
                    <input
                        type="text"
                        name="systemName"
                        value={settings.systemName}
                        onChange={handleChange}
                        style={{ padding: 8, borderRadius: 8, border: '1px solid #e5e7eb', marginTop: 4, width: '100%' }}
                    />
                </label>
                <label>
                    Email nhận thông báo:
                    <input
                        type="email"
                        name="notificationEmail"
                        value={settings.notificationEmail}
                        onChange={handleChange}
                        style={{ padding: 8, borderRadius: 8, border: '1px solid #e5e7eb', marginTop: 4, width: '100%' }}
                    />
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                        type="checkbox"
                        name="allowRegister"
                        checked={settings.allowRegister}
                        onChange={handleChange}
                    />
                    Cho phép đăng ký tài khoản mới
                </label>
                <button type="submit" style={{ padding: 10, borderRadius: 8, background: '#0ea5e9', color: '#fff', fontWeight: 600, border: 'none', marginTop: 8, cursor: 'pointer' }}>
                    Lưu cài đặt
                </button>
            </form>
        </div>
    );
};

export default Settings; 