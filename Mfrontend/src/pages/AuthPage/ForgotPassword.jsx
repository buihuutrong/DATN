import React, { useState } from 'react';
import { forgotPassword } from '../../services/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);
        try {
            await forgotPassword(email);
            setMessage('Nếu email tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi. Hãy kiểm tra hộp thư của bạn!');
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-form-container" style={{ maxWidth: 400, margin: '60px auto', background: '#fff', borderRadius: 12, boxShadow: '0 4px 16px #0001', padding: 32 }}>
            <h2>Quên mật khẩu</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 18 }}>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: 10, borderRadius: 6, border: '1.5px solid #ccc', marginTop: 6 }}
                        placeholder="Nhập email của bạn"
                    />
                </div>
                <button type="submit" disabled={loading} style={{ width: '100%', padding: 12, borderRadius: 8, background: '#4CAF50', color: '#fff', fontWeight: 700, border: 'none', fontSize: 16 }}>
                    {loading ? 'Đang gửi...' : 'Gửi hướng dẫn'}
                </button>
                {message && <div style={{ color: '#228B22', marginTop: 18 }}>{message}</div>}
                {error && <div style={{ color: '#c62828', marginTop: 18 }}>{error}</div>}
            </form>
        </div>
    );
};

export default ForgotPassword; 