import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../services/api';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const ResetPassword = () => {
    const query = useQuery();
    const navigate = useNavigate();
    const token = query.get('token');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        if (!password || password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }
        if (password !== confirm) {
            setError('Mật khẩu nhập lại không khớp.');
            return;
        }
        setLoading(true);
        try {
            await resetPassword(token, password);
            setMessage('Đặt lại mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới.');
            setTimeout(() => navigate('/auth'), 1800);
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return <div style={{ color: '#c62828', textAlign: 'center', marginTop: 60 }}>Liên kết không hợp lệ hoặc đã hết hạn.</div>;
    }

    return (
        <div className="auth-form-container" style={{ maxWidth: 400, margin: '60px auto', background: '#fff', borderRadius: 12, boxShadow: '0 4px 16px #0001', padding: 32 }}>
            <h2>Đặt lại mật khẩu</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 18 }}>
                    <label htmlFor="password">Mật khẩu mới</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        minLength={6}
                        style={{ width: '100%', padding: 10, borderRadius: 6, border: '1.5px solid #ccc', marginTop: 6 }}
                        placeholder="Nhập mật khẩu mới"
                    />
                </div>
                <div style={{ marginBottom: 18 }}>
                    <label htmlFor="confirm">Nhập lại mật khẩu</label>
                    <input
                        id="confirm"
                        type="password"
                        value={confirm}
                        onChange={e => setConfirm(e.target.value)}
                        required
                        minLength={6}
                        style={{ width: '100%', padding: 10, borderRadius: 6, border: '1.5px solid #ccc', marginTop: 6 }}
                        placeholder="Nhập lại mật khẩu mới"
                    />
                </div>
                <button type="submit" disabled={loading} style={{ width: '100%', padding: 12, borderRadius: 8, background: '#4CAF50', color: '#fff', fontWeight: 700, border: 'none', fontSize: 16 }}>
                    {loading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
                </button>
                {message && <div style={{ color: '#228B22', marginTop: 18 }}>{message}</div>}
                {error && <div style={{ color: '#c62828', marginTop: 18 }}>{error}</div>}
            </form>
        </div>
    );
};

export default ResetPassword; 