import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FormInput from '../../components/FormInput';
import { login, register } from '../../services/api';
import './AuthPage.css';

const AuthPage = () => {
    const navigate = useNavigate();
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

    // Check if user is already logged in
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/dashboard');
        }
    }, [navigate]);

    const validateForm = (isSignUpForm) => {
        const errors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

        if (isSignUpForm) {
            if (!signUpName.trim()) errors.name = 'Name is required';
            if (!signUpEmail.trim()) errors.email = 'Email is required';
            else if (!emailRegex.test(signUpEmail)) errors.email = 'Invalid email format';
            if (!signUpPassword) errors.password = 'Password is required';
            else if (!passwordRegex.test(signUpPassword)) {
                errors.password = 'Password must be at least 8 characters with letters and numbers';
            }
        } else {
            if (!signInEmail.trim()) errors.email = 'Email is required';
            else if (!emailRegex.test(signInEmail)) errors.email = 'Invalid email format';
            if (!signInPassword) errors.password = 'Password is required';
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

            setSuccess('Đăng ký thành công! Vui lòng đăng nhập.');
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
                setSuccess('Đăng nhập thành công!');
                setError('');
                setSignInEmail('');
                setSignInPassword('');

                // Đảm bảo token đã được lưu
                if (localStorage.getItem('token')) {
                    console.log('Token saved, navigating to dashboard...');
                    // Sử dụng setTimeout để đảm bảo state đã được cập nhật
                    setTimeout(() => {
                        navigate('/dashboard', { replace: true });
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
            <div className={`container ${isSignUp ? 'right-panel-active' : ''}`} id="container">
                <div className="form-container sign-in-container">
                    <form onSubmit={handleSignInSubmit}>
                        <h1>Sign In</h1>
                        {error && !isSignUp && <p className="text-red-500 text-sm mb-4">{error}</p>}
                        {success && !isSignUp && <p className="text-green-500 text-sm mb-4">{success}</p>}
                        <div className="social-container">
                            <a href="#" className="social">f</a>
                            <a href="#" className="social">G+</a>
                            <a href="#" className="social">in</a>
                        </div>
                        <span>or use your account</span>
                        <FormInput
                            type="email"
                            placeholder="Email"
                            value={signInEmail}
                            onChange={(e) => setSignInEmail(e.target.value)}
                            error={validationErrors.email}
                        />
                        <FormInput
                            type="password"
                            placeholder="Password"
                            value={signInPassword}
                            onChange={(e) => setSignInPassword(e.target.value)}
                            error={validationErrors.password}
                        />
                        <a href="#">Forgot your password?</a>
                        <button
                            type="submit"
                            disabled={loading}
                            onClick={(e) => e.target.blur()}
                            className={`${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Processing...' : 'Sign In'}
                        </button>
                    </form>
                </div>

                <div className="form-container sign-up-container">
                    <form onSubmit={handleSignUpSubmit}>
                        <h1>Create Account</h1>
                        {error && isSignUp && <p className="text-red-500 text-sm mb-4">{error}</p>}
                        {success && isSignUp && <p className="text-green-500 text-sm mb-4">{success}</p>}
                        <div className="social-container">
                            <a href="#" className="social">f</a>
                            <a href="#" className="social">G+</a>
                            <a href="#" className="social">in</a>
                        </div>
                        <span>or use your email for registration</span>
                        <FormInput
                            type="text"
                            placeholder="Name"
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
                            placeholder="Password"
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
                            {loading ? 'Processing...' : 'Sign Up'}
                        </button>
                    </form>
                </div>

                <div className="overlay-container">
                    <div className="overlay">
                        <div className="overlay-panel overlay-left">
                            <h1>Welcome Back!</h1>
                            <p>To keep connected with us please login<br />
                                with your personal info
                            </p>

                            <button
                                className="ghost"
                                onClick={(e) => { setIsSignUp(false); e.target.blur(); }}
                            >
                                Sign In
                            </button>
                        </div>
                        <div className="overlay-panel overlay-right">
                            <h1>Hello, Friend!</h1>
                            <p>Enter your personal details and start journey with us</p>
                            <button
                                className="ghost"
                                onClick={(e) => { setIsSignUp(true); e.target.blur(); }}
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <footer>

            </footer>
        </div>
    );
};

export default AuthPage;