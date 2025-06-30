import React, { useEffect, useState } from 'react';
import { Eye, Edit, CheckCircle, Trash2, Plus } from 'lucide-react';
import { getFoodDetail, getAllFoods, updateFood, createFood, deleteFood } from '../../services/api';
import './FoodsAdmin.css';

const Foods = () => {
    const [foods, setFoods] = useState([]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedFood, setSelectedFood] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [errorDetail, setErrorDetail] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingFood, setEditingFood] = useState(null);
    const [editFormData, setEditFormData] = useState({
        name: '',
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        status: '',
        image: '',
        ingredients: [],
        preferences: [],
        restrictions: [],
        context: {
            mealTime: [],
            season: '',
            weather: []
        },
        instructions: []
    });
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState('');
    const [selectedImageFile, setSelectedImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    // State cho modal thêm món ăn mới
    const [showAddModal, setShowAddModal] = useState(false);
    const [addFormData, setAddFormData] = useState({
        name: '',
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        description: '',
        status: 'pending',
        ingredients: [],
        preferences: [],
        restrictions: [],
        context: {
            mealTime: [],
            season: 'all',
            weather: []
        },
        instructions: []
    });
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState('');
    const [addImageFile, setAddImageFile] = useState(null);
    const [addImagePreview, setAddImagePreview] = useState('');

    useEffect(() => {
        // Gọi API lấy danh sách món ăn từ backend
        const fetchFoods = async () => {
            try {
                const res = await getAllFoods();
                console.log('[Foods] Danh sách món ăn từ API:', res);
                // Nếu backend trả về { data: [...] }
                if (Array.isArray(res)) {
                    setFoods(res);
                } else if (Array.isArray(res.data)) {
                    setFoods(res.data);
                } else {
                    setFoods([]);
                }
            } catch (err) {
                setFoods([]);
            }
        };
        fetchFoods();
    }, []);

    // Debug: Log khi foods state thay đổi
    useEffect(() => {
        console.log('[DEBUG] Foods state changed:', foods);
    }, [foods]);

    // Function để refresh lại danh sách món ăn
    const refreshFoods = async () => {
        try {
            const res = await getAllFoods();
            console.log('[Foods] Refresh danh sách món ăn từ API:', res);
            if (Array.isArray(res)) {
                setFoods(res);
            } else if (Array.isArray(res.data)) {
                setFoods(res.data);
            } else {
                setFoods([]);
            }
        } catch (err) {
            console.error('[Foods] Error refreshing foods:', err);
        }
    };

    const filteredFoods = foods.filter(f =>
        f.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleViewFood = async (id) => {
        setShowModal(true);
        setLoadingDetail(true);
        setErrorDetail('');
        try {
            const food = await getFoodDetail(id);
            setSelectedFood(food);
        } catch (err) {
            setErrorDetail('Không thể tải chi tiết món ăn');
            setSelectedFood(null);
        } finally {
            setLoadingDetail(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedFood(null);
        setErrorDetail('');
    };

    useEffect(() => {
        if (showModal && selectedFood) {
            console.log('[DEBUG] selectedFood:', selectedFood);
            console.log('[DEBUG] selectedFood.image:', selectedFood.image);
        }
    }, [showModal, selectedFood]);

    const handleEditFood = async (id) => {
        setShowEditModal(true);
        setEditLoading(true);
        setEditError('');
        setSelectedImageFile(null);
        setImagePreview('');
        try {
            const food = await getFoodDetail(id);
            setEditingFood(food);
            setEditFormData({
                name: food.name || '',
                calories: food.calories || '',
                protein: food.protein || '',
                carbs: food.carbs || '',
                fat: food.fat || '',
                status: food.status || '',
                image: food.image || '',
                ingredients: Array.isArray(food.ingredients) ? food.ingredients.map(ing => ({
                    name: ing.name || '',
                    quantity: ing.quantity || '',
                    unit: ing.unit || ''
                })) : [],
                preferences: Array.isArray(food.preferences) ? food.preferences : [],
                restrictions: Array.isArray(food.restrictions) ? food.restrictions : [],
                context: {
                    mealTime: food.context?.mealTime || [],
                    season: food.context?.season || '',
                    weather: food.context?.weather || []
                },
                instructions: Array.isArray(food.instructions) ? food.instructions : []
            });
            // Set image preview if food has image
            if (food.image) {
                const imageUrl = (typeof food.image === 'string' && food.image.startsWith('/'))
                    ? `http://localhost:8686${food.image}`
                    : food.image;
                setImagePreview(imageUrl);
            }
        } catch (err) {
            setEditError('Không thể tải chi tiết món ăn');
            setEditingFood(null);
        } finally {
            setEditLoading(false);
        }
    };

    const handleUpdateFood = async (e) => {
        e.preventDefault();
        if (!editingFood) return;
        setEditLoading(true);
        setEditError('');

        // Log dữ liệu gửi lên API để debug
        console.log('[DEBUG] Dữ liệu gửi lên updateFood:', editFormData);
        console.log('[DEBUG] Selected image file:', selectedImageFile);

        // Chuẩn hóa context gửi lên backend
        const context = { ...editFormData.context };
        if (Array.isArray(context.mealTime) && context.mealTime.length === 0) {
            delete context.mealTime;
        }

        // Sửa lỗi: Nếu weather là mảng, chỉ gửi khi có giá trị thực tế
        if (Array.isArray(context.weather)) {
            const filteredWeather = context.weather.filter(w => w && w !== 'all');
            if (filteredWeather.length > 0) {
                context.weather = filteredWeather;
            } else {
                delete context.weather;
            }
        }

        if (context.season === 'all' || !context.season) {
            delete context.season;
        }

        // Chuẩn hóa preferences, restrictions: nếu là mảng rỗng thì bỏ
        const dataToSend = {
            ...editFormData,
            // Chuyển đổi các trường số
            calories: Number(editFormData.calories) || 0,
            protein: Number(editFormData.protein) || 0,
            carbs: Number(editFormData.carbs) || 0,
            fat: Number(editFormData.fat) || 0,
            context,
            preferences: Array.isArray(editFormData.preferences) && editFormData.preferences.length > 0 ? editFormData.preferences : undefined,
            restrictions: Array.isArray(editFormData.restrictions) && editFormData.restrictions.length > 0 ? editFormData.restrictions : undefined
        };

        console.log('[DEBUG] Dữ liệu thực sự gửi lên updateFood:', dataToSend);

        try {
            await updateFood(editingFood._id, dataToSend, selectedImageFile);

            // Cập nhật lại danh sách món ăn
            const res = await getAllFoods();
            if (Array.isArray(res)) {
                setFoods(res);
            } else if (Array.isArray(res.data)) {
                setFoods(res.data);
            } else {
                setFoods([]);
            }

            setShowEditModal(false);
            setSelectedImageFile(null);
            setImagePreview('');
        } catch (err) {
            setEditError('Cập nhật món ăn thất bại');
            console.error('[DEBUG] Update food error:', err);
            if (err.response) {
                console.error('[DEBUG] Backend error response:', JSON.stringify(err.response.data, null, 2));
            }
        } finally {
            setEditLoading(false);
        }
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Xử lý thay đổi thành phần ingredients
    const handleIngredientChange = (idx, field, value) => {
        setEditFormData(prev => ({
            ...prev,
            ingredients: prev.ingredients.map((ing, i) =>
                i === idx ? { ...ing, [field]: value } : ing
            )
        }));
    };

    const handleAddIngredient = () => {
        setEditFormData(prev => ({
            ...prev,
            ingredients: [
                ...prev.ingredients.filter(ing => ing && typeof ing === 'object' && ('name' in ing || 'quantity' in ing || 'unit' in ing)),
                { name: '', quantity: '', unit: '' }
            ]
        }));
    };

    const handleRemoveIngredient = (idx) => {
        setEditFormData(prev => ({
            ...prev,
            ingredients: prev.ingredients.filter((_, i) => i !== idx)
        }));
    };

    // Xử lý tag (preferences, restrictions)
    const handleTagChange = (field, idx, value) => {
        setEditFormData(prev => ({
            ...prev,
            [field]: prev[field].map((tag, i) => i === idx ? value : tag)
        }));
    };

    const handleAddTag = (field) => {
        setEditFormData(prev => ({
            ...prev,
            [field]: [...prev[field], '']
        }));
    };

    const handleRemoveTag = (field, idx) => {
        setEditFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== idx)
        }));
    };

    // Xử lý context
    const handleContextChange = (subfield, value) => {
        setEditFormData(prev => ({
            ...prev,
            context: {
                ...prev.context,
                [subfield]: value
            }
        }));
    };

    // Xử lý instructions
    const handleInstructionChange = (idx, value) => {
        setEditFormData(prev => ({
            ...prev,
            instructions: prev.instructions.map((step, i) => i === idx ? value : step)
        }));
    };

    const handleAddInstruction = () => {
        setEditFormData(prev => ({
            ...prev,
            instructions: [...prev.instructions, '']
        }));
    };

    const handleRemoveInstruction = (idx) => {
        setEditFormData(prev => ({
            ...prev,
            instructions: prev.instructions.filter((_, i) => i !== idx)
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImageFile(file);
            // Create preview URL
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearImageSelection = () => {
        setSelectedImageFile(null);
        setImagePreview('');
        // Reset to original image if exists
        if (editingFood && editingFood.image) {
            const imageUrl = (typeof editingFood.image === 'string' && editingFood.image.startsWith('/'))
                ? `http://localhost:8686${editingFood.image}`
                : editingFood.image;
            setImagePreview(imageUrl);
        }
    };

    // Functions cho modal thêm món ăn mới
    const handleAddFood = () => {
        setShowAddModal(true);
        setAddError('');
        setAddImageFile(null);
        setAddImagePreview('');
        // Reset form data
        setAddFormData({
            name: '',
            calories: '',
            protein: '',
            carbs: '',
            fat: '',
            description: '',
            status: 'pending',
            ingredients: [],
            preferences: [],
            restrictions: [],
            context: {
                mealTime: [],
                season: 'all',
                weather: []
            },
            instructions: []
        });
    };

    const handleAddChange = (e) => {
        const { name, value } = e.target;
        setAddFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddIngredientChange = (idx, field, value) => {
        setAddFormData(prev => ({
            ...prev,
            ingredients: prev.ingredients.map((ing, i) =>
                i === idx ? { ...ing, [field]: value } : ing
            )
        }));
    };

    const handleAddNewIngredient = () => {
        setAddFormData(prev => ({
            ...prev,
            ingredients: [...prev.ingredients, { name: '', quantity: '', unit: '' }]
        }));
    };

    const handleRemoveAddIngredient = (idx) => {
        setAddFormData(prev => ({
            ...prev,
            ingredients: prev.ingredients.filter((_, i) => i !== idx)
        }));
    };

    const handleAddTagChange = (field, idx, value) => {
        setAddFormData(prev => ({
            ...prev,
            [field]: prev[field].map((tag, i) => i === idx ? value : tag)
        }));
    };

    const handleAddNewTag = (field) => {
        setAddFormData(prev => ({
            ...prev,
            [field]: [...prev[field], '']
        }));
    };

    const handleRemoveAddTag = (field, idx) => {
        setAddFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== idx)
        }));
    };

    const handleAddContextChange = (subfield, value) => {
        setAddFormData(prev => ({
            ...prev,
            context: {
                ...prev.context,
                [subfield]: value
            }
        }));
    };

    const handleAddInstructionChange = (idx, value) => {
        setAddFormData(prev => ({
            ...prev,
            instructions: prev.instructions.map((step, i) => i === idx ? value : step)
        }));
    };

    const handleAddNewInstruction = () => {
        setAddFormData(prev => ({
            ...prev,
            instructions: [...prev.instructions, '']
        }));
    };

    const handleRemoveAddInstruction = (idx) => {
        setAddFormData(prev => ({
            ...prev,
            instructions: prev.instructions.filter((_, i) => i !== idx)
        }));
    };

    const handleAddImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAddImageFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setAddImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearAddImageSelection = () => {
        setAddImageFile(null);
        setAddImagePreview('');
    };

    const handleCreateFood = async (e) => {
        e.preventDefault();
        setAddLoading(true);
        setAddError('');

        console.log('[DEBUG] Dữ liệu gửi lên createFood:', addFormData);
        console.log('[DEBUG] Selected image file:', addImageFile);

        // Chuẩn hóa context gửi lên backend
        const context = { ...addFormData.context };
        if (Array.isArray(context.mealTime) && context.mealTime.length === 0) {
            delete context.mealTime;
        }

        // Sửa lỗi: Nếu weather là mảng, chỉ gửi khi có giá trị thực tế
        if (Array.isArray(context.weather)) {
            const filteredWeather = context.weather.filter(w => w && w !== 'all');
            if (filteredWeather.length > 0) {
                context.weather = filteredWeather;
            } else {
                delete context.weather;
            }
        }

        if (context.season === 'all' || !context.season) {
            delete context.season;
        }

        // Chuẩn hóa preferences, restrictions: nếu là mảng rỗng thì bỏ
        const dataToSend = {
            ...addFormData,
            // Chuyển đổi các trường số
            calories: Number(addFormData.calories) || 0,
            protein: Number(addFormData.protein) || 0,
            carbs: Number(addFormData.carbs) || 0,
            fat: Number(addFormData.fat) || 0,
            context,
            preferences: Array.isArray(addFormData.preferences) && addFormData.preferences.length > 0 ? addFormData.preferences : undefined,
            restrictions: Array.isArray(addFormData.restrictions) && addFormData.restrictions.length > 0 ? addFormData.restrictions : undefined
        };

        console.log('[DEBUG] Dữ liệu thực sự gửi lên createFood:', dataToSend);

        try {
            await createFood(dataToSend, addImageFile);
            // Cập nhật lại danh sách món ăn
            const res = await getAllFoods();
            if (Array.isArray(res)) {
                setFoods(res);
            } else if (Array.isArray(res.data)) {
                setFoods(res.data);
            } else {
                setFoods([]);
            }
            setShowAddModal(false);
            setAddImageFile(null);
            setAddImagePreview('');
        } catch (err) {
            setAddError('Tạo món ăn thất bại');
            console.error('[DEBUG] Create food error:', err);
            if (err.response) {
                console.error('[DEBUG] Backend error response:', JSON.stringify(err.response.data, null, 2));
            }
        } finally {
            setAddLoading(false);
        }
    };

    const handleDeleteFood = async (foodId, foodName) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa món ăn "${foodName}" không? Hành động này không thể hoàn tác.`)) {
            try {
                await deleteFood(foodId);
                // Xóa món ăn khỏi state để cập nhật UI ngay lập tức
                setFoods(prevFoods => prevFoods.filter(food => food._id !== foodId));
                // Tùy chọn: có thể thêm thông báo thành công ở đây
                // alert('Xóa món ăn thành công!');
            } catch (err) {
                console.error('[DEBUG] Delete food error:', err);
                alert('Xóa món ăn thất bại. Vui lòng thử lại.');
            }
        }
    };

    return (
        <div className="foods-admin-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className="foods-admin-title">Quản lý món ăn</h2>
                <button
                    onClick={handleAddFood}
                    className="action-btn edit"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px' }}
                >
                    <Plus size={18} />
                    Thêm món ăn
                </button>
            </div>
            <input
                type="text"
                placeholder="Tìm kiếm món ăn..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="foods-admin-search"
            />
            <div className="foods-admin-table-wrapper">
                <table className="foods-admin-table">
                    <thead>
                        <tr>
                            <th>Tên món</th>
                            <th>Calo</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredFoods.map(food => (
                            <tr key={food._id} className="foods-admin-row">
                                <td>{food.name}</td>
                                <td>{food.calories}</td>
                                <td>
                                    {food.status === 'approved' && <span className="badge badge-approved">Đã duyệt</span>}
                                    {food.status === 'pending' && <span className="badge badge-pending">Chờ duyệt</span>}
                                    {food.status === 'rejected' && <span className="badge badge-rejected">Từ chối</span>}
                                </td>
                                <td className="foods-admin-actions">
                                    <button className="action-btn view" title="Xem" onClick={() => handleViewFood(food._id)}><Eye size={18} /> Xem</button>
                                    <button className="action-btn edit" title="Sửa" onClick={() => handleEditFood(food._id)}><Edit size={18} /> Sửa</button>
                                    <button className="action-btn approve" title="Duyệt"><CheckCircle size={18} /> Duyệt</button>
                                    <button className="action-btn delete" title="Xóa" onClick={() => handleDeleteFood(food._id, food.name)}><Trash2 size={18} /> Xóa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content food-detail-modal" onClick={e => e.stopPropagation()}>
                        <button className="close-modal-btn" onClick={closeModal} title="Đóng">&times;</button>
                        <h2 className="modal-title">Chi tiết món ăn</h2>
                        {loadingDetail ? (
                            <div className="modal-loading">Đang tải...</div>
                        ) : errorDetail ? (
                            <div className="modal-error">{errorDetail}</div>
                        ) : selectedFood ? (
                            <div className="modal-info-grid">
                                {Object.entries(selectedFood).map(([key, value]) => {
                                    if (['_id', '__v', 'context'].includes(key)) return null;
                                    // Hiển thị ingredients là danh sách đẹp
                                    if (key === 'ingredients' && Array.isArray(value)) {
                                        return (
                                            <div className="modal-info-row" key={key}>
                                                <span className="modal-label">Thành phần:</span>
                                                <ul className="modal-list">
                                                    {value.map((item, idx) => (
                                                        <li key={idx}>
                                                            {item.name} ({item.quantity}{item.unit})
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        );
                                    }
                                    let displayValue = value;
                                    if (Array.isArray(value)) {
                                        displayValue = value.join(', ');
                                    } else if (typeof value === 'object' && value !== null) {
                                        if (key === 'image' && value.url) {
                                            displayValue = value.url;
                                        } else {
                                            // Nếu là object khác, hiển thị JSON đẹp hoặc bỏ qua
                                            displayValue = '[object]';
                                        }
                                    }
                                    return (
                                        <div className="modal-info-row" key={key}>
                                            <span className="modal-label">{key === 'name' ? 'Tên món' : key === 'calories' ? 'Calo' : key === 'status' ? 'Trạng thái' : key === 'description' ? 'Mô tả' : key === 'image' ? 'Hình ảnh' : key === 'createdAt' ? 'Ngày tạo' : key === 'updatedAt' ? 'Cập nhật' : key === 'instructions' ? 'Hướng dẫn' : key === 'preferences' ? 'Sở thích' : key === 'restrictions' ? 'Hạn chế' : key}:</span>
                                            {key === 'image' && displayValue ? (
                                                <span className="modal-value">
                                                    <img
                                                        src={
                                                            (typeof displayValue === 'string' && displayValue.startsWith('/'))
                                                                ? `http://localhost:8686${displayValue}`
                                                                : displayValue
                                                        }
                                                        alt={selectedFood.name}
                                                        style={{ maxWidth: 160, borderRadius: 8, marginLeft: 8, boxShadow: '0 2px 8px #0001' }}
                                                    />
                                                </span>
                                            ) : key === 'createdAt' || key === 'updatedAt' ? (
                                                <span className="modal-value">{new Date(displayValue).toLocaleString()}</span>
                                            ) : (
                                                <span className="modal-value">{displayValue}</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
            {showEditModal && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal-content food-detail-modal" onClick={e => e.stopPropagation()}>
                        <button className="close-modal-btn" onClick={() => setShowEditModal(false)} title="Đóng">&times;</button>
                        <h2 className="modal-title">Sửa món ăn</h2>
                        {editLoading ? (
                            <div className="modal-loading">Đang tải...</div>
                        ) : editError ? (
                            <div className="modal-error">{editError}</div>
                        ) : (
                            <form onSubmit={handleUpdateFood}>
                                <div className="modal-info-grid">
                                    <div className="modal-info-row">
                                        <span className="modal-label">Tên món:</span>
                                        <input
                                            type="text"
                                            name="name"
                                            value={editFormData.name}
                                            onChange={handleEditChange}
                                            className="modal-value"
                                            required
                                        />
                                    </div>
                                    <div className="modal-info-row">
                                        <span className="modal-label">Calo:</span>
                                        <input
                                            type="number"
                                            name="calories"
                                            value={editFormData.calories}
                                            onChange={handleEditChange}
                                            className="modal-value"
                                            required
                                        />
                                    </div>
                                    <div className="modal-info-row">
                                        <span className="modal-label">Protein:</span>
                                        <input
                                            type="number"
                                            name="protein"
                                            value={editFormData.protein}
                                            onChange={handleEditChange}
                                            className="modal-value"
                                            required
                                        />
                                    </div>
                                    <div className="modal-info-row">
                                        <span className="modal-label">Carbs:</span>
                                        <input
                                            type="number"
                                            name="carbs"
                                            value={editFormData.carbs}
                                            onChange={handleEditChange}
                                            className="modal-value"
                                            required
                                        />
                                    </div>
                                    <div className="modal-info-row">
                                        <span className="modal-label">Fat:</span>
                                        <input
                                            type="number"
                                            name="fat"
                                            value={editFormData.fat}
                                            onChange={handleEditChange}
                                            className="modal-value"
                                            required
                                        />
                                    </div>
                                    <div className="modal-info-row">
                                        <span className="modal-label">Mô tả:</span>
                                        <textarea
                                            name="description"
                                            value={editFormData.description}
                                            onChange={handleEditChange}
                                            className="modal-value"
                                            required
                                        />
                                    </div>
                                    <div className="modal-info-row">
                                        <span className="modal-label">Trạng thái:</span>
                                        <select
                                            name="status"
                                            value={editFormData.status}
                                            onChange={handleEditChange}
                                            className="modal-value"
                                            required
                                        >
                                            <option value="approved">Đã duyệt</option>
                                            <option value="pending">Chờ duyệt</option>
                                            <option value="rejected">Từ chối</option>
                                        </select>
                                    </div>
                                    <div className="modal-info-row">
                                        <span className="modal-label">Hình ảnh:</span>
                                        <div style={{ width: '100%' }}>
                                            {/* File input for new image */}
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className="modal-value"
                                                    style={{ flex: 1 }}
                                                />
                                                {selectedImageFile && (
                                                    <button
                                                        type="button"
                                                        onClick={clearImageSelection}
                                                        style={{
                                                            padding: '4px 8px',
                                                            backgroundColor: '#ef4444',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '12px'
                                                        }}
                                                    >
                                                        Xóa
                                                    </button>
                                                )}
                                            </div>
                                            {/* Image preview */}
                                            {imagePreview && (
                                                <div style={{ marginTop: '8px' }}>
                                                    <img
                                                        src={imagePreview}
                                                        alt="Preview"
                                                        style={{
                                                            maxWidth: '200px',
                                                            maxHeight: '150px',
                                                            borderRadius: '8px',
                                                            border: '1px solid #e5e7eb'
                                                        }}
                                                    />
                                                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                                                        {selectedImageFile ? 'Ảnh mới sẽ được upload' : 'Ảnh hiện tại'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="modal-info-row">
                                        <span className="modal-label">Sở thích:</span>
                                        <div style={{ width: '100%' }}>
                                            {editFormData.preferences && editFormData.preferences.length > 0 ? (
                                                editFormData.preferences.map((tag, idx) => (
                                                    <div key={idx} style={{ display: 'flex', gap: 6, marginBottom: 4, alignItems: 'center' }}>
                                                        <input type="text" value={tag} onChange={e => handleTagChange('preferences', idx, e.target.value)} style={{ flex: 1, minWidth: 0, fontSize: 14, padding: '4px 6px', borderRadius: 5, border: '1px solid #d1d5db' }} required />
                                                        <button type="button" onClick={() => handleRemoveTag('preferences', idx)} style={{ color: '#ef4444', fontWeight: 700, background: 'none', border: 'none', fontSize: 16, cursor: 'pointer' }} title="Xóa">×</button>
                                                    </div>
                                                ))
                                            ) : <div style={{ color: '#888', fontStyle: 'italic' }}>Chưa có tag nào.</div>}
                                            <button type="button" onClick={() => handleAddTag('preferences')} style={{ marginTop: 2, color: '#0ea5e9', background: 'none', border: '1px dashed #0ea5e9', borderRadius: 6, padding: '2px 8px', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>+ Thêm tag</button>
                                        </div>
                                    </div>
                                    <div className="modal-info-row">
                                        <span className="modal-label">Hạn chế:</span>
                                        <div style={{ width: '100%' }}>
                                            {editFormData.restrictions && editFormData.restrictions.length > 0 ? (
                                                editFormData.restrictions.map((tag, idx) => (
                                                    <div key={idx} style={{ display: 'flex', gap: 6, marginBottom: 4, alignItems: 'center' }}>
                                                        <input type="text" value={tag} onChange={e => handleTagChange('restrictions', idx, e.target.value)} style={{ flex: 1, minWidth: 0, fontSize: 14, padding: '4px 6px', borderRadius: 5, border: '1px solid #d1d5db' }} required />
                                                        <button type="button" onClick={() => handleRemoveTag('restrictions', idx)} style={{ color: '#ef4444', fontWeight: 700, background: 'none', border: 'none', fontSize: 16, cursor: 'pointer' }} title="Xóa">×</button>
                                                    </div>
                                                ))
                                            ) : <div style={{ color: '#888', fontStyle: 'italic' }}>Chưa có tag nào.</div>}
                                            <button type="button" onClick={() => handleAddTag('restrictions')} style={{ marginTop: 2, color: '#0ea5e9', background: 'none', border: '1px dashed #0ea5e9', borderRadius: 6, padding: '2px 8px', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>+ Thêm tag</button>
                                        </div>
                                    </div>
                                    <div className="modal-info-row">
                                        <span className="modal-label">Bữa ăn:</span>
                                        <select multiple value={editFormData.context.mealTime} onChange={e => handleContextChange('mealTime', Array.from(e.target.selectedOptions, opt => opt.value))} className="modal-value" style={{ minHeight: 38 }}>
                                            <option value="breakfast">Bữa sáng</option>
                                            <option value="lunch">Bữa trưa</option>
                                            <option value="dinner">Bữa tối</option>
                                            <option value="snack">Bữa phụ</option>
                                        </select>
                                    </div>
                                    <div className="modal-info-row">
                                        <span className="modal-label">Mùa:</span>
                                        <select value={editFormData.context.season} onChange={e => handleContextChange('season', e.target.value)} className="modal-value">
                                            <option value="all">Tất cả</option>
                                            <option value="spring">Xuân</option>
                                            <option value="summer">Hạ</option>
                                            <option value="autumn">Thu</option>
                                            <option value="winter">Đông</option>
                                        </select>
                                    </div>
                                    <div className="modal-info-row">
                                        <span className="modal-label">Thời tiết:</span>
                                        <select multiple value={editFormData.context.weather} onChange={e => handleContextChange('weather', Array.from(e.target.selectedOptions, opt => opt.value))} className="modal-value" style={{ minHeight: 38 }}>
                                            <option value="all">Tất cả</option>
                                            <option value="hot">Nóng</option>
                                            <option value="cold">Lạnh</option>
                                            <option value="rainy">Mưa</option>
                                            <option value="dry">Khô</option>
                                        </select>
                                    </div>
                                    <div className="modal-info-row">
                                        <span className="modal-label" style={{ alignSelf: 'flex-start', minWidth: 90 }}>
                                            Thành phần:
                                        </span>
                                        <div style={{ width: '100%', maxHeight: 220, overflowY: 'auto', background: '#f8fafc', borderRadius: 8, padding: 8, border: '1px solid #e5e7eb' }}>
                                            {editFormData.ingredients && editFormData.ingredients.length > 0 ? (
                                                editFormData.ingredients.map((ing, idx) => (
                                                    (ing && typeof ing === 'object') ? (
                                                        <div key={idx} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center', borderBottom: idx !== editFormData.ingredients.length - 1 ? '1px solid #e5e7eb' : 'none', paddingBottom: 6 }}>
                                                            {idx === 0 ? null : <span style={{ width: 90 }}></span>}
                                                            <input type="text" placeholder="Tên" value={ing.name} onChange={e => handleIngredientChange(idx, 'name', e.target.value)} className="ingredient-input-name" required />
                                                            <input type="number" placeholder="SL" value={ing.quantity} onChange={e => handleIngredientChange(idx, 'quantity', e.target.value)} className="ingredient-input-quantity" required />
                                                            <input type="text" placeholder="Đơn vị" value={ing.unit} onChange={e => handleIngredientChange(idx, 'unit', e.target.value)} className="ingredient-input-unit" required />
                                                            <button type="button" onClick={() => handleRemoveIngredient(idx)} style={{ color: '#ef4444', fontWeight: 700, background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', marginLeft: 2 }} title="Xóa">×</button>
                                                        </div>
                                                    ) : null
                                                ))
                                            ) : (
                                                <div style={{ color: '#888', fontStyle: 'italic' }}>Chưa có thành phần nào.</div>
                                            )}
                                            <button type="button" onClick={handleAddIngredient} style={{ marginTop: 4, color: '#0ea5e9', background: 'none', border: '1px dashed #0ea5e9', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>+ Thêm thành phần</button>
                                        </div>
                                    </div>
                                    <div className="modal-info-row">
                                        <span className="modal-label">Hướng dẫn:</span>
                                        <div style={{ width: '100%' }}>
                                            {editFormData.instructions && editFormData.instructions.length > 0 ? (
                                                editFormData.instructions.map((step, idx) => (
                                                    <div key={idx} style={{ display: 'flex', gap: 6, marginBottom: 4, alignItems: 'center' }}>
                                                        <input type="text" value={step} onChange={e => handleInstructionChange(idx, e.target.value)} style={{ flex: 1, minWidth: 0, fontSize: 14, padding: '4px 6px', borderRadius: 5, border: '1px solid #d1d5db' }} required />
                                                        <button type="button" onClick={() => handleRemoveInstruction(idx)} style={{ color: '#ef4444', fontWeight: 700, background: 'none', border: 'none', fontSize: 16, cursor: 'pointer' }} title="Xóa">×</button>
                                                    </div>
                                                ))
                                            ) : <div style={{ color: '#888', fontStyle: 'italic' }}>Chưa có hướng dẫn nào.</div>}
                                            <button type="button" onClick={handleAddInstruction} style={{ marginTop: 2, color: '#0ea5e9', background: 'none', border: '1px dashed #0ea5e9', borderRadius: 6, padding: '2px 8px', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>+ Thêm bước</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-4 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setSelectedImageFile(null);
                                            setImagePreview('');
                                        }}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                        disabled={editLoading}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={editLoading}
                                        className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${editLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {editLoading ? 'Đang cập nhật...' : 'Cập nhật'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content food-detail-modal" onClick={e => e.stopPropagation()}>
                        <button className="close-modal-btn" onClick={() => setShowAddModal(false)} title="Đóng">&times;</button>
                        <h2 className="modal-title">Thêm món ăn mới</h2>
                        {addLoading ? (
                            <div className="modal-loading">Đang tải...</div>
                        ) : addError ? (
                            <div className="modal-error">{addError}</div>
                        ) : (
                            <form onSubmit={handleCreateFood}>
                                <div className="modal-info-grid">
                                    <div className="modal-info-row">
                                        <span className="modal-label">Tên món:</span>
                                        <input
                                            type="text"
                                            name="name"
                                            value={addFormData.name}
                                            onChange={handleAddChange}
                                            className="modal-value"
                                            required
                                        />
                                    </div>
                                    <div className="modal-info-row">
                                        <span className="modal-label">Calo:</span>
                                        <input
                                            type="number"
                                            name="calories"
                                            value={addFormData.calories}
                                            onChange={handleAddChange}
                                            className="modal-value"
                                            required
                                        />
                                    </div>
                                    <div className="modal-info-row">
                                        <span className="modal-label">Protein:</span>
                                        <input
                                            type="number"
                                            name="protein"
                                            value={addFormData.protein}
                                            onChange={handleAddChange}
                                            className="modal-value"
                                            required
                                        />
                                    </div>
                                    <div className="modal-info-row">
                                        <span className="modal-label">Carbs:</span>
                                        <input
                                            type="number"
                                            name="carbs"
                                            value={addFormData.carbs}
                                            onChange={handleAddChange}
                                            className="modal-value"
                                            required
                                        />
                                    </div>
                                    <div className="modal-info-row">
                                        <span className="modal-label">Fat:</span>
                                        <input
                                            type="number"
                                            name="fat"
                                            value={addFormData.fat}
                                            onChange={handleAddChange}
                                            className="modal-value"
                                            required
                                        />
                                    </div>
                                    <div className="modal-info-row">
                                        <span className="modal-label">Mô tả:</span>
                                        <textarea
                                            name="description"
                                            value={addFormData.description}
                                            onChange={handleAddChange}
                                            className="modal-value"
                                            required
                                        />
                                    </div>
                                    <div className="modal-info-row">
                                        <span className="modal-label">Trạng thái:</span>
                                        <select
                                            name="status"
                                            value={addFormData.status}
                                            onChange={handleAddChange}
                                            className="modal-value"
                                            required
                                        >
                                            <option value="approved">Đã duyệt</option>
                                            <option value="pending">Chờ duyệt</option>
                                            <option value="rejected">Từ chối</option>
                                        </select>
                                    </div>
                                    <div className="modal-info-row">
                                        <span className="modal-label">Hình ảnh:</span>
                                        <div style={{ width: '100%' }}>
                                            {/* File input for new image */}
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleAddImageChange}
                                                    className="modal-value"
                                                    style={{ flex: 1 }}
                                                />
                                                {addImageFile && (
                                                    <button
                                                        type="button"
                                                        onClick={clearAddImageSelection}
                                                        style={{
                                                            padding: '4px 8px',
                                                            backgroundColor: '#ef4444',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '12px'
                                                        }}
                                                    >
                                                        Xóa
                                                    </button>
                                                )}
                                            </div>
                                            {/* Image preview */}
                                            {addImagePreview && (
                                                <div style={{ marginTop: '8px' }}>
                                                    <img
                                                        src={addImagePreview}
                                                        alt="Preview"
                                                        style={{
                                                            maxWidth: '200px',
                                                            maxHeight: '150px',
                                                            borderRadius: '8px',
                                                            border: '1px solid #e5e7eb'
                                                        }}
                                                    />
                                                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                                                        {addImageFile ? 'Ảnh mới sẽ được upload' : 'Ảnh hiện tại'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="modal-info-row">
                                        <span className="modal-label">Sở thích:</span>
                                        <div style={{ width: '100%' }}>
                                            {addFormData.preferences && addFormData.preferences.length > 0 ? (
                                                addFormData.preferences.map((tag, idx) => (
                                                    <div key={idx} style={{ display: 'flex', gap: 6, marginBottom: 4, alignItems: 'center' }}>
                                                        <input type="text" value={tag} onChange={e => handleAddTagChange('preferences', idx, e.target.value)} style={{ flex: 1, minWidth: 0, fontSize: 14, padding: '4px 6px', borderRadius: 5, border: '1px solid #d1d5db' }} required />
                                                        <button type="button" onClick={() => handleRemoveAddTag('preferences', idx)} style={{ color: '#ef4444', fontWeight: 700, background: 'none', border: 'none', fontSize: 16, cursor: 'pointer' }} title="Xóa">×</button>
                                                    </div>
                                                ))
                                            ) : <div style={{ color: '#888', fontStyle: 'italic' }}>Chưa có tag nào.</div>}
                                            <button type="button" onClick={() => handleAddNewTag('preferences')} style={{ marginTop: 2, color: '#0ea5e9', background: 'none', border: '1px dashed #0ea5e9', borderRadius: 6, padding: '2px 8px', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>+ Thêm tag</button>
                                        </div>
                                    </div>
                                    <div className="modal-info-row">
                                        <span className="modal-label">Hạn chế:</span>
                                        <div style={{ width: '100%' }}>
                                            {addFormData.restrictions && addFormData.restrictions.length > 0 ? (
                                                addFormData.restrictions.map((tag, idx) => (
                                                    <div key={idx} style={{ display: 'flex', gap: 6, marginBottom: 4, alignItems: 'center' }}>
                                                        <input type="text" value={tag} onChange={e => handleAddTagChange('restrictions', idx, e.target.value)} style={{ flex: 1, minWidth: 0, fontSize: 14, padding: '4px 6px', borderRadius: 5, border: '1px solid #d1d5db' }} required />
                                                        <button type="button" onClick={() => handleRemoveAddTag('restrictions', idx)} style={{ color: '#ef4444', fontWeight: 700, background: 'none', border: 'none', fontSize: 16, cursor: 'pointer' }} title="Xóa">×</button>
                                                    </div>
                                                ))
                                            ) : <div style={{ color: '#888', fontStyle: 'italic' }}>Chưa có tag nào.</div>}
                                            <button type="button" onClick={() => handleAddNewTag('restrictions')} style={{ marginTop: 2, color: '#0ea5e9', background: 'none', border: '1px dashed #0ea5e9', borderRadius: 6, padding: '2px 8px', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>+ Thêm tag</button>
                                        </div>
                                    </div>
                                    <div className="modal-info-row">
                                        <span className="modal-label">Bữa ăn:</span>
                                        <select multiple value={addFormData.context.mealTime} onChange={e => handleAddContextChange('mealTime', Array.from(e.target.selectedOptions, opt => opt.value))} className="modal-value" style={{ minHeight: 38 }}>
                                            <option value="breakfast">Bữa sáng</option>
                                            <option value="lunch">Bữa trưa</option>
                                            <option value="dinner">Bữa tối</option>
                                            <option value="snack">Bữa phụ</option>
                                        </select>
                                    </div>
                                    <div className="modal-info-row">
                                        <span className="modal-label">Mùa:</span>
                                        <select value={addFormData.context.season} onChange={e => handleAddContextChange('season', e.target.value)} className="modal-value">
                                            <option value="all">Tất cả</option>
                                            <option value="spring">Xuân</option>
                                            <option value="summer">Hạ</option>
                                            <option value="autumn">Thu</option>
                                            <option value="winter">Đông</option>
                                        </select>
                                    </div>
                                    <div className="modal-info-row">
                                        <span className="modal-label">Thời tiết:</span>
                                        <select multiple value={addFormData.context.weather} onChange={e => handleAddContextChange('weather', Array.from(e.target.selectedOptions, opt => opt.value))} className="modal-value" style={{ minHeight: 38 }}>
                                            <option value="all">Tất cả</option>
                                            <option value="hot">Nóng</option>
                                            <option value="cold">Lạnh</option>
                                            <option value="rainy">Mưa</option>
                                            <option value="dry">Khô</option>
                                        </select>
                                    </div>
                                    <div className="modal-info-row">
                                        <span className="modal-label" style={{ alignSelf: 'flex-start', minWidth: 90 }}>
                                            Thành phần:
                                        </span>
                                        <div style={{ width: '100%', maxHeight: 220, overflowY: 'auto', background: '#f8fafc', borderRadius: 8, padding: 8, border: '1px solid #e5e7eb' }}>
                                            {addFormData.ingredients && addFormData.ingredients.length > 0 ? (
                                                addFormData.ingredients.map((ing, idx) => (
                                                    (ing && typeof ing === 'object') ? (
                                                        <div key={idx} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center', borderBottom: idx !== addFormData.ingredients.length - 1 ? '1px solid #e5e7eb' : 'none', paddingBottom: 6 }}>
                                                            {idx === 0 ? null : <span style={{ width: 90 }}></span>}
                                                            <input type="text" placeholder="Tên" value={ing.name} onChange={e => handleAddIngredientChange(idx, 'name', e.target.value)} className="ingredient-input-name" required />
                                                            <input type="number" placeholder="SL" value={ing.quantity} onChange={e => handleAddIngredientChange(idx, 'quantity', e.target.value)} className="ingredient-input-quantity" required />
                                                            <input type="text" placeholder="Đơn vị" value={ing.unit} onChange={e => handleAddIngredientChange(idx, 'unit', e.target.value)} className="ingredient-input-unit" required />
                                                            <button type="button" onClick={() => handleRemoveAddIngredient(idx)} style={{ color: '#ef4444', fontWeight: 700, background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', marginLeft: 2 }} title="Xóa">×</button>
                                                        </div>
                                                    ) : null
                                                ))
                                            ) : (
                                                <div style={{ color: '#888', fontStyle: 'italic' }}>Chưa có thành phần nào.</div>
                                            )}
                                            <button type="button" onClick={handleAddNewIngredient} style={{ marginTop: 4, color: '#0ea5e9', background: 'none', border: '1px dashed #0ea5e9', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>+ Thêm thành phần</button>
                                        </div>
                                    </div>
                                    <div className="modal-info-row">
                                        <span className="modal-label">Hướng dẫn:</span>
                                        <div style={{ width: '100%' }}>
                                            {addFormData.instructions && addFormData.instructions.length > 0 ? (
                                                addFormData.instructions.map((step, idx) => (
                                                    <div key={idx} style={{ display: 'flex', gap: 6, marginBottom: 4, alignItems: 'center' }}>
                                                        <input type="text" value={step} onChange={e => handleAddInstructionChange(idx, e.target.value)} style={{ flex: 1, minWidth: 0, fontSize: 14, padding: '4px 6px', borderRadius: 5, border: '1px solid #d1d5db' }} required />
                                                        <button type="button" onClick={() => handleRemoveAddInstruction(idx)} style={{ color: '#ef4444', fontWeight: 700, background: 'none', border: 'none', fontSize: 16, cursor: 'pointer' }} title="Xóa">×</button>
                                                    </div>
                                                ))
                                            ) : <div style={{ color: '#888', fontStyle: 'italic' }}>Chưa có hướng dẫn nào.</div>}
                                            <button type="button" onClick={handleAddNewInstruction} style={{ marginTop: 2, color: '#0ea5e9', background: 'none', border: '1px dashed #0ea5e9', borderRadius: 6, padding: '2px 8px', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>+ Thêm bước</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-4 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddModal(false);
                                            setAddImageFile(null);
                                            setAddImagePreview('');
                                        }}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                        disabled={addLoading}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={addLoading}
                                        className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${addLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {addLoading ? 'Đang tạo...' : 'Tạo món ăn'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Foods; 