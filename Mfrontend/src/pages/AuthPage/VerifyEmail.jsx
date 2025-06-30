import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import './AuthPage.css';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('Đang xác thực email...');
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const token = searchParams.get('token');
                if (!token) {
                    setStatus('error');
                    setMessage('Token không hợp lệ');
                    return;
                }

                const response = await axios.get(`http://localhost:8686/api/user/verify-email?token=${token}`);

                // Nếu verify thành công và có token trong response
                if (response.data?.token) {
                    // Lưu token mới và cập nhật user state
                    localStorage.setItem('token', response.data.token);
                    await login(response.data.token);
                }

                setStatus('success');
                setMessage(response.data?.message || 'Xác thực email thành công! Bạn có thể đăng nhập ngay bây giờ.');

                // Chuyển hướng về trang chủ sau 3 giây
                setTimeout(() => {
                    navigate('/');
                }, 3000);
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Lỗi khi xác thực email');
            }
        };

        verifyEmail();
    }, [searchParams, login, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f6f5f7]">
            <div className="bg-white p-8 rounded-lg shadow-md w-96 text-center">
                <h2 className="text-2xl font-bold mb-4">Xác thực Email</h2>
                <div className={`verification-status ${status}`}>
                    {status === 'verifying' && (
                        <div className="loading">
                            <div className="spinner"></div>
                            <p>Đang xác thực...</p>
                        </div>
                    )}
                    {status === 'success' && (
                        <div className="success">
                            <i className="fas fa-check-circle text-green-500 text-4xl mb-2"></i>
                            <p className="text-green-600">{message}</p>
                            <p className="text-sm text-gray-500 mt-2">Bạn sẽ được chuyển hướng tự động sau 3 giây...</p>
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="error">
                            <i className="fas fa-times-circle text-red-500 text-4xl mb-2"></i>
                            <p className="text-red-600">{message}</p>
                            <a href="/" className="mt-4 inline-block text-blue-600 hover:underline">Quay lại trang đăng nhập</a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;