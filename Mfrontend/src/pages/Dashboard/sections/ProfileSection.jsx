import React, { useCallback, useMemo, useState } from 'react';
import './ProfileSection.css';
import { changePassword } from '../../../services/api';

const ChangePasswordModal = ({ onClose, onSubmit }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Mật khẩu mới không khớp.');
            return;
        }
        if (newPassword.length < 6) {
            setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
            return;
        }
        setError('');
        onSubmit({ currentPassword, newPassword });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Đổi mật khẩu</h3>
                <form onSubmit={handleSubmit}>
                    {error && <p className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
                    <div className="form-group">
                        <label className="form-label">Mật khẩu hiện tại</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="form-input"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Mật khẩu mới</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="form-input"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Xác nhận mật khẩu mới</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="form-input"
                            required
                        />
                    </div>
                    <div className="form-actions" style={{ marginTop: '1.5rem' }}>
                        <button type="submit" className="btn-primary">Xác nhận</button>
                        <button type="button" className="btn-secondary" onClick={onClose}>Hủy</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ProfileSection = React.memo(({
    user,
    isEditingProfile,
    setIsEditingProfile,
    handleProfileSubmit,
    profileForm,
    setProfileForm,
}) => {
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });

    const profile = user?.nutritionProfile || {};

    const handleEdit = useCallback(() => {
        setIsEditingProfile(true);
    }, [setIsEditingProfile]);

    const handleChangePasswordSubmit = async (passwords) => {
        try {
            const response = await changePassword(passwords);
            setNotification({ message: response.message || 'Đổi mật khẩu thành công!', type: 'success' });
            setShowChangePassword(false);
        } catch (err) {
            setNotification({ message: err.response?.data?.message || 'Đổi mật khẩu thất bại.', type: 'error' });
        } finally {
            setTimeout(() => setNotification({ message: '', type: '' }), 3000);
        }
    };

    const getGoalText = (goal) => {
        switch (goal) {
            case 'weight_loss':
                return 'Giảm cân';
            case 'muscle_gain':
                return 'Tăng cơ';
            case 'maintenance':
                return 'Duy trì';
            default:
                return 'Chưa cập nhật';
        }
    };

    const getActivityLevelText = (level) => {
        switch (level) {
            case 'sedentary':
                return 'Ít vận động';
            case 'active':
                return 'Vận động vừa phải';
            case 'veryActive':
                return 'Vận động nhiều';
            default:
                return 'Chưa cập nhật';
        }
    };

    const memoizedPreferences = useMemo(() =>
        profile.preferences?.slice(0, 5).map((pref, index) => (
            <span key={index} className="preference-tag">{pref}</span>
        )) || []
        , [profile.preferences]);

    const memoizedRestrictions = useMemo(() =>
        profile.restrictions?.slice(0, 5).map((rest, index) => (
            <span key={index} className="restriction-tag">{rest}</span>
        )) || []
        , [profile.restrictions]);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileForm((prev) => ({
                    ...prev,
                    avatar: reader.result,
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="profile-section">
            <div className="section-header">
                <h2 className="section-title">Hồ sơ cá nhân</h2>
                {!isEditingProfile && (
                    <button className="btn-edit" onClick={handleEdit}>
                        <i className="fas fa-edit"></i> Chỉnh sửa
                    </button>
                )}
            </div>
            {isEditingProfile ? (
                <form onSubmit={handleProfileSubmit} className="profile-form">
                    <div className="form-group">
                        <label className="form-label">Ảnh đại diện</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="form-input"
                        />
                        {profileForm.avatar && (
                            <img
                                src={profileForm.avatar}
                                alt="Avatar preview"
                                style={{ width: 80, height: 80, borderRadius: '50%', marginTop: 8 }}
                            />
                        )}
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Tuổi</label>
                            <input
                                type="number"
                                value={profileForm.age}
                                onChange={(e) => setProfileForm((prev) => ({ ...prev, age: e.target.value }))}
                                min="1"
                                max="120"
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Cân nặng (kg)</label>
                            <input
                                type="number"
                                value={profileForm.weight}
                                onChange={(e) => setProfileForm((prev) => ({ ...prev, weight: e.target.value }))}
                                min="20"
                                max="300"
                                step="0.1"
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Chiều cao (cm)</label>
                            <input
                                type="number"
                                value={profileForm.height}
                                onChange={(e) => setProfileForm((prev) => ({ ...prev, height: e.target.value }))}
                                min="100"
                                max="250"
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Giới tính</label>
                            <select
                                value={profileForm.gender}
                                onChange={(e) => setProfileForm((prev) => ({ ...prev, gender: e.target.value }))}
                                className="form-input"
                            >
                                <option value="">Chọn giới tính</option>
                                <option value="male">Nam</option>
                                <option value="female">Nữ</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Mức độ hoạt động</label>
                            <select
                                value={profileForm.activityLevel}
                                onChange={(e) => setProfileForm((prev) => ({ ...prev, activityLevel: e.target.value }))}
                                className="form-input"
                            >
                                <option value="">Chọn mức độ</option>
                                <option value="sedentary">Ít vận động</option>
                                <option value="active">Vận động vừa phải</option>
                                <option value="veryActive">Vận động nhiều</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Mục tiêu</label>
                            <select
                                value={profileForm.goals}
                                onChange={(e) => setProfileForm((prev) => ({ ...prev, goals: e.target.value }))}
                                className="form-input"
                            >
                                <option value="">Chọn mục tiêu</option>
                                <option value="weight_loss">Giảm cân</option>
                                <option value="muscle_gain">Tăng cơ</option>
                                <option value="maintenance">Duy trì</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-section">
                        <h3 className="section-subtitle">Tình trạng sức khỏe</h3>
                        <div className="checkbox-group">
                            {['diabetes', 'heart_disease', 'allergy', 'none'].map((condition) => (
                                <label key={condition} className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={profileForm.medicalConditions.includes(condition)}
                                        onChange={(e) => {
                                            const newConditions = e.target.checked
                                                ? [...profileForm.medicalConditions, condition]
                                                : profileForm.medicalConditions.filter((c) => c !== condition);
                                            setProfileForm((prev) => ({ ...prev, medicalConditions: newConditions }));
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
                        <h3 className="section-subtitle">Sở thích và hạn chế</h3>
                        <div className="form-group">
                            <label className="form-label">Sở thích (phân cách bằng dấu phẩy)</label>
                            <input
                                type="text"
                                value={profileForm.preferences.join(', ')}
                                onChange={(e) => setProfileForm((prev) => ({
                                    ...prev,
                                    preferences: e.target.value.split(',').map((p) => p.trim()).filter((p) => p),
                                }))}
                                placeholder="Ví dụ: Ăn chay, Ít cay, Không đường"
                                className="form-input"
                                maxLength={50}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Hạn chế (phân cách bằng dấu phẩy)</label>
                            <input
                                type="text"
                                value={profileForm.restrictions.join(', ')}
                                onChange={(e) => setProfileForm((prev) => ({
                                    ...prev,
                                    restrictions: e.target.value.split(',').map((r) => r.trim()).filter((r) => r),
                                }))}
                                placeholder="Ví dụ: Không hải sản, Không sữa"
                                className="form-input"
                                maxLength={50}
                            />
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn-primary">
                            Lưu thay đổi
                        </button>
                        <button type="button" className="btn-secondary" onClick={() => setIsEditingProfile(false)}>
                            Hủy
                        </button>
                    </div>
                </form>
            ) : (
                <div className="profile-card">
                    {notification.message && (
                        <div className={`profile-notification ${notification.type}`}>
                            {notification.message}
                        </div>
                    )}
                    <div className="profile-header">
                        <div className="avatar-wrap">
                            <img src={user?.avatar || '/default-avatar.png'} alt="Avatar" className="profile-avatar" />
                        </div>
                        <div className="profile-main-info">
                            <h2 className="profile-name">{user?.name || 'Chưa cập nhật'}</h2>
                            <div className="profile-email">
                                <i className="fas fa-envelope"></i> {user?.email || 'Chưa cập nhật'}
                            </div>
                        </div>
                    </div>
                    <div className="profile-sections">
                        <div className="profile-section">
                            <h3><i className="fas fa-user"></i> Thông tin cơ bản</h3>
                            <div className="info-list">
                                <div className="info-row"><span className="info-label">Tuổi:</span><span className="info-value">{profile.age || 'Chưa cập nhật'}</span></div>
                                <div className="info-row"><span className="info-label">Giới tính:</span><span className="info-value">{profile.gender === 'male' ? 'Nam' : profile.gender === 'female' ? 'Nữ' : 'Chưa cập nhật'}</span></div>
                                <div className="info-row"><span className="info-label">Cân nặng:</span><span className="info-value">{profile.weight ? `${profile.weight} kg` : 'Chưa cập nhật'}</span></div>
                                <div className="info-row"><span className="info-label">Chiều cao:</span><span className="info-value">{profile.height ? `${profile.height} cm` : 'Chưa cập nhật'}</span></div>
                            </div>
                        </div>
                        <div className="profile-section">
                            <h3><i className="fas fa-apple-alt"></i> Dinh dưỡng</h3>
                            <div className="info-list">
                                <div className="info-row"><span className="info-label">Mục tiêu:</span><span className="info-value">{getGoalText(profile.goals)}</span></div>
                                <div className="info-row"><span className="info-label">Mức độ hoạt động:</span><span className="info-value">{getActivityLevelText(profile.activityLevel)}</span></div>
                                <div className="info-row"><span className="info-label">Calo cần thiết/ngày:</span><span className="info-value">{profile.dailyCalorieNeeds ? `${profile.dailyCalorieNeeds} kcal` : 'Chưa cập nhật'}</span></div>
                            </div>
                        </div>
                        {profile.preferences?.length > 0 && (
                            <div className="profile-section">
                                <h3><i className="fas fa-star"></i> Sở thích</h3>
                                <div className="info-list">
                                    <div className="info-row"><span className="info-label">Danh sách:</span><span className="info-value">{profile.preferences.join(', ')}</span></div>
                                </div>
                            </div>
                        )}
                        {profile.restrictions?.length > 0 && (
                            <div className="profile-section">
                                <h3><i className="fas fa-ban"></i> Hạn chế</h3>
                                <div className="info-list">
                                    <div className="info-row"><span className="info-label">Danh sách:</span><span className="info-value">{profile.restrictions.join(', ')}</span></div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="profile-actions">
                        <button className="btn-secondary" onClick={() => setShowChangePassword(true)}>
                            <i className="fas fa-key"></i> Đổi mật khẩu
                        </button>
                    </div>
                </div>
            )}
            {showChangePassword && (
                <ChangePasswordModal
                    onClose={() => setShowChangePassword(false)}
                    onSubmit={handleChangePasswordSubmit}
                />
            )}
        </div>
    );
});

export default ProfileSection;