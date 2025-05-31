import React, { useState } from 'react';
import './ShoppingSection.css';

const ShoppingSection = ({ user }) => {
    const [items, setItems] = useState([
        { id: 1, name: 'Ức gà', quantity: '500g', category: 'Protein', checked: false },
        { id: 2, name: 'Gạo lứt', quantity: '1kg', category: 'Carbs', checked: false },
        { id: 3, name: 'Dầu olive', quantity: '500ml', category: 'Fat', checked: false },
        { id: 4, name: 'Rau cải', quantity: '300g', category: 'Rau củ', checked: false },
    ]);

    const [newItem, setNewItem] = useState({ name: '', quantity: '', category: 'Khác' });
    const [showAddForm, setShowAddForm] = useState(false);

    const categories = ['Protein', 'Carbs', 'Fat', 'Rau củ', 'Trái cây', 'Gia vị', 'Khác'];

    const handleAddItem = (e) => {
        e.preventDefault();
        if (!newItem.name.trim()) return;

        const item = {
            id: Date.now(),
            ...newItem,
            checked: false
        };

        setItems(prev => [...prev, item]);
        setNewItem({ name: '', quantity: '', category: 'Khác' });
        setShowAddForm(false);
    };

    const handleToggleItem = (id) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, checked: !item.checked } : item
        ));
    };

    const handleDeleteItem = (id) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const handleDeleteChecked = () => {
        setItems(prev => prev.filter(item => !item.checked));
    };

    const renderAddForm = () => {
        if (!showAddForm) return null;

        return (
            <form className="add-item-form" onSubmit={handleAddItem}>
                <input
                    type="text"
                    placeholder="Tên thực phẩm"
                    value={newItem.name}
                    onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                />
                <input
                    type="text"
                    placeholder="Số lượng"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem(prev => ({ ...prev, quantity: e.target.value }))}
                />
                <select
                    value={newItem.category}
                    onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                >
                    {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                    ))}
                </select>
                <div className="form-actions">
                    <button type="submit" className="btn-primary">Thêm</button>
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setShowAddForm(false)}
                    >
                        Hủy
                    </button>
                </div>
            </form>
        );
    };

    const groupedItems = items.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
    }, {});

    return (
        <div className="shopping-section">
            <div className="section-header">
                <h2>Danh sách mua sắm</h2>
                <div className="shopping-actions">
                    <button
                        className="btn-primary"
                        onClick={() => setShowAddForm(true)}
                    >
                        <i className="fas fa-plus"></i> Thêm món
                    </button>
                    <button
                        className="btn-secondary"
                        onClick={handleDeleteChecked}
                        disabled={!items.some(item => item.checked)}
                    >
                        <i className="fas fa-trash"></i> Xóa đã chọn
                    </button>
                </div>
            </div>

            {renderAddForm()}

            <div className="shopping-list">
                {Object.entries(groupedItems).map(([category, categoryItems]) => (
                    <div key={category} className="category-group">
                        <h3>{category}</h3>
                        <div className="items-list">
                            {categoryItems.map(item => (
                                <div
                                    key={item.id}
                                    className={`shopping-item ${item.checked ? 'checked' : ''}`}
                                >
                                    <label className="item-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={item.checked}
                                            onChange={() => handleToggleItem(item.id)}
                                        />
                                        <span className="checkmark"></span>
                                    </label>
                                    <div className="item-details">
                                        <span className="item-name">{item.name}</span>
                                        <span className="item-quantity">{item.quantity}</span>
                                    </div>
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDeleteItem(item.id)}
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ShoppingSection; 