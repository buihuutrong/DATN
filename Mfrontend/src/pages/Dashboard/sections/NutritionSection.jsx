import React from 'react';
import './NutritionSection.css';

const NutritionSection = ({ user }) => {
    // Macro dinh dưỡng tính theo dailyCalorieNeeds và macroRatio
    const totalCalories = user?.nutritionProfile?.dailyCalorieNeeds ?? 2000;
    const macroRatio = user?.nutritionProfile?.macroRatio ?? { protein: 0.2, carbs: 0.55, fat: 0.25 };
    const weight = user?.nutritionProfile?.weight ?? 75;

    // Tính phần trăm (làm tròn đến chữ số thập phân thứ nhất)
    const proteinPercent = Math.round((macroRatio.protein ?? 0) * 1000) / 10;
    const carbsPercent = Math.round((macroRatio.carbs ?? 0) * 1000) / 10;
    const fatPercent = Math.round((macroRatio.fat ?? 0) * 1000) / 10;

    // Tính lượng gram ban đầu
    let proteinGrams = Math.round((macroRatio.protein ?? 0) * totalCalories / 4);
    let carbsGrams = Math.round((macroRatio.carbs ?? 0) * totalCalories / 4);
    let fatGrams = Math.round((macroRatio.fat ?? 0) * totalCalories / 9);

    // Giới hạn protein (1.6-2.2g/kg)
    const minProteinGrams = weight * 1.6;
    const maxProteinGrams = weight * 2.2;
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

    // Tính lại kcal
    const proteinCalories = macros.protein * 4;
    const carbsCaloriesFinal = macros.carbs * 4;
    const fatCaloriesFinal = macros.fat * 9;

    const proteinPercentage = totalCalories ? ((proteinCalories / totalCalories) * 100).toFixed(1) : 0;
    const carbsPercentage = totalCalories ? ((carbsCaloriesFinal / totalCalories) * 100).toFixed(1) : 0;
    const fatPercentage = totalCalories ? ((fatCaloriesFinal / totalCalories) * 100).toFixed(1) : 0;

    return (
        <div className="nutrition-section">
            <h2>Hồ sơ dinh dưỡng</h2>
            <div className="nutrition-profile">
                <div className="macro-chart">
                    <div className="macro-distribution">
                        <div className="macro-bar">
                            <div
                                className="macro-segment protein"
                                style={{ width: `${proteinPercentage}%` }}
                            >
                                <span>Protein: {proteinPercentage}%</span>
                            </div>
                            <div
                                className="macro-segment carbs"
                                style={{ width: `${carbsPercentage}%` }}
                            >
                                <span>Carbs: {carbsPercentage}%</span>
                            </div>
                            <div
                                className="macro-segment fat"
                                style={{ width: `${fatPercentage}%` }}
                            >
                                <span>Fat: {fatPercentage}%</span>
                            </div>
                        </div>
                    </div>
                    <div className="macro-legend">
                        <div className="legend-item">
                            <span className="color-dot protein"></span>
                            <span>Protein: {macros.protein}g ({proteinCalories} kcal)</span>
                        </div>
                        <div className="legend-item">
                            <span className="color-dot carbs"></span>
                            <span>Carbs: {macros.carbs}g ({carbsCaloriesFinal} kcal)</span>
                        </div>
                        <div className="legend-item">
                            <span className="color-dot fat"></span>
                            <span>Fat: {macros.fat}g ({fatCaloriesFinal} kcal)</span>
                        </div>
                    </div>
                </div>

                <div className="nutrition-details">
                    <div className="detail-card">
                        <h3>Protein</h3>
                        <p>{macros.protein}g</p>
                        <div className="progress-bar">
                            <div
                                className="progress protein"
                                style={{ width: `${proteinPercentage}%` }}
                            ></div>
                        </div>
                        <span className="macro-target">Mục tiêu: {macros.protein}g</span>
                    </div>

                    <div className="detail-card">
                        <h3>Carbs</h3>
                        <p>{macros.carbs}g</p>
                        <div className="progress-bar">
                            <div
                                className="progress carbs"
                                style={{ width: `${carbsPercentage}%` }}
                            ></div>
                        </div>
                        <span className="macro-target">Mục tiêu: {macros.carbs}g</span>
                    </div>

                    <div className="detail-card">
                        <h3>Fat</h3>
                        <p>{macros.fat}g</p>
                        <div className="progress-bar">
                            <div
                                className="progress fat"
                                style={{ width: `${fatPercentage}%` }}
                            ></div>
                        </div>
                        <span className="macro-target">Mục tiêu: {macros.fat}g</span>
                    </div>

                    <div className="detail-card">
                        <h3>Tổng calo</h3>
                        <p>{totalCalories} kcal</p>
                        <div className="calorie-breakdown">
                            <div className="breakdown-item">
                                <span>Protein:</span>
                                <span>{proteinCalories} kcal</span>
                            </div>
                            <div className="breakdown-item">
                                <span>Carbs:</span>
                                <span>{carbsCaloriesFinal} kcal</span>
                            </div>
                            <div className="breakdown-item">
                                <span>Fat:</span>
                                <span>{fatCaloriesFinal} kcal</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NutritionSection; 