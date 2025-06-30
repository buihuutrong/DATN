import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import FormInput from '../../components/FormInput';
import { login, register } from '../../services/api';
import './AuthPage.css';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const AuthPage = () => {
    const navigate = useNavigate();
    const searchParams = useSearchParams()[0];
    const { setUser } = useAuth();
    const [isSignUp, setIsSignUp] = useState(false);
    const [signUpName, setSignUpName] = useState('');
    const [signUpEmail, setSignUpEmail] = useState('');
    const [signUpPassword, setSignUpPassword] = useState('');
    const [signInEmail, setSignInEmail] = useState('');
    const [signInPassword, setSignInPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('');
    const [hasVerified, setHasVerified] = useState(false);

    // Check if user is already logged in
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/dashboard');
        }
    }, [navigate]);

    useEffect(() => {
        let didRequest = false;
        const verifyEmail = async () => {
            if (didRequest) return;
            didRequest = true;
            try {
                const token = searchParams.get('token');
                if (!token) {
                    setStatus('error');
                    setMessage('Token không hợp lệ');
                    return;
                }
                console.log('Verifying email with token:', token);
                const response = await axios.get(`http://localhost:8686/api/user/verify-email?token=${token}`);
                console.log('Verification response:', response);
                setStatus('success');
                setMessage('Xác thực email thành công! Bạn có thể đăng nhập ngay bây giờ.');
                setHasVerified(true);
                setTimeout(() => {
                    navigate('/');
                }, 3000);
            } catch (error) {
                console.error('Verification error:', error);
                if (!hasVerified) {
                    setStatus('error');
                    setMessage(error.response?.data?.message || 'Lỗi khi xác thực email');
                }
            }
        };
        verifyEmail();
    }, [navigate, searchParams]);

    const validateForm = (isSignUpForm) => {
        const errors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

        if (isSignUpForm) {
            if (!signUpName.trim()) errors.name = 'Vui lòng nhập tên';
            if (!signUpEmail.trim()) errors.email = 'Vui lòng nhập email';
            else if (!emailRegex.test(signUpEmail)) errors.email = 'Email không hợp lệ';
            if (!signUpPassword) errors.password = 'Vui lòng nhập mật khẩu';
            else if (!passwordRegex.test(signUpPassword)) {
                errors.password = 'Mật khẩu phải có ít nhất 8 ký tự bao gồm chữ và số';
            }
        } else {
            if (!signInEmail.trim()) errors.email = 'Vui lòng nhập email';
            else if (!emailRegex.test(signInEmail)) errors.email = 'Email không hợp lệ';
            if (!signInPassword) errors.password = 'Vui lòng nhập mật khẩu';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSignUpSubmit = async (e) => {
        e.preventDefault();
        console.log('AuthPage: Starting sign up process...');

        if (!validateForm(true)) {
            console.log('AuthPage: Form validation failed:', validationErrors);
            return;
        }

        setLoading(true);
        try {
            console.log('AuthPage: Preparing registration data...');
            const registrationData = {
                email: signUpEmail.trim(),
                password: signUpPassword,
                name: signUpName.trim()
            };
            console.log('AuthPage: Sending registration request...');

            const response = await register(registrationData);
            console.log('AuthPage: Registration successful:', {
                hasToken: !!response.token,
                hasUser: !!response.user,
                message: response.message
            });

            setSuccess('Đăng ký thành công! Vui lòng kiểm tra email của bạn để xác thực tài khoản.');
            setError('');
            setSignUpName('');
            setSignUpEmail('');
            setSignUpPassword('');
            setIsSignUp(false);
        } catch (err) {
            console.error('AuthPage: Registration error:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });

            let errorMessage = 'Đăng ký thất bại. ';
            if (err.response?.status === 409) {
                errorMessage = 'Email này đã được sử dụng.';
            } else if (err.response?.status === 400) {
                errorMessage = err.response.data.message || 'Dữ liệu đăng ký không hợp lệ.';
            } else if (!err.response) {
                errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
            } else {
                errorMessage += err.response?.data?.message || err.message;
            }

            setError(errorMessage);
            setSuccess('');
        } finally {
            setLoading(false);
        }
    };

    const handleSignInSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm(false)) return;

        setLoading(true);
        try {
            const loginData = {
                email: signInEmail,
                password: signInPassword
            };
            console.log('Login attempt with:', loginData);
            const response = await login(loginData);
            console.log('Login response:', response);

            if (response.token) {
                setUser(response.user);
                // Kiểm tra trạng thái xác thực email
                if (!response.user.isVerified) {
                    setError('Vui lòng xác thực email trước khi đăng nhập.');
                    setSuccess('');
                    return;
                }
                // Kiểm tra hồ sơ dinh dưỡng
                if (!response.user.nutritionProfile || !response.user.nutritionProfile.isComplete) {
                    setSuccess('Đăng nhập thành công! Hãy hoàn thiện hồ sơ dinh dưỡng.');
                    setError('');
                    setSignInEmail('');
                    setSignInPassword('');
                    setTimeout(() => {
                        navigate('/profile-setup', { replace: true });
                    }, 100);
                    return;
                }
                setSuccess('Đăng nhập thành công!');
                setError('');
                setSignInEmail('');
                setSignInPassword('');
                if (localStorage.getItem('token')) {
                    setTimeout(() => {
                        if (response.user.role === 'admin') {
                            navigate('/admin/foods', { replace: true });
                        } else {
                            navigate('/dashboard', { replace: true });
                        }
                    }, 100);
                } else {
                    throw new Error('Token không được lưu thành công');
                }
            } else {
                throw new Error('Không nhận được token từ server');
            }
        } catch (err) {
            console.error('Login error details:', {
                status: err.response?.status,
                data: err.response?.data,
                message: err.message
            });
            setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.');
            setSuccess('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f6f5f7] font-montserrat flex-col">
            {searchParams.get('token') ? (
                <div className="auth-container">
                    <div className="auth-box">
                        <h2>Xác thực Email</h2>
                        <div className={`verification-status ${status}`}>
                            {status === 'verifying' && (
                                <div className="loading">Đang xác thực...</div>
                            )}
                            {status === 'success' && (
                                <div className="success">
                                    <i className="fas fa-check-circle"></i>
                                    <p>{message}</p>
                                </div>
                            )}
                            {status === 'error' && !hasVerified && (
                                <div className="error">
                                    <i className="fas fa-times-circle"></i>
                                    <p>{message}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className={`container ${isSignUp ? 'right-panel-active' : ''}`} id="container">
                    <div className="form-container sign-in-container">
                        <form onSubmit={handleSignInSubmit}>
                            <h1>Đăng Nhập</h1>
                            {error && !isSignUp && <p className="text-red-500 text-sm mb-4">{error}</p>}
                            {success && !isSignUp && <p className="text-green-500 text-sm mb-4">{success}</p>}
                            <div className="social-container">
                                <a href="#" className="social">f</a>
                                <a href="#" className="social">G+</a>
                                <a href="#" className="social">in</a>
                            </div>
                            <span>hoặc sử dụng tài khoản của bạn</span>
                            <FormInput
                                type="email"
                                placeholder="Email"
                                value={signInEmail}
                                onChange={(e) => setSignInEmail(e.target.value)}
                                error={validationErrors.email}
                            />
                            <FormInput
                                type="password"
                                placeholder="Mật khẩu"
                                value={signInPassword}
                                onChange={(e) => setSignInPassword(e.target.value)}
                                error={validationErrors.password}
                            />
                            <a href="/forgot-password">Quên mật khẩu?</a>
                            <button
                                type="submit"
                                disabled={loading}
                                onClick={(e) => e.target.blur()}
                                className={`${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
                            </button>
                        </form>
                    </div>

                    <div className="form-container sign-up-container">
                        <form onSubmit={handleSignUpSubmit}>
                            <h1>Tạo Tài Khoản</h1>
                            {error && isSignUp && <p className="text-red-500 text-sm mb-4">{error}</p>}
                            {success && isSignUp && <p className="text-green-500 text-sm mb-4">{success}</p>}
                            <div className="social-container">
                                <a href="#" className="social">f</a>
                                <a href="#" className="social">G+</a>
                                <a href="#" className="social">in</a>
                            </div>
                            <span>hoặc sử dụng email để đăng ký</span>
                            <FormInput
                                type="text"
                                placeholder="Tên"
                                value={signUpName}
                                onChange={(e) => setSignUpName(e.target.value)}
                                error={validationErrors.name}
                            />
                            <FormInput
                                type="email"
                                placeholder="Email"
                                value={signUpEmail}
                                onChange={(e) => setSignUpEmail(e.target.value)}
                                error={validationErrors.email}
                            />
                            <FormInput
                                type="password"
                                placeholder="Mật khẩu"
                                value={signUpPassword}
                                onChange={(e) => setSignUpPassword(e.target.value)}
                                error={validationErrors.password}
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                onClick={(e) => e.target.blur()}
                                className={`${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Đang xử lý...' : 'Đăng Ký'}
                            </button>
                        </form>
                    </div>

                    <div className="overlay-container">
                        <div className="overlay">
                            <div className="overlay-panel overlay-left">
                                <h1>Chào Mừng Trở Lại!</h1>
                                <p>Để kết nối với chúng tôi, vui lòng đăng nhập<br />
                                    bằng thông tin cá nhân của bạn
                                </p>

                                <button
                                    className="ghost"
                                    onClick={(e) => { setIsSignUp(false); e.target.blur(); }}
                                >
                                    Đăng Nhập
                                </button>
                            </div>
                            <div className="overlay-panel overlay-right">
                                <h1>Xin Chào!</h1>
                                <p>Nhập thông tin cá nhân của bạn và bắt đầu </p>
                                <p>hành trình với chúng tôi</p>
                                <button
                                    className="ghost"
                                    onClick={(e) => { setIsSignUp(true); e.target.blur(); }}
                                >
                                    Đăng Ký
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuthPage;