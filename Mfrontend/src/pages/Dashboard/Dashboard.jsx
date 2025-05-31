import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getUser, updateProfile } from '../../services/api';
import './Dashboard.css';
import SavedMenusPage from './sections/SavedMenusPage';

// Lazy load all sections
const OverviewSection = lazy(() => import('./sections/OverviewSection'));
const NutritionSection = lazy(() => import('./sections/NutritionSection'));
const MenuSection = lazy(() => import('./sections/MenuSection'));
const ProgressSection = lazy(() => import('./sections/ProgressSection'));
const AISection = lazy(() => import('./sections/AISection'));
const ShoppingSection = lazy(() => import('./sections/ShoppingSection'));
const CommunitySection = lazy(() => import('./sections/CommunitySection'));

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
    const [activeSection, setActiveSection] = useState('nutrition'); // Default active section
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

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/auth');
            return;
        }

        const fetchUserData = async () => {
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
        };

        fetchUserData();
    }, [navigate]);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        try {
            // Validate form data
            if (!profileForm.age || !profileForm.weight || !profileForm.height || !profileForm.gender || !profileForm.activityLevel || !profileForm.goals) {
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
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

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

    const renderSection = () => {
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
                        <MenuSection user={user} />
                    </Suspense>
                );
            case 'progress':
                console.log('ProgressSection rendered with user:', user);
                return (
                    <Suspense fallback={<SectionLoading />}>
                        <ProgressSection user={user} />
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
            case 'community':
                return (
                    <Suspense fallback={<SectionLoading />}>
                        <CommunitySection user={user} />
                    </Suspense>
                );
            case 'profile':
                return (
                    <div className="profile-section">
                        <div className="section-header">
                            <h2>Hồ sơ cá nhân</h2>
                            <button
                                className="btn-secondary"
                                onClick={() => setIsEditingProfile(!isEditingProfile)}
                            >
                                {isEditingProfile ? 'Hủy' : 'Chỉnh sửa'}
                            </button>
                        </div>

                        {isEditingProfile ? (
                            <form onSubmit={handleProfileSubmit} className="profile-form">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Tuổi</label>
                                        <input
                                            type="number"
                                            value={profileForm.age}
                                            onChange={(e) => setProfileForm(prev => ({
                                                ...prev,
                                                age: e.target.value
                                            }))}
                                            min="1"
                                            max="120"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Cân nặng (kg)</label>
                                        <input
                                            type="number"
                                            value={profileForm.weight}
                                            onChange={(e) => setProfileForm(prev => ({
                                                ...prev,
                                                weight: e.target.value
                                            }))}
                                            min="20"
                                            max="300"
                                            step="0.1"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Chiều cao (cm)</label>
                                        <input
                                            type="number"
                                            value={profileForm.height}
                                            onChange={(e) => setProfileForm(prev => ({
                                                ...prev,
                                                height: e.target.value
                                            }))}
                                            min="100"
                                            max="250"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Giới tính</label>
                                        <select
                                            value={profileForm.gender}
                                            onChange={(e) => setProfileForm(prev => ({
                                                ...prev,
                                                gender: e.target.value
                                            }))}
                                        >
                                            <option value="">Chọn giới tính</option>
                                            <option value="male">Nam</option>
                                            <option value="female">Nữ</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Mức độ hoạt động</label>
                                        <select
                                            value={profileForm.activityLevel}
                                            onChange={(e) => setProfileForm(prev => ({
                                                ...prev,
                                                activityLevel: e.target.value
                                            }))}
                                        >
                                            <option value="">Chọn mức độ</option>
                                            <option value="sedentary">Ít vận động</option>
                                            <option value="active">Vận động vừa phải</option>
                                            <option value="veryActive">Vận động nhiều</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Mục tiêu</label>
                                        <select
                                            value={profileForm.goals}
                                            onChange={(e) => setProfileForm(prev => ({
                                                ...prev,
                                                goals: e.target.value
                                            }))}
                                        >
                                            <option value="">Chọn mục tiêu</option>
                                            <option value="weight_loss">Giảm cân</option>
                                            <option value="muscle_gain">Tăng cơ</option>
                                            <option value="maintenance">Duy trì</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-section">
                                    <h3>Tình trạng sức khỏe</h3>
                                    <div className="checkbox-group">
                                        {['diabetes', 'heart_disease', 'allergy', 'none'].map(condition => (
                                            <label key={condition} className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    checked={profileForm.medicalConditions.includes(condition)}
                                                    onChange={(e) => {
                                                        const newConditions = e.target.checked
                                                            ? [...profileForm.medicalConditions, condition]
                                                            : profileForm.medicalConditions.filter(c => c !== condition);
                                                        setProfileForm(prev => ({
                                                            ...prev,
                                                            medicalConditions: newConditions
                                                        }));
                                                    }}
                                                />
                                                {condition === 'diabetes' ? 'Tiểu đường' :
                                                    condition === 'heart_disease' ? 'Bệnh tim' :
                                                        condition === 'allergy' ? 'Dị ứng' : 'Không có'}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-section">
                                    <h3>Sở thích và hạn chế</h3>
                                    <div className="form-group">
                                        <label>Sở thích (phân cách bằng dấu phẩy)</label>
                                        <input
                                            type="text"
                                            value={profileForm.preferences.join(', ')}
                                            onChange={(e) => setProfileForm(prev => ({
                                                ...prev,
                                                preferences: e.target.value.split(',').map(p => p.trim())
                                            }))}
                                            placeholder="Ví dụ: Ăn chay, Ít cay, Không đường"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Hạn chế (phân cách bằng dấu phẩy)</label>
                                        <input
                                            type="text"
                                            value={profileForm.restrictions.join(', ')}
                                            onChange={(e) => setProfileForm(prev => ({
                                                ...prev,
                                                restrictions: e.target.value.split(',').map(r => r.trim())
                                            }))}
                                            placeholder="Ví dụ: Không hải sản, Không sữa"
                                        />
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button type="submit" className="btn-primary">
                                        Lưu thay đổi
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="profile-info">
                                <div className="info-grid">
                                    <div className="info-card">
                                        <h3>Thông tin cơ bản</h3>
                                        <div className="info-item">
                                            <span className="label">Tên:</span>
                                            <span className="value">{user?.name}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Email:</span>
                                            <span className="value">{user?.email}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Tuổi:</span>
                                            <span className="value">{user?.nutritionProfile?.age || 'Chưa cập nhật'} tuổi</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Giới tính:</span>
                                            <span className="value">{user?.nutritionProfile?.gender === 'male' ? 'Nam' : user?.nutritionProfile?.gender === 'female' ? 'Nữ' : 'Chưa cập nhật'}</span>
                                        </div>
                                    </div>

                                    <div className="info-card">
                                        <h3>Thông tin dinh dưỡng</h3>
                                        <div className="info-item">
                                            <span className="label">Cân nặng:</span>
                                            <span className="value">{user?.nutritionProfile?.weight || 'Chưa cập nhật'} kg</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Chiều cao:</span>
                                            <span className="value">{user?.nutritionProfile?.height || 'Chưa cập nhật'} cm</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Nhu cầu calo hàng ngày:</span>
                                            <span className="value">{user?.nutritionProfile?.dailyCalorieNeeds || 'Chưa cập nhật'} kcal</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Tỷ lệ dinh dưỡng:</span>
                                            <span className="value">
                                                {user?.nutritionProfile?.macroRatio ?
                                                    `Protein: ${user.nutritionProfile.macroRatio.protein}%, Carbs: ${user.nutritionProfile.macroRatio.carbs}%, Fat: ${user.nutritionProfile.macroRatio.fat}%`
                                                    : 'Chưa cập nhật'}
                                            </span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Mức độ hoạt động:</span>
                                            <span className="value">
                                                {user?.nutritionProfile?.activityLevel === 'sedentary' ? 'Ít vận động' :
                                                    user?.nutritionProfile?.activityLevel === 'active' ? 'Vận động vừa phải' :
                                                        user?.nutritionProfile?.activityLevel === 'veryActive' ? 'Vận động nhiều' : 'Chưa cập nhật'}
                                            </span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Mục tiêu:</span>
                                            <span className="value">
                                                {user?.nutritionProfile?.goals === 'weight_loss' ? 'Giảm cân' :
                                                    user?.nutritionProfile?.goals === 'muscle_gain' ? 'Tăng cơ' :
                                                        user?.nutritionProfile?.goals === 'maintenance' ? 'Duy trì' : 'Chưa cập nhật'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="info-card">
                                        <h3>Tình trạng sức khỏe</h3>
                                        <div className="info-item">
                                            <span className="label">Bệnh lý:</span>
                                            <span className="value">
                                                {user?.nutritionProfile?.medicalConditions?.length > 0
                                                    ? user.nutritionProfile.medicalConditions.map(condition =>
                                                        condition === 'diabetes' ? 'Tiểu đường' :
                                                            condition === 'heart_disease' ? 'Bệnh tim' :
                                                                condition === 'allergy' ? 'Dị ứng' : 'Không có'
                                                    ).join(', ')
                                                    : 'Chưa cập nhật'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="info-card">
                                        <h3>Sở thích và hạn chế</h3>
                                        <div className="info-item">
                                            <span className="label">Sở thích:</span>
                                            <span className="value">
                                                {user?.nutritionProfile?.preferences?.length > 0
                                                    ? user.nutritionProfile.preferences.join(', ')
                                                    : 'Chưa cập nhật'}
                                            </span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Hạn chế:</span>
                                            <span className="value">
                                                {user?.nutritionProfile?.restrictions?.length > 0
                                                    ? user.nutritionProfile.restrictions.join(', ')
                                                    : 'Chưa cập nhật'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
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
    };

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div className="logo">
                    <img src="/logo.png" alt="Smart Nutrition" />
                    <span>Smart Nutrition</span>
                </div>
                <div className="header-right">
                    <div className="points-display">
                        <i className="fas fa-star"></i>
                        <span>{points} điểm</span>
                    </div>
                    <div className="notifications">
                        <i className="fas fa-bell"></i>
                        <span className="notification-badge">{notifications.length}</span>
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
                            onClick={() => setActiveSection('overview')}
                        >
                            <i className="fas fa-home"></i> Tổng quan
                        </button>
                        <button
                            className={activeSection === 'nutrition' ? 'active' : ''}
                            onClick={() => setActiveSection('nutrition')}
                        >
                            <i className="fas fa-utensils"></i> Dinh dưỡng
                        </button>
                        <button
                            className={activeSection === 'menu' ? 'active' : ''}
                            onClick={() => setActiveSection('menu')}
                        >
                            <i className="fas fa-list"></i> Thực đơn
                        </button>
                        <button
                            className={activeSection === 'progress' ? 'active' : ''}
                            onClick={() => setActiveSection('progress')}
                        >
                            <i className="fas fa-chart-line"></i> Tiến độ
                        </button>
                        <button
                            className={activeSection === 'ai' ? 'active' : ''}
                            onClick={() => setActiveSection('ai')}
                        >
                            <i className="fas fa-robot"></i> Tư vấn AI
                        </button>
                        <button
                            className={activeSection === 'shopping' ? 'active' : ''}
                            onClick={() => setActiveSection('shopping')}
                        >
                            <i className="fas fa-shopping-cart"></i> Mua sắm
                        </button>
                        <button
                            className={activeSection === 'community' ? 'active' : ''}
                            onClick={() => setActiveSection('community')}
                        >
                            <i className="fas fa-users"></i> Cộng đồng
                        </button>
                        <button
                            className={activeSection === 'profile' ? 'active' : ''}
                            onClick={() => setActiveSection('profile')}
                        >
                            <i className="fas fa-user"></i> Hồ sơ cá nhân
                        </button>
                        <button
                            className={activeSection === 'savedMenus' ? 'active' : ''}
                            onClick={() => setActiveSection('savedMenus')}
                        >
                            <i className="fas fa-folder-open"></i> Thực đơn đã lưu
                        </button>
                    </nav>
                </div>

                <div className="dashboard-main">
                    {renderSection()}
                </div>
            </main>
        </div>
    );
};

export default Dashboard; 