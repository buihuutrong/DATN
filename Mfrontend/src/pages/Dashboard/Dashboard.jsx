import React, { useState, useEffect, Suspense, lazy, useMemo, useCallback, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getUser, updateProfile, getMenuByDate, getNotifications } from '../../services/api';
import NotificationDropdown from '../../components/NotificationDropdown';
import '../../components/NotificationDropdown.css';

import './Dashboard.css';
import SavedMenusPage from './sections/SavedMenusPage';
import ProfileSection from './sections/ProfileSection';

// Lazy load all sections
const OverviewSection = lazy(() => import('./sections/OverviewSection'));
const NutritionSection = lazy(() => import('./sections/NutritionSection'));
const MenuSection = lazy(() => import('./sections/MenuSection'));
const ProgressSection = lazy(() => import('./sections/ProgressSection'));
const AISection = lazy(() => import('./sections/AISection'));
const ShoppingSection = lazy(() => import('./sections/ShoppingSection'));
// const CommunitySection = lazy(() => import('./sections/CommunitySection'));

// Loading component for sections
const SectionLoading = () => (
    <div className="section-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải...</p>
    </div>
);

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeSection, setActiveSection] = useState('overview'); // Default active section
    const [points, setPoints] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [aiMessage, setAiMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({
        age: '',
        weight: '',
        height: '',
        gender: '',
        activityLevel: '',
        goals: '',
        medicalConditions: [],
        preferences: [],
        restrictions: [],
        dailyCalorieNeeds: 2000, // Default value
        macroRatio: {
            protein: 30,
            carbs: 40,
            fat: 30
        },
        compliance: 100
    });
    const [isPending, startTransition] = useTransition();
    const [showNotifications, setShowNotifications] = useState(false);
    const [menuByDate, setMenuByDate] = useState({});
    const [selectedDate, setSelectedDate] = useState(new Date());

    const handleSetSelectedDate = (date) => {
        console.log('Dashboard setSelectedDate:', date, typeof date, date instanceof Date ? date.toISOString() : 'Không phải Date');
        setSelectedDate(date);
    };

    // Memoize user data fetching
    const fetchUserData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const userData = await getUser();
            setUser(userData);
            setProfileForm({
                age: userData.nutritionProfile?.age || '',
                weight: userData.nutritionProfile?.weight || '',
                height: userData.nutritionProfile?.height || '',
                gender: userData.nutritionProfile?.gender || '',
                activityLevel: userData.nutritionProfile?.activityLevel || '',
                goals: userData.nutritionProfile?.goals || '',
                medicalConditions: userData.nutritionProfile?.medicalConditions || [],
                preferences: userData.nutritionProfile?.preferences || [],
                restrictions: userData.nutritionProfile?.restrictions || [],
                dailyCalorieNeeds: userData.nutritionProfile?.dailyCalorieNeeds || 2000,
                macroRatio: userData.nutritionProfile?.macroRatio || {
                    protein: 30,
                    carbs: 40,
                    fat: 30
                },
                compliance: userData.nutritionProfile?.compliance || 100
            });
        } catch (err) {
            console.error('Error fetching user data:', err);
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/auth');
            } else if (err.code === 'ERR_NETWORK') {
                setError('Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.');
            } else {
                setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải dữ liệu người dùng. Vui lòng thử lại sau.');
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    const fetchMenuByDate = useCallback(async (date) => {
        if (!user) return;
        const res = await getMenuByDate(user._id || user.id || user.email, date);
        setMenuByDate(prev => ({ ...prev, [date]: res?.menu || null }));
    }, [user]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/auth');
            return;
        }
        fetchUserData();
    }, [fetchUserData, navigate]);

    useEffect(() => {
        const fetchNotifications = async () => {
            const userId = user?._id || user?.id || "684420787ed1e6d050098cc4";
            if (!userId) return;
            try {
                const data = await getNotifications(userId);
                console.log("Fetched notifications:", data);
                setNotifications(data);
            } catch (err) {
                console.error("Error fetching notifications:", err);
            }
        };
        fetchNotifications();
    }, [user]);

    useEffect(() => {
        console.log('Dashboard selectedDate changed:', selectedDate, typeof selectedDate, selectedDate instanceof Date ? selectedDate.toISOString() : 'Không phải Date');
    }, [selectedDate]);

    // Memoize handlers
    const handleLogout = useCallback(() => {
        logout();
        navigate('/');
    }, [navigate]);

    const handleProfileSubmit = useCallback(async (e) => {
        console.log('==> handleProfileSubmit CALLED');
        e.preventDefault();
        try {
            console.log('profileForm:', profileForm);
            if (!profileForm.age || !profileForm.weight || !profileForm.height || !profileForm.gender || !profileForm.activityLevel || !profileForm.goals) {
                console.log('==> Thiếu trường bắt buộc!');
                setNotifications(prev => [...prev, {
                    id: Date.now(),
                    message: 'Vui lòng điền đầy đủ thông tin bắt buộc',
                    time: new Date().toLocaleTimeString()
                }]);
                return;
            }

            // Calculate daily calorie needs based on user data
            const weight = Number(profileForm.weight);
            const height = Number(profileForm.height);
            const age = Number(profileForm.age);
            const gender = profileForm.gender;
            const activityLevel = profileForm.activityLevel;

            // Calculate BMR using Mifflin-St Jeor Equation
            let bmr;
            if (gender === 'male') {
                bmr = 10 * weight + 6.25 * height - 5 * age + 5;
            } else {
                bmr = 10 * weight + 6.25 * height - 5 * age - 161;
            }

            // Apply activity multiplier
            const activityMultipliers = {
                sedentary: 1.2,
                active: 1.55,
                veryActive: 1.9
            };

            const tdee = bmr * activityMultipliers[activityLevel];

            // Adjust based on goals
            let dailyCalorieNeeds;
            switch (profileForm.goals) {
                case 'weight_loss':
                    dailyCalorieNeeds = tdee - 500; // 500 calorie deficit
                    break;
                case 'muscle_gain':
                    dailyCalorieNeeds = tdee + 300; // 300 calorie surplus
                    break;
                default:
                    dailyCalorieNeeds = tdee; // maintenance
            }

            // Calculate macro ratios based on goals
            let macroRatio;
            switch (profileForm.goals) {
                case 'weight_loss':
                    macroRatio = {
                        protein: 40, // Higher protein for weight loss
                        carbs: 30,
                        fat: 30
                    };
                    break;
                case 'muscle_gain':
                    macroRatio = {
                        protein: 35,
                        carbs: 45, // Higher carbs for muscle gain
                        fat: 20
                    };
                    break;
                default:
                    macroRatio = {
                        protein: 30,
                        carbs: 40,
                        fat: 30
                    };
            }

            // Convert numeric values and prepare form data
            const formData = {
                ...profileForm,
                age: Number(profileForm.age),
                weight: Number(profileForm.weight),
                height: Number(profileForm.height),
                medicalConditions: profileForm.medicalConditions || [],
                preferences: profileForm.preferences || [],
                restrictions: profileForm.restrictions || [],
                dailyCalorieNeeds: Math.round(dailyCalorieNeeds),
                macroRatio,
                compliance: 100 // Default compliance
            };

            console.log('Submitting profile form:', formData);
            const response = await updateProfile(formData);
            console.log('Update profile response:', response);

            if (response.profile) {
                // Update all user data fields, not just nutritionProfile
                setUser(prev => ({
                    ...prev,
                    weight: response.profile.weight,
                    height: response.profile.height,
                    goals: response.profile.goals,
                    nutritionProfile: response.profile
                }));
                setIsEditingProfile(false);
                setNotifications(prev => [...prev, {
                    id: Date.now(),
                    message: 'Cập nhật hồ sơ thành công!',
                    time: new Date().toLocaleTimeString()
                }]);
            } else {
                throw new Error('Không nhận được dữ liệu profile từ server');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.details ?
                Object.values(error.response.data.details).filter(Boolean).join(', ') :
                'Có lỗi xảy ra khi cập nhật hồ sơ';

            setNotifications(prev => [...prev, {
                id: Date.now(),
                message: errorMessage,
                time: new Date().toLocaleTimeString()
            }]);
        }
    }, [profileForm]);

    const handleAiChat = (e) => {
        e.preventDefault();
        if (!aiMessage.trim()) return;

        const newMessage = {
            id: Date.now(),
            text: aiMessage,
            sender: 'user',
            time: new Date().toLocaleTimeString()
        };

        setChatHistory(prev => [...prev, newMessage]);
        setAiMessage('');

        // TODO: Implement AI response
        setTimeout(() => {
            const aiResponse = {
                id: Date.now() + 1,
                text: 'Tôi đang phân tích câu hỏi của bạn...',
                sender: 'ai',
                time: new Date().toLocaleTimeString()
            };
            setChatHistory(prev => [...prev, aiResponse]);
        }, 1000);
    };

    const handleSectionChange = useCallback((section) => {
        startTransition(() => {
            setActiveSection(section);
        });
    }, []);

    // Memoize section rendering
    const renderSection = useCallback(() => {
        switch (activeSection) {
            case 'overview':
                return (
                    <Suspense fallback={<SectionLoading />}>
                        <OverviewSection user={user} />
                    </Suspense>
                );
            case 'nutrition':
                return (
                    <Suspense fallback={<SectionLoading />}>
                        <NutritionSection user={user} />
                    </Suspense>
                );
            case 'menu':
                return (
                    <Suspense fallback={<SectionLoading />}>
                        <MenuSection
                            user={user}
                            menuByDate={menuByDate}
                            setMenuByDate={setMenuByDate}
                            fetchMenuByDate={fetchMenuByDate}
                            selectedDate={selectedDate}
                            setSelectedDate={setSelectedDate}
                        />
                    </Suspense>
                );
            case 'progress':
                return (
                    <Suspense fallback={<SectionLoading />}>
                        <ProgressSection
                            user={user}
                            menuByDate={menuByDate}
                            selectedDate={selectedDate}
                            setSelectedDate={handleSetSelectedDate}
                            fetchMenuByDate={fetchMenuByDate}
                        />
                    </Suspense>
                );
            case 'ai':
                return (
                    <Suspense fallback={<SectionLoading />}>
                        <AISection
                            aiMessage={aiMessage}
                            setAiMessage={setAiMessage}
                            chatHistory={chatHistory}
                            setChatHistory={setChatHistory}
                            handleAiChat={handleAiChat}
                        />
                    </Suspense>
                );
            case 'shopping':
                return (
                    <Suspense fallback={<SectionLoading />}>
                        <ShoppingSection user={user} />
                    </Suspense>
                );
            case 'profile':
                return (
                    <ProfileSection
                        user={user}
                        isEditingProfile={isEditingProfile}
                        setIsEditingProfile={setIsEditingProfile}
                        handleProfileSubmit={handleProfileSubmit}
                        profileForm={profileForm}
                        setProfileForm={setProfileForm}
                    />
                );
            case 'savedMenus':
                return (
                    <Suspense fallback={<SectionLoading />}>
                        <SavedMenusPage user={user} />
                    </Suspense>
                );
            default:
                return null;
        }
    }, [activeSection, isEditingProfile, user, handleProfileSubmit, menuByDate, setMenuByDate, fetchMenuByDate, selectedDate, handleSetSelectedDate]);

    // Memoize the rendered section
    const renderedSection = useMemo(() => renderSection(), [renderSection]);

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <p>Đang tải thông tin...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-error">
                <p>{error}</p>
                <div className="error-actions">
                    <button onClick={() => window.location.reload()}>Thử lại</button>
                    <button onClick={() => navigate('/auth')} className="btn-secondary">Đăng nhập lại</button>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div className="logo">
                    <span style={{ fontWeight: 800, fontSize: 32, color: '#228B22', fontFamily: 'inherit' }}>Smart Nutrition</span>
                </div>
                <div className="header-right">
                    <div className="notifications" style={{ position: 'relative' }}>
                        <i
                            className="fas fa-bell"
                            style={{ cursor: 'pointer' }}
                            onClick={() => setShowNotifications((v) => !v)}
                        ></i>
                        <span className="notification-badge">{notifications.length}</span>
                        {showNotifications && (
                            <NotificationDropdown
                                notifications={notifications}
                                onClose={() => setShowNotifications(false)}
                            />
                        )}
                    </div>
                    <button onClick={handleLogout} className="btn-logout">
                        <i className="fas fa-sign-out-alt"></i> Đăng xuất
                    </button>
                </div>
            </header>

            <main className="dashboard-content">
                <div className="dashboard-sidebar">
                    <div className="user-profile">
                        <img src={user?.avatar} alt="User avatar" className="user-avatar" />
                        <h3>{user?.name}</h3>
                        <p className="user-goal">{user?.nutritionProfile?.goal}</p>
                    </div>
                    <nav className="sidebar-nav">
                        <button
                            className={activeSection === 'overview' ? 'active' : ''}
                            onClick={() => handleSectionChange('overview')}
                        >
                            <i className="fas fa-home"></i> Tổng quan
                        </button>
                        <button
                            className={activeSection === 'nutrition' ? 'active' : ''}
                            onClick={() => handleSectionChange('nutrition')}
                        >
                            <i className="fas fa-utensils"></i> Dinh dưỡng
                        </button>
                        <button
                            className={activeSection === 'menu' ? 'active' : ''}
                            onClick={() => handleSectionChange('menu')}
                        >
                            <i className="fas fa-list"></i> Thực đơn
                        </button>
                        <button
                            className={activeSection === 'progress' ? 'active' : ''}
                            onClick={() => handleSectionChange('progress')}
                        >
                            <i className="fas fa-chart-line"></i> Tiến độ
                        </button>
                        <button
                            className={activeSection === 'ai' ? 'active' : ''}
                            onClick={() => handleSectionChange('ai')}
                        >
                            <i className="fas fa-robot"></i> Tư vấn AI
                        </button>
                        <button
                            className={activeSection === 'shopping' ? 'active' : ''}
                            onClick={() => handleSectionChange('shopping')}
                        >
                            <i className="fas fa-shopping-cart"></i> Mua sắm
                        </button>
                        <button
                            className={activeSection === 'profile' ? 'active' : ''}
                            onClick={() => handleSectionChange('profile')}
                        >
                            <i className="fas fa-user"></i> Hồ sơ cá nhân
                        </button>
                        <button
                            className={activeSection === 'savedMenus' ? 'active' : ''}
                            onClick={() => handleSectionChange('savedMenus')}
                        >
                            <i className="fas fa-folder-open"></i> Thực đơn đã lưu
                        </button>
                    </nav>
                </div>

                <div className="dashboard-main">
                    {isPending ? (
                        <SectionLoading />
                    ) : (
                        renderedSection
                    )}
                </div>
            </main>
        </div>
    );
};

export default React.memo(Dashboard); 