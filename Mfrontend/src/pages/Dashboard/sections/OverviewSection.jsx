import React from 'react';
import './OverviewSection.css';

const OverviewSection = ({ user }) => {
    // Tính toán các chỉ số cơ bản
    const calculateBMI = () => {
        if (!user?.nutritionProfile?.weight || !user?.nutritionProfile?.height) return null;
        const heightInMeters = user.nutritionProfile.height / 100;
        return (user.nutritionProfile.weight / (heightInMeters * heightInMeters)).toFixed(1);
    };

    const getBMICategory = (bmi) => {
        if (!bmi) return 'N/A';
        if (bmi < 18.5) return 'Thiếu cân';
        if (bmi < 25) return 'Bình thường';
        if (bmi < 30) return 'Thừa cân';
        return 'Béo phì';
    };

    const getGoalText = (goal) => {
        switch (goal) {
            case 'weight_loss': return 'Giảm cân';
            case 'muscle_gain': return 'Tăng cơ';
            case 'maintenance': return 'Duy trì';
            default: return 'Chưa cập nhật';
        }
    };

    const getActivityLevelText = (level) => {
        switch (level) {
            case 'sedentary': return 'Ít vận động';
            case 'active': return 'Vận động vừa phải';
            case 'veryActive': return 'Vận động nhiều';
            default: return 'Chưa cập nhật';
        }
    };

    const bmi = calculateBMI();
    const bmiCategory = getBMICategory(bmi);

    // Macro dinh dưỡng tính theo dailyCalorieNeeds và macroRatio
    const totalCalories = user?.nutritionProfile?.dailyCalorieNeeds ?? 2000;
    const macroRatio = user?.nutritionProfile?.macroRatio ?? { protein: 0.2, carbs: 0.55, fat: 0.25 };
    const weight = user?.weight ?? 75;

    // Tính phần trăm (làm tròn đến chữ số thập phân thứ nhất)
    const proteinPercent = Math.round((macroRatio.protein ?? 0) * 1000) / 10;
    const carbsPercent = Math.round((macroRatio.carbs ?? 0) * 1000) / 10;
    const fatPercent = Math.round((macroRatio.fat ?? 0) * 1000) / 10;

    // Tính lượng gram ban đầu
    let proteinGrams = Math.round((macroRatio.protein ?? 0) * totalCalories / 4);
    let carbsGrams = Math.round((macroRatio.carbs ?? 0) * totalCalories / 4);
    let fatGrams = Math.round((macroRatio.fat ?? 0) * totalCalories / 9);

    // Giới hạn protein (1.6-2.2g/kg)
    const minProteinGrams = weight * 1.6; // 120g với 75kg
    const maxProteinGrams = weight * 2.2; // 165g với 75kg
    proteinGrams = Math.min(Math.max(proteinGrams, minProteinGrams), maxProteinGrams);

    // Giới hạn carbs (45-65% tổng calo)
    const minCarbsCalories = 0.45 * totalCalories;
    const maxCarbsCalories = 0.65 * totalCalories;
    const carbsCalories = Math.min(Math.max(carbsGrams * 4, minCarbsCalories), maxCarbsCalories);
    carbsGrams = Math.round(carbsCalories / 4);

    // Giới hạn fat (20-35% tổng calo)
    const minFatCalories = 0.2 * totalCalories;
    const maxFatCalories = 0.35 * totalCalories;
    const fatCalories = Math.min(Math.max(fatGrams * 9, minFatCalories), maxFatCalories);
    fatGrams = Math.round(fatCalories / 9);

    // Điều chỉnh carbs để khớp tổng calo
    const currentTotalCalories = proteinGrams * 4 + carbsGrams * 4 + fatGrams * 9;
    if (Math.abs(currentTotalCalories - totalCalories) > 10) {
        const calorieDiff = totalCalories - (proteinGrams * 4 + fatGrams * 9);
        carbsGrams = Math.max(Math.round(calorieDiff / 4), Math.round(minCarbsCalories / 4));
    }

    // Kết quả cuối cùng
    const macros = {
        protein: proteinGrams,
        carbs: carbsGrams,
        fat: fatGrams
    };
    return (
        <div className="overview-section">
            {/* Welcome Banner */}
            <div className="welcome-banner">
                <h2>Xin chào, {user?.name}!</h2>
                <p>Hãy cùng theo dõi hành trình dinh dưỡng của bạn</p>
            </div>

            {/* Quick Stats */}
            <div className="quick-stats">
                <div className="stat-card">
                    <i className="fas fa-weight"></i>
                    <div className="stat-info">
                        <h3>Cân nặng hiện tại</h3>
                        <p>{user?.nutritionProfile?.weight ? `${user.nutritionProfile.weight} kg` : 'Chưa cập nhật'}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <i className="fas fa-ruler-vertical"></i>
                    <div className="stat-info">
                        <h3>Chiều cao</h3>
                        <p>{user?.nutritionProfile?.height ? `${user.nutritionProfile.height} cm` : 'Chưa cập nhật'}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <i className="fas fa-calculator"></i>
                    <div className="stat-info">
                        <h3>Chỉ số BMI</h3>
                        <p>{bmi ? `${bmi} (${bmiCategory})` : 'Chưa cập nhật'}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <i className="fas fa-bullseye"></i>
                    <div className="stat-info">
                        <h3>Mục tiêu</h3>
                        <p>{getGoalText(user?.nutritionProfile?.goals)}</p>
                    </div>
                </div>
            </div>

            {/* Today's Summary */}
            <div className="today-summary">
                <h2>Tổng quan hôm nay</h2>
                <div className="summary-grid">
                    <div className="summary-card">
                        <h3>Lượng calo</h3>
                        <div className="summary-content">
                            <div className="summary-value">
                                <span className="value">{user?.nutritionProfile?.caloriesToday ?? 0}</span>
                                <span className="unit">kcal</span>
                            </div>
                            <div className="summary-target">
                                <span>Mục tiêu: {user?.nutritionProfile?.dailyCalorieNeeds ?? 2000} kcal</span>
                                <div className="progress-bar">
                                    <div className="progress" style={{ width: `${user?.nutritionProfile?.caloriesToday && user?.nutritionProfile?.dailyCalorieNeeds ? Math.min(100, (user.nutritionProfile.caloriesToday / user.nutritionProfile.dailyCalorieNeeds) * 100) : 0}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="summary-card">
                        <h3>Macro dinh dưỡng</h3>
                        <div className="summary-content">
                            <div className="macro-item">
                                <span className="macro-label">Protein</span>
                                <div className="progress-bar">
                                    <div className="progress protein" style={{ width: `${proteinPercent}%` }}></div>
                                </div>
                                <span className="macro-value">{proteinGrams}g ({proteinPercent}%)</span>
                            </div>
                            <div className="macro-item">
                                <span className="macro-label">Carbs</span>
                                <div className="progress-bar">
                                    <div className="progress carbs" style={{ width: `${carbsPercent}%` }}></div>
                                </div>
                                <span className="macro-value">{carbsGrams}g ({carbsPercent}%)</span>
                            </div>
                            <div className="macro-item">
                                <span className="macro-label">Fat</span>
                                <div className="progress-bar">
                                    <div className="progress fat" style={{ width: `${fatPercent}%` }}></div>
                                </div>
                                <span className="macro-value">{fatGrams}g ({fatPercent}%)</span>
                            </div>
                        </div>
                    </div>

                    <div className="summary-card">
                        <h3>Hoạt động</h3>
                        <div className="summary-content">
                            <div className="activity-item">
                                <i className="fas fa-walking"></i>
                                <span>Bước chân: 0</span>
                            </div>
                            <div className="activity-item">
                                <i className="fas fa-fire"></i>
                                <span>Calo đốt cháy: 0 kcal</span>
                            </div>
                            <div className="activity-item">
                                <i className="fas fa-glass-water"></i>
                                <span>Nước uống: 0 ml</span>
                            </div>
                        </div>
                    </div>

                    <div className="summary-card">
                        <h3>Thực đơn hôm nay</h3>
                        <div className="summary-content">
                            <div className="meal-item">
                                <span className="meal-time">Bữa sáng</span>
                                <span className="meal-status">Chưa cập nhật</span>
                            </div>
                            <div className="meal-item">
                                <span className="meal-time">Bữa trưa</span>
                                <span className="meal-status">Chưa cập nhật</span>
                            </div>
                            <div className="meal-item">
                                <span className="meal-time">Bữa tối</span>
                                <span className="meal-status">Chưa cập nhật</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <h2>Thao tác nhanh</h2>
                <div className="actions-grid">
                    <button className="action-button">
                        <i className="fas fa-utensils"></i>
                        <span>Thêm bữa ăn</span>
                    </button>
                    <button className="action-button">
                        <i className="fas fa-weight"></i>
                        <span>Cập nhật cân nặng</span>
                    </button>
                    <button className="action-button">
                        <i className="fas fa-robot"></i>
                        <span>Tư vấn AI</span>
                    </button>
                    <button className="action-button">
                        <i className="fas fa-shopping-cart"></i>
                        <span>Danh sách mua sắm</span>
                    </button>
                </div>
            </div>

            {/* Health Tips */}
            <div className="health-tips">
                <h2>Lời khuyên sức khỏe</h2>
                <div className="tips-grid">
                    <div className="tip-card">
                        <i className="fas fa-apple-alt"></i>
                        <h3>Ăn uống lành mạnh</h3>
                        <p>Tăng cường rau xanh và trái cây trong bữa ăn hàng ngày</p>
                    </div>
                    <div className="tip-card">
                        <i className="fas fa-glass-water"></i>
                        <h3>Uống đủ nước</h3>
                        <p>Uống ít nhất 2 lít nước mỗi ngày để duy trì sức khỏe</p>
                    </div>
                    <div className="tip-card">
                        <i className="fas fa-bed"></i>
                        <h3>Ngủ đủ giấc</h3>
                        <p>Ngủ 7-8 tiếng mỗi đêm để cơ thể phục hồi tốt nhất</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OverviewSection; 