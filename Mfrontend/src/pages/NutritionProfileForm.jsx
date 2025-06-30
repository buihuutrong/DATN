import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from '../services/api';
import './NutritionProfileForm.css';

const NutritionProfileForm = ({ onSkip, user }) => {
    const [formData, setFormData] = useState({
        age: '',
        weight: '',
        height: '',
        gender: '',
        activityLevel: '',
        goal: '',
        restrictions: [],
        preferences: [],
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Validation states
    const [errors, setErrors] = useState({});

    useEffect(() => {
        // Animation fade-in sử dụng CSS class
        const form = document.querySelector('.profile-form');
        if (form) {
            form.classList.add('fade-in');
        }
    }, []);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.age || formData.age < 1 || formData.age > 120) {
            newErrors.age = 'Tuổi phải từ 1 đến 120.';
        }
        if (!formData.weight || formData.weight <= 0) {
            newErrors.weight = 'Cân nặng phải lớn hơn 0.';
        }
        if (!formData.height || formData.height <= 0) {
            newErrors.height = 'Chiều cao phải lớn hơn 0.';
        }
        if (!formData.gender) {
            newErrors.gender = 'Vui lòng chọn giới tính.';
        }
        if (!formData.activityLevel) {
            newErrors.activityLevel = 'Vui lòng chọn mức độ hoạt động.';
        }
        if (!formData.goal) {
            newErrors.goal = 'Vui lòng chọn mục tiêu.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setFormData((prev) => ({
                ...prev,
                [name]: checked
                    ? [...prev[name], value]
                    : prev[name].filter((item) => item !== value),
            }));
        } else if (name === 'allergies') {
            // Xử lý dropdown allergies - thêm vào restrictions
            setFormData((prev) => {
                const newRestrictions = prev.restrictions.filter(item =>
                    !['gluten_free', 'no_dairy', 'no_seafood', 'no_peanuts', 'no_eggs', 'no_nuts', 'no_soy', 'none'].includes(item)
                );
                if (value && value !== 'none') {
                    newRestrictions.push(value);
                }
                return {
                    ...prev,
                    restrictions: newRestrictions
                };
            });
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
        // Xóa lỗi khi người dùng chỉnh sửa
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            await updateProfile({
                age: Number(formData.age),
                weight: Number(formData.weight),
                height: Number(formData.height),
                gender: formData.gender,
                activityLevel: formData.activityLevel,
                goals: formData.goal,
                restrictions: formData.restrictions,
                preferences: formData.preferences,
            });
            setSuccess('Cập nhật hồ sơ thành công!');
            setTimeout(() => {
                navigate('/dashboard');
            }, 1200);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                'Có lỗi xảy ra, vui lòng thử lại.'
            );
            console.error('Error updating profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = () => {
        if (window.confirm('Bạn có chắc muốn bỏ qua? Dữ liệu sẽ không được lưu.')) {
            onSkip();
        }
    };

    return (
        <div className="profile-form">
            <h2>Khởi tạo hành trình dinh dưỡng của bạn</h2>
            <p>Hãy cung cấp thông tin để chúng tôi hỗ trợ tốt nhất!</p>

            <form onSubmit={handleSubmit}>
                {/* Thông báo */}
                {error && <div className="alert error">{error}</div>}
                {success && <div className="alert success">{success}</div>}

                {/* Thông tin cơ bản */}
                <div className="form-section">
                    <h3><i className="fas fa-user"></i> Thông tin cơ bản</h3>
                    <div className="input-group">
                        <label>Tuổi</label>
                        <input
                            type="number"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            placeholder="Nhập tuổi"
                            min="1"
                            max="120"
                            required
                        />
                        {errors.age && <div className="error-message">{errors.age}</div>}
                    </div>
                    <div className="input-group">
                        <label><i className="fas fa-weight"></i> Cân nặng (kg)</label>
                        <input
                            type="number"
                            name="weight"
                            value={formData.weight}
                            onChange={handleChange}
                            placeholder="Nhập cân nặng"
                            step="0.1"
                            required
                        />
                        {errors.weight && <div className="error-message">{errors.weight}</div>}
                    </div>
                    <div className="input-group">
                        <label><i className="fas fa-ruler-vertical"></i> Chiều cao (cm)</label>
                        <input
                            type="number"
                            name="height"
                            value={formData.height}
                            onChange={handleChange}
                            placeholder="Nhập chiều cao"
                            step="0.1"
                            required
                        />
                        {errors.height && <div className="error-message">{errors.height}</div>}
                    </div>
                    <div className="input-group">
                        <label><i className="fas fa-venus-mars"></i> Giới tính</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Chọn giới tính</option>
                            <option value="male">Nam</option>
                            <option value="female">Nữ</option>
                        </select>
                        {errors.gender && <div className="error-message">{errors.gender}</div>}
                    </div>
                </div>

                {/* Mục tiêu và hoạt động */}
                <div className="form-section">
                    <h3><i className="fas fa-bullseye"></i> Mục tiêu & Lối sống</h3>
                    <div className="input-group">
                        <label><i className="fas fa-walking"></i> Mức độ hoạt động</label>
                        <select
                            name="activityLevel"
                            value={formData.activityLevel}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Chọn mức độ hoạt động</option>
                            <option value="sedentary">Ít vận động (làm việc văn phòng)</option>
                            <option value="active">Vận động vừa (tập 3-5 ngày/tuần)</option>
                            <option value="veryActive">Vận động nhiều (tập 6-7 ngày/tuần)</option>
                        </select>
                        {errors.activityLevel && <div className="error-message">{errors.activityLevel}</div>}
                    </div>
                    <div className="input-group">
                        <label><i className="fas fa-flag-checkered"></i> Mục tiêu chính</label>
                        <select
                            name="goal"
                            value={formData.goal}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Chọn mục tiêu</option>
                            <option value="weight_loss">Giảm cân</option>
                            <option value="maintenance">Duy trì cân nặng</option>
                            <option value="muscle_gain">Tăng cơ</option>
                        </select>
                        {errors.goal && <div className="error-message">{errors.goal}</div>}
                    </div>
                </div>

                {/* Hạn chế */}
                <div className="form-section">
                    <h3><i className="fas fa-ban"></i> Hạn chế (Chọn nếu có)</h3>

                    {/* Bệnh lý */}
                    <div className="input-group">
                        <label><i className="fas fa-heartbeat"></i> Bệnh lý</label>
                        <div className="checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    name="restrictions"
                                    value="diabetes"
                                    onChange={handleChange}
                                /> Tiểu đường
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    name="restrictions"
                                    value="heart_disease"
                                    onChange={handleChange}
                                /> Tim mạch
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    name="restrictions"
                                    value="kidney_disease"
                                    onChange={handleChange}
                                /> Bệnh thận
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    name="restrictions"
                                    value="hypertension"
                                    onChange={handleChange}
                                /> Huyết áp cao
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    name="restrictions"
                                    value="high_cholesterol"
                                    onChange={handleChange}
                                /> Cholesterol cao
                            </label>
                        </div>
                    </div>

                    {/* Dị ứng */}
                    <div className="input-group">
                        <label><i className="fas fa-allergies"></i> Dị ứng thực phẩm</label>
                        <select
                            name="allergies"
                            value={formData.restrictions.find(item =>
                                ['gluten_free', 'no_dairy', 'no_seafood', 'no_peanuts', 'no_eggs', 'no_nuts', 'no_soy'].includes(item)
                            ) || ''}
                            onChange={handleChange}
                        >
                            <option value="">Chọn dị ứng (nếu có)</option>
                            <option value="gluten_free">Không gluten</option>
                            <option value="no_dairy">Không sữa</option>
                            <option value="no_seafood">Không hải sản</option>
                            <option value="no_peanuts">Không đậu phộng</option>
                            <option value="no_eggs">Không trứng</option>
                            <option value="no_nuts">Không các loại hạt</option>
                            <option value="no_soy">Không đậu nành</option>
                            <option value="none">Không có dị ứng</option>
                        </select>
                    </div>
                </div>

                {/* Sở thích */}
                <div className="form-section">
                    <h3><i className="fas fa-heart"></i> Sở thích (Chọn món yêu thích)</h3>
                    <div className="checkbox-group">
                        <label>
                            <input
                                type="checkbox"
                                name="preferences"
                                value="chicken"
                                onChange={handleChange}
                            /> Gà
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                name="preferences"
                                value="beef"
                                onChange={handleChange}
                            /> Thịt bò
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                name="preferences"
                                value="fish"
                                onChange={handleChange}
                            /> Cá
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                name="preferences"
                                value="eggs"
                                onChange={handleChange}
                            /> Trứng
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                name="preferences"
                                value="vegetables"
                                onChange={handleChange}
                            /> Rau củ
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                name="preferences"
                                value="fruits"
                                onChange={handleChange}
                            /> Trái cây
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                name="preferences"
                                value="tofu"
                                onChange={handleChange}
                            /> Đậu phụ
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                name="preferences"
                                value="seafood"
                                onChange={handleChange}
                            /> Hải sản
                        </label>
                    </div>
                </div>

                <div className="buttons">
                    <button type="button" className="btn btn-skip" onClick={handleSkip}>
                        Bỏ qua
                    </button>
                    <button type="submit" className="btn btn-save" disabled={loading}>
                        {loading ? 'Đang lưu...' : 'Lưu và tiếp tục'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NutritionProfileForm;