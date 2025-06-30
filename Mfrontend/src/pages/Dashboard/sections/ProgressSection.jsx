import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { getMenuByDate, completeMeal, getComplianceHistory } from '../../../services/api';
import ComplianceDashboard from '../../../components/ComplianceTracking/ComplianceDashboard';
import CreateGoalModal from '../../../components/ComplianceTracking/CreateGoalModal';
import NutritionProgressBarChart from '../../../components/NutritionProgressBarChart';
import ProgressHistoryChart from '../../../components/ProgressHistoryChart';
import 'react-calendar/dist/Calendar.css';
import './ProgressSection.css';
import axios from 'axios';

const BACKEND_URL = "http://localhost:8686";

const ProgressSection = ({
    user,
    menuByDate = {},
    favoriteMenus = [],
    onApplyMenu,
    onCreateMenu,
    selectedDate,
    setSelectedDate
}) => {
    console.log('ProgressSection props.selectedDate:', selectedDate, typeof selectedDate, selectedDate instanceof Date ? selectedDate.toISOString() : 'Không phải Date');
    const [menu, setMenu] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showCreateGoalModal, setShowCreateGoalModal] = useState(false);
    const [activeTab, setActiveTab] = useState('calendar'); // 'calendar' or 'compliance'
    const [historyType, setHistoryType] = useState('week'); // 'week' or 'month'
    const [progressHistory, setProgressHistory] = useState([]);
    const [progressLoading, setProgressLoading] = useState(false);

    useEffect(() => {
        const fetchMenu = async () => {
            if (!user?._id) return;
            setLoading(true);
            try {
                const pad = n => n.toString().padStart(2, '0');
                const dateStr = `${selectedDate.getFullYear()}-${pad(selectedDate.getMonth() + 1)}-${pad(selectedDate.getDate())}`;
                const menuData = await getMenuByDate(user._id, dateStr);
                setMenu(menuData);
            } catch (err) {
                setError('Lỗi khi lấy thực đơn: ' + err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchMenu();
    }, [selectedDate, user?._id]);

    useEffect(() => {
        const dateStr = selectedDate.toISOString().slice(0, 10);
        console.log('[ProgressSection] Hiển thị thực đơn ngày:', dateStr, 'menu:', menu);
    }, [selectedDate, menu]);

    useEffect(() => {
        if (activeTab !== 'compliance' || !user?._id) return;
        const fetchHistory = async () => {
            console.log('Bắt đầu fetch history với:', {
                userId: user._id,
                historyType,
                activeTab
            });
            setProgressLoading(true);
            try {
                const today = new Date();
                const start = new Date(today.getFullYear(), today.getMonth() - (historyType === 'month' ? 5 : 1), 1);
                const startStr = start.toISOString().slice(0, 10);
                const endStr = today.toISOString().slice(0, 10);
                console.log('Params fetch history:', { startStr, endStr, historyType });
                const data = await getComplianceHistory(user._id, startStr, endStr, historyType);
                console.log('Kết quả fetch history:', data);
                setProgressHistory(data);
            } catch (e) {
                console.error('Lỗi khi fetch history:', e);
                setProgressHistory([]);
            } finally {
                setProgressLoading(false);
            }
        };
        fetchHistory();
    }, [activeTab, user?._id, historyType]);

    useEffect(() => {
        console.log('progressHistory đã thay đổi:', {
            length: progressHistory.length,
            data: progressHistory,
            firstItem: progressHistory[0],
            stats: progressHistory.stats
        });
    }, [progressHistory]);

    useEffect(() => {
        console.log('selectedDate đã đổi:', selectedDate, typeof selectedDate, selectedDate instanceof Date ? selectedDate.toISOString() : 'Không phải Date');
    }, [selectedDate]);

    const handleCompleteMeal = async (mealName) => {
        try {
            const pad = n => n.toString().padStart(2, '0');
            const dateStr = `${selectedDate.getFullYear()}-${pad(selectedDate.getMonth() + 1)}-${pad(selectedDate.getDate())}`;
            await completeMeal(user._id, dateStr, mealName);
            // Fetch lại menu để cập nhật trạng thái
            const menuData = await getMenuByDate(user._id, dateStr);
            setMenu(menuData);
        } catch (err) {
            alert('Lỗi khi cập nhật trạng thái hoàn thành!');
        }
    };

    const handleCreateGoalSuccess = () => {
        setShowCreateGoalModal(false);
        // Có thể thêm logic để refresh dữ liệu compliance ở đây
    };

    const isLoading = progressLoading || !user;

    return (
        <div className="progress-main-card">
            <div className="progress-header">
                <h2>Tiến độ thực đơn</h2>
                <div className="today-label">
                    Hôm nay: {new Date().toLocaleDateString('vi-VN')}
                </div>
            </div>
            <div className="progress-tabs">
                <button
                    className={`tab-button ${activeTab === 'calendar' ? 'active' : ''}`}
                    onClick={() => setActiveTab('calendar')}
                >
                    Lịch thực đơn
                </button>
                <button
                    className={`tab-button ${activeTab === 'compliance' ? 'active' : ''}`}
                    onClick={() => setActiveTab('compliance')}
                >
                    Theo dõi tiến độ
                </button>
            </div>
            {/* Calendar Tab */}
            {activeTab === 'calendar' && (
                <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
                    <div className="progress-calendar-card">
                        <Calendar
                            onChange={(date) => {
                                console.log('Calendar onChange - Ngày được chọn:', date);
                                setSelectedDate(date);
                            }}
                            value={selectedDate}
                            tileClassName={({ date }) => {
                                const dateStr = date.toISOString().slice(0, 10);
                                let classes = [];
                                if (menuByDate[dateStr]) classes.push('has-menu');
                                return classes.join(' ');
                            }}
                            locale="vi-VN"
                        />
                    </div>
                    <div style={{ flex: 1, minWidth: 320 }}>
                        <NutritionProgressBarChart
                            completedMeals={menu ? menu.meals.filter(m => m.completed) : []}
                            dailyTarget={{
                                calories: menu?.totalNutrition?.calories || 0,
                                protein: menu?.totalNutrition?.protein || 0,
                                carbs: menu?.totalNutrition?.carbs || 0,
                                fat: menu?.totalNutrition?.fat || 0
                            }}
                        />
                        <div className="progress-menu-card">
                            <h3>
                                Thực đơn ngày {selectedDate.toLocaleDateString('vi-VN')}
                            </h3>
                            {loading && <div>Đang tải...</div>}
                            {error && <div className="error-message">{error}</div>}
                            {menu ? (
                                <div>
                                    <div className="menu-summary">
                                        <span>Tổng calo: {menu.totalNutrition?.calories || 0} kcal</span>
                                        <span>Tuân thủ: {menu.compliance || 0}%</span>
                                    </div>
                                    {menu.meals.map((meal, idx) => (
                                        <div key={idx} className="meal-card">
                                            <div className="meal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <h4 className="meal-title" style={{ margin: 0 }}>{meal.mealName}</h4>
                                                    {meal.mealTime && (
                                                        <span className="meal-time" style={{
                                                            marginLeft: 8,
                                                            color: '#15803d',
                                                            fontWeight: 500,
                                                            fontSize: 15,
                                                            background: '#e6f7fa',
                                                            borderRadius: 12,
                                                            padding: '2px 12px',
                                                            display: 'inline-block'
                                                        }}>{meal.mealTime}</span>
                                                    )}
                                                </div>
                                                <button
                                                    className={`complete-btn ${meal.completed ? 'completed' : ''}`}
                                                    onClick={() => handleCompleteMeal(meal.mealName)}
                                                    disabled={meal.completed}
                                                >
                                                    {meal.completed ? 'Đã hoàn thành' : 'Hoàn thành'}
                                                </button>
                                            </div>
                                            <div className="foods-list">
                                                {Array.isArray(meal.foods) && meal.foods.map((food, foodIdx) => (
                                                    (food && typeof food === 'object') && (
                                                        <div key={foodIdx} className="food-item">
                                                            <img
                                                                src={
                                                                    food.image
                                                                        ? (food.image.startsWith('http') ? food.image : `${BACKEND_URL}${food.image}`)
                                                                        : '/default-food.png'
                                                                }
                                                                alt={food.name}
                                                                className="food-image"
                                                            />
                                                            <div className="food-info">
                                                                <h5>{food.name}</h5>
                                                                <p>
                                                                    {food.calories} kcal | P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-menu">
                                    <p>Chưa có thực đơn cho ngày này.</p>
                                    <button className="apply-fav-btn" onClick={() => onApplyMenu && onApplyMenu(selectedDate)}>
                                        Áp dụng thực đơn yêu thích
                                    </button>
                                    <button className="create-menu-btn" onClick={() => onCreateMenu && onCreateMenu(selectedDate)}>
                                        Tạo thực đơn mới
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Compliance Tab */}
            {activeTab === 'compliance' && (
                <div style={{ marginTop: 24 }}>
                    <ComplianceDashboard
                        user={user}
                        history={progressHistory.history || []}
                        stats={progressHistory.stats}
                        loading={isLoading}
                        onCreateGoal={() => setShowCreateGoalModal(true)}
                    />
                    <ProgressHistoryChart
                        history={progressHistory.history || []}
                        type={historyType}
                        loading={isLoading}
                        onTypeChange={setHistoryType}
                    />
                </div>
            )}
            {showCreateGoalModal && (
                <CreateGoalModal
                    user={user}
                    onSuccess={handleCreateGoalSuccess}
                    onClose={() => setShowCreateGoalModal(false)}
                />
            )}
        </div>
    );
};

export default ProgressSection; 