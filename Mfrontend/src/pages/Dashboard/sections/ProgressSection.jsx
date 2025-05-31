import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { getMenuByDate, completeMeal } from '../../../services/api';
import 'react-calendar/dist/Calendar.css';
import './ProgressSection.css';


const BACKEND_URL = "http://localhost:8686";

const ProgressSection = ({
    user,
    menusByDate = {},
    favoriteMenus = [],
    onApplyMenu,
    onCreateMenu
}) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [menu, setMenu] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMenu = async () => {
            if (!user?._id) return;
            setLoading(true);
            try {
                const dateStr = selectedDate.toISOString().slice(0, 10);
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

    const handleCompleteMeal = async (mealName) => {
        try {
            await completeMeal(user._id, selectedDate.toISOString().slice(0, 10), mealName);
            // Fetch lại menu để cập nhật trạng thái
            const menuData = await getMenuByDate(user._id, selectedDate.toISOString().slice(0, 10));
            setMenu(menuData);
        } catch (err) {
            alert('Lỗi khi cập nhật trạng thái hoàn thành!');
        }
    };

    return (
        <div className="progress-section">
            <div className="progress-header">
                <h2>Tiến độ thực đơn</h2>
                <div className="today-label">
                    Hôm nay: {new Date().toLocaleDateString('vi-VN')}
                </div>
            </div>
            <div className="progress-calendar-card">
                <Calendar
                    onChange={setSelectedDate}
                    value={selectedDate}
                    tileClassName={({ date }) => {
                        const dateStr = date.toISOString().slice(0, 10);
                        if (menusByDate[dateStr]) return 'has-menu';
                        return null;
                    }}
                    locale="vi-VN"
                />
            </div>
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
                                <div className="meal-header">
                                    <h4>{meal.mealName}</h4>
                                    <button
                                        className="complete-btn"
                                        style={{
                                            background: meal.completed ? "#15803d" : "#22c55e",
                                            opacity: meal.completed ? 0.7 : 1
                                        }}
                                        onClick={() => handleCompleteMeal(meal.mealName)}
                                        disabled={meal.completed}
                                    >
                                        {meal.completed ? "Đã hoàn thành" : "Hoàn thành"}
                                    </button>
                                </div>
                                <div className="foods-list">
                                    {meal.foods.map((food, i) => (
                                        <div key={i} className="food-item">
                                            <img
                                                src={food.image?.startsWith('http') ? food.image : `${BACKEND_URL}${food.image}`}
                                                alt={food.name}
                                                className="food-image"
                                            />
                                            <div className="food-info">
                                                <h5>{food.name}</h5>
                                                <p>{food.calories} kcal</p>
                                            </div>
                                            <button className="replace-btn">THAY ĐỔI</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-menu">
                        <p>Chưa có thực đơn cho ngày này.</p>
                        <button className="apply-fav-btn" onClick={() => onApplyMenu(selectedDate)}>
                            Áp dụng thực đơn yêu thích
                        </button>
                        <button className="create-menu-btn" onClick={() => onCreateMenu(selectedDate)}>
                            Tạo thực đơn mới
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProgressSection; 