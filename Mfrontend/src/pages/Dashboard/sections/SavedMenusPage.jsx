import React, { useEffect, useState } from 'react';
import { getSavedMenus } from '../../../services/api';

const SavedMenusPage = ({ user }) => {
    const [menus, setMenus] = useState([]);
    const [filteredMenus, setFilteredMenus] = useState([]);
    const [search, setSearch] = useState('');
    const [tab, setTab] = useState('all');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedMenu, setSelectedMenu] = useState(null);
    const [favoriteIds, setFavoriteIds] = useState([]);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [menuToApply, setMenuToApply] = useState(null);

    useEffect(() => {
        const fetchMenus = async () => {
            setLoading(true);
            try {
                const userId = user._id || user.id || user.email;
                const res = await getSavedMenus(userId);
                setMenus(res.menus || []);
            } catch (err) {
                setError('Không thể tải danh sách thực đơn');
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchMenus();
    }, [user]);

    // Lọc theo tab và tìm kiếm
    useEffect(() => {
        let result = [...menus];
        if (tab === 'favorite') {
            result = result.filter(menu => favoriteIds.includes(menu._id));
        }
        if (search) {
            result = result.filter(menu =>
                (menu.date && menu.date.includes(search)) ||
                (menu.note && menu.note.toLowerCase().includes(search.toLowerCase()))
            );
        }
        setFilteredMenus(result);
    }, [tab, search, menus, favoriteIds]);

    // Đánh dấu yêu thích (giả lập, lưu ở state)
    const handleToggleFavorite = (menuId) => {
        setFavoriteIds(prev =>
            prev.includes(menuId) ? prev.filter(id => id !== menuId) : [...prev, menuId]
        );
    };

    // Xem chi tiết thực đơn
    const handleViewDetail = (menu) => {
        setSelectedMenu(menu);
    };

    // Đóng modal chi tiết
    const handleCloseDetail = () => {
        setSelectedMenu(null);
    };

    // Xóa thực đơn (giả lập, chỉ xóa ở state)
    const handleDeleteMenu = (menuId) => {
        if (window.confirm('Bạn có chắc muốn xóa thực đơn này?')) {
            setMenus(prev => prev.filter(menu => menu._id !== menuId));
        }
    };

    const handleSaveMenu = async () => {
        try {
            const dateString = getDateString(selectedDate);
            const menuData = weeklyMenu[dateString];
            if (!menuData) {
                setError('Không có thực đơn để lưu');
                return;
            }
            // Chuẩn hóa dữ liệu gửi lên backend
            const meals = Object.entries(menuData).map(([mealName, foods]) => ({
                mealName,
                foods
            }));
            // Tính tổng dinh dưỡng
            const totalNutrition = meals.reduce((acc, meal) => {
                meal.foods.forEach(food => {
                    acc.calories += food.calories || 0;
                    acc.protein += food.protein || 0;
                    acc.carbs += food.carbs || 0;
                    acc.fat += food.fat || 0;
                });
                return acc;
            }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
            // Gọi API chuẩn hóa
            const res = await saveMenu({
                userId: user._id || user.id || user.email,
                date: dateString,
                meals,
                totalNutrition,
                note: ''
            });
            if (res.menuId) {
                // Hiện modal xác nhận áp dụng
                setMenuToApply({
                    ...res,
                    date: dateString,
                    meals,
                    totalNutrition
                });
                setShowApplyModal(true);
            } else {
                setError(res.error || 'Lưu thực đơn thất bại');
            }
        } catch (err) {
            setError('Lỗi khi lưu thực đơn: ' + err.message);
        }
    };

    return (
        <div className="saved-menus-page">
            <h2>Thực đơn đã lưu</h2>
            <div className="saved-menus-controls">
                <input
                    type="text"
                    placeholder="Tìm kiếm theo ngày hoặc ghi chú..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <div className="tabs">
                    <button className={tab === 'all' ? 'active' : ''} onClick={() => setTab('all')}>Tất cả</button>
                    <button className={tab === 'favorite' ? 'active' : ''} onClick={() => setTab('favorite')}>Yêu thích</button>
                </div>
            </div>
            {loading && <div>Đang tải...</div>}
            {error && <div className="error-message">{error}</div>}
            <ul className="saved-menus-list">
                {filteredMenus.length === 0 && !loading && <li>Chưa có thực đơn nào.</li>}
                {filteredMenus.map(menu => (
                    <li key={menu._id} className="saved-menu-item">
                        <div><b>Ngày:</b> {menu.date}</div>
                        <div><b>Ghi chú:</b> {menu.note || ''}</div>
                        <div><b>Tổng calo:</b> {menu.totalNutrition?.calories || 0} kcal</div>
                        <div><b>Số bữa:</b> {menu.meals?.length || 0}</div>
                        <div className="menu-actions">
                            <button onClick={() => handleToggleFavorite(menu._id)}>
                                {favoriteIds.includes(menu._id) ? '♥' : '♡'}
                            </button>
                            <button onClick={() => handleViewDetail(menu)}>Xem chi tiết</button>
                            <button onClick={() => handleDeleteMenu(menu._id)}>Xóa</button>
                        </div>
                    </li>
                ))}
            </ul>

            {/* Modal xem chi tiết thực đơn */}
            {selectedMenu && (
                <div className="modal-overlay" onClick={handleCloseDetail} style={{ cursor: 'pointer' }}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Chi tiết thực đơn ngày {selectedMenu.date}</h3>
                        <button onClick={handleCloseDetail} className="close-modal">Đóng</button>
                        <div><b>Ghi chú:</b> {selectedMenu.note || ''}</div>
                        <div><b>Tổng calo:</b> {selectedMenu.totalNutrition?.calories || 0} kcal</div>
                        <div><b>Số bữa:</b> {selectedMenu.meals?.length || 0}</div>
                        <ul>
                            {selectedMenu.meals?.map((meal, idx) => (
                                <li key={idx}>
                                    <b>{meal.mealName}:</b>
                                    <ul>
                                        {meal.foods.map((food, i) => (
                                            <li key={i}>
                                                {food.name} ({food.calories} kcal, P:{food.protein}g, C:{food.carbs}g, F:{food.fat}g)
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {showApplyModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Bạn muốn áp dụng thực đơn này cho ngày {menuToApply?.date?.split('-').reverse().join('/')}?</h3>
                        <button
                            onClick={async () => {
                                // Gọi API hoặc cập nhật state để áp dụng thực đơn cho ngày này
                                // Ví dụ: cập nhật localStorage hoặc gọi API applyMenu
                                // Ở đây giả lập cập nhật localStorage:
                                const menusByDate = JSON.parse(localStorage.getItem('menusByDate') || '{}');
                                menusByDate[menuToApply.date] = menuToApply;
                                localStorage.setItem('menusByDate', JSON.stringify(menusByDate));
                                setShowApplyModal(false);
                                setMenuToApply(null);
                                alert('Đã áp dụng thực đơn cho ngày ' + menuToApply.date.split('-').reverse().join('/'));
                            }}
                            style={{ marginRight: 12, background: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 500 }}
                        >
                            Đồng ý
                        </button>
                        <button
                            onClick={() => {
                                setShowApplyModal(false);
                                setMenuToApply(null);
                            }}
                            style={{ background: '#e5e7eb', color: '#333', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 500 }}
                        >
                            Không, chỉ lưu
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SavedMenusPage;
